// Parameter Editor — `/[game]/edit?strategy=<id>`. Loads either the game's
// default preset or a strategy's slot (scaled via core.scaleConfigKnownSource
// when the slot is for a different game). Generates tickets and saves
// configurations into named strategies.

import { useMemo, useState } from "react";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildPool,
  computeFrequencyTable,
  currentMatrixDraws,
  generateTickets,
  newStrategy,
  scaleConfigKnownSource,
  setConfig as setStrategyConfig,
  topPicks,
} from "@lottergy/core";
import type { GameConfig } from "@lottergy/core";
import { getGame, PARAM_KEYS } from "@lottergy/games";

import { ParamRow } from "@/lib/paramEditor";
import { useRuns, useStrategies } from "@/lib/stores";
import { useGameData } from "@/lib/useGameData";

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ game: string; strategy?: string }>();
  const gameId = params.game ?? "";
  const game = getGame(gameId);
  const dataState = useGameData(gameId);

  const strategies = useStrategies((s) => s.strategies);
  const upsertStrategy = useStrategies((s) => s.upsert);
  const recordRun = useRuns((s) => s.recordRun);

  const sourceStrategy = useMemo(
    () => (params.strategy ? strategies.find((s) => s.id === params.strategy) : undefined),
    [params.strategy, strategies],
  );

  const initial = useMemo<GameConfig | null>(() => {
    if (!game) return null;
    if (!sourceStrategy) return game.defaultConfig;
    const slot = sourceStrategy.configs[game.id];
    if (slot) return slot;
    // Strategy has no slot for this game — scale from the first available slot.
    const firstSlotGameId = Object.keys(sourceStrategy.configs)[0];
    const firstSlot = firstSlotGameId ? sourceStrategy.configs[firstSlotGameId] : undefined;
    if (!firstSlot || !firstSlotGameId) return game.defaultConfig;
    const sourceGame = getGame(firstSlotGameId);
    if (!sourceGame) return game.defaultConfig;
    return scaleConfigKnownSource(firstSlot, sourceGame.matrix, game.id, game.matrix);
  }, [game, sourceStrategy]);

  const [cfg, setCfg] = useState<GameConfig | null>(initial);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState<string>(sourceStrategy?.name ?? "");
  const [saveMode, setSaveMode] = useState<"new" | "update">(sourceStrategy ? "update" : "new");

  // Re-sync if route/strategy changed and user hadn't edited yet.
  if (cfg === null && initial !== null) {
    setCfg(initial);
  }

  if (!game || !cfg) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-zinc-700 dark:text-zinc-300">Loading…</Text>
      </SafeAreaView>
    );
  }

  const generate = () => {
    setGenError(null);
    if (dataState.status !== "ready") {
      setGenError("Draw data is still loading. Try again in a moment.");
      return;
    }
    const draws = currentMatrixDraws(dataState.data);
    const ft = computeFrequencyTable(draws, game.matrix.whites_max, game.matrix.reds_max);
    const whitesPool = buildPool(ft.whites, cfg.whitesPool);
    const redsPool = buildPool(ft.reds, cfg.redsPool);

    if (whitesPool.length < 5) {
      setGenError("White pool has fewer than 5 balls. Loosen filters.");
      return;
    }
    if (redsPool.length === 0) {
      setGenError("Red pool is empty. Loosen filters.");
      return;
    }

    let result;
    if (cfg.samplingMode === "top-picks") {
      const tickets = topPicks(whitesPool, redsPool, cfg.constraints, cfg.numTickets);
      result = { tickets, attempts: tickets.length, hitAttemptCap: tickets.length < cfg.numTickets };
    } else {
      result = generateTickets(whitesPool, redsPool, cfg);
    }
    if (result.tickets.length === 0) {
      setGenError("No tickets satisfied the constraints. Loosen the configuration.");
      return;
    }
    const runId = recordRun(game.id, result);
    router.push(`/${game.id}/results/${runId}`);
  };

  const save = () => {
    const trimmedName = saveName.trim();
    if (!trimmedName) {
      setGenError("Strategy name is required.");
      return;
    }
    if (saveMode === "update" && sourceStrategy) {
      const next = setStrategyConfig(sourceStrategy, game.id, cfg);
      upsertStrategy({ ...next, name: trimmedName });
    } else {
      const fresh = newStrategy(trimmedName);
      const withSlot = setStrategyConfig(fresh, game.id, cfg);
      upsertStrategy(withSlot);
    }
    setGenError(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: `Configure ${game.name}` }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {sourceStrategy && sourceStrategy.configs[game.id] === undefined ? (
          <View className="rounded-md bg-amber-50 p-3 dark:bg-amber-950">
            <Text className="text-xs text-amber-900 dark:text-amber-200">
              Strategy "{sourceStrategy.name}" had no slot for {game.name}. Values were scaled from
              an existing slot. Adjust before saving.
            </Text>
          </View>
        ) : null}

        {PARAM_KEYS.map((k) => (
          <ParamRow key={k} paramKey={k} game={game} config={cfg} onChange={setCfg} />
        ))}

        {genError ? (
          <View className="rounded-md bg-red-50 p-3 dark:bg-red-950">
            <Text className="text-xs text-red-700 dark:text-red-300">{genError}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={generate}
          className="rounded-md bg-blue-600 px-4 py-3"
          accessibilityRole="button"
        >
          <Text className="text-center text-base font-semibold text-white">Generate tickets</Text>
        </Pressable>

        <View className="gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Save as strategy
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSaveMode("new")}
              className={
                "flex-1 rounded-md border px-3 py-2 " +
                (saveMode === "new"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                  : "border-zinc-300 dark:border-zinc-700")
              }
            >
              <Text className="text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Save as new
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSaveMode("update")}
              disabled={!sourceStrategy}
              className={
                "flex-1 rounded-md border px-3 py-2 " +
                (saveMode === "update"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                  : "border-zinc-300 dark:border-zinc-700") +
                (!sourceStrategy ? " opacity-50" : "")
              }
            >
              <Text className="text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Save into strategy
              </Text>
            </Pressable>
          </View>
          <TextInput
            value={saveName}
            onChangeText={setSaveName}
            placeholder="Strategy name (e.g. Hot-heavy balanced)"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholderTextColor="#a1a1aa"
          />
          <Pressable
            onPress={save}
            className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            <Text className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Save
            </Text>
          </Pressable>
        </View>

        <Link href={`/${game.id}`} asChild>
          <Pressable className="rounded-md px-4 py-2">
            <Text className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              ← Back to {game.name}
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
