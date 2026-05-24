# packages/games

**What:** Per-game data + info copy bundles consumed by the app. v1 ships `powerball` and `megamillions`. No game logic — that all lives in `@lottergy/core`.

**Why:** Adding a new lottery = one new file in `src/<game>/index.ts` + one line in `registry.ts`. Locked decision: zero core changes per new game.

## Files

- `types.ts` — `GameId` (kebab-case slug), `InfoCopy` (`{title, body}`), `GameDefinition` (matrix, eras, dataUrl, defaultConfig, info), `PARAM_KEYS` (canonical list of editable param paths), `ParamKey`.
- `powerball/index.ts` — current matrix `5/69 + 1/26`, 3-era timeline, default preset translated verbatim from `powerball-legacy/powerball_tickets.ini`, full info copy for all 15 parameters in `PARAM_KEYS`.
- `megamillions/index.ts` — current matrix `5/70 + 1/24` (post-2025-04-08), 3-era timeline, default preset scaled from Powerball (sum range × mean ratio, lowCutoff at midpoint, decadeSpan unchanged), full info copy.
- `registry.ts` — `GAMES` record + `GAME_ORDER` array + `getGame(id)` / `listGames()` helpers. Catalog screen iterates `listGames()`.
- `index.ts` — barrel; consumers import from `@lottergy/games`.

## Tests

- `registry.test.ts` — 16 tests: registry shape, dataUrl matches locked CDN pattern, current-era matrix consistency, defaultConfig.game consistency, every `PARAM_KEY` has non-empty info copy, decade span fits the matrix, sum range straddles uniform mean.

## Info-bubble contract

- Markdown bold (`**x**`) / italic (`*x*`) only. No lists, no links inside the toast.
- 1-3 sentences. Lead with what it does; close with consequence of changing.
- Use a worked example with the game's current uniform baselines where it helps.

## Key invariants

- Logic-free. If a `<game>/` file contains anything other than data + info copy strings, push it into `@lottergy/core`.
- Game IDs kebab-case (`powerball`, `megamillions`). No country prefix in v1.
- `defaultConfig.game` MUST equal the registry id (enforced by tests).
- `dataUrl` MUST equal `https://thebitmaptoshi.github.io/Lottergy/v1/<id>.json` (enforced).
- Every `PARAM_KEY` in `info.params` is populated — adding a new key is a contract change (update PARAM_KEYS *and* every game's info).
- Eras here are the SOURCE OF TRUTH; `scripts/scraper/<game>.ts` has its own copy for the workflow — keep in sync.
