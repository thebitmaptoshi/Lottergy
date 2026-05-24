# apps/lottergy

**What:** The Expo app — the only `apps/*` workspace in v1. Web is the primary target; Android and iOS ship from the same code via EAS.

**Why:** GOAL.md Phase 0: scaffolded via `pnpm create expo-app` with the default Expo Router (tabs) template.

## Stack confirmed at scaffold time (Expo SDK 56)

- `expo-router` for navigation (file-based, deep-linkable per locked decision).
- `react-native-web` for the browser target.
- `react-native-reanimated` already bundled (needed by Monte Carlo progress + NativeWind).
- NativeWind v4 wired manually via `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `nativewind-env.d.ts`, and `import "../global.css"` in `src/app/_layout.tsx`.

## Layout (modern Expo Router src/ layout)

- `src/app/` — file-based routes (`index.tsx`, `_layout.tsx`, `explore.tsx`). New screens land here per GOAL.md Phase 4.
- `src/components/` — local UI components shipped with the template. Will be displaced by `@lottergy/ui` as Phase 4 progresses.
- `src/constants/`, `src/hooks/` — template-provided theming + hooks.

## Subpackage notes

- `apps/lottergy/CLAUDE.md` imports `apps/lottergy/AGENTS.md` which pins Expo SDK 56 docs. Read versioned docs at `https://docs.expo.dev/versions/v56.0.0/` before editing app code.
- `apps/lottergy/tsconfig.json` extends `expo/tsconfig.base` (NOT the root `tsconfig.base.json`).
- Local `.gitignore` adds Expo/native ignores on top of root `.gitignore`.

## Key invariants

- Do NOT add game logic here — it belongs in `packages/games/<game>/` or `packages/core/`.
- Adding a screen = adding a file in `src/app/`. Adding a route group = adding a folder.
- NativeWind `dark:` variants from day one (CLAUDE.md cross-cutting requirement) — every styled element must consider both modes.
