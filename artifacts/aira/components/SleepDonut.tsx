import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 140;
const CENTER = SIZE / 2;

interface Segment {
  label: string;
  minutes: number;
  color: string;
  radius: number;
  strokeWidth: number;
}

interface Props {
  deepMinutes: number;
  remMinutes: number;
  lightMinutes: number;
  awakeMinutes: number;
}

function useAnimatedOffset(target: number, circumference: number, delay = 0) {
  const anim = useRef(new Animated.Value(circumference)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 1200,
      delay,
      useNativeDriver: false,
    }).start();
  }, [target]);
  return anim;
}

export default function SleepDonut({ deepMinutes, remMinutes, lightMinutes, awakeMinutes }: Props) {
  const colors = useColors();
  const total = deepMinutes + remMinutes + lightMinutes + awakeMinutes;
  if (total === 0) return null;

  const segments: Segment[] = [
    { label: "Deep",  minutes: deepMinutes,  color: "#6366F1", radius: 52, strokeWidth: 10 },
    { label: "REM",   minutes: remMinutes,   color: "#A78BFA", radius: 40, strokeWidth: 10 },
    { label: "Light", minutes: lightMinutes, color: "#818CF8", radius: 28, strokeWidth: 9  },
    { label: "Awake", minutes: awakeMinutes, color: "#374151", radius: 17, strokeWidth: 7  },
  ];

  const totalHours = (total / 60).toFixed(1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.svgWrap}>
        <Svg width={SIZE} height={SIZE}>
          {segments.map((seg) => {
            const circ = 2 * Math.PI * seg.radius;
            const filled = (seg.minutes / total) * circ;
            const offset = circ - filled;
            return (
              <AnimatedSegment
                key={seg.label}
                cx={CENTER}
                cy={CENTER}
                radius={seg.radius}
                strokeWidth={seg.strokeWidth}
                color={seg.color}
                circumference={circ}
                targetOffset={offset}
              />
            );
          })}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={[styles.centerValue, { color: colors.foreground }]}>{totalHours}</Text>
          <Text style={[styles.centerUnit, { color: colors.mutedForeground }]}>hrs</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{seg.label}</Text>
            <Text style={[styles.legendValue, { color: colors.foreground }]}>
              {seg.minutes}m
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AnimatedSegment({
  cx, cy, radius, strokeWidth, color, circumference, targetOffset,
}: {
  cx: number; cy: number; radius: number; strokeWidth: number;
  color: string; circumference: number; targetOffset: number;
}) {
  const anim = useRef(new Animated.Value(circumference)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: targetOffset,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [targetOffset]);

  return (
    <>
      <Circle
        cx={cx} cy={cy} r={radius}
        strokeWidth={strokeWidth}
        stroke="#1E2535"
        fill="none"
      />
      <AnimatedCircle
        cx={cx} cy={cy} r={radius}
        strokeWidth={strokeWidth}
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={anim}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", alignItems: "center", gap: 20 },
  svgWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  centerLabel: { position: "absolute", alignItems: "center" },
  centerValue: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 26 },
  centerUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
  legendValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
