'use client';

import { useState, useEffect, useRef } from 'react';
import type { TimerState } from '@/game/engine/types';
import { getRemaining, isExpired } from '@/game/systems/TimerSystem';

interface UseTimerReturn {
  /** Seconds remaining (integer, min 0). null when no timer. Updates ≤1×/sec, not every RAF. */
  remaining: number | null;
  /** true when remaining ≤ 10 */
  isWarning: boolean;
  /** true when remaining ≤ 5 */
  isCritical: boolean;
  /** true after timer has expired */
  hasExpired: boolean;
  /**
   * Ref to attach to the timer bar element. Its `style.width` is updated
   * imperatively on every RAF frame — no React re-render. Stays smooth
   * even though `remaining` only changes once per second.
   */
  barRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * RAF-based timer with imperative DOM updates for the progress bar.
 *
 * Why imperative: the timer bar width changes smoothly at ~60 FPS. Driving
 * that via React state would re-render every consumer of the timer 60×/sec,
 * which on mobile saturates the main thread during timed choices. Instead
 * we mutate `barRef.current.style.width` inside the RAF loop, and only
 * call setState when the integer display-seconds changes (≤1×/sec).
 */
export function useTimer(
  timerState: TimerState | null,
  onExpire?: () => void,
): UseTimerReturn {
  const [remaining, setRemaining] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const barRef = useRef<HTMLDivElement | null>(null);
  const lastDisplayedSecRef = useRef<number | null>(null);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!timerState) {
      setRemaining(null);
      expiredRef.current = false;
      lastDisplayedSecRef.current = null;
      if (barRef.current) {
        barRef.current.style.width = '100%';
      }
      return;
    }

    expiredRef.current = false;
    lastDisplayedSecRef.current = null;

    const tick = () => {
      const now = Date.now();
      const secs = getRemaining(timerState, now);

      // Imperative bar update — no React render.
      if (barRef.current) {
        const pct = Math.max(
          0,
          Math.min(100, (secs / timerState.duration) * 100),
        );
        barRef.current.style.width = pct + '%';
      }

      // React setState only when the integer second display changes.
      const intSec = Math.ceil(secs);
      if (intSec !== lastDisplayedSecRef.current) {
        lastDisplayedSecRef.current = intSec;
        setRemaining(intSec);
      }

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
    barRef,
  };
}
