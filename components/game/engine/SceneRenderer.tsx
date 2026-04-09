'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CharacterSprite from './CharacterSprite';
import SoundManager from '@/lib/game/audio/SoundManager';
import type { CharacterOnScreen } from '@/game/engine/types';

interface SceneRendererProps {
  backgroundId: string;
  characters: CharacterOnScreen[];
  activeSpeaker: string | undefined;
  children?: React.ReactNode;
}

export default function SceneRenderer({
  backgroundId,
  characters,
  activeSpeaker,
  children,
}: SceneRendererProps) {
  // Audio unlock on first user gesture
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

  return (
    <div className="relative w-full h-dvh overflow-hidden">
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
