/**
 * GameSession persistence to localStorage.
 *
 * Problem: page refresh dumps in-progress day state. Re-playing the same
 * dialogues is friction and inflates drop-off numbers.
 *
 * Solution: mirror `useGameStore.session` to localStorage on every change;
 * on mount, the play page reads it and calls `restoreSession(day, saved)`.
 *
 * Key contents:
 *   - scenarioId, dayId (for validation)
 *   - session (GameSessionState)
 *   - savedAt (ms) — stale entries are discarded
 *
 * NOT persisted: timerState (refreshed = stale), currentNode (re-derived).
 */

import type { GameSessionState } from '@/game/engine/types';

const STORAGE_KEY = 'ss_game_session_v1';
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h — stale saves are dropped

export interface PersistedSession {
  scenarioId: string;
  dayId: string;
  session: GameSessionState;
  savedAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveSession(
  scenarioId: string,
  dayId: string,
  session: GameSessionState,
): void {
  if (!canUseStorage()) return;
  try {
    // Strip timerState — it's wall-clock-based and stale after refresh.
    const { timerState: _timerState, ...rest } = session;
    const payload: PersistedSession = {
      scenarioId,
      dayId,
      session: { ...rest, timerState: null },
      savedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded / private mode — ignore silently.
  }
}

export function loadSession(): PersistedSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.scenarioId || !parsed.dayId || !parsed.session) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns true if the saved session is for the given scenario and has
 * made meaningful progress (not just the intro).
 */
export function hasResumableSession(scenarioId: string): boolean {
  const loaded = loadSession();
  if (!loaded) return false;
  if (loaded.scenarioId !== scenarioId) return false;
  // Filter out trivial sessions (score=0, no history) — those are re-starts,
  // not mid-day interruptions.
  return loaded.session.nodeHistory.length > 0 || loaded.session.score.total > 0;
}

/**
 * Subscribe the game store to localStorage persistence.
 *
 * Call once from a client-only boundary (e.g. layout useEffect).
 * Returns an unsubscribe function. Idempotent — a module-level guard
 * prevents double-subscribe across HMR.
 */
let persistenceAttached = false;

export function attachSessionPersistence(
  subscribe: (listener: (state: unknown) => void) => () => void,
  getSnapshot: () => {
    scenarioId: string | null;
    dayId: string | null;
    session: GameSessionState | null;
  },
): () => void {
  if (persistenceAttached) return () => {};
  persistenceAttached = true;

  const unsubscribe = subscribe(() => {
    const { scenarioId, dayId, session } = getSnapshot();
    if (!session || !scenarioId || !dayId) return;
    saveSession(scenarioId, dayId, session);
  });

  return () => {
    persistenceAttached = false;
    unsubscribe();
  };
}
