'use client';

import { m, useReducedMotion } from 'framer-motion';
import { day1Narratives } from '@/game/data/narratives/day1';
import { day2Narratives } from '@/game/data/narratives/day2';
import { day3Narratives } from '@/game/data/narratives/day3';
import {
  getCriticalErrorInsights,
  type CriticalErrorInsight,
} from '@/game/data/narratives/criticalErrors';
import type { DayOutcome } from '@/game/engine/types';

interface DayNarrativeProps {
  dayNumber: number;
  outcome: DayOutcome;
  lang: 'uz' | 'ru';
  /**
   * Set of game session flags at end of day. Used to render the
   * diagnostic block of critical methodological errors. Optional —
   * when missing, the block is skipped.
   */
  flags?: Record<string, boolean>;
}

// Реестр нарративов по дням. Чтобы добавить Day 4+, импортируйте
// соответствующий `dayNNarratives` и добавьте сюда.
const NARRATIVES_BY_DAY = {
  1: day1Narratives,
  2: day2Narratives,
  3: day3Narratives,
} as const;

const t = {
  mistakesHeader: {
    uz: "Nimasi noto'g'ri ketdi",
    ru: 'Что именно пошло не так',
  },
} as const;

export default function DayNarrative({
  dayNumber,
  outcome,
  lang,
  flags,
}: DayNarrativeProps) {
  const shouldReduceMotion = useReducedMotion();
  const narratives = NARRATIVES_BY_DAY[dayNumber as keyof typeof NARRATIVES_BY_DAY];

  // Критические ошибки показываем только для "плохих" исходов —
  // на успешных экранах они бы выглядели противоречиво.
  const insights: CriticalErrorInsight[] =
    outcome === 'success' || outcome === 'hidden_ending'
      ? []
      : getCriticalErrorInsights(flags);

  if (!narratives) {
    if (insights.length === 0) return null;
    return <CriticalErrorList insights={insights} lang={lang} />;
  }

  const narrative = narratives[outcome];
  const title = narrative.title[lang];
  const body = narrative.body[lang];
  const insight = narrative.insight[lang];

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        delay: shouldReduceMotion ? 0 : 0.15,
      }}
    >
      <h3 className="text-[11px] sm:text-xs lg:text-base font-semibold text-white mb-1 leading-snug">
        {title}
      </h3>

      <div className="space-y-1 lg:space-y-3 text-[10px] sm:text-[11px] lg:text-[15px] text-neutral-200 leading-tight lg:leading-relaxed whitespace-pre-line">
        {body}
      </div>

      <div className="mt-1.5 border-l-2 border-blue-400/60 pl-2 py-0.5 text-[10px] sm:text-[11px] lg:text-sm italic text-blue-200/90 leading-tight lg:leading-snug">
        {insight}
      </div>

      {insights.length > 0 && (
        <div className="mt-2 lg:mt-3">
          <CriticalErrorList insights={insights} lang={lang} />
        </div>
      )}
    </m.section>
  );
}

function CriticalErrorList({
  insights,
  lang,
}: {
  insights: CriticalErrorInsight[];
  lang: 'uz' | 'ru';
}) {
  return (
    <section>
      <h4 className="text-[10px] sm:text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-red-300/90 mb-1 lg:mb-1.5">
        {t.mistakesHeader[lang]}
      </h4>
      <ul className="space-y-1 lg:space-y-1.5">
        {insights.map((item, idx) => (
          <li key={idx} className="border-l-2 border-red-400/60 pl-2 py-0.5">
            <div className="text-[10px] sm:text-[11px] lg:text-sm font-medium text-red-200/95 leading-snug">
              {item.title[lang]}
            </div>
            <div className="text-[10px] sm:text-[11px] lg:text-[13px] text-neutral-300 leading-tight lg:leading-snug">
              {item.insight[lang]}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
