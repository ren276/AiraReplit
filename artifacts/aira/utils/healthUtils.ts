export interface DailyHealthData {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  restingHeartRate: number;
  hrv: number;
  steps: number;
  stressScore: number;
  readinessScore: number;
  readinessStatus: "Good" | "Fair" | "Low";
  insight: string;
}

function seededRandom(seed: number): () => number {
  let s = seed + 1;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function dateToSeed(dateStr: string): number {
  return dateStr
    .split("")
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 42);
}

const INSIGHTS_GOOD = [
  "Your HRV is elevated and resting heart rate is low — your body handled yesterday's load exceptionally well. You're primed for a challenging workout or a mentally demanding day.",
  "Sleep quality is high and recovery markers are strong. Your nervous system is well-rested. Today is an optimal day for peak performance.",
  "Strong HRV and solid sleep hours — your body is in a recovery surplus. Take advantage of this window for intense training or deep work sessions.",
  "All your key metrics are trending positively. Your body is adapting well. Maintain your current routine and stay hydrated throughout the day.",
];

const INSIGHTS_FAIR = [
  "Your sleep was shorter than optimal, but your HRV remains decent. Consider a light workout today and aim for 7–8 hours tonight.",
  "Resting heart rate is slightly elevated — likely mild fatigue. A moderate-intensity workout is fine, but skip the high-intensity session.",
  "Mixed signals: good sleep but lower HRV suggests your body is working hard on recovery. Prioritize nutrition and hydration today.",
  "You're in a moderate recovery state. A 30-minute walk will serve you better than a hard gym session today. Recharge and go again tomorrow.",
];

const INSIGHTS_LOW = [
  "Low HRV and elevated resting heart rate signal significant fatigue. This is a clear rest day — light stretching or a short walk at most.",
  "Sleep debt is accumulating. Your body needs rest more than exercise today. Prioritize an early bedtime tonight to turn this around.",
  "Your body is under recovery stress. Avoid high-intensity activities and focus on good nutrition, hydration, and stress reduction.",
  "Recovery markers are at their lowest this week. Honor the signal — push hard when your body is ready. Today, it needs rest.",
];

export function generateDailyData(dateStr: string): DailyHealthData {
  const rand = seededRandom(dateToSeed(dateStr));

  const sleepHours = Math.round((5.0 + rand() * 4.0) * 10) / 10;
  const sleepQuality = Math.round(40 + rand() * 60);
  const restingHeartRate = Math.round(52 + rand() * 28);
  const hrv = Math.round(20 + rand() * 60);
  const steps = Math.floor(2000 + rand() * 11000);
  const stressScore = Math.round(10 + rand() * 70);

  const sleepScore = Math.min(100, (sleepHours / 8) * 100);
  const hrvScore = Math.min(100, (hrv / 70) * 100);
  const hrScore = Math.max(0, 100 - ((restingHeartRate - 50) / 30) * 100);
  const stressComponent = Math.max(0, 100 - stressScore);

  const readinessScore = Math.round(
    sleepScore * 0.3 +
      hrvScore * 0.35 +
      hrScore * 0.2 +
      stressComponent * 0.15
  );

  const clamped = Math.max(0, Math.min(100, readinessScore));
  const readinessStatus: "Good" | "Fair" | "Low" =
    clamped >= 70 ? "Good" : clamped >= 45 ? "Fair" : "Low";

  const insightPool =
    readinessStatus === "Good"
      ? INSIGHTS_GOOD
      : readinessStatus === "Fair"
        ? INSIGHTS_FAIR
        : INSIGHTS_LOW;

  const insightIndex = Math.floor(rand() * insightPool.length);
  const insight = insightPool[insightIndex];

  return {
    date: dateStr,
    sleepHours,
    sleepQuality,
    restingHeartRate,
    hrv,
    steps,
    stressScore,
    readinessScore: clamped,
    readinessStatus,
    insight,
  };
}

export function getLast30Days(): DailyHealthData[] {
  const days: DailyHealthData[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push(generateDailyData(dateStr));
  }
  return days;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today.setDate(today.getDate() - 1))
    .toISOString()
    .split("T")[0];
  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
