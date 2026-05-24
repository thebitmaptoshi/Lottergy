// DualRangeSlider — two-handle [low, high] range. Used for the locked
// `frequencyPercentileRange` control AND the sum/decadeSpan {min, max}
// controls. v1 implementation uses two native range inputs (web) /
// two number inputs (native) so we don't pull in a heavier RN slider lib.

import { Platform, Text, View } from "react-native";

import { NumberInput } from "./NumberInput.tsx";

export type DualRangeSliderProps = {
  low: number;
  high: number;
  onChange: (range: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel?: string;
};

export function DualRangeSlider({
  low,
  high,
  onChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: DualRangeSliderProps) {
  const setLow = (n: number) => onChange([Math.min(n, high), high]);
  const setHigh = (n: number) => onChange([low, Math.max(n, low)]);

  if (Platform.OS === "web") {
    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-3">
          <Text className="w-8 text-xs text-zinc-600 dark:text-zinc-400">low</Text>
          <View className="flex-1">
            {/* @ts-expect-error native DOM via react-native-web */}
            <input
              type="range"
              aria-label={`${ariaLabel ?? ""} low`}
              min={min}
              max={max}
              step={step}
              value={low}
              onChange={(e: { target: { value: string } }) => setLow(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#3b82f6" }}
            />
          </View>
          <Text className="min-w-[48px] text-right text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
            {step < 1 ? low.toFixed(3) : low}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-8 text-xs text-zinc-600 dark:text-zinc-400">high</Text>
          <View className="flex-1">
            {/* @ts-expect-error native DOM via react-native-web */}
            <input
              type="range"
              aria-label={`${ariaLabel ?? ""} high`}
              min={min}
              max={max}
              step={step}
              value={high}
              onChange={(e: { target: { value: string } }) => setHigh(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#3b82f6" }}
            />
          </View>
          <Text className="min-w-[48px] text-right text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
            {step < 1 ? high.toFixed(3) : high}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-3">
        <Text className="w-12 text-xs text-zinc-600 dark:text-zinc-400">low</Text>
        <View className="flex-1">
          <NumberInput value={low} onChange={setLow} min={min} max={max} step={step} />
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <Text className="w-12 text-xs text-zinc-600 dark:text-zinc-400">high</Text>
        <View className="flex-1">
          <NumberInput value={high} onChange={setHigh} min={min} max={max} step={step} />
        </View>
      </View>
    </View>
  );
}
