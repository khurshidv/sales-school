'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export interface UseRealtimeGameEventsArgs {
  enabled?: boolean;
  bufferSize?: number;
}

/**
 * Subscribes to INSERTs on `game_events` via Supabase Realtime.
 * Returns a buffered list of recent live events (newest first).
 */
export function useRealtimeGameEvents(args: UseRealtimeGameEventsArgs = {}): RecentGameEvent[] {
  const { enabled = true, bufferSize = 200 } = args;
  const [events, setEvents] = useState<RecentGameEvent[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel('admin_realtime_game_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_events' },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as {
            event_type: string;
            event_data: Record<string, unknown> | null;
            scenario_id: string | null;
            day_id: string | null;
            player_id: string;
            created_at: string;
          };
          const incoming: RecentGameEvent = {
            event_type: row.event_type,
            event_data: row.event_data ?? {},
            scenario_id: row.scenario_id,
            day_id: row.day_id,
            player_id: row.player_id,
            display_name: null,
            created_at: row.created_at,
          };
          setEvents((prev) => [incoming, ...prev].slice(0, bufferSize));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, bufferSize]);

  return events;
}
