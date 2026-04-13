'use client';

import { memo } from 'react';
import Image from 'next/image';
import { m, useReducedMotion } from 'framer-motion';
import { CHARACTERS } from '@/game/data/characters/index';
import { getCharacterBlur } from '@/game/data/scenarios/car-dealership/blur-hashes';
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
  const blurUrl = getCharacterBlur(src);
  const { width, height } = character.dimensions;

  // Using next/image with explicit width/height (not `fill`) preserves each
  // sprite's natural aspect ratio. AVIF/WebP format negotiation + responsive
  // sizing happen automatically. The container still uses h-full so the
  // visual behaviour is identical to the old plain <img> approach.
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className={`absolute bottom-0 h-[98%] sm:h-[96%] md:h-[94%] lg:h-[90%] pointer-events-none select-none z-0 transition-[filter] duration-300 ${POSITION_CLASSES[position]} ${!isActive ? 'grayscale brightness-75' : ''}`}
    >
      <Image
        src={src}
        alt={character.id}
        width={width}
        height={height}
        sizes="(max-width: 640px) 40vw, 30vw"
        quality={60}
        placeholder={blurUrl ? 'blur' : 'empty'}
        blurDataURL={blurUrl}
        className="h-full w-auto object-contain object-bottom block"
        draggable={false}
      />
    </m.div>
  );
}

export default memo(CharacterSprite);
