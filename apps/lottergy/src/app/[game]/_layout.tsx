import { Stack } from "expo-router";

export default function GameStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    />
  );
}
