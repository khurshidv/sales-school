import { describe, it, expect } from 'vitest';
import { detectAutoInsights } from '@/lib/admin/realtime/detectAutoInsights';
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

const ev = (
  event_type: string,
  player_id: string,
  day_id: string | null,
  node_id: string | null = null,
  minutes_ago = 5,
): RecentGameEvent => ({
  event_type,
  event_data: node_id ? { node_id } : {},
  scenario_id: 's',
  day_id,
  player_id,
  display_name: player_id,
  created_at: new Date(Date.now() - minutes_ago * 60_000).toISOString(),
});

describe('detectAutoInsights', () => {
  it('returns empty when no events', () => {
    expect(detectAutoInsights([])).toEqual([]);
  });

  it('flags concentration of dropoffs on a single node', () => {
    const events: RecentGameEvent[] = [];
    for (let i = 0; i < 5; i++) {
      events.push(ev('node_entered', `p${i}`, 'day1', 'problem_node', 10));
    }
    const insights = detectAutoInsights(events);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.tone === 'danger' && /problem_node/.test(String(i.body)))).toBe(true);
  });

  it('flags slow nodes — avg thinking >20s on choice_made', () => {
    const events: RecentGameEvent[] = [
      { ...ev('choice_made', 'p1', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 25_000 } },
      { ...ev('choice_made', 'p2', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 22_000 } },
      { ...ev('choice_made', 'p3', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 28_000 } },
    ];
    const insights = detectAutoInsights(events);
    expect(insights.some((i) => i.tone === 'warning' && /slow_node/.test(String(i.body)))).toBe(true);
  });

  it('reports good news when many completions, no anomalies', () => {
    const events: RecentGameEvent[] = [];
    for (let i = 0; i < 6; i++) {
      events.push(ev('day_completed', `p${i}`, 'day1'));
    }
    const insights = detectAutoInsights(events);
    expect(insights.some((i) => i.tone === 'success')).toBe(true);
  });
});
