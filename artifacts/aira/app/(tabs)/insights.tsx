import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
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
import type { ProcessedDayData } from "@/types/health";
import { formatDateShort } from "@/utils/healthUtils";

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

// ── Pattern Detection ─────────────────────────────────────────────────────────

interface Pattern {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  title: string;
  body: string;
}

function detectPatterns(history: ProcessedDayData[]): Pattern[] {
  if (history.length < 7) return [];
  const patterns: Pattern[] = [];

  // 1. Sleep ≥7h → next-day readiness
  const afterGoodSleep = history.slice(1).filter((_, i) => (history[i].metrics.sleepHours ?? 0) >= 7);
  const afterBadSleep  = history.slice(1).filter((_, i) => {
    const h = history[i].metrics.sleepHours;
    return h != null && h < 6.5;
  });
  if (afterGoodSleep.length >= 3 && afterBadSleep.length >= 2) {
    const avgAfterGood = afterGoodSleep.reduce((a, d) => a + d.readiness.score, 0) / afterGoodSleep.length;
    const avgAfterBad  = afterBadSleep.reduce((a, d) => a + d.readiness.score, 0) / afterBadSleep.length;
    const diff = Math.round(avgAfterGood - avgAfterBad);
    if (Math.abs(diff) >= 5) {
      patterns.push({
        icon: "moon",
        color: "#818CF8",
        title: "Sleep drives your recovery",
        body: `Your readiness is ${Math.abs(diff)} pts ${diff > 0 ? "higher" : "lower"} the day after ${diff > 0 ? "7h+ sleep" : "under 6.5h sleep"}. Sleep is your #1 lever.`,
      });
    }
  }

  // 2. High steps → next-day resting HR
  const highStepDays = history.slice(0, -1).filter((d) => d.metrics.steps >= 8000);
  const lowStepDays  = history.slice(0, -1).filter((d) => d.metrics.steps < 5000 && d.metrics.steps > 0);
  if (highStepDays.length >= 3 && lowStepDays.length >= 2) {
    const rhrAfterHigh = highStepDays.map((d, i) => history[history.indexOf(d) + 1]?.metrics.restingHeartRate).filter(Boolean) as number[];
    const rhrAfterLow  = lowStepDays.map((d, i) => history[history.indexOf(d) + 1]?.metrics.restingHeartRate).filter(Boolean) as number[];
    if (rhrAfterHigh.length >= 2 && rhrAfterLow.length >= 2) {
      const avgHigh = rhrAfterHigh.reduce((a, b) => a + b, 0) / rhrAfterHigh.length;
      const avgLow  = rhrAfterLow.reduce((a, b) => a + b, 0) / rhrAfterLow.length;
      const diff = Math.round(avgLow - avgHigh);
      if (diff >= 2) {
        patterns.push({
          icon: "trending-up",
          color: "#34D399",
          title: "Active days lower resting HR",
          body: `On days after 8k+ steps, your resting heart rate is ~${diff} bpm lower. Regular movement is conditioning your heart.`,
        });
      }
    }
  }

  // 3. Day-of-week best readiness
  const byDow: Record<number, number[]> = {};
  for (const d of history) {
    const dow = new Date(d.date + "T00:00:00").getDay();
    if (!byDow[dow]) byDow[dow] = [];
    byDow[dow].push(d.readiness.score);
  }
  const dowAvgs = Object.entries(byDow)
    .filter(([, arr]) => arr.length >= 2)
    .map(([dow, arr]) => ({ dow: Number(dow), avg: arr.reduce((a, b) => a + b, 0) / arr.length }));
  if (dowAvgs.length >= 3) {
    const best = dowAvgs.reduce((a, b) => (b.avg > a.avg ? b : a));
    const worst = dowAvgs.reduce((a, b) => (b.avg < a.avg ? b : a));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (Math.round(best.avg - worst.avg) >= 6) {
      patterns.push({
        icon: "calendar",
        color: "#F59E0B",
        title: `You peak on ${days[best.dow]}s`,
        body: `Average readiness of ${Math.round(best.avg)} on ${days[best.dow]}s vs ${Math.round(worst.avg)} on ${days[worst.dow]}s. Schedule hard efforts on your strong days.`,
      });
    }
  }

  // 4. 7-day trend
  const recent7 = history.slice(-7).map((d) => d.readiness.score);
  if (recent7.length >= 5) {
    const first = recent7.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const last  = recent7.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const delta = Math.round(last - first);
    if (Math.abs(delta) >= 5) {
      patterns.push({
        icon: delta > 0 ? "arrow-up-right" : "arrow-down-right",
        color: delta > 0 ? "#22C55E" : "#EF4444",
        title: delta > 0 ? "Recovery trending up" : "Recovery trending down",
        body: `Your readiness has ${delta > 0 ? "improved" : "dropped"} by ~${Math.abs(delta)} pts over the last week. ${delta > 0 ? "Keep it up!" : "Focus on sleep and stress management."}`,
      });
    }
  }

  // 5. HRV consistency
  const hrvValues = history.map((d) => d.metrics.hrv).filter(Boolean) as number[];
  if (hrvValues.length >= 7) {
    const mean = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length;
    const std = Math.sqrt(hrvValues.map((v) => (v - mean) ** 2).reduce((a, b) => a + b, 0) / hrvValues.length);
    const cv = std / mean;
    if (cv < 0.12) {
      patterns.push({
        icon: "activity",
        color: "#60A5FA",
        title: "Consistent HRV",
        body: `Your HRV variation is low (${Math.round(std * 10) / 10}ms SD) — a sign of stable autonomic health. Your training load is well-balanced.`,
      });
    } else if (cv > 0.25) {
      patterns.push({
        icon: "activity",
        color: "#F59E0B",
        title: "HRV fluctuating",
        body: `High HRV variability (${Math.round(std * 10) / 10}ms SD) suggests inconsistent recovery. Look for lifestyle patterns causing the spikes.`,
      });
    }
  }

  return patterns.slice(0, 4);
}

// ── Insight Row ───────────────────────────────────────────────────────────────

function InsightRow({
  day,
  expanded,
  onToggle,
}: {
  day: ProcessedDayData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const sc = STATUS_COLORS[day.readiness.status];

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.insightRow,
        { backgroundColor: colors.card, borderColor: expanded ? sc + "50" : colors.border },
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
            <Text style={[styles.rowStatus, { color: sc }]}>{day.readiness.status}</Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.rowScore, { color: sc }]}>{day.readiness.score}</Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>
      </View>
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.insightBubble, { backgroundColor: sc + "14" }]}>
            <Text style={[styles.insightText, { color: colors.foreground }]}>
              {day.readiness.insight}
            </Text>
          </View>
          <View style={styles.miniMetrics}>
            {[
              { label: "Sleep", value: day.metrics.sleepHours != null ? `${day.metrics.sleepHours.toFixed(1)}h` : "--", color: "#818CF8" },
              { label: "HR",    value: day.metrics.restingHeartRate != null ? `${day.metrics.restingHeartRate}bpm` : "--", color: "#FF6B6B" },
              { label: "HRV",   value: day.metrics.hrv != null ? `${day.metrics.hrv.toFixed(0)}ms` : "--", color: "#60A5FA" },
              { label: "Steps", value: day.metrics.steps > 0 ? day.metrics.steps.toLocaleString() : "--", color: "#34D399" },
            ].map((m) => (
              <View key={m.label} style={styles.miniMetric}>
                <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                <Text style={[styles.miniValue, { color: m.color }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

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

  const good = history.filter((d) => d.readiness.status === "Good").length;
  const fair = history.filter((d) => d.readiness.status === "Fair").length;
  const low  = history.filter((d) => d.readiness.status === "Low").length;
  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.readiness.score, 0) / history.length)
    : 0;

  const patterns = useMemo(() => detectPatterns(history), [history]);

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
        <Text style={[styles.title, { color: colors.foreground }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>30-day history</Text>
      </View>

      <View style={styles.summaryRow}>
        {[
          { label: "Avg Score", value: avgScore.toString(), color: "#00D4AA" },
          { label: "Good Days", value: good.toString(), color: "#22C55E" },
          { label: "Fair Days", value: fair.toString(), color: "#F59E0B" },
          { label: "Low Days",  value: low.toString(),  color: "#EF4444" },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {patterns.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            PATTERNS DETECTED
          </Text>
          {patterns.map((p, i) => (
            <View
              key={i}
              style={[
                styles.patternCard,
                { backgroundColor: colors.card, borderColor: p.color + "40" },
              ]}
            >
              <View style={[styles.patternIcon, { backgroundColor: p.color + "1A" }]}>
                <Feather name={p.icon} size={16} color={p.color} />
              </View>
              <View style={styles.patternText}>
                <Text style={[styles.patternTitle, { color: colors.foreground }]}>{p.title}</Text>
                <Text style={[styles.patternBody, { color: colors.mutedForeground }]}>{p.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

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
  header: { paddingHorizontal: 24, marginBottom: 16, gap: 2 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryRow: { flexDirection: "row", paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  section: { paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 2 },
  patternCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  patternIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  patternText: { flex: 1, gap: 3 },
  patternTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  patternBody: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  insightRow: { borderRadius: 16, padding: 16, borderWidth: 1 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowMeta: { gap: 2 },
  rowDate: { fontSize: 14, fontFamily: "Inter_500Medium" },
  rowStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowScore: { fontSize: 24, fontFamily: "Inter_700Bold" },
  expandedContent: { marginTop: 12, gap: 12 },
  divider: { height: 1, borderRadius: 1 },
  insightBubble: { borderRadius: 12, padding: 12 },
  insightText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  miniMetrics: { flexDirection: "row", justifyContent: "space-between" },
  miniMetric: { alignItems: "center", gap: 3 },
  miniLabel: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  miniValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
