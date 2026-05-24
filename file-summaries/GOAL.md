# GOAL.md

**What:** Long-form project vision, autonomy contract, binding user requirement, locked decisions table (24 rows), strategy data model + apply flow + export schema, architecture sketch, **five-phase roadmap with per-phase "Locked details" sub-sections**, explicit approval-points list.
**Why:** On-demand reference for "what we're building, what's already decided, and where the agent must halt." Designed for autonomous execution.

## Key content

- **Autonomy contract** at top: locked decisions are binding; per-phase Locked details pre-answer everything; halt only at approval points; unmapped questions → default + note in HANDOFF.md, never halt.
- Vision + tagline: "What's Your Lottergy to Win?"
- **Binding user requirement:** every parameter ships with the most appropriate control + info "i" bubble.
- v1 scope: Powerball + Mega Millions; web primary; ticket generator (two sampling modes), Monte Carlo, multi-game strategies, JSON export/import, graphical Results & Analysis.
- Locked decisions table (24 rows): see CLAUDE.md / file-summary-CLAUDE for the running list.
- Strategy data model + apply flow + export schema.
- **Five phases, each with "Locked details" pre-answering all execution-time decisions:**
  - Phase 0: SDK version, README content, tsconfig.base, ESLint, Prettier, .editorconfig, workspace yaml, commit message.
  - Phase 1: Pages source/folder, scraper output path, commit format, schedule, auth, concurrency, failure mode, validation approach, era detection, MM matrix auto-detect.
  - Phase 2: vitest for packages, Math.random RNG, vanilla Web Worker, crypto.randomUUID IDs, snapshot baseline from Python with seed 42, worker progress every 50k iter or 250ms.
  - Phase 3: kebab-case game IDs, registry shape, info-bubble copy tone, default presets, no shipped starter strategies.
  - Phase 4: **chart library = `react-native-gifted-charts`**, tabs+stack navigation, full deep-link route map, modal presentation, Reanimated 3, native useState forms, skeleton loaders, three-state theme override.
  - Phase 5: app name Lottergy, bundle id `com.thebitmaptoshi.lottergy`, Expo default icon, EAS preview+production profiles, web deploy default = Pages-same-repo, deferred metadata/privacy.
- **Approval points list (9 items):** first push, Phase 0 visual confirm, Pages enable, first scrape, each UI screen first render, web deploy path, eas init, first eas build, any PR merge to main.
- Future tooling: `/goal` slash command (post-v1).

## Key invariants

- Decisions table + Locked details are binding. CLAUDE rule 9 enforces this.
- Approval points are the ONLY moments the agent halts. Defaulting is preferred to halting.
- Phase checkboxes are the source of truth for progress.
- Strategy save flow never uses "overwrite."
- Sampling mode is a per-game-slot flag inside each Strategy's `configs[gameId]`.
- `frequency_percentile_range: [low, high]` is one parameter, not two.
- `ResultsVisualizer` is the single render path for all post-run output, powered by `react-native-gifted-charts`.
