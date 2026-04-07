'use client';

import CharacterSprite from './CharacterSprite';

interface SceneRendererProps {
  backgroundId: string | undefined;
  speaker: string | undefined;
  emotion: string | null;
  onTap: () => void;
  tapEnabled: boolean;
  children?: React.ReactNode;
}

export default function SceneRenderer({
  backgroundId,
  speaker,
  emotion,
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
      {backgroundId ? (
        <img
          src={`/assets/scenarios/car-dealership/backgrounds/${backgroundId}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a1a2e]" />
      )}

      {/* Character */}
      <CharacterSprite speaker={speaker} emotion={emotion} />

      {/* Overlay UI (DialogueBox, ChoicePanel, etc.) */}
      {children}
    </div>
  );
}
