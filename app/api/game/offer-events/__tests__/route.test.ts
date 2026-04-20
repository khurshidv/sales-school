import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/game/offer-events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const base = {
  player_id: '00000000-0000-0000-0000-000000000001',
  session_id: 'sess_1',
  event_type: 'offer_view',
  variant_id: 'default',
};

describe('POST /api/game/offer-events', () => {
  beforeEach(() => mockInsert.mockClear());

  it('inserts a valid offer_view', async () => {
    const res = await POST(req(base));
    expect(res.status).toBe(202);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert.mock.calls[0][0]).toMatchObject({ event_type: 'offer_view' });
  });

  it('rejects unknown event_type', async () => {
    const res = await POST(req({ ...base, event_type: 'bad' }));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns 500 on db error', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'down' } });
    const res = await POST(req(base));
    expect(res.status).toBe(500);
  });
});
