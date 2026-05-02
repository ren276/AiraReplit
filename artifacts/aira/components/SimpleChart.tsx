import React from "react";
import { View } from "react-native";
import Svg, {
  Circle as SvgCircle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface Props {
  data: number[];
  labels: string[];
  color: string;
  width: number;
  height?: number;
}

export default function SimpleChart({
  data,
  labels,
  color,
  width,
  height = 130,
}: Props) {
  const colors = useColors();

  if (!data.length || data.length < 2) return null;

  const padTop = 12;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, i) => ({
    x: padLeft + (i / (data.length - 1)) * chartW,
    y: padTop + (1 - (val - minVal) / range) * chartH,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const pathData = [
    `M ${points[0].x} ${height - padBottom}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${height - padBottom}`,
    "Z",
  ].join(" ");

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        <Path d={pathData} fill={`url(#grad-${color})`} />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <SvgCircle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
        ))}
        {labels.map((label, i) => (
          <SvgText
            key={i}
            x={padLeft + (i / (data.length - 1)) * chartW}
            y={height - 6}
            fontSize="10"
            fill={colors.mutedForeground}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
