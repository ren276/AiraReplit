import type {
  HeartRateSample,
  HRVSample,
  IHealthService,
  SleepSession,
} from "@/types/health";

class WebHealthService implements IHealthService {
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async requestPermissions(): Promise<{ granted: boolean; partial: boolean }> {
    return { granted: false, partial: false };
  }
  async checkPermissions(): Promise<boolean> {
    return false;
  }
  async getHRVSamples(_s: Date, _e: Date): Promise<HRVSample[]> {
    return [];
  }
  async getHeartRateSamples(_s: Date, _e: Date): Promise<HeartRateSample[]> {
    return [];
  }
  async getRestingHeartRateSamples(_s: Date, _e: Date): Promise<HeartRateSample[]> {
    return [];
  }
  async getSleepSessions(_s: Date, _e: Date): Promise<SleepSession[]> {
    return [];
  }
  async getStepCount(_s: Date, _e: Date): Promise<number> {
    return 0;
  }
}

export default new WebHealthService();
