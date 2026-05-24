# packages/ui

**What:** Shared cross-platform UI components — info bubbles, controls (slider, range slider, checkbox set, segmented control), and the `ResultsVisualizer` that renders all post-run output.

**Why:** UI primitives must be portable across web and native. Apps consume `@lottergy/ui` instead of re-inventing per-platform widgets.

## Current state (Phase 0 scaffold)

- Empty `src/index.ts` (placeholder export). Real code lands in Phase 4.

## Planned modules (Phase 4)

- `InfoBubble.tsx` — the `[i]` toast used on every adjustable parameter (binding requirement per GOAL.md).
- `controls/` — Slider, DualHandleRangeSlider, CheckboxSet, RadioGroup, SegmentedControl, NumberInput. Map of param-type → control is in `wireframes.md`.
- `ResultsVisualizer/` — bar/pie/histogram/sortable-table renderers powered by `react-native-gifted-charts`. Single render path for generator output AND Monte Carlo aggregates.

## Key invariants

- React and react-native are `peerDependencies` only — never bundle them.
- Components must work in both light and dark mode from day one (CLAUDE.md cross-cutting requirement).
- Every interactive element gets `accessibilityLabel` / `accessibilityRole`.
- Never communicate state through color alone (hot/cold needs an icon or label, not just red/blue).
