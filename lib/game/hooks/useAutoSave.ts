'use client';

// ============================================================
// Auto-Save Hook — persists game session to Supabase so
// progress survives page refresh / tab close.
//
// Saves on:
// - Every node change (debounced 2s to batch rapid advances)
// - Page unload (beforeunload + visibilitychange for mobile)
//
// Uses syncProgress() which is fire-and-forget (never crashes game).
// ============================================================

import { useEffect, useRef } from 'react';
import { syncProgress } from '@/game/store/middleware/supabaseSync';
import type { GameSessionState } from '@/game/engine/types';

interface UseAutoSaveOptions {
  playerId: string | undefined;
  scenarioId: string;
  session: GameSessionState | null;
  /** Only save while actively playing */
  isPlaying: boolean;
}

export function useAutoSave({
  playerId,
  scenarioId,
  session,
  isPlaying,
}: UseAutoSaveOptions): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedNodeRef = useRef<string | null>(null);

  // Debounced save on node change
  useEffect(() => {
    if (!playerId || !session || !isPlaying) return;

    const nodeId = session.currentNodeId;

    // Don't re-save if we're on the same node
    if (nodeId === lastSavedNodeRef.current) return;

    // Debounce: wait 2s after last node change to save
    // This batches rapid auto-advances (condition_branch → score → dialogue)
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const dayId = `${scenarioId}-day${session.dayIndex + 1}`;
      syncProgress(playerId, scenarioId, dayId, session, false);
      lastSavedNodeRef.current = nodeId;
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playerId, scenarioId, session, session?.currentNodeId, isPlaying]);

  // Save immediately on page unload (beforeunload + visibilitychange)
  useEffect(() => {
    if (!playerId || !session || !isPlaying) return;

    const saveNow = () => {
      const dayId = `${scenarioId}-day${session.dayIndex + 1}`;
      // Use sendBeacon for reliability during page close
      try {
        const body = JSON.stringify({
          playerId,
          scenarioId,
          dayId,
          sessionState: session,
          isCompleted: false,
        });
        navigator.sendBeacon('/api/game/progress', body);
      } catch {
        // Fallback to sync fetch (may be blocked by browser)
        syncProgress(playerId, scenarioId, dayId, session, false);
      }
    };

    const handleBeforeUnload = () => saveNow();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveNow();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playerId, scenarioId, session, isPlaying]);
}
