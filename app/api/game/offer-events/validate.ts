const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OFFER_EVENT_TYPES = new Set(['offer_view', 'offer_cta_click', 'offer_conversion']);

export interface ValidOfferEvent {
  player_id: string | null;
  session_id: string;
  event_type: 'offer_view' | 'offer_cta_click' | 'offer_conversion';
  cta_id: string | null;
  variant_id: string;
}

export type ValidationResult =
  | { ok: true; event: ValidOfferEvent }
  | { ok: false; error: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateOfferEventPayload(body: unknown): ValidationResult {
  if (!isPlainObject(body)) return { ok: false, error: 'payload must be object' };

  const player_id = body.player_id;
  if (player_id !== null && (typeof player_id !== 'string' || !UUID_RE.test(player_id))) {
    return { ok: false, error: 'player_id invalid' };
  }

  const session_id = body.session_id;
  if (typeof session_id !== 'string' || session_id.length === 0 || session_id.length > 64) {
    return { ok: false, error: 'session_id invalid' };
  }

  const event_type = body.event_type;
  if (typeof event_type !== 'string' || !OFFER_EVENT_TYPES.has(event_type)) {
    return { ok: false, error: 'event_type invalid' };
  }

  const cta_id = (body.cta_id ?? null) as unknown;
  if (cta_id !== null && typeof cta_id !== 'string') {
    return { ok: false, error: 'cta_id invalid' };
  }
  if (event_type === 'offer_cta_click' && cta_id === null) {
    return { ok: false, error: 'cta_id required for offer_cta_click' };
  }

  const variant_id = body.variant_id ?? 'default';
  if (typeof variant_id !== 'string' || variant_id.length === 0) {
    return { ok: false, error: 'variant_id invalid' };
  }

  return {
    ok: true,
    event: {
      player_id: (player_id as string | null) ?? null,
      session_id,
      event_type: event_type as ValidOfferEvent['event_type'],
      cta_id: (cta_id as string | null) ?? null,
      variant_id,
    },
  };
}
