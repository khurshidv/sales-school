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
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute bottom-0 left-0 right-0 min-h-[26dvh] px-6 py-5 z-10 border-t border-white/10"
      style={{
        background: 'linear-gradient(to top, rgba(10,12,18,0.92) 0%, rgba(15,20,30,0.82) 60%, rgba(20,25,40,0.65) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={handleClick}
    >
      {/* Back button */}
      {canGoBack && onGoBack && (
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition-all z-20"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Speaker name */}
      {!isNarrator && speakerName && (
        <p
          className="mb-2 text-lg font-bold uppercase tracking-[0.15em]"
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
        className={`leading-[1.7] ${
          isNarrator
            ? 'text-center italic text-[#ffd700] text-lg'
            : 'text-[#e8eaed] text-[1.15rem]'
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
          className="absolute bottom-3 right-5 text-white/30 text-xs tracking-wider"
        >
          ▼
        </motion.div>
      )}
    </motion.div>
  );
}
