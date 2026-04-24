import type { FunnelLesson } from './types';

// REPLACE these youtubeId values with the final video IDs when provided.
// Keep `index` monotonic 1..4.
export const LESSONS: FunnelLesson[] = [
  { index: 1, title: 'Dars 1', youtubeId: 'u_DUKA7_HXQ' },
  { index: 2, title: 'Dars 2', youtubeId: 'wUuWaQym0wA' },
  { index: 3, title: 'Dars 3', youtubeId: 'PLACEHOLDER_LESSON_3' },
  { index: 4, title: 'Dars 4', youtubeId: 'PLACEHOLDER_LESSON_4' },
];

export function getLesson(n: number): FunnelLesson | null {
  return LESSONS.find((l) => l.index === n) ?? null;
}

export const TOTAL_LESSONS = 4 as const;
export const WATCH_THRESHOLD = 0.88 as const;
