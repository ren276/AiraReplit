import type { SleepSession, SleepStageEntry } from "@/types/health";

export interface SleepAnalysis {
  totalHours: number;
  deepMinutes: number;
  remMinutes: number;
  lightMinutes: number;
  awakeMinutes: number;
  efficiency: number;
  score: number;
}

function minutesBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60000;
}

export function analyzeSleep(session: SleepSession | null): SleepAnalysis | null {
  if (!session) return null;

  const totalInBed = minutesBetween(session.startTime, session.endTime);
  if (totalInBed < 30) return null;

  let deep = 0, rem = 0, light = 0, awake = 0;

  for (const stage of session.stages) {
    const d = minutesBetween(stage.startTime, stage.endTime);
    if (d <= 0) continue;
    if (stage.stage === "deep") deep += d;
    else if (stage.stage === "rem") rem += d;
    else if (stage.stage === "light") light += d;
    else if (stage.stage === "awake") awake += d;
    else light += d;
  }

  const hasStageData = deep + rem + light + awake > 10;
  if (!hasStageData) {
    const sleep = totalInBed * 0.95;
    deep = sleep * 0.18;
    rem = sleep * 0.22;
    light = sleep * 0.55;
    awake = sleep * 0.05;
  }

  const totalSleep = deep + rem + light;
  const efficiency = totalInBed > 0 ? totalSleep / totalInBed : 0;

  const TARGET_HOURS = 8;
  const totalHours = totalSleep / 60;
  const durationScore = Math.min(100, (totalHours / TARGET_HOURS) * 110);
  const efficiencyScore = Math.min(100, (efficiency / 0.88) * 100);
  const deepScore = Math.min(100, (deep / (totalSleep * 0.15)) * 90);
  const remScore = Math.min(100, (rem / (totalSleep * 0.22)) * 85);

  const score = Math.round(
    durationScore * 0.40 +
    efficiencyScore * 0.30 +
    deepScore * 0.20 +
    remScore * 0.10
  );

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    deepMinutes: Math.round(deep),
    remMinutes: Math.round(rem),
    lightMinutes: Math.round(light),
    awakeMinutes: Math.round(awake),
    efficiency: Math.min(1, efficiency),
    score: Math.max(0, Math.min(100, score)),
  };
}

export function pickBestSleepSession(sessions: SleepSession[]): SleepSession | null {
  if (!sessions.length) return null;
  return sessions.reduce((best, s) => {
    const dur = s.endTime.getTime() - s.startTime.getTime();
    const bestDur = best.endTime.getTime() - best.startTime.getTime();
    return dur > bestDur ? s : best;
  });
}
