import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

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
}): Promise<ThinkingPercentiles> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_thinking_percentiles', {
    p_scenario_id: params.scenarioId,
    p_day_id: params.dayId ?? null,
    p_from: params.from,
    p_to: params.to,
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
