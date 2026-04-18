import type { UtmFunnelRow } from '@/lib/admin/types-v2';

export interface UtmRollupRow {
  source: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  completionRate: number; // 0..100, % of visitors who completed
}

export interface UtmRollupTotals {
  visitors: number;
  registered: number;
  started: number;
  completed: number;
}

export interface UtmRollup {
  rows: UtmRollupRow[];
  totals: UtmRollupTotals;
}

/**
 * Rolls UTM funnel rows into a sorted list (best converters first) plus
 * column totals. Conversion rate = completed/visitors * 100, clamped to
 * non-NaN (zero-visitor sources show 0%).
 */
export function computeUtmRollup(input: UtmFunnelRow[]): UtmRollup {
  const totals: UtmRollupTotals = { visitors: 0, registered: 0, started: 0, completed: 0 };
  const rows: UtmRollupRow[] = input.map((r) => {
    totals.visitors += r.visitors;
    totals.registered += r.registered;
    totals.started += r.started;
    totals.completed += r.completed;
    const completionRate = r.visitors > 0 ? (r.completed / r.visitors) * 100 : 0;
    return {
      source: r.utm_source,
      visitors: r.visitors,
      registered: r.registered,
      started: r.started,
      completed: r.completed,
      completionRate,
    };
  });
  rows.sort((a, b) => b.completionRate - a.completionRate);
  return { rows, totals };
}
