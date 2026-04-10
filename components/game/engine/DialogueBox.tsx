'use client';

import { memo, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';

export interface DialogueBoxHandle {
  /** Call from parent on any screen tap. Returns true if handled (typing skipped), false if should advance. */
  handleTap: () => 'skip' | 'advance';
}

interface DialogueBoxProps {
  text: string;
  speakerName: string | undefined;
  isNarrator: boolean;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(function DialogueBox({
  text,
  speakerName,
  isNarrator,
  onGoBack,
  canGoBack = false,
}, ref) {
  const shouldReduceMotion = useReducedMotion();
  const { textRef, isTyping, isTypingRef, skipToEnd } = useTypewriter(text, {
    speed: 30,
  });
  const lastSkipTimeRef = useRef(0);

  useImperativeHandle(ref, () => ({
    handleTap() {
      if (isTypingRef.current) {
        skipToEnd();
        lastSkipTimeRef.current = Date.now();
        return 'skip';
      }
      if (Date.now() - lastSkipTimeRef.current > 300) {
        return 'advance';
      }
      return 'skip'; // cooldown — ignore
    },
  }), [isTypingRef, skipToEnd]);

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
      className="absolute bottom-0 left-0 right-0 z-10 min-h-[16dvh] px-2.5 py-1.5 sm:min-h-[18dvh] sm:px-3.5 sm:py-2 md:min-h-[20dvh] md:px-4 md:py-2.5 lg:min-h-[28dvh] lg:px-6 lg:py-5 xl:min-h-[30dvh] xl:px-7 border-t border-white/10 bg-gradient-to-t from-black/55 via-black/35 to-black/10 lg:from-black/90 lg:via-black/70 lg:to-black/35"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Speaker name */}
      {!isNarrator && speakerName && (
        <p
          className="mb-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] sm:mb-1 sm:text-[0.7rem] md:mb-1.5 md:text-[0.78rem] lg:mb-2 lg:text-base xl:text-lg sm:tracking-[0.15em]"
          style={{
            color: '#6cb4ee',
            textShadow: '0 0 12px rgba(108,180,238,0.3), 1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {speakerName}
        </p>
      )}

      {/* Dialogue text — textContent is mutated imperatively by useTypewriter
          via the textRef, so this paragraph never re-renders per character. */}
      <p
        className={`leading-[1.45] sm:leading-[1.55] md:leading-[1.6] lg:leading-[1.7] ${
          isNarrator
            ? 'text-center italic text-[#ffd700] text-[0.7rem] sm:text-[0.78rem] md:text-[0.85rem] lg:text-[1.1rem] xl:text-[1.2rem]'
            : 'text-[#e8eaed] text-[0.7rem] sm:text-[0.78rem] md:text-[0.85rem] lg:text-[1.15rem] xl:text-[1.25rem]'
        }`}
        style={{
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
          fontWeight: isNarrator ? 400 : 500,
        }}
      >
        <span ref={textRef as React.RefObject<HTMLSpanElement>} />
        {isTyping && (
          <span className="animate-pulse ml-0.5 text-white/60">|</span>
        )}
      </p>

      {/* Back button */}
      {canGoBack && onGoBack && (
        <button
          onClick={handleGoBack}
          className="absolute bottom-2 left-3 flex items-center gap-1 text-white/30 text-[10px] tracking-wide transition-colors z-20 sm:bottom-3 sm:left-4 sm:text-xs"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Шаг назад
        </button>
      )}

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
  );
});

// memo prevents re-renders when parent useGameEngine updates for unrelated
// state (score, combo, flags). Per-character typewriter re-renders are
// isolated by the ref-based textContent update in useTypewriter.
export default memo(DialogueBox);
