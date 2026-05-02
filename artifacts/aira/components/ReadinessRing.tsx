import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const RADIUS = 90;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STATUS_COLORS = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Low: "#EF4444",
} as const;

interface Props {
  score: number;
  status: "Good" | "Fair" | "Low";
}

export default function ReadinessRing({ score, status }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const color = STATUS_COLORS[status];

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const center = SIZE / 2;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          stroke="#1E2535"
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.label}>READINESS</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + "22" }]}>
          <Text style={[styles.statusText, { color }]}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  inner: {
    alignItems: "center",
  },
  score: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 64,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7A99",
    letterSpacing: 2,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
});
