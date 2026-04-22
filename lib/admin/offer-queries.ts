import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DateRange } from './types-v2';

export type OfferSegmentField = 'device_type' | 'browser';

export interface OfferSegmentRow {
  segment: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cr: number;
}

export async function getOfferSegmentBreakdown(
  field: OfferSegmentField,
  range: DateRange,
): Promise<OfferSegmentRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_segment_breakdown', {
    p_field: field,
    p_from: range.from,
    p_to: range.to,
  });
  if (error) {
    console.warn('[offer-queries] get_offer_segment_breakdown', error.message);
    return [];
  }
  return (data ?? []).map((r: { segment: string; views: number | string; clicks: number | string; conversions: number | string }) => {
    const views = Number(r.views);
    const clicks = Number(r.clicks);
    const conv = Number(r.conversions);
    return {
      segment: r.segment,
      views,
      clicks,
      conversions: conv,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
      cr: views > 0 ? (conv / views) * 100 : 0,
    };
  });
}

export interface OfferVariantRow {
  variant_id: string;
  views: number;
  clicks: number;
  conversions: number;
  first_seen: string;
  last_seen: string;
  ctr: number;
  cr: number;
}

export async function getOfferVariantBreakdown(range: DateRange): Promise<OfferVariantRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_variant_breakdown', {
    p_from: range.from,
    p_to: range.to,
  });
  if (error) {
    console.warn('[offer-queries] get_offer_variant_breakdown', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    variant_id: string;
    views: number | string;
    clicks: number | string;
    conversions: number | string;
    first_seen: string;
    last_seen: string;
  }) => {
    const views = Number(r.views);
    const clicks = Number(r.clicks);
    const conv = Number(r.conversions);
    return {
      variant_id: r.variant_id,
      views,
      clicks,
      conversions: conv,
      first_seen: r.first_seen,
      last_seen: r.last_seen,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
      cr: views > 0 ? (conv / views) * 100 : 0,
    };
  });
}

export interface OfferTrendRow {
  day: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number; // percent
  cr: number;  // percent
}

export async function getOfferTrend(range: DateRange): Promise<OfferTrendRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_trend', {
    p_from: range.from,
    p_to: range.to,
  });
  if (error) {
    console.warn('[offer-queries] get_offer_trend', error.message);
    return [];
  }
  return (data ?? []).map((r: { day_id: string; views: number | string; clicks: number | string; conversions: number | string }) => {
    const views = Number(r.views);
    const clicks = Number(r.clicks);
    const conv = Number(r.conversions);
    return {
      day: String(r.day_id),
      views,
      clicks,
      conversions: conv,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
      cr: views > 0 ? (conv / views) * 100 : 0,
    };
  });
}
