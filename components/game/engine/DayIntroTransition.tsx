'use client';

import Image from 'next/image';

interface DayIntroTransitionProps {
  dayNumber: number;
  title: string;
  subtitle?: string;
  teaser?: string;
  backgroundId: string;
  onComplete: () => void;
  lang?: 'uz' | 'ru';
}

const t = {
  day: { uz: 'Kun', ru: 'День' },
  tapToContinue: { uz: 'Davom etish uchun bosing', ru: 'Нажмите, чтобы продолжить' },
  start: { uz: 'Boshlash', ru: 'Начать' },
} as const;

const kenBurnsKeyframes = `
@keyframes kenBurns {
  from { transform: scale(1); }
  to { transform: scale(1.15); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

export default function DayIntroTransition({
  dayNumber,
  title,
  subtitle,
  teaser,
  backgroundId,
  onComplete,
  lang = 'uz',
}: DayIntroTransitionProps) {
  return (
    <>
      <style>{kenBurnsKeyframes}</style>

      <div
        className="fixed inset-0 z-30 bg-black cursor-pointer"
        onClick={onComplete}
      >
        {/* Background with Ken Burns. The scale animation runs on the
            wrapper div; next/image handles format + responsive sizes. */}
        <div
          className="absolute inset-0 motion-reduce:!transform-none"
          style={{
            animation: 'kenBurns 6s ease-out forwards',
          }}
        >
          <Image
            src={`/assets/scenarios/car-dealership/backgrounds/${backgroundId}.jpg`}
            alt=""
            fill
            sizes="100vw"
            priority
            quality={60}
            className="object-cover"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Text sequence */}
        <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-6 gap-3">
          {/* Day number + title */}
          <h1
            className="text-4xl font-bold text-white drop-shadow-lg motion-reduce:!opacity-100 motion-reduce:!animation-none"
            style={{
              opacity: 0,
              animation: 'fadeIn 1s ease-out 0s forwards',
            }}
          >
            {t.day[lang]} {dayNumber}
          </h1>

          <p
            className="text-2xl font-semibold text-white drop-shadow-md motion-reduce:!opacity-100 motion-reduce:!animation-none"
            style={{
              opacity: 0,
              animation: 'fadeIn 1s ease-out 0.8s forwards',
            }}
          >
            {title}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-xl text-white/80 motion-reduce:!opacity-100 motion-reduce:!animation-none"
              style={{
                opacity: 0,
                animation: 'fadeIn 1s ease-out 1.5s forwards',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Teaser */}
          {teaser && (
            <p
              className="text-lg text-white/60 italic max-w-md motion-reduce:!opacity-100 motion-reduce:!animation-none"
              style={{
                opacity: 0,
                animation: 'fadeIn 1s ease-out 3s forwards',
              }}
            >
              {teaser}
            </p>
          )}
        </div>

        {/* Tap to continue */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span
            className="text-sm text-white/50 motion-reduce:hidden"
            style={{
              opacity: 0,
              animation: 'fadeIn 1s ease-out 5s forwards, blink 2s ease-in-out 6s infinite',
            }}
          >
            {t.tapToContinue[lang]}
          </span>

          {/* Reduced motion: show button instead */}
          <button
            onClick={onComplete}
            className="hidden motion-reduce:!block px-6 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
          >
            {t.start[lang]}
          </button>
        </div>
      </div>
    </>
  );
}
