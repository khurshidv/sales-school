'use client';

import { DIMENSION_META } from '@/game/data/dimensions';
import type { DimensionScores, ScoreDimension } from '@/game/engine/types';
import { titleBadges, mentorVerdicts, type ConclusionEnding } from './conclusionCopy';

type Rating = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface FinalResultsProps {
  totalScore: number;
  dimensions: DimensionScores;
  dayRatings: Rating[];
  strongestDimension: string;
  weakestDimension: string;
  ending?: ConclusionEnding;
  onNext: () => void;
  onExit: () => void;
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

const t = {
  title: { uz: 'Stajirovka natijalari', ru: 'Итоги стажировки' },
  day: { uz: 'Kun', ru: 'День' },
  totalScore: { uz: 'Umumiy ball', ru: 'Общий счёт' },
  strongest: { uz: 'Kuchli tomon', ru: 'Сильная сторона' },
  growthZone: { uz: "O'sish zonasi", ru: 'Зона роста' },
  next: { uz: 'Mening sertifikatim', ru: 'Мой сертификат' },
  toMenu: { uz: 'Menyuga', ru: 'В меню' },
} as const;

export default function FinalResults({
  totalScore,
  dimensions,
  dayRatings,
  strongestDimension,
  weakestDimension,
  ending,
  onNext,
  onExit,
  lang = 'uz',
}: FinalResultsProps) {
  const entries = Object.entries(dimensions) as [ScoreDimension, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-y-auto px-4 py-4">
      <div className="max-w-lg mx-auto">
        {/* Header + badge inline */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">
            {t.title[lang]}
          </h1>
          {ending && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-1.5"
              style={{
                color: titleBadges[ending].color,
                border: `1.5px solid ${titleBadges[ending].color}`,
                background: `${titleBadges[ending].color}15`,
              }}
            >
              {titleBadges[ending].title[lang]}
            </span>
          )}
        </div>

        {/* Mentor verdict */}
        {weakestDimension && mentorVerdicts[weakestDimension as ScoreDimension] && (
          <p
            className="text-center text-[11px] leading-snug mb-3 px-2"
            style={{ color: '#9ca3af' }}
          >
            {mentorVerdicts[weakestDimension as ScoreDimension][lang]}
          </p>
        )}

        {/* Score + Day ratings on one row */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Day ratings */}
          <div className="flex gap-3">
            {dayRatings.map((r, i) => (
              <div key={i} className="text-center">
                <span className="text-[10px] text-neutral-500 block leading-none">
                  {t.day[lang]} {i + 1}
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: RATING_COLORS[r] }}
                >
                  {r}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10" />

          {/* Total score */}
          <div className="text-center">
            <span className="text-[10px] text-neutral-500 block leading-none">
              {t.totalScore[lang]}
            </span>
            <span className="text-3xl font-bold">{totalScore}</span>
          </div>
        </div>

        {/* Dimension bars — compact, no descriptions */}
        <div className="space-y-2 mb-4">
          {entries.map(([key, value]) => {
            const isStrongest = key === strongestDimension;
            const isWeakest = key === weakestDimension;
            const barColor = isStrongest
              ? '#22c55e'
              : isWeakest
                ? '#fbbf24'
                : '#4a90d9';
            const pct = Math.round((value / maxVal) * 100);
            const meta = DIMENSION_META[key];

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-white flex items-center gap-1">
                    {isStrongest && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    )}
                    {isWeakest && !isStrongest && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                    )}
                    {meta.label[lang]}
                  </span>
                  {isStrongest && (
                    <span className="text-[10px] text-green-400">
                      {t.strongest[lang]}
                    </span>
                  )}
                  {isWeakest && !isStrongest && (
                    <span className="text-[10px] text-yellow-400">{t.growthZone[lang]}</span>
                  )}
                </div>
                <div className="bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                      transition: 'width 800ms ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Next → School CTA */}
        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl font-semibold text-neutral-950 transition-colors"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
        >
          {t.next[lang]}
        </button>

        {/* Skip to menu */}
        <button
          onClick={onExit}
          className="w-full py-1.5 text-xs text-neutral-500 hover:text-neutral-400 transition-colors mt-1"
        >
          {t.toMenu[lang]}
        </button>
      </div>
    </div>
  );
}
