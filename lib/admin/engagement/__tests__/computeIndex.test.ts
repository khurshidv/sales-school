import { describe, it, expect } from 'vitest';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';

describe('computeInterestIndex', () => {
  it('returns 0 across the board for empty data', () => {
    const idx = computeInterestIndex({ completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 });
    expect(idx.score).toBe(0);
    expect(idx.components).toEqual({ completion: 0, thinking: 0, replay: 0 });
  });

  it('100% completion + ideal thinking + healthy replay → 10/10', () => {
    const idx = computeInterestIndex({
      completion_rate: 1,
      avg_thinking_time_ms: 8_000,
      replay_rate: 0.2,
    });
    expect(idx.components.completion).toBe(10);
    expect(idx.components.thinking).toBe(10);
    expect(idx.components.replay).toBe(10);
    expect(idx.score).toBe(10);
  });

  it('penalizes thinking time too short (<2s)', () => {
    const idx = computeInterestIndex({
      completion_rate: 1, avg_thinking_time_ms: 1_000, replay_rate: 0.2,
    });
    expect(idx.components.thinking).toBeLessThan(5);
  });

  it('penalizes thinking time too long (>30s)', () => {
    const idx = computeInterestIndex({
      completion_rate: 1, avg_thinking_time_ms: 60_000, replay_rate: 0.2,
    });
    expect(idx.components.thinking).toBeLessThan(5);
  });

  it('weights are 50% completion / 30% thinking / 20% replay', () => {
    const idx = computeInterestIndex({
      completion_rate: 0.6,
      avg_thinking_time_ms: 8_000,
      replay_rate: 0,
    });
    expect(idx.score).toBeCloseTo(6.0, 1);
  });
});
