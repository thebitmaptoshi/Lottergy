// Powerball game definition. Matrix + era table + default preset + info copy.
// Default preset values mirror powerball-legacy/powerball_tickets.ini verbatim,
// translated into the new GameConfig shape (frequencyPercentileRange instead
// of exclude_top_percent, decadeSpan as {min, max} instead of two scalars).

import type { Era, GameConfig, Matrix } from "@lottergy/core";

import type { GameDefinition } from "../types.ts";

const matrix: Matrix = { whites_max: 69, reds_max: 26, whites_per_ticket: 5 };

const eras: Era[] = [
  { start: "2009-01-07", whites_max: 59, reds_max: 39, label: "2009-2012 (5/59 + 1/39)" },
  { start: "2012-01-15", whites_max: 59, reds_max: 35, label: "2012-2015 (5/59 + 1/35)" },
  { start: "2015-10-07", whites_max: 69, reds_max: 26, label: "2015-present (5/69 + 1/26)" },
];

const defaultConfig: GameConfig = {
  game: "powerball",
  whitesPool: {
    frequencyPercentileRange: [0, 100],
    minFrequencyRate: 0.075, // legacy white_ball_min_frequency_pct = 7.50
    topN: 0,
  },
  redsPool: {
    frequencyPercentileRange: [0, 100],
    minFrequencyRate: 0.0385, // legacy red_ball_min_frequency_pct = 3.85
    topN: 0,
  },
  constraints: {
    sum: { min: 125, max: 224 },
    allowedOddCounts: [2, 3],
    allowedLowCounts: [2, 3],
    lowCutoff: 34,
    maxConsecutivePairs: 1,
    decadeSpan: { min: 3, max: 4 },
  },
  preferences: {
    weightOneConsecutivePair: 0.55,
  },
  numTickets: 10,
  samplingMode: "random-weighted",
};

export const powerball: GameDefinition = {
  id: "powerball",
  name: "Powerball",
  tagline: "5 of 69 whites + 1 of 26 red",
  matrix,
  eras,
  dataUrl: "https://thebitmaptoshi.github.io/Lottergy/v1/powerball.json",
  defaultConfig,
  info: {
    overview: {
      title: "Powerball",
      body: "US-wide draw twice a week (Mon/Wed/Sat). Current matrix: pick **5 white balls from 1-69** plus **1 red Powerball from 1-26**. Uniform-random baselines: each white = **7.25%**, each red = **3.85%**.",
    },
    params: {
      "whitesPool.frequencyPercentileRange": {
        title: "White ball percentile range",
        body: "Which slice of the *frequency-ranked* white balls to consider. **0 = coldest, 100 = hottest**. Default `[0, 100]` includes every ball. Set `[10, 90]` to ignore the coldest 10% *and* the hottest 10% — a 'sweet spot' filter.",
      },
      "whitesPool.minFrequencyRate": {
        title: "White ball minimum frequency",
        body: "Drop white balls whose draw-appearance rate is **at or below** this. Default `7.5%` — slightly above the uniform baseline of `7.25%`, so it filters genuinely cold balls without hand-picking.",
      },
      "whitesPool.topN": {
        title: "White ball cap",
        body: "Keep only the **N hottest** balls that survive the other filters. `0` = no cap. Use to force a tight pool (e.g. `15` means only the 15 hottest whites are eligible).",
      },
      "redsPool.frequencyPercentileRange": {
        title: "Powerball percentile range",
        body: "Same as the white control, applied to the 26 Powerballs. The red pool is small (26 balls), so `[10, 90]` here drops roughly 3 cold + 3 hot reds.",
      },
      "redsPool.minFrequencyRate": {
        title: "Powerball minimum frequency",
        body: "Drop Powerballs at or below this draw-appearance rate. Default `3.85%` matches the uniform baseline — anything strictly hotter survives.",
      },
      "redsPool.topN": {
        title: "Powerball cap",
        body: "Keep only the **N hottest** Powerballs that survive the other filters. `0` = no cap.",
      },
      "constraints.sum": {
        title: "Sum range",
        body: "The 5 whites must sum within this range. Uniform expected sum ≈ **175**; defaults `125-224` cover the meaty middle of the historical distribution and reject lopsided low/high tickets.",
      },
      "constraints.allowedOddCounts": {
        title: "Odd ball counts",
        body: "Allowed number of *odd* whites in the ticket. Default `[2, 3]` enforces a 2/3 or 3/2 odd/even split — historically the most-common bucket. Set `[0,1,2,3,4,5]` to allow any.",
      },
      "constraints.allowedLowCounts": {
        title: "Low ball counts",
        body: "Allowed number of *low* whites (where 'low' = ball ≤ **Low cutoff**). Default `[2, 3]` enforces a balanced split. Pair with the cutoff setting to define what 'low' means.",
      },
      "constraints.lowCutoff": {
        title: "Low cutoff",
        body: "A white ball is 'low' if its number is ≤ this. Default `34` puts the cutoff at half the white range (`69/2`).",
      },
      "constraints.maxConsecutivePairs": {
        title: "Max consecutive pairs",
        body: "Maximum back-to-back pairs allowed (e.g. `22-23` is one pair; `22-23-24` is two). Default `1` allows at most a single consecutive pair.",
      },
      "constraints.decadeSpan": {
        title: "Decade span",
        body: "Distinct *decades* (1-10, 11-20, ...) the 5 whites occupy. Default `3-4` forces spread without forcing maximum spread. `5/5` requires one white per decade range (very tight).",
      },
      "preferences.weightOneConsecutivePair": {
        title: "1-consecutive penalty",
        body: "Soft probability of *accepting* a ticket with 1 consecutive pair. `1.0` = no penalty. Default `0.55` accepts about half of consecutive-pair tickets, weighting the output toward fully non-consecutive sets.",
      },
      numTickets: {
        title: "Number of tickets",
        body: "How many tickets to generate per run. Default `10`. Larger values take longer to satisfy if your constraints are tight.",
      },
      samplingMode: {
        title: "Sampling mode",
        body: "**Random Weighted** (default) picks tickets stochastically — different output each run, weighted toward hotter balls. **Top Picks** is deterministic: enumerates every constraint-satisfying combo and returns the highest-scoring ones. Same config → same output.",
      },
    },
  },
};
