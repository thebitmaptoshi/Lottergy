# eslint.config.js (root)

**What:** Flat ESLint config applied to `packages/*` and `scripts/*`. Uses `typescript-eslint` recommended rules.

**Why:** GOAL.md Phase 0 locked detail: "Add `@typescript-eslint/recommended` for `packages/*`. apps/lottergy keeps Expo's bundled `eslint-config-expo`."

## Scope

- **Lints:** `packages/**`, `scripts/**` `.ts`/`.tsx` files.
- **Ignored:** `apps/**` (Expo handles it), `powerball-legacy/**` (Python reference), all `dist/`, `build/`, `node_modules/`, `.expo/`, `coverage/` trees.

## Key invariants

- Flat config (ESLint 9+). Do not regress to the legacy `.eslintrc.json` style.
- Per-package `lint` script in each `packages/*/package.json` runs `eslint src` against just that package.
- Do not add rules here that contradict `tsconfig.base.json`'s strictness — the two should reinforce each other.
