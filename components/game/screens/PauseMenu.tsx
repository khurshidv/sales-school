'use client';

import { useEffect, useState } from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  lang?: 'uz' | 'ru';
}

const t = {
  pause: { uz: 'Pauza', ru: 'Пауза' },
  resume: { uz: 'Davom etish', ru: 'Продолжить' },
  muteOn: { uz: "Ovozni o'chirish", ru: 'Выключить звук' },
  muteOff: { uz: 'Ovozni yoqish', ru: 'Включить звук' },
  fullscreenOn: { uz: "To'liq ekran", ru: 'Полный экран' },
  fullscreenOff: { uz: 'Ekrandan chiqish', ru: 'Свернуть' },
  exit: { uz: 'Chiqish', ru: 'Выйти' },
  warning: { uz: 'Kun progressi yo\'qoladi', ru: 'Прогресс дня будет потерян' },
} as const;

export default function PauseMenu({ onResume, onExit, isMuted, onToggleMute, lang = 'uz' }: PauseMenuProps) {
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
      // Browser may reject (e.g. not a user gesture); silently ignore.
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center"
      onClick={onResume}
    >
      <div
        className="bg-neutral-900 rounded-2xl p-8 max-w-xs w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">{t.pause[lang]}</h2>

        <button
          onClick={onResume}
          className="bg-blue-600 hover:bg-blue-700 w-full py-3 rounded-xl text-white font-semibold transition-colors mb-3"
        >
          {t.resume[lang]}
        </button>

        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors mb-3"
          >
            {isMuted ? `🔇 ${t.muteOff[lang]}` : `🔊 ${t.muteOn[lang]}`}
          </button>
        )}

        {fullscreenSupported && (
          <button
            onClick={handleToggleFullscreen}
            className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors mb-3"
          >
            {isFullscreen ? `↙ ${t.fullscreenOff[lang]}` : `🖥 ${t.fullscreenOn[lang]}`}
          </button>
        )}

        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors"
        >
          {t.exit[lang]}
        </button>

        <p className="text-xs text-neutral-500 mt-2">
          {t.warning[lang]}
        </p>
      </div>
    </div>
  );
}
