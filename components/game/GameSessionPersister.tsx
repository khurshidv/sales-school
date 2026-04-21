'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/game/store/gameStore';
import { attachSessionPersistence } from '@/lib/game/sessionPersist';

/**
 * Mount once inside (game) layout. Mirrors in-progress session state to
 * localStorage so refresh doesn't drop the current day.
 *
 * Restoration happens inside `useGameEngine` via `loadSession()` — this
 * component only handles the write side.
 */
export default function GameSessionPersister() {
  useEffect(() => {
    const detach = attachSessionPersistence(
      (listener) =>
        useGameStore.subscribe((state) => {
          listener(state);
        }),
      () => {
        const state = useGameStore.getState();
        return {
          scenarioId: state.session?.scenarioId ?? null,
          dayId: state.currentDay?.id ?? null,
          session: state.session,
        };
      },
    );
    return detach;
  }, []);

  return null;
}
