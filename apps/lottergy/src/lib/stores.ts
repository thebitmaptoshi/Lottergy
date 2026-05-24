// Persistent UI state stores. Zustand + AsyncStorage (web localStorage
// fallback). One store per concern: strategies, frequent games, settings,
// and a transient "last run" store keyed by (game, runId).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GenerationResult, Strategy } from "@lottergy/core";

// ---------- Strategies ----------

type StrategiesState = {
  strategies: Strategy[];
  upsert: (s: Strategy) => void;
  remove: (id: string) => void;
  replaceAll: (next: Strategy[]) => void;
};

export const useStrategies = create<StrategiesState>()(
  persist(
    (set) => ({
      strategies: [],
      upsert: (s) =>
        set((st) => {
          const idx = st.strategies.findIndex((x) => x.id === s.id);
          if (idx === -1) return { strategies: [...st.strategies, s] };
          const next = st.strategies.slice();
          next[idx] = s;
          return { strategies: next };
        }),
      remove: (id) => set((st) => ({ strategies: st.strategies.filter((s) => s.id !== id) })),
      replaceAll: (next) => set({ strategies: next }),
    }),
    {
      name: "@lottergy/strategies",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

// ---------- Frequent games ----------

type FrequentState = {
  /** Most-recently used first. Capped at 5. */
  recent: string[];
  touch: (gameId: string) => void;
  clear: () => void;
};

export const useFrequent = create<FrequentState>()(
  persist(
    (set) => ({
      recent: [],
      touch: (gameId) =>
        set((st) => {
          const next = [gameId, ...st.recent.filter((x) => x !== gameId)].slice(0, 5);
          return { recent: next };
        }),
      clear: () => set({ recent: [] }),
    }),
    {
      name: "@lottergy/frequent",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

// ---------- Settings ----------

export type ThemeMode = "system" | "light" | "dark";

type SettingsState = {
  themeMode: ThemeMode;
  disclaimerDismissed: boolean;
  setThemeMode: (m: ThemeMode) => void;
  dismissDisclaimer: () => void;
  resetDisclaimer: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      disclaimerDismissed: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      dismissDisclaimer: () => set({ disclaimerDismissed: true }),
      resetDisclaimer: () => set({ disclaimerDismissed: false }),
    }),
    {
      name: "@lottergy/settings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

// ---------- Last run (transient — NOT persisted) ----------
// Per GOAL.md: "runId is in-memory; URL only restores latest run from store"

type RunRecord = { gameId: string; runId: string; result: GenerationResult; createdAt: string };

type RunsState = {
  latest: Record<string, RunRecord | undefined>; // keyed by gameId
  recordRun: (gameId: string, result: GenerationResult) => string;
  getRun: (gameId: string, runId: string) => RunRecord | undefined;
};

export const useRuns = create<RunsState>()((set, get) => ({
  latest: {},
  recordRun: (gameId, result) => {
    const runId = crypto.randomUUID();
    set((st) => ({
      latest: { ...st.latest, [gameId]: { gameId, runId, result, createdAt: new Date().toISOString() } },
    }));
    return runId;
  },
  getRun: (gameId, runId) => {
    const r = get().latest[gameId];
    if (r && r.runId === runId) return r;
    return undefined;
  },
}));
