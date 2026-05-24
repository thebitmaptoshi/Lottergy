import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export type PieSlice = { value: number; label: string; color: string };

export type PieChartCardProps = {
  title: string;
  slices: PieSlice[];
};

export function PieChartCard({ title, slices }: PieChartCardProps) {
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  return (
    <View className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Text className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
      <View className="flex-row items-center gap-4">
        <PieChart data={slices.map((s) => ({ value: s.value, color: s.color }))} radius={70} donut innerRadius={32} />
        <View className="flex-1 gap-1">
          {slices.map((s) => (
            <View key={s.label} className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              <Text className="flex-1 text-xs text-zinc-700 dark:text-zinc-300">{s.label}</Text>
              <Text className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                {((s.value / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
