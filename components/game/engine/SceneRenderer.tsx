'use client';

import { useRef, useEffect } from 'react';
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
  const hasRequestedFullscreen = useRef(false);

  // Reset fullscreen flag when user exits via back gesture — next tap will re-enter
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        hasRequestedFullscreen.current = false;
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const handleClick = () => {
    // Unlock audio FIRST — must happen before fullscreen consumes the user gesture
    SoundManager.getInstance().unlock();

    // Then enter fullscreen — completely hides address bar like video playback
    if (!hasRequestedFullscreen.current) {
      hasRequestedFullscreen.current = true;
      const el = document.documentElement;
      const rfs = el.requestFullscreen ?? (el as any).webkitRequestFullscreen;
      if (rfs) {
        rfs.call(el).then(() => {
          (screen.orientation as any)?.lock?.('landscape').catch(() => {});
        }).catch(() => {});
      }
    }
    if (tapEnabled) {
      onTap();
    }
  };

  return (
    <div
      className="relative w-full h-dvh overflow-hidden"
      onClick={handleClick}
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
