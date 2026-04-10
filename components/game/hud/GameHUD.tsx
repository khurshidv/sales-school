'use client';

import { memo, useEffect, useState } from 'react';
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

function GameHUD({
  lives,
  maxLives,
  score,
  comboCount,
  level,
  onPause,
}: GameHUDProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    setFullscreenSupported(
      typeof document !== 'undefined' && Boolean(document.fullscreenEnabled)
    );
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  async function handleToggleFullscreen(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser may reject (e.g. iOS Safari, or no user gesture); ignore.
    }
  }

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 h-7 sm:h-10 flex justify-between items-center px-2 sm:px-3"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      // Stop both click AND touchend — SceneRenderer's onTouchEnd calls
      // preventDefault() to suppress ghost-click on the scene, which would
      // also cancel clicks on HUD buttons if touchend bubbles up. Swallowing
      // both events here keeps HUD buttons fully interactive on mobile.
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Left: Lives */}
      <div className="flex items-center">
        <LivesDisplay lives={lives} maxLives={maxLives} />
      </div>

      {/* Center: Combo */}
      <div className="flex items-center justify-center">
        <ComboIndicator comboCount={comboCount} />
      </div>

      {/* Right: Score + Level + Fullscreen + Pause */}
      <div className="flex items-center gap-2">
        <ScoreDisplay score={score} />
        <LevelBadge level={level} />
        {fullscreenSupported && (
          <button
            onClick={handleToggleFullscreen}
            className="text-white/60 hover:text-white cursor-pointer flex items-center justify-center"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
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

export default memo(GameHUD);
