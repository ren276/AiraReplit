import type { DayMetrics, ReadinessBreakdown } from "@/types/health";

export function generateInsight(
  status: "Good" | "Fair" | "Low",
  breakdown: ReadinessBreakdown,
  metrics: DayMetrics
): string {
  const hrv = metrics.hrv?.toFixed(0) ?? "--";
  const rhr = metrics.restingHeartRate?.toFixed(0) ?? "--";
  const sleep = metrics.sleepHours?.toFixed(1) ?? "--";

  const lowestKey = Object.entries(breakdown).reduce((a, b) =>
    a[1] < b[1] ? a : b
  )[0] as "hrv" | "rhr" | "sleep";

  if (status === "Good") {
    if (breakdown.hrv >= 75) {
      return `HRV of ${hrv}ms is well above your baseline — your autonomic nervous system is recovered and balanced. Resting heart rate of ${rhr}bpm and ${sleep}h of sleep complete the picture. Push hard today.`;
    }
    if (breakdown.sleep >= 80) {
      return `Excellent sleep last night (${sleep}h) is the foundation of your strong readiness today. HRV and resting heart rate are both trending positively. A great day for performance.`;
    }
    return `All three recovery pillars are green — HRV at ${hrv}ms, resting HR at ${rhr}bpm, sleep at ${sleep}h. Your body has absorbed recent load well. Execute your plan with confidence.`;
  }

  if (status === "Fair") {
    if (lowestKey === "sleep") {
      return `Sleep was the limiting factor last night (${sleep}h). Your HRV and heart rate are holding up, which means the impact is manageable. Moderate training is fine; prioritize ${metrics.sleepHours && metrics.sleepHours < 6 ? "a full night's sleep" : "7–8h"} tonight.`;
    }
    if (lowestKey === "hrv") {
      return `HRV of ${hrv}ms is tracking below your baseline — your nervous system is still processing accumulated stress. Avoid high-intensity sessions. Zone 2 cardio or mobility work will aid recovery without adding load.`;
    }
    return `Resting heart rate of ${rhr}bpm is slightly elevated above your norm, signalling mild physiological fatigue. Sleep was adequate at ${sleep}h. Moderate effort today and focus on recovery nutrition.`;
  }

  if (lowestKey === "sleep") {
    return `Severe sleep insufficiency (${sleep}h) is suppressing your recovery markers. No workout will outperform the benefit of proper sleep right now. Protect your bedtime tonight above all else.`;
  }
  if (lowestKey === "hrv") {
    return `HRV has dropped significantly below your baseline — your nervous system is under considerable stress. This is an unambiguous rest day signal. Light walking and breathwork are your best tools today.`;
  }
  return `All three recovery markers — HRV (${hrv}ms), resting HR (${rhr}bpm), sleep (${sleep}h) — are suppressed. This is a significant recovery deficit. Rest, rehydrate, and sleep early. Your next window to perform is building now.`;
}
