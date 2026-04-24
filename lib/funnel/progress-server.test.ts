import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import {
  validateToken,
  loadProgress,
  advanceProgress,
  logEvent,
} from './progress-server';

beforeEach(() => {
  mockFrom.mockReset();
});

describe('validateToken', () => {
  it('returns ok=false when identity is missing fields', async () => {
    const r = await validateToken({ leadId: '', token: '' });
    expect(r.ok).toBe(false);
  });

  it('returns ok=false when token does not match', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: { id: 'lead-1', funnel_token: 'server-token' },
              error: null,
            }),
          }),
        }),
      }),
    });
    const r = await validateToken({ leadId: 'lead-1', token: 'wrong' });
    expect(r.ok).toBe(false);
    expect(r.leadId).toBeNull();
  });

  it('returns ok=true when token matches', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: { id: 'lead-1', funnel_token: 'abc' },
              error: null,
            }),
          }),
        }),
      }),
    });
    const r = await validateToken({ leadId: 'lead-1', token: 'abc' });
    expect(r.ok).toBe(true);
    expect(r.leadId).toBe('lead-1');
  });
});

describe('loadProgress', () => {
  it('returns null when row missing', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    });
    expect(await loadProgress('lead-1')).toBeNull();
  });

  it('returns mapped progress', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              lead_id: 'lead-1',
              current_lesson: 2,
              completed_lessons: [1],
              finished_at: null,
            },
            error: null,
          }),
        }),
      }),
    });
    const p = await loadProgress('lead-1');
    expect(p).toEqual({
      leadId: 'lead-1',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
  });
});

describe('advanceProgress', () => {
  it('advances from lesson 2 to 3 and appends completed', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'funnel_progress') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { lead_id: 'lead-1', current_lesson: 2, completed_lessons: [1], finished_at: null },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                maybeSingle: async () => ({
                  data: { lead_id: 'lead-1', current_lesson: 3, completed_lessons: [1, 2], finished_at: null },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return { select: () => ({}) };
    });
    const p = await advanceProgress('lead-1', 2);
    expect(p?.currentLesson).toBe(3);
    expect(p?.completedLessons).toEqual([1, 2]);
  });
});

describe('logEvent', () => {
  it('inserts a funnel_events row', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });
    await logEvent({ leadId: 'lead-1', eventType: 'lesson_opened', lessonIndex: 1 });
    expect(insert).toHaveBeenCalledWith({
      lead_id: 'lead-1',
      event_type: 'lesson_opened',
      lesson_index: 1,
      meta: {},
    });
  });
});
