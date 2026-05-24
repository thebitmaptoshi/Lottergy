# apps/lottergy

**What:** The Expo app — web primary, Android/iOS via EAS later. Phase 4 wired the full route tree, persistent stores, and data flow.

**Why:** GOAL.md ships v1 as a polished browser app first; native shells follow. Adding a new game touches only `packages/games/` — never this app.

## Structure (Expo Router file-based)

```
src/
  app/
    _layout.tsx              # Stack root; mounts theme + opens disclaimer on first launch
    (tabs)/
      _layout.tsx            # Tabs: Catalog, Strategies, Settings
      index.tsx              # /     — Catalog
      strategies.tsx         # /strategies
      settings.tsx           # /settings
    [game]/
      _layout.tsx            # Stack inside game segment
      index.tsx              # /:game            — Game Detail (frequency charts)
      edit.tsx               # /:game/edit       — Parameter Editor (?strategy=<id> opt)
      montecarlo.tsx         # /:game/montecarlo — runner
      results/[runId].tsx    # /:game/results/:runId — generator output
    disclaimer.tsx           # /disclaimer (modal, first-launch + Settings re-show)
  lib/
    useGameData.ts           # CDN fetcher with AsyncStorage cache (offline fallback)
    stores.ts                # Zustand stores (strategies, frequent, settings, runs)
    useEffectiveTheme.ts     # resolves system|light|dark, syncs NativeWind + DOM
    paramEditor.tsx          # ParamRow — control-mapping shared by editor
```

## Stores (Zustand + AsyncStorage persistence)

- `useStrategies` — saved Strategy[] (persisted).
- `useFrequent` — MRU game-id rail (persisted, capped at 5).
- `useSettings` — themeMode (`system`/`light`/`dark`) + disclaimerDismissed (persisted).
- `useRuns` — in-memory only (per GOAL.md: "runId is in-memory; URL only restores latest run").

## Data flow

- `useGameData(gameId)` fetches `game.dataUrl` on every mount (auto-refetch per locked decision).
- Falls back to AsyncStorage cache if offline; surfaces a "Offline — showing last cached data" banner.
- All frequency/pool/generator math runs through `@lottergy/core` only.

## Key invariants

- No game-specific logic here. UI screens read `GameDefinition` from `@lottergy/games` and call `@lottergy/core` functions.
- Routes match GOAL.md locked spec verbatim; the in-app share URL restores the same view.
- Dark mode via NativeWind `dark:` on every styled element from day one. Settings → Theme is `system` default; `light` and `dark` are explicit overrides.
- Disclaimer modal opens on first launch (locked detail), persisted via `useSettings.disclaimerDismissed`. Settings → "Re-show first-launch disclaimer" resets the flag.
- Monte Carlo currently runs in-thread via the kernel (the Web Worker harness in `@lottergy/core/montecarlo.worker.ts` is wired but not yet bundled by Metro for web; the kernel's `onProgress`/`isCanceled` callbacks keep the UI responsive in the meantime).
- The Metro alias `react-native-linear-gradient → expo-linear-gradient` (`metro.config.js`) is required for `react-native-gifted-charts` to resolve under Expo.
