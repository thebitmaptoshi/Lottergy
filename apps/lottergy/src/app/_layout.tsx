import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";

import { useEffectiveTheme } from "@/lib/useEffectiveTheme";
import { useSettings } from "@/lib/stores";

export default function RootLayout() {
  useEffectiveTheme();
  const dismissed = useSettings((s) => s.disclaimerDismissed);
  const router = useRouter();

  useEffect(() => {
    if (!dismissed) {
      // Defer so the navigation tree is mounted first.
      const t = setTimeout(() => router.push("/disclaimer"), 0);
      return () => clearTimeout(t);
    }
  }, [dismissed, router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="[game]" options={{ headerShown: false }} />
      <Stack.Screen
        name="disclaimer"
        options={{ presentation: "modal", title: "Welcome to Lottergy" }}
      />
    </Stack>
  );
}
