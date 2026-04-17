'use client';

import { useEffect, useRef } from 'react';

export interface ChoiceTimerHandle {
  /** Milliseconds since the current choice node was mounted / changed. */
  elapsedMs: () => number;
}

/**
 * Tracks how long a player has been staring at a choice node before
 * committing. Resets whenever the `nodeId` changes. Read `elapsedMs()`
 * inside the onSelect handler to get the thinking time.
 */
export function useChoiceTimer(nodeId: string | null): ChoiceTimerHandle {
  const startRef = useRef<number>(Date.now());
  const nodeRef = useRef<string | null>(nodeId);

  useEffect(() => {
    if (nodeRef.current !== nodeId) {
      nodeRef.current = nodeId;
      startRef.current = Date.now();
    }
  }, [nodeId]);

  // Ensure first mount sets start time (useRef initializer runs on every render
  // guard — acceptable for cheap Date.now()).
  return {
    elapsedMs: () => Date.now() - startRef.current,
  };
}
