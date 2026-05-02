import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InsightCard from "@/components/InsightCard";
import MetricCard from "@/components/MetricCard";
import ReadinessRing from "@/components/ReadinessRing";
import { useHealth } from "@/context/HealthContext";
import { useColors } from "@/hooks/useColors";

function SkeletonBox({ height = 80, width = "100%" as any, borderRadius = 16 }) {
  return (
    <View
      style={{
        height,
        width,
        borderRadius,
        backgroundColor: "#141926",
      }}
    />
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const { today, isLoading, isDemoMode, refresh } = useHealth();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (isLoading && !today) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 24, gap: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <SkeletonBox height={24} width="60%" />
        <SkeletonBox height={36} width="80%" />
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <SkeletonBox height={220} width={220} borderRadius={110} />
        </View>
        <SkeletonBox height={100} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <SkeletonBox height={100} width="48%" />
          <SkeletonBox height={100} width="48%" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: 120 + bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {isDemoMode && (
        <TouchableOpacity
          style={styles.demoBanner}
          onPress={refresh}
          activeOpacity={0.7}
        >
          <Feather name="wifi-off" size={13} color="#F59E0B" />
          <Text style={styles.demoText}>
            Demo Mode — Tap to sync real health data
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {dateLabel}
        </Text>
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          {greeting}
        </Text>
      </View>

      <View style={styles.ringWrap}>
        {today && (
          <>
            <ReadinessRing
              score={today.readiness.score}
              status={today.readiness.status}
            />
            <Text style={[styles.ringCaption, { color: colors.mutedForeground }]}>
              {today.readiness.status === "Good"
                ? "Your body is ready to perform"
                : today.readiness.status === "Fair"
                  ? "Moderate recovery — pace yourself"
                  : "Your body is asking for rest"}
            </Text>
          </>
        )}
      </View>

      {today && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              TODAY'S INSIGHT
            </Text>
            <InsightCard
              insight={today.readiness.insight}
              readinessStatus={today.readiness.status}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              RECOVERY BREAKDOWN
            </Text>
            <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                {
                  label: "HRV",
                  score: today.readiness.breakdown.hrv,
                  color: "#60A5FA",
                  icon: "activity" as const,
                },
                {
                  label: "Resting HR",
                  score: today.readiness.breakdown.rhr,
                  color: "#FF6B6B",
                  icon: "heart" as const,
                },
                {
                  label: "Sleep",
                  score: today.readiness.breakdown.sleep,
                  color: "#818CF8",
                  icon: "moon" as const,
                },
              ].map((item) => (
                <View key={item.label} style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <Feather name={item.icon} size={14} color={item.color} />
                    <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.breakdownRight}>
                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${item.score}%` as any, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.breakdownScore, { color: item.color }]}>
                      {item.score}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              TODAY'S METRICS
            </Text>
            <View style={styles.row}>
              <MetricCard
                icon="moon"
                label="Sleep"
                value={today.metrics.sleepHours?.toFixed(1) ?? "--"}
                unit="hrs"
                color="#818CF8"
                subtitle={
                  today.metrics.sleepQuality != null
                    ? `${today.metrics.sleepQuality}% quality`
                    : undefined
                }
              />
              <MetricCard
                icon="heart"
                label="Resting HR"
                value={today.metrics.restingHeartRate?.toString() ?? "--"}
                unit="bpm"
                color="#FF6B6B"
              />
            </View>
            <View style={styles.row}>
              <MetricCard
                icon="activity"
                label="HRV"
                value={today.metrics.hrv?.toFixed(0) ?? "--"}
                unit="ms"
                color="#60A5FA"
              />
              <MetricCard
                icon="trending-up"
                label="Steps"
                value={today.metrics.steps > 0 ? today.metrics.steps.toLocaleString() : "--"}
                unit=""
                color="#34D399"
                subtitle="steps today"
              />
            </View>
            {(today.metrics.deepSleepMinutes != null || today.metrics.remSleepMinutes != null) && (
              <View style={styles.row}>
                <MetricCard
                  icon="moon"
                  label="Deep Sleep"
                  value={today.metrics.deepSleepMinutes?.toString() ?? "--"}
                  unit="min"
                  color="#6366F1"
                />
                <MetricCard
                  icon="eye"
                  label="REM Sleep"
                  value={today.metrics.remSleepMinutes?.toString() ?? "--"}
                  unit="min"
                  color="#A78BFA"
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F59E0B18",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F59E0B30",
  },
  demoText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#F59E0B",
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 36,
    marginTop: 2,
  },
  ringWrap: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  ringCaption: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 90,
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  breakdownRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  breakdownScore: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    width: 28,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
