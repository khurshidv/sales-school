import { ALL_GAME_EVENT_TYPES, type GameEventTypeValue } from '@/lib/game/eventTypes';

export interface ValidGameEvent {
  player_id: string;
  event_type: GameEventTypeValue;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
}

export type ValidationResult =
  | { ok: true; events: ValidGameEvent[] }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH = 100;
const MAX_EVENT_DATA_BYTES = 8 * 1024;
const EVENT_TYPES = new Set<string>(ALL_GAME_EVENT_TYPES);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateEventsPayload(body: unknown): ValidationResult {
  if (!isPlainObject(body)) return { ok: false, error: 'payload must be object' };
  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) return { ok: false, error: 'events must be array' };
  if (events.length === 0) return { ok: false, error: 'events empty' };
  if (events.length > MAX_BATCH) return { ok: false, error: `events > ${MAX_BATCH}` };

  const valid: ValidGameEvent[] = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!isPlainObject(e)) return { ok: false, error: `events[${i}] not object` };

    const player_id = e.player_id;
    if (typeof player_id !== 'string' || !UUID_RE.test(player_id)) {
      return { ok: false, error: `events[${i}].player_id invalid` };
    }
    const event_type = e.event_type;
    if (typeof event_type !== 'string' || !EVENT_TYPES.has(event_type)) {
      return { ok: false, error: `events[${i}].event_type invalid` };
    }
    const event_data = e.event_data ?? {};
    if (!isPlainObject(event_data)) {
      return { ok: false, error: `events[${i}].event_data invalid` };
    }
    if (JSON.stringify(event_data).length > MAX_EVENT_DATA_BYTES) {
      return { ok: false, error: `events[${i}].event_data too large` };
    }
    const scenario_id = e.scenario_id ?? null;
    if (scenario_id !== null && typeof scenario_id !== 'string') {
      return { ok: false, error: `events[${i}].scenario_id invalid` };
    }
    const day_id = e.day_id ?? null;
    if (day_id !== null && typeof day_id !== 'string') {
      return { ok: false, error: `events[${i}].day_id invalid` };
    }

    valid.push({
      player_id,
      event_type: event_type as GameEventTypeValue,
      event_data,
      scenario_id,
      day_id,
    });
  }
  return { ok: true, events: valid };
}
