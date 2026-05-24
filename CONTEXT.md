# Current Project

## What we are building

**Lottergy** — a cross-platform Expo + TypeScript app (browser → Android → iOS) that lets users browse supported lotteries, configure pool / constraint / Monte Carlo parameters with info bubbles on every knob, run simulations, and save named strategies they can reuse across games. v1 ships with Powerball and Mega Millions only. Historical draw JSON is served from the `thebitmaptoshi/Lottergy` repo via GitHub Pages; user data is local-only with JSON export/import for cross-device portability.

## What good looks like

- `pnpm web` from `apps/lottergy/` actually renders in a browser — verified visually, not just "build OK."
- Adding a new lottery = one file in `packages/games/<game>/`. Zero changes to `packages/core/`.
- Ported core functions match `powerball-legacy/` outputs in snapshot tests.
- Every user-adjustable parameter ships with an info bubble that names the consequence of changing it.
- Monte Carlo runs leave the UI responsive, show progress, accept cancel, and warn above 2.5M on mobile.
- File modules are short and single-purpose. The import graph reflects the boundaries.
- Every new/changed file is mirrored in `file-summaries/` and listed in `INDEX.md` (rules 7, 8).

## What to avoid

- Writing Phase 1+ code before Phase 0 actually renders in a browser.
- Game-specific logic in `packages/core/`.
- The 5N-denominator bug — frequency is "share of N draws," not "share of 5N picks."
- Defaulting the UI to all-time mixed-era frequency (it artificially cools post-2015 numbers).
- Overselling significance — current-matrix Powerball history is only ~1,100 draws.
- Auth, accounts, payments, or cloud sync for v1.
- Deleting `powerball-legacy/` — it's the validated spec the TS port must match.
- Creating docs unprompted. Doc surface = CLAUDE / CONTEXT / REFERENCE / GOAL / HANDOFF / INDEX + `file-summaries/`. Nothing else.
