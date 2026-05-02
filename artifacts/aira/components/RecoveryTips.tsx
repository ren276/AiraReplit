import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { ProcessedDayData } from "@/types/health";

interface Tip {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  color: string;
}

function buildTips(day: ProcessedDayData): Tip[] {
  const tips: Tip[] = [];
  const { score, status, breakdown } = day.readiness;
  const { hrv, restingHeartRate, sleepHours, steps } = day.metrics;

  if (status === "Good") {
    tips.push({
      icon: "zap",
      title: "Push Today",
      body: "Your readiness is high — great day for a hard workout or demanding tasks.",
      color: "#22C55E",
    });
    if (steps < 6000) {
      tips.push({
        icon: "trending-up",
        title: "Move More",
        body: "You're recovered well. Aim for 8,000+ steps to build on this momentum.",
        color: "#34D399",
      });
    } else {
      tips.push({
        icon: "shield",
        title: "Protect the Streak",
        body: "Prioritize sleep tonight to carry this recovery into tomorrow.",
        color: "#818CF8",
      });
    }
    tips.push({
      icon: "sun",
      title: "Stay Hydrated",
      body: "High-performance days demand more water. Aim for 2.5–3L today.",
      color: "#F59E0B",
    });
    return tips;
  }

  if (status === "Low") {
    tips.push({
      icon: "moon",
      title: "Rest is Productive",
      body: "Skip intense exercise today. A walk or light stretching is ideal.",
      color: "#EF4444",
    });
    tips.push({
      icon: "clock",
      title: "Prioritize Sleep",
      body: "Aim for 7–9 hours tonight. Consistent bed-time rebuilds HRV quickly.",
      color: "#818CF8",
    });
    tips.push({
      icon: "coffee",
      title: "Limit Stimulants",
      body: "Cut caffeine after 2pm and avoid alcohol — both suppress deep sleep.",
      color: "#F59E0B",
    });
    return tips;
  }

  // Fair — context-specific
  const weakest = breakdown.hrv <= breakdown.rhr && breakdown.hrv <= breakdown.sleep
    ? "hrv"
    : breakdown.rhr <= breakdown.sleep
      ? "rhr"
      : "sleep";

  if (weakest === "hrv") {
    tips.push({
      icon: "activity",
      title: "HRV Recovery",
      body: "Lower HRV today — opt for moderate intensity. Breathing exercises can help.",
      color: "#60A5FA",
    });
  } else if (weakest === "rhr") {
    tips.push({
      icon: "heart",
      title: "Elevated Heart Rate",
      body: "Resting HR is higher than usual. Consider reducing training intensity today.",
      color: "#FF6B6B",
    });
  } else {
    tips.push({
      icon: "moon",
      title: "Sleep Debt",
      body: "You're carrying some sleep debt. An extra 30 min tonight will help a lot.",
      color: "#818CF8",
    });
  }

  if ((sleepHours ?? 0) < 6.5) {
    tips.push({
      icon: "clock",
      title: "Earlier Bedtime",
      body: "Getting under 6.5h is limiting your recovery. Try sleeping 30 min earlier.",
      color: "#A78BFA",
    });
  } else {
    tips.push({
      icon: "droplet",
      title: "Hydrate Well",
      body: "Even mild dehydration raises resting heart rate. Start with water before coffee.",
      color: "#34D399",
    });
  }

  tips.push({
    icon: "zap",
    title: "Moderate Effort",
    body: "Zone 2 cardio (conversational pace) today will recover you faster than rest alone.",
    color: "#F59E0B",
  });

  return tips;
}

export default function RecoveryTips({ day }: { day: ProcessedDayData }) {
  const colors = useColors();
  const tips = buildTips(day);

  return (
    <View style={styles.container}>
      {tips.map((tip, i) => (
        <View
          key={i}
          style={[styles.card, { backgroundColor: colors.card, borderColor: tip.color + "40" }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: tip.color + "1A" }]}>
            <Feather name={tip.icon} size={16} color={tip.color} />
          </View>
          <View style={styles.text}>
            <Text style={[styles.title, { color: colors.foreground }]}>{tip.title}</Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>{tip.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  text: { flex: 1, gap: 3 },
  title: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  body: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
