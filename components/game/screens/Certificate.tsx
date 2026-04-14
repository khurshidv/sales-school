'use client';

import { useCallback } from 'react';
import { m } from 'framer-motion';
import { DIMENSION_META } from '@/game/data/dimensions';
import {
  certificateCopy,
  titleBadges,
  type ConclusionEnding,
} from './conclusionCopy';
import type { Rating, ScoreDimension } from '@/game/engine/types';

interface CertificateProps {
  playerName: string;
  ending: ConclusionEnding;
  dayRatings: Rating[];
  totalScore: number;
  strongestDimension: string;
  lang: 'uz' | 'ru';
  onNext: () => void;
}

const RATING_COLORS: Record<Rating, string> = {
  S: '#ffd700',
  A: '#22c55e',
  B: '#4a90d9',
  C: '#fbbf24',
  D: '#f97316',
  F: '#ef4444',
};

export default function Certificate({
  playerName,
  ending,
  dayRatings,
  totalScore,
  strongestDimension,
  lang,
  onNext,
}: CertificateProps) {
  const badge = titleBadges[ending];
  const strongLabel = DIMENSION_META[strongestDimension as ScoreDimension]?.label[lang] ?? '';
  const today = new Date().toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `SalesUp ${certificateCopy.title[lang]}`,
      text: lang === 'uz'
        ? `Men SalesUp simulyatsiyasini yakunladim! Darajam: ${badge.title[lang]}, ball: ${totalScore}`
        : `Я прошёл симуляцию SalesUp! Уровень: ${badge.title[lang]}, счёт: ${totalScore}`,
      url: 'https://salesup.uz/game',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — that's fine
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  }, [lang, badge.title, totalScore]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4"
      style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1225 50%, #0f172a 100%)',
      }}
    >
      <m.div
        className="flex flex-col items-center max-w-md w-full gap-5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Certificate card */}
        <div
          className="w-full rounded-2xl px-6 py-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f5f0e1, #ede4cc)',
            color: '#1a1a1a',
          }}
        >
          {/* Decorative border */}
          <div
            className="absolute inset-2 rounded-xl pointer-events-none"
            style={{ border: '2px solid rgba(0,0,0,0.08)' }}
          />

          {/* Logo / Title */}
          <p className="text-xs tracking-[0.2em] uppercase mb-1 font-medium" style={{ color: '#6b5c3e' }}>
            SalesUp
          </p>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#3d3425' }}>
            {certificateCopy.title[lang]}
          </h2>

          {/* Completed label */}
          <p className="text-xs mb-1" style={{ color: '#8a7d6b' }}>
            {certificateCopy.completedLabel[lang]}
          </p>

          {/* Player name */}
          <p className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a' }}>
            {playerName}
          </p>

          {/* Badge */}
          <span
            className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-5"
            style={{
              color: badge.color,
              border: `1.5px solid ${badge.color}`,
              background: `${badge.color}20`,
            }}
          >
            {badge.title[lang]}
          </span>

          {/* Day ratings */}
          <div className="flex justify-center gap-4 mb-4">
            {dayRatings.map((r, i) => (
              <div key={i} className="text-center">
                <span className="text-xs block" style={{ color: '#8a7d6b' }}>
                  {lang === 'uz' ? 'Kun' : 'День'} {i + 1}
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

          {/* Total score */}
          <p className="text-3xl font-bold mb-3" style={{ color: '#1a1a1a' }}>
            {totalScore}
          </p>

          {/* Strongest dimension */}
          <p className="text-xs" style={{ color: '#8a7d6b' }}>
            {certificateCopy.strongestLabel[lang]}:{' '}
            <span className="font-semibold" style={{ color: '#22c55e' }}>
              {strongLabel}
            </span>
          </p>

          {/* Date */}
          <p className="text-xs mt-3" style={{ color: '#a89d8b' }}>
            {today}
          </p>
        </div>

        {/* Share button */}
        <m.button
          onClick={handleShare}
          className="w-full rounded-xl px-6 py-3 text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#e5e7eb',
          }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {certificateCopy.share[lang]}
        </m.button>

        {/* Next → SchoolCTA */}
        <m.button
          onClick={onNext}
          className="w-full rounded-xl px-6 py-4 text-sm font-semibold"
          style={{
            color: '#0a0a0a',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {certificateCopy.next[lang]}
        </m.button>
      </m.div>
    </div>
  );
}
