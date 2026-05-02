export interface HRVSample {
  timestamp: Date;
  sdnn: number;
}

export interface HeartRateSample {
  timestamp: Date;
  bpm: number;
}

export interface SleepStageEntry {
  stage: "awake" | "light" | "deep" | "rem" | "unknown";
  startTime: Date;
  endTime: Date;
}

export interface SleepSession {
  startTime: Date;
  endTime: Date;
  stages: SleepStageEntry[];
}

export interface DayMetrics {
  hrv: number | null;
  restingHeartRate: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  deepSleepMinutes: number | null;
  remSleepMinutes: number | null;
  lightSleepMinutes: number | null;
  awakeMinutes: number | null;
  sleepEfficiency: number | null;
  steps: number;
}

export interface Baseline {
  hrv: { avg: number; std: number };
  rhr: { avg: number; std: number };
}

export interface ReadinessBreakdown {
  hrv: number;
  rhr: number;
  sleep: number;
}

export interface ProcessedDayData {
  date: string;
  metrics: DayMetrics;
  readiness: {
    score: number;
    status: "Good" | "Fair" | "Low";
    breakdown: ReadinessBreakdown;
    insight: string;
  };
  isDemoMode: boolean;
}

export interface IHealthService {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<{ granted: boolean; partial: boolean }>;
  checkPermissions(): Promise<boolean>;
  getHRVSamples(startDate: Date, endDate: Date): Promise<HRVSample[]>;
  getHeartRateSamples(startDate: Date, endDate: Date): Promise<HeartRateSample[]>;
  getRestingHeartRateSamples(startDate: Date, endDate: Date): Promise<HeartRateSample[]>;
  getSleepSessions(startDate: Date, endDate: Date): Promise<SleepSession[]>;
  getStepCount(startDate: Date, endDate: Date): Promise<number>;
}
