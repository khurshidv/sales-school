import { describe, it, expect } from 'vitest';
import { deriveStrengthsWeaknesses } from '@/lib/admin/player/deriveStrengthsWeaknesses';
import type { ParsedJourney, CompletedDay } from '@/lib/admin/types-v2';

function emptyJourney(): ParsedJourney {
  return { days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null };
}

describe('deriveStrengthsWeaknesses', () => {
  it('returns "pass" when no completions', () => {
    const out = deriveStrengthsWeaknesses(emptyJourney(), []);
    expect(out.recommendation).toBe('pass');
    expect(out.strengths).toEqual([]);
    expect(out.weaknesses.length).toBeGreaterThan(0);
  });

  it('flags fast clicker (avg thinking < 2s) as weakness', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 3,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'completed', choices_made: 5, back_navigations: 0, total_thinking_time_ms: 6_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 70, rating: 'B', time_taken: 300, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.weaknesses.some((w) => /быстро|спеш|внимат/i.test(w))).toBe(true);
  });

  it('flags many back navigations as weakness', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 4,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: null,
        outcome: 'in_progress', choices_made: 5, back_navigations: 4, total_thinking_time_ms: 30_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, []);
    expect(out.weaknesses.some((w) => /назад|сомнев/i.test(w))).toBe(true);
  });

  it('hire when at least one S or A across days completed', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 10,
      days: [
        { day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z', outcome: 'completed', choices_made: 5, back_navigations: 0, total_thinking_time_ms: 40_000 },
        { day_id: 'day2', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:15:00Z', outcome: 'completed', choices_made: 6, back_navigations: 0, total_thinking_time_ms: 60_000 },
      ],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 90, rating: 'A', time_taken: 400, completed_at: '2026-04-10T10:05:00Z' },
      { scenario_id: 's', day_id: 'day2', score: 95, rating: 'S', time_taken: 500, completed_at: '2026-04-10T10:15:00Z' },
    ]);
    expect(out.recommendation).toBe('hire');
    expect(out.strengths.length).toBeGreaterThan(0);
  });

  it('train when at least one B completion + no failures', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 6,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'completed', choices_made: 4, back_navigations: 1, total_thinking_time_ms: 30_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 60, rating: 'B', time_taken: 300, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.recommendation).toBe('train');
  });

  it('pass when only F or all failed', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 3,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'failed', choices_made: 3, back_navigations: 0, total_thinking_time_ms: 10_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 20, rating: 'F', time_taken: 200, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.recommendation).toBe('pass');
  });
});
