# packages/core

**What:** Game-agnostic primitives — pool filters, constraint engine, samplers, Monte Carlo worker, strategy schema. The TS port of `powerball-legacy/`.

**Why:** Adding a new lottery should require ZERO changes here. All game-specific knowledge lives in `packages/games/<game>/`.

## Current state (Phase 0 scaffold)

- Empty `src/index.ts` (placeholder export). Real code lands in Phase 2.

## Planned modules (Phase 2, per GOAL.md port map)

- `types.ts` — shared `GameConfig`, `Strategy`, `Draw`, `Era`, `GamePayload`.
- `pool.ts` — `build_pool` with `frequency_percentile_range: [low, high]` (replaces legacy `exclude_top_percent`).
- `constraints.ts` — `features`, `passes_hard`, `soft_accept_prob`.
- `sampler.ts` — Efraimidis-Spirakis weighted sampling (Random Weighted mode).
- `topPicks.ts` — deterministic top-N enumeration (Top Picks mode, NEW vs legacy).
- `montecarlo.worker.ts` — Web Worker, cancelable, progress every 50k iter or 250ms.
- `strategy.ts` — Strategy schema + JSON export/import.
- `scale.ts` — cross-game param scaling for "Apply Strategy to other game".

## Key invariants

- No imports from `@lottergy/games`, `@lottergy/ui`, or `expo*`. Pure TS, runs in browser, Node, and Web Worker contexts.
- Frequency denominator = N (number of draws), not 5N — port `powerball_analysis.py` semantics exactly.
- Snapshot tests against `random.Random(42)` Python golden output (Phase 2 task).
