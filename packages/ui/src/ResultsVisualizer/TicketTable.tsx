// Sortable table of generated tickets with per-ticket feature columns.
// Sort by clicking a column header.

import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export type TicketRow = {
  whites: number[];
  red: number;
  sum: number;
  oddCount: number;
  lowCount: number;
  consecutivePairs: number;
  decadeSpan: number;
};

type SortKey = "sum" | "oddCount" | "lowCount" | "consecutivePairs" | "decadeSpan";

export type TicketTableProps = {
  rows: TicketRow[];
  title?: string;
};

export function TicketTable({ rows, title = "Generated tickets" }: TicketTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const arr = rows.slice();
    arr.sort((a, b) => (a[sortKey] - b[sortKey]) * (asc ? 1 : -1));
    return arr;
  }, [rows, sortKey, asc]);

  const toggle = (k: SortKey) => {
    if (sortKey === k) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(true);
    }
  };

  const arrow = (k: SortKey) => (sortKey === k ? (asc ? " ↑" : " ↓") : "");

  return (
    <View className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Text className="border-b border-zinc-200 px-4 py-3 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
        {title}
      </Text>
      <ScrollView horizontal>
        <View>
          <View className="flex-row border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Th width={48}>#</Th>
            <Th width={180}>Whites + Red</Th>
            <Th width={70} onPress={() => toggle("sum")}>
              Sum{arrow("sum")}
            </Th>
            <Th width={70} onPress={() => toggle("oddCount")}>
              Odd{arrow("oddCount")}
            </Th>
            <Th width={70} onPress={() => toggle("lowCount")}>
              Low{arrow("lowCount")}
            </Th>
            <Th width={80} onPress={() => toggle("consecutivePairs")}>
              Consec{arrow("consecutivePairs")}
            </Th>
            <Th width={80} onPress={() => toggle("decadeSpan")}>
              Decades{arrow("decadeSpan")}
            </Th>
          </View>
          {sorted.map((r, i) => (
            <View
              key={`${r.whites.join(",")}|${r.red}`}
              className={
                "flex-row border-b border-zinc-100 dark:border-zinc-900 " +
                (i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50 dark:bg-zinc-900")
              }
            >
              <Td width={48}>{i + 1}</Td>
              <Td width={180} mono>
                {r.whites.map((n) => String(n).padStart(2, "0")).join("-")}
                {" — PB "}
                {String(r.red).padStart(2, "0")}
              </Td>
              <Td width={70} mono>
                {r.sum}
              </Td>
              <Td width={70}>{r.oddCount}</Td>
              <Td width={70}>{r.lowCount}</Td>
              <Td width={80}>{r.consecutivePairs}</Td>
              <Td width={80}>{r.decadeSpan}</Td>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Th({
  children,
  width,
  onPress,
}: {
  children: React.ReactNode;
  width: number;
  onPress?: () => void;
}) {
  const inner = (
    <Text className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{children}</Text>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ width }} className="px-3 py-2">
      {inner}
    </Pressable>
  ) : (
    <View style={{ width }} className="px-3 py-2">
      {inner}
    </View>
  );
}

function Td({
  children,
  width,
  mono = false,
}: {
  children: React.ReactNode;
  width: number;
  mono?: boolean;
}) {
  return (
    <View style={{ width }} className="px-3 py-2">
      <Text className={"text-xs text-zinc-800 dark:text-zinc-200 " + (mono ? "font-mono" : "")}>
        {children}
      </Text>
    </View>
  );
}
