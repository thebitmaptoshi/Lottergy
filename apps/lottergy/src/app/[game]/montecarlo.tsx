// Monte Carlo runner — `/[game]/montecarlo`. Runs in-thread for v1 (the
// Web Worker harness exists in @lottergy/core but Metro doesn't yet bundle
// .worker.ts files into a separate worker chunk on web). The kernel honors
// onProgress + isCanceled so the UI stays responsive even synchronously
// (via setTimeout-yielded batches).

import { useMemo, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildPool,
  computeFrequencyTable,
  currentMatrixDraws,
  runMonteCarloKernel,
} from "@lottergy/core";
import type { MonteCarloResult } from "@lottergy/core";
import { getGame } from "@lottergy/games";

import { useGameData } from "@/lib/useGameData";

const MOBILE_WARN_THRESHOLD = 2_500_000;
const HARD_CAP = 50_000_000;

export default function MonteCarloScreen() {
  const params = useLocalSearchParams<{ game: string }>();
  const gameId = params.game ?? "";
  const game = getGame(gameId);
  const dataState = useGameData(gameId);

  const [iterations, setIterations] = useState<number>(100_000);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; rate: number } | null>(null);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const overWarn = iterations > MOBILE_WARN_THRESHOLD;
  const overCap = iterations > HARD_CAP;

  const start = () => {
    if (!game || dataState.status !== "ready") return;
    setError(null);
    setResult(null);
    setProgress({ completed: 0, total: iterations, rate: 0 });
    cancelRef.current = false;
    setRunning(true);

    const draws = currentMatrixDraws(dataState.data);
    const ft = computeFrequencyTable(draws, game.matrix.whites_max, game.matrix.reds_max);
    const cfg = game.defaultConfig;
    const whitesPool = buildPool(ft.whites, cfg.whitesPool);
    const redsPool = buildPool(ft.reds, cfg.redsPool);

    // Defer to next frame so the UI can paint the "Running…" state.
    setTimeout(() => {
      try {
        const r = runMonteCarloKernel(whitesPool, redsPool, cfg, {
          iterations,
          topK: 5,
          onProgress: (completed, elapsedMs) => {
            setProgress({ completed, total: iterations, rate: completed / (elapsedMs / 1000) });
          },
          isCanceled: () => cancelRef.current,
        });
        setResult(r);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setRunning(false);
      }
    }, 0);
  };

  const cancel = () => {
    cancelRef.current = true;
  };

  const pctDone = useMemo(() => {
    if (!progress) return 0;
    return Math.min(100, (progress.completed / progress.total) * 100);
  }, [progress]);

  if (!game) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-zinc-700 dark:text-zinc-300">Unknown game.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: `${game.name} Monte Carlo` }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">
          Uses {game.name}'s default preset (edit it on the Configure screen first to tune the pool).
          Shows the top-5 most-frequent constraint-satisfying white-ball combinations across N iterations.
        </Text>

        <View className="gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Iterations</Text>
          <TextInput
            keyboardType="numeric"
            inputMode="numeric"
            value={String(iterations)}
            onChangeText={(t) => {
              const n = Number.parseInt(t.replace(/[^0-9]/g, ""), 10);
              setIterations(Number.isFinite(n) ? n : 0);
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {overWarn ? (
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              {overWarn && !overCap ? "Above 2.5M is slow on mobile." : null}
              {overCap ? `Hard cap is ${HARD_CAP.toLocaleString()} per run.` : null}
            </Text>
          ) : null}
        </View>

        {!running ? (
          <Pressable
            onPress={start}
            disabled={dataState.status !== "ready" || overCap}
            className={
              "rounded-md px-4 py-3 " +
              (dataState.status !== "ready" || overCap ? "bg-zinc-400" : "bg-blue-600")
            }
          >
            <Text className="text-center text-base font-semibold text-white">Start</Text>
          </Pressable>
        ) : (
          <Pressable onPress={cancel} className="rounded-md bg-red-600 px-4 py-3">
            <Text className="text-center text-base font-semibold text-white">Cancel</Text>
          </Pressable>
        )}

        {running || progress ? (
          <View className="gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <View className="flex-row items-center gap-2">
              {running ? <ActivityIndicator /> : null}
              <Text className="text-sm text-zinc-800 dark:text-zinc-200">
                {progress?.completed.toLocaleString() ?? 0} / {iterations.toLocaleString()} (
                {pctDone.toFixed(1)}%)
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800">
              <View className="h-full bg-blue-600" style={{ width: `${pctDone}%` }} />
            </View>
            {progress?.rate ? (
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                {Math.round(progress.rate).toLocaleString()} iter/sec
              </Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <View className="rounded-md bg-red-50 p-3 dark:bg-red-950">
            <Text className="text-sm text-red-700 dark:text-red-300">{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View className="gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Top 5 most-frequent white combos
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {result.totalDraws.toLocaleString()} draws · {result.uniqueWhiteCombos.toLocaleString()} unique combos · {(result.elapsedMs / 1000).toFixed(1)}s
            </Text>
            <View className="mt-2 gap-1">
              {result.topWhites.map((c, i) => (
                <View key={c.whites.join(",")} className="flex-row gap-2">
                  <Text className="w-6 text-xs text-zinc-500 dark:text-zinc-400">#{i + 1}</Text>
                  <Text className="flex-1 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {c.whites.map((n) => String(n).padStart(2, "0")).join("-")} · top red {String(c.topRed).padStart(2, "0")}
                  </Text>
                  <Text className="text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                    {c.count.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
