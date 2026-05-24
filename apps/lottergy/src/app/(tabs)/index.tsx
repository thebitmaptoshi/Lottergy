// Catalog screen — the entry point at `/`. Shows every supported game as
// a tappable card, plus a "Frequent" rail of recently-used games.

import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listGames, getGame } from "@lottergy/games";

import { useFrequent } from "@/lib/stores";

export default function CatalogScreen() {
  const games = listGames();
  const recent = useFrequent((s) => s.recent);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Lottergy</Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            What's your lottergy to win?
          </Text>
        </View>

        {recent.length > 0 ? (
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Frequent
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {recent.map((id) => {
                const g = getGame(id);
                if (!g) return null;
                return (
                  <Link key={id} href={`/${id}`} asChild>
                    <Pressable className="rounded-full border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                      <Text className="text-sm text-zinc-800 dark:text-zinc-200">{g.name}</Text>
                    </Pressable>
                  </Link>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View className="gap-3">
          {games.map((g) => (
            <Link key={g.id} href={`/${g.id}`} asChild>
              <Pressable className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{g.name}</Text>
                <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{g.tagline}</Text>
                <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  Current era: {g.eras[g.eras.length - 1].label}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <View className="mt-4 rounded-md bg-amber-50 p-3 dark:bg-amber-950">
          <Text className="text-xs text-amber-900 dark:text-amber-200">
            Lottery draws are mechanically independent random events. Frequency analysis has zero
            predictive power. Lottergy is for entertainment and education only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
