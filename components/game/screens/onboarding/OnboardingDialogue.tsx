'use client';

import { useEffect, useRef } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';
import type { Language } from '@/game/engine/types';

interface InputConfig {
  type: 'text' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  prefix?: string;
  isValid: boolean;
}

interface OnboardingDialogueProps {
  text: string;
  speakerName: string;
  onAdvance: () => void;
  inputConfig?: InputConfig;
  onGoBack?: () => void;
  canGoBack?: boolean;
  lang?: Language;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const BACK_LABEL: Record<Language, string> = {
  uz: 'Bir qadam orqaga',
  ru: 'Шаг назад',
};

const NEXT_LABEL: Record<Language, string> = {
  uz: 'Keyingisi',
  ru: 'Далее',
};

export default function OnboardingDialogue({
  text,
  speakerName,
  onAdvance,
  inputConfig,
  onGoBack,
  canGoBack = false,
  lang = 'ru',
  isSubmitting = false,
  submitError = null,
}: OnboardingDialogueProps) {
  const shouldReduceMotion = useReducedMotion();
  const { textRef, isTyping, skipToEnd } = useTypewriter(text, {
    speed: 30,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input after typewriter finishes
  useEffect(() => {
    if (!isTyping && inputConfig && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isTyping, inputConfig]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTyping) {
      skipToEnd();
      return;
    }
    // If no input, advance on tap
    if (!inputConfig) {
      onAdvance();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!inputConfig) return;
    if (inputConfig.type === 'tel') {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length <= 9) inputConfig.onChange(raw);
    } else {
      inputConfig.onChange(e.target.value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && inputConfig?.isValid && !isSubmitting) {
      onAdvance();
    }
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    if (inputConfig?.isValid && !isSubmitting) onAdvance();
  }

  return (
    <m.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute inset-0 z-10 flex flex-col justify-end"
      onClick={handleClick}
    >
    <div
      className="relative min-h-[16svh] px-2.5 py-1.5 sm:min-h-[18svh] sm:px-3.5 sm:py-2 md:min-h-[20svh] md:px-4 md:py-2.5 lg:min-h-[28svh] lg:px-6 lg:py-5 xl:min-h-[30svh] xl:px-7 border-t border-white/10 bg-gradient-to-t from-black/55 via-black/35 to-black/10 lg:from-black/90 lg:via-black/70 lg:to-black/35"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.375rem)',
      }}
    >
      {/* Speaker name */}
      {speakerName && (
        <p
          className="mb-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] sm:mb-1 sm:text-[0.7rem] md:mb-1.5 md:text-[0.78rem] lg:mb-2 lg:text-base xl:text-lg sm:tracking-[0.15em]"
          style={{
            color: '#6cb4ee',
            textShadow:
              '0 0 12px rgba(108,180,238,0.3), 1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {speakerName}
        </p>
      )}

      {/* Dialogue text */}
      <p
        className="text-[#e8eaed] text-[0.7rem] sm:text-[0.78rem] md:text-[0.85rem] lg:text-[1.15rem] xl:text-[1.25rem] leading-[1.45] sm:leading-[1.55] md:leading-[1.6] lg:leading-[1.7]"
        style={{
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
          fontWeight: 500,
        }}
      >
        <span ref={textRef as React.RefObject<HTMLSpanElement>} />
        {isTyping && (
          <span className="animate-pulse ml-0.5 text-white/60">|</span>
        )}
      </p>

      {/* Input field — appears after typewriter finishes */}
      <AnimatePresence>
        {inputConfig && !isTyping && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            className="mt-2 sm:mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="flex-1 flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
                {inputConfig.prefix && (
                  <span className="text-white/60 select-none">
                    {inputConfig.prefix}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type={inputConfig.type === 'tel' ? 'text' : inputConfig.type}
                  inputMode={inputConfig.type === 'tel' ? 'numeric' : 'text'}
                  value={
                    inputConfig.type === 'tel'
                      ? formatPhone(inputConfig.value)
                      : inputConfig.value
                  }
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={inputConfig.placeholder}
                  className="bg-transparent flex-1 outline-none text-white placeholder:text-white/40 text-xs sm:text-sm"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleConfirm}
                disabled={!inputConfig.isValid || isSubmitting}
                className={`
                  px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg font-semibold text-white text-xs sm:text-sm
                  border transition-all min-w-[44px] min-h-[44px]
                  ${
                    inputConfig.isValid && !isSubmitting
                      ? 'bg-blue-500/30 border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:bg-blue-500/50 active:bg-blue-500/40'
                      : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : '→'}
              </button>
            </div>
            {submitError && (
              <p className="mt-1.5 text-red-400 text-[0.65rem] sm:text-xs">
                {submitError}
              </p>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Back pill — floats above the dialogue box on the left */}
      {canGoBack && onGoBack && (
        <button
          onClick={(e) => { e.stopPropagation(); onGoBack(); }}
          onTouchEnd={(e) => { e.stopPropagation(); onGoBack(); }}
          className="absolute left-3 sm:left-4 -top-7 sm:-top-8 md:-top-9 lg:-top-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white text-[10px] sm:text-xs tracking-wide transition-colors z-20"
          style={{ WebkitBackdropFilter: 'blur(6px)' }}
          aria-label={BACK_LABEL[lang]}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {BACK_LABEL[lang]}
        </button>
      )}

      {/* Next pill — floats above the dialogue box on the right, only for pure dialogue steps */}
      {!inputConfig && (
        <button
          onClick={(e) => { e.stopPropagation(); if (isTyping) { skipToEnd(); return; } onAdvance(); }}
          onTouchEnd={(e) => { e.stopPropagation(); if (isTyping) { skipToEnd(); return; } onAdvance(); }}
          className="absolute right-3 sm:right-4 -top-7 sm:-top-8 md:-top-9 lg:-top-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white text-[10px] sm:text-xs tracking-wide transition-colors z-20"
          style={{ WebkitBackdropFilter: 'blur(6px)' }}
          aria-label={NEXT_LABEL[lang]}
        >
          {NEXT_LABEL[lang]}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
    </m.div>
  );
}

/** Format 9-digit phone as XX XXX-XX-XX */
function formatPhone(digits: string): string {
  const d = digits.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}
