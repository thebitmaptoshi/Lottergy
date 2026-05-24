// Types for game definitions. Each supported lottery exports a
// GameDefinition; the registry stitches them into a typed map.

import type { Era, GameConfig, Matrix } from "@lottergy/core";

export type GameId = string;

/**
 * Copy that backs an "i" info bubble next to a UI control. Markdown is
 * limited to **bold** and *italic* per locked decision — no lists, no links
 * inside the toast itself.
 */
export type InfoCopy = {
  /** Short label, used as the bubble's heading (3-6 words). */
  title: string;
  /** 1-3 sentences. What it does, why it matters, consequence of changing.
   *  Markdown bold/italic only. Worked example using the user's current
   *  dataset where possible. */
  body: string;
};

/**
 * The full per-game data + copy bundle the app consumes.
 *
 * Adding a new lottery = one new file at
 * `packages/games/src/<id>/index.ts` exporting a GameDefinition,
 * plus one line in `registry.ts`.
 */
export type GameDefinition = {
  /** kebab-case slug. Used as the URL segment and the GameConfig.game value. */
  id: GameId;
  /** Display name (e.g. "Powerball"). */
  name: string;
  /** One-line subtitle for the catalog card (e.g. "5/69 white + 1/26 red"). */
  tagline: string;
  matrix: Matrix;
  eras: Era[];
  /** Canonical URL of the v1 JSON for this game. */
  dataUrl: string;
  /** The preset shown when a user first opens the game's editor. */
  defaultConfig: GameConfig;
  info: {
    overview: InfoCopy;
    /** Keyed by config-path (e.g. "constraints.sum", "whitesPool.topN"). */
    params: Record<string, InfoCopy>;
  };
};

/**
 * Stable list of parameter keys for the editor UI to iterate. Centralizes
 * the contract between game definitions (which must supply info copy for
 * each key) and the editor screens (which read from `info.params[key]`).
 */
export const PARAM_KEYS = [
  "whitesPool.frequencyPercentileRange",
  "whitesPool.minFrequencyRate",
  "whitesPool.topN",
  "redsPool.frequencyPercentileRange",
  "redsPool.minFrequencyRate",
  "redsPool.topN",
  "constraints.sum",
  "constraints.allowedOddCounts",
  "constraints.allowedLowCounts",
  "constraints.lowCutoff",
  "constraints.maxConsecutivePairs",
  "constraints.decadeSpan",
  "preferences.weightOneConsecutivePair",
  "numTickets",
  "samplingMode",
] as const;

export type ParamKey = (typeof PARAM_KEYS)[number];
