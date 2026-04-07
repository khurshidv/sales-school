'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState } from '@/game/engine/types';
import { getRemaining, isExpired } from '@/game/systems/TimerSystem';

interface UseTimerReturn {
  remaining: number | null; // seconds remaining, null if no timer
  isWarning: boolean; // <= 10s
  isCritical: boolean; // <= 5s
  hasExpired: boolean;
}

export function useTimer(
  timerState: TimerState | null,
  onExpire?: () => void,
): UseTimerReturn {
  const [remaining, setRemaining] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!timerState) {
      setRemaining(null);
      expiredRef.current = false;
      return;
    }

    expiredRef.current = false;

    const tick = () => {
      const now = Date.now();
      const secs = getRemaining(timerState, now);
      setRemaining(secs);

      if (isExpired(timerState, now) && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timerState]);

  return {
    remaining,
    isWarning: remaining !== null && remaining <= 10,
    isCritical: remaining !== null && remaining <= 5,
    hasExpired: expiredRef.current,
  };
}
