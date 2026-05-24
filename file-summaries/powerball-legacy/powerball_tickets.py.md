# powerball-legacy/powerball_tickets.py

**What:** Reads `powerball_tickets.ini`, invokes `powerball_analysis.py` for fresh frequency data, builds candidate ball pools per config, samples weighted tickets that pass hard constraints and soft preferences, writes results to terminal + dated text file.
**Why:** Validated reference implementation of the ticket-generation pipeline. The TS port in `packages/core/` consumes this as the spec.

## Exports (reused by `powerball_montecarlo.py`)

- `load_config(path)` → typed-dict config.
- `run_analyzer()` → captures analyzer stdout.
- `parse_full_table(text)` → `(whites, reds)` frequency lists from the machine-readable block.
- `build_pool(all_balls, min_freq_pct, top_n, exclude_top_percent)` → filtered pool.
- `weighted_sample_no_replace(items, weights, k, rng)` — Efraimidis-Spirakis sampler.
- `passes_hard(whites, cfg)`, `soft_accept_prob(whites, cfg)`, `features(whites, cfg)`.
- `SCRIPT_DIR`, `CONFIG_FILE`.

## Key invariants

- Pool filter order: `exclude_top_percent` → `min_freq_pct` → `top_n` cap. Order matters; don't reorder in the port.
- Hard constraints: sum range, allowed odd count, allowed low count (with `low_cutoff`), max consecutive pairs, decade span range.
- Soft constraints currently just `weight_one_consecutive_pair`. Schema must allow more without restructuring.
- `Tee` class duplicates stdout to a dated text file (`top {N}-{YYYY-MM-DD}.txt`); preserve the dated filename convention.
- Reject-sample loop capped at 500_000 attempts; surface as warning when generated < requested.
