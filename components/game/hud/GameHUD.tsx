'use client';

import LivesDisplay from './LivesDisplay';
import ScoreDisplay from './ScoreDisplay';
import ComboIndicator from './ComboIndicator';
import LevelBadge from './LevelBadge';

interface GameHUDProps {
  lives: number;
  maxLives: number;
  score: number;
  comboCount: number;
  level: number;
  onPause: () => void;
}

export default function GameHUD({
  lives,
  maxLives,
  score,
  comboCount,
  level,
  onPause,
}: GameHUDProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 h-10 flex justify-between items-center px-3"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left: Lives */}
      <div className="flex items-center">
        <LivesDisplay lives={lives} maxLives={maxLives} />
      </div>

      {/* Center: Combo */}
      <div className="flex items-center justify-center">
        <ComboIndicator comboCount={comboCount} />
      </div>

      {/* Right: Score + Level + Pause */}
      <div className="flex items-center gap-2">
        <ScoreDisplay score={score} />
        <LevelBadge level={level} />
        <button
          onClick={onPause}
          className="text-white/60 hover:text-white text-lg leading-none cursor-pointer"
          aria-label="Pause"
        >
          ❚❚
        </button>
      </div>
    </div>
  );
}
