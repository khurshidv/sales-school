import type { QuizQuestion } from './types';

// REPLACE question/options/correctIndex with real content when provided.
// correctIndex must be 0..3 and options must have exactly 4 items.
export const QUIZZES: QuizQuestion[] = [
  {
    lesson: 1,
    question: "Dars 1 bo'yicha savol (joy qoldirgich)",
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 2,
    question: "Dars 2 bo'yicha savol (joy qoldirgich)",
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 3,
    question: "Dars 3 bo'yicha savol (joy qoldirgich)",
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 4,
    question: "Dars 4 bo'yicha savol (joy qoldirgich)",
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
];

export function getQuiz(lesson: number): QuizQuestion | null {
  return QUIZZES.find((q) => q.lesson === lesson) ?? null;
}
