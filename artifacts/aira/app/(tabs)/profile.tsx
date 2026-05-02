import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHealth } from "@/context/HealthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useColors } from "@/hooks/useColors";

const DEVICES = [
  { id: "cmf",     name: "CMF Watch Pro 2",        icon: "watch" as const },
  { id: "noise",   name: "Noise ColorFit Pro 6",    icon: "watch" as const },
  { id: "amazfit", name: "Amazfit GTR 4",            icon: "watch" as const },
  { id: "realme",  name: "Realme Watch S2",          icon: "watch" as const },
  { id: "other",   name: "Other device",             icon: "bluetooth" as const },
];

function SettingRow({
  icon,
  label,
  subtitle,
  rightElement,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.settingRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? "#EF444418" : colors.secondary }]}>
        <Feather name={icon} size={16} color={danger ? "#EF4444" : colors.mutedForeground} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: danger ? "#EF4444" : colors.foreground }]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement ??
        (onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null)}
    </TouchableOpacity>
  );
}

function GoalRow({
  label,
  value,
  unit,
  color,
  progress,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  progress: number; // 0–1
}) {
  const colors = useColors();
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalLeft}>
        <Text style={[styles.goalLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.goalUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
      <View style={styles.goalRight}>
        <View style={[styles.goalTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.goalFill,
              {
                width: `${Math.min(progress * 100, 100)}%` as any,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={[styles.goalValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { today, history, isDemoMode, hasPermissions, requestPermissionsAndSync } = useHealth();
  const { resetOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();

  const [selectedDevice, setSelectedDevice] = useState("cmf");
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  // Stats
  const goodDays = history.filter((d) => d.readiness.status === "Good").length;
  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.readiness.score, 0) / history.length)
    : 0;
  const todayScore = today?.readiness.score ?? 0;
  const todayStatus = today?.readiness.status ?? "Fair";

  // Streak: consecutive days (from today backward) where score ≥ 50
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].readiness.score >= 50) streak++;
    else break;
  }

  // Best streak ever
  let bestStreak = 0, cur = 0;
  for (const d of history) {
    if (d.readiness.score >= 50) { cur++; bestStreak = Math.max(bestStreak, cur); }
    else cur = 0;
  }

  // Goals progress (against fixed targets)
  const sleepGoal = 7.5;
  const stepGoal = 8000;
  const hrvGoal = 55;
  const avgSleep = history.length
    ? history.reduce((a, b) => a + (b.metrics.sleepHours ?? 0), 0) / history.length
    : 0;
  const avgSteps = history.length
    ? history.reduce((a, b) => a + b.metrics.steps, 0) / history.length
    : 0;
  const avgHRV = history.length
    ? history.reduce((a, b) => a + (b.metrics.hrv ?? 0), 0) / history.filter((d) => d.metrics.hrv != null).length
    : 0;

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace("/onboarding/welcome");
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: "#00D4AA22", borderColor: "#00D4AA40" }]}>
          <Text style={[styles.avatarText, { color: "#00D4AA" }]}>A</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Arjun</Text>
          <Text style={[styles.profileSince, { color: colors.mutedForeground }]}>
            {isDemoMode ? "Demo Mode — no wearable linked" : "Health data connected"}
          </Text>
        </View>
      </View>

      {isDemoMode && (
        <TouchableOpacity
          style={styles.connectBanner}
          onPress={requestPermissionsAndSync}
          activeOpacity={0.8}
        >
          <Feather name="bluetooth" size={16} color="#00D4AA" />
          <View style={styles.connectBannerText}>
            <Text style={[styles.connectTitle, { color: colors.foreground }]}>
              Connect your wearable
            </Text>
            <Text style={[styles.connectSub, { color: colors.mutedForeground }]}>
              Grant Health Connect access for real data
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color="#00D4AA" />
        </TouchableOpacity>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "Avg Score",  value: avgScore.toString(),  color: "#00D4AA" },
          { label: "Good Days",  value: goodDays.toString(),  color: "#22C55E" },
          {
            label: "Today",
            value: todayScore.toString(),
            color: todayStatus === "Good" ? "#22C55E" : todayStatus === "Fair" ? "#F59E0B" : "#EF4444",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Streak */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>STREAK</Text>
        <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.streakMain}>
            <View style={styles.streakCenter}>
              <Text style={[styles.streakNumber, { color: streak > 0 ? "#F59E0B" : colors.mutedForeground }]}>
                {streak}
              </Text>
              <Text style={[styles.streakUnit, { color: colors.mutedForeground }]}>day streak</Text>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
            <View style={styles.streakCenter}>
              <Text style={[styles.streakNumber, { color: "#00D4AA" }]}>{bestStreak}</Text>
              <Text style={[styles.streakUnit, { color: colors.mutedForeground }]}>best ever</Text>
            </View>
          </View>
          <Text style={[styles.streakCaption, { color: colors.mutedForeground }]}>
            {streak === 0
              ? "Hit a readiness score of 50+ to start your streak"
              : streak < 7
                ? `${7 - streak} more days to hit a 7-day streak 🔥`
                : "You're on a great streak — protect it with quality sleep"}
          </Text>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          30-DAY GOALS
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <GoalRow
            label="Avg Sleep"
            value={avgSleep > 0 ? avgSleep.toFixed(1) : "--"}
            unit={`/ ${sleepGoal}h target`}
            color="#818CF8"
            progress={avgSleep / sleepGoal}
          />
          <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
          <GoalRow
            label="Avg Steps"
            value={avgSteps > 0 ? Math.round(avgSteps).toLocaleString() : "--"}
            unit={`/ ${stepGoal.toLocaleString()} target`}
            color="#34D399"
            progress={avgSteps / stepGoal}
          />
          <View style={[styles.goalDivider, { backgroundColor: colors.border }]} />
          <GoalRow
            label="Avg HRV"
            value={avgHRV > 0 ? Math.round(avgHRV).toString() : "--"}
            unit={`/ ${hrvGoal}ms target`}
            color="#60A5FA"
            progress={avgHRV / hrvGoal}
          />
        </View>
      </View>

      {/* Connected device */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          CONNECTED DEVICE
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {DEVICES.map((device, i) => (
            <TouchableOpacity
              key={device.id}
              onPress={() => setSelectedDevice(device.id)}
              style={[
                styles.deviceRow,
                i < DEVICES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.deviceLeft}>
                <Feather name={device.icon} size={15} color={colors.mutedForeground} />
                <Text style={[styles.deviceName, { color: colors.foreground }]}>
                  {device.name}
                </Text>
              </View>
              {selectedDevice === device.id ? (
                <Feather name="check-circle" size={18} color="#00D4AA" />
              ) : (
                <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          NOTIFICATIONS
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Push Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: "#00D4AA" }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Daily Reminder</Text>
            <Switch value={dailyReminder} onValueChange={setDailyReminder}
              trackColor={{ false: colors.border, true: "#00D4AA" }} thumbColor="#fff" />
          </View>
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA</Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Auto-Sync</Text>
            <Switch value={autoSync} onValueChange={setAutoSync}
              trackColor={{ false: colors.border, true: "#00D4AA" }} thumbColor="#fff" />
          </View>
          <SettingRow icon="refresh-cw" label="Sync Now" subtitle="Fetch latest health data" onPress={requestPermissionsAndSync} />
          <SettingRow
            icon="shield"
            label="Health Permissions"
            subtitle={hasPermissions ? "Connected" : "Not connected"}
            onPress={requestPermissionsAndSync}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="info" label="AIRA Health Analytics" subtitle="Version 1.0.0" />
          <SettingRow icon="file-text" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="star" label="Rate AIRA" onPress={() => {}} />
          <SettingRow
            icon="rotate-ccw"
            label="Reset Onboarding"
            subtitle="See the setup flow again"
            onPress={handleResetOnboarding}
          />
        </View>
      </View>

      <View style={styles.tagline}>
        <Text style={[styles.taglineText, { color: colors.mutedForeground }]}>
          Made for Android users with budget wearables
        </Text>
        <Text style={[styles.taglineText, { color: "#00D4AA" }]}>Know your body. Every day.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  profileCard: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 20, gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  avatarText: { fontSize: 26, fontFamily: "Inter_700Bold" },
  profileInfo: { gap: 4 },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  profileSince: { fontSize: 12, fontFamily: "Inter_400Regular" },
  connectBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 24, marginBottom: 20, padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: "#00D4AA30", backgroundColor: "#00D4AA0D",
  },
  connectBannerText: { flex: 1 },
  connectTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  connectSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  section: { paddingHorizontal: 24, marginBottom: 20, gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2 },
  streakCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  streakMain: { flexDirection: "row", alignItems: "center" },
  streakCenter: { flex: 1, alignItems: "center", gap: 2 },
  streakNumber: { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 46 },
  streakUnit: { fontSize: 12, fontFamily: "Inter_400Regular" },
  streakDivider: { width: 1, height: 50 },
  streakCaption: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  groupCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  goalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, gap: 12 },
  goalLeft: { gap: 2 },
  goalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  goalUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  goalRight: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "flex-end" },
  goalTrack: { width: 80, height: 5, borderRadius: 3, overflow: "hidden" },
  goalFill: { height: 5, borderRadius: 3 },
  goalValue: { fontSize: 14, fontFamily: "Inter_700Bold", minWidth: 36, textAlign: "right" },
  goalDivider: { height: 1 },
  deviceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  deviceLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  deviceName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  emptyCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderTopWidth: 1 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  settingText: { flex: 1, gap: 2 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  settingSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  tagline: { alignItems: "center", paddingHorizontal: 24, paddingTop: 8, gap: 4 },
  taglineText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
