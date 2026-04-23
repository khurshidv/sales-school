import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GameLanguage } from './funnel-queries';

export interface RetentionSummary {
  cohort_size: number;
  d1_rate: number;
  d7_rate: number;
}

export async function getRetentionSummary(from: string | null, to: string | null, language: GameLanguage | null = null): Promise<RetentionSummary> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_retention', { p_from: from, p_to: to, p_language: language });
  if (error) { console.warn('[engagement-queries] get_retention', error); return { cohort_size: 0, d1_rate: 0, d7_rate: 0 }; }
  const rows = (data ?? []) as Array<{ cohort_size: number; d1_returned: number; d7_returned: number }>;
  const size = rows.reduce((a, r) => a + Number(r.cohort_size), 0);
  const d1 = rows.reduce((a, r) => a + Number(r.d1_returned), 0);
  const d7 = rows.reduce((a, r) => a + Number(r.d7_returned), 0);
  return {
    cohort_size: size,
    d1_rate: size > 0 ? d1 / size : 0,
    d7_rate: size > 0 ? d7 / size : 0,
  };
}

export interface EngagementTrendRow {
  bucket_date: string;
  started: number;
  completed: number;
  avg_thinking_ms: number | null;
  completion_rate: number;
}

export async function getEngagementTrend(params: {
  scenarioId: string; from: string | null; to: string | null; language?: GameLanguage | null;
}): Promise<EngagementTrendRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_engagement_trend', {
    p_scenario_id: params.scenarioId, p_from: params.from, p_to: params.to, p_language: params.language ?? null,
  });
  if (error) { console.warn('[engagement-queries] get_engagement_trend', error); return []; }
  return (data ?? []).map((r: { bucket_date: string; started: number | string; completed: number | string; avg_thinking_ms: number | string | null; completion_rate: number | string }) => ({
    bucket_date: r.bucket_date,
    started: Number(r.started),
    completed: Number(r.completed),
    avg_thinking_ms: r.avg_thinking_ms === null ? null : Number(r.avg_thinking_ms),
    completion_rate: Number(r.completion_rate),
  }));
}

export interface ThinkingPercentiles {
  p50_ms: number | null;
  p90_ms: number | null;
  p95_ms: number | null;
  sample_size: number;
}

export async function getThinkingPercentiles(params: {
  scenarioId: string;
  dayId?: string | null;
  from: string | null;
  to: string | null;
  language?: GameLanguage | null;
}): Promise<ThinkingPercentiles> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_thinking_percentiles', {
    p_scenario_id: params.scenarioId,
    p_day_id: params.dayId ?? null,
    p_from: params.from,
    p_to: params.to,
    p_language: params.language ?? null,
  });
  if (error) {
    console.warn('[engagement-queries] get_thinking_percentiles', error);
    return { p50_ms: null, p90_ms: null, p95_ms: null, sample_size: 0 };
  }
  const row = (data ?? [])[0] ?? { p50_ms: null, p90_ms: null, p95_ms: null, sample_size: 0 };
  return {
    p50_ms: row.p50_ms === null ? null : Number(row.p50_ms),
    p90_ms: row.p90_ms === null ? null : Number(row.p90_ms),
    p95_ms: row.p95_ms === null ? null : Number(row.p95_ms),
    sample_size: Number(row.sample_size ?? 0),
  };
}

export interface RatingCorrelationCell {
  day_id: string;
  rating: 'S' | 'A' | 'B' | 'C' | 'F';
  count: number;
  avg_time_seconds: number;    // from completed_scenarios.time_taken (already seconds, not ms)
}

export async function getRatingCorrelation(params: {
  scenarioId: string; from: string | null; to: string | null;
}): Promise<RatingCorrelationCell[]> {
  const sb = createAdminClient();
  let q = sb
    .from('completed_scenarios')
    .select('day_id, rating, time_taken')
    .eq('scenario_id', params.scenarioId);
  if (params.from) q = q.gte('completed_at', params.from);
  if (params.to)   q = q.lte('completed_at', params.to);
  const { data, error } = await q;
  if (error) { console.warn('[engagement-queries] rating correlation', error); return []; }
  const buckets = new Map<string, { count: number; sum: number }>();
  for (const r of (data ?? []) as Array<{ day_id: string; rating: string; time_taken: number | null }>) {
    const key = `${r.day_id}::${r.rating}`;
    const b = buckets.get(key) ?? { count: 0, sum: 0 };
    b.count += 1;
    b.sum += r.time_taken ?? 0;
    buckets.set(key, b);
  }
  const result: RatingCorrelationCell[] = [];
  for (const [key, b] of buckets) {
    const [day_id, rating] = key.split('::');
    if (!['S', 'A', 'B', 'C', 'F'].includes(rating)) continue;
    result.push({
      day_id,
      rating: rating as RatingCorrelationCell['rating'],
      count: b.count,
      avg_time_seconds: b.count > 0 ? b.sum / b.count : 0,
    });
  }
  return result;
}
