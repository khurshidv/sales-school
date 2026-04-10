'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

function LivesDisplay({ lives, maxLives = 3 }: LivesDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const prevLives = useRef(lives);
  const [flash, setFlash] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    if (lives < prevLives.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(timer);
    }
    prevLives.current = lives;
  }, [lives]);

  useEffect(() => {
    if (!flash) {
      prevLives.current = lives;
    }
  }, [flash, lives]);

  // Pause the infinite "last life" pulse when the tab is hidden — framer
  // keeps running the RAF loop even in background tabs, wasting cycles.
  useEffect(() => {
    const onVisibility = () => setIsPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxLives }, (_, i) => {
          const filled = i < lives;
          const isLastLife = lives === 1 && i === 0;

          const shouldPulse = isLastLife && !shouldReduceMotion && isPageVisible;
          return (
            <motion.span
              key={i}
              exit={{ scale: 0 }}
              animate={
                shouldPulse
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={
                shouldPulse
                  ? { repeat: Infinity, duration: 1 }
                  : { duration: shouldReduceMotion ? 0 : 0.3 }
              }
              className={[
                'text-[16px] transition-colors duration-150',
                filled ? 'text-[#ff4757]' : 'text-neutral-600',
                flash && filled ? 'animate-life-flash' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {filled ? '♥' : '♡'}
            </motion.span>
          );
        })}
      </AnimatePresence>

      <style jsx>{`
        @keyframes life-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; filter: brightness(2); }
        }
        .animate-life-flash {
          animation: life-flash 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default memo(LivesDisplay);
