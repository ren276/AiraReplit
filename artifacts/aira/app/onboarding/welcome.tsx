import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const RING_SIZE = 200;
const RING_RADIUS = 80;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const ringProgress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(ringProgress, {
      toValue: 85,
      duration: 1600,
      delay: 300,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1400, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const center = RING_SIZE / 2;
  const topPad = Platform.OS === "web" ? 80 : insets.top;
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.logoSection}>
        {/* Ring logo */}
        <View style={styles.logoWrap}>
          <Animated.View
            style={[styles.glowRing, { transform: [{ scale: pulse }] }]}
          />
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svgAbsolute}>
            <Circle
              cx={center}
              cy={center}
              r={RING_RADIUS}
              strokeWidth={STROKE}
              stroke="#1E2535"
              fill="none"
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={RING_RADIUS}
              strokeWidth={STROKE}
              stroke="#00D4AA"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View style={styles.logoInner}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
        </View>

        {/* Text block — always visible */}
        <View style={styles.textBlock}>
          <Text style={styles.appName}>AIRA</Text>
          <Text style={styles.tagline}>Know Your Body.{"\n"}Every Day.</Text>
          <Text style={styles.description}>
            Daily readiness scores powered by real health data — built for your wearable.
          </Text>
        </View>
      </View>

      {/* Buttons — always visible */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/onboarding/features")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/onboarding/syncing")}
          activeOpacity={0.6}
        >
          <Text style={styles.skipText}>Skip to demo mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 44,
  },
  logoWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: "#00D4AA",
    opacity: 0.08,
  },
  svgAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  logoInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#00D4AA",
    lineHeight: 64,
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  appName: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#F0F2F8",
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 27,
    fontFamily: "Inter_700Bold",
    color: "#F0F2F8",
    textAlign: "center",
    lineHeight: 36,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#6B7A99",
    textAlign: "center",
    lineHeight: 23,
    marginTop: 2,
    maxWidth: 290,
  },
  bottomSection: {
    gap: 16,
    paddingBottom: 8,
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
    letterSpacing: 0.3,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7A99",
    textAlign: "center",
  },
});
