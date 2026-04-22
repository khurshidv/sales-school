import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type LeaderboardSort = 'total_score' | 'completion_time' | 's_rating_count';
export type LeaderboardPeriod = 'week' | 'month' | 'all';

export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  avatar_id: string;
  level: number;
  total_score: number;
  scenarios_completed: number;
  best_rating: 'S' | 'A' | 'B' | 'C' | 'F' | null;
  s_rating_count: number;
  avg_completion_seconds: number | null;
}

interface Opts {
  period: LeaderboardPeriod;
  scenarioId?: string | null;
  sort: LeaderboardSort;
  limit: number;
  offset: number;
}

export async function getLeaderboard(opts: Opts): Promise<{ items: LeaderboardItem[]; total: number }> {
  const sb = createAdminClient();
  const now = Date.now();
  const fromIso =
    opts.period === 'week'  ? new Date(now - 7  * 24 * 3600 * 1000).toISOString() :
    opts.period === 'month' ? new Date(now - 30 * 24 * 3600 * 1000).toISOString() :
    null;

  let q = sb
    .from('completed_scenarios')
    .select('player_id, score, rating, time_taken, scenario_id, completed_at');
  if (fromIso) q = q.gte('completed_at', fromIso);
  if (opts.scenarioId) q = q.eq('scenario_id', opts.scenarioId);
  const { data: rows, error } = await q;
  if (error) { console.warn('[leaderboard] query', error); return { items: [], total: 0 }; }

  const agg = new Map<string, {
    score: number; completions: number; sRatings: number; timeSum: number; bestRating: string | null;
  }>();
  const ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, F: 4 };
  for (const r of (rows ?? []) as Array<{ player_id: string; score: number | null; rating: string | null; time_taken: number | null; scenario_id: string }>) {
    const key = r.player_id;
    const prev = agg.get(key) ?? { score: 0, completions: 0, sRatings: 0, timeSum: 0, bestRating: null as string | null };
    prev.score += Number(r.score ?? 0);
    prev.completions += 1;
    prev.sRatings += r.rating === 'S' ? 1 : 0;
    prev.timeSum += Number(r.time_taken ?? 0);
    if (r.rating && (prev.bestRating === null || (ORDER[r.rating] ?? 99) < (ORDER[prev.bestRating] ?? 99))) {
      prev.bestRating = r.rating;
    }
    agg.set(key, prev);
  }
  const playerIds = Array.from(agg.keys());
  const total = playerIds.length;
  if (playerIds.length === 0) return { items: [], total: 0 };

  const { data: players } = await sb.from('players')
    .select('id, display_name, avatar_id, level')
    .in('id', playerIds);
  const pmap = new Map((players ?? []).map(p => [p.id as string, p as { id: string; display_name: string; avatar_id: string; level: number }]));

  const items: LeaderboardItem[] = playerIds.map(id => {
    const p = pmap.get(id);
    const a = agg.get(id)!;
    return {
      player_id: id,
      display_name: p?.display_name ?? 'игрок',
      avatar_id: p?.avatar_id ?? 'male',
      level: p?.level ?? 1,
      total_score: a.score,
      scenarios_completed: a.completions,
      s_rating_count: a.sRatings,
      best_rating: a.bestRating as LeaderboardItem['best_rating'],
      avg_completion_seconds: a.completions > 0 ? a.timeSum / a.completions : null,
    };
  });

  const sortKey: (x: LeaderboardItem) => number =
    opts.sort === 'total_score'     ? (x) => -x.total_score :
    opts.sort === 's_rating_count'  ? (x) => -x.s_rating_count :
                                      (x) => x.avg_completion_seconds ?? Number.MAX_SAFE_INTEGER;
  items.sort((a, b) => sortKey(a) - sortKey(b));

  const page = items.slice(opts.offset, opts.offset + opts.limit);
  return { items: page, total };
}
