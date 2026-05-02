import AppleHealthKit, {
  HealthKitPermissions,
} from "react-native-health";

import type {
  HeartRateSample,
  HRVSample,
  IHealthService,
  SleepSession,
  SleepStageEntry,
} from "@/types/health";

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
    ],
    write: [],
  },
};

function mapHKSleepStage(value: string): SleepStageEntry["stage"] {
  if (value === "DEEP") return "deep";
  if (value === "REM") return "rem";
  if (value === "CORE" || value === "ASLEEP") return "light";
  if (value === "AWAKE" || value === "INBED") return "awake";
  return "light";
}

class IOSHealthService implements IHealthService {
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<{ granted: boolean; partial: boolean }> {
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (err) => {
        if (err) {
          resolve({ granted: false, partial: false });
        } else {
          this.initialized = true;
          resolve({ granted: true, partial: false });
        }
      });
    });
  }

  async checkPermissions(): Promise<boolean> {
    if (this.initialized) return true;
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (err) => {
        if (err) { resolve(false); return; }
        this.initialized = true;
        resolve(true);
      });
    });
  }

  private opts(startDate: Date, endDate: Date) {
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 2000,
      ascending: true,
    };
  }

  async getHRVSamples(startDate: Date, endDate: Date): Promise<HRVSample[]> {
    if (!this.initialized) return [];
    return new Promise((resolve) => {
      AppleHealthKit.getHeartRateVariabilitySamples(
        this.opts(startDate, endDate),
        (err, results) => {
          if (err || !results) { resolve([]); return; }
          resolve(
            results.map((r) => ({
              timestamp: new Date(r.startDate),
              sdnn: r.value,
            }))
          );
        }
      );
    });
  }

  async getHeartRateSamples(
    startDate: Date,
    endDate: Date
  ): Promise<HeartRateSample[]> {
    if (!this.initialized) return [];
    return new Promise((resolve) => {
      AppleHealthKit.getHeartRateSamples(
        this.opts(startDate, endDate),
        (err, results) => {
          if (err || !results) { resolve([]); return; }
          resolve(
            results.map((r) => ({
              timestamp: new Date(r.startDate),
              bpm: r.value,
            }))
          );
        }
      );
    });
  }

  async getRestingHeartRateSamples(
    startDate: Date,
    endDate: Date
  ): Promise<HeartRateSample[]> {
    if (!this.initialized) return [];
    return new Promise((resolve) => {
      AppleHealthKit.getRestingHeartRateSamples(
        this.opts(startDate, endDate),
        (err, results) => {
          if (err || !results) { resolve([]); return; }
          resolve(
            results.map((r) => ({
              timestamp: new Date(r.startDate),
              bpm: r.value,
            }))
          );
        }
      );
    });
  }

  async getSleepSessions(
    startDate: Date,
    endDate: Date
  ): Promise<SleepSession[]> {
    if (!this.initialized) return [];
    return new Promise((resolve) => {
      AppleHealthKit.getSleepSamples(
        this.opts(startDate, endDate),
        (err, results) => {
          if (err || !results || !results.length) { resolve([]); return; }

          const sorted = [...results].sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

          const sessions: SleepSession[] = [];
          let sessionStart = new Date(sorted[0].startDate);
          let sessionEnd = new Date(sorted[0].endDate);
          let stages: SleepStageEntry[] = [];

          for (const sample of sorted) {
            const sStart = new Date(sample.startDate);
            const sEnd = new Date(sample.endDate);

            if (
              sStart.getTime() - sessionEnd.getTime() > 30 * 60 * 1000 &&
              stages.length
            ) {
              sessions.push({ startTime: sessionStart, endTime: sessionEnd, stages });
              sessionStart = sStart;
              stages = [];
            }

            sessionEnd = sEnd;
            stages.push({
              stage: mapHKSleepStage(sample.value as string),
              startTime: sStart,
              endTime: sEnd,
            });
          }

          if (stages.length) {
            sessions.push({ startTime: sessionStart, endTime: sessionEnd, stages });
          }

          resolve(sessions);
        }
      );
    });
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    if (!this.initialized) return 0;
    return new Promise((resolve) => {
      AppleHealthKit.getStepCount(
        this.opts(startDate, endDate),
        (err, result) => {
          if (err || !result) { resolve(0); return; }
          resolve(result.value);
        }
      );
    });
  }
}

export default new IOSHealthService();
