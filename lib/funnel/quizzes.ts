import type { QuizQuestion } from './types';

// REPLACE question/options/correctIndex with real content when provided.
// correctIndex must be 0..3 and options must have exactly 4 items.
export const QUIZZES: QuizQuestion[] = [
  {
    lesson: 1,
    question:
      "Videodagi ma'lumotlarga ko'ra, hozirgi paytda \"ekologik sotuv\" nima degani?",
    options: [
      'Insonga nimadirni bosim asosida tiqishtirib sotish.',
      'Insonning ehtiyojini inobatga olgan holda unga toʻgʻri maslahat berish.',
      "Xaridorga dezinformatsiya berib bo'lsa ham mahsulotni sotish.",
      "Mijozning ehtiyojini so'ramasdan turib, unga xohlagan narsani taklif qilish.",
    ],
    correctIndex: 1,
  },
  {
    lesson: 2,
    question:
      "Videoga ko'ra, sotuv jarayonida mijozga beriladigan savollar qanday ikkita asosiy turga bo'linadi?",
    options: [
      'Ochiq savol va yopiq savol',
      'Umumiy savol va aniqlik kirituvchi savol',
      "Asosiy savol va qo'shimcha savol",
      'Mantiqiy savol va hissiy savol',
    ],
    correctIndex: 1,
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
