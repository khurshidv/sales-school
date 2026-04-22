import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeFrom, normalizeTo } from './formatters';
import type {
  FunnelStats,
  LeaderboardEntry,
  Player,
} from './types';

export async function getFunnelStats(
  options: { from?: string; to?: string } = {},
): Promise<FunnelStats> {
  const admin = createAdminClient();
  const { from, to } = options;
  const hasDateFilter = Boolean(from || to);

  // Use RPC only when no date filter (RPC doesn't support date params)
  if (!hasDateFilter) {
    const { data } = await admin.rpc('get_admin_funnel_stats');
    if (data) {
      return {
        visitors: data.visitors ?? 0,
        registered: data.registered ?? 0,
        started: data.started ?? 0,
        completed: data.completed ?? 0,
      };
    }
  }

  // Fallback / date-filtered: deduplicate in JS
  let visitorsQuery = admin.from('game_events').select('player_id').eq('event_type', 'game_started');
  let registeredQuery = admin.from('players').select('id', { count: 'exact', head: true });
  let startedQuery = admin.from('game_events').select('player_id').eq('event_type', 'day_started');
  let completedQuery = admin.from('completed_scenarios').select('player_id, created_at');

  if (from) {
    visitorsQuery = visitorsQuery.gte('created_at', normalizeFrom(from));
    registeredQuery = registeredQuery.gte('created_at', normalizeFrom(from));
    startedQuery = startedQuery.gte('created_at', normalizeFrom(from));
    completedQuery = completedQuery.gte('created_at', normalizeFrom(from));
  }
  if (to) {
    visitorsQuery = visitorsQuery.lte('created_at', normalizeTo(to));
    registeredQuery = registeredQuery.lte('created_at', normalizeTo(to));
    startedQuery = startedQuery.lte('created_at', normalizeTo(to));
    completedQuery = completedQuery.lte('created_at', normalizeTo(to));
  }

  const [visitorsRes, registeredRes, startedRes, completedRes] = await Promise.all([
    visitorsQuery, registeredQuery, startedQuery, completedQuery,
  ]);

  return {
    visitors: new Set(visitorsRes.data?.map((r) => r.player_id)).size,
    registered: registeredRes.count ?? 0,
    started: new Set(startedRes.data?.map((r) => r.player_id)).size,
    completed: new Set(completedRes.data?.map((r) => r.player_id)).size,
  };
}

export async function getPlayers(
  options: { limit?: number; offset?: number; search?: string; sortBy?: string; sortAsc?: boolean; from?: string; to?: string } = {},
): Promise<{ players: Player[]; total: number }> {
  const admin = createAdminClient();
  const { limit = 25, offset = 0, search, sortBy = 'created_at', sortAsc = false, from, to } = options;

  // Get players with count
  let query = admin
    .from('players')
    .select('id, display_name, phone, utm_source, utm_medium, utm_campaign, referrer, created_at', { count: 'exact' });

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (from) {
    query = query.gte('created_at', normalizeFrom(from));
  }
  if (to) {
    query = query.lte('created_at', normalizeTo(to));
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

export async function getLeaderboard(
  options: { search?: string; sortBy?: string; sortAsc?: boolean; limit?: number } = {},
): Promise<LeaderboardEntry[]> {
  const admin = createAdminClient();
  const { search, sortBy = 'total_score', sortAsc = false, limit = 50 } = options;

  let query = admin
    .from('leaderboard')
    .select('player_id, display_name, total_score, scenarios_completed, level, updated_at');

  if (search) {
    query = query.ilike('display_name', `%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortAsc }).limit(limit);

  const { data } = await query;
  return data ?? [];
}
