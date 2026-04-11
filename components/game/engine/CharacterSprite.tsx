'use client';

import { memo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
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

  // Note: используем plain <img> вместо next/image с `fill`, потому что
  // ассеты персонажей имеют разные соотношения сторон (некоторые 2:3,
  // некоторые 3:4). `aspect-[2/3]` на контейнере + `object-contain`
  // визуально искажали спрайты не-2:3 — они читались как «сжатые по
  // горизонтали». Plain img + `h-full w-auto` даёт каждому спрайту
  // отрисовываться в его НАТУРАЛЬНОЙ пропорции, ширина контейнера
  // подстраивается под intrinsic ratio файла.
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className={`absolute bottom-0 h-[98%] sm:h-[96%] md:h-[94%] lg:h-[90%] pointer-events-none select-none z-0 transition-[filter] duration-300 ${POSITION_CLASSES[position]} ${!isActive ? 'grayscale brightness-75' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={character.id}
        className="h-full w-auto object-contain object-bottom block"
        draggable={false}
      />
    </m.div>
  );
}

export default memo(CharacterSprite);
