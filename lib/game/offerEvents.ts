'use client';

import { createClient } from '@/lib/supabase/client';

const SESSION_KEY = 'ss_offer_sid';

export function getOfferSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface BaseArgs {
  playerId: string | null;
  variantId?: string | null;
}

interface CtaClickArgs extends BaseArgs {
  ctaId: string;
}

async function insert(row: Record<string, unknown>): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('offer_events').insert(row);
  } catch (e) {
    console.warn('[offerEvents] insert failed:', e);
  }
}

export async function trackOfferView(args: BaseArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_view',
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferCtaClick(args: CtaClickArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_cta_click',
    cta_id: args.ctaId,
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferConversion(args: BaseArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_conversion',
    variant_id: args.variantId ?? 'default',
  });
}
