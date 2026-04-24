import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertLeadSingle = vi.fn();
const insertProgress = vi.fn().mockResolvedValue({ error: null });
const logEventInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'leads') {
        return {
          insert: () => ({
            select: () => ({ single: insertLeadSingle }),
          }),
        };
      }
      if (table === 'funnel_progress') {
        return { insert: insertProgress };
      }
      if (table === 'funnel_events') {
        return { insert: logEventInsert };
      }
      return {};
    },
  }),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost:3000/api/funnel/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  insertLeadSingle.mockReset();
  insertProgress.mockClear();
  logEventInsert.mockClear();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
});

describe('POST /api/funnel/lead', () => {
  it('returns 400 on invalid payload (missing +)', async () => {
    const res = await POST(req({ name: 'Ali', phone: '998901112233' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is empty', async () => {
    const res = await POST(req({ name: '', phone: '+998901112233' }));
    expect(res.status).toBe(400);
  });

  it('creates lead, progress row, event, forwards to bitrix, returns 201', async () => {
    insertLeadSingle.mockResolvedValue({
      data: { id: 'lead-uuid', funnel_token: 'tok-uuid' },
      error: null,
    });
    const res = await POST(
      req({ name: 'Ali', phone: '+998901112233', landingUrl: 'http://x' }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.lead_id).toBe('lead-uuid');
    expect(body.token).toBe('tok-uuid');
    expect(body.next_url).toBe('/start/dars/1');
    expect(insertProgress).toHaveBeenCalledWith({ lead_id: 'lead-uuid' });
    expect(logEventInsert).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0];
    const forwarded = JSON.parse((init as RequestInit).body as string);
    expect(forwarded.sourcePage).toBe('funnel');
  });

  it('still returns 201 if bitrix forward fails (fail-open)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('bitrix down'));
    insertLeadSingle.mockResolvedValue({
      data: { id: 'lead-uuid', funnel_token: 'tok-uuid' },
      error: null,
    });
    const res = await POST(req({ name: 'Ali', phone: '+998901112233' }));
    expect(res.status).toBe(201);
  });

  it('returns 500 if lead insert fails', async () => {
    insertLeadSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await POST(req({ name: 'Ali', phone: '+998901112233' }));
    expect(res.status).toBe(500);
  });
});
