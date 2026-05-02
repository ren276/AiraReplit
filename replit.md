# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## AIRA Health Analytics — Mobile App (`artifacts/aira`)

Expo React Native app (iOS + Android + web demo). Bevel/Whoop-inspired dark UI.

### Architecture

**Algorithm layer** (`algorithms/`)
- `hrv.ts` — z-score baseline normalization, avg HRV
- `sleep.ts` — stage parsing (deep/REM/light), efficiency score
- `readiness.ts` — WHOOP-style composite score: HRV 40%, RHR 25%, Sleep 35%
- `insights.ts` — context-aware plain-language coaching strings

**Platform services** (`services/`)
- `HealthService.android.ts` — Android Health Connect via `react-native-health-connect`
- `HealthService.ios.ts` — Apple HealthKit via `react-native-health`
- `HealthService.ts` — Web/demo stub (returns unavailable — triggers demo data)
- Metro resolves the correct platform file automatically via `.android.ts`/`.ios.ts`/`.ts` suffixes
- `CacheService.ts` — AsyncStorage cache keyed by date (v2), also stores onboarding state
- `HealthDataPipeline.ts` — 30-day sync: fetches sleep/HRV/HR/steps in parallel, groups by day, calculates baseline, runs readiness algo. Falls back to `getDemoData()` if unavailable.

**Context** (`context/`)
- `HealthContext.tsx` — `useHealth()`: `today`, `history`, `last7Days`, `isLoading`, `isDemoMode`, `hasPermissions`, `syncProgress`, `refresh`, `requestPermissionsAndSync`
- `OnboardingContext.tsx` — `useOnboarding()`: `isOnboardingComplete`, `completeOnboarding`, `resetOnboarding`

**Types** (`types/health.ts`)
- `ProcessedDayData` — `{ date, metrics: DayMetrics, readiness: { score, status, breakdown, insight }, isDemoMode }`
- `IHealthService` — interface implemented by all three platform services

**Onboarding flow** (`app/onboarding/`)
- `welcome.tsx` — animated ring (SVG strokeDashoffset), pulsing glow, always-visible text/buttons
- `features.tsx` — 3-slide paginated feature highlights
- `permissions.tsx` — permission list with privacy statement
- `syncing.tsx` — calls `requestPermissionsAndSync`, animated progress ring, step indicators

**Tab screens** (`app/(tabs)/`)
- `index.tsx` — Today: skeleton loader, demo banner, readiness ring, insight card, breakdown bars, metric cards
- `trends.tsx` — 7-day charts per metric, 14-day readiness history
- `insights.tsx` — 21-day accordion list, 4-stat summary header
- `profile.tsx` — device selector, connect wearable CTA, settings, reset onboarding

### Key Implementation Notes

- **All Animated APIs use `useNativeDriver: false`** — `useNativeDriver: true` is not supported on Expo web (the web preview) and causes animation values to stay at their initial state. JS-driven animations work on all platforms.
- **Demo mode**: web always returns demo data (WebHealthService.isAvailable → false). Native returns demo data if permissions denied or no health data found.
- **Metro config**: `blockList` merges existing pattern with `.*_tmp_\d+.*` to handle postinstall race condition from `react-native-health-connect`.
- **Platform service resolution**: Static import `from "@/services/HealthService"` — Metro picks the right suffix at bundle time. Never use dynamic imports with explicit platform suffixes.
