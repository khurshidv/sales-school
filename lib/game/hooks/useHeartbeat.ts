'use client';

import { useEffect, useRef } from 'react';
import { trackHeartbeat, trackIdleDetected } from '@/lib/game/analytics';

const HEARTBEAT_MS = 30_000;
const IDLE_THRESHOLD_MS = 60_000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export interface UseHeartbeatArgs {
  enabled: boolean;
  playerId: string;
  scenarioId: string;
  dayId: string;
  sessionId: string;
  currentNodeId: string | null;
}

/**
 * Periodically emits heartbeat events so the dashboard can show live players
 * and compute accurate session durations (tab-hidden + bfcache safe).
 * Also fires idle_detected once per idle window when the user doesn't
 * interact for IDLE_THRESHOLD_MS.
 */
export function useHeartbeat({
  enabled,
  playerId,
  scenarioId,
  dayId,
  sessionId,
  currentNodeId,
}: UseHeartbeatArgs): void {
  // Stash latest node id so setInterval closure always reads fresh value
  // without re-creating the timer on every node change.
  const nodeRef = useRef(currentNodeId);
  nodeRef.current = currentNodeId;
  const lastActivityRef = useRef(Date.now());
  const idleFiredRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      idleFiredRef.current = false;
    };
    for (const evt of ACTIVITY_EVENTS) {
      document.addEventListener(evt, onActivity, { passive: true });
    }

    const heartbeatTimer = setInterval(() => {
      trackHeartbeat(playerId, scenarioId, dayId, sessionId, nodeRef.current);
    }, HEARTBEAT_MS);

    const idleTimer = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_THRESHOLD_MS && !idleFiredRef.current) {
        trackIdleDetected(playerId, scenarioId, dayId, sessionId, idleMs);
        idleFiredRef.current = true;
      }
    }, 5_000);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        document.removeEventListener(evt, onActivity);
      }
      clearInterval(heartbeatTimer);
      clearInterval(idleTimer);
    };
  }, [enabled, playerId, scenarioId, dayId, sessionId]);
}
