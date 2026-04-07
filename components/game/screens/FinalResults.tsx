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
}

const RATING_COLORS: Record<Rating, string> = {
  S: '#ffd700',
  A: '#22c55e',
  B: '#4a90d9',
  C: '#fbbf24',
  D: '#f97316',
  F: '#ef4444',
};

const DIMENSION_LABELS: Record<string, string> = {
  empathy: 'Эмпатия',
  rapport: 'Раппорт',
  timing: 'Тайминг',
  expertise: 'Экспертиза',
  persuasion: 'Убеждение',
  discovery: 'Выявление потребностей',
  opportunity: 'Работа с возможностями',
};

export default function FinalResults({
  totalScore,
  dimensions,
  dayRatings,
  strongestDimension,
  weakestDimension,
  onExit,
}: FinalResultsProps) {
  const entries = Object.entries(dimensions) as [string, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  const weakestLabel =
    DIMENSION_LABELS[weakestDimension] || weakestDimension;

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Итоги стажировки
        </h1>

        {/* Day ratings row */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {dayRatings.map((r, i) => (
            <div key={i} className="text-center">
              <span className="text-xs text-neutral-400 block">
                День {i + 1}
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
          <p className="text-neutral-400 text-sm">Общий счёт</p>
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
                    {DIMENSION_LABELS[key]}
                  </span>
                  {isStrongest && (
                    <span className="text-xs text-green-400">
                      Сильная сторона
                    </span>
                  )}
                  {isWeakest && (
                    <span className="text-xs text-yellow-400">Зона роста</span>
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
          primaryTitle={`Скачай гайд по ${weakestLabel}`}
          secondaryTitle="Поговори с экспертом"
          onPrimaryClick={() => alert('CTA clicked')}
          onSecondaryClick={() => alert('CTA clicked')}
        />

        {/* Exit button */}
        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/15 w-full py-3 rounded-xl text-neutral-300 transition-colors mt-6"
        >
          В меню
        </button>
      </div>
    </div>
  );
}
