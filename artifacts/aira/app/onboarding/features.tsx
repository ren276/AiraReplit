import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const FEATURES = [
  {
    icon: "activity" as const,
    color: "#00D4AA",
    title: "Daily Readiness Score",
    subtitle: "Know when to push, know when to rest",
    body: "AIRA calculates a 0–100 readiness score every morning using HRV, resting heart rate, and sleep — the same signals elite athletes track.",
    stat: "85",
    statLabel: "READINESS",
    statStatus: "GOOD",
    statColor: "#22C55E",
  },
  {
    icon: "bluetooth" as const,
    color: "#818CF8",
    title: "From Your Wearable",
    subtitle: "CMF Watch, Noise, Amazfit & more",
    body: "Reads directly from Android Health Connect. If your watch syncs to your phone, AIRA has the data. No subscription. No hardware lock-in.",
    stat: "30",
    statLabel: "DAYS OF DATA",
    statStatus: "SYNCED",
    statColor: "#818CF8",
  },
  {
    icon: "zap" as const,
    color: "#F59E0B",
    title: "AI-Powered Insights",
    subtitle: "Plain language, not just numbers",
    body: 'No more staring at charts wondering what to do. AIRA tells you "Your HRV is 18% above baseline — this is your day to perform" in plain English.',
    stat: "1",
    statLabel: "INSIGHT",
    statStatus: "PER DAY",
    statColor: "#F59E0B",
  },
];

export default function FeaturesScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const topPad = Platform.OS === "web" ? 60 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom + 16;

  const goNext = () => {
    if (page < FEATURES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
      setPage(page + 1);
    } else {
      router.push("/onboarding/permissions");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#6B7A99" />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>
          {page + 1} of {FEATURES.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scroller}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setPage(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      >
        {FEATURES.map((feature, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: feature.color + "18" }]}>
              <Feather name={feature.icon} size={36} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={[styles.featureSubtitle, { color: feature.color }]}>
              {feature.subtitle}
            </Text>
            <Text style={styles.featureBody}>{feature.body}</Text>
            <View style={[styles.statCard, { borderColor: feature.color + "40", backgroundColor: feature.color + "0D" }]}>
              <Text style={[styles.statValue, { color: feature.color }]}>
                {feature.stat}
              </Text>
              <Text style={styles.statLabel}>{feature.statLabel}</Text>
              <View style={[styles.statBadge, { backgroundColor: feature.color + "22" }]}>
                <Text style={[styles.statBadgeText, { color: feature.color }]}>
                  {feature.statStatus}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {FEATURES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? "#00D4AA" : "#252D3D",
                width: i === page ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>
          {page < FEATURES.length - 1 ? "Next" : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7A99",
  },
  scroller: {
    flex: 1,
    marginHorizontal: -24,
  },
  slide: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#F0F2F8",
    textAlign: "center",
    lineHeight: 32,
  },
  featureSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  featureBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#A0ABBE",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 320,
  },
  statCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 6,
    width: "80%",
    marginTop: 8,
  },
  statValue: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    lineHeight: 58,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7A99",
    letterSpacing: 2,
  },
  statBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  statBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: "0.3s",
  } as any,
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
});
