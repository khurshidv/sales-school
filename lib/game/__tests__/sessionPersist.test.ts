import { describe, it, expect, beforeEach, vi } from 'vitest';

// vitest 4 jsdom does not include localStorage by default — stub it here.
function makeLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}
vi.stubGlobal('localStorage', makeLocalStorage());

import {
  saveSession,
  loadSession,
  clearSession,
  hasResumableSession,
} from '../sessionPersist';
import type { GameSessionState } from '@/game/engine/types';

function makeSession(overrides: Partial<GameSessionState> = {}): GameSessionState {
  return {
    scenarioId: 'car-dealership',
    dayNumber: 1,
    currentNodeId: 'node_1',
    score: {
      total: 50,
      dimensions: { rapport: 10, discovery: 10, pitch: 10, objection: 10, closing: 10, process: 0, ethics: 0 },
    },
    dimensionEvents: { rapport: 0, discovery: 0, pitch: 0, objection: 0, closing: 0, process: 0, ethics: 0 },
    lives: 3,
    flags: {},
    choiceHistory: [],
    activeBonuses: [],
    timerState: null,
    comboCount: 0,
    nodeHistory: [],
    ...overrides,
  } as unknown as GameSessionState;
}

describe('sessionPersist', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('roundtrips session', () => {
    const session = makeSession();
    saveSession('car-dealership', 'day1', session);
    const loaded = loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.scenarioId).toBe('car-dealership');
    expect(loaded?.dayId).toBe('day1');
    expect(loaded?.session.score.total).toBe(50);
  });

  it('strips timerState on save', () => {
    const session = makeSession({
      timerState: { startedAt: 1, durationMs: 15000, pausedAt: null, pausedMs: 0 } as unknown as GameSessionState['timerState'],
    });
    saveSession('car-dealership', 'day1', session);
    const loaded = loadSession();
    expect(loaded?.session.timerState).toBeNull();
  });

  it('drops stale entries older than 24h', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
    saveSession('car-dealership', 'day1', makeSession());
    vi.setSystemTime(1_700_000_000_000 + 25 * 60 * 60 * 1000);
    expect(loadSession()).toBeNull();
  });

  it('clearSession removes entry', () => {
    saveSession('car-dealership', 'day1', makeSession());
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('hasResumableSession false for fresh session with no progress', () => {
    saveSession(
      'car-dealership',
      'day1',
      makeSession({
        score: { total: 0, dimensions: { rapport: 0, discovery: 0, pitch: 0, objection: 0, closing: 0, process: 0, ethics: 0 } },
        nodeHistory: [],
      } as unknown as Partial<GameSessionState>),
    );
    expect(hasResumableSession('car-dealership')).toBe(false);
  });

  it('hasResumableSession false when scenario mismatches', () => {
    saveSession('car-dealership', 'day1', makeSession({ score: { total: 50, dimensions: {} } as unknown as GameSessionState['score'] }));
    expect(hasResumableSession('other-scenario')).toBe(false);
  });

  it('hasResumableSession true when score > 0', () => {
    saveSession('car-dealership', 'day1', makeSession());
    expect(hasResumableSession('car-dealership')).toBe(true);
  });

  it('loadSession returns null on malformed storage', () => {
    localStorage.setItem('ss_game_session_v1', 'not json');
    expect(loadSession()).toBeNull();
  });
});
