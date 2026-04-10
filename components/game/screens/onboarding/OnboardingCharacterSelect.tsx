'use client';

import { useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';
import type { Language } from '@/game/engine/types';

interface OnboardingCharacterSelectProps {
  promptText: string;
  lang: Language;
  onSelect: (avatarId: 'male' | 'female') => void;
}

const AVATARS: {
  id: 'male' | 'female';
  src: string;
  label: { uz: string; ru: string };
}[] = [
  {
    id: 'male',
    src: '/assets/scenarios/car-dealership/ui/ui_character_select_male.webp',
    label: { uz: 'Erkak', ru: 'Мужской' },
  },
  {
    id: 'female',
    src: '/assets/scenarios/car-dealership/ui/ui_character_select_female.webp',
    label: { uz: 'Ayol', ru: 'Женский' },
  },
];

export default function OnboardingCharacterSelect({
  promptText,
  lang,
  onSelect,
}: OnboardingCharacterSelectProps) {
  const shouldReduceMotion = useReducedMotion();
  const { textRef, isTyping, skipToEnd } = useTypewriter(promptText, {
    speed: 30,
  });
  const [selectedId, setSelectedId] = useState<'male' | 'female' | null>(null);

  function handleSelect(id: 'male' | 'female') {
    if (isTyping) {
      skipToEnd();
      return;
    }
    setSelectedId(id);
    setTimeout(() => onSelect(id), 400);
  }

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col overflow-hidden"
      onClick={() => isTyping && skipToEnd()}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Prompt text — top area (compact, fixed height) */}
      <div className="relative z-10 flex items-center justify-center pt-3 sm:pt-4 md:pt-5 lg:pt-8 px-3 shrink-0">
        <m.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="text-center italic text-[#ffd700] text-[0.78rem] sm:text-[0.88rem] md:text-base lg:text-xl"
          style={{ textShadow: '0 0 20px rgba(255,215,0,0.3), 1px 1px 3px rgba(0,0,0,0.8)' }}
        >
          <span ref={textRef as React.RefObject<HTMLSpanElement>} />
          {isTyping && (
            <span className="animate-pulse ml-0.5 text-white/60">|</span>
          )}
        </m.p>
      </div>

      {/* Characters grid — fills remaining space, centered, with gap */}
      {!isTyping && (
        <div className="relative z-10 flex-1 min-h-0 flex items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-10 px-3 pb-1 sm:pb-2 md:pb-3">
          {AVATARS.map((avatar, index) => {
            const isSelected = selectedId === avatar.id;
            const otherSelected = selectedId !== null && selectedId !== avatar.id;

            return (
              <m.button
                key={avatar.id}
                initial={{
                  opacity: 0,
                  x: index === 0 ? -40 : 40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.12,
                  duration: shouldReduceMotion ? 0 : 0.4,
                }}
                onClick={() => handleSelect(avatar.id)}
                className="group relative flex flex-col items-center justify-end cursor-pointer h-full min-w-0 flex-1 max-w-[44%] sm:max-w-[42%] md:max-w-[40%] lg:max-w-[36%]"
              >
                {/* Character sprite — fills available height, shrinks to fit width */}
                <m.img
                  src={avatar.src}
                  alt={avatar.label[lang]}
                  draggable={false}
                  animate={{
                    scale: isSelected ? 1.04 : 1,
                    filter: isSelected
                      ? 'brightness(1.2) drop-shadow(0 0 20px rgba(108,180,238,0.6))'
                      : otherSelected
                        ? 'brightness(0.5) grayscale(0.5)'
                        : 'brightness(0.85)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="min-h-0 flex-1 w-full object-contain object-bottom pointer-events-none select-none"
                  style={{ minHeight: 0 }}
                />

                {/* Label — in normal flow below image, never overflows */}
                <span
                  className={`
                    mt-1 sm:mt-1.5 md:mt-2 shrink-0
                    text-[0.65rem] sm:text-[0.75rem] md:text-[0.85rem] lg:text-base
                    font-semibold tracking-wide whitespace-nowrap
                    px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-4 rounded-full transition-all duration-300
                    ${
                      isSelected
                        ? 'text-white bg-blue-500/50 shadow-[0_0_16px_rgba(108,180,238,0.4)]'
                        : otherSelected
                          ? 'text-white/25 bg-white/5'
                          : 'text-white/80 bg-white/15'
                    }
                  `}
                >
                  {avatar.label[lang]}
                </span>
              </m.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
