'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';

interface DialogueBoxProps {
  text: string;
  speakerName: string | undefined;
  isNarrator: boolean;
  onAdvance: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export default function DialogueBox({
  text,
  speakerName,
  isNarrator,
  onAdvance,
  onGoBack,
  canGoBack = false,
}: DialogueBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  const { displayedText, isTyping, skipToEnd } = useTypewriter(text, {
    speed: 30,
  });

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTyping) {
      skipToEnd();
    } else {
      onAdvance();
    }
  }

  function handleGoBack(e: React.MouseEvent) {
    e.stopPropagation();
    onGoBack?.();
  }

  return (
    // Full-screen tap target: 1st tap completes typing, 2nd tap advances
    <div
      className="absolute inset-0 z-10"
      onClick={handleClick}
    >
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute bottom-0 left-0 right-0 min-h-[18dvh] px-4 py-3 sm:min-h-[22dvh] sm:px-5 sm:py-4 lg:min-h-[26dvh] lg:px-6 lg:py-5 border-t border-white/10"
      style={{
        background: 'linear-gradient(to top, rgba(10,12,18,0.85) 0%, rgba(15,20,30,0.70) 60%, rgba(20,25,40,0.45) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Back button */}
      {canGoBack && onGoBack && (
        <button
          onClick={handleGoBack}
          className="absolute top-2 left-3 flex items-center gap-1 text-white/30 text-[10px] tracking-wide transition-colors z-20 sm:top-3 sm:left-4 sm:text-xs"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Шаг назад
        </button>
      )}

      {/* Speaker name */}
      {!isNarrator && speakerName && (
        <p
          className="mb-1 text-sm font-bold uppercase tracking-[0.12em] sm:mb-2 sm:text-base lg:text-lg sm:tracking-[0.15em]"
          style={{
            color: '#6cb4ee',
            textShadow: '0 0 12px rgba(108,180,238,0.3), 1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {speakerName}
        </p>
      )}

      {/* Dialogue text */}
      <p
        className={`leading-[1.5] sm:leading-[1.7] ${
          isNarrator
            ? 'text-center italic text-[#ffd700] text-sm sm:text-base lg:text-lg'
            : 'text-[#e8eaed] text-[0.875rem] sm:text-[1rem] lg:text-[1.15rem]'
        }`}
        style={{
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
          fontWeight: isNarrator ? 400 : 500,
        }}
      >
        {displayedText}
        {isTyping && (
          <span className="animate-pulse ml-0.5 text-white/60">|</span>
        )}
      </p>

      {/* Tap indicator */}
      {!isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-2 right-4 text-white/30 text-xs tracking-wider sm:bottom-3 sm:right-5"
        >
          ▼
        </motion.div>
      )}
    </motion.div>
    </div>
  );
}
