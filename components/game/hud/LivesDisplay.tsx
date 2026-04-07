'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

export default function LivesDisplay({ lives, maxLives = 3 }: LivesDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const prevLives = useRef(lives);
  const [flash, setFlash] = useState(false);

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

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxLives }, (_, i) => {
          const filled = i < lives;
          const isLastLife = lives === 1 && i === 0;

          return (
            <motion.span
              key={i}
              exit={{ scale: 0 }}
              animate={
                isLastLife && !shouldReduceMotion
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={
                isLastLife && !shouldReduceMotion
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
