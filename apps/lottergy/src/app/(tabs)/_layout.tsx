import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Catalog",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>≡</Text>,
        }}
      />
      <Tabs.Screen
        name="strategies"
        options={{
          title: "Strategies",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>★</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙</Text>,
        }}
      />
    </Tabs>
  );
}
