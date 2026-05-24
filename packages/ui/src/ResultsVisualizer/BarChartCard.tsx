// Wrapper around react-native-gifted-charts BarChart with a title +
// optional baseline overlay (e.g. uniform-baseline line).

import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export type BarDatum = { label: string; value: number; topLabel?: string };

export type BarChartCardProps = {
  title: string;
  data: BarDatum[];
  /** Optional reference line (e.g. uniform baseline). */
  reference?: { value: number; label: string };
  height?: number;
  barColor?: string;
};

export function BarChartCard({ title, data, reference, height = 220, barColor = "#3b82f6" }: BarChartCardProps) {
  const charted = data.map((d) => ({
    value: d.value,
    label: d.label,
    topLabelComponent: d.topLabel
      ? () => (
          <Text className="text-[10px] text-zinc-600 dark:text-zinc-400">{d.topLabel}</Text>
        )
      : undefined,
    frontColor: barColor,
  }));
  return (
    <View className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Text className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
      {reference ? (
        <Text className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
          baseline: {reference.label} = {reference.value.toFixed(2)}
        </Text>
      ) : null}
      <BarChart
        data={charted}
        height={height}
        barWidth={Math.max(6, Math.floor(280 / Math.max(data.length, 1)))}
        spacing={2}
        showReferenceLine1={!!reference}
        referenceLine1Position={reference?.value}
        referenceLine1Config={{ color: "#f59e0b", dashWidth: 3, dashGap: 4 }}
        xAxisLabelTextStyle={{ fontSize: 9, color: "#71717a" }}
        yAxisTextStyle={{ fontSize: 10, color: "#71717a" }}
        noOfSections={4}
        rulesColor="#e4e4e7"
      />
    </View>
  );
}
