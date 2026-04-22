import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface DropoffTrendPoint {
  bucket_date: string;
  entered: number;
  dropped: number;
  rate: number;
}

export async function getDropoffTrend(
  scenarioId: string,
  from: string | null,
  to: string | null,
): Promise<DropoffTrendPoint[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_dropoff_trend', {
    p_scenario_id: scenarioId,
    p_from: from,
    p_to: to,
  });
  if (error) {
    console.warn('[dropoff-queries] get_dropoff_trend', error);
    return [];
  }
  return (data ?? []).map((r: { bucket_date: string; entered: number | string; dropped: number | string; rate: number | string }) => ({
    bucket_date: r.bucket_date,
    entered: Number(r.entered),
    dropped: Number(r.dropped),
    rate: Number(r.rate),
  }));
}

export interface DropoffRateRow {
  node_id: string;
  day_id: string;
  dropoff_count: number;
  entered_count: number;
  dropoff_rate: number; // 0..1
  avg_time_on_node_ms: number | null;
}

export async function getDropoffRate(
  scenarioId: string,
  from: string | null,
  to: string | null,
  opts?: { minVisits?: number; dayId?: string | null },
): Promise<DropoffRateRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_dropoff_rate', {
    p_scenario_id: scenarioId,
    p_from: from,
    p_to: to,
    p_min_visits: opts?.minVisits ?? 20,
    p_day_id: opts?.dayId ?? null,
  });
  if (error) {
    console.warn('[dropoff-queries] get_dropoff_rate', error);
    return [];
  }
  return (data ?? []).map(
    (r: {
      node_id: string;
      day_id: string;
      dropoff_count: number | string;
      entered_count: number | string;
      dropoff_rate: number | string;
      avg_time_on_node_ms: number | string | null;
    }) => ({
      node_id: r.node_id,
      day_id: r.day_id,
      dropoff_count: Number(r.dropoff_count),
      entered_count: Number(r.entered_count),
      dropoff_rate: Number(r.dropoff_rate),
      avg_time_on_node_ms:
        r.avg_time_on_node_ms === null ? null : Number(r.avg_time_on_node_ms),
    }),
  );
}
