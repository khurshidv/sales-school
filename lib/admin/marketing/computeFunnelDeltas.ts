import type { FunnelStep } from '@/lib/admin/types-v2';

/**
 * Convert a sequence of (label, value) into funnel steps with per-step
 * retention (`pctOfPrev`) and overall retention (`pctOfTop`).
 *
 * NaN-safe: when the divisor is 0 the percentage is reported as 0 instead
 * of NaN/Infinity, so chart components don't render garbage.
 */
export function computeFunnelDeltas(
  steps: Array<{ label: string; value: number }>,
): FunnelStep[] {
  if (steps.length === 0) return [];
  const top = steps[0].value;
  return steps.map((s, i) => {
    const prev = i === 0 ? s.value : steps[i - 1].value;
    const pctOfPrev = prev > 0 ? (s.value / prev) * 100 : 0;
    const pctOfTop = top > 0 ? (s.value / top) * 100 : 0;
    return { label: s.label, value: s.value, pctOfPrev, pctOfTop };
  });
}
