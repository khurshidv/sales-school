import { describe, it, expect } from 'vitest';
import { buildActivitySeries } from '@/lib/admin/realtime/buildActivitySeries';
import type { RecentGameEvent } from '@/lib/admin/api';

const ev = (player_id: string, minutes_ago: number): RecentGameEvent => ({
  event_type: 'choice_made',
  event_data: {},
  scenario_id: 's',
  day_id: 'd1',
  player_id,
  display_name: player_id,
  created_at: new Date(Date.now() - minutes_ago * 60_000).toISOString(),
});

describe('buildActivitySeries', () => {
  it('returns 60 buckets for the last hour, all zero on empty input', () => {
    const series = buildActivitySeries([], 60);
    expect(series).toHaveLength(60);
    expect(series.every((b) => b.count === 0)).toBe(true);
  });

  it('bucketizes events by minute and counts unique players per bucket', () => {
    const events: RecentGameEvent[] = [
      ev('p1', 5),
      ev('p2', 5),
      ev('p2', 5),
      ev('p3', 30),
    ];
    const series = buildActivitySeries(events, 60);
    expect(series[55].count).toBe(2);
    expect(series[30].count).toBe(1);
    expect(series[0].count).toBe(0);
  });

  it('each bucket has an iso label suitable for X axis', () => {
    const series = buildActivitySeries([], 5);
    expect(series).toHaveLength(5);
    for (const b of series) {
      expect(b.bucket).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
