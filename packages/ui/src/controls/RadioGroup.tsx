// Radio group is a vertical-layout variant of SegmentedControl for cases
// with longer labels.

import { Pressable, Text, View } from "react-native";

export type RadioGroupProps<T extends string> = {
  options: Array<{ value: T; label: string; description?: string }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
};

export function RadioGroup<T extends string>({ options, value, onChange, ariaLabel }: RadioGroupProps<T>) {
  return (
    <View accessibilityLabel={ariaLabel} className="gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            className={
              "rounded-md border p-3 " +
              (on
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900")
            }
          >
            <View className="flex-row items-start gap-2">
              <View
                className={
                  "mt-0.5 h-4 w-4 rounded-full border-2 " +
                  (on ? "border-blue-600 bg-blue-600" : "border-zinc-400 dark:border-zinc-600")
                }
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{o.label}</Text>
                {o.description ? (
                  <Text className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{o.description}</Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
