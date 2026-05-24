// Strategies tab — list of saved strategies, with apply/delete actions and
// export/import entry points.

import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { exportBundle, parseBundle } from "@lottergy/core";
import { getGame } from "@lottergy/games";

import { useFrequent, useStrategies } from "@/lib/stores";

export default function StrategiesScreen() {
  const strategies = useStrategies((s) => s.strategies);
  const remove = useStrategies((s) => s.remove);
  const replaceAll = useStrategies((s) => s.replaceAll);
  const recent = useFrequent((s) => s.recent);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const bundle = exportBundle(strategies, recent);
    const json = JSON.stringify(bundle, null, 2);
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lottergy-strategies-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert("Export", json.slice(0, 500) + "\n…");
    }
  };

  const handleImport = async () => {
    setImportErr(null);
    setImportStatus(null);
    if (typeof window === "undefined" || typeof document === "undefined") {
      setImportErr("Import is web-only in v1.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseBundle(JSON.parse(text));
        if (!parsed) {
          setImportErr("Invalid Lottergy bundle (wrong version or shape).");
          return;
        }
        replaceAll(parsed.strategies);
        setImportStatus(`Imported ${parsed.strategies.length} strategies.`);
      } catch (err) {
        setImportErr(err instanceof Error ? err.message : String(err));
      }
    };
    input.click();
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Strategies</Text>
          <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Named bundles of per-game configurations. Apply one to a game to load its preset.
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={handleExport}
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Text className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Export JSON
            </Text>
          </Pressable>
          <Pressable
            onPress={handleImport}
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Text className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Import JSON
            </Text>
          </Pressable>
        </View>
        {importErr ? (
          <Text className="text-xs text-red-600 dark:text-red-400">{importErr}</Text>
        ) : null}
        {importStatus ? (
          <Text className="text-xs text-emerald-600 dark:text-emerald-400">{importStatus}</Text>
        ) : null}

        {strategies.length === 0 ? (
          <View className="rounded-md border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
            <Text className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              No strategies yet. Open a game, tune parameters, and save.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {strategies.map((s) => {
              const games = Object.keys(s.configs);
              return (
                <View
                  key={s.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">{s.name}</Text>
                  <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {games.length} game{games.length === 1 ? "" : "s"}:{" "}
                    {games.map((g) => getGame(g)?.name ?? g).join(", ")}
                  </Text>
                  <Text className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                    Updated {s.updatedAt.slice(0, 10)}
                  </Text>
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => remove(s.id)}
                      className="rounded-md border border-red-300 px-3 py-1.5 dark:border-red-800"
                    >
                      <Text className="text-xs text-red-600 dark:text-red-400">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
