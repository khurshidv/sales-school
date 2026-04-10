'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';

interface LocationTransitionProps {
  fromBackground: string;
  toBackground: string;
  text?: string;
  onComplete: () => void;
}

export default function LocationTransition({
  fromBackground,
  toBackground,
  text,
  onComplete,
}: LocationTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'fadeOut' | 'text' | 'fadeIn'>('fadeOut');

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    const timer1 = setTimeout(() => setPhase('text'), 600);
    const timer2 = setTimeout(() => setPhase('fadeIn'), text ? 2200 : 800);
    const timer3 = setTimeout(onComplete, text ? 3000 : 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [shouldReduceMotion, onComplete, text]);

  return (
    <div className="absolute inset-0 z-30">
      <AnimatePresence mode="wait">
        {phase === 'fadeOut' && (
          <motion.div
            key="fadeOut"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black"
          />
        )}

        {phase === 'text' && text && (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
            <p
              className="text-white/80 text-lg italic text-center px-8 max-w-lg"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {text}
            </p>
          </motion.div>
        )}

        {phase === 'fadeIn' && (
          <motion.div
            key="fadeIn"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-black"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
