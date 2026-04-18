import type { Period, DateRange } from './types-v2';

export function periodToRange(period: Period, now: Date = new Date()): DateRange {
  if (period === 'all') return { from: null, to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}
