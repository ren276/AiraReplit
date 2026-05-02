import { Feather } from "@expo/vector-icons";
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
import { useColors } from "@/hooks/useColors";

const DEVICES = [
  { id: "cmf", name: "CMF Watch Pro 2", icon: "watch" as const },
  { id: "noise", name: "Noise ColorFit Pro 6", icon: "watch" as const },
  { id: "amazfit", name: "Amazfit GTR 4", icon: "watch" as const },
  { id: "realme", name: "Realme Watch S2", icon: "watch" as const },
  { id: "other", name: "Other device", icon: "bluetooth" as const },
];

function SettingRow({
  icon,
  label,
  subtitle,
  rightElement,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
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
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.settingSubtitle, { color: colors.mutedForeground }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement ?? (
        onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { today, history } = useHealth();
  const insets = useSafeAreaInsets();

  const [selectedDevice, setSelectedDevice] = useState("cmf");
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const streakDays = history.filter((d) => d.readinessScore >= 45).length;
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
          Profile
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View
          style={[styles.avatar, { backgroundColor: "#00D4AA" + "22", borderColor: "#00D4AA" + "40" }]}
        >
          <Text style={[styles.avatarText, { color: "#00D4AA" }]}>A</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>
            Arjun
          </Text>
          <Text style={[styles.profileSince, { color: colors.mutedForeground }]}>
            AIRA user since May 2026
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Avg Score", value: avgScore.toString(), color: "#00D4AA" },
          {
            label: "Active Days",
            value: streakDays.toString(),
            color: "#818CF8",
          },
          {
            label: "Today",
            value: today.readinessScore.toString(),
            color:
              today.readinessStatus === "Good"
                ? "#22C55E"
                : today.readinessStatus === "Fair"
                  ? "#F59E0B"
                  : "#EF4444",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          CONNECTED DEVICE
        </Text>
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {DEVICES.map((device, i) => (
            <TouchableOpacity
              key={device.id}
              onPress={() => setSelectedDevice(device.id)}
              style={[
                styles.deviceRow,
                i < DEVICES.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.deviceLeft}>
                <Feather
                  name={device.icon}
                  size={15}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.deviceName, { color: colors.foreground }]}
                >
                  {device.name}
                </Text>
              </View>
              {selectedDevice === device.id ? (
                <Feather name="check-circle" size={18} color="#00D4AA" />
              ) : (
                <View
                  style={[styles.emptyCircle, { borderColor: colors.border }]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          NOTIFICATIONS
        </Text>
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.toggleRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
              Push Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: "#00D4AA" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
              Daily Reminder
            </Text>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: colors.border, true: "#00D4AA" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          DATA
        </Text>
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.toggleRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
              Auto-Sync
            </Text>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: colors.border, true: "#00D4AA" }}
              thumbColor="#fff"
            />
          </View>
          <SettingRow
            icon="shield"
            label="Health Permissions"
            subtitle="Manage data access"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          ABOUT
        </Text>
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="info"
            label="AIRA"
            subtitle="Version 1.0.0"
          />
          <SettingRow
            icon="file-text"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingRow
            icon="star"
            label="Rate AIRA"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.tagline}>
        <Text style={[styles.taglineText, { color: colors.mutedForeground }]}>
          Made for Android users with budget wearables
        </Text>
        <Text style={[styles.taglineText, { color: "#00D4AA" }]}>
          Know your body. Every day.
        </Text>
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
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  profileSince: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  deviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deviceName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  tagline: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 4,
  },
  taglineText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
