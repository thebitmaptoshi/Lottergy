# Lottergy — Project Goal

> "What's Your Lottergy to Win?"

A cross-platform (browser → Android → iOS) app that lets users browse supported lotteries, deep-dive into their historical data, run their own filters and Monte Carlo simulations, and save named strategies they can reuse across games and devices.

---

## Vision

1. **Launch surface:** a polished, fast browser app that *is* the product on day one.
2. **Same codebase ships native** to Google Play, then the App Store, with minimal platform-specific code (Expo / React Native).
3. **Users browse a catalog** of supported lotteries, pick one, and immediately see the historical data with sensible defaults.
4. **Every parameter is editable** with an info "i" bubble explaining what it does and what changing it costs.
5. **Users build strategies** — name them, save them, apply them across other lotteries, and export the whole profile as a JSON file they can carry between devices.

## Autonomy contract

This project is built to be executed by an agent with **minimal human interaction**. Rules:

1. **All locked decisions below are binding.** Execute, never re-ask.
2. **Each phase has a "Locked details" sub-section** that pre-answers every decision the agent would otherwise ask. If a detail isn't covered, default to the most boring industry-standard option and move on.
3. **Halt only at the explicit approval points** listed in § Approval points at the bottom. At every other moment, proceed.
4. **If you discover a question whose answer isn't locked**, do the work assuming the most conservative defensible default, AND add the question + your chosen default to HANDOFF.md so the user can review later. Do not stop the execution.
5. **CLAUDE.md rule 6 ("when unsure, say so") still applies** — but say so in HANDOFF.md, not by halting.

The goal: the user runs `/goal` in a new thread and only sees the agent again at approval points or completion.

## Binding user requirement

Every `.ini`-equivalent parameter in the app must be:
- Surfaced through the **most appropriate control for its type** — slider for continuous ranges, dual-handle range slider for paired min/max, checkbox set for "allowed counts," radio for small enums, segmented control for presets, number input only when no better fit exists.
- Accompanied by an **info "i" bubble** giving plain-language *what / why / consequence* and, where possible, a worked example using the user's current dataset.

This is non-negotiable. The design is judged on whether a first-time user can change any parameter without reading docs.

## v1 scope (ship this first)

- **Games:** Powerball + Mega Millions (both have clean public APIs).
- **Platforms:** Web (primary), with Expo project configured so Android/iOS builds are a `eas build` away.
- **Features:**
  - Game catalog screen with a card per game (Powerball, Mega Millions) and a "Frequent" rail for recently-used games.
  - Game detail screen: frequency chart, hot/cold view, era selector, links to the editor / generator / Monte Carlo.
  - Parameter editor: every knob from the `.ini` with the right control and an "i" bubble (see binding requirement above).
  - Ticket generator: applies user's pool + constraint settings, shows N suggested tickets.
  - Monte Carlo runner: web-worker based, free-form iteration count up to 50M, warning above 2.5M on mobile, cancel button always wired.
  - Strategy save/load: name a configuration, store it locally, apply it to any game (game-compatible settings carry over; incompatible ones fall back to that game's default and flag the user).
  - Export/import: single JSON file containing all strategies + frequent-games list.

## Out of scope for v1

- User accounts, auth, cloud sync (export/import covers cross-device).
- Push notifications.
- Charging money / paywalls.
- More than two lotteries (others tracked in `Future games` below).

## Future games (tracked, not yet built)

- Washington State Lotto (6/49 — scraping, no public API).
- Lucky for Life.
- Cash 4 Life.
- State-specific Pick 3 / Pick 4 / Pick 5 games.
- Lotto America.

Each new game = one new file in `packages/games/<game>/` declaring matrix, eras, data URL, default preset, info copy. No core changes needed.

---

## Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Cross-platform stack | Expo (RN + Expo Router + Expo Web) + TypeScript | One codebase for browser/Android/iOS. Web is the launch target and Expo Web outputs a real React HTML/CSS app (vs Flutter's canvas-based web). TypeScript has the deepest LLM-assist support. |
| Backend | None | Zero hosting cost. All compute runs client-side. |
| Data hosting | `thebitmaptoshi/Lottergy` repo, `data/v1/*.json`, served via GitHub Pages, refreshed nightly by GitHub Action | Free, versioned, instant rollback, no server. |
| Heavy compute | Web Worker (web) / native worker (mobile), free-form iteration count, max 50M, warn >2.5M on mobile, cancel button always present | Keeps UI responsive; gives advanced users headroom without footguns. |
| User data | Local-only (AsyncStorage / IndexedDB) + JSON export/import | No auth complexity, but cross-device portability via a file the user owns. |
| Repo layout | Monorepo at `Lottergy/` with `apps/`, `packages/`, `scripts/`, `data/`, `powerball-legacy/` | Standard, scales as new games and platforms are added. |
| Legacy code | Keep original Python toolkit at `powerball-legacy/` for reference; do not delete | Source of truth for the validated math and constraint logic — port to TS, then archive. |
| Workspace tool | **pnpm** | Windows-friendly, best-tested Expo monorepo path, content-addressed store keeps disk usage low. |
| Styling | **NativeWind** (Tailwind for RN) | Simpler mental model, huge LLM training corpus, fastest onboarding. Lottergy's perf bottleneck is the Monte Carlo worker, not the UI. |
| Scraper language | **TypeScript** (Node) in `scripts/scraper/` | One language across the repo. Single lint/test/CI setup. Legacy Python is ~150 lines — cheap to port; matches the cross-platform-consistency preference. |
| Charts library | **Deferred to Phase 4** | Pick when we know what we actually need to plot. Default leaning: `react-native-svg` for the v1 frequency bar chart (trivial, zero deps beyond what Expo already ships); upgrade to Victory Native XL only if richer charts are needed. |
| Design flow | **ASCII wireframes first** (`wireframes.md`), then code | Locks navigation flow + control-type + info-bubble placement before code. Cheap, fits the no-Figma constraint. |
| License | **MIT** | Permissive default for OSS apps. Lets anyone use, modify, redistribute with copyright-notice retention. Safe for a public repo with no commercial gating. |
| Web app hosting | **Deferred to Phase 5** | No deployment work in Phase 0-4. Pick when the build artifact and PR-preview needs are concrete. Data hosting (GitHub Pages) is unrelated and already locked. |
| GitHub repo state | `thebitmaptoshi/Lottergy` exists, **truly bare** (no commits, no README, no LICENSE) | Clean first push — no rebase/merge dance required. |
| Apple Developer | **Not enrolled** | Phase 5 iOS smoke test is gated on enrollment. Does not block any earlier phase. Android build proceeds independently. |
| Strategy model | **Named multi-game collection** (per-game slots), not a single config | A strategy ("Hot-heavy balanced") can hold a Powerball config, a Mega Millions config, and N more — each tuned to that game's matrix. One named strategy can span 9 games. |
| Cross-game apply | **Scale + offer to save** | When applying a strategy to a game it has no slot for, scale numerics from the closest existing slot and let the user edit. Save flow offers "Save as new name" OR "Save to [existing strategy]" (adds slot, never deletes other slots). |
| URL routing | **Deep links from day one** via Expo Router | Every meaningful app state has a URL: `/powerball`, `/powerball/edit?strategy=hot-heavy`, etc. Sharing a URL restores the view. Browser back/bookmarks work. |
| Theming | **System-follow + manual override**, NativeWind `dark:` variants from day one | Light-only PRs are not v1-acceptable. Designing for both upfront is ~10% extra style work; retrofit later means revisiting every component. |
| Data freshness | **Auto-refetch every launch**, no UI affordance | Fresh JSON from the CDN on each launch. Cache the last successful payload to IndexedDB so the app opens gracefully offline. No "refresh" button. |
| Sampling mode | **Two modes: Random Weighted (default) + Top Picks (deterministic)** | Random Weighted = current Efraimidis-Spirakis behavior, different tickets each run. Top Picks = ranks all constraint-satisfying combinations by joint-frequency score and returns the top `num_tickets`. Deterministic: same config → same output every run. Per-game-config flag; lives in the strategy slot. |
| Frequency percentile range | **Dual-handle range `[low, high]` replacing `exclude_top_percent`** | One control covers both directions. `[0, 100]` = include all. `[10, 90]` = exclude hottest 10% AND coldest 10%. Legacy `exclude_top_percent = X` maps to `[0, 100 - X]`. |
| Results visualization | **Shared `ResultsVisualizer` component** powering both generator and Monte Carlo post-run views | Bar charts (ball appearances, consecutive-pair counts, decade-span counts), pie charts (odd/even, low/high splits), histograms (sum distribution with config-range overlay), sortable table (per-ticket stats). No wall-of-text dumps anywhere. Chart library decision moves earlier in Phase 4 because we now know we need bar + pie + histogram. |

## Architecture sketch

```
┌────────────────────────────────────────────────────────────────┐
│                  Expo app (web/iOS/Android)                    │
│                                                                │
│   apps/lottergy  ────► UI screens (catalog, detail, editor,    │
│        │                 generator, Monte Carlo, strategies)   │
│        │                                                       │
│        ▼                                                       │
│   packages/ui   ────► shared cross-platform components         │
│        │                 (info-bubble, range slider, etc.)     │
│        ▼                                                       │
│   packages/games ───► game definitions (matrix, info copy)     │
│        │                                                       │
│        ▼                                                       │
│   packages/core ────► filters, sampler, Monte Carlo, schemas   │
│        │                                                       │
└────────┼───────────────────────────────────────────────────────┘
         │ HTTPS fetch
         ▼
┌────────────────────────────────────────────────────────────────┐
│           thebitmaptoshi/Lottergy  (this monorepo)             │
│   data/v1/powerball.json                                       │
│   data/v1/megamillions.json                                    │
│   served via GitHub Pages                                      │
│                                                                │
│   updated nightly by:                                          │
│   .github/workflows/scrape.yml ──► scripts/scraper/*.ts (node) │
└────────────────────────────────────────────────────────────────┘
```

## Phased roadmap

### Phase 0 — Foundation
- [ ] Manual move of `powerball/` → `Lottergy/powerball-legacy/` (user does this between sessions)
- [ ] `git init` the Lottergy monorepo; remote = `https://github.com/thebitmaptoshi/Lottergy.git`; default branch `main`
- [ ] Add `LICENSE` (MIT, current year, copyright "thebitmaptoshi")
- [ ] `.gitignore` (`node_modules`, `.expo`, `dist`, `build`, `.DS_Store`, `*.log`, `.env*`, `coverage/`, `.vitest/`)
- [ ] `.nvmrc` pinning Node 22 (current LTS)
- [ ] Minimal `README.md` (name, tagline, link to `GOAL.md`)
- [ ] `pnpm init` + `pnpm-workspace.yaml` covering `apps/*`, `packages/*`, `scripts/*`
- [ ] Root `tsconfig.base.json` with `"strict": true`, target ESNext, moduleResolution Bundler
- [ ] Scaffold `apps/lottergy` via `pnpm create expo-app` with TypeScript + Expo Router (tabs template); extend `tsconfig.base.json`
- [ ] Add NativeWind v4 per Expo's setup guide
- [ ] Scaffold `@lottergy/core`, `@lottergy/games`, `@lottergy/ui` (each with its own `package.json`, `tsconfig.json` extending base, `src/index.ts` with `export {};` placeholder)
- [ ] **Verify:** `cd apps/lottergy && pnpm web` renders the starter screen in a browser. Take a screenshot via the verify skill; surface to user at approval point.
- [ ] `git add -A && git commit -m "Phase 0: foundation scaffold" && git push -u origin main` *(approval point: confirm bare-repo state + auth before pushing)*

**Locked details (do not re-ask):**
- Expo SDK: latest stable at session start (whatever `pnpm create expo-app` defaults to).
- README content: just name, tagline ("What's your lottergy to win?"), and link to `GOAL.md`. No screenshots, no install steps yet.
- `tsconfig.base.json`: `strict: true`, `target: "ESNext"`, `module: "ESNext"`, `moduleResolution: "Bundler"`, `jsx: "react-native"`, `skipLibCheck: true`.
- Subpackage `package.json`: `"type": "module"`, `"exports": { ".": "./src/index.ts" }`, no version field (workspace-internal), `"private": true`.
- ESLint: keep Expo's bundled `eslint-config-expo` for the app. Add `@typescript-eslint/recommended` for `packages/*`.
- Prettier: include with config `{ "tabWidth": 2, "semi": true, "singleQuote": false, "trailingComma": "all" }`.
- `.editorconfig`: 2-space indent, LF line endings, UTF-8, trim trailing whitespace.
- `pnpm-workspace.yaml`: `packages: ['apps/*', 'packages/*', 'scripts/*']`.
- Initial commit message: `"Phase 0: foundation scaffold"`.

### Phase 1 — Data pipeline
- [ ] Create `data/v1/` folder + initial empty JSON stubs (matrix + eras + `draws: []`)
- [ ] `scripts/scraper/_common.ts` — shared types (`Draw`, `Era`, `GamePayload`) + JSON schema validator (hand-rolled TS type guard)
- [ ] `scripts/scraper/powerball.ts` — port `powerball-legacy/powerball_analysis.py` fetch + era logic; output v1 JSON; validate before write
- [ ] `scripts/scraper/megamillions.ts` — same for NY Open Data dataset `5xaw-6ayf`
- [ ] `.github/workflows/scrape.yml` — daily 09:00 UTC + `workflow_dispatch` manual trigger; concurrency cancel-in-progress
- [ ] Enable GitHub Pages: source = `main` branch, folder = `/data` *(approval point: user does in GitHub UI)*
- [ ] Manual first run via `workflow_dispatch`; verify both JSON files load at `https://thebitmaptoshi.github.io/Lottergy/v1/<game>.json` *(approval point: sanity-check data)*

**Locked details (do not re-ask):**
- GitHub Pages source: `main` branch, folder `/data`. URL pattern becomes `https://thebitmaptoshi.github.io/Lottergy/v1/<game>.json`.
- Scraper output path: `data/v1/<game>.json`.
- Scraper commit format: one commit per game per run, message `"data: refresh <game> (<date>)"`.
- Action schedule: daily 09:00 UTC (after most US lottery draws settle).
- Action auth: default `GITHUB_TOKEN`. No PAT needed.
- Action concurrency: `cancel-in-progress: true` so overlapping runs don't conflict.
- Action failure: GitHub auto-emails repo owner after 2 consecutive failures (default behavior; do not customize).
- JSON validation: hand-rolled TypeScript type guard in `_common.ts`. No zod / runtime schema lib in v1.
- Era detection: hardcoded `ERAS` array in `packages/games/<game>/index.ts`. Scraper warns (does not fail) if it sees draws with white/red max outside the known eras — likely a matrix change that needs a manual era-table update.
- Mega Millions current matrix: auto-detect from the latest draw's max white/red; if it differs from the hardcoded ERAS, the scraper logs a warning and still commits the data.
- Scrape failure mode: if API returns non-200, log + skip this run; if validation fails, log + skip + DO NOT overwrite the previous good file.

### Phase 2 — Core logic port
- [ ] `packages/core/types.ts` — shared types (`GameConfig`, `Strategy`, `Draw`, `Era`, `GamePayload`, etc.)
- [ ] `packages/core/pool.ts` — port `build_pool` with the new `frequency_percentile_range: [low, high]` shape (replaces `exclude_top_percent`)
- [ ] `packages/core/constraints.ts` — port `features`, `passes_hard`, `soft_accept_prob`
- [ ] `packages/core/sampler.ts` — port Efraimidis-Spirakis (Random Weighted mode)
- [ ] `packages/core/topPicks.ts` — deterministic top-N enumeration (Top Picks mode); ranks by joint frequency product, returns top-N constraint-satisfying combos
- [ ] `packages/core/montecarlo.worker.ts` — Web Worker, cancelable, progress every ~50k iterations
- [ ] `packages/core/strategy.ts` — Strategy schema + JSON export/import (per the spec in § Strategy data model)
- [ ] `packages/core/scale.ts` — cross-game param scaling (the "Scale & edit" modal logic)
- [ ] Snapshot tests: regenerate Python golden output with `random.Random(42)` once, compare TS port output for the same config

**Locked details (do not re-ask):**
- Test framework: **vitest** for `packages/*` (fast, modern, native ESM). Accept Expo's bundled Jest for `apps/lottergy`.
- RNG: native `Math.random()` for Random Weighted; deterministic enumeration for Top Picks. No user-facing seed in v1.
- Web Worker: vanilla Web Worker API + `postMessage`. No Comlink.
- Strategy IDs: `crypto.randomUUID()` (UUID v4).
- Type definitions: co-located with code in each file (no separate `types/` folder beyond `types.ts`).
- Exports: barrel `src/index.ts` per package re-exporting public API.
- Snapshot baseline: generate once with the Python toolkit using `random.Random(42)`, commit as `packages/core/__snapshots__/python-golden.json`. Update if the TS port introduces a deliberate semantics change (must be PR-documented).
- Worker progress cadence: post every 50_000 iterations OR every 250ms, whichever comes first.

### Phase 3 — Game definitions
- [ ] `packages/games/types.ts` — `GameId`, `GameDefinition`, `InfoCopy`
- [ ] `packages/games/powerball/index.ts` — matrix, ERAS array, data URL, default preset (typed translation of `powerball-legacy/powerball_tickets.ini`), info-bubble copy per parameter
- [ ] `packages/games/megamillions/index.ts` — same, scaled to MM's current matrix
- [ ] `packages/games/registry.ts` — exports `GAMES: Record<GameId, GameDefinition>` consumed by the catalog screen

**Locked details (do not re-ask):**
- Game IDs: kebab-case slugs — `powerball`, `megamillions`. No country prefix (both US in v1).
- Game registry shape: `Record<GameId, GameDefinition>`. Adding a game = one new file under `packages/games/<id>/` plus one line in the registry.
- Info-bubble copy: Markdown for `**bold**` and `*italic*` only (no lists, no links inside toasts). Tone: precise + terse + non-lecturing (per REFERENCE.md). 1–3 sentences each. Include a worked example with the user's current dataset when possible.
- Default presets: Powerball uses the current `.ini` values verbatim. Mega Millions uses analogous values scaled to its current matrix (sum range scaled by matrix-sum ratio, decade ranges adjusted to the new white-ball max, all enum constraints carry verbatim).
- No starter / curated strategies shipped in v1 — users build their own from the per-game default preset.

### Phase 4 — UI
- [ ] Install `react-native-gifted-charts` + peer deps (no chart-library decision needed — locked below)
- [ ] `packages/ui/InfoBubble.tsx` — the `[i]` toast used everywhere
- [ ] `packages/ui/controls/` — Slider, DualHandleRangeSlider, CheckboxSet, RadioGroup, SegmentedControl, NumberInput
- [ ] `packages/ui/ResultsVisualizer/` — single render path for all post-run output (Phase 2 output + Phase 4 MC output)
- [ ] Implement the 6 screens from `wireframes.md` in order: Catalog → Game Detail → Parameter Editor → Monte Carlo → Strategies → Results & Analysis
- [ ] Settings screen (`/settings`) — theme override toggle, export/import, about, disclaimer reopener
- [ ] Wire deep-link routes per § Locked details below
- [ ] First-launch disclaimer modal (one-shot, persisted-dismissed flag in local storage)

**Locked details (do not re-ask):**
- **Chart library: `react-native-gifted-charts`.** No Skia peer dep, lighter bundle, simpler API, mature. Renders bar, pie, histogram, line. Use it for everything in `ResultsVisualizer`.
- Navigation: Expo Router with tabs at root: `Catalog`, `Strategies`, `Settings`. Stacks within each tab for drill-downs.
- Routes (deep linkable):
  - `/` → Catalog
  - `/(tabs)/strategies` → Strategies list
  - `/(tabs)/settings` → Settings
  - `/[game]` → Game Detail (e.g. `/powerball`)
  - `/[game]/edit?strategy=<id>` → Parameter Editor
  - `/[game]/montecarlo` → Monte Carlo
  - `/[game]/results/[runId]` → Results & Analysis (runId is in-memory; URL only restores latest run from store)
- Modals: Expo Router built-in `presentation: 'modal'` for Save modal, Scale & edit modal, Disclaimer.
- Animation: Reanimated 3 (bundled with Expo). No additional animation libs.
- Forms: native `useState` / Zustand for the parameter editor. No `react-hook-form` — there are no validation flows that need it.
- Loading states: skeleton loaders for initial data fetch; inline spinners for in-progress actions; progress bar for Monte Carlo.
- Theme override toggle in Settings: three states — `system` (default), `light`, `dark`.
- Disclaimer first-launch: one full-screen modal on first app open; persisted-dismissed flag in `@lottergy/disclaimer-dismissed` storage key.

### Phase 5 — Polish + native builds
- [ ] PWA manifest for "Add to Home Screen" (icons, theme color, display: standalone)
- [ ] Web build smoke test (`pnpm --filter lottergy build:web`)
- [ ] Choose + execute web deployment path *(approval point: see locked options below)*
- [ ] EAS project init (`eas init`) *(approval point: signs into Expo account, costs nothing yet)*
- [ ] `eas build --profile preview --platform android` smoke test *(approval point: first build run)*
- [ ] iOS build: SKIP — Apple Developer not enrolled. Re-open when enrolled.

**Locked details (do not re-ask):**
- App name: `Lottergy`.
- App bundle identifier / Android package: `com.thebitmaptoshi.lottergy`.
- App icon / splash: Expo defaults for v1. Custom design is a post-v1 task.
- EAS profiles: `preview` (internal testing, APK output) and `production` (later). Skip `development` profile.
- Web deployment options (pick at the approval point — no pre-lock because depends on what feels right by then):
  - Option A: GitHub Pages from same `Lottergy` repo, app build pushed to `gh-pages` branch via Action.
  - Option B: Vercel free tier auto-deploying from main.
  - Default if user is unavailable at the approval point: Option A (keeps everything in one platform).
- PWA manifest: icon 192/512, theme color matches NativeWind primary, display `standalone`, orientation `any`.
- Disclaimer modal: already in Phase 4 (moved up since it's UI, not polish).
- Store metadata, privacy policy, terms of service: deferred until actual store submission.

## Strategy data model

A strategy is a **named collection of per-game configurations** — not a single config.

```ts
type Strategy = {
  id: string;            // UUID v4
  name: string;          // user-chosen
  createdAt: string;     // ISO-8601
  updatedAt: string;     // ISO-8601
  configs: Partial<Record<GameId, GameConfig>>;  // one slot per game the user has tuned
};
```

### Applying a strategy to a game

When the user picks "Apply [Strategy X]" on game Y:
1. If `strategy.configs[Y]` exists → load it directly.
2. If not → **scale** from the closest existing slot:
   - Sum range scales by matrix-sum ratio.
   - Per-ball frequency thresholds keep the same percentile relative to the target's uniform baseline.
   - Enum constraints (allowed odd/low counts, max consec pairs) carry verbatim where the domain matches; otherwise reset to defaults.
   - Decade-related fields recompute for the target's max white ball.
3. User edits the scaled config inline.
4. On save, two paths:
   - **Save as new name** → creates a new Strategy with only this game's slot.
   - **Save to [Strategy X]** → adds (or replaces) the slot for game Y inside Strategy X. **Other game slots are untouched.** UI never uses the word "overwrite" because it implies destruction of other slots.

### Export / import schema

```json
{
  "lottergy_version": 1,
  "exported_at": "2026-05-22T08:00:00Z",
  "strategies": [
    {
      "id": "uuid-v4",
      "name": "Hot-heavy balanced",
      "createdAt": "...",
      "updatedAt": "...",
      "configs": {
        "powerball":    { "pool": {...}, "constraints": {...}, "preferences": {...} },
        "megamillions": { "pool": {...}, "constraints": {...}, "preferences": {...} }
      }
    }
  ],
  "frequent_games": ["powerball", "megamillions"]
}
```

Import merges: same-named strategies prompt for replace / keep-both / skip. Breaking changes bump `lottergy_version`.

## Approval points

The agent should halt and surface to the user ONLY at these moments. Everywhere else, execute.

1. **Before first `git push`** — confirm bare repo state matches expectation; confirm `gh auth status` / git auth.
2. **Phase 0 verify-renders** — screenshot the rendered Expo web page; ask user to confirm visually.
3. **Phase 1 GitHub Pages enable** — repo Settings → Pages config is a UI change the user does. Surface the exact source/folder settings.
4. **Phase 1 first scrape** — after manual `workflow_dispatch`, surface the URL + a sample of the JSON for sanity check.
5. **Phase 4 first render of each screen** — screenshot, surface for visual UX review. One round-trip per screen, not per change.
6. **Phase 5 web deployment path** — surface the two options (Pages-same-repo / Vercel); default to Pages-same-repo if no response.
7. **Phase 5 `eas init`** — signs into Expo account; user must be present.
8. **Phase 5 first `eas build`** — costs build credits (free tier sufficient for v1); confirm before triggering.
9. **Any merge to `main` from a feature branch** — if PR workflow is adopted, user reviews before merging.

If a question's answer is not in this list and not pre-locked in a phase's "Locked details," default it (per Autonomy contract rule 4) and append a note to HANDOFF.md so the user can review later. Do not halt for it.

## Future tooling idea (not for v1)

A `/goal` slash command that an agent can run to bootstrap the entire process from CLAUDE/CONTEXT/REFERENCE/GOAL into a working scaffolded project. Captured here so we don't lose the idea; build only after v1 ships and the workflow is stable.

## Disclaimer (shipped in-app)

Lottery draws are mechanically independent random events. Historical frequency analysis surfaces past behavior and has zero predictive power for future draws. "Hot numbers" is the hot-hand fallacy; "due numbers" is the gambler's fallacy. Lottergy is for entertainment and education only. Do not gamble more than you can afford to lose.
