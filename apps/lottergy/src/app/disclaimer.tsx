// First-launch disclaimer modal. Persisted dismissed-flag in
// @lottergy/settings → disclaimerDismissed.

import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettings } from "@/lib/stores";

export default function DisclaimerModal() {
  const dismiss = useSettings((s) => s.dismissDisclaimer);
  const router = useRouter();

  const accept = () => {
    dismiss();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Welcome to Lottergy</Text>

        <Text className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          Lottery draws are mechanically independent random events. Historical frequency analysis
          surfaces past behavior and has <Text className="font-bold">zero predictive power</Text> for
          future draws.
        </Text>
        <Text className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          "Hot numbers" is the hot-hand fallacy. "Due numbers" is the gambler's fallacy.
        </Text>
        <Text className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          Lottergy is for entertainment and education only.{" "}
          <Text className="font-bold">Do not gamble more than you can afford to lose.</Text>
        </Text>

        <View className="mt-6">
          <Pressable
            accessibilityRole="button"
            onPress={accept}
            className="rounded-md bg-blue-600 px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white">I understand</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
