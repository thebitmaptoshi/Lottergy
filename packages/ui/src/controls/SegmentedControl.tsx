import { Pressable, Text, View } from "react-native";

export type SegmentedControlProps<T extends string> = {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityLabel={ariaLabel}
      className="flex-row overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700"
    >
      {options.map((o, idx) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            className={
              "flex-1 px-4 py-2 " +
              (on ? "bg-blue-600" : "bg-white dark:bg-zinc-900") +
              (idx > 0 ? " border-l border-zinc-300 dark:border-zinc-700" : "")
            }
          >
            <Text
              className={
                "text-center text-sm font-semibold " +
                (on ? "text-white" : "text-zinc-700 dark:text-zinc-200")
              }
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
