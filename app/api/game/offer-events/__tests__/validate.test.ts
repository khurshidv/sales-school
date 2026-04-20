import { describe, it, expect } from 'vitest';
import { validateOfferEventPayload } from '../validate';

const base = {
  player_id: '00000000-0000-0000-0000-000000000001',
  session_id: '11111111-1111-1111-1111-111111111111',
  event_type: 'offer_view',
  variant_id: 'default',
};

describe('validateOfferEventPayload', () => {
  it('accepts offer_view', () => {
    expect(validateOfferEventPayload(base).ok).toBe(true);
  });
  it('accepts null player_id', () => {
    expect(validateOfferEventPayload({ ...base, player_id: null }).ok).toBe(true);
  });
  it('rejects unknown event_type', () => {
    expect(validateOfferEventPayload({ ...base, event_type: 'buy_now' }).ok).toBe(false);
  });
  it('requires cta_id when event_type=offer_cta_click', () => {
    expect(validateOfferEventPayload({ ...base, event_type: 'offer_cta_click' }).ok).toBe(false);
    expect(validateOfferEventPayload({ ...base, event_type: 'offer_cta_click', cta_id: 'primary' }).ok).toBe(true);
  });
  it('rejects non-uuid player_id', () => {
    expect(validateOfferEventPayload({ ...base, player_id: 'abc' }).ok).toBe(false);
  });
});
