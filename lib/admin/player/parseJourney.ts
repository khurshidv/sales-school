import type { PlayerJourneyEvent, ParsedJourney, ParsedJourneyDay } from '@/lib/admin/types-v2';

/**
 * Group raw event timeline by day_id and classify each day's outcome.
 * Sessions = distinct `game_started` events.
 */
export function parseJourney(events: PlayerJourneyEvent[]): ParsedJourney {
  if (events.length === 0) {
    return { days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null };
  }

  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const dayMap = new Map<string, ParsedJourneyDay>();
  let totalSessions = 0;

  for (const e of sorted) {
    if (e.event_type === 'game_started') totalSessions += 1;
    if (e.day_id == null) continue;

    if (!dayMap.has(e.day_id)) {
      dayMap.set(e.day_id, {
        day_id: e.day_id,
        scenario_id: e.scenario_id,
        events: [],
        started_at: null,
        completed_at: null,
        outcome: 'in_progress',
        choices_made: 0,
        back_navigations: 0,
        total_thinking_time_ms: 0,
      });
    }
    const day = dayMap.get(e.day_id)!;
    day.events.push(e);

    switch (e.event_type) {
      case 'day_started':
        day.started_at = e.created_at;
        break;
      case 'day_completed':
        day.completed_at = e.created_at;
        day.outcome = 'completed';
        break;
      case 'day_failed':
        day.completed_at = e.created_at;
        day.outcome = 'failed';
        break;
      case 'choice_made': {
        day.choices_made += 1;
        const tt = (e.event_data as { thinking_time_ms?: number }).thinking_time_ms;
        if (typeof tt === 'number') day.total_thinking_time_ms += tt;
        break;
      }
      case 'back_navigation':
        day.back_navigations += 1;
        break;
    }
  }

  const days = Array.from(dayMap.values()).sort((a, b) => a.day_id.localeCompare(b.day_id));

  return {
    days,
    totalEvents: sorted.length,
    totalSessions,
    firstSeenAt: sorted[0].created_at,
    lastSeenAt: sorted[sorted.length - 1].created_at,
  };
}
