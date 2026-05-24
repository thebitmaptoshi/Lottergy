import { Pressable, Text, View } from "react-native";

export type CheckboxSetProps = {
  options: number[];
  selected: number[];
  onChange: (next: number[]) => void;
  ariaLabel?: string;
};

export function CheckboxSet({ options, selected, onChange, ariaLabel }: CheckboxSetProps) {
  const isOn = (n: number) => selected.includes(n);
  const toggle = (n: number) => {
    if (isOn(n)) onChange(selected.filter((x) => x !== n));
    else onChange([...selected, n].sort((a, b) => a - b));
  };
  return (
    <View accessibilityLabel={ariaLabel} className="flex-row flex-wrap gap-2">
      {options.map((o) => {
        const on = isOn(o);
        return (
          <Pressable
            key={o}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => toggle(o)}
            className={
              "h-10 min-w-[44px] items-center justify-center rounded-md border px-3 " +
              (on
                ? "border-blue-600 bg-blue-600"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900")
            }
          >
            <Text
              className={
                "text-sm font-semibold " +
                (on ? "text-white" : "text-zinc-700 dark:text-zinc-200")
              }
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
