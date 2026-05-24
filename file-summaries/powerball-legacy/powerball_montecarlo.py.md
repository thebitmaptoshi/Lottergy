# powerball-legacy/powerball_montecarlo.py

**What:** Runs 100M weighted ticket draws under the same `.ini` config / pool / constraints as `powerball_tickets.py`, parallelized across CPU cores via `multiprocessing.Pool` in batches of 50 tickets per task. Reports top 5 most-frequent 5-white-ball combos.
**Why:** Reference for the TS Monte Carlo worker port. The batched-progress + cancellable pattern carries over to the Web Worker; underlying logic (sampler + constraints) is shared with `powerball_tickets.py`.

## Constants

- `TOTAL_DRAWS = 100_000_000`.
- `BATCH_SIZE = 50` (tickets per worker task).
- `TOP_K = 5`.

## Key invariants

- Reuses `load_config`, `run_analyzer`, `parse_full_table`, `build_pool`, `weighted_sample_no_replace`, `passes_hard`, `soft_accept_prob` from `powerball_tickets.py`. Single source of truth for constraint logic — preserve in the TS port (one core module, two callers).
- Per-ticket attempt cap = 10_000 (inner reject-sample); skip slot if exhausted.
- Output: `Counter` of whites-tuple counts + `Counter` of (whites-tuple, red) counts.
- Mechanical truth: the most-frequent combo under frequency-weighted sampling is the combo of the hottest balls subject to constraints. Document this in in-app copy so users don't misread the output as a prediction.
