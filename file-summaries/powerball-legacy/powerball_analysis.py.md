# powerball-legacy/powerball_analysis.py

**What:** Fetches every Powerball draw since 2010-02-03 from NY State Open Data, computes frequency / pattern stats for both all-time-mixed-eras and current-matrix-only views, and emits a machine-readable frequency table consumed downstream.
**Why:** Source of truth for historical draw data and frequency math. The TS scraper + core stats port reads this implementation as spec.

## Key content

- Data URL: `https://data.ny.gov/resource/d6yy-54nr.json?$limit=50000`.
- ERAS table: (start_date, white_max, red_max, label) for the three Powerball matrices since 2009.
- `fetch_draws()` → list of `{date, whites, red, era}`.
- `section()`, `show_top()` — output helpers.
- Emits `--- FULL FREQUENCY TABLE (machine-readable) ---` block parsed by `powerball_tickets.py` and `powerball_montecarlo.py`.

## Key invariants

- Frequency denominator = N (number of draws), NOT 5N. Whites and powerballs both express "share of draws this number appeared in" and are directly comparable.
- Current-matrix-only view (since 2015-10-07) is the meaningful one. All-time mixes eras and artificially cools post-2015 numbers (#60-69, PB 27+).
- Stdlib only (`urllib`, `json`) — no third-party deps.
- Era assignment uses string date comparison; safe because ISO-8601 dates sort lexically.
