import { createClient } from '@/lib/supabase/client';

export function trackEvent(
  playerId: string,
  eventType: string,
  eventData?: Record<string, unknown>,
  scenarioId?: string,
  dayId?: string,
): void {
  // Fire-and-forget — no await, no error handling in UI
  const supabase = createClient();
  supabase
    .from('game_events')
    .insert({
      player_id: playerId,
      event_type: eventType,
      event_data: eventData || {},
      scenario_id: scenarioId || null,
      day_id: dayId || null,
    })
    .then(({ error }) => {
      if (error) console.warn('[analytics]', eventType, error.message);
    });
}
