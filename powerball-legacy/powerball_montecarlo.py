"""
Monte-Carlo run of the ticket generator: 1,000,000 weighted draws under the
exact same .ini constraints, weights, and pool selection used by
powerball_tickets.py - executed in parallel batches of 50.

Reports the top 5 most-frequent 5-white-ball combinations across all draws.

NOTE: As always, each Powerball draw is mechanically independent. The most-
frequent combo from a Monte-Carlo over a frequency-weighted pool is just
the combo of the 5 hottest balls (subject to constraints) - this script
measures how strongly the constraints + weights shape that outcome, not a
prediction.
"""

from __future__ import annotations

import multiprocessing as mp
import random
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path

# Reuse pool + constraint logic from the ticket generator.
sys.path.insert(0, str(Path(__file__).parent))
from powerball_tickets import (
    load_config, run_analyzer, parse_full_table, build_pool,
    weighted_sample_no_replace, passes_hard, soft_accept_prob,
    SCRIPT_DIR, CONFIG_FILE,
)

TOTAL_DRAWS = 100_000_000
BATCH_SIZE = 50
TOP_K = 5


def worker_batch(args):
    """Generate BATCH_SIZE constraint-satisfying tickets. Returns:
       (Counter of whites-tuple -> count,
        Counter of (whites-tuple, red) -> count)"""
    seed, wn, ww, rn, rw, cfg = args
    rng = random.Random(seed)

    whites_counter: Counter = Counter()
    full_counter: Counter = Counter()
    per_ticket_attempts_cap = 10_000

    for _ in range(BATCH_SIZE):
        for _try in range(per_ticket_attempts_cap):
            whites = tuple(sorted(weighted_sample_no_replace(wn, ww, 5, rng)))
            if not passes_hard(whites, cfg):
                continue
            if rng.random() > soft_accept_prob(whites, cfg):
                continue
            break
        else:
            # Constraints too tight - bail out for this slot.
            continue
        red = weighted_sample_no_replace(rn, rw, 1, rng)[0]
        whites_counter[whites] += 1
        full_counter[(whites, red)] += 1

    return whites_counter, full_counter


def main() -> int:
    print(f"Loading config: {CONFIG_FILE.name}")
    cfg = load_config(CONFIG_FILE)

    print("Fetching frequencies (one-time analyzer run)...")
    text = run_analyzer()
    all_whites, all_reds = parse_full_table(text)

    whites_pool = build_pool(all_whites, cfg["white_min_freq"],
                             cfg["white_top_n"], cfg["white_excl_top"])
    reds_pool = build_pool(all_reds, cfg["red_min_freq"],
                           cfg["red_top_n"], cfg["red_excl_top"])

    print(f"WHITE pool: {len(whites_pool)} balls "
          f"(exclude_top={cfg['white_excl_top']}%, "
          f">{cfg['white_min_freq']}%, "
          f"top_n={cfg['white_top_n'] or 'no cap'})")
    print(f"RED pool:   {len(reds_pool)} balls "
          f"(exclude_top={cfg['red_excl_top']}%, "
          f">{cfg['red_min_freq']}%, "
          f"top_n={cfg['red_top_n'] or 'no cap'})")
    print(f"Constraints: sum {cfg['sum_min']}-{cfg['sum_max']} | "
          f"odd-count {sorted(cfg['allowed_odd'])} | "
          f"low-count {sorted(cfg['allowed_low'])} (low<={cfg['low_cutoff']}) | "
          f"consec<={cfg['max_consec']} | "
          f"decades {cfg['min_decades']}-{cfg['max_decades']}")
    print(f"Soft: P(accept 1-consec)={cfg['w_1_consec']}")

    if len(whites_pool) < 5:
        print("ERROR: white pool has fewer than 5 balls.", file=sys.stderr)
        return 1
    decades_in_pool = {(n - 1) // 10 for n, _ in whites_pool}
    if len(decades_in_pool) < cfg["min_decades"]:
        print(f"ERROR: white pool spans only {len(decades_in_pool)} decade(s), "
              f"but min_decade_span = {cfg['min_decades']}.", file=sys.stderr)
        return 1

    wn = [w[0] for w in whites_pool]
    ww = [w[1] for w in whites_pool]
    rn = [r[0] for r in reds_pool]
    rw = [r[1] for r in reds_pool]

    num_batches = TOTAL_DRAWS // BATCH_SIZE
    base_seed = int(datetime.now().timestamp() * 1e6) % (2 ** 32)
    args_list = [(base_seed + i, wn, ww, rn, rw, cfg) for i in range(num_batches)]

    workers = mp.cpu_count()
    print(f"\nTarget: {TOTAL_DRAWS:,} draws in {num_batches:,} batches of "
          f"{BATCH_SIZE}, across {workers} worker processes...")

    whites_total: Counter = Counter()
    full_total: Counter = Counter()

    start = datetime.now()
    completed = 0
    report_every = max(1, num_batches // 20)  # ~20 progress lines total

    with mp.Pool(processes=workers) as pool:
        for wc, fc in pool.imap_unordered(worker_batch, args_list, chunksize=100):
            whites_total.update(wc)
            full_total.update(fc)
            completed += 1
            if completed % report_every == 0 or completed == num_batches:
                done = completed * BATCH_SIZE
                pct = 100 * completed / num_batches
                elapsed = (datetime.now() - start).total_seconds()
                rate = done / elapsed if elapsed > 0 else 0
                print(f"  {done:>9,} / {TOTAL_DRAWS:,}  ({pct:5.1f}%)  "
                      f"{elapsed:6.1f}s  ({rate:,.0f} draws/sec)")

    elapsed = (datetime.now() - start).total_seconds()
    total_drawn = sum(whites_total.values())
    unique_white_combos = len(whites_total)

    # ---- Build report (also saved to dated file) ----
    lines: list[str] = []
    def out(s: str = "") -> None:
        print(s)
        lines.append(s)

    out("")
    out("=" * 76)
    out(f"TOP {TOP_K} MOST-FREQUENT 5-WHITE-BALL COMBOS")
    out("=" * 76)
    out(f"Total draws:        {total_drawn:,}")
    out(f"Unique white combos: {unique_white_combos:,} "
        f"(of C({len(whites_pool)},5) = "
        f"{_choose(len(whites_pool), 5):,} possible from the pool)")
    out(f"Wall time:          {elapsed:.1f}s "
        f"({total_drawn / elapsed:,.0f} draws/sec)")
    out("")
    out(f"Config: pool {len(whites_pool)}W x {len(reds_pool)}R | "
        f"sum {cfg['sum_min']}-{cfg['sum_max']} | "
        f"odd {sorted(cfg['allowed_odd'])} | "
        f"low {sorted(cfg['allowed_low'])} | "
        f"consec<={cfg['max_consec']} | "
        f"decades {cfg['min_decades']}-{cfg['max_decades']}")
    out("")

    for rank, (combo, count) in enumerate(whites_total.most_common(TOP_K), 1):
        pct = 100 * count / total_drawn
        # Most-common PB partner for this combo.
        best_red, best_red_count = None, 0
        for (w, r), c in full_total.items():
            if w == combo and c > best_red_count:
                best_red, best_red_count = r, c
        red_share = 100 * best_red_count / count if count else 0
        out(f"  #{rank}  {'-'.join(f'{n:02d}' for n in combo)}"
            f"  -  drawn x {count:,} ({pct:.4f}%)"
            f"  -  top PB partner: {best_red:02d} (x {best_red_count}, "
            f"{red_share:.2f}% of this combo's draws)")

    # ---- Save to dated file ----
    output_path = SCRIPT_DIR / f"top {TOP_K} combos-{date.today():%Y-%m-%d}.txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\nSaved to: {output_path}")
    return 0


def _choose(n: int, k: int) -> int:
    if k < 0 or k > n:
        return 0
    from math import comb
    return comb(n, k)


if __name__ == "__main__":
    sys.exit(main())
