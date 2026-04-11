'use client';

import { m, useReducedMotion } from 'framer-motion';
import type { DayOutcome, Rating } from '@/game/engine/types';

interface OutcomeBannerProps {
  outcome: DayOutcome;
  rating: Rating;
  lang: 'uz' | 'ru';
}

const OUTCOME_TITLES: Record<DayOutcome, { uz: string; ru: string }> = {
  hidden_ending: {
    uz: 'Eng yuqori natija',
    ru: 'Высший результат',
  },
  success: {
    uz: 'Yaxshi kun',
    ru: 'Хороший день',
  },
  partial: {
    uz: 'Yaxshi, lekin ko\'proq bo\'lishi mumkin edi',
    ru: 'Неплохо, но могло быть лучше',
  },
  failure: {
    uz: 'Bitim bo\'lmadi',
    ru: 'Сделка не состоялась',
  },
};

const OUTCOME_GRADIENTS: Record<DayOutcome, string> = {
  hidden_ending:
    'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,140,0,0.12))',
  success:
    'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.10))',
  partial:
    'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.10))',
  failure:
    'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(127,29,29,0.10))',
};

const OUTCOME_BORDERS: Record<DayOutcome, string> = {
  hidden_ending: 'border-yellow-400/40',
  success: 'border-green-500/30',
  partial: 'border-amber-400/30',
  failure: 'border-red-500/30',
};

const RATING_COLORS: Record<Rating, string> = {
  S: '#ffd700',
  A: '#22c55e',
  B: '#4a90d9',
  C: '#fbbf24',
  D: '#f97316',
  F: '#ef4444',
};

export default function OutcomeBanner({
  outcome,
  rating,
  lang,
}: OutcomeBannerProps) {
  const shouldReduceMotion = useReducedMotion();
  const title = OUTCOME_TITLES[outcome][lang];

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className={`rounded-2xl border ${OUTCOME_BORDERS[outcome]} p-3 sm:p-4 flex items-center gap-3 sm:gap-4`}
      style={{ background: OUTCOME_GRADIENTS[outcome] }}
    >
      {/* Большая буква рейтинга */}
      <m.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: 'spring', bounce: 0.5, delay: 0.1, duration: 0.5 }
        }
        className="text-5xl sm:text-6xl font-bold leading-none tabular-nums"
        style={{ color: RATING_COLORS[rating] }}
      >
        {rating}
      </m.div>

      {/* Title */}
      <div className="flex-1">
        <p className="text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-1">
          {lang === 'uz' ? 'Kun natijasi' : 'Итог дня'}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-white leading-tight">
          {title}
        </h2>
      </div>
    </m.div>
  );
}
