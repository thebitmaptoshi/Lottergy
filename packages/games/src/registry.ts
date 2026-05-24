// Game registry. Stitches each game's definition into a typed map keyed by
// GameId. The catalog screen iterates this. Adding a new game = one import
// + one entry here.

import type { GameDefinition, GameId } from "./types.ts";
import { powerball } from "./powerball/index.ts";
import { megamillions } from "./megamillions/index.ts";

export const GAMES: Record<GameId, GameDefinition> = {
  powerball,
  megamillions,
};

/**
 * Ordered list of GameIds, in the order the catalog should display them.
 * Edit this to reorder the catalog without touching individual game files.
 */
export const GAME_ORDER: GameId[] = ["powerball", "megamillions"];

export function getGame(id: GameId): GameDefinition | undefined {
  return GAMES[id];
}

export function listGames(): GameDefinition[] {
  return GAME_ORDER.map((id) => GAMES[id]).filter((g): g is GameDefinition => g !== undefined);
}
