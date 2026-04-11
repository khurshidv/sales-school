'use client';

import { m, useReducedMotion } from 'framer-motion';
import { day1Narratives } from '@/game/data/narratives/day1';
import type { DayOutcome } from '@/game/engine/types';

interface DayNarrativeProps {
  dayNumber: number;
  outcome: DayOutcome;
  lang: 'uz' | 'ru';
}

// Реестр нарративов по дням. Пока только Day 1; последующие дни
// добавляются сюда после ввода соответствующих narratives/dayN.ts.
const NARRATIVES_BY_DAY = {
  1: day1Narratives,
} as const;

export default function DayNarrative({
  dayNumber,
  outcome,
  lang,
}: DayNarrativeProps) {
  const shouldReduceMotion = useReducedMotion();
  const narratives = NARRATIVES_BY_DAY[dayNumber as keyof typeof NARRATIVES_BY_DAY];

  // Fallback: для дней, у которых ещё нет нарратива, просто ничего не
  // показываем вместо плейсхолдера. DaySummary остаётся функциональным.
  if (!narratives) return null;

  const narrative = narratives[outcome];
  const title = narrative.title[lang];
  const body = narrative.body[lang];
  const insight = narrative.insight[lang];

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 0.15 }}
      className="mb-6"
    >
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 leading-snug">
        {title}
      </h3>

      <div className="space-y-3 text-sm sm:text-[15px] text-neutral-200 leading-relaxed whitespace-pre-line">
        {body}
      </div>

      <div className="mt-4 border-l-2 border-blue-400/60 pl-3 py-1 text-sm italic text-blue-200/90">
        {insight}
      </div>
    </m.section>
  );
}
