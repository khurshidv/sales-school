import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type UtmDimension = 'utm_source' | 'utm_medium' | 'utm_campaign';

export const VALID_UTM_DIMENSIONS: UtmDimension[] = ['utm_source', 'utm_medium', 'utm_campaign'];

export interface UtmFunnelV2Row {
  segment: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  consultations: number;
}

export interface UtmSpendRollupRow {
  utm_source: string;
  total_kzt: number;
  days: number;
}

export interface UtmTrendPoint {
  bucket_date: string;
  registered: number;
  completed: number;
  consultations: number;
}

export async function getUtmFunnelV2(
  dimension: UtmDimension,
  from: string | null,
  to: string | null,
): Promise<UtmFunnelV2Row[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_funnel_v2', {
    p_dimension: dimension,
    p_from: from,
    p_to: to,
  });
  if (error) {
    console.warn('[funnel-queries] get_utm_funnel_v2', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    segment: string;
    visitors: number | string;
    registered: number | string;
    started: number | string;
    completed: number | string;
    consultations: number | string;
  }) => ({
    segment: r.segment,
    visitors: Number(r.visitors),
    registered: Number(r.registered),
    started: Number(r.started),
    completed: Number(r.completed),
    consultations: Number(r.consultations),
  }));
}

export async function getUtmSpendRollup(
  from: string | null,
  to: string | null,
): Promise<UtmSpendRollupRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_spend_rollup', { p_from: from, p_to: to });
  if (error) {
    console.warn('[funnel-queries] get_utm_spend_rollup', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    utm_source: string;
    total_kzt: number | string;
    days: number | string;
  }) => ({
    utm_source: r.utm_source,
    total_kzt: Number(r.total_kzt),
    days: Number(r.days),
  }));
}

export async function getUtmTrend(
  utmSource: string,
  from: string | null,
  to: string | null,
): Promise<UtmTrendPoint[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_trend', {
    p_utm_source: utmSource,
    p_from: from,
    p_to: to,
  });
  if (error) {
    console.warn('[funnel-queries] get_utm_trend', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    bucket_date: string;
    registered: number | string;
    completed: number | string;
    consultations: number | string;
  }) => ({
    bucket_date: r.bucket_date,
    registered: Number(r.registered),
    completed: Number(r.completed),
    consultations: Number(r.consultations),
  }));
}
