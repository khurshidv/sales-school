'use client';

import Link from 'next/link';
import { copy } from '@/lib/funnel/copy';
import { TOTAL_LESSONS } from '@/lib/funnel/lessons';
import type { LessonIndex } from '@/lib/funnel/types';

type CircleState = 'done' | 'active' | 'locked';

function stateFor(n: LessonIndex, current: number, completed: LessonIndex[]): CircleState {
  if (completed.includes(n)) return 'done';
  if (n === current) return 'active';
  return 'locked';
}

export default function FunnelStepper({
  currentLesson,
  completedLessons,
}: {
  currentLesson: number;
  completedLessons: LessonIndex[];
}) {
  const indexes: LessonIndex[] = [1, 2, 3, 4];
  void TOTAL_LESSONS;
  return (
    <nav aria-label="Darslar progressi" className="flex items-center justify-center gap-3 md:gap-5">
      {indexes.map((n, i) => {
        const state = stateFor(n, currentLesson, completedLessons);
        const isLast = i === indexes.length - 1;
        const base =
          'relative flex items-center justify-center rounded-full text-sm font-bold size-10 md:size-12 transition';
        const variants: Record<CircleState, string> = {
          done: 'bg-[color:var(--color-badge-green)] text-white shadow-md',
          active:
            'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary)] animate-pulse-glow',
          locked:
            'bg-[color:var(--color-surface)] text-[color:var(--color-on-surface-variant)] border border-[color:var(--color-on-surface-variant)]/30',
        };
        const label =
          state === 'done'
            ? copy.stepper.doneAria
            : state === 'active'
              ? copy.stepper.currentAria
              : copy.stepper.lockedAria;
        const ariaProps = {
          'aria-current': state === 'active' ? ('step' as const) : ('false' as const),
          'aria-disabled': state === 'locked' ? ('true' as const) : ('false' as const),
          'aria-label': `Dars ${n} — ${label}`,
        };
        const content =
          state === 'done' ? (
            <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : state === 'locked' ? (
            <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0z" />
            </svg>
          ) : (
            <span>{n}</span>
          );
        const circle =
          state === 'locked' ? (
            <span className={`${base} ${variants[state]}`} {...ariaProps}>
              {content}
            </span>
          ) : (
            <Link
              href={`/start/dars/${n}`}
              className={`${base} ${variants[state]} hover:scale-[1.03]`}
              {...ariaProps}
            >
              {content}
            </Link>
          );
        return (
          <span key={n} className="flex items-center gap-3 md:gap-5">
            {circle}
            {!isLast && (
              <span
                aria-hidden
                className="h-px w-6 md:w-10 bg-[color:var(--color-on-surface-variant)]/30"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
