// Slider — single-value continuous range.
// Web uses native <input type="range"> via react-native-web View (rendered
// as a div). Native gets a number input fallback for v1.

import { Platform, Text, View } from "react-native";

import { NumberInput } from "./NumberInput.tsx";

export type SliderProps = {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel?: string;
};

export function Slider({ value, onChange, min, max, step = 1, ariaLabel }: SliderProps) {
  if (Platform.OS === "web") {
    return (
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          {/* @ts-expect-error react-native-web allows native DOM elements via JSX. */}
          <input
            type="range"
            aria-label={ariaLabel}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e: { target: { value: string } }) => onChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#3b82f6" }}
          />
        </View>
        <View className="min-w-[64px]">
          <Text className="text-right text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
            {step < 1 ? value.toFixed(3) : value}
          </Text>
        </View>
      </View>
    );
  }
  return <NumberInput value={value} onChange={onChange} min={min} max={max} step={step} ariaLabel={ariaLabel} />;
}
