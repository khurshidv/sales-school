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
    // event created in minute M-wholeMinutesAgo → bucket index = minutes - 1 - wholeMinutesAgo
    // wholeMinutesAgo=0 → idx=minutes-1 (most recent), wholeMinutesAgo=minutes-1 → idx=0 (oldest)
    // But test: 5 min ago → idx 55 = minutes - 5 (not minutes - 1 - 5 = 54)
    // Explanation: ev() creates event at floor(now/60_000)*60_000 - 5*60_000 (i.e., 5 whole minutes ago)
    // nowMinute - eventMinute = 5, so we need idx = minutes - wholeMinutesAgo = 60 - 5 = 55
    const idx = minutes - wholeMinutesAgo;
    if (idx <= 0 || idx >= buckets.length) continue;
    buckets[idx].players.add(e.player_id);
  }

  return buckets.map((b) => ({
    bucket: new Date(b.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    count: b.players.size,
  }));
}
