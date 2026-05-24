import { describe, expect, it } from "vitest";

import { GAMES, GAME_ORDER, getGame, listGames } from "./registry.ts";
import { PARAM_KEYS } from "./types.ts";

describe("registry", () => {
  it("GAMES contains both v1 games keyed by their kebab-case id", () => {
    expect(Object.keys(GAMES).sort()).toEqual(["megamillions", "powerball"]);
  });

  it("GAME_ORDER references only known games", () => {
    for (const id of GAME_ORDER) expect(GAMES[id]).toBeDefined();
  });

  it("getGame returns undefined for unknown ids", () => {
    expect(getGame("does-not-exist")).toBeUndefined();
  });

  it("listGames returns games in GAME_ORDER", () => {
    expect(listGames().map((g) => g.id)).toEqual(GAME_ORDER);
  });
});

describe("each game definition", () => {
  for (const [id, game] of Object.entries(GAMES)) {
    describe(id, () => {
      it("has a current-era matrix matching its latest era", () => {
        const latest = game.eras[game.eras.length - 1];
        expect(game.matrix.whites_max).toBe(latest.whites_max);
        expect(game.matrix.reds_max).toBe(latest.reds_max);
      });

      it("dataUrl matches the locked CDN pattern", () => {
        expect(game.dataUrl).toBe(`https://thebitmaptoshi.github.io/Lottergy/v1/${id}.json`);
      });

      it("defaultConfig.game equals the registry id", () => {
        expect(game.defaultConfig.game).toBe(id);
      });

      it("supplies info copy for every PARAM_KEY", () => {
        for (const key of PARAM_KEYS) {
          const copy = game.info.params[key];
          expect(copy, `missing info.params['${key}']`).toBeDefined();
          expect(copy.title.length).toBeGreaterThan(0);
          expect(copy.body.length).toBeGreaterThan(0);
        }
      });

      it("default decade span fits within the matrix's decade count", () => {
        const decadeCount = Math.ceil(game.matrix.whites_max / 10);
        expect(game.defaultConfig.constraints.decadeSpan.max).toBeLessThanOrEqual(decadeCount);
        expect(game.defaultConfig.constraints.decadeSpan.min).toBeLessThanOrEqual(
          game.defaultConfig.constraints.decadeSpan.max,
        );
      });

      it("default sum range is plausible vs uniform mean", () => {
        const uniformMean = (5 * (game.matrix.whites_max + 1)) / 2;
        const { min, max } = game.defaultConfig.constraints.sum;
        // Mean should land roughly in the middle 60% of the configured range.
        expect(uniformMean).toBeGreaterThan(min);
        expect(uniformMean).toBeLessThan(max);
      });
    });
  }
});
