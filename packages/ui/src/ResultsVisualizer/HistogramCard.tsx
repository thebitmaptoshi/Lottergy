// Histogram = BarChart with bucketed continuous data. Adds an optional
// config-range overlay (two dashed reference lines for sum.min and sum.max).

import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export type HistogramCardProps = {
  title: string;
  /** Pre-bucketed: each datum is {label: bucket label, value: count} */
  data: Array<{ label: string; value: number }>;
  range?: { min: number; max: number; minLabel?: string; maxLabel?: string };
  height?: number;
};

export function HistogramCard({ title, data, range, height = 200 }: HistogramCardProps) {
  return (
    <View className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Text className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
      {range ? (
        <Text className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
          config range: {range.min} – {range.max}
        </Text>
      ) : null}
      <BarChart
        data={data.map((d) => ({ value: d.value, label: d.label, frontColor: "#10b981" }))}
        height={height}
        barWidth={Math.max(6, Math.floor(280 / Math.max(data.length, 1)))}
        spacing={1}
        xAxisLabelTextStyle={{ fontSize: 9, color: "#71717a" }}
        yAxisTextStyle={{ fontSize: 10, color: "#71717a" }}
        noOfSections={4}
        rulesColor="#e4e4e7"
      />
    </View>
  );
}
