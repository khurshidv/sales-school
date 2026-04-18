import { createAdminClient } from '@/lib/supabase/admin';
import type { BranchFlowRow, NodeStat, DropoffRow, EngagementBlob, Period, DateRange, UtmFunnelRow, DailyTrendRow, OfferFunnel, OfferBreakdownRow, PlayerJourneyEvent } from './types-v2';

interface ScenarioRange {
  scenarioId: string;
  from: string | null;
  to: string | null;
}
interface ScenarioDayRange extends ScenarioRange {
  dayId: string;
}

export async function getBranchFlow(args: ScenarioDayRange): Promise<BranchFlowRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_branch_flow', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_branch_flow', error.message);
    return [];
  }
  return (data ?? []).map((r: { from_node: string; to_node: string; flow_count: string | number }) => ({
    from_node: r.from_node,
    to_node: r.to_node,
    flow_count: Number(r.flow_count),
  }));
}

export async function getNodeStats(args: ScenarioDayRange): Promise<NodeStat[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_node_stats', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_node_stats', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    node_id: string;
    entered_count: string | number;
    avg_thinking_time_ms: string | number | null;
    exit_count: string | number;
  }) => ({
    node_id: r.node_id,
    entered_count: Number(r.entered_count),
    avg_thinking_time_ms: r.avg_thinking_time_ms != null ? Number(r.avg_thinking_time_ms) : 0,
    exit_count: Number(r.exit_count),
  }));
}

export async function getDropoffZones(args: ScenarioRange): Promise<DropoffRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_dropoff_zones', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_dropoff_zones', error.message);
    return [];
  }
  return (data ?? []).map((r: { node_id: string; day_id: string; dropoff_count: string | number }) => ({
    node_id: r.node_id,
    day_id: r.day_id,
    dropoff_count: Number(r.dropoff_count),
  }));
}

export async function getEngagementIndexRaw(args: ScenarioRange): Promise<EngagementBlob> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_engagement_index', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_engagement_index', error.message);
    return { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
  }
  const blob = data as EngagementBlob | null;
  return blob ?? { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
}

export function periodToRange(period: Period, now: Date = new Date()): DateRange {
  if (period === 'all') return { from: null, to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}

// ---- Marketing (Phase 3) ----

interface DateRangeOnly {
  from: string | null;
  to: string | null;
}

export async function getUtmFunnel(args: DateRangeOnly): Promise<UtmFunnelRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_utm_funnel', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    utm_source: string; visitors: string | number; registered: string | number;
    started: string | number; completed: string | number;
  }) => ({
    utm_source: r.utm_source,
    visitors: Number(r.visitors),
    registered: Number(r.registered),
    started: Number(r.started),
    completed: Number(r.completed),
  }));
}

export async function getDailyTrends(args: DateRangeOnly): Promise<DailyTrendRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_daily_trends', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_daily_trends', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    bucket_date: string; registered: string | number;
    game_started: string | number; game_completed: string | number;
  }) => ({
    bucket_date: r.bucket_date,
    registered: Number(r.registered),
    game_started: Number(r.game_started),
    game_completed: Number(r.game_completed),
  }));
}

const ZERO_OFFER_FUNNEL: OfferFunnel = {
  game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0,
};

export async function getOfferFunnelData(args: DateRangeOnly): Promise<OfferFunnel> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_funnel', error.message);
    return ZERO_OFFER_FUNNEL;
  }
  if (!data) return ZERO_OFFER_FUNNEL;
  return {
    game_completed: Number((data as OfferFunnel).game_completed) || 0,
    offer_view: Number((data as OfferFunnel).offer_view) || 0,
    offer_cta_click: Number((data as OfferFunnel).offer_cta_click) || 0,
    offer_conversion: Number((data as OfferFunnel).offer_conversion) || 0,
  };
}

export async function getOfferBreakdownByRating(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_rating', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_rating', error.message);
    return [];
  }
  return (data ?? []).map((r: { rating: string; views: string | number; clicks: string | number }) => ({
    segment: r.rating,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}

export async function getOfferBreakdownByUtm(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_utm', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_utm', error.message);
    return [];
  }
  return (data ?? []).map((r: { utm_source: string; views: string | number; clicks: string | number }) => ({
    segment: r.utm_source,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}

import type {
  PlayerSummary, CompletedDay, EnrichedPlayer,
} from './types-v2';

// -- Player Journey --------------------------------------------------------

export async function getPlayerJourneyData(playerId: string): Promise<PlayerJourneyEvent[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_player_journey', { p_player_id: playerId });
  if (error) {
    console.warn('[queries-v2] get_player_journey', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    event_type: string;
    event_data: Record<string, unknown> | null;
    scenario_id: string | null;
    day_id: string | null;
    created_at: string;
  }) => ({
    event_type: r.event_type,
    event_data: r.event_data ?? {},
    scenario_id: r.scenario_id,
    day_id: r.day_id,
    created_at: r.created_at,
  }));
}

// -- Player Summary --------------------------------------------------------

export async function getPlayerSummary(playerId: string): Promise<PlayerSummary | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('players')
    .select('id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_source, utm_medium, utm_campaign, referrer, device_fingerprint, last_seen_at, created_at')
    .eq('id', playerId)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn('[queries-v2] getPlayerSummary', error.message);
    return null;
  }
  return data as PlayerSummary;
}

export async function getCompletedDaysForPlayer(playerId: string): Promise<CompletedDay[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('completed_scenarios')
    .select('scenario_id, day_id, score, rating, time_taken, completed_at')
    .eq('player_id', playerId)
    .order('completed_at', { ascending: true });
  if (error || !data) {
    if (error) console.warn('[queries-v2] getCompletedDaysForPlayer', error.message);
    return [];
  }
  return data as CompletedDay[];
}

// -- Enriched Players (for Participants table) ----------------------------

const RATING_ORDER: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, F: 5 };
function bestRating(ratings: string[]): string | null {
  if (ratings.length === 0) return null;
  return [...ratings].sort((a, b) => (RATING_ORDER[a] ?? 99) - (RATING_ORDER[b] ?? 99))[0];
}

export interface GetPlayersEnrichedArgs {
  search?: string;
  ratingFilter?: string | null;
  limit?: number;
  offset?: number;
  from?: string | null;
  to?: string | null;
}

export async function getPlayersEnriched(
  args: GetPlayersEnrichedArgs = {},
): Promise<{ players: EnrichedPlayer[]; total: number }> {
  const admin = createAdminClient();
  const { search, limit = 50, offset = 0, from, to } = args;

  let q = admin
    .from('players')
    .select(
      'id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_source, utm_medium, utm_campaign, referrer, device_fingerprint, last_seen_at, created_at',
      { count: 'exact' },
    );
  if (search) q = q.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`);
  if (from) q = q.gte('created_at', from);
  if (to) q = q.lte('created_at', to);
  q = q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data: rows, count, error } = await q;
  if (error || !rows) {
    if (error) console.warn('[queries-v2] getPlayersEnriched', error.message);
    return { players: [], total: 0 };
  }

  const playerIds = rows.map((r) => r.id);
  if (playerIds.length === 0) return { players: [], total: count ?? 0 };

  const { data: completions } = await admin
    .from('completed_scenarios')
    .select('player_id, day_id, rating, completed_at')
    .in('player_id', playerIds);

  const byPlayer: Record<string, { ratings: string[]; days: Set<string>; lastAt: string | null }> = {};
  for (const id of playerIds) byPlayer[id] = { ratings: [], days: new Set(), lastAt: null };
  for (const c of completions ?? []) {
    const acc = byPlayer[c.player_id];
    if (!acc) continue;
    acc.ratings.push(c.rating);
    acc.days.add(c.day_id);
    if (!acc.lastAt || c.completed_at > acc.lastAt) acc.lastAt = c.completed_at;
  }

  let players: EnrichedPlayer[] = rows.map((r) => {
    const acc = byPlayer[r.id];
    return {
      ...(r as PlayerSummary),
      best_rating: bestRating(acc.ratings),
      days_completed: acc.days.size,
      last_activity: acc.lastAt ?? r.last_seen_at,
    };
  });

  if (args.ratingFilter) {
    players = players.filter((p) => p.best_rating === args.ratingFilter);
  }

  return { players, total: count ?? 0 };
}

// -- Enriched Leaderboard --------------------------------------------------

export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  total_score: number;
  scenarios_completed: number;
  level: number;
  best_rating: string | null;
  updated_at: string;
}

export async function getLeaderboardEnriched(limit = 50): Promise<LeaderboardItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leaderboard')
    .select('player_id, display_name, total_score, scenarios_completed, level, updated_at')
    .order('total_score', { ascending: false })
    .limit(limit);
  if (error || !data) {
    if (error) console.warn('[queries-v2] getLeaderboardEnriched', error.message);
    return [];
  }
  const playerIds = data.map((r) => r.player_id);
  if (playerIds.length === 0) return [];
  const { data: completions } = await admin
    .from('completed_scenarios')
    .select('player_id, rating')
    .in('player_id', playerIds);
  const ratingsByPlayer: Record<string, string[]> = {};
  for (const c of completions ?? []) {
    (ratingsByPlayer[c.player_id] ??= []).push(c.rating);
  }
  return data.map((r) => ({
    player_id: r.player_id,
    display_name: r.display_name,
    total_score: r.total_score,
    scenarios_completed: r.scenarios_completed,
    level: r.level,
    best_rating: bestRating(ratingsByPlayer[r.player_id] ?? []),
    updated_at: r.updated_at,
  }));
}

// -- Realtime --------------------------------------------------------------

export interface RealtimeKpis {
  active: number;
  today: number;
  completed_today: number;
}

const ZERO_KPIS: RealtimeKpis = { active: 0, today: 0, completed_today: 0 };

export async function getRealtimeKpis(): Promise<RealtimeKpis> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_realtime_kpis');
  if (error || !data) {
    if (error) console.warn('[queries-v2] get_realtime_kpis', error.message);
    return ZERO_KPIS;
  }
  const d = data as RealtimeKpis;
  return {
    active: Number(d.active) || 0,
    today: Number(d.today) || 0,
    completed_today: Number(d.completed_today) || 0,
  };
}

export interface RecentGameEvent extends PlayerJourneyEvent {
  player_id: string;
  display_name: string | null;
}

export async function getRecentGameEvents(minutes = 60): Promise<RecentGameEvent[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { data, error } = await admin
    .from('game_events')
    .select('event_type, event_data, scenario_id, day_id, player_id, created_at, players(display_name)')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !data) {
    if (error) console.warn('[queries-v2] getRecentGameEvents', error.message);
    return [];
  }
  return data.map((r: {
    event_type: string;
    event_data: Record<string, unknown> | null;
    scenario_id: string | null;
    day_id: string | null;
    player_id: string;
    created_at: string;
    players: { display_name: string } | { display_name: string }[] | null;
  }) => {
    const playerObj = Array.isArray(r.players) ? r.players[0] : r.players;
    return {
      event_type: r.event_type,
      event_data: r.event_data ?? {},
      scenario_id: r.scenario_id,
      day_id: r.day_id,
      player_id: r.player_id,
      created_at: r.created_at,
      display_name: playerObj?.display_name ?? null,
    };
  });
}
