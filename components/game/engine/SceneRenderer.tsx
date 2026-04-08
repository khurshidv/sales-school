'use client';

import CharacterSprite from './CharacterSprite';
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
  const handleClick = () => {
    if (tapEnabled) {
      onTap();
    }
  };

  return (
    <div
      className="relative w-full h-dvh overflow-hidden"
      onClick={handleClick}
    >
      {/* Background */}
      <img
        src={`/assets/scenarios/car-dealership/backgrounds/${backgroundId}.jpg`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Characters */}
      {characters.map((char) => (
        <CharacterSprite
          key={char.id}
          characterId={char.id}
          emotion={char.emotion}
          position={char.position}
          isActive={char.id === activeSpeaker}
        />
      ))}

      {/* Overlay UI (DialogueBox, ChoicePanel, etc.) */}
      {children}
    </div>
  );
}
