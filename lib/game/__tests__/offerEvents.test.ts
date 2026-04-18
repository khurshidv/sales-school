import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import {
  trackOfferView,
  trackOfferCtaClick,
  trackOfferConversion,
  getOfferSessionId,
} from '@/lib/game/offerEvents';

describe('offerEvents', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    sessionStorage.clear();
  });

  it('getOfferSessionId returns same id on repeat calls', () => {
    const a = getOfferSessionId();
    const b = getOfferSessionId();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('trackOfferView inserts an offer_view row', async () => {
    await trackOfferView({ playerId: 'p1', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_view');
    expect(row.player_id).toBe('p1');
    expect(row.variant_id).toBe('default');
    expect(row.session_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('trackOfferCtaClick records cta_id', async () => {
    await trackOfferCtaClick({ playerId: 'p1', ctaId: 'primary', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_cta_click');
    expect(row.cta_id).toBe('primary');
  });

  it('trackOfferConversion fires offer_conversion', async () => {
    await trackOfferConversion({ playerId: 'p1', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_conversion');
  });
});
