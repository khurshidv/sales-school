'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CHARACTERS } from '@/game/data/characters/index';
import type { CharacterPosition } from '@/game/engine/types';

interface CharacterSpriteProps {
  characterId: string;
  emotion: string;
  position: CharacterPosition;
  isActive: boolean;
}

const POSITION_CLASSES: Record<CharacterPosition, string> = {
  left: 'left-[8%] translate-x-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-[8%] translate-x-0 left-auto',
};

export default function CharacterSprite({
  characterId,
  emotion,
  position,
  isActive,
}: CharacterSpriteProps) {
  const shouldReduceMotion = useReducedMotion();

  const character = CHARACTERS[characterId];
  if (!character) return null;

  const src = character.assetPath(emotion);

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={characterId + '-' + emotion + '-' + position}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
        src={src}
        alt={character.id}
        style={{ mixBlendMode: 'screen' }}
        className={`absolute bottom-0 max-h-[85dvh] w-auto pointer-events-none select-none z-0 transition-[filter] duration-300 ${POSITION_CLASSES[position]} ${!isActive ? 'brightness-75' : ''}`}
      />
    </AnimatePresence>
  );
}
