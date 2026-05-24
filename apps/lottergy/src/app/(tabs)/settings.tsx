import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SegmentedControl } from "@lottergy/ui";

import { useSettings, type ThemeMode } from "@/lib/stores";

export default function SettingsScreen() {
  const themeMode = useSettings((s) => s.themeMode);
  const setThemeMode = useSettings((s) => s.setThemeMode);
  const resetDisclaimer = useSettings((s) => s.resetDisclaimer);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Settings</Text>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Theme</Text>
          <SegmentedControl<ThemeMode>
            ariaLabel="Theme mode"
            value={themeMode}
            onChange={setThemeMode}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            "System" follows your OS preference.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">About</Text>
          <View className="rounded-md bg-white p-3 dark:bg-zinc-900">
            <Text className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              Lottery draws are mechanically independent random events. Historical frequency
              analysis surfaces past behavior and has zero predictive power for future draws.
              "Hot numbers" is the hot-hand fallacy; "due numbers" is the gambler's fallacy.
              Lottergy is for entertainment and education only.
            </Text>
            <Text className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">
              Do not gamble more than you can afford to lose.
            </Text>
          </View>
          <Pressable
            onPress={resetDisclaimer}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            <Text className="text-center text-xs text-zinc-700 dark:text-zinc-300">
              Re-show first-launch disclaimer
            </Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Data</Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            Strategies + frequent games are stored locally only. Use the Strategies tab to export
            or import them as a JSON file.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
