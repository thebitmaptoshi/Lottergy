# packages/games

**What:** Per-game data only — matrix, eras, data URL, default preset, info-bubble copy. No logic.

**Why:** Adding a new lottery = one new file in `<game>/index.ts` + one line in `registry.ts`. Zero core changes.

## Current state (Phase 0 scaffold)

- Empty `src/index.ts` (placeholder export). Real code lands in Phase 3.

## Planned modules (Phase 3)

- `types.ts` — `GameId`, `GameDefinition`, `InfoCopy`.
- `powerball/index.ts` — current matrix, ERAS array, data URL, default preset (typed from `powerball-legacy/powerball_tickets.ini`), info copy.
- `megamillions/index.ts` — same, scaled to MM's matrix.
- `registry.ts` — `GAMES: Record<GameId, GameDefinition>` consumed by the catalog screen.

## Key invariants

- Logic-free. If a `<game>/` file contains anything other than data + info copy strings, push it into `packages/core/`.
- Game IDs are kebab-case slugs (`powerball`, `megamillions`). No country prefix in v1.
- Info-bubble copy: Markdown (bold/italic only), 1-3 sentences, includes worked example using current dataset where possible.
- Powerball default preset = legacy `.ini` values verbatim. Mega Millions = analogous values scaled to MM matrix (sum range, decade ranges).
