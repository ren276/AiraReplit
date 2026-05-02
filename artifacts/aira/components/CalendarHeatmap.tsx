import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { ProcessedDayData } from "@/types/health";

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface Props {
  data: ProcessedDayData[];
}

export default function CalendarHeatmap({ data }: Props) {
  const colors = useColors();

  // Build a map of date string → processed day
  const byDate: Record<string, ProcessedDayData> = {};
  for (const d of data) byDate[d.date] = d;

  // Generate last 35 days as a 5×7 grid
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent Sunday (start of the last displayed week column)
  const dayOfWeek = today.getDay(); // 0=Sun
  const gridEnd = new Date(today);
  // Pad to end of week so grid always ends on Saturday
  gridEnd.setDate(gridEnd.getDate() + (6 - dayOfWeek));

  const cells: Array<{ dateStr: string | null; day: ProcessedDayData | null; isFuture: boolean }> = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(gridEnd);
    d.setDate(d.getDate() - i);
    const isFuture = d > today;
    const dateStr = d.toISOString().split("T")[0];
    cells.push({
      dateStr,
      day: byDate[dateStr] ?? null,
      isFuture,
    });
  }

  // Group into rows of 7
  const rows: (typeof cells)[] = [];
  for (let r = 0; r < 5; r++) {
    rows.push(cells.slice(r * 7, r * 7 + 7));
  }

  // Month label for the top
  const firstDay = new Date(gridEnd);
  firstDay.setDate(firstDay.getDate() - 34);
  const startMonth = firstDay.toLocaleDateString("en-US", { month: "short" });
  const endMonth = today.toLocaleDateString("en-US", { month: "short" });
  const monthLabel = startMonth === endMonth ? startMonth : `${startMonth} – ${endMonth}`;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={[styles.monthLabel, { color: colors.mutedForeground }]}>
          {monthLabel}
        </Text>
        <View style={styles.legend}>
          {(["Good", "Fair", "Low"] as const).map((s) => (
            <View key={s} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[s] }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dayRow}>
        {DAY_LABELS.map((l, i) => (
          <Text key={i} style={[styles.dayLabel, { color: colors.mutedForeground }]}>
            {l}
          </Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => {
            const sc = cell.day ? STATUS_COLORS[cell.day.readiness.status] : null;
            const bg = cell.isFuture
              ? "transparent"
              : sc
                ? sc + "33"
                : colors.border;
            const border = sc ?? (cell.isFuture ? "transparent" : colors.border);
            return (
              <View
                key={ci}
                style={[
                  styles.cell,
                  { backgroundColor: bg, borderColor: border },
                ]}
              >
                {cell.day && !cell.isFuture ? (
                  <View style={[styles.cellDot, { backgroundColor: sc! }]} />
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL = 36;
const GAP = 5;

const styles = StyleSheet.create({
  container: { gap: GAP },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  monthLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  legend: { flexDirection: "row", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  dayRow: { flexDirection: "row", gap: GAP },
  dayLabel: { width: CELL, textAlign: "center", fontSize: 10, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", gap: GAP },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellDot: { width: 6, height: 6, borderRadius: 3 },
});
