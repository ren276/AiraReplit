import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHealth } from "@/context/HealthContext";
import { useColors } from "@/hooks/useColors";
import { DailyHealthData, formatDateShort } from "@/utils/healthUtils";

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

function InsightRow({
  day,
  expanded,
  onToggle,
}: {
  day: DailyHealthData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const sc = STATUS_COLORS[day.readinessStatus];

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.insightRow,
        {
          backgroundColor: colors.card,
          borderColor: expanded ? sc + "50" : colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <View style={[styles.dot, { backgroundColor: sc }]} />
          <View style={styles.rowMeta}>
            <Text style={[styles.rowDate, { color: colors.foreground }]}>
              {formatDateShort(day.date)}
            </Text>
            <Text style={[styles.rowStatus, { color: sc }]}>
              {day.readinessStatus}
            </Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.rowScore, { color: sc }]}>
            {day.readinessScore}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>
      </View>
      {expanded ? (
        <View style={styles.expandedContent}>
          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />
          <View style={[styles.insightBubble, { backgroundColor: sc + "14" }]}>
            <Text style={[styles.insightText, { color: colors.foreground }]}>
              {day.insight}
            </Text>
          </View>
          <View style={styles.miniMetrics}>
            {[
              { label: "Sleep", value: `${day.sleepHours}h`, color: "#818CF8" },
              {
                label: "HR",
                value: `${day.restingHeartRate}bpm`,
                color: "#FF6B6B",
              },
              { label: "HRV", value: `${day.hrv}ms`, color: "#60A5FA" },
              {
                label: "Steps",
                value: day.steps.toLocaleString(),
                color: "#34D399",
              },
            ].map((m) => (
              <View key={m.label} style={styles.miniMetric}>
                <Text
                  style={[
                    styles.miniLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {m.label}
                </Text>
                <Text style={[styles.miniValue, { color: m.color }]}>
                  {m.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function InsightsScreen() {
  const colors = useColors();
  const { history } = useHealth();
  const insets = useSafeAreaInsets();
  const [expandedDate, setExpandedDate] = useState<string | null>(
    history[history.length - 1]?.date ?? null
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const recent = history.slice(-21).slice().reverse();

  const good = history.filter((d) => d.readinessStatus === "Good").length;
  const fair = history.filter((d) => d.readinessStatus === "Fair").length;
  const low = history.filter((d) => d.readinessStatus === "Low").length;
  const avgScore = Math.round(
    history.reduce((a, b) => a + b.readinessScore, 0) / history.length
  );

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
        <Text style={[styles.title, { color: colors.foreground }]}>
          Insights
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          30-day history
        </Text>
      </View>

      <View style={styles.summaryRow}>
        {[
          { label: "Avg Score", value: avgScore.toString(), color: "#00D4AA" },
          { label: "Good Days", value: good.toString(), color: "#22C55E" },
          { label: "Fair Days", value: fair.toString(), color: "#F59E0B" },
          { label: "Low Days", value: low.toString(), color: "#EF4444" },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          DAILY INSIGHTS
        </Text>
        {recent.map((day) => (
          <InsightRow
            key={day.date}
            day={day}
            expanded={expandedDate === day.date}
            onToggle={() =>
              setExpandedDate(expandedDate === day.date ? null : day.date)
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 2,
  },
  insightRow: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowMeta: {
    gap: 2,
  },
  rowDate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowStatus: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowScore: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  expandedContent: {
    marginTop: 12,
    gap: 12,
  },
  divider: {
    height: 1,
    borderRadius: 1,
  },
  insightBubble: {
    borderRadius: 12,
    padding: 12,
  },
  insightText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  miniMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniMetric: {
    alignItems: "center",
    gap: 3,
  },
  miniLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  miniValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
