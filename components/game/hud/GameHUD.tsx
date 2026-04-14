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
  lang?: 'uz' | 'ru';
}

// iOS detection — Safari/Chrome/FF on iOS all use WebKit and share the same
// Fullscreen API limitation (no programmatic fullscreen for arbitrary
// elements, only <video>). Checked once via userAgent.
function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports as MacIntel — disambiguate via touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Detects whether the page is already running in standalone (PWA) mode —
// either added to home screen on iOS (navigator.standalone) or launched
// from the installed PWA on any platform (display-mode: standalone).
function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (
    'standalone' in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    return true;
  }
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

const IOS_HINT_COPY = {
  title: {
    uz: "To'liq ekran uchun",
    ru: 'Для полноэкранного режима',
  },
  body: {
    uz: "iPhone'da to'liq ekran rejimi faqat sahifa Bosh ekranga qo'shilgandan keyin ishlaydi.",
    ru: 'На iPhone полноэкранный режим работает только после добавления страницы на экран «Домой».',
  },
  steps: {
    uz: [
      "Safari'da pastdagi «Ulashish» tugmasini bosing",
      "«Bosh ekranga qo'shish»ni tanlang",
      "Bosh ekrandagi yangi ikonkadan simulyatsiyani oching",
    ],
    ru: [
      'В Safari нажмите кнопку «Поделиться» внизу',
      'Выберите «На экран "Домой"»',
      'Запустите симуляцию с новой иконки на рабочем столе',
    ],
  },
  close: { uz: 'Tushundim', ru: 'Понятно' },
} as const;

function GameHUD({
  lives,
  maxLives,
  score,
  comboCount,
  level,
  onPause,
  lang = 'ru',
}: GameHUDProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenApiSupported, setFullscreenApiSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    setFullscreenApiSupported(
      typeof document !== 'undefined' && Boolean(document.fullscreenEnabled)
    );
    setIsIOS(detectIOS());
    setIsStandalone(detectStandalone());
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  async function handleToggleFullscreen(e: React.MouseEvent) {
    e.stopPropagation();
    // iOS WebKit doesn't support programmatic fullscreen for non-<video>
    // elements. Show install-to-home-screen instructions instead.
    if (!fullscreenApiSupported) {
      if (isIOS) setShowIOSHint(true);
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser may reject (e.g. no user gesture); ignore.
    }
  }

  // Already running as PWA / standalone — the viewport has no browser chrome
  // to hide, so the button would be a no-op. Hide it in that case.
  const showFullscreenButton = !isStandalone && (fullscreenApiSupported || isIOS);

  return (
    <>
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
          {showFullscreenButton && (
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

      {/* iOS fullscreen hint modal — shown when the Fullscreen API isn't
          available and the user is on iOS. Instructs them to add the page
          to the home screen for a chrome-free experience. */}
      {showIOSHint && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-4"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">{IOS_HINT_COPY.title[lang]}</h3>
            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
              {IOS_HINT_COPY.body[lang]}
            </p>
            <ol className="text-sm text-neutral-200 space-y-2 mb-5 list-decimal pl-5">
              {IOS_HINT_COPY.steps[lang].map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <button
              onClick={() => setShowIOSHint(false)}
              className="bg-blue-600 hover:bg-blue-700 w-full py-2.5 rounded-xl text-white font-semibold transition-colors"
            >
              {IOS_HINT_COPY.close[lang]}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(GameHUD);
