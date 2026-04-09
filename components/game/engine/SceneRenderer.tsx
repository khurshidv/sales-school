'use client';

import { useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CharacterSprite from './CharacterSprite';
import SoundManager from '@/lib/game/audio/SoundManager';
import type { CharacterOnScreen } from '@/game/engine/types';

interface SceneRendererProps {
  backgroundId: string;
  characters: CharacterOnScreen[];
  activeSpeaker: string | undefined;
  onTap?: () => void;
  tapEnabled?: boolean;
  children?: React.ReactNode;
}

export default function SceneRenderer({
  backgroundId,
  characters,
  activeSpeaker,
  onTap,
  tapEnabled = false,
  children,
}: SceneRendererProps) {
  const audioUnlockedRef = useRef(false);

  const unlockAudio = useCallback(() => {
    if (!audioUnlockedRef.current) {
      audioUnlockedRef.current = true;
      SoundManager.getInstance().unlock();
    }
  }, []);

  const handleClick = useCallback(() => {
    unlockAudio();
    if (tapEnabled && onTap) onTap();
  }, [tapEnabled, onTap, unlockAudio]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    unlockAudio();
    if (tapEnabled && onTap) {
      e.preventDefault(); // prevent ghost click
      onTap();
    }
  }, [tapEnabled, onTap, unlockAudio]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden"
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background with crossfade */}
      <AnimatePresence mode="sync">
        <motion.img
          key={backgroundId}
          src={`/assets/scenarios/car-dealership/backgrounds/${backgroundId}.jpg`}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Characters */}
      <AnimatePresence mode="sync">
        {characters.map((char) => (
          <CharacterSprite
            key={char.id}
            characterId={char.id}
            emotion={char.emotion}
            position={char.position}
            isActive={!activeSpeaker || activeSpeaker === 'narrator' || char.id === activeSpeaker}
          />
        ))}
      </AnimatePresence>

      {/* Overlay UI (DialogueBox, ChoicePanel, etc.) */}
      {children}
    </div>
  );
}
