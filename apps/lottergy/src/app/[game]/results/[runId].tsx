// Results screen — `/[game]/results/[runId]`. Looks up the run from the
// in-memory store and renders tickets via @lottergy/ui visualizers.

import { useMemo } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { features } from "@lottergy/core";
import { getGame } from "@lottergy/games";
import { BarChartCard, PieChartCard, HistogramCard, TicketTable } from "@lottergy/ui";

import { useRuns } from "@/lib/stores";

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ game: string; runId: string }>();
  const gameId = params.game ?? "";
  const runId = params.runId ?? "";
  const game = getGame(gameId);
  const run = useRuns((s) => s.getRun(gameId, runId));

  const cfg = game?.defaultConfig;

  const rows = useMemo(() => {
    if (!run || !cfg) return [];
    return run.result.tickets.map((t) => {
      const f = features(t.whites, cfg.constraints);
      return {
        whites: t.whites,
        red: t.red,
        sum: f.sum,
        oddCount: f.oddCount,
        lowCount: f.lowCount,
        consecutivePairs: f.consecutivePairs,
        decadeSpan: f.decadeSpan,
      };
    });
  }, [run, cfg]);

  const oddCounts = useMemo(() => count(rows.map((r) => `${r.oddCount} odd / ${5 - r.oddCount} even`)), [rows]);
  const lowCounts = useMemo(() => count(rows.map((r) => `${r.lowCount} low / ${5 - r.lowCount} high`)), [rows]);
  const sumHist = useMemo(() => bucketize(rows.map((r) => r.sum), 25), [rows]);
  const ballFreq = useMemo(() => {
    if (!game) return [];
    const counts = new Map<number, number>();
    for (const r of rows) for (const w of r.whites) counts.set(w, (counts.get(w) ?? 0) + 1);
    return Array.from({ length: game.matrix.whites_max }, (_, i) => ({
      label: String(i + 1),
      value: counts.get(i + 1) ?? 0,
    }));
  }, [game, rows]);

  if (!game) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-zinc-700 dark:text-zinc-300">Unknown game.</Text>
      </SafeAreaView>
    );
  }
  if (!run) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ title: "Results" }} />
        <Text className="text-zinc-700 dark:text-zinc-300">
          Run not found. (Run IDs are in-memory; generate again.)
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ title: `${game.name} Results` }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400">
          {rows.length} tickets generated · {run.result.attempts.toLocaleString()} attempts
          {run.result.hitAttemptCap ? " (hit attempt cap)" : ""}
        </Text>

        <TicketTable rows={rows} title="Tickets" />

        <BarChartCard
          title="Ball appearances across this run"
          data={ballFreq}
        />

        <View className="flex-row flex-wrap gap-4">
          <View className="min-w-[260px] flex-1">
            <PieChartCard
              title="Odd / Even split"
              slices={oddCounts.map((c, i) => ({
                label: c.label,
                value: c.count,
                color: PIE_COLORS[i % PIE_COLORS.length],
              }))}
            />
          </View>
          <View className="min-w-[260px] flex-1">
            <PieChartCard
              title="Low / High split"
              slices={lowCounts.map((c, i) => ({
                label: c.label,
                value: c.count,
                color: PIE_COLORS[i % PIE_COLORS.length],
              }))}
            />
          </View>
        </View>

        <HistogramCard
          title="Sum distribution"
          data={sumHist}
          range={{ min: cfg!.constraints.sum.min, max: cfg!.constraints.sum.max }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function count(values: string[]): Array<{ label: string; count: number }> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return Array.from(m.entries())
    .map(([label, c]) => ({ label, count: c }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function bucketize(values: number[], bucketSize: number): Array<{ label: string; value: number }> {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const start = Math.floor(min / bucketSize) * bucketSize;
  const end = Math.ceil((max + 1) / bucketSize) * bucketSize;
  const buckets = new Map<number, number>();
  for (let b = start; b < end; b += bucketSize) buckets.set(b, 0);
  for (const v of values) {
    const b = Math.floor(v / bucketSize) * bucketSize;
    buckets.set(b, (buckets.get(b) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([b, c]) => ({ label: `${b}-${b + bucketSize - 1}`, value: c }));
}
