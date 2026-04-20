import { describe, it, expect } from 'vitest';
import { validateEventsPayload } from '../validate';

describe('validateEventsPayload', () => {
  const valid = {
    events: [
      {
        player_id: '00000000-0000-0000-0000-000000000001',
        event_type: 'game_started',
        event_data: {},
        scenario_id: 'car-dealership',
        day_id: 'day1',
      },
    ],
  };

  it('accepts a valid batch', () => {
    const res = validateEventsPayload(valid);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.events).toHaveLength(1);
  });

  it('rejects non-object payload', () => {
    expect(validateEventsPayload(null).ok).toBe(false);
    expect(validateEventsPayload('nope' as unknown).ok).toBe(false);
  });

  it('rejects missing events array', () => {
    expect(validateEventsPayload({}).ok).toBe(false);
  });

  it('rejects empty events array', () => {
    expect(validateEventsPayload({ events: [] }).ok).toBe(false);
  });

  it('rejects batches larger than 100', () => {
    const big = { events: Array.from({ length: 101 }, () => valid.events[0]) };
    expect(validateEventsPayload(big).ok).toBe(false);
  });

  it('rejects invalid event_type', () => {
    const bad = { events: [{ ...valid.events[0], event_type: 'drop_tables' }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('rejects non-uuid player_id', () => {
    const bad = { events: [{ ...valid.events[0], player_id: 'abc' }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('allows null scenario_id and day_id', () => {
    const e = { ...valid.events[0], scenario_id: null, day_id: null };
    expect(validateEventsPayload({ events: [e] }).ok).toBe(true);
  });

  it('rejects event_data that is not a plain object', () => {
    const bad = { events: [{ ...valid.events[0], event_data: ['arr'] }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('clamps event_data to 8KB JSON', () => {
    const huge = { big: 'x'.repeat(10_000) };
    const bad = { events: [{ ...valid.events[0], event_data: huge }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });
});
