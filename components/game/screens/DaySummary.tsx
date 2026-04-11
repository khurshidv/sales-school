'use client';

import { m, useReducedMotion } from 'framer-motion';
import type {
  DayOutcome,
  Rating,
  ScoreDimension,
  DimensionScores,
} from '@/game/engine/types';
import { DIMENSION_META } from '@/game/data/dimensions';
import {
  DIMENSION_WEIGHTS,
  getStrongestWeighted,
  getWeakestWeighted,
} from '@/game/systems/ScoringSystem';
import OutcomeBanner from './OutcomeBanner';
import DayNarrative from './DayNarrative';

interface DaySummaryProps {
  dayIndex: number;
  dayNumber: number;
  score: number;
  targetScore: number;
  rating: Rating;
  dimensions: DimensionScores;
  outcome: DayOutcome;
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

const t = {
  strongest: { uz: 'Kuchli tomon', ru: 'Сильная сторона' },
  growthZone: { uz: "O'sish zonasi", ru: 'Зона роста' },
  skillsHeader: { uz: 'Bugungi ko\'nikmalar', ru: 'Навыки за этот день' },
  achievements: { uz: 'Yutuqlar', ru: 'Достижения' },
  replayDay: { uz: 'Kunni qayta o\'ynash', ru: 'Переиграть день' },
  nextDay: { uz: 'Keyingi kun', ru: 'Следующий день' },
  showResults: { uz: 'Natijalarni ko\'rish', ru: 'Показать итоги' },
  scoreOf: { uz: 'Ball', ru: 'Счёт' },
} as const;

// Порядок отображения dimensions в UI — от важнейших к гигиеническим.
// Совпадает с приоритетом весов в ScoringSystem.
const DIMENSION_ORDER: ScoreDimension[] = [
  'opportunity',
  'discovery',
  'rapport',
  'empathy',
  'timing',
  'persuasion',
  'expertise',
];

export default function DaySummary({
  dayNumber,
  score,
  targetScore,
  rating,
  dimensions,
  outcome,
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

  const strongestKey = getStrongestWeighted(dimensions);
  const weakestKey = getWeakestWeighted(dimensions);

  // Нормализуем бары по максимальному взвешенному вкладу, а не по
  // абсолютному значению — это честнее показывает, какой dimension
  // «тянет» день сильнее, с учётом важности навыка.
  const maxWeighted = Math.max(
    ...DIMENSION_ORDER.map(
      (key) => (dimensions[key] ?? 0) * DIMENSION_WEIGHTS[key],
    ),
    1,
  );

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-white overflow-hidden">
      <div className="max-w-6xl w-full mx-auto flex-1 min-h-0 flex flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-6">
        {/* Main 2-col grid: narrative (left) + stats (right) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0">
          {/* LEFT column — narrative side */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 -mr-1">
            {/* Outcome Banner — крупная плашка с рейтингом + исходом */}
            <OutcomeBanner outcome={outcome} rating={rating} lang={lang} />

            {/* Score line */}
            <div className="flex items-baseline justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-white/50">
                {t.scoreOf[lang]}
              </span>
              <span className="text-base font-medium text-white tabular-nums">
                {score} <span className="text-white/40">/ {targetScore}</span>
              </span>
            </div>

            {/* Narrative — рассказ, как прошёл день */}
            <DayNarrative dayNumber={dayNumber} outcome={outcome} lang={lang} />

            {/* Near-miss */}
            {nearMiss && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  {lang === 'uz'
                    ? `${nearMiss.nextRating} reytingigacha yana ${nearMiss.pointsNeeded} ochko!`
                    : `Ещё ${nearMiss.pointsNeeded} очков до рейтинга ${nearMiss.nextRating}!`}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT column — stats / rewards */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 -mr-1">
            {/* Skills section */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
                {t.skillsHeader[lang]}
              </h3>
              <div className="space-y-2.5 lg:space-y-4">
                {DIMENSION_ORDER.map((key) => {
                  const value = dimensions[key] ?? 0;
                  const weighted = value * DIMENSION_WEIGHTS[key];
                  const pct = Math.round((weighted / maxWeighted) * 100);
                  const isStrongest = key === strongestKey && value > 0;
                  const isWeakest = key === weakestKey;
                  const meta = DIMENSION_META[key];

                  const barColor = isStrongest
                    ? '#22c55e'
                    : isWeakest
                      ? '#fbbf24'
                      : '#4a90d9';

                  return (
                    <m.div
                      key={key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        delay: shouldReduceMotion ? 0 : 0.2,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
                          {isStrongest && (
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          )}
                          {isWeakest && !isStrongest && (
                            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                          )}
                          {meta.label[lang]}
                        </span>
                        {isStrongest && (
                          <span className="text-[10px] sm:text-xs text-green-400 font-medium">
                            {t.strongest[lang]}
                          </span>
                        )}
                        {isWeakest && !isStrongest && (
                          <span className="text-[10px] sm:text-xs text-yellow-400 font-medium">
                            {t.growthZone[lang]}
                          </span>
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
                      <p className="hidden lg:block text-xs text-neutral-400 leading-snug mt-1.5">
                        {meta.description[lang]}
                      </p>
                    </m.div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
                  {t.achievements[lang]}
                </h3>
                <div className="space-y-2">
                  {unlockedAchievements.map((id) => (
                    <div
                      key={id}
                      className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm"
                    >
                      {'\u{1F3C6}'} {id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* XP + Coins */}
            <div className="flex items-center justify-center gap-6">
              <span className="text-green-400 font-semibold text-sm">
                +{xpEarned} XP
              </span>
              <span className="text-yellow-400 font-semibold text-sm">
                +{coinsEarned} {'\u{1FA99}'}
              </span>
            </div>

            {/* Teaser for next day */}
            {nextDayTeaser && !isLastDay && (
              <p className="italic text-neutral-400 text-center text-xs sm:text-sm leading-relaxed px-2">
                {nextDayTeaser}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons — outside grid, always visible at bottom */}
        <div className="flex gap-3 pt-3 sm:pt-4 shrink-0">
          <button
            onClick={onReplayDay}
            className="flex-1 bg-white/10 border border-white/20 hover:bg-white/15 py-3 rounded-xl text-white transition-colors text-sm"
          >
            {t.replayDay[lang]}{' '}
            {canReplay && <span className="ml-1">{'\u{1FA99}'} 1</span>}
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
