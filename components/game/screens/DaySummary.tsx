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
      <div className="max-w-6xl w-full mx-auto flex-1 min-h-0 flex flex-col px-3 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-6">
        {/* Hero: compact banner with rating + title + score + rewards (one row) */}
        <OutcomeBanner
          outcome={outcome}
          rating={rating}
          lang={lang}
          score={score}
          targetScore={targetScore}
          xpEarned={xpEarned}
          coinsEarned={coinsEarned}
        />

        {/* Main 2-col grid: narrative (left) + skills (right) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 mt-2 sm:mt-3 lg:mt-4">
          {/* LEFT column — narrative side */}
          <div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1 -mr-1">
            <DayNarrative dayNumber={dayNumber} outcome={outcome} lang={lang} />

            {nearMiss && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5 lg:p-3">
                <p className="text-yellow-300 text-[11px] sm:text-xs lg:text-sm leading-snug">
                  {lang === 'uz'
                    ? `${nearMiss.nextRating} reytingigacha yana ${nearMiss.pointsNeeded} ochko!`
                    : `Ещё ${nearMiss.pointsNeeded} очков до рейтинга ${nearMiss.nextRating}!`}
                </p>
              </div>
            )}

            {/* Achievements — показываем как bonus-блок (hidden on <lg чтобы
                уместить narrative+near-miss на mobile landscape без скролла) */}
            {unlockedAchievements.length > 0 && (
              <div className="hidden lg:block">
                <h3 className="text-sm font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t.achievements[lang]}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {unlockedAchievements.map((id) => (
                    <span
                      key={id}
                      className="bg-white/5 border border-white/10 rounded-full px-2 py-1 text-sm"
                    >
                      {'\u{1F3C6}'} {id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Teaser — показываем только на desktop (экономим вертикаль на mobile) */}
            {nextDayTeaser && !isLastDay && (
              <p className="hidden lg:block italic text-neutral-400 text-sm leading-relaxed">
                {nextDayTeaser}
              </p>
            )}
          </div>

          {/* RIGHT column — skills */}
          <div className="flex flex-col gap-1 min-h-0 overflow-y-auto pr-1 -mr-1">
            <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white/70 uppercase tracking-wider shrink-0">
              {t.skillsHeader[lang]}
            </h3>
            <div className="flex flex-col gap-1 lg:gap-3">
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
                    <div className="flex items-center justify-between leading-tight">
                      <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-white flex items-center gap-1.5">
                        {isStrongest && (
                          <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500 inline-block" />
                        )}
                        {isWeakest && !isStrongest && (
                          <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-yellow-400 inline-block" />
                        )}
                        {meta.label[lang]}
                      </span>
                      {isStrongest && (
                        <span className="text-[9px] sm:text-[10px] lg:text-xs text-green-400 font-medium">
                          {t.strongest[lang]}
                        </span>
                      )}
                      {isWeakest && !isStrongest && (
                        <span className="text-[9px] sm:text-[10px] lg:text-xs text-yellow-400 font-medium">
                          {t.growthZone[lang]}
                        </span>
                      )}
                    </div>
                    <div className="bg-white/10 rounded-full h-1 lg:h-2 mt-0.5">
                      <div
                        className="h-1 lg:h-2 rounded-full transition-all duration-[800ms] ease-out"
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
