'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';
import type { Language } from '@/game/engine/types';

interface OnboardingLangSelectProps {
  text: string;
  speakerName: string;
  onSelect: (lang: Language) => void;
}

const LANG_OPTIONS: { id: Language; label: string; flag: string }[] = [
  { id: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function OnboardingLangSelect({
  text,
  speakerName,
  onSelect,
}: OnboardingLangSelectProps) {
  const shouldReduceMotion = useReducedMotion();
  const { textRef, isTyping, skipToEnd } = useTypewriter(text, {
    speed: 30,
  });

  function handleDialogueClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTyping) skipToEnd();
  }

  return (
    <>
      {/* Choice buttons — positioned above dialogue box */}
      {!isTyping && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          className="absolute bottom-[28dvh] left-0 right-0 px-4 py-3 z-20"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            {LANG_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  duration: shouldReduceMotion ? 0 : 0.2,
                }}
                onClick={() => onSelect(option.id)}
                className="
                  w-full text-left rounded-lg p-4 text-white text-base font-medium
                  border border-white/30 transition-all
                  bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-white/50
                  hover:shadow-[0_0_8px_rgba(255,255,255,0.1)]
                  active:bg-blue-500/30 min-h-[48px]
                "
              >
                <span className="mr-3 text-xl">{option.flag}</span>
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dialogue box */}
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
        onClick={handleDialogueClick}
      >
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

        <p
          className="text-[#e8eaed] text-[1.15rem] leading-[1.7]"
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
      </motion.div>
    </>
  );
}
