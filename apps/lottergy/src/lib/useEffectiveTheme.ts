// Resolves the effective dark-mode flag from the user's themeMode setting
// (system | light | dark) and the OS preference. Sets it on the DOM root
// for NativeWind's `dark:` variants to pick up on web.

import { useEffect, useMemo } from "react";
import { Platform, useColorScheme } from "react-native";
import { colorScheme as nwColorScheme } from "nativewind";

import { useSettings } from "./stores.ts";

export function useEffectiveTheme(): "light" | "dark" {
  const themeMode = useSettings((s) => s.themeMode);
  const systemScheme = useColorScheme();
  const effective = useMemo<"light" | "dark">(() => {
    if (themeMode === "light") return "light";
    if (themeMode === "dark") return "dark";
    return systemScheme === "dark" ? "dark" : "light";
  }, [themeMode, systemScheme]);

  useEffect(() => {
    nwColorScheme.set(effective);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const cls = document.documentElement.classList;
      cls.remove("light", "dark");
      cls.add(effective);
    }
  }, [effective]);

  return effective;
}
