import React, { createContext, useContext, useMemo } from "react";
import { DailyHealthData, getLast30Days } from "@/utils/healthUtils";

interface HealthContextValue {
  today: DailyHealthData;
  history: DailyHealthData[];
  last7Days: DailyHealthData[];
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const data = useMemo(() => getLast30Days(), []);
  const today = data[data.length - 1];
  const last7Days = data.slice(-7);

  return (
    <HealthContext.Provider value={{ today, history: data, last7Days }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
}
