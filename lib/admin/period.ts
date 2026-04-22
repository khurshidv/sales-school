import type { Period, DateRange } from './types-v2';

export interface PeriodInput {
  period: Period;
  from?: string | null; // ISO date string or YYYY-MM-DD, only used when period === 'custom'
  to?: string | null;
}

export function periodToRange(
  input: Period | PeriodInput,
  now: Date = new Date(),
): DateRange {
  const period = typeof input === 'string' ? input : input.period;

  if (period === 'all') return { from: null, to: null };

  if (period === 'custom') {
    const p = typeof input === 'string' ? { from: null, to: null } : input;
    const from = safeDateIso(p.from, toStartOfDayIso);
    const to = safeDateIso(p.to, toEndOfDayIso);
    return { from, to };
  }

  if (period === 'today') {
    return { from: toStartOfDayIso(now), to: toEndOfDayIso(now) };
  }

  if (period === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: toStartOfDayIso(y), to: toEndOfDayIso(y) };
  }

  // '7d' | '30d' | '90d': last N days, no upper bound (consistent with existing behavior)
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}

function toStartOfDayIso(d: Date | string): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function toEndOfDayIso(d: Date | string): string {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function safeDateIso(raw: string | null | undefined, fn: (d: string) => string): string | null {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return fn(raw);
}
