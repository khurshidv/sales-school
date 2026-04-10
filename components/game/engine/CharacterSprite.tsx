'use client';

import { memo } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CHARACTERS } from '@/game/data/characters/index';
import type { CharacterPosition } from '@/game/engine/types';

interface CharacterSpriteProps {
  characterId: string;
  emotion: string;
  position: CharacterPosition;
  isActive: boolean;
}

const POSITION_CLASSES: Record<CharacterPosition, string> = {
  left: 'left-[2%] sm:left-[4%] md:left-[6%] lg:left-[8%] translate-x-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-[2%] sm:right-[4%] md:right-[6%] lg:right-[8%] translate-x-0 left-auto',
};

function CharacterSprite({
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className={`absolute bottom-0 h-[98dvh] sm:h-[94dvh] md:h-[92dvh] lg:h-[88dvh] aspect-[2/3] pointer-events-none select-none z-0 transition-[filter] duration-300 ${POSITION_CLASSES[position]} ${!isActive ? 'grayscale brightness-75' : ''}`}
    >
      <Image
        src={src}
        alt={character.id}
        fill
        sizes="(max-width: 640px) 60vw, (max-width: 1024px) 50vw, 35vw"
        className="object-contain object-bottom"
      />
    </motion.div>
  );
}

export default memo(CharacterSprite);
