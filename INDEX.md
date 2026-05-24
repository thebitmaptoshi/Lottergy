# Lottergy — File Index

Each entry links to its `file-summaries/<path>.md` digest (<300 words, what + why + exports + invariants). **Read the summary first; open the full file only if the summary is insufficient** (CLAUDE.md rule 8).

Auto-loaded docs (CLAUDE / CONTEXT / REFERENCE) are imported via CLAUDE.md's `@`-headers and intentionally omitted here.

## Project docs (root, on-demand)

- [GOAL.md](file-summaries/GOAL.md) — full vision, v1 scope, locked decisions, architecture, phased roadmap.
- [HANDOFF.md](file-summaries/HANDOFF.md) — session-to-session state and next-step list.
- [wireframes.md](file-summaries/wireframes.md) — ASCII sketches of the 5 core screens + per-parameter control mapping.
- [README.md](file-summaries/README.md) — public repo entry point: name, tagline, link to GOAL.md.
- [LICENSE](file-summaries/LICENSE.md) — MIT, 2026, "thebitmaptoshi".
- [.gitignore](file-summaries/.gitignore.md) — Node + Python + env + OS + IDE ignores.

## Legacy reference (`powerball-legacy/`)

- [powerball_analysis.py](file-summaries/powerball-legacy/powerball_analysis.py.md) — fetches NY Open Data draws, emits frequency tables.
- [powerball_tickets.py](file-summaries/powerball-legacy/powerball_tickets.py.md) — config-driven ticket generator (pool + constraints + sampler).
- [powerball_tickets.ini](file-summaries/powerball-legacy/powerball_tickets.ini.md) — human-editable config schema (spec for `packages/games/<game>/defaults.ts`).
- [powerball_montecarlo.py](file-summaries/powerball-legacy/powerball_montecarlo.py.md) — parallelized Monte Carlo over the same config + sampler.
