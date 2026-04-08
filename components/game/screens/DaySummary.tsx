'use client';

import { motion, useReducedMotion } from 'framer-motion';

type Rating = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface DaySummaryProps {
  dayIndex: number;
  score: number;
  targetScore: number;
  rating: Rating;
  dimensions: {
    empathy: number;
    rapport: number;
    timing: number;
    expertise: number;
    persuasion: number;
    discovery: number;
    opportunity: number;
  };
  nearMiss: {
    currentRating: string;
    nextRating: string;
    pointsNeeded: number;
  } | null;
  unlockedAchievements: string[];
  coinsEarned: number;
  xpEarned: number;
  nextDayTeaser?: string;
  isLastDay: boolean;
  onNextDay: () => void;
  onReplayDay: () => void;
  canReplay: boolean;
  lang?: 'uz' | 'ru';
}

const RATING_COLORS: Record<Rating, string> = {
  S: '#ffd700',
  A: '#22c55e',
  B: '#4a90d9',
  C: '#fbbf24',
  D: '#f97316',
  F: '#ef4444',
};

const DIMENSION_LABELS: Record<string, { uz: string; ru: string }> = {
  empathy: { uz: 'Empatiya', ru: 'Эмпатия' },
  rapport: { uz: 'Rapport', ru: 'Раппорт' },
  timing: { uz: 'Tayming', ru: 'Тайминг' },
  expertise: { uz: 'Ekspertiza', ru: 'Экспертиза' },
  persuasion: { uz: 'Ishontirish', ru: 'Убеждение' },
  discovery: { uz: 'Ehtiyojlarni aniqlash', ru: 'Выявление потребностей' },
  opportunity: { uz: 'Imkoniyatlar bilan ishlash', ru: 'Работа с возможностями' },
};

const t = {
  strongest: { uz: 'Kuchli tomon', ru: 'Сильная сторона' },
  growthZone: { uz: "O'sish zonasi", ru: 'Зона роста' },
  nearMiss: { uz: 'ochkogacha', ru: 'очков до рейтинга' },
  achievements: { uz: 'Yutuqlar', ru: 'Достижения' },
  replayDay: { uz: 'Kunni qayta o\'ynash', ru: 'Переиграть день' },
  nextDay: { uz: 'Keyingi kun', ru: 'Следующий день' },
  showResults: { uz: 'Natijalarni ko\'rish', ru: 'Показать итоги' },
} as const;

export default function DaySummary({
  score,
  targetScore,
  rating,
  dimensions,
  nearMiss,
  unlockedAchievements,
  coinsEarned,
  xpEarned,
  nextDayTeaser,
  isLastDay,
  onNextDay,
  onReplayDay,
  canReplay,
  lang = 'uz',
}: DaySummaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const entries = Object.entries(dimensions) as [string, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const strongestKey = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const weakestKey = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        {/* Rating reveal */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5, duration: 0.5 }}
            className="text-7xl font-bold"
            style={{ color: RATING_COLORS[rating] }}
          >
            {rating}
          </motion.div>
          <p className="text-neutral-400 mt-2">
            {score} / {targetScore}
          </p>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3 mb-6">
          {entries.map(([key, value]) => {
            const isStrongest = key === strongestKey;
            const isWeakest = key === weakestKey;
            const barColor = isStrongest
              ? '#22c55e'
              : isWeakest
                ? '#fbbf24'
                : '#4a90d9';
            const pct = Math.round((value / maxVal) * 100);

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-300 flex items-center gap-1.5">
                    {isStrongest && (
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    )}
                    {isWeakest && (
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                    )}
                    {DIMENSION_LABELS[key]?.[lang] ?? key}
                  </span>
                  {isStrongest && (
                    <span className="text-xs text-green-400">
                      {t.strongest[lang]}
                    </span>
                  )}
                  {isWeakest && (
                    <span className="text-xs text-yellow-400">{t.growthZone[lang]}</span>
                  )}
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-[800ms] ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Near-miss */}
        {nearMiss && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
            <p className="text-yellow-300 text-sm">
              {lang === 'uz'
                ? `${nearMiss.nextRating} reytingigacha yana ${nearMiss.pointsNeeded} ochko!`
                : `Ещё ${nearMiss.pointsNeeded} очков до рейтинга ${nearMiss.nextRating}!`}
            </p>
          </div>
        )}

        {/* Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">
              {t.achievements[lang]}
            </h3>
            <div className="space-y-2">
              {unlockedAchievements.map((id) => (
                <div key={id} className="bg-white/5 rounded-lg p-2 text-sm">
                  🏆 {id}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* XP + Coins */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <span className="text-green-400 font-semibold">+{xpEarned} XP</span>
          <span className="text-yellow-400 font-semibold">
            +{coinsEarned} 🪙
          </span>
        </div>

        {/* Teaser */}
        {nextDayTeaser && (
          <p className="italic text-neutral-400 mt-4 text-center text-sm">
            {nextDayTeaser}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onReplayDay}
            className="flex-1 bg-white/10 border border-white/20 hover:bg-white/15 py-3 rounded-xl text-white transition-colors text-sm"
          >
            {t.replayDay[lang]} {canReplay && <span className="ml-1">🪙 1</span>}
          </button>
          <button
            onClick={onNextDay}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition-colors text-sm"
          >
            {isLastDay ? t.showResults[lang] : t.nextDay[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
