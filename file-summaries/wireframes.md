# wireframes.md

**What:** ASCII sketches of the 6 core v1 screens (Catalog, Game Detail, Parameter Editor, Monte Carlo, Strategies, Results & Analysis) + the binding control-per-parameter mapping table + the multi-game strategy save/apply modal flows + the ResultsVisualizer chart catalog.
**Why:** Locks navigation flow, control-type-per-parameter, info-bubble placement, the multi-game strategy interaction model, AND the graphical-output contract before any UI code is written.

## Key content

- Drawing conventions: `[i]` info bubble, `[?]` global help, `▶` primary action, `‹` back.
- Screen 1 (Catalog): Frequent rail + All games list + import/export entry points.
- Screen 2 (Game Detail): frequency chart, hot/cold readout, era selector, all-time-mixed toggle, four quick-action buttons.
- Screen 3 (Parameter Editor): the full `.ini`-knob surface with strategy dropdown. Includes:
  - **Sampling mode segmented control** (Random weighted / Top picks) at top of screen.
  - **Dual-handle frequency-percentile-range slider** (replaces single `exclude_top_percent`) — `[0, 100]` default; user drags either handle inward to exclude hottest or coldest balls.
  - Full control-per-parameter mapping table (slider / dual-handle range / checkbox set / radio / segmented per knob).
  - Save modal (Save as new name OR Save to existing strategy — adds current game's slot, leaves other game slots untouched).
- Screen 4 (Monte Carlo): iteration input + preset chips + mobile-warning + cancel + live top-combo table + "Open full analysis" link to Screen 6. Disabled callout when active sampling mode is Top Picks.
- Screen 5 (Strategies): list with per-row game-slot chips, apply/edit/delete, Apply flow (load existing slot OR Scale & edit modal), import/export.
- **Screen 6 (Results & Analysis):** post-run graphical breakdown rendered by shared `ResultsVisualizer` component. Charts: ball-appearance horizontal bar, sum-distribution histogram with config-range overlay, odd/even pie, low/high pie, consecutive-pair bar, decade-span bar, sortable per-ticket detail table. For Monte Carlo input, per-ticket table is replaced with Top Combinations + Top Balls tables; all other charts identical.
- Cross-screen: `InfoBubble` is the single render path; copy lives in `packages/games/<game>/`; era selector is single source of truth; **`ResultsVisualizer` is the single render path for all post-run output.**

## Key invariants

- Control-per-parameter table is binding. Don't substitute a number-input for a slider just because it's faster to ship.
- `[i]` info-bubble copy comes from the game definition, not the UI layer.
- Save-to-existing-strategy adds/replaces only the current game's slot. UI never uses the word "overwrite."
- Apply-with-no-existing-slot must scale, not reset to defaults blindly.
- `ResultsVisualizer` charts are the same component invocation regardless of input source (generator OR Monte Carlo). Differ only in which sub-section renders (per-ticket table vs top-combos table).
- Era selector state is shared across all downstream screens via the global store.
- Monte Carlo Run button disables when active sampling mode is Top Picks (deterministic — same answer as one generator run).
