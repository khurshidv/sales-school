'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CHARACTERS } from '@/game/data/characters/index';

interface CharacterSpriteProps {
  speaker: string | undefined;
  emotion: string | null;
}

export default function CharacterSprite({ speaker, emotion }: CharacterSpriteProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!speaker || speaker === 'narrator' || !CHARACTERS[speaker]) {
    return null;
  }

  const character = CHARACTERS[speaker];
  const src = character.assetPath(emotion ?? 'neutral');

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={speaker + '-' + (emotion ?? 'neutral')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
        src={src}
        alt={character.id}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 max-h-[85dvh] w-auto pointer-events-none select-none z-0"
      />
    </AnimatePresence>
  );
}
