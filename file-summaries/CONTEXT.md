# CONTEXT.md

**What:** Tells Claude what the current project is, what success looks like, and what to avoid.
**Why:** Gives every session a fast, concrete read on "done well" without trawling GOAL.md.

## Key content

- One-paragraph build description: cross-platform Expo app, Powerball + Mega Millions v1, GitHub Pages-served JSON, local-only user data with export/import.
- Seven bullets defining good outputs (visual verify, single-file game add, snapshot tests vs legacy, info bubbles everywhere, responsive Monte Carlo, modular files, `file-summaries/` + `INDEX.md` updated on each material change).
- Eight-item don't-do list (no Phase 1 before browser renders, no game logic in core, no 5N-denominator regression, no all-time default, no overselling significance, no auth/cloud for v1, no deleting legacy, no unprompted docs).

## Key invariants

- Stays short. Three sections, terse bullets. If it grows past ~50 lines, move detail to GOAL.md.
- The don't-do list is binding — items here should not appear in code or PRs.
- Loaded into every session via CLAUDE.md `@CONTEXT.md` import.
