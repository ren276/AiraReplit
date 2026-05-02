import {
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

import type {
  HeartRateSample,
  HRVSample,
  IHealthService,
  SleepSession,
  SleepStageEntry,
} from "@/types/health";

type HealthConnectStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function mapStage(stage: HealthConnectStage): SleepStageEntry["stage"] {
  if (stage === 1 || stage === 3) return "awake";
  if (stage === 4) return "light";
  if (stage === 5) return "deep";
  if (stage === 6) return "rem";
  return "light";
}

const PERMISSIONS = [
  { accessType: "read" as const, recordType: "HeartRateVariabilitySdnn" as const },
  { accessType: "read" as const, recordType: "HeartRate" as const },
  { accessType: "read" as const, recordType: "RestingHeartRate" as const },
  { accessType: "read" as const, recordType: "SleepSession" as const },
  { accessType: "read" as const, recordType: "Steps" as const },
];

class AndroidHealthService implements IHealthService {
  async isAvailable(): Promise<boolean> {
    try {
      const status = await getSdkStatus();
      return status === SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<{ granted: boolean; partial: boolean }> {
    try {
      const ok = await initialize();
      if (!ok) return { granted: false, partial: false };
      const granted = await requestPermission(PERMISSIONS);
      const all = PERMISSIONS.length;
      const got = granted.length;
      return { granted: got === all, partial: got > 0 };
    } catch {
      return { granted: false, partial: false };
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      return await initialize();
    } catch {
      return false;
    }
  }

  private timeFilter(startDate: Date, endDate: Date) {
    return {
      operator: "between" as const,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };
  }

  async getHRVSamples(startDate: Date, endDate: Date): Promise<HRVSample[]> {
    try {
      const result = await readRecords("HeartRateVariabilitySdnn", {
        timeRangeFilter: this.timeFilter(startDate, endDate),
      });
      return result.records.map((r) => ({
        timestamp: new Date(r.time),
        sdnn: r.heartRateVariabilityMillis,
      }));
    } catch {
      return [];
    }
  }

  async getHeartRateSamples(
    startDate: Date,
    endDate: Date
  ): Promise<HeartRateSample[]> {
    try {
      const result = await readRecords("HeartRate", {
        timeRangeFilter: this.timeFilter(startDate, endDate),
      });
      const samples: HeartRateSample[] = [];
      for (const record of result.records) {
        for (const s of record.samples) {
          samples.push({ timestamp: new Date(s.time), bpm: s.beatsPerMinute });
        }
      }
      return samples;
    } catch {
      return [];
    }
  }

  async getRestingHeartRateSamples(
    startDate: Date,
    endDate: Date
  ): Promise<HeartRateSample[]> {
    try {
      const result = await readRecords("RestingHeartRate", {
        timeRangeFilter: this.timeFilter(startDate, endDate),
      });
      return result.records.map((r) => ({
        timestamp: new Date(r.time),
        bpm: r.beatsPerMinute,
      }));
    } catch {
      return [];
    }
  }

  async getSleepSessions(
    startDate: Date,
    endDate: Date
  ): Promise<SleepSession[]> {
    try {
      const result = await readRecords("SleepSession", {
        timeRangeFilter: this.timeFilter(startDate, endDate),
      });
      return result.records.map((r) => ({
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
        stages: (r.stages ?? []).map((s) => ({
          stage: mapStage(s.stage as HealthConnectStage),
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
        })),
      }));
    } catch {
      return [];
    }
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await readRecords("Steps", {
        timeRangeFilter: this.timeFilter(startDate, endDate),
      });
      return result.records.reduce((sum, r) => sum + r.count, 0);
    } catch {
      return 0;
    }
  }
}

export default new AndroidHealthService();
