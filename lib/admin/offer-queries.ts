import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DateRange } from './types-v2';

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
