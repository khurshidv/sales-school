import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

import {
  getOfferSessionId,
  trackOfferView,
  trackOfferCtaClick,
  trackOfferConversion,
} from '@/lib/game/offerEvents';

function lastBody(): Record<string, unknown> {
  const [, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse((init as RequestInit).body as string) as Record<string, unknown>;
}

describe('offerEvents', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    sessionStorage.clear();
  });

  it('getOfferSessionId returns a stable uuid per session', () => {
    const a = getOfferSessionId();
    const b = getOfferSessionId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toBe(b);
  });

  it('trackOfferView POSTs offer_view to /api/game/offer-events', async () => {
    await trackOfferView({ playerId: '00000000-0000-0000-0000-000000000001' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/game/offer-events');
    expect((init as RequestInit).method).toBe('POST');
    const body = lastBody();
    expect(body).toMatchObject({
      player_id: '00000000-0000-0000-0000-000000000001',
      event_type: 'offer_view',
      variant_id: 'default',
    });
  });

  it('trackOfferCtaClick records cta_id', async () => {
    await trackOfferCtaClick({ playerId: '00000000-0000-0000-0000-000000000001', ctaId: 'primary' });
    const body = lastBody();
    expect(body).toMatchObject({ event_type: 'offer_cta_click', cta_id: 'primary' });
  });

  it('trackOfferConversion fires offer_conversion', async () => {
    await trackOfferConversion({ playerId: '00000000-0000-0000-0000-000000000001' });
    expect(lastBody()).toMatchObject({ event_type: 'offer_conversion' });
  });

  it('swallows fetch errors without throwing', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    await expect(trackOfferView({ playerId: '00000000-0000-0000-0000-000000000001' })).resolves.toBeUndefined();
  });
});
