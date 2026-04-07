'use client';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function PauseMenu({ onResume, onExit, isMuted, onToggleMute }: PauseMenuProps) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center"
      onClick={onResume}
    >
      <div
        className="bg-neutral-900 rounded-2xl p-8 max-w-xs w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Пауза</h2>

        <button
          onClick={onResume}
          className="bg-blue-600 hover:bg-blue-700 w-full py-3 rounded-xl text-white font-semibold transition-colors mb-3"
        >
          Продолжить
        </button>

        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors mb-3"
          >
            {isMuted ? '🔇 Включить звук' : '🔊 Выключить звук'}
          </button>
        )}

        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors"
        >
          Выйти
        </button>

        <p className="text-xs text-neutral-500 mt-2">
          Прогресс дня будет потерян
        </p>
      </div>
    </div>
  );
}
