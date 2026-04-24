import { describe, it, expect, vi, beforeEach } from 'vitest';

const validateTokenMock = vi.fn();
const advanceProgressMock = vi.fn();
const logEventMock = vi.fn().mockResolvedValue(undefined);

const adminFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: adminFrom }),
}));

vi.mock('@/lib/funnel/progress-server', () => ({
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
  advanceProgress: (...a: unknown[]) => advanceProgressMock(...a),
  logEvent: (...a: unknown[]) => logEventMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/quiz', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  validateTokenMock.mockReset();
  advanceProgressMock.mockReset();
  logEventMock.mockClear();
  adminFrom.mockReset();
});

describe('POST /api/funnel/quiz', () => {
  it('401 on invalid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 0 }));
    expect(res.status).toBe(401);
  });

  it('400 on malformed body', async () => {
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 99, answer_index: 0 }));
    expect(res.status).toBe(400);
  });

  it('wrong answer returns ok:false and logs quiz_wrong', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    const res = await POST(
      req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 3 }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'quiz_wrong' }),
    );
  });

  it('correct answer on lesson 1 advances and returns next url', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    advanceProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
    // Lesson 1 correctIndex is 1 (see lib/funnel/quizzes.ts).
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, next_url: '/start/dars/2' });
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'quiz_passed' }),
    );
  });

  it('correct answer on lesson 4 creates new player and returns simulator url', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    advanceProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 4,
      completedLessons: [1, 2, 3, 4],
      finishedAt: new Date().toISOString(),
    });

    const leadsChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { name: 'Ali', phone: '+998901112233', funnel_token: 'tok' },
            error: null,
          }),
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    };
    const playersChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'player-1' }, error: null }),
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    };

    adminFrom.mockImplementation((table: string) => {
      if (table === 'leads') return leadsChain;
      if (table === 'players') return playersChain;
      return {};
    });

    // Lesson 4 correctIndex is 2 (see lib/funnel/quizzes.ts).
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 4, answer_index: 2 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.next_url).toBe('/start/final?lead_token=tok');
  });

  it('correct answer on lesson 4 links existing player when phone already registered', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    advanceProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 4,
      completedLessons: [1, 2, 3, 4],
      finishedAt: new Date().toISOString(),
    });

    const leadsChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { name: 'Ali', phone: '+998901112233', funnel_token: 'tok' },
            error: null,
          }),
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    };
    const playersChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { id: 'existing-player-id' },
            error: null,
          }),
        }),
      }),
      insert: vi.fn(), // should NOT be called
      update: () => ({ eq: async () => ({ error: null }) }),
    };

    adminFrom.mockImplementation((table: string) => {
      if (table === 'leads') return leadsChain;
      if (table === 'players') return playersChain;
      return {};
    });

    // Lesson 4 correctIndex is 2 (see lib/funnel/quizzes.ts).
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 4, answer_index: 2 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.next_url).toBe('/start/final?lead_token=tok');
    expect(playersChain.insert).not.toHaveBeenCalled();
  });
});
