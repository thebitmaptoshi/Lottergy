# References

## Examples of good work

- `powerball-legacy/powerball_tickets.ini` — config schema with inline math, baselines, and worked examples. Port this density of explanation into info-bubble copy.
- `powerball-legacy/powerball_tickets.py` — clean section-per-concern structure. Split each section into its own `.ts` file in `packages/core/`.
- `powerball-legacy/powerball_montecarlo.py` — batched progress reporting (every ~50k iterations, not every iteration). Preserve in the Web Worker port.

## Relevant links

- Powerball draws (NY Open Data): `https://data.ny.gov/resource/d6yy-54nr.json`
- Mega Millions draws (NY Open Data): `https://data.ny.gov/resource/5xaw-6ayf.json`
- Project repo: `https://github.com/thebitmaptoshi/Lottergy`
- Data CDN (once Pages is enabled): `https://thebitmaptoshi.github.io/Lottergy/v1/<game>.json`
- Expo docs: `https://docs.expo.dev`
- pnpm workspaces: `https://pnpm.io/workspaces`
- Tamagui: `https://tamagui.dev` · NativeWind: `https://nativewind.dev` (styling TBD)

## Notes

### Inherited gotchas (preserve in port)

- Frequency denominator = N (draws), not 5N. Whites and reds are both "share of draws this number appeared in" — directly comparable to uniform baselines.
- Marginal change per new draw ≈ 0.07pp (formula: `(N-c) / [N(N+1)]`).
- Current-matrix only is the meaningful view. All-time view mixes eras and biases post-2015 numbers cold.
- Powerball eras: 2009-01-07 (5/59+1/39) → 2012-01-15 (5/59+1/35) → 2015-10-07 (5/69+1/26, current).
- Decade-span sanity: warn before the user hits "generate," don't crash after attempt cap exhausts.
- 2026-05 baseline (current matrix): hot whites #21/28/61/64 ≈ 8.9% (vs 7.25% uniform); hot reds PB 04/21/24/14 ≈ 4.6% (vs 3.85%).

### Collaboration preferences

- Collaborator, not a search engine. Push back with reasoning when you disagree.
- Catches math errors — be precise, no hand-waving numbers.
- Config-driven > hardcoded > CLI flags.
- Inline `-` separated stats output, not stacked vertically.

### Disclaimer tone

The user accepts the no-predictive-power reality. Show the disclaimer once (modal + footer); do not re-lecture in every screen.
