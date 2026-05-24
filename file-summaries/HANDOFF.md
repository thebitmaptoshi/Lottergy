# HANDOFF.md

**What:** Session-to-session state, autonomy directive at top, exact next-step list, manual user steps between sessions, decisions-made-without-input log, port map, gotchas, remaining unknowns.
**Why:** Lets a fresh session pick up cleanly AND execute autonomously. Designed so the next session needs zero clarifying questions until an approval point.

## Key content (snapshot 2026-05-22, autonomy-ready)

- **⚠ Autonomy directive at top:** locked decisions in GOAL.md are binding; halt only at approval points; unmapped questions → default + note in this file's "Decisions made without explicit input" section; never halt to ask.
- Manual user steps: move `powerball/` → `Lottergy/powerball-legacy/`, hoist project docs to root.
- Step 0: confirm state via `Test-Path` + `gh auth status`.
- Step 1: execute Phases 0–4 per GOAL.md, updating file-summaries + INDEX per rules 7/8.
- Step 2: rewrite this file at session end with new state + any auto-defaulted decisions.
- Decisions-made-without-input log (currently empty — session 1 captured everything in GOAL.md locked details).
- Legacy-to-TS port map (now includes `topPicks.ts` for deterministic mode).
- Inherited gotchas (frequency = N denominator, current-matrix default, ~1,100 draw sample size, decade-span warning, `frequency_percentile_range: [0,100]` = include all).
- Remaining unknowns are all non-blocking and all defaulted (MM matrix auto-detect, web deploy default = Pages-same-repo, iOS deferred).

## Key invariants

- Rewrite this at session end. Stale handoff = worse than none.
- Always include the autonomy directive at top.
- Always include the "decisions made without explicit input" section so the user can audit autonomous choices.
- "No remaining blockers" is the explicit closing claim. If one appears mid-execution, add it here before stopping.
