import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ProcessedDayData } from "@/types/health";

const CACHE_KEY = "aira_health_cache_v2";
const ONBOARDING_KEY = "aira_onboarding_complete";

interface CachedData {
  lastUpdated: string;
  data: ProcessedDayData[];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export const CacheService = {
  async saveHealth(data: ProcessedDayData[]): Promise<void> {
    try {
      const payload: CachedData = {
        lastUpdated: new Date().toISOString(),
        data,
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {}
  },

  async loadHealth(): Promise<{ data: ProcessedDayData[]; isFresh: boolean } | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const payload: CachedData = JSON.parse(raw);
      const savedDate = payload.lastUpdated.split("T")[0];
      const isFresh = savedDate === todayStr();
      return { data: payload.data, isFresh };
    } catch {
      return null;
    }
  },

  async clearHealth(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {}
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      return val === "true";
    } catch {
      return false;
    }
  },

  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
  },

  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {}
  },
};
