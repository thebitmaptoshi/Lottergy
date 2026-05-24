# package.json (root)

**What:** Root workspace manifest. Declares pnpm as the package manager (`packageManager: pnpm@11.2.2`), pins Node >=22, and exposes top-level scripts that fan out to the Expo app and per-package commands.

**Why:** A monorepo needs one root entry point so scripts like `pnpm web`, `pnpm test`, `pnpm lint` work from the repo root regardless of which subpackage you care about.

## Scripts

- `pnpm web` / `pnpm android` / `pnpm ios` — proxy to `apps/lottergy` (`expo start --web|--android|--ios`).
- `pnpm test` — runs vitest in every `packages/*` workspace.
- `pnpm lint` — recursive `lint` script across workspaces.
- `pnpm format` — Prettier writes across all source extensions.

## Key invariants

- `private: true` — never publish this monorepo to npm.
- `packageManager` field locks pnpm; corepack/yarn/npm will refuse to install.
- Adding a new top-level script: must work in CI without per-machine state.
- Do not add runtime deps here — they belong in the workspace that uses them.
