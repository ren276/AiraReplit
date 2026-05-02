import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

const PERMISSIONS = [
  {
    icon: "moon" as const,
    color: "#818CF8",
    label: "Sleep Data",
    description: "Duration, stages (deep, REM, light), and efficiency",
    why: "Used to calculate 35% of your readiness score",
  },
  {
    icon: "activity" as const,
    color: "#60A5FA",
    label: "Heart Rate Variability",
    description: "SDNN from overnight readings",
    why: "The most sensitive indicator of nervous system recovery",
  },
  {
    icon: "heart" as const,
    color: "#FF6B6B",
    label: "Resting Heart Rate",
    description: "Morning and overnight HR readings",
    why: "Elevations signal fatigue, illness, or overtraining",
  },
  {
    icon: "trending-up" as const,
    color: "#34D399",
    label: "Steps & Activity",
    description: "Daily step count and movement",
    why: "Balances recovery against daily strain",
  },
];

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color="#6B7A99" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <View style={styles.shieldWrap}>
            <Feather name="shield" size={28} color="#00D4AA" />
          </View>
          <Text style={styles.title}>Connect Your{"\n"}Health Data</Text>
          <Text style={styles.subtitle}>
            AIRA reads from Android Health Connect or Apple Health to calculate
            your daily readiness. Your data stays on your device.
          </Text>
        </View>

        <View style={styles.permsList}>
          {PERMISSIONS.map((p, i) => (
            <View key={i} style={styles.permRow}>
              <View style={[styles.permIcon, { backgroundColor: p.color + "18" }]}>
                <Feather name={p.icon} size={20} color={p.color} />
              </View>
              <View style={styles.permText}>
                <Text style={styles.permLabel}>{p.label}</Text>
                <Text style={styles.permDesc}>{p.description}</Text>
                <Text style={styles.permWhy}>{p.why}</Text>
              </View>
              <Feather name="check" size={16} color="#00D4AA" />
            </View>
          ))}
        </View>

        <View style={styles.privacyCard}>
          <Feather name="lock" size={14} color="#6B7A99" />
          <Text style={styles.privacyText}>
            AIRA never uploads your health data. All processing happens on your
            device. We never sell or share your information.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/onboarding/syncing")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Grant Health Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/onboarding/syncing")}
          activeOpacity={0.6}
        >
          <Text style={styles.demoText}>Continue in demo mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
    paddingHorizontal: 24,
  },
  backBtn: {
    marginBottom: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
  },
  headerBlock: {
    alignItems: "center",
    gap: 14,
    paddingTop: 16,
  },
  shieldWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#00D4AA18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00D4AA30",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#F0F2F8",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#A0ABBE",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  permsList: {
    gap: 2,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252D3D",
  },
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: "#141926",
    borderBottomWidth: 1,
    borderBottomColor: "#252D3D",
  },
  permIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  permText: {
    flex: 1,
    gap: 2,
  },
  permLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#F0F2F8",
  },
  permDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#A0ABBE",
  },
  permWhy: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7A99",
    fontStyle: "italic",
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#141926",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#252D3D",
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7A99",
    lineHeight: 18,
  },
  bottomSection: {
    gap: 14,
    paddingTop: 16,
  },
  primaryBtn: {
    backgroundColor: "#00D4AA",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#0A0E17",
  },
  demoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7A99",
    textAlign: "center",
  },
});
