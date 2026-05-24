# tsconfig.base.json

**What:** Shared TypeScript compiler base for `packages/*` and `scripts/*`. Each package's local `tsconfig.json` extends this.

**Why:** Single source of truth for strictness, target, module resolution. Means every internal package compiles with the same rules.

## Locked options (from GOAL.md)

- `strict: true`, `target: "ESNext"`, `module: "ESNext"`, `moduleResolution: "Bundler"`, `jsx: "react-native"`, `skipLibCheck: true`.

## Extras

- `noUnusedLocals` + `noUnusedParameters` — fail builds on dead bindings (catches half-finished refactors).
- `noFallthroughCasesInSwitch` — guard against missing `break` in constraint enums.
- `lib: ["ESNext", "DOM"]` — `DOM` is needed because the Monte Carlo worker runs in a Web Worker context.

## Key invariants

- `apps/lottergy/tsconfig.json` does NOT extend this — it extends `expo/tsconfig.base` because Expo's typing needs are different (paths aliases, types/react-native runtime).
- Per-package `tsconfig.json` only sets `rootDir`, `outDir`, `include`, and overrides `jsx` if it ships React components.
