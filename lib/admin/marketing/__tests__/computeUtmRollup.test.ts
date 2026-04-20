import { describe, it, expect } from 'vitest';
import { computeUtmRollup } from '@/lib/admin/marketing/computeUtmRollup';
import type { UtmFunnelRow } from '@/lib/admin/types-v2';

describe('computeUtmRollup', () => {
  it('returns empty object on empty input', () => {
    expect(computeUtmRollup([])).toEqual({
      rows: [],
      totals: { visitors: 0, registered: 0, started: 0, completed: 0, consultations: 0 },
    });
  });

  it('computes per-source conversion and totals', () => {
    const rows: UtmFunnelRow[] = [
      { utm_source: 'instagram', visitors: 100, registered: 100, started: 60, completed: 30, consultations: 0 },
      { utm_source: '(none)', visitors: 50, registered: 50, started: 40, completed: 25, consultations: 0 },
    ];
    const out = computeUtmRollup(rows);
    expect(out.totals).toEqual({ visitors: 150, registered: 150, started: 100, completed: 55, consultations: 0 });
    expect(out.rows[0].source).toBe('(none)');
    expect(out.rows[0].completionRate).toBeCloseTo(50, 1);
    expect(out.rows[1].completionRate).toBeCloseTo(30, 1);
  });

  it('sorts by completion rate descending', () => {
    const out = computeUtmRollup([
      { utm_source: 'low', visitors: 100, registered: 100, started: 50, completed: 5, consultations: 0 },
      { utm_source: 'high', visitors: 20, registered: 20, started: 18, completed: 15, consultations: 0 },
      { utm_source: 'mid', visitors: 50, registered: 50, started: 40, completed: 20, consultations: 0 },
    ]);
    expect(out.rows.map((r) => r.source)).toEqual(['high', 'mid', 'low']);
  });

  it('treats divisions by zero as 0 not NaN', () => {
    const out = computeUtmRollup([
      { utm_source: 'empty', visitors: 0, registered: 0, started: 0, completed: 0, consultations: 0 },
    ]);
    expect(out.rows[0].completionRate).toBe(0);
  });
});
