import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalendarHeatmap from "@/components/CalendarHeatmap";
import SimpleChart from "@/components/SimpleChart";
import { useHealth } from "@/context/HealthContext";
import { useColors } from "@/hooks/useColors";
import type { ProcessedDayData } from "@/types/health";

type MetricKey = "readiness" | "sleep" | "heartRate" | "steps" | "hrv";

const METRICS: {
  key: MetricKey;
  label: string;
  color: string;
  unit: string;
  getValue: (d: ProcessedDayData) => number;
  format: (v: number) => string;
}[] = [
  {
    key: "readiness",
    label: "Readiness",
    color: "#00D4AA",
    unit: "score",
    getValue: (d) => d.readiness.score,
    format: (v) => Math.round(v).toString(),
  },
  {
    key: "sleep",
    label: "Sleep",
    color: "#818CF8",
    unit: "hrs",
    getValue: (d) => d.metrics.sleepHours ?? 0,
    format: (v) => v.toFixed(1),
  },
  {
    key: "heartRate",
    label: "Heart Rate",
    color: "#FF6B6B",
    unit: "bpm",
    getValue: (d) => d.metrics.restingHeartRate ?? 0,
    format: (v) => Math.round(v).toString(),
  },
  {
    key: "steps",
    label: "Steps",
    color: "#34D399",
    unit: "steps",
    getValue: (d) => d.metrics.steps,
    format: (v) => Math.round(v).toLocaleString(),
  },
  {
    key: "hrv",
    label: "HRV",
    color: "#60A5FA",
    unit: "ms",
    getValue: (d) => d.metrics.hrv ?? 0,
    format: (v) => Math.round(v).toString(),
  },
];

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

export default function TrendsScreen() {
  const colors = useColors();
  const { last7Days, history } = useHealth();
  const [selected, setSelected] = useState<MetricKey>("readiness");
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const chartWidth = width - 48 - 32;

  const metric = METRICS.find((m) => m.key === selected)!;
  const data = last7Days.map(metric.getValue);
  const labels = last7Days.map((d) => {
    const date = new Date(d.date + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
  });

  const validData = data.filter((v) => v > 0);
  const avg = validData.length ? validData.reduce((a, b) => a + b, 0) / validData.length : 0;
  const min = validData.length ? Math.min(...validData) : 0;
  const max = validData.length ? Math.max(...validData) : 0;

  // Trend direction for selected metric over 7 days
  const trendDir =
    validData.length >= 3
      ? validData[validData.length - 1] > validData[0]
        ? "up"
        : validData[validData.length - 1] < validData[0]
          ? "down"
          : "flat"
      : "flat";

  const trendLabel =
    trendDir === "up" ? "Improving" : trendDir === "down" ? "Declining" : "Stable";
  const trendColor =
    selected === "heartRate"
      ? trendDir === "up" ? "#EF4444" : "#22C55E"
      : trendDir === "up" ? "#22C55E" : trendDir === "down" ? "#EF4444" : "#6B7A99";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: 120 + bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trends</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Last 7 days
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        {METRICS.map((m) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setSelected(m.key)}
            style={[
              styles.pill,
              {
                backgroundColor: selected === m.key ? m.color + "22" : colors.card,
                borderColor: selected === m.key ? m.color : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: selected === m.key ? m.color : colors.mutedForeground,
                  fontFamily: selected === m.key ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            {metric.label}{" "}
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              ({metric.unit})
            </Text>
          </Text>
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trendColor + "22", borderColor: trendColor + "44" },
            ]}
          >
            <Text style={[styles.trendText, { color: trendColor }]}>{trendLabel}</Text>
          </View>
        </View>
        <SimpleChart
          data={data}
          labels={labels}
          color={metric.color}
          width={chartWidth}
          height={140}
        />
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "AVG", value: avg > 0 ? metric.format(avg) : "--" },
          { label: "MIN", value: min > 0 ? metric.format(min) : "--" },
          { label: "MAX", value: max > 0 ? metric.format(max) : "--" },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            <Text style={[styles.statValue, { color: metric.color }]}>{s.value}</Text>
            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>{metric.unit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          30-DAY CALENDAR
        </Text>
        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CalendarHeatmap data={history} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          READINESS HISTORY
        </Text>
        {history
          .slice(-14)
          .slice()
          .reverse()
          .map((day) => {
            const sc = STATUS_COLORS[day.readiness.status];
            const date = new Date(day.date + "T00:00:00");
            const label = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return (
              <View
                key={day.date}
                style={[
                  styles.historyItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyDate, { color: colors.foreground }]}>
                    {label}
                  </Text>
                  <Text style={[styles.historyStatus, { color: sc }]}>
                    {day.readiness.status}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyScore, { color: sc }]}>
                    {day.readiness.score}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${day.readiness.score}%` as any, backgroundColor: sc },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 24, marginBottom: 16, gap: 2 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  pills: { paddingHorizontal: 24, gap: 8, marginBottom: 16 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, borderWidth: 1 },
  pillText: { fontSize: 13 },
  chartCard: { marginHorizontal: 24, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  chartTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  trendText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 3 },
  statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 2 },
  calCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  historyItem: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyLeft: { gap: 3 },
  historyDate: { fontSize: 14, fontFamily: "Inter_500Medium" },
  historyStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  historyRight: { alignItems: "flex-end", gap: 6, minWidth: 80 },
  historyScore: { fontSize: 22, fontFamily: "Inter_700Bold" },
  barTrack: { width: 70, height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
});
