'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const { displayedText, isTyping, skipToEnd } = useTypewriter(promptText, {
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
      className="absolute inset-0 z-20 flex flex-col"
      onClick={() => isTyping && skipToEnd()}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Prompt text — top area */}
      <div className="relative z-10 flex items-center justify-center pt-12 sm:pt-16 px-4">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="text-center italic text-[#ffd700] text-base sm:text-xl"
          style={{ textShadow: '0 0 20px rgba(255,215,0,0.3), 1px 1px 3px rgba(0,0,0,0.8)' }}
        >
          {displayedText}
          {isTyping && (
            <span className="animate-pulse ml-0.5 text-white/60">|</span>
          )}
        </motion.p>
      </div>

      {/* Characters — anchored to bottom like game sprites */}
      {!isTyping && (
        <div className="relative z-10 flex-1 flex items-end justify-center">
          {AVATARS.map((avatar, index) => {
            const isSelected = selectedId === avatar.id;
            const otherSelected = selectedId !== null && selectedId !== avatar.id;

            return (
              <motion.button
                key={avatar.id}
                initial={{
                  opacity: 0,
                  x: index === 0 ? -80 : 80,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.15,
                  duration: shouldReduceMotion ? 0 : 0.5,
                }}
                onClick={() => handleSelect(avatar.id)}
                className="relative flex flex-col items-center cursor-pointer"
              >
                {/* Character sprite */}
                <motion.img
                  src={avatar.src}
                  alt={avatar.label[lang]}
                  draggable={false}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    filter: isSelected
                      ? 'brightness(1.2) drop-shadow(0 0 20px rgba(108,180,238,0.6))'
                      : otherSelected
                        ? 'brightness(0.5) grayscale(0.5)'
                        : 'brightness(0.85)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-[65dvh] sm:h-[72dvh] w-auto max-w-[45dvw] object-contain object-bottom pointer-events-none select-none"
                />

                {/* Label */}
                <span
                  className={`
                    absolute bottom-2 sm:bottom-4 text-sm sm:text-base font-semibold tracking-wide
                    px-4 py-1 rounded-full transition-all duration-300
                    ${
                      isSelected
                        ? 'text-white bg-blue-500/40 shadow-[0_0_16px_rgba(108,180,238,0.4)]'
                        : otherSelected
                          ? 'text-white/20 bg-white/5'
                          : 'text-white/70 bg-white/10'
                    }
                  `}
                >
                  {avatar.label[lang]}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
