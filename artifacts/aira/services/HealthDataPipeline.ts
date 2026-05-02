import { Platform } from "react-native";

import { generateInsight } from "@/algorithms/insights";
import { avgHRV, calculateBaseline } from "@/algorithms/hrv";
import { analyzeSleep, pickBestSleepSession } from "@/algorithms/sleep";
import { calculateReadiness } from "@/algorithms/readiness";
import type {
  Baseline,
  DayMetrics,
  IHealthService,
  ProcessedDayData,
} from "@/types/health";
import { generateDailyData } from "@/utils/healthUtils";

export type SyncProgress =
  | "connecting"
  | "sleep"
  | "hrv"
  | "heartrate"
  | "steps"
  | "processing"
  | "done";

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getLast30DayStrings(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(dateStr(d));
  }
  return days;
}

function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = dateStr(getDate(item));
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function estimateRHRFromNightly(
  samples: Array<{ timestamp: Date; bpm: number }>,
  dayStr: string
): number | null {
  const prev = new Date(dayStr + "T00:00:00");
  prev.setDate(prev.getDate() - 1);
  const nightStart = new Date(prev);
  nightStart.setHours(1, 0, 0, 0);
  const nightEnd = new Date(prev);
  nightEnd.setDate(nightEnd.getDate() + 1);
  nightEnd.setHours(6, 0, 0, 0);

  const nightly = samples.filter(
    (s) =>
      s.timestamp >= nightStart && s.timestamp <= nightEnd && s.bpm > 30 && s.bpm < 120
  );
  if (!nightly.length) return null;
  const sorted = nightly.map((s) => s.bpm).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.1)];
}

function demoForDay(dateStr: string): ProcessedDayData {
  const raw = generateDailyData(dateStr);
  return {
    date: dateStr,
    metrics: {
      hrv: raw.hrv,
      restingHeartRate: raw.restingHeartRate,
      sleepHours: raw.sleepHours,
      sleepQuality: raw.sleepQuality,
      deepSleepMinutes: Math.round(raw.sleepHours * 60 * 0.18),
      remSleepMinutes: Math.round(raw.sleepHours * 60 * 0.22),
      lightSleepMinutes: Math.round(raw.sleepHours * 60 * 0.55),
      awakeMinutes: Math.round(raw.sleepHours * 60 * 0.05),
      sleepEfficiency: raw.sleepQuality / 100,
      steps: raw.steps,
    },
    readiness: {
      score: raw.readinessScore,
      status: raw.readinessStatus,
      breakdown: { hrv: 60, rhr: 55, sleep: 60 },
      insight: raw.insight,
    },
    isDemoMode: true,
  };
}

export function getDemoData(): ProcessedDayData[] {
  return getLast30DayStrings().map(demoForDay);
}

export async function runSyncPipeline(
  service: IHealthService,
  onProgress?: (step: SyncProgress) => void
): Promise<ProcessedDayData[]> {
  const report = (s: SyncProgress) => onProgress?.(s);

  report("connecting");
  const available = await service.isAvailable();
  if (!available) return getDemoData();

  const hasPerms = await service.checkPermissions();
  if (!hasPerms) return getDemoData();

  const days = getLast30DayStrings();
  const startDate = new Date(days[0] + "T00:00:00");
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  report("sleep");
  const sleepSessions = await service.getSleepSessions(startDate, endDate);

  report("hrv");
  const hrvSamples = await service.getHRVSamples(startDate, endDate);

  report("heartrate");
  const hrSamples = await service.getHeartRateSamples(startDate, endDate);
  const rhrSamples = await service.getRestingHeartRateSamples(startDate, endDate);

  report("steps");
  const stepsPerDay = await Promise.all(
    days.map((d) => {
      const s = new Date(d + "T00:00:00");
      const e = new Date(d + "T23:59:59");
      return service.getStepCount(s, e);
    })
  );

  report("processing");

  const hrvByDay = groupByDay(hrvSamples, (s) => s.timestamp);
  const hrByDay = groupByDay(hrSamples, (s) => s.timestamp);
  const rhrByDay = groupByDay(rhrSamples, (s) => s.timestamp);
  const sleepByDay: Record<string, ReturnType<typeof pickBestSleepSession>> = {};

  for (const session of sleepSessions) {
    const key = dateStr(session.endTime);
    const existing = sleepByDay[key];
    if (!existing) {
      sleepByDay[key] = session;
    } else {
      const dur = session.endTime.getTime() - session.startTime.getTime();
      const existDur = existing.endTime.getTime() - existing.startTime.getTime();
      if (dur > existDur) sleepByDay[key] = session;
    }
  }

  const rawMetrics: DayMetrics[] = days.map((d, i) => {
    const hrv = avgHRV((hrvByDay[d] ?? []).map((s) => s.sdnn));

    const rhrFromExplicit = rhrByDay[d]?.[rhrByDay[d].length - 1]?.bpm ?? null;
    const allHR = [...(hrByDay[d] ?? []), ...(hrSamples.filter((s) => dateStr(s.timestamp) === d))];
    const rhr = rhrFromExplicit ?? estimateRHRFromNightly(allHR, d);

    const sleep = sleepByDay[d] ? analyzeSleep(sleepByDay[d]!) : null;

    return {
      hrv,
      restingHeartRate: rhr,
      sleepHours: sleep?.totalHours ?? null,
      sleepQuality: sleep ? Math.round(sleep.score) : null,
      deepSleepMinutes: sleep?.deepMinutes ?? null,
      remSleepMinutes: sleep?.remMinutes ?? null,
      lightSleepMinutes: sleep?.lightMinutes ?? null,
      awakeMinutes: sleep?.awakeMinutes ?? null,
      sleepEfficiency: sleep?.efficiency ?? null,
      steps: stepsPerDay[i],
    };
  });

  const baseline: Baseline = {
    hrv: calculateBaseline(rawMetrics.map((m) => m.hrv ?? 0).filter(Boolean)),
    rhr: calculateBaseline(rawMetrics.map((m) => m.restingHeartRate ?? 0).filter(Boolean)),
  };

  if (!baseline.hrv.avg) {
    return getDemoData();
  }

  const processed: ProcessedDayData[] = rawMetrics.map((metrics, i) => {
    const { score, status, breakdown } = calculateReadiness(
      metrics.hrv,
      metrics.restingHeartRate,
      metrics.sleepQuality,
      baseline
    );
    const insight = generateInsight(status, breakdown, metrics);

    return {
      date: days[i],
      metrics,
      readiness: { score, status, breakdown, insight },
      isDemoMode: false,
    };
  });

  report("done");
  return processed;
}
