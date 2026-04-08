'use client';

interface GameOverProps {
  dayIndex: number;
  onRestart: () => void;
  onExit: () => void;
  canAffordRestart: boolean;
  lang?: 'uz' | 'ru';
}

const t = {
  allLivesLost: { uz: 'Barcha jonlar yo\'qoldi!', ru: 'Все жизни потеряны!' },
  day: { uz: 'Kun', ru: 'День' },
  restartDay: { uz: 'Kunni qayta boshlash', ru: 'Начать день заново' },
  noCoins: { uz: 'Restart uchun tanga yo\'q', ru: 'Нет монет для рестарта' },
  exitToMenu: { uz: 'Menyuga chiqish', ru: 'Выйти в меню' },
} as const;

export default function GameOver({
  dayIndex,
  onRestart,
  onExit,
  canAffordRestart,
  lang = 'uz',
}: GameOverProps) {
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">
          {t.allLivesLost[lang]}
        </h2>

        <p className="text-neutral-400 mb-8">{t.day[lang]} {dayIndex + 1}</p>

        <button
          onClick={onRestart}
          disabled={!canAffordRestart}
          className={`w-full py-3 rounded-xl font-semibold transition-colors mb-3 ${
            canAffordRestart
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {canAffordRestart ? t.restartDay[lang] : t.noCoins[lang]}
        </button>

        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors"
        >
          {t.exitToMenu[lang]}
        </button>
      </div>
    </div>
  );
}
