# CLAUDE.md

**What:** Operating rules (9 total), tech stack, cross-cutting UI requirements (6), module boundaries, info-bubble system, v1 data contract, in-app disclaimer.
**Why:** Single source of truth for "how we work" so every session starts from the same playbook without re-deriving conventions.

## Key content

- Nine operating rules. **Rule 9 is the autonomy lock: locked decisions in GOAL.md are binding — execute, never re-ask. Halt only at GOAL.md's approval points.**
- Team-of-engineers four-lens review (junior / senior / architect / security).
- Locked stack: Expo + TypeScript, Zustand, GitHub Pages-served JSON, Web Worker compute, local-only user data.
- Repo layout diagram + module boundaries: `packages/core/` (game-agnostic) vs `packages/games/<game>/` (data only).
- **Cross-cutting UI requirements (binding, 6 bullets):** appropriate control + info bubble per parameter; dark mode via NativeWind `dark:` from day one; deep-linkable URLs via Expo Router; auto-refetch data every launch with offline fallback; accessibility (screen-reader labels, no color-only state, focus); results visualized via shared `ResultsVisualizer`, never dumped as text.
- Info-bubble convention (copy lives next to the parameter; UI reads `param.info`).
- Locked v1 data contract URL and JSON shape.

## Key invariants

- Top-of-file imports `@CONTEXT.md @REFERENCE.md @INDEX.md` — keep these in sync if any filename changes.
- Rules 7 and 8 require every material file change to update `file-summaries/` and `INDEX.md`.
- **Rule 9** forbids re-asking a question whose answer exists in GOAL.md. Asking is a rule violation; default + note in HANDOFF.md instead.
- Data URL pattern: `https://thebitmaptoshi.github.io/Lottergy/v1/<game>.json`. Breaking changes bump `/v1/` → `/v2/`.
- "No backend for v1" is binding.
- Cross-cutting requirements are not negotiable per-PR.
