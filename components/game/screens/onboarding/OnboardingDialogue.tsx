'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';

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
}

export default function OnboardingDialogue({
  text,
  speakerName,
  onAdvance,
  inputConfig,
}: OnboardingDialogueProps) {
  const shouldReduceMotion = useReducedMotion();
  const { displayedText, isTyping, skipToEnd } = useTypewriter(text, {
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
    if (e.key === 'Enter' && inputConfig?.isValid) {
      onAdvance();
    }
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    if (inputConfig?.isValid) onAdvance();
  }

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute bottom-0 left-0 right-0 min-h-[26dvh] px-6 py-5 z-10 border-t border-white/10"
      style={{
        background:
          'linear-gradient(to top, rgba(10,12,18,0.92) 0%, rgba(15,20,30,0.82) 60%, rgba(20,25,40,0.65) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={handleClick}
    >
      {/* Speaker name */}
      {speakerName && (
        <p
          className="mb-2 text-lg font-bold uppercase tracking-[0.15em]"
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
        className="text-[#e8eaed] text-[1.15rem] leading-[1.7]"
        style={{
          textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
          fontWeight: 500,
        }}
      >
        {displayedText}
        {isTyping && (
          <span className="animate-pulse ml-0.5 text-white/60">|</span>
        )}
      </p>

      {/* Input field — appears after typewriter finishes */}
      <AnimatePresence>
        {inputConfig && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            className="mt-4 flex gap-3 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
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
                className="bg-transparent flex-1 outline-none text-white placeholder:text-white/40 text-base"
                autoComplete="off"
              />
            </div>
            <button
              onClick={handleConfirm}
              disabled={!inputConfig.isValid}
              className={`
                px-6 py-3 rounded-lg font-semibold text-white text-base
                border transition-all min-w-[48px] min-h-[48px]
                ${
                  inputConfig.isValid
                    ? 'bg-blue-500/30 border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:bg-blue-500/50 active:bg-blue-500/40'
                    : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                }
              `}
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap indicator — only for pure dialogue steps */}
      {!isTyping && !inputConfig && (
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

/** Format 9-digit phone as XX XXX-XX-XX */
function formatPhone(digits: string): string {
  const d = digits.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}
