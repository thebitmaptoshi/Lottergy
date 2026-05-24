@CONTEXT.md
@REFERENCE.md
@INDEX.md

# Lottergy — Conventions

> "What's Your Lottergy to Win?"

Auto-loaded each session. Keep lean. Full scope: `GOAL.md`. Session state: `HANDOFF.md`. File map: `INDEX.md`.

---

## Operating rules

1. **Never claim tests passed when output showed as failure.** Read the actual output.
2. **Tell the user when they have a misconception.** Explain the gap, then proceed.
3. **Verify work actually works when claiming done.** Run it. Type-checks aren't behavior.
4. **Modularize: clean and lean, one concern per file.** If a file does two things, split it.
5. **Never repeat acknowledgments or explanations.** State once, then act.
6. **When unsure, say so.** Don't invent paths, flags, or API shapes — verify or ask.
7. **New or materially-changed file → create/edit `file-summaries/<path>.md` + `INDEX.md` entry.** Summary <300 words: one line of *what*, one line of *why*, then exports/functions and key invariants.
8. **Read `file-summaries/` first.** Open the full file only if the summary is insufficient. Context economy is the goal.
9. **Locked decisions in `GOAL.md` are binding — execute, never re-ask.** If a question's answer exists in GOAL.md's decisions table or in a phase's "Locked details" sub-section, just do it. Halt only at the explicit approval points listed in GOAL.md § Approval points. Asking a re-locked question is a rule violation.

## Team-of-engineers mindset

Every change passes four reviews before commit:
- **Junior** — readable? names obvious? no magic?
- **Senior** — edge cases? abstraction earned? fits existing patterns?
- **Architect** — module boundaries respected? data flow sensible?
- **Security** — untrusted input? logging hygiene? exploit surface?

Sub-agents may explore; one process decides with full scope.

---

## Stack (locked)

- **App:** Expo (RN + Expo Router + Expo Web) + TypeScript
- **State:** Zustand + AsyncStorage / IndexedDB
- **Styling:** Tamagui or NativeWind (TBD next session)
- **Data:** `thebitmaptoshi/Lottergy` repo, `data/v1/*.json`, served via GitHub Pages. Nightly Action scrapes draws.
- **Compute:** Web Worker (browser) / native worker (mobile). Free-form iterations up to 50M; warn >2.5M on mobile; cancel always wired.
- **User data:** Local only. JSON export/import for portability. No auth, no backend user table.
- **Backend:** None for v1. The scraper Action is the only "server" code.

## Repo layout

```
Lottergy/                                  # thebitmaptoshi/Lottergy
├── CLAUDE.md  CONTEXT.md  REFERENCE.md  GOAL.md  HANDOFF.md  INDEX.md
├── file-summaries/                        # <300-word per-file digests, mirrors source paths
├── apps/lottergy/                         # Expo app (web + iOS + Android)
├── packages/{core,games,ui}/              # core logic, game defs, shared UI
├── scripts/scraper/                       # nightly draw scraper (Python)
├── data/v1/                               # JSON served via GitHub Pages
└── powerball-legacy/                      # original Python toolkit, reference only
```

## Module boundaries

- **`packages/core/`** — game-agnostic primitives only: pool filters, constraint engine, Efraimidis-Spirakis sampler, Monte Carlo worker, strategy schema.
- **`packages/games/<game>/`** — per-game data only: matrix, eras, data URL, default preset, info-bubble copy. **No logic.** Adding a game = one new file.

## Cross-cutting requirements (binding for every UI surface)

- **Per-parameter appropriate control + info "i" bubble** — see `wireframes.md` for the control mapping table.
- **Dark mode** via NativeWind `dark:` variants from day one. System-follow default with a manual override toggle. Light-only PRs are not v1-acceptable.
- **Deep-linkable URLs** via Expo Router for every meaningful app state (game, edit, monte-carlo, strategy). Sharing a URL must restore the same view.
- **Data freshness** — auto-refetch from the data CDN on every app launch. No UI affordance for "refresh." Graceful fallback to last cached payload if offline so the app still opens.
- **Accessibility** — every interactive element has a screen-reader label; never communicate state through color alone (hot/cold needs an icon or label, not just red/blue); visible focus state for keyboard users on web. RN's `accessibilityLabel` / `accessibilityRole` props mirror these on native.
- **Results are visualized, never dumped as text** — any post-run output (generated tickets, Monte Carlo aggregates, frequency tables) is rendered through the shared `ResultsVisualizer` component using bar charts, pie charts, histograms, and sortable tables. A wall-of-text data dump is never v1-acceptable.

## Info-bubble system

Every adjustable parameter ships with an "i" toast: what it does, the consequence of changing it, a worked example with the user's current dataset. Copy lives next to the parameter definition; UI reads `param.info`.

## Data contract (v1)

`https://thebitmaptoshi.github.io/Lottergy/v1/<game>.json`

```json
{
  "game": "powerball",
  "updated_at": "2026-05-22T08:00:00Z",
  "matrix": { "whites_max": 69, "reds_max": 26, "whites_per_ticket": 5 },
  "eras": [{ "start": "2015-10-07", "whites_max": 69, "reds_max": 26, "label": "5/69 + 1/26" }],
  "draws": [{ "date": "2026-05-20", "whites": [3, 14, 27, 41, 62], "red": 11 }]
}
```

Breaking changes bump `/v1/` → `/v2/`.

## Disclaimer (shipped in-app)

Lottery draws are mechanically independent random events. Frequency analysis has zero predictive power. Lottergy is for entertainment and education. Do not gamble more than you can afford to lose.
