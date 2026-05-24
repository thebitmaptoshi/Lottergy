# pnpm-workspace.yaml

**What:** Tells pnpm which subdirectories are workspaces. Matches the locked layout in GOAL.md: `apps/*`, `packages/*`, `scripts/*`.

**Why:** Adding a new game or package = create a new folder under one of these globs; no manifest edit needed.

## Key invariants

- `apps/lottergy` is the only `apps/*` workspace in v1. Future native shells (e.g. a CLI) would land here.
- `packages/*` holds the cross-platform TS code (`core`, `games`, `ui`).
- `scripts/*` holds standalone Node scripts (e.g. `scripts/scraper`).
- Globs match GOAL.md "Locked details" verbatim — do not narrow or move without a locked-decision change.
