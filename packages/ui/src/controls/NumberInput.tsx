import { TextInput, View } from "react-native";

export type NumberInputProps = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
};

export function NumberInput({ value, onChange, min, max, step = 1, ariaLabel }: NumberInputProps) {
  return (
    <View className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
      <TextInput
        accessibilityLabel={ariaLabel}
        keyboardType="numeric"
        inputMode="numeric"
        value={Number.isFinite(value) ? String(value) : ""}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9.\-]/g, "");
          if (cleaned === "" || cleaned === "-" || cleaned === ".") {
            onChange(0);
            return;
          }
          const n = Number.parseFloat(cleaned);
          if (!Number.isFinite(n)) return;
          let clamped = n;
          if (typeof min === "number") clamped = Math.max(min, clamped);
          if (typeof max === "number") clamped = Math.min(max, clamped);
          if (step >= 1) clamped = Math.round(clamped);
          onChange(clamped);
        }}
        className="text-base text-zinc-900 dark:text-zinc-100"
      />
    </View>
  );
}
