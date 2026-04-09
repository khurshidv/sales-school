'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CharacterSprite from './CharacterSprite';
import SoundManager from '@/lib/game/audio/SoundManager';
import type { CharacterOnScreen } from '@/game/engine/types';

interface SceneRendererProps {
  backgroundId: string;
  characters: CharacterOnScreen[];
  activeSpeaker: string | undefined;
  onTap: () => void;
  tapEnabled: boolean;
  children?: React.ReactNode;
}

export default function SceneRenderer({
  backgroundId,
  characters,
  activeSpeaker,
  onTap,
  tapEnabled,
  children,
}: SceneRendererProps) {
  // Audio unlock on first user gesture (no fullscreen — unreliable in in-app browsers)
  useEffect(() => {
    const unlockAudio = () => {
      SoundManager.getInstance().unlock();
    };

    document.addEventListener('click', unlockAudio, { capture: true, once: true });
    document.addEventListener('touchend', unlockAudio, { capture: true, once: true });
    return () => {
      document.removeEventListener('click', unlockAudio, true);
      document.removeEventListener('touchend', unlockAudio, true);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (tapEnabled) {
      onTap();
    }
  }, [tapEnabled, onTap]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (tapEnabled) {
      e.preventDefault(); // prevent ghost click
      onTap();
    }
  }, [tapEnabled, onTap]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden touch-manipulation"
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
