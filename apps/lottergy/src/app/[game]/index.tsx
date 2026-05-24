// Game Detail screen — `/[game]`. Fetches the v1 JSON, shows current-era
// frequency bar charts for whites and reds, and links into the editor,
// Monte Carlo, and strategies.

import { useEffect, useMemo, useState } from "react";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { computeFrequencyTable, currentMatrixDraws } from "@lottergy/core";
import { getGame } from "@lottergy/games";
import { BarChartCard } from "@lottergy/ui";

import { useGameData } from "@/lib/useGameData";
import { useFrequent } from "@/lib/stores";

export default function GameDetailScreen() {
  const params = useLocalSearchParams<{ game: string }>();
  const gameId = params.game ?? "";
  const game = getGame(gameId);
  const state = useGameData(gameId);
  const touch = useFrequent((s) => s.touch);
  const [allTime, setAllTime] = useState(false);

  useEffect(() => {
    if (game) touch(game.id);
  }, [game?.id, touch]);

  const ft = useMemo(() => {
    if (state.status !== "ready" || !game) return null;
    const draws = allTime ? state.data.draws : currentMatrixDraws(state.data);
    return computeFrequencyTable(draws, game.matrix.whites_max, game.matrix.reds_max);
  }, [state, game, allTime]);

  if (!game) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-zinc-700 dark:text-zinc-300">Unknown game: {gameId}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: game.name }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{game.name}</Text>
          <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{game.tagline}</Text>
          <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            {game.eras[game.eras.length - 1].label}
          </Text>
        </View>

        {state.status === "loading" ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator />
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">Loading draws…</Text>
          </View>
        ) : null}

        {state.status === "error" ? (
          <View className="rounded-md bg-red-50 p-3 dark:bg-red-950">
            <Text className="text-sm text-red-700 dark:text-red-300">
              Could not load data: {state.error}
            </Text>
          </View>
        ) : null}

        {ft && state.status === "ready" ? (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                {ft.drawCount} draws ({allTime ? "all-time, mixed eras" : "current matrix only"})
              </Text>
              <Pressable
                onPress={() => setAllTime((v) => !v)}
                className="rounded-md border border-zinc-300 px-3 py-1 dark:border-zinc-700"
              >
                <Text className="text-xs text-zinc-700 dark:text-zinc-300">
                  {allTime ? "Current matrix" : "All-time"}
                </Text>
              </Pressable>
            </View>

            {allTime ? (
              <View className="rounded-md bg-amber-50 p-2 dark:bg-amber-950">
                <Text className="text-xs text-amber-900 dark:text-amber-200">
                  All-time view mixes matrices. Post-2015 numbers will look artificially cold.
                </Text>
              </View>
            ) : null}

            {state.staleFromCache ? (
              <View className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-900">
                <Text className="text-xs text-zinc-700 dark:text-zinc-300">
                  Offline — showing last cached data.
                </Text>
              </View>
            ) : null}

            <BarChartCard
              title={`White-ball frequency (${game.matrix.whites_max} balls)`}
              data={ft.whites.map((b) => ({
                label: String(b.number),
                value: Number((b.rate * 100).toFixed(2)),
              }))}
              reference={{
                value: (100 * game.matrix.whites_per_ticket) / game.matrix.whites_max,
                label: `uniform 5/${game.matrix.whites_max}`,
              }}
            />

            <BarChartCard
              title={`Red-ball frequency (${game.matrix.reds_max} balls)`}
              data={ft.reds.map((b) => ({
                label: String(b.number),
                value: Number((b.rate * 100).toFixed(2)),
              }))}
              reference={{ value: 100 / game.matrix.reds_max, label: `uniform 1/${game.matrix.reds_max}` }}
              barColor="#ef4444"
            />
          </>
        ) : null}

        <View className="gap-2">
          <Link href={`/${game.id}/edit`} asChild>
            <Pressable className="rounded-md bg-blue-600 px-4 py-3">
              <Text className="text-center text-base font-semibold text-white">
                Configure & generate tickets
              </Text>
            </Pressable>
          </Link>
          <Link href={`/${game.id}/montecarlo`} asChild>
            <Pressable className="rounded-md border border-zinc-300 px-4 py-3 dark:border-zinc-700">
              <Text className="text-center text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Run Monte Carlo
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
