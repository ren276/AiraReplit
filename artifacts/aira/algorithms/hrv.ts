export function calculateBaseline(values: number[]): { avg: number; std: number } {
  const valid = values.filter((v) => v > 0);
  if (!valid.length) return { avg: 0, std: 0 };
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const variance = valid.reduce((sum, v) => sum + (v - avg) ** 2, 0) / valid.length;
  return { avg, std: Math.sqrt(variance) };
}

export function calculateHRVScore(
  currentHRV: number | null,
  baseline: { avg: number; std: number }
): number {
  if (!currentHRV || !baseline.avg) return 50;
  const std = Math.max(baseline.std, baseline.avg * 0.08);
  const z = (currentHRV - baseline.avg) / std;
  const score = 60 + z * 22;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function avgHRV(samples: number[]): number | null {
  const valid = samples.filter((v) => v > 0);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
