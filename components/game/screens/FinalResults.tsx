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
  share: { uz: 'Telegram’da ulashish', ru: 'Поделиться в Telegram' },
} as const;

const SHARE_URL = typeof window !== 'undefined' ? window.location.origin + '/game' : 'https://salesschool.uz/game';

const shareText = {
  uz: (score: number) =>
    `Men SalesUp stajirovkasidan ${score} ball oldim 🏆 Sen ham sinab ko‘r:`,
  ru: (score: number) =>
    `Я прошёл стажировку SalesUp и набрал ${score} баллов 🏆 Попробуй и ты:`,
} as const;

function handleTelegramShare(totalScore: number, lang: 'uz' | 'ru') {
  const text = shareText[lang](totalScore);
  const url = `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

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

        {/* Share to Telegram */}
        <button
          type="button"
          onClick={() => handleTelegramShare(totalScore, lang)}
          className="w-full py-2.5 mt-2 rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2"
          style={{ background: '#229ED9' }}
          aria-label="Share to Telegram"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
          {t.share[lang]}
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
