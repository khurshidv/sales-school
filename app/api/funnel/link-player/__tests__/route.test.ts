import { describe, it, expect, vi, beforeEach } from 'vitest';

const leadsMaybeSingle = vi.fn();
const playersMaybeSingle = vi.fn();
const logEventMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: leadsMaybeSingle }),
          }),
        };
      }
      if (table === 'players') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: playersMaybeSingle }),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock('@/lib/funnel/progress-server', () => ({
  logEvent: (...a: unknown[]) => logEventMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/link-player', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  leadsMaybeSingle.mockReset();
  playersMaybeSingle.mockReset();
  logEventMock.mockClear();
});

describe('POST /api/funnel/link-player', () => {
  it('401 when token is missing', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(401);
  });

  it('401 when token does not match any lead', async () => {
    leadsMaybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(req({ lead_token: 'nope' }));
    expect(res.status).toBe(401);
  });

  it('404 when lead has no linked player yet', async () => {
    leadsMaybeSingle.mockResolvedValue({
      data: { id: 'l', name: 'A', phone: '+1', player_id: null },
      error: null,
    });
    const res = await POST(req({ lead_token: 'tok' }));
    expect(res.status).toBe(404);
  });

  it('200 with player info when linked', async () => {
    leadsMaybeSingle.mockResolvedValue({
      data: { id: 'l', name: 'Ali', phone: '+998', player_id: 'p1' },
      error: null,
    });
    playersMaybeSingle.mockResolvedValue({
      data: { id: 'p1', name: 'Ali', phone: '+998' },
      error: null,
    });
    const res = await POST(req({ lead_token: 'tok' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      player_id: 'p1',
      name: 'Ali',
      phone: '+998',
    });
  });
});
