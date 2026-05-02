import type { Baseline, ReadinessBreakdown } from "@/types/health";
import { calculateHRVScore } from "./hrv";

export function calculateRHRScore(
  currentRHR: number | null,
  baseline: { avg: number; std: number }
): number {
  if (!currentRHR || !baseline.avg) return 50;
  const std = Math.max(baseline.std, 2.5);
  const z = (baseline.avg - currentRHR) / std;
  const score = 50 + z * 25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateReadiness(
  hrv: number | null,
  rhr: number | null,
  sleepScore: number | null,
  baseline: Baseline
): {
  score: number;
  status: "Good" | "Fair" | "Low";
  breakdown: ReadinessBreakdown;
} {
  const hrvScore = calculateHRVScore(hrv, baseline.hrv);
  const rhrScore = calculateRHRScore(rhr, baseline.rhr);
  const sleepComponent = sleepScore ?? 50;

  const score = Math.round(
    hrvScore * 0.40 +
    rhrScore * 0.25 +
    sleepComponent * 0.35
  );

  const clamped = Math.max(0, Math.min(100, score));
  const status: "Good" | "Fair" | "Low" =
    clamped >= 67 ? "Good" : clamped >= 34 ? "Fair" : "Low";

  return {
    score: clamped,
    status,
    breakdown: { hrv: hrvScore, rhr: rhrScore, sleep: sleepComponent },
  };
}
