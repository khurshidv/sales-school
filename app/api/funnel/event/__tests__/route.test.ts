import { describe, it, expect, vi, beforeEach } from 'vitest';

const logEventMock = vi.fn().mockResolvedValue(undefined);
const validateTokenMock = vi.fn();

vi.mock('@/lib/funnel/progress-server', () => ({
  logEvent: (...a: unknown[]) => logEventMock(...a),
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  logEventMock.mockClear();
  validateTokenMock.mockReset();
});

describe('POST /api/funnel/event', () => {
  it('accepts anon event without token (landing_view)', async () => {
    const res = await POST(req({ event_type: 'landing_view' }));
    expect(res.status).toBe(204);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: null, eventType: 'landing_view' }),
    );
  });

  it('ignores unknown event type with 400', async () => {
    const res = await POST(req({ event_type: 'not_real' }));
    expect(res.status).toBe(400);
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it('validates identity for authed events', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(
      req({ event_type: 'lesson_opened', lead_id: 'l', token: 't', lesson_index: 1 }),
    );
    expect(res.status).toBe(401);
  });

  it('logs authed event on valid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    const res = await POST(
      req({ event_type: 'lesson_opened', lead_id: 'l', token: 't', lesson_index: 1 }),
    );
    expect(res.status).toBe(204);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: 'l', eventType: 'lesson_opened', lessonIndex: 1 }),
    );
  });
});
