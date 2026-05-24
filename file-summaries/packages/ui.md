# packages/ui

**What:** Shared cross-platform UI primitives — `InfoBubble`, 6 controls, and `ResultsVisualizer` (4 chart/table types) — used by every screen in `apps/lottergy`.

**Why:** Single source of truth for the controls + charts that meet the binding cross-cutting UI requirements (info bubble per parameter, dark mode, accessibility, no text dumps).

## Files

- `InfoBubble.tsx` — `[i]` button with inline disclosure (no floating tooltip; the accordion pattern works on touch + screen readers).
- `controls/NumberInput.tsx` — basic numeric input with min/max/step clamping.
- `controls/Slider.tsx` — single-value range; uses native `<input type="range">` on web, falls back to `NumberInput` on native (v1 simplification).
- `controls/DualRangeSlider.tsx` — two-handle `[low, high]` range; backs `frequencyPercentileRange`, `sum`, and `decadeSpan`.
- `controls/CheckboxSet.tsx` — toggleable button-pills, used for `allowedOddCounts` / `allowedLowCounts`.
- `controls/RadioGroup.tsx` — vertical radio for longer labels.
- `controls/SegmentedControl.tsx` — adjoined horizontal radio for short enums (theme mode, sampling mode).
- `ResultsVisualizer/BarChartCard.tsx` — wraps `react-native-gifted-charts` BarChart with title + optional uniform-baseline reference line.
- `ResultsVisualizer/PieChartCard.tsx` — donut + legend, used for odd/even and low/high splits.
- `ResultsVisualizer/HistogramCard.tsx` — bucketed BarChart with optional config-range overlay (sum distribution).
- `ResultsVisualizer/TicketTable.tsx` — sortable per-ticket stats table (sum, odd, low, consec, decades).

## Key invariants

- React Native + NativeWind only. No `expo*` imports — UI is platform-agnostic (web primary, native via Expo Web/EAS).
- Every interactive element has `accessibilityRole` + `accessibilityLabel`. State is communicated by text/icon as well as color (e.g. checked state changes both background AND text-color).
- Dark mode via `dark:` variant on every styled element — never light-only.
- Chart library is locked to `react-native-gifted-charts` (Phase 4 decision in GOAL.md). Use it for all post-run visualizations.
- The app aliases `react-native-linear-gradient` → `expo-linear-gradient` in `apps/lottergy/metro.config.js` so charts resolve cleanly under Expo.
- Adding a new control = one file under `controls/` + one line in `controls/index.ts` + a barrel re-export.
