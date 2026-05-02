import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useHealth } from "@/context/HealthContext";
import { useOnboarding } from "@/context/OnboardingContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 180;
const RADIUS = 72;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STEPS = [
  { key: "connecting", label: "Connecting to Health Connect..." },
  { key: "sleep", label: "Reading sleep data..." },
  { key: "hrv", label: "Analyzing HRV..." },
  { key: "heartrate", label: "Processing heart rate..." },
  { key: "steps", label: "Counting activity..." },
  { key: "processing", label: "Calculating readiness..." },
  { key: "done", label: "Building your baseline..." },
];

export default function SyncingScreen() {
  const insets = useSafeAreaInsets();
  const { requestPermissionsAndSync, syncProgress } = useHealth();
  const { completeOnboarding } = useOnboarding();
  const [done, setDone] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [started, setStarted] = useState(false);

  const ringProgress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const center = SIZE / 2;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();

    const run = async () => {
      setStarted(true);
      Animated.timing(ringProgress, { toValue: 30, duration: 800, useNativeDriver: false }).start();
      const granted = await requestPermissionsAndSync();
      setDemoMode(!granted);
      Animated.timing(ringProgress, { toValue: 100, duration: 1000, useNativeDriver: false }).start(() => {
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: false }).start();
        setDone(true);
      });
    };

    const timer = setTimeout(run, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (syncProgress === "done" || done) {
      Animated.timing(ringProgress, { toValue: 100, duration: 600, useNativeDriver: false }).start();
    } else {
      const stepIndex = STEPS.findIndex((s) => s.key === syncProgress);
      if (stepIndex >= 0) {
        const progress = ((stepIndex + 1) / STEPS.length) * 90;
        Animated.timing(ringProgress, { toValue: progress, duration: 400, useNativeDriver: false }).start();
      }
    }
  }, [syncProgress]);

  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const currentStepLabel =
    STEPS.find((s) => s.key === syncProgress)?.label ?? "Setting up AIRA...";

  const goToApp = async () => {
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          paddingTop: Platform.OS === "web" ? 80 : insets.top + 24,
          paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.ringSection}>
        <View style={styles.ringWrap}>
          <Svg width={SIZE} height={SIZE} style={styles.svg}>
            <Circle
              cx={center}
              cy={center}
              r={RADIUS}
              strokeWidth={STROKE}
              stroke="#1E2535"
              fill="none"
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={RADIUS}
              strokeWidth={STROKE}
              stroke={done ? "#22C55E" : "#00D4AA"}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View style={styles.ringInner}>
            {done ? (
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Feather name="check" size={42} color="#22C55E" />
              </Animated.View>
            ) : (
              <Feather name="refresh-cw" size={28} color="#00D4AA" />
            )}
          </View>
        </View>

        <View style={styles.statusSection}>
          {done ? (
            <>
              <Text style={styles.doneTitle}>You're all set!</Text>
              <Text style={styles.doneSubtitle}>
                {demoMode
                  ? "Running in demo mode. Connect a wearable anytime from the Profile tab."
                  : "30 days of health data analyzed. Your first readiness score is ready."}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.syncingTitle}>Analyzing your health history</Text>
              <Text style={styles.syncingStep}>{currentStepLabel}</Text>
            </>
          )}
        </View>
      </View>

      {!done && (
        <View style={styles.stepsList}>
          {STEPS.slice(0, 5).map((step, i) => {
            const currentIdx = STEPS.findIndex((s) => s.key === syncProgress);
            const isComplete = currentIdx > i;
            const isActive = currentIdx === i;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: isComplete
                        ? "#22C55E"
                        : isActive
                          ? "#00D4AA"
                          : "#252D3D",
                      borderColor: isActive ? "#00D4AA" : "transparent",
                    },
                  ]}
                >
                  {isComplete && (
                    <Feather name="check" size={10} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isComplete ? "#A0ABBE" : isActive ? "#F0F2F8" : "#6B7A99",
                      fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {done && (
        <TouchableOpacity style={styles.ctaBtn} onPress={goToApp} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>See My Readiness</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  ringSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusSection: {
    alignItems: "center",
    gap: 10,
  },
  syncingTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F0F2F8",
    textAlign: "center",
  },
  syncingStep: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7A99",
    textAlign: "center",
  },
  doneTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#22C55E",
    textAlign: "center",
  },
  doneSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#A0ABBE",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  stepsList: {
    gap: 12,
    paddingBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: 14,
  },
  ctaBtn: {
    backgroundColor: "#00D4AA",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#0A0E17",
  },
});
