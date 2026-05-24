"""
Powerball historical analysis.

Pulls every drawing since 2010-02-03 (when the modern 5/69 + 1/26 matrix
era began, via several format changes) from NY State's public open-data
API and runs frequency / pattern analysis.

Source: https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr

DISCLAIMER: Powerball draws are independent random events. Historical
frequencies have no predictive power for future draws. This script is
for descriptive statistics and curiosity, not for picking "winning"
numbers.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from collections import Counter
from datetime import datetime
from itertools import combinations

DATA_URL = "https://data.ny.gov/resource/d6yy-54nr.json?$limit=50000"

# Current Powerball matrix (since Oct 2015): 5 whites from 1-69, 1 red from 1-26.
# Earlier eras used different ranges; we note the era per draw and analyze
# both "all-time" and "current-matrix-only" views.
ERAS = [
    # (start_date, white_max, red_max, label)
    ("2009-01-07", 59, 39, "2009-2012 (5/59 + 1/39)"),
    ("2012-01-15", 59, 35, "2012-2015 (5/59 + 1/35)"),
    ("2015-10-07", 69, 26, "2015-present (5/69 + 1/26)"),
]


def era_for(draw_date: str) -> str:
    d = draw_date[:10]
    label = ERAS[0][3]
    for start, _, _, lbl in ERAS:
        if d >= start:
            label = lbl
    return label


def fetch_draws() -> list[dict]:
    print(f"Fetching draws from {DATA_URL} ...")
    req = urllib.request.Request(DATA_URL, headers={"User-Agent": "powerball-analysis/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = json.loads(resp.read().decode("utf-8"))

    draws = []
    for row in raw:
        nums = row.get("winning_numbers", "").split()
        if len(nums) != 6:
            continue
        try:
            whites = sorted(int(n) for n in nums[:5])
            red = int(nums[5])
        except ValueError:
            continue
        draws.append({
            "date": row["draw_date"][:10],
            "whites": whites,
            "red": red,
            "era": era_for(row["draw_date"]),
        })
    draws.sort(key=lambda d: d["date"])
    return draws


def section(title: str) -> None:
    print("\n" + "=" * 72)
    print(title)
    print("=" * 72)


def show_top(counter: Counter, n: int, label_fmt=str, denom: int | None = None) -> None:
    """Print top-n entries. If denom is given, % = count/denom (draw-appearance
    rate). If omitted, falls back to share-of-counter (legacy behavior)."""
    total = denom if denom is not None else sum(counter.values())
    width = max(len(label_fmt(k)) for k, _ in counter.most_common(n))
    for k, v in counter.most_common(n):
        pct = 100 * v / total if total else 0
        print(f"  {label_fmt(k):<{width}}  {v:>5}  ({pct:5.2f}%)")


def analyze(draws: list[dict], label: str, white_max: int, red_max: int) -> None:
    N = len(draws)
    section(f"{label}  -  {N} draws "
            f"({draws[0]['date']} -> {draws[-1]['date']})")
    print(f"\n(All percentages below are 'share of draws this appeared in', "
          f"denominator = {N}.)")
    print(f"Uniform-random baselines: white ball = 5/{white_max} = "
          f"{100*5/white_max:.3f}%, "
          f"powerball = 1/{red_max} = {100/red_max:.3f}%.")

    white_freq = Counter()
    red_freq = Counter()
    pair_freq = Counter()
    triple_freq = Counter()
    full_combo_freq = Counter()

    sum_dist = Counter()
    odd_count_dist = Counter()
    low_count_dist = Counter()  # "low" = <= white_max // 2
    consecutive_dist = Counter()
    decade_spread = Counter()   # how many distinct 10-buckets the whites span

    last_seen_white: dict[int, str] = {}
    last_seen_red: dict[int, str] = {}

    half = white_max // 2

    for d in draws:
        whites, red = d["whites"], d["red"]
        white_freq.update(whites)
        red_freq[red] += 1
        full_combo_freq[tuple(whites) + (red,)] += 1

        for pair in combinations(whites, 2):
            pair_freq[pair] += 1
        for trip in combinations(whites, 3):
            triple_freq[trip] += 1

        sum_dist[sum(whites)] += 1
        odd_count_dist[sum(1 for n in whites if n % 2)] += 1
        low_count_dist[sum(1 for n in whites if n <= half)] += 1

        cons = sum(1 for a, b in zip(whites, whites[1:]) if b - a == 1)
        consecutive_dist[cons] += 1

        decade_spread[len({(n - 1) // 10 for n in whites})] += 1

        for n in whites:
            last_seen_white[n] = d["date"]
        last_seen_red[red] = d["date"]

    # ---- individual numbers ----
    print("\nTop 15 WHITE balls (most frequent):")
    show_top(white_freq, 15, lambda k: f"#{k:02d}", denom=N)

    print("\nBottom 10 WHITE balls (least frequent):")
    coldest = sorted(white_freq.items(), key=lambda kv: (kv[1], kv[0]))[:10]
    for k, v in coldest:
        print(f"  #{k:02d}  {v:>5}")

    print("\nTop 10 POWERBALLS (red, most frequent):")
    show_top(red_freq, 10, lambda k: f"PB {k:02d}", denom=N)

    # ---- combos ----
    print("\nTop 10 PAIRS of white balls drawn together (% = share of draws):")
    show_top(pair_freq, 10, lambda k: f"{k[0]:02d}-{k[1]:02d}", denom=N)

    print("\nTop 10 TRIPLES of white balls drawn together (% = share of draws):")
    show_top(triple_freq, 10, lambda k: "-".join(f"{n:02d}" for n in k), denom=N)

    repeated_full = [(c, n) for c, n in full_combo_freq.items() if n > 1]
    if repeated_full:
        print(f"\nFull 6-number combinations that EVER repeated: {len(repeated_full)}")
        for combo, n in sorted(repeated_full, key=lambda x: -x[1])[:10]:
            whites = "-".join(f"{x:02d}" for x in combo[:5])
            print(f"  {whites}  PB {combo[5]:02d}   x{n}")
    else:
        print("\nNo full 6-number combination has ever repeated.")

    # ---- structural patterns ----
    print("\nSUM of the 5 white balls (top buckets of 25):")
    bucket = Counter()
    for s, c in sum_dist.items():
        bucket[(s // 25) * 25] += c
    for b in sorted(bucket):
        bar = "#" * int(50 * bucket[b] / max(bucket.values()))
        print(f"  {b:3d}-{b+24:3d}  {bucket[b]:>4}  {bar}")

    print("\nODD-count among the 5 white balls:")
    for k in sorted(odd_count_dist):
        print(f"  {k} odd / {5-k} even   {odd_count_dist[k]:>5}  "
              f"({100*odd_count_dist[k]/len(draws):5.2f}%)")

    print(f"\nLOW (1..{half}) count among the 5 white balls:")
    for k in sorted(low_count_dist):
        print(f"  {k} low / {5-k} high   {low_count_dist[k]:>5}  "
              f"({100*low_count_dist[k]/len(draws):5.2f}%)")

    print("\nConsecutive-pair count (how often back-to-back numbers appear):")
    for k in sorted(consecutive_dist):
        print(f"  {k} consecutive pair(s)  {consecutive_dist[k]:>5}  "
              f"({100*consecutive_dist[k]/len(draws):5.2f}%)")

    print("\nNumber of distinct 'decades' (1-10, 11-20, ...) the 5 whites span:")
    for k in sorted(decade_spread):
        print(f"  spans {k} decade(s)  {decade_spread[k]:>5}  "
              f"({100*decade_spread[k]/len(draws):5.2f}%)")

    # ---- hot-weighted suggestion ----
    section(f"FREQUENCY-WEIGHTED SUGGESTED PLAY ({label})")
    print("(Picking the 5 hottest whites + hottest powerball. This is NOT a")
    print(" prediction - past frequencies do not predict future random draws.)")
    hot_whites = sorted(n for n, _ in white_freq.most_common(5))
    hot_red = red_freq.most_common(1)[0][0]
    print(f"  Hot pick : {'-'.join(f'{n:02d}' for n in hot_whites)}   PB {hot_red:02d}")

    cold_whites = sorted(n for n, _ in sorted(
        white_freq.items(), key=lambda kv: (kv[1], kv[0]))[:5])
    cold_red = min(red_freq.items(), key=lambda kv: (kv[1], kv[0]))[0]
    print(f"  Cold pick: {'-'.join(f'{n:02d}' for n in cold_whites)}   PB {cold_red:02d}")

    # most-overdue (longest since last seen)
    today = draws[-1]["date"]
    overdue_white = sorted(
        ((n, last_seen_white.get(n, "never")) for n in range(1, white_max + 1)),
        key=lambda kv: kv[1])[:5]
    overdue_red = sorted(
        ((n, last_seen_red.get(n, "never")) for n in range(1, red_max + 1)),
        key=lambda kv: kv[1])[0]
    print(f"  Overdue  : {'-'.join(f'{n:02d}' for n,_ in sorted(overdue_white))}   "
          f"PB {overdue_red[0]:02d}")
    print(f"  (whites last seen: " +
          ", ".join(f"{n:02d}@{d}" for n, d in overdue_white) +
          f"; red {overdue_red[0]:02d} last seen {overdue_red[1]})")

    # ---- machine-readable full frequency table ----
    # Consumed by powerball_tickets.py. Format per line: "WHITE n count pct"
    # or "RED n count pct", where pct is draw-appearance rate (count / N * 100).
    print("\n--- FULL FREQUENCY TABLE (machine-readable) ---")
    for n in range(1, white_max + 1):
        c = white_freq.get(n, 0)
        pct = 100 * c / N if N else 0
        print(f"WHITE {n} {c} {pct:.4f}")
    for n in range(1, red_max + 1):
        c = red_freq.get(n, 0)
        pct = 100 * c / N if N else 0
        print(f"RED {n} {c} {pct:.4f}")
    print("--- END FULL FREQUENCY TABLE ---")


def main() -> int:
    try:
        all_draws = fetch_draws()
    except Exception as e:
        print(f"Failed to fetch data: {e}", file=sys.stderr)
        return 1

    if not all_draws:
        print("No draws parsed.", file=sys.stderr)
        return 1

    # All-time view (mixed matrices - use with caution)
    analyze(all_draws, "ALL-TIME (mixed matrices)",
            white_max=69, red_max=39)

    # Current-matrix-only view: this is the meaningful one
    current = [d for d in all_draws if d["date"] >= "2015-10-07"]
    if current:
        analyze(current, "CURRENT MATRIX ONLY (5/69 + 1/26, since 2015-10-07)",
                white_max=69, red_max=26)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
