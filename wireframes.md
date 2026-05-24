# Lottergy — Wireframes (v1)

Six screens. ASCII sketches lock the navigation flow, the **control type per parameter**, and the **info-bubble placement** before any UI code is written. Treat as binding for v1; redesign in PRs, not in passing.

Conventions in the sketches:
- `[i]` = info bubble. Tapping opens a bottom toast with *what / why / consequence* and (where possible) a worked example using the user's current dataset.
- `[?]` = global help (top-right). Opens the disclaimer + glossary.
- `▶` = primary action. `‹` = back.
- `●` on a line = handle on a slider/range.

---

## 1 — Catalog (Home)

```
┌─────────────────────────────────────────┐
│  Lottergy                          [?]  │
│  What's your lottergy to win?           │
├─────────────────────────────────────────┤
│  Frequent                               │
│  ┌─────────────────────────────────┐    │
│  │ ⚪ Powerball                    │    │
│  │   5/69 + 1/26  ·  1,142 draws   │ →  │
│  │   Last drawn: 2026-05-20        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  All games                              │
│  ┌─────────────────────────────────┐    │
│  │ 🔴 Powerball             [i]    │ →  │
│  │ 🟡 Mega Millions         [i]    │ →  │
│  └─────────────────────────────────┘    │
│                                         │
│  [Import strategies file]               │
│  [Export my strategies]                 │
└─────────────────────────────────────────┘
```

The `[i]` on a game card explains the matrix (5/69 + 1/26), era history, and uniform baselines.

---

## 2 — Game Detail

```
┌─────────────────────────────────────────┐
│  ‹ Powerball                       [?]  │
│  5/69 + 1/26  ·  Era: [Current ▼]       │
├─────────────────────────────────────────┤
│  Frequency  [i]                         │
│  [bar chart: whites 1-69]               │
│  Hot: #21 #28 #61 #64                   │
│  Cold: #34 #36 #56                      │
│  ☐ Show all-time mixed eras  [i]        │
├─────────────────────────────────────────┤
│  Quick actions                          │
│  [▶ Generate tickets]                   │
│  [⚙ Edit parameters]                    │
│  [🎲 Run Monte Carlo]                   │
│  [💾 Saved strategies (3)]              │
└─────────────────────────────────────────┘
```

Era selector: segmented control with one option per era from the game's `eras[]`. Default = current matrix. All-time toggle ships with a warning info bubble (pre-2015 numbers excluded by definition).

---

## 3 — Parameter editor (the `.ini`-knob screen)

This screen is the heart of the binding user requirement: **every knob gets the right control + an info bubble.** Mapping below.

```
┌─────────────────────────────────────────┐
│  ‹ Powerball — Parameters          [?]  │
│  Strategy: [Default       ▼]  [Save…]   │
├─────────────────────────────────────────┤
│  Sampling mode                   [i]    │
│  [Random weighted] [Top picks]          │
│   └─── selected ───┘                    │
│                                         │
│  ──────────────────────────────────     │
│  POOL                                   │
│                                         │
│  White-ball min frequency        [i]    │
│  ━━━━●━━━━━━━━━  7.50%                  │
│  Pool: 28 of 69 balls                   │
│                                         │
│  White-ball top-N cap            [i]    │
│  ( ) Off   (●) Top N: [   28 ]          │
│                                         │
│  White-ball frequency percentile [i]    │
│  [  0% ] ●━━━━━━━━━━━━━━━━━━● [ 100% ]  │
│  Include: all 69 balls                  │
│  (drag handles to exclude top/bottom)   │
│                                         │
│  Red-ball min frequency          [i]    │
│  ━━━●━━━━━━━━━━  3.85%                  │
│                                         │
│  Red-ball top-N cap              [i]    │
│  ( ) Off   (●) Top N: [   12 ]          │
│                                         │
│  Red-ball frequency percentile   [i]    │
│  [  0% ] ●━━━━━━━━━━━━━━━━━━● [ 100% ]  │
│                                         │
│  ──────────────────────────────────     │
│  CONSTRAINTS                            │
│                                         │
│  Sum range                       [i]    │
│  [ 125 ] ●━━━━━━●  [ 224 ]              │
│                                         │
│  Odd / even count                [i]    │
│  ☐ 0  ☐ 1  ☑ 2  ☑ 3  ☐ 4  ☐ 5           │
│                                         │
│  Low / high count  (low ≤ 34)    [i]    │
│  ☐ 0  ☐ 1  ☑ 2  ☑ 3  ☐ 4  ☐ 5           │
│  Low cutoff                      [i]    │
│  ━━━━━●━━━━━━  34                       │
│                                         │
│  Max consecutive pairs           [i]    │
│  ( ) 0  (●) 1  ( ) 2  ( ) 3             │
│                                         │
│  Decade span                     [i]    │
│  [ 3 ] ●━●  [ 4 ]                       │
│                                         │
│  ──────────────────────────────────     │
│  PREFERENCES (soft)                     │
│                                         │
│  Accept 1-consec pair            [i]    │
│  ━━━━━●━━━━━━  0.55                     │
│                                         │
│  [▶ Apply & generate]                   │
└─────────────────────────────────────────┘
```

### Control-per-parameter mapping (binding)

| Parameter | Control | Why |
|---|---|---|
| `sampling_mode` | Segmented control: **Random weighted** / **Top picks** | Binary mode switch; segmented is clearer than radio for two mutually exclusive options. Random = different tickets each run; Top picks = deterministic, same config → same N highest-scoring tickets. |
| `white_ball_min_frequency_pct` | Slider 0–15% (0.05 step) + live "pool: N of 69" readout | Continuous range; immediate feedback on pool size is what users actually care about. |
| `white_ball_top_n` | Radio (Off / On) + number input on "On" | Either capping or not; the cap value only matters when capping. |
| `white_ball_frequency_percentile_range` | **Dual-handle range slider 0–100%** + numeric inputs at each end; live "Include: N of 69 balls" readout | One control covers both top and bottom exclusion. `[0, 100]` = include all; `[10, 90]` = exclude hottest 10% and coldest 10%. Replaces the single-handle `exclude_top_percent`. |
| `red_ball_*` triple | Same controls as whites (incl. dual-handle percentile range) | Symmetry. |
| `sum_min`, `sum_max` | Dual-handle range slider 5–345 + number inputs at each end | Paired min/max is exactly what a range slider models. Numeric inputs let power users type exact values. |
| `allowed_odd_counts` | Checkbox set 0–5 | Set membership; multi-select with no implicit order. |
| `allowed_low_counts` | Checkbox set 0–5 | Same. |
| `low_cutoff` | Slider 1–69 | Single continuous value. |
| `max_consecutive_pairs` | Radio 0 / 1 / 2 / 3 | Small enum, mutually exclusive. |
| `min_decade_span`, `max_decade_span` | Dual-handle range slider 1–5 | Paired min/max, small integer domain. |
| `weight_one_consecutive_pair` | Slider 0.0–1.0 (0.05 step) with labeled endpoints "Reject" ↔ "No penalty" | Soft probability; endpoint labels make the semantics obvious without reading the info bubble. |

Strategy dropdown at the top lets users switch between saved strategies and "Default." "Save…" prompts for a name and stores the current values.

---

## 4 — Monte Carlo

```
┌─────────────────────────────────────────┐
│  ‹ Powerball — Monte Carlo         [?]  │
├─────────────────────────────────────────┤
│  Iterations                      [i]    │
│  [          100,000        ]            │
│  Presets: [10k][100k][1M][10M][50M]     │
│                                         │
│  ⚠ Above 2.5M will slow mobile.         │
│     50M may take 15+ min on phone.      │
│                                         │
│  ⓘ Disabled in Top Picks mode           │
│    (deterministic — nothing to sample)  │
│                                         │
│  [▶ Run]   [✕ Cancel]                   │
│                                         │
│  ━━━━━━━━━●━━━━━━━━━  47%               │
│  47,000 / 100,000  ·  ETA: 12s          │
├─────────────────────────────────────────┤
│  Results  (live)                        │
│                                         │
│  Top combinations (table, sortable)     │
│  ┌─────────────────────────────────┐    │
│  │ # │ Whites           │ PB │ ×  │    │
│  │ 1 │ 21-28-33-61-64   │ 04 │ 1247    │
│  │ 2 │ 21-28-32-61-64   │ 04 │ 1201    │
│  │ 3 │ ...                          │   │
│  └─────────────────────────────────┘    │
│                                         │
│  [▶ Open full analysis →]               │
└─────────────────────────────────────────┘
```

Iteration count: number input (free-form up to 50M) with preset chips for common values. Warning copy appears whenever the value exceeds 2.5M on a mobile-sized viewport. Cancel button is always present; tapping it terminates the worker mid-batch and freezes results at the last completed batch.

Info bubble on "Iterations" explains: more iterations = more confidence the top combos reflect the constraint shape (not a prediction). Names the "hottest balls subject to constraints" mechanical truth (see `powerball_montecarlo.py` summary).

When the active strategy slot is in **Top Picks** sampling mode, the Monte Carlo screen disables the Run button and shows a callout: "Deterministic mode — Monte Carlo produces the same answer as one ticket-generator run."

`[▶ Open full analysis →]` opens Screen 6 with the Monte Carlo result set passed in.

---

## 5 — Strategies

A strategy is a **named collection of per-game configs** — not a single config. One strategy can hold Powerball, Mega Millions, and N more game slots all under one name.

```
┌─────────────────────────────────────────┐
│  Strategies                        [?]  │
├─────────────────────────────────────────┤
│  Saved (2)                              │
│  ┌─────────────────────────────────┐    │
│  │ Hot-heavy balanced              │    │
│  │ 🔴 Powerball   🟡 Mega Millions │    │
│  │ Updated 2026-05-22              │    │
│  │ [Apply ▼]  [Edit]  [Delete]     │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Cold + low-sum experiment       │    │
│  │ 🔴 Powerball  (1 game)          │    │
│  │ Updated 2026-05-19              │    │
│  │ [Apply ▼]  [Edit]  [Delete]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Import .json]   [Export all]          │
└─────────────────────────────────────────┘
```

Per-row chips show every game slot the strategy holds.

### Apply flow

`[Apply ▼]` opens a menu of registered games:
- If the strategy already has a slot for the chosen game → load it directly into the parameter editor.
- If not → open a "Scale & edit" modal:
  - Numerics scale from the closest existing slot (sum range by matrix ratio, frequency thresholds by percentile, decade fields recomputed for the target's white-ball max).
  - Enum constraints carry verbatim where the domain matches; otherwise reset to target defaults with a warning chip.
  - User edits before applying.

### Save flow (from the parameter editor)

`[💾 Save…]` opens a modal:

```
┌─────────────────────────────────────────┐
│  Save configuration                     │
├─────────────────────────────────────────┤
│  ( ) Save as new strategy               │
│      Name: [______________________]     │
│                                         │
│  (●) Save to existing strategy          │
│      Strategy: [Hot-heavy ▼]            │
│      → adds Powerball slot              │
│        (Mega Millions slot untouched)   │
│                                         │
│  [Cancel]                      [Save]   │
└─────────────────────────────────────────┘
```

The word "overwrite" is intentionally never used — saving to an existing strategy only touches the current game's slot. Other game slots are preserved.

### Import / export

Export writes one JSON file (schema in `GOAL.md` § Strategy data model). Import merges; same-named strategies prompt the user for replace / keep-both / skip.

---

## 6 — Results & Analysis (post-run)

Shown after the parameter editor's "▶ Apply & generate" runs, AND from the Monte Carlo screen's "Open full analysis." Same screen, different result set as input. Powered by the shared `ResultsVisualizer` component in `packages/ui/`. **Wall-of-text data dumps are never v1-acceptable** (CLAUDE.md cross-cutting requirement).

```
┌─────────────────────────────────────────┐
│  ‹ Results                         [?]  │
│  Powerball · 10 tickets · "Hot-heavy"   │
├─────────────────────────────────────────┤
│  Tickets                                │
│  ┌─────────────────────────────────┐    │
│  │ #1  03 14 27 41 62   PB 11      │    │
│  │     sum 147  ·  2/3 odd  ·  ... │    │
│  │ #2  08 21 28 39 64   PB 04      │    │
│  │ ...                              │    │
│  └─────────────────────────────────┘    │
│  [Copy all]   [Save as image]           │
├─────────────────────────────────────────┤
│  Analysis                               │
│                                         │
│  Ball appearances across 10 tickets [i] │
│  #21 ████████████████ 6                 │
│  #28 ███████████      5                 │
│  #61 ███████████      5                 │
│  #64 ██████████       4                 │
│  ...                                    │
│                                         │
│  Sum distribution                  [i]  │
│  [histogram, config range shaded]       │
│   125 ┃    ╱╲     ╱╲          ┃ 224     │
│       ┃   ╱  ╲___╱  ╲___      ┃         │
│                                         │
│  Odd / even split    Low / high split   │
│  [pie chart]         [pie chart]        │
│  2-odd 60%           2-low 50%          │
│  3-odd 40%           3-low 50%          │
│                                         │
│  Consecutive pairs  Decade span         │
│  [bar 0/1/2/3]      [bar 3/4/5]         │
│                                         │
│  Per-ticket detail                 [i]  │
│  [sortable table]                       │
│  # | nums              | sum | O/E | L/H │
│  1 | 03 14 27 41 62    | 147 | 2/3 | 2/3 │
│  2 | 08 21 28 39 64    | 160 | 3/2 | 2/3 │
│  ...                                    │
│  ↕ tap column header to sort            │
└─────────────────────────────────────────┘
```

### Visualizations rendered

| Chart | Source | Why |
|---|---|---|
| Horizontal bar: ball appearances | Count of each ball across the result set | Lets the user see whether their hot-bias / cold-bias actually shaped the output. |
| Histogram: sum distribution with config range overlay | Per-ticket sums | Shows whether tickets cluster near the middle of the allowed sum range or hug the edges. |
| Pie: odd/even split distribution | Per-ticket odd-count → bucketed | Quick read on the allowed_odd_counts setting's effect. |
| Pie: low/high split distribution | Per-ticket low-count → bucketed | Same for allowed_low_counts. |
| Bar: consecutive-pair counts (0/1/2/3) | Per-ticket consec count | Shows the effect of the consec hard cap + soft preference weight. |
| Bar: decade-span counts (3/4/5) | Per-ticket distinct decade count | Shows the effect of the decade-span range. |
| Sortable table: per-ticket detail | Full feature set per ticket | The exact data the legacy Python script dumped as text, but interactive. Tap a column header to sort ascending/descending. |

For Monte Carlo (N is huge, can't show per-ticket): the "Per-ticket detail" table is replaced by **Top combinations** and **Top balls** tables; all other charts are identical, just computed over millions of iterations.

### Sampling mode behavior on this screen

- **Random Weighted** → distributions are meaningful spreads.
- **Top Picks** → distributions collapse to whatever the deterministic top-N produced. The screen still renders normally; a small chip near the heading reads "Deterministic — same config will reproduce these exact results."

---

## Cross-screen elements

- **InfoBubble component** (`packages/ui/InfoBubble.tsx`) is the single render path for every `[i]`. Source copy comes from `packages/games/<game>/index.ts`. The bubble itself does no formatting decisions — game definitions own the copy.
- **Disclaimer modal** shows on first launch only; persistent footer link reopens it. Tone: once, then drop it (`REFERENCE.md` § disclaimer tone).
- **Era selector** (Game Detail) is the single point of truth for "which slice of history are we computing on." All downstream screens read the active era from the same store.
