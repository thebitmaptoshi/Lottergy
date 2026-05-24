# powerball-legacy/powerball_tickets.ini

**What:** Human-editable configuration for the ticket generator. Sections: `[pool]`, `[constraints]`, `[preferences]`, `[output]`.
**Why:** Reference for the v1 default-preset shape per game. Each `packages/games/<game>/defaults.ts` ports this schema as a typed object and exposes the inline comments as info-bubble copy.

## Schema

- `[pool]` — `white_ball_min_frequency_pct`, `white_ball_top_n`, `white_ball_exclude_top_percent`; same triple for red.
- `[constraints]` — `sum_min`, `sum_max`, `allowed_odd_counts` (CSV), `allowed_low_counts` (CSV), `low_cutoff`, `max_consecutive_pairs`, `min_decade_span`, `max_decade_span`.
- `[preferences]` — `weight_one_consecutive_pair` (0.0 reject → 1.0 no penalty).
- `[output]` — `num_tickets`, `save_to_file`.

## Key invariants

- Uniform baselines documented in the header: white = 5/69 = 7.246%, red = 1/26 = 3.846%. Info-bubble copy must show the baseline for the user's matrix, not the hardcoded Powerball one.
- `exclude_top_percent` is the "due numbers" mode — drops hottest N% before other filters. Pair with `min_freq_pct = 0` so filters don't fight; surface in the UI.
- `allowed_odd_counts = 2,3` is the default balanced-split preset. UI presets should mirror.
- Inline comments are part of the contract — every parameter ships with a worked example. Preserve that density in the TS port.
