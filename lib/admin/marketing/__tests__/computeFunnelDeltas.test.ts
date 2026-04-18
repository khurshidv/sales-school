import { describe, it, expect } from 'vitest';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';

describe('computeFunnelDeltas', () => {
  it('returns empty array for empty input', () => {
    expect(computeFunnelDeltas([])).toEqual([]);
  });

  it('returns 100% pctOfPrev and pctOfTop for single step', () => {
    expect(computeFunnelDeltas([{ label: 'a', value: 10 }])).toEqual([
      { label: 'a', value: 10, pctOfPrev: 100, pctOfTop: 100 },
    ]);
  });

  it('computes per-step retention and overall retention', () => {
    const steps = computeFunnelDeltas([
      { label: 'visitors', value: 100 },
      { label: 'registered', value: 80 },
      { label: 'started', value: 60 },
      { label: 'completed', value: 30 },
    ]);
    expect(steps).toEqual([
      { label: 'visitors', value: 100, pctOfPrev: 100, pctOfTop: 100 },
      { label: 'registered', value: 80, pctOfPrev: 80, pctOfTop: 80 },
      { label: 'started', value: 60, pctOfPrev: 75, pctOfTop: 60 },
      { label: 'completed', value: 30, pctOfPrev: 50, pctOfTop: 30 },
    ]);
  });

  it('returns 0 (not NaN) when previous step is 0', () => {
    const steps = computeFunnelDeltas([
      { label: 'a', value: 0 },
      { label: 'b', value: 5 },
    ]);
    expect(steps[1].pctOfPrev).toBe(0);
    expect(steps[1].pctOfTop).toBe(0);
  });
});
