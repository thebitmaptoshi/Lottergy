# REFERENCE.md

**What:** Background material — examples worth modeling, verified URLs, inherited gotchas, collaboration preferences, disclaimer tone.
**Why:** Pre-loads the small set of facts and links every session would otherwise re-derive (data API URLs, frequency-math gotchas, era boundaries).

## Key content

- Examples-of-good-work entries pointing at three `powerball-legacy/` files (config density, modular sections, batched progress).
- Verified data URLs: NY Open Data datasets `d6yy-54nr` (Powerball) and `5xaw-6ayf` (Mega Millions).
- Project repo + data CDN URLs (`thebitmaptoshi/Lottergy`, GitHub Pages).
- Stack docs: Expo, pnpm, Tamagui, NativeWind.
- Six inherited gotchas: N-not-5N denominator, marginal-change formula, current-matrix-only default, Powerball era table, decade-span sanity warning, dated 2026-05 baseline numbers.
- Four collaboration preferences: push back, precise math, config-driven, inline stats.
- Disclaimer tone: once, then drop it.

## Key invariants

- Only include URLs / facts that are *verified*. Do not seed plausible-but-unchecked references.
- Update the "2026-05 baseline" numbers when re-running the analyzer; always tag with the date.
- Loaded into every session via CLAUDE.md `@REFERENCE.md` import — keep terse.
