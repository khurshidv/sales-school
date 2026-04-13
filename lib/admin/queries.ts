import { createAdminClient } from '@/lib/supabase/admin';
import type {
  DayDropoff,
  FunnelStats,
  GameMetrics,
  LeaderboardEntry,
  Player,
  RatingCount,
  ScenarioStats,
} from './types';

export async function getFunnelStats(): Promise<FunnelStats> {
  const admin = createAdminClient();

  // Use raw SQL via RPC to get COUNT(DISTINCT player_id) for accurate unique counts
  const { data } = await admin.rpc('get_admin_funnel_stats');

  if (data) {
    return {
      visitors: data.visitors ?? 0,
      registered: data.registered ?? 0,
      started: data.started ?? 0,
      completed: data.completed ?? 0,
    };
  }

  // Fallback: deduplicate in JS if RPC not yet deployed
  const [visitorsRes, registeredRes, startedRes, completedRes] = await Promise.all([
    admin.from('game_events').select('player_id').eq('event_type', 'game_started'),
    admin.from('players').select('id', { count: 'exact', head: true }),
    admin.from('game_events').select('player_id').eq('event_type', 'day_started'),
    admin.from('completed_scenarios').select('player_id'),
  ]);

  return {
    visitors: new Set(visitorsRes.data?.map((r) => r.player_id)).size,
    registered: registeredRes.count ?? 0,
    started: new Set(startedRes.data?.map((r) => r.player_id)).size,
    completed: new Set(completedRes.data?.map((r) => r.player_id)).size,
  };
}

export async function getPlayers(
  options: { limit?: number; offset?: number; search?: string; sortBy?: string; sortAsc?: boolean } = {},
): Promise<{ players: Player[]; total: number }> {
  const admin = createAdminClient();
  const { limit = 25, offset = 0, search, sortBy = 'created_at', sortAsc = false } = options;

  // Get players with count
  let query = admin
    .from('players')
    .select('id, display_name, phone, utm_source, utm_medium, utm_campaign, referrer, created_at', { count: 'exact' });

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortAsc }).range(offset, offset + limit - 1);

  const playersRes = await query;
  const players = playersRes.data ?? [];
  const total = playersRes.count ?? 0;

  if (players.length === 0) {
    return { players: [], total };
  }

  // Get last activity only for the current page of players (not ALL events)
  const playerIds = players.map((p) => p.id);
  const { data: activityData } = await admin
    .from('game_events')
    .select('player_id, created_at')
    .in('player_id', playerIds)
    .order('created_at', { ascending: false });

  const lastActivityMap = new Map<string, string>();
  for (const e of activityData ?? []) {
    if (!lastActivityMap.has(e.player_id)) {
      lastActivityMap.set(e.player_id, e.created_at);
    }
  }

  return {
    players: players.map((p) => ({
      ...p,
      last_activity: lastActivityMap.get(p.id) ?? null,
    })),
    total,
  };
}

export async function getGameMetrics(): Promise<GameMetrics> {
  const admin = createAdminClient();

  const [completionsRes, dayEventsRes] = await Promise.all([
    admin
      .from('completed_scenarios')
      .select('score, rating, time_taken, scenario_id'),
    admin
      .from('game_events')
      .select('day_id, event_type, player_id')
      .in('event_type', ['day_started', 'day_completed', 'day_failed', 'dropped_off']),
  ]);

  const completions = completionsRes.data ?? [];
  const dayEvents = dayEventsRes.data ?? [];

  // Aggregate completions
  const totalCompletions = completions.length;
  const avgScore =
    totalCompletions > 0
      ? Math.round(completions.reduce((sum, c) => sum + c.score, 0) / totalCompletions)
      : 0;

  // Rating distribution
  const ratingMap = new Map<string, number>();
  for (const c of completions) {
    ratingMap.set(c.rating, (ratingMap.get(c.rating) ?? 0) + 1);
  }
  const ratings: RatingCount[] = ['S', 'A', 'B', 'C', 'F'].map((r) => ({
    rating: r,
    count: ratingMap.get(r) ?? 0,
  }));

  // Scenario stats
  const scenarioMap = new Map<
    string,
    { total_score: number; total_time: number; count: number }
  >();
  for (const c of completions) {
    const existing = scenarioMap.get(c.scenario_id) ?? {
      total_score: 0,
      total_time: 0,
      count: 0,
    };
    scenarioMap.set(c.scenario_id, {
      total_score: existing.total_score + c.score,
      total_time: existing.total_time + c.time_taken,
      count: existing.count + 1,
    });
  }
  const scenarios: ScenarioStats[] = Array.from(scenarioMap.entries()).map(
    ([scenario_id, s]) => ({
      scenario_id,
      play_count: s.count,
      avg_score: Math.round(s.total_score / s.count),
      avg_time_seconds: Math.round(s.total_time / s.count),
    })
  );

  // Day drop-off
  const dayStarted = new Map<string, Set<string>>();
  const dayCompleted = new Map<string, Set<string>>();
  for (const e of dayEvents) {
    if (!e.day_id) continue;
    if (e.event_type === 'day_started') {
      const set = dayStarted.get(e.day_id) ?? new Set();
      set.add(e.player_id);
      dayStarted.set(e.day_id, set);
    } else if (e.event_type === 'day_completed') {
      const set = dayCompleted.get(e.day_id) ?? new Set();
      set.add(e.player_id);
      dayCompleted.set(e.day_id, set);
    }
  }
  const allDays = Array.from(new Set([...dayStarted.keys(), ...dayCompleted.keys()])).sort();
  const dayDropoff: DayDropoff[] = allDays.map((day_id) => {
    const started = dayStarted.get(day_id)?.size ?? 0;
    const completed = dayCompleted.get(day_id)?.size ?? 0;
    return {
      day_id,
      started,
      completed,
      dropoff_rate: started > 0 ? Math.round(((started - completed) / started) * 100) : 0,
    };
  });

  return { avg_score: avgScore, total_completions: totalCompletions, ratings, scenarios, dayDropoff };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('leaderboard')
    .select('player_id, display_name, total_score, scenarios_completed, level, updated_at')
    .order('total_score', { ascending: false })
    .limit(50);
  return data ?? [];
}
