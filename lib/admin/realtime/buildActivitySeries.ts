import type { RecentGameEvent } from '@/lib/admin/api';

export interface ActivityBucket {
  bucket: string;
  count: number;
}

/**
 * Builds a 1-minute-bucket time series for the last `minutes` minutes,
 * ending at "now". Each bucket reports unique active players.
 */
export function buildActivitySeries(events: RecentGameEvent[], minutes: number): ActivityBucket[] {
  const now = Date.now();
  const buckets: { time: number; players: Set<string> }[] = [];
  for (let i = 0; i < minutes; i++) {
    const time = now - (minutes - 1 - i) * 60_000;
    buckets.push({ time, players: new Set() });
  }

  // Snap "now" to the start of the current minute so all comparisons are minute-stable
  const nowMinute = Math.floor(now / 60_000);

  for (const e of events) {
    const eventTime = new Date(e.created_at).getTime();
    const eventMinute = Math.floor(eventTime / 60_000);
    const wholeMinutesAgo = nowMinute - eventMinute;
    if (wholeMinutesAgo < 0 || wholeMinutesAgo >= minutes) continue;
    // wholeMinutesAgo=0 (current minute) → idx=minutes-1 (most recent bucket)
    // wholeMinutesAgo=minutes-1 (oldest minute) → idx=0
    const idx = minutes - 1 - wholeMinutesAgo;
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx].players.add(e.player_id);
  }

  return buckets.map((b) => ({
    bucket: new Date(b.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    count: b.players.size,
  }));
}
