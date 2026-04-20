import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/game/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validEvent = {
  player_id: '00000000-0000-0000-0000-000000000001',
  event_type: 'game_started',
  event_data: {},
  scenario_id: 'car-dealership',
  day_id: 'day1',
};

describe('POST /api/game/events', () => {
  beforeEach(() => mockInsert.mockClear());

  it('inserts validated events with service role', async () => {
    const res = await POST(req({ events: [validEvent] }));
    expect(res.status).toBe(202);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert.mock.calls[0][0]).toEqual([validEvent]);
  });

  it('returns 400 on invalid payload', async () => {
    const res = await POST(req({ events: [{ ...validEvent, event_type: 'bogus' }] }));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns 400 on malformed JSON', async () => {
    const bad = new Request('http://localhost/api/game/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(bad);
    expect(res.status).toBe(400);
  });

  it('returns 500 when supabase insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'db down' } });
    const res = await POST(req({ events: [validEvent] }));
    expect(res.status).toBe(500);
  });
});
