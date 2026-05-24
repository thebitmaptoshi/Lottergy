// InfoBubble — the "i" affordance used on every adjustable parameter
// (binding requirement per GOAL.md and CLAUDE.md).
//
// Implementation note: we use an inline expandable card (accordion-style)
// rather than a floating tooltip popup because tooltips don't translate
// cleanly to touch + screen readers. The disclosure pattern is accessible
// and works identically on web + native.

import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type InfoBubbleProps = {
  title: string;
  /** Markdown (bold/italic only). Rendered as plain text for v1; markdown
   *  parsing is a small follow-up. The asterisk characters render literally. */
  body: string;
  className?: string;
};

export function InfoBubble({ title, body, className }: InfoBubbleProps) {
  const [open, setOpen] = useState(false);
  return (
    <View className={className}>
      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`More info about ${title}`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          className="h-5 w-5 items-center justify-center rounded-full border border-zinc-400 dark:border-zinc-500"
        >
          <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">i</Text>
        </Pressable>
      </View>
      {open && (
        <View className="mt-2 rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
          <Text className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{body}</Text>
        </View>
      )}
    </View>
  );
}
