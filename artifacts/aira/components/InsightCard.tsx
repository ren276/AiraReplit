import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

interface Props {
  insight: string;
  readinessStatus: "Good" | "Fair" | "Low";
}

export default function InsightCard({ insight, readinessStatus }: Props) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[readinessStatus];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: statusColor + "40",
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: statusColor + "22" }]}>
          <Feather name="zap" size={15} color={statusColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            AI Insight
          </Text>
          <Text style={[styles.powered, { color: colors.mutedForeground }]}>
            Powered by Gemini
          </Text>
        </View>
      </View>
      <Text style={[styles.insight, { color: colors.foreground }]}>
        {insight}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    gap: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  powered: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  insight: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
