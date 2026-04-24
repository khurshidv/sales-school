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
    question:
      "Videoga ko'ra, mijozga mahsulotni (masalan, noutbukni) taklif qilayotganda nima uchun faqat murakkab texnik atamalardan (SSD, HDD va hokazo) foydalanmaslik tavsiya etiladi?",
    options: [
      "Mijoz tushunmaydi, diskomfortga tushib ishonchi yo'qoladi va bu xaridga olib kelmaydi.",
      "Texnik atamalar mahsulotning narxini sun'iy ravishda oshirib ko'rsatadi.",
      "Sotuvchining o'zi texnik ma'lumotlarda adashib ketishi ehtimoli yuqori bo'ladi.",
      'Barcha mijozlar texnik xususiyatlarni sotuvchidan ham yaxshiroq bilishadi.',
    ],
    correctIndex: 0,
  },
  {
    lesson: 4,
    question:
      "Videoga ko'ra, agar mijoz sotuvchiga ko'plab savollar bersa va e'tirozlar bildirsa, bu nima deb qabul qilinishi kerak?",
    options: [
      "Bu mijozning umuman xarid qilmasligini anglatadi, u shunchaki vaqt olyapti.",
      "Mijoz faqat asabga tegish yoki bahslashish maqsadida savol beryapti.",
      "Bu mijozning mahsulotga bo'lgan qiziqishi belgisi bo'lib, unga to'g'ri javob berish xaridga olib keladi.",
      "E'tirozlar mijozning sotuvchiga nisbatan shaxsiy adovati borligini ko'rsatadi.",
    ],
    correctIndex: 2,
  },
];

export function getQuiz(lesson: number): QuizQuestion | null {
  return QUIZZES.find((q) => q.lesson === lesson) ?? null;
}
