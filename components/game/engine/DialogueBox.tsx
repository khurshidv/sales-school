'use client';

import { memo, useRef, useImperativeHandle, forwardRef } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';
import type { Language } from '@/game/engine/types';

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
  onAdvance?: () => void;
  lang?: Language;
}

const BACK_LABEL: Record<Language, string> = {
  uz: 'Bir qadam orqaga',
  ru: 'Шаг назад',
};

const NEXT_LABEL: Record<Language, string> = {
  uz: 'Keyingisi',
  ru: 'Далее',
};

const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(function DialogueBox({
  text,
  speakerName,
  isNarrator,
  onGoBack,
  canGoBack = false,
  onAdvance,
  lang = 'ru',
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

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTypingRef.current) {
      skipToEnd();
      lastSkipTimeRef.current = Date.now();
      return;
    }
    if (Date.now() - lastSkipTimeRef.current > 300) {
      onAdvance?.();
    }
  }

  // min-h uses svh (not dvh) so the dialogue stays at its smallest size
  // regardless of whether the mobile browser URL bar is visible. When the
  // URL bar collapses on scroll, extra height flows to the scene/character
  // instead of bloating the dialogue. The rest of the project follows the
  // dvh convention (see CLAUDE.md) — this is a deliberate exception.
  return (
    <m.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute bottom-0 left-0 right-0 z-10 min-h-[16svh] px-2.5 py-1.5 sm:min-h-[18svh] sm:px-3.5 sm:py-2 md:min-h-[20svh] md:px-4 md:py-2.5 lg:min-h-[28svh] lg:px-6 lg:py-5 xl:min-h-[30svh] xl:px-7 border-t border-white/10 bg-gradient-to-t from-black/55 via-black/35 to-black/10 lg:from-black/90 lg:via-black/70 lg:to-black/35"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.375rem)',
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

      {/* Back button — floats ABOVE the dialogue box (negative top) so it
          never collides with the phone's bottom-edge back/gesture zone.
          onTouchEnd stopPropagation is critical: SceneRenderer's parent
          touchend calls preventDefault() (ghost-click guard), which would
          otherwise cancel this button's synthetic click event entirely. */}
      {canGoBack && onGoBack && (
        <button
          onClick={handleGoBack}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onGoBack();
          }}
          className="absolute left-3 sm:left-4 -top-7 sm:-top-8 md:-top-9 lg:-top-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white text-[10px] sm:text-xs tracking-wide transition-colors z-20"
          style={{
            WebkitBackdropFilter: 'blur(6px)',
          }}
          aria-label={BACK_LABEL[lang]}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {BACK_LABEL[lang]}
        </button>
      )}

      {/* Next button — mirrors back button on the right side, floats above
          the dialogue box. Shown whenever an onAdvance handler is provided
          (i.e., the parent has a dialogue to advance). Replaces the old
          passive ▼ tap indicator with an actionable button.
          onTouchEnd stopPropagation: same reason as back button above —
          prevents parent SceneRenderer from eating the touch event. */}
      {onAdvance && (
        <button
          onClick={handleNext}
          onTouchEnd={(e) => {
            e.stopPropagation();
            if (isTypingRef.current) {
              skipToEnd();
              lastSkipTimeRef.current = Date.now();
              return;
            }
            if (Date.now() - lastSkipTimeRef.current > 300) {
              onAdvance();
            }
          }}
          className="absolute right-3 sm:right-4 -top-7 sm:-top-8 md:-top-9 lg:-top-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white text-[10px] sm:text-xs tracking-wide transition-colors z-20"
          style={{
            WebkitBackdropFilter: 'blur(6px)',
          }}
          aria-label={NEXT_LABEL[lang]}
        >
          {NEXT_LABEL[lang]}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </m.div>
  );
});

// memo prevents re-renders when parent useGameEngine updates for unrelated
// state (score, combo, flags). Per-character typewriter re-renders are
// isolated by the ref-based textContent update in useTypewriter.
export default memo(DialogueBox);
