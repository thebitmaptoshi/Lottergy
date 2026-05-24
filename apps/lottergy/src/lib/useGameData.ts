// Game data fetcher hook. Per GOAL.md:
//   - auto-refetch from CDN on every app launch (no UI refresh button)
//   - graceful fallback to last-cached payload if offline
//
// We cache the last successful payload per game in AsyncStorage (which has
// a web fallback to localStorage). One cache entry per game.

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { GamePayload } from "@lottergy/core";
import { getGame } from "@lottergy/games";

type State =
  | { status: "idle" }
  | { status: "loading"; cached?: GamePayload }
  | { status: "ready"; data: GamePayload; staleFromCache: boolean }
  | { status: "error"; error: string; cached?: GamePayload };

const cacheKey = (gameId: string) => `@lottergy/data/v1/${gameId}`;

export function useGameData(gameId: string): State {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    let canceled = false;
    const game = getGame(gameId);
    if (!game) {
      setState({ status: "error", error: `Unknown game: ${gameId}` });
      return;
    }
    setState({ status: "loading" });

    (async () => {
      // Load cache eagerly so loading state has fallback context.
      let cached: GamePayload | undefined;
      try {
        const raw = await AsyncStorage.getItem(cacheKey(gameId));
        if (raw) cached = JSON.parse(raw) as GamePayload;
      } catch {
        // cache read error — ignore
      }
      if (canceled) return;
      if (cached) setState({ status: "loading", cached });

      try {
        const resp = await fetch(game.dataUrl, { cache: "no-store" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = (await resp.json()) as GamePayload;
        if (canceled) return;
        setState({ status: "ready", data, staleFromCache: false });
        try {
          await AsyncStorage.setItem(cacheKey(gameId), JSON.stringify(data));
        } catch {
          // cache write error — ignore
        }
      } catch (err) {
        if (canceled) return;
        if (cached) {
          setState({ status: "ready", data: cached, staleFromCache: true });
        } else {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [gameId]);

  return state;
}
