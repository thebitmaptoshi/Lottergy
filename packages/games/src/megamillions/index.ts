// Mega Millions game definition. Matrix + era table + default preset + info copy.
// Default preset is the analogous translation of Powerball defaults, scaled
// to Mega Millions' current matrix (5/70 whites + 1/24 Mega Ball as of 2025-04-08).

import type { Era, GameConfig, Matrix } from "@lottergy/core";

import type { GameDefinition } from "../types.ts";

const matrix: Matrix = { whites_max: 70, reds_max: 24, whites_per_ticket: 5 };

const eras: Era[] = [
  { start: "2013-10-22", whites_max: 75, reds_max: 15, label: "2013-2017 (5/75 + 1/15)" },
  { start: "2017-10-31", whites_max: 70, reds_max: 25, label: "2017-2025 (5/70 + 1/25)" },
  { start: "2025-04-08", whites_max: 70, reds_max: 24, label: "2025-present (5/70 + 1/24)" },
];

// Scaling notes vs Powerball defaults:
//   - Uniform expected sum: 5 * (70 + 1) / 2 = 177.5  (PB was 175). Ratio ≈ 1.014.
//     sum range scales: 125 -> 127, 224 -> 227.
//   - lowCutoff: 70 / 2 = 35  (PB was 34).
//   - White uniform baseline: 5/70 = 7.143%.  Set minFrequencyRate to 7.4% (matches the
//     "slightly above uniform" convention used by the PB default).
//   - Red uniform baseline: 1/24 = 4.167%.  Set minFrequencyRate to 4.2% (same convention).
//   - decadeSpan, allowedOdd/Low, maxConsecutivePairs, preferences carry over verbatim.
const defaultConfig: GameConfig = {
  game: "megamillions",
  whitesPool: {
    frequencyPercentileRange: [0, 100],
    minFrequencyRate: 0.074,
    topN: 0,
  },
  redsPool: {
    frequencyPercentileRange: [0, 100],
    minFrequencyRate: 0.042,
    topN: 0,
  },
  constraints: {
    sum: { min: 127, max: 227 },
    allowedOddCounts: [2, 3],
    allowedLowCounts: [2, 3],
    lowCutoff: 35,
    maxConsecutivePairs: 1,
    decadeSpan: { min: 3, max: 4 },
  },
  preferences: {
    weightOneConsecutivePair: 0.55,
  },
  numTickets: 10,
  samplingMode: "random-weighted",
};

export const megamillions: GameDefinition = {
  id: "megamillions",
  name: "Mega Millions",
  tagline: "5 of 70 whites + 1 of 24 Mega Ball",
  matrix,
  eras,
  dataUrl: "https://thebitmaptoshi.github.io/Lottergy/v1/megamillions.json",
  defaultConfig,
  info: {
    overview: {
      title: "Mega Millions",
      body: "US-wide draw twice a week (Tue/Fri). **Matrix updated 2025-04-08** to 5/70 whites + 1/24 Mega Ball. Uniform-random baselines: each white = **7.14%**, each Mega Ball = **4.17%**.",
    },
    params: {
      "whitesPool.frequencyPercentileRange": {
        title: "White ball percentile range",
        body: "Which slice of the *frequency-ranked* white balls to consider. **0 = coldest, 100 = hottest**. Default `[0, 100]` includes every ball. Set `[10, 90]` to drop the coldest 10% *and* the hottest 10% — a 'sweet spot' filter.",
      },
      "whitesPool.minFrequencyRate": {
        title: "White ball minimum frequency",
        body: "Drop white balls at or below this draw-appearance rate. Default `7.4%` — slightly above the uniform baseline of `7.14%`, filtering genuinely cold balls without hand-picking.",
      },
      "whitesPool.topN": {
        title: "White ball cap",
        body: "Keep only the **N hottest** whites that survive the other filters. `0` = no cap.",
      },
      "redsPool.frequencyPercentileRange": {
        title: "Mega Ball percentile range",
        body: "Same as the white control, applied to the 24 Mega Balls. The red pool is small, so `[10, 90]` here drops roughly 2 cold + 2 hot.",
      },
      "redsPool.minFrequencyRate": {
        title: "Mega Ball minimum frequency",
        body: "Drop Mega Balls at or below this draw-appearance rate. Default `4.2%` is just above the uniform baseline of `4.17%`.",
      },
      "redsPool.topN": {
        title: "Mega Ball cap",
        body: "Keep only the **N hottest** Mega Balls that survive the other filters. `0` = no cap.",
      },
      "constraints.sum": {
        title: "Sum range",
        body: "The 5 whites must sum within this range. Uniform expected sum ≈ **177.5**; defaults `127-227` cover the central portion of the historical distribution.",
      },
      "constraints.allowedOddCounts": {
        title: "Odd ball counts",
        body: "Allowed number of *odd* whites. Default `[2, 3]` enforces a 2/3 or 3/2 odd/even split — historically the most-common bucket.",
      },
      "constraints.allowedLowCounts": {
        title: "Low ball counts",
        body: "Allowed number of *low* whites (where 'low' = ball ≤ **Low cutoff**). Default `[2, 3]` enforces a balanced split.",
      },
      "constraints.lowCutoff": {
        title: "Low cutoff",
        body: "A white ball is 'low' if its number is ≤ this. Default `35` puts the cutoff at half the white range (`70/2`).",
      },
      "constraints.maxConsecutivePairs": {
        title: "Max consecutive pairs",
        body: "Maximum back-to-back pairs allowed (`22-23` is one pair; `22-23-24` is two). Default `1`.",
      },
      "constraints.decadeSpan": {
        title: "Decade span",
        body: "Distinct *decades* (1-10, 11-20, ...) the 5 whites occupy. Default `3-4`. With 70 max white, there are 7 decades — `5/5` requires one white per decade range.",
      },
      "preferences.weightOneConsecutivePair": {
        title: "1-consecutive penalty",
        body: "Soft probability of *accepting* a ticket with 1 consecutive pair. `1.0` = no penalty. Default `0.55`.",
      },
      numTickets: {
        title: "Number of tickets",
        body: "How many tickets to generate per run. Default `10`.",
      },
      samplingMode: {
        title: "Sampling mode",
        body: "**Random Weighted** (default) is stochastic — different output each run, weighted by historical frequency. **Top Picks** is deterministic: enumerates every constraint-satisfying combo and returns the highest-scoring ones.",
      },
    },
  },
};
