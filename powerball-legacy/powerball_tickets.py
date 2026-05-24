"""
Generate Powerball ticket suggestions driven by powerball_tickets.ini.

Workflow:
  1. Load human-editable config from powerball_tickets.ini.
  2. Invoke powerball_analysis.py, capture its FULL FREQUENCY TABLE for the
     current matrix (every white 1-69 and every powerball 1-26).
  3. Build candidate pools per the config's min-frequency and/or top-N rules.
  4. Sample 5 whites + 1 red, weighted by their historical draw-appearance
     rate. Reject samples that violate hard constraints. Apply soft
     preferences via per-trait acceptance probability.

DISCLAIMER: Powerball draws are independent random events. Frequency-weighted
ticket generation is for entertainment only.
"""

from __future__ import annotations

import configparser
import random
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ANALYSIS_SCRIPT = SCRIPT_DIR / "powerball_analysis.py"
CONFIG_FILE = SCRIPT_DIR / "powerball_tickets.ini"


# ---------- config loading ----------

def _csv_ints(s: str) -> set[int]:
    return {int(x.strip()) for x in s.split(",") if x.strip()}


def load_config(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    cp = configparser.ConfigParser(inline_comment_prefixes=("#", ";"))
    cp.read(path)
    return {
        "white_min_freq":   cp.getfloat("pool", "white_ball_min_frequency_pct"),
        "white_top_n":      cp.getint  ("pool", "white_ball_top_n"),
        "white_excl_top":   cp.getfloat("pool", "white_ball_exclude_top_percent",
                                       fallback=0.0),
        "red_min_freq":     cp.getfloat("pool", "red_ball_min_frequency_pct"),
        "red_top_n":        cp.getint  ("pool", "red_ball_top_n"),
        "red_excl_top":     cp.getfloat("pool", "red_ball_exclude_top_percent",
                                       fallback=0.0),
        "sum_min":          cp.getint  ("constraints", "sum_min"),
        "sum_max":          cp.getint  ("constraints", "sum_max"),
        "allowed_odd":      _csv_ints(cp.get("constraints", "allowed_odd_counts")),
        "allowed_low":      _csv_ints(cp.get("constraints", "allowed_low_counts")),
        "low_cutoff":       cp.getint  ("constraints", "low_cutoff"),
        "max_consec":       cp.getint  ("constraints", "max_consecutive_pairs"),
        "min_decades":      cp.getint  ("constraints", "min_decade_span"),
        "max_decades":      cp.getint  ("constraints", "max_decade_span"),
        "w_1_consec":       cp.getfloat("preferences", "weight_one_consecutive_pair"),
        "num_tickets":      cp.getint  ("output", "num_tickets"),
        "save_to_file":     cp.getboolean("output", "save_to_file", fallback=True),
    }


# ---------- analyzer invocation + parsing ----------

def run_analyzer() -> str:
    print(f"Running {ANALYSIS_SCRIPT.name} for fresh frequency data...")
    return subprocess.run(
        [sys.executable, str(ANALYSIS_SCRIPT)],
        capture_output=True, text=True, check=True,
    ).stdout


def parse_full_table(text: str) -> tuple[list[tuple[int, float]], list[tuple[int, float]]]:
    """Pull the FULL FREQUENCY TABLE inside the CURRENT MATRIX ONLY section."""
    cm = text.find("CURRENT MATRIX ONLY")
    if cm == -1:
        raise RuntimeError("'CURRENT MATRIX ONLY' section not found in analyzer output.")
    section = text[cm:]
    start = section.find("--- FULL FREQUENCY TABLE (machine-readable) ---")
    end   = section.find("--- END FULL FREQUENCY TABLE ---")
    if start == -1 or end == -1:
        raise RuntimeError(
            "FULL FREQUENCY TABLE block not found. "
            "Update powerball_analysis.py to emit it."
        )
    block = section[start:end]
    whites: list[tuple[int, float]] = []
    reds: list[tuple[int, float]] = []
    for line in block.splitlines():
        m = re.match(r"(WHITE|RED)\s+(\d+)\s+\d+\s+([\d.]+)", line)
        if not m:
            continue
        kind, num, pct = m.group(1), int(m.group(2)), float(m.group(3))
        (whites if kind == "WHITE" else reds).append((num, pct))
    if not whites or not reds:
        raise RuntimeError("Parsed full table is empty.")
    return whites, reds


# ---------- pool construction ----------

def build_pool(all_balls: list[tuple[int, float]],
               min_freq_pct: float, top_n: int,
               exclude_top_percent: float) -> list[tuple[int, float]]:
    """Build the candidate pool, applying filters in this order:
       1. Drop the hottest exclude_top_percent% of the *full* ranked list.
       2. Keep balls with frequency > min_freq_pct.
       3. Cap to the top_n most-frequent of what remains (0 = no cap).
    """
    ranked = sorted(all_balls, key=lambda kv: -kv[1])
    if exclude_top_percent > 0:
        drop = int(len(ranked) * exclude_top_percent / 100)
        ranked = ranked[drop:]
    pool = [(n, p) for n, p in ranked if p > min_freq_pct]
    pool.sort(key=lambda kv: -kv[1])
    if top_n > 0:
        pool = pool[:top_n]
    return pool


# ---------- dual stdout (terminal + file) ----------

class Tee:
    """Write to multiple text streams simultaneously."""
    def __init__(self, *streams):
        self.streams = streams
    def write(self, s):
        for st in self.streams:
            st.write(s)
    def flush(self):
        for st in self.streams:
            st.flush()


# ---------- ticket generation ----------

def weighted_sample_no_replace(items: list[int], weights: list[float],
                               k: int, rng: random.Random) -> list[int]:
    """Efraimidis-Spirakis weighted sampling without replacement."""
    keys = [(rng.random() ** (1.0 / max(w, 1e-9)), x) for x, w in zip(items, weights)]
    keys.sort(reverse=True)
    return [x for _, x in keys[:k]]


def features(whites: tuple[int, ...], cfg: dict) -> tuple[int, int, int, int, int]:
    s = sum(whites)
    odd = sum(1 for n in whites if n % 2)
    low = sum(1 for n in whites if n <= cfg["low_cutoff"])
    cons = sum(1 for a, b in zip(whites, whites[1:]) if b - a == 1)
    decades = len({(n - 1) // 10 for n in whites})
    return s, odd, low, cons, decades


def passes_hard(whites: tuple[int, ...], cfg: dict) -> bool:
    s, odd, low, cons, decades = features(whites, cfg)
    return (cfg["sum_min"] <= s <= cfg["sum_max"]
            and odd in cfg["allowed_odd"]
            and low in cfg["allowed_low"]
            and cons <= cfg["max_consec"]
            and cfg["min_decades"] <= decades <= cfg["max_decades"])


def soft_accept_prob(whites: tuple[int, ...], cfg: dict) -> float:
    _, _, _, cons, _ = features(whites, cfg)
    p = 1.0
    if cons == 1:
        p *= cfg["w_1_consec"]
    return p


def generate(whites_pool: list[tuple[int, float]],
             reds_pool:   list[tuple[int, float]],
             cfg: dict, rng: random.Random
             ) -> tuple[list[tuple[tuple[int, ...], int]], int]:
    wn = [w[0] for w in whites_pool]; ww = [w[1] for w in whites_pool]
    rn = [r[0] for r in reds_pool];   rw = [r[1] for r in reds_pool]

    tickets: list[tuple[tuple[int, ...], int]] = []
    seen: set[tuple[tuple[int, ...], int]] = set()
    attempts, max_attempts = 0, 500_000

    while len(tickets) < cfg["num_tickets"] and attempts < max_attempts:
        attempts += 1
        whites = tuple(sorted(weighted_sample_no_replace(wn, ww, 5, rng)))
        if not passes_hard(whites, cfg):
            continue
        if rng.random() > soft_accept_prob(whites, cfg):
            continue
        red = weighted_sample_no_replace(rn, rw, 1, rng)[0]
        ticket = (whites, red)
        if ticket in seen:
            continue
        seen.add(ticket)
        tickets.append(ticket)
    return tickets, attempts


# ---------- main ----------

def main() -> int:
    try:
        cfg = load_config(CONFIG_FILE)
    except (FileNotFoundError, configparser.Error) as e:
        print(f"Config error: {e}", file=sys.stderr)
        return 1

    # Set up dual terminal+file output before anything else gets printed.
    file_handle = None
    output_path: Path | None = None
    if cfg["save_to_file"]:
        output_path = SCRIPT_DIR / f"top {cfg['num_tickets']}-{date.today():%Y-%m-%d}.txt"
        file_handle = open(output_path, "w", encoding="utf-8")
        sys.stdout = Tee(sys.__stdout__, file_handle)

    print(f"Loaded config: {CONFIG_FILE.name}")
    if output_path:
        print(f"Saving output to: {output_path}")

    try:
        text = run_analyzer()
    except subprocess.CalledProcessError as e:
        print(f"Analyzer failed:\n{e.stderr}", file=sys.stderr)
        return 1

    all_whites, all_reds = parse_full_table(text)
    whites_pool = build_pool(all_whites, cfg["white_min_freq"],
                             cfg["white_top_n"], cfg["white_excl_top"])
    reds_pool   = build_pool(all_reds, cfg["red_min_freq"],
                             cfg["red_top_n"], cfg["red_excl_top"])

    print(f"\nWHITE pool: {len(whites_pool)} of {len(all_whites)} balls  "
          f"(exclude_top={cfg['white_excl_top']}%, >{cfg['white_min_freq']}%, "
          f"top_n={cfg['white_top_n'] or 'no cap'})")
    print("  " + ", ".join(f"#{n:02d}({p:.2f}%)" for n, p in whites_pool))
    print(f"RED pool:   {len(reds_pool)} of {len(all_reds)} balls  "
          f"(exclude_top={cfg['red_excl_top']}%, >{cfg['red_min_freq']}%, "
          f"top_n={cfg['red_top_n'] or 'no cap'})")
    print("  " + ", ".join(f"PB{n:02d}({p:.2f}%)" for n, p in reds_pool))

    # Decade-coverage sanity check (need >= min_decades distinct decades in pool)
    decades_in_pool = {(n - 1) // 10 for n, _ in whites_pool}
    if len(decades_in_pool) < cfg["min_decades"]:
        print(f"\nERROR: white pool spans only {len(decades_in_pool)} decade(s), "
              f"but min_decade_span = {cfg['min_decades']}. "
              "Loosen white_ball_min_frequency_pct.", file=sys.stderr)
        return 1
    if len(whites_pool) < 5:
        print("\nERROR: white pool has fewer than 5 balls.", file=sys.stderr)
        return 1

    rng = random.Random()
    tickets, attempts = generate(whites_pool, reds_pool, cfg, rng)

    print("\n" + "=" * 72)
    print(f"{cfg['num_tickets']} SUGGESTED TICKETS")
    print("=" * 72)
    print(f"Hard:  sum {cfg['sum_min']}-{cfg['sum_max']} | "
          f"odd-count {sorted(cfg['allowed_odd'])} | "
          f"low-count {sorted(cfg['allowed_low'])} (low<={cfg['low_cutoff']}) | "
          f"consec<={cfg['max_consec']} | "
          f"decades {cfg['min_decades']}-{cfg['max_decades']}")
    print(f"Soft:  P(accept 1-consec)={cfg['w_1_consec']}")
    print()

    for i, (whites, red) in enumerate(tickets, 1):
        s, odd, low, cons, decades = features(whites, cfg)
        print(f"  #{i:2d}  {'-'.join(f'{n:02d}' for n in whites)}   PB {red:02d}"
              f" - sum={s} - odd/even={odd}/{5-odd} - low/hi={low}/{5-low}"
              f" - consec={cons} - decades={decades}")

    print(f"\nGenerated {len(tickets)}/{cfg['num_tickets']} unique tickets "
          f"in {attempts} attempts.")
    if len(tickets) < cfg["num_tickets"]:
        print("(Hit attempt cap - loosen constraints in powerball_tickets.ini.)")

    if file_handle is not None:
        sys.stdout = sys.__stdout__
        file_handle.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
