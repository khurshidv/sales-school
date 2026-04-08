'use client';

import CTABlock from './CTABlock';

type Rating = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface FinalResultsProps {
  totalScore: number;
  dimensions: {
    empathy: number;
    rapport: number;
    timing: number;
    expertise: number;
    persuasion: number;
    discovery: number;
    opportunity: number;
  };
  dayRatings: Rating[];
  strongestDimension: string;
  weakestDimension: string;
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
  title: { uz: 'Stajirovka natijalari', ru: 'Итоги стажировки' },
  day: { uz: 'Kun', ru: 'День' },
  totalScore: { uz: 'Umumiy ball', ru: 'Общий счёт' },
  strongest: { uz: 'Kuchli tomon', ru: 'Сильная сторона' },
  growthZone: { uz: "O'sish zonasi", ru: 'Зона роста' },
  downloadGuide: { uz: 'Gidni yuklab oling', ru: 'Скачай гайд по' },
  talkToExpert: { uz: 'Ekspert bilan gaplashing', ru: 'Поговори с экспертом' },
  toMenu: { uz: 'Menyuga', ru: 'В меню' },
} as const;

export default function FinalResults({
  totalScore,
  dimensions,
  dayRatings,
  strongestDimension,
  weakestDimension,
  onExit,
  lang = 'uz',
}: FinalResultsProps) {
  const entries = Object.entries(dimensions) as [string, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  const weakestLabel =
    DIMENSION_LABELS[weakestDimension]?.[lang] || weakestDimension;

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-8">
          {t.title[lang]}
        </h1>

        {/* Day ratings row */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {dayRatings.map((r, i) => (
            <div key={i} className="text-center">
              <span className="text-xs text-neutral-400 block">
                {t.day[lang]} {i + 1}
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: RATING_COLORS[r] }}
              >
                {r}
              </span>
            </div>
          ))}
        </div>

        {/* Total score */}
        <div className="text-center mb-8">
          <p className="text-neutral-400 text-sm">{t.totalScore[lang]}</p>
          <p className="text-5xl font-bold">{totalScore}</p>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3 mb-6">
          {entries.map(([key, value]) => {
            const isStrongest = key === strongestDimension;
            const isWeakest = key === weakestDimension;
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
                    className="h-2 rounded-full"
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

        {/* CTA Block */}
        <CTABlock
          primaryTitle={`${t.downloadGuide[lang]} ${weakestLabel}`}
          secondaryTitle={t.talkToExpert[lang]}
          onPrimaryClick={() => alert('CTA clicked')}
          onSecondaryClick={() => alert('CTA clicked')}
        />

        {/* Exit button */}
        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors mt-6"
        >
          {t.toMenu[lang]}
        </button>
      </div>
    </div>
  );
}
