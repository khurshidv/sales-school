import { describe, it, expect } from 'vitest';
import { parseJourney } from '@/lib/admin/player/parseJourney';
import type { PlayerJourneyEvent } from '@/lib/admin/types-v2';

const ev = (
  event_type: string,
  day_id: string | null,
  created_at: string,
  event_data: Record<string, unknown> = {},
): PlayerJourneyEvent => ({ event_type, event_data, scenario_id: 'car-dealership', day_id, created_at });

describe('parseJourney', () => {
  it('returns empty journey for empty input', () => {
    expect(parseJourney([])).toEqual({
      days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null,
    });
  });

  it('groups events by day_id and detects completed/failed/in_progress', () => {
    const events: PlayerJourneyEvent[] = [
      ev('game_started', null, '2026-04-10T10:00:00Z'),
      ev('day_started', 'day1', '2026-04-10T10:01:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:02:00Z', { thinking_time_ms: 4000 }),
      ev('day_completed', 'day1', '2026-04-10T10:05:00Z'),
      ev('day_started', 'day2', '2026-04-10T10:06:00Z'),
      ev('choice_made', 'day2', '2026-04-10T10:07:00Z', { thinking_time_ms: 8000 }),
      ev('day_failed', 'day2', '2026-04-10T10:09:00Z'),
      ev('day_started', 'day3', '2026-04-10T10:10:00Z'),
      ev('choice_made', 'day3', '2026-04-10T10:11:00Z', { thinking_time_ms: 6000 }),
    ];
    const j = parseJourney(events);
    expect(j.totalEvents).toBe(9);
    expect(j.firstSeenAt).toBe('2026-04-10T10:00:00Z');
    expect(j.lastSeenAt).toBe('2026-04-10T10:11:00Z');
    expect(j.days.map((d) => d.day_id)).toEqual(['day1', 'day2', 'day3']);
    expect(j.days[0].outcome).toBe('completed');
    expect(j.days[1].outcome).toBe('failed');
    expect(j.days[2].outcome).toBe('in_progress');
  });

  it('counts choices, back navigations, and total thinking time', () => {
    const events: PlayerJourneyEvent[] = [
      ev('day_started', 'day1', '2026-04-10T10:00:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:01:00Z', { thinking_time_ms: 3000 }),
      ev('back_navigation', 'day1', '2026-04-10T10:02:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:03:00Z', { thinking_time_ms: 5000 }),
      ev('day_completed', 'day1', '2026-04-10T10:04:00Z'),
    ];
    const j = parseJourney(events);
    expect(j.days[0].choices_made).toBe(2);
    expect(j.days[0].back_navigations).toBe(1);
    expect(j.days[0].total_thinking_time_ms).toBe(8000);
  });

  it('counts sessions as distinct game_started events', () => {
    const events: PlayerJourneyEvent[] = [
      ev('game_started', null, '2026-04-10T10:00:00Z'),
      ev('game_started', null, '2026-04-11T09:00:00Z'),
      ev('game_started', null, '2026-04-12T15:00:00Z'),
    ];
    expect(parseJourney(events).totalSessions).toBe(3);
  });

  it('marks day with no day_started but events as in_progress', () => {
    const events: PlayerJourneyEvent[] = [
      ev('choice_made', 'day1', '2026-04-10T10:01:00Z'),
    ];
    const j = parseJourney(events);
    expect(j.days[0].outcome).toBe('in_progress');
    expect(j.days[0].started_at).toBeNull();
  });
});
