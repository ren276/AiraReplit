import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InsightCard from "@/components/InsightCard";
import MetricCard from "@/components/MetricCard";
import ReadinessRing from "@/components/ReadinessRing";
import { useHealth } from "@/context/HealthContext";
import { useColors } from "@/hooks/useColors";

export default function TodayScreen() {
  const colors = useColors();
  const { today } = useHealth();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good Morning"
      : greetingHour < 17
        ? "Good Afternoon"
        : "Good Evening";

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
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {dateLabel}
        </Text>
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          {greeting}
        </Text>
      </View>

      <View style={styles.ringWrap}>
        <ReadinessRing
          score={today.readinessScore}
          status={today.readinessStatus}
        />
        <Text style={[styles.ringSubtitle, { color: colors.mutedForeground }]}>
          Your body is{" "}
          {today.readinessStatus === "Good"
            ? "ready to perform"
            : today.readinessStatus === "Fair"
              ? "moderately recovered"
              : "asking for rest"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TODAY'S INSIGHT
        </Text>
        <InsightCard
          insight={today.insight}
          readinessStatus={today.readinessStatus}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TODAY'S METRICS
        </Text>
        <View style={styles.row}>
          <MetricCard
            icon="moon"
            label="Sleep"
            value={today.sleepHours.toString()}
            unit="hrs"
            color="#818CF8"
            subtitle={`${today.sleepQuality}% quality`}
          />
          <MetricCard
            icon="heart"
            label="Resting HR"
            value={today.restingHeartRate.toString()}
            unit="bpm"
            color="#FF6B6B"
          />
        </View>
        <View style={styles.row}>
          <MetricCard
            icon="activity"
            label="HRV"
            value={today.hrv.toString()}
            unit="ms"
            color="#60A5FA"
          />
          <MetricCard
            icon="trending-up"
            label="Steps"
            value={today.steps.toLocaleString()}
            unit=""
            color="#34D399"
            subtitle="steps today"
          />
        </View>
        <View style={styles.row}>
          <MetricCard
            icon="wind"
            label="Stress"
            value={today.stressScore.toString()}
            unit="/100"
            color="#F472B6"
            subtitle={
              today.stressScore < 35
                ? "Low stress"
                : today.stressScore < 65
                  ? "Moderate"
                  : "High stress"
            }
          />
          <MetricCard
            icon="sun"
            label="Sleep Quality"
            value={today.sleepQuality.toString()}
            unit="%"
            color="#FBBF24"
            subtitle={
              today.sleepQuality >= 75
                ? "Excellent"
                : today.sleepQuality >= 55
                  ? "Good"
                  : "Poor"
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
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
    gap: 8,
  },
  ringSubtitle: {
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
