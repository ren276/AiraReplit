import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CacheService } from "@/services/CacheService";

interface OnboardingContextValue {
  isReady: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    CacheService.isOnboardingComplete().then((val) => {
      setIsOnboardingComplete(val);
      setIsReady(true);
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await CacheService.setOnboardingComplete();
    setIsOnboardingComplete(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await CacheService.resetOnboarding();
    setIsOnboardingComplete(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isReady,
        isOnboardingComplete,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
