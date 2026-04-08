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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="absolute bottom-0 left-0 right-0 min-h-[28dvh] border-t-2 border-[#4a90d9] px-5 py-4 z-10"
      style={{
        backgroundColor: 'rgba(0,0,0,0.88)',
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
      }}
      onClick={handleClick}
    >
      {/* Back button */}
      {canGoBack && onGoBack && (
        <button
          onClick={handleGoBack}
          className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Speaker name */}
      {!isNarrator && speakerName && (
        <p
          className="mb-2 text-base font-extrabold uppercase tracking-wider text-[#4a90d9]"
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
        >
          {speakerName}
        </p>
      )}

      {/* Dialogue text */}
      <p
        className={`text-lg leading-relaxed ${
          isNarrator
            ? 'text-center italic text-[#ffd700]'
            : 'text-white'
        }`}
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
      >
        {displayedText}
        {isTyping && (
          <span className="animate-pulse">&#9612;</span>
        )}
      </p>
    </motion.div>
  );
}
