import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CacheService } from "@/services/CacheService";
import {
  SyncProgress,
  getDemoData,
  runSyncPipeline,
} from "@/services/HealthDataPipeline";
// Metro automatically picks HealthService.android.ts / HealthService.ios.ts / HealthService.ts
import healthService from "@/services/HealthService";
import type { ProcessedDayData } from "@/types/health";

interface HealthContextValue {
  isLoading: boolean;
  isDemoMode: boolean;
  hasPermissions: boolean;
  today: ProcessedDayData | null;
  history: ProcessedDayData[];
  last7Days: ProcessedDayData[];
  syncProgress: SyncProgress | null;
  refresh: () => Promise<void>;
  requestPermissionsAndSync: () => Promise<boolean>;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [data, setData] = useState<ProcessedDayData[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  const applyData = useCallback((days: ProcessedDayData[]) => {
    setData(days);
    const allDemo = days.every((d) => d.isDemoMode);
    setIsDemoMode(allDemo);
    setHasPermissions(!allDemo);
  }, []);

  const load = useCallback(
    async (force = false) => {
      setIsLoading(true);

      if (!force) {
        const cached = await CacheService.loadHealth();
        if (cached?.isFresh) {
          applyData(cached.data);
          setIsLoading(false);
          return;
        }
        if (cached?.data.length) {
          applyData(cached.data);
        }
      }

      try {
        const processed = await runSyncPipeline(healthService, setSyncProgress);
        await CacheService.saveHealth(processed);
        applyData(processed);
      } catch {
        applyData(getDemoData());
      } finally {
        setIsLoading(false);
        setSyncProgress(null);
      }
    },
    [applyData]
  );

  useEffect(() => {
    load();
  }, []);

  const requestPermissionsAndSync = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setSyncProgress("connecting");
    try {
      const { granted, partial } = await healthService.requestPermissions();
      // Accept full or partial grants — even HR + Sleep alone gives a useful score
      if (!granted && !partial) {
        applyData(getDemoData());
        setIsLoading(false);
        setSyncProgress(null);
        return false;
      }
      const processed = await runSyncPipeline(healthService, setSyncProgress);
      await CacheService.saveHealth(processed);
      applyData(processed);
      return true;
    } catch {
      applyData(getDemoData());
      return false;
    } finally {
      setIsLoading(false);
      setSyncProgress(null);
    }
  }, [applyData]);

  const today = data[data.length - 1] ?? null;
  const last7Days = data.slice(-7);

  return (
    <HealthContext.Provider
      value={{
        isLoading,
        isDemoMode,
        hasPermissions,
        today,
        history: data,
        last7Days,
        syncProgress,
        refresh: () => load(true),
        requestPermissionsAndSync,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
}
