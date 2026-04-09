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
    src: '/assets/scenarios/car-dealership/ui/ui_character_select_male.jpg',
    label: { uz: 'Erkak', ru: 'Мужской' },
  },
  {
    id: 'female',
    src: '/assets/scenarios/car-dealership/ui/ui_character_select_female.jpg',
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
  const [hoveredId, setHoveredId] = useState<'male' | 'female' | null>(null);
  const [selectedId, setSelectedId] = useState<'male' | 'female' | null>(null);

  function handleSelect(id: 'male' | 'female') {
    if (isTyping) {
      skipToEnd();
      return;
    }
    setSelectedId(id);
    // Brief delay for selection animation, then submit
    setTimeout(() => onSelect(id), 400);
  }

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      onClick={() => isTyping && skipToEnd()}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Prompt text — narrator style */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="relative z-10 text-center italic text-[#ffd700] text-xl mb-8 px-4"
        style={{ textShadow: '0 0 20px rgba(255,215,0,0.3), 1px 1px 3px rgba(0,0,0,0.8)' }}
      >
        {displayedText}
        {isTyping && (
          <span className="animate-pulse ml-0.5 text-white/60">|</span>
        )}
      </motion.p>

      {/* Character cards */}
      {!isTyping && (
        <div className="relative z-10 flex gap-6 sm:gap-10 items-end justify-center px-4">
          {AVATARS.map((avatar, index) => {
            const isHovered = hoveredId === avatar.id;
            const otherHovered = hoveredId !== null && hoveredId !== avatar.id;
            const isSelected = selectedId === avatar.id;

            return (
              <motion.button
                key={avatar.id}
                initial={{
                  opacity: 0,
                  x: index === 0 ? -60 : 60,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isSelected ? 1.05 : 1,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.15,
                  duration: shouldReduceMotion ? 0 : 0.4,
                  scale: { duration: 0.2 },
                }}
                onClick={() => handleSelect(avatar.id)}
                onMouseEnter={() => setHoveredId(avatar.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                {/* Character image */}
                <div
                  className={`
                    relative w-[35dvw] max-w-[240px] aspect-[3/4] rounded-xl overflow-hidden
                    border-2 transition-all duration-300
                    ${
                      isHovered || isSelected
                        ? 'border-blue-400/60 shadow-[0_0_24px_rgba(108,180,238,0.4)]'
                        : otherHovered
                          ? 'border-white/10'
                          : 'border-white/20'
                    }
                  `}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.label[lang]}
                    className={`
                      w-full h-full object-cover object-top transition-all duration-300
                      ${otherHovered ? 'grayscale brightness-[0.6]' : ''}
                      ${isSelected ? 'brightness-110' : ''}
                    `}
                    draggable={false}
                  />

                  {/* Selection glow overlay */}
                  {(isHovered || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-blue-400/10 pointer-events-none"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-base font-semibold tracking-wide transition-all duration-300
                    ${
                      otherHovered
                        ? 'text-white/30'
                        : isHovered || isSelected
                          ? 'text-blue-300'
                          : 'text-white/80'
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
