import { describe, it, expect, vi, beforeEach } from 'vitest';

const validateTokenMock = vi.fn();
const loadProgressMock = vi.fn();

vi.mock('@/lib/funnel/progress-server', () => ({
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
  loadProgress: (...a: unknown[]) => loadProgressMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  validateTokenMock.mockReset();
  loadProgressMock.mockReset();
});

describe('POST /api/funnel/state', () => {
  it('returns 401 on invalid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(401);
  });

  it('returns 200 with progress', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    loadProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      current_lesson: 2,
      completed_lessons: [1],
      finished_at: null,
    });
  });

  it('returns 404 when progress row is missing', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    loadProgressMock.mockResolvedValue(null);
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(404);
  });
});
