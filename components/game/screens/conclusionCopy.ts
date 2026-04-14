// ============================================================
// Conclusion Flow Copy — all localized text for the post-game
// conclusion sequence: mentor debrief, enhanced final results,
// certificate, and redesigned school CTA.
//
// Sources:
//   - /target page i18n keys (lib/i18n.tsx)
//   - Course program details (for the side.docx)
//   - Game dimension metadata (game/data/dimensions.ts)
// ============================================================

import type { ScoreDimension } from '@/game/engine/types';

export type ConclusionEnding = 'grandmaster' | 'success' | 'partial' | 'failure';

type LT = { uz: string; ru: string };

// ── Mentor Debrief ──────────────────────────────────────────
// Rustam speaks to the player by name after Day 3 ends.
// 2 lines per ending type. Use {name} placeholder.

export const mentorDebriefLines: Record<ConclusionEnding, LT[]> = {
  grandmaster: [
    {
      uz: '{name}, siz 3 kun ichida buni isbotladingiz — siz faqat sotuvchi emassiz, siz professional.',
      ru: '{name}, вы за 3 дня доказали — вы не просто продавец, вы профессионал.',
    },
    {
      uz: "Men ko'p stajorlarni ko'rganman. Siz boshqacha — siz tizimli o'ylaysiz va mijozni his qilasiz.",
      ru: 'Я видел много стажёров. Вы другой — вы мыслите системно и чувствуете клиента.',
    },
  ],
  success: [
    {
      uz: '{name}, sezimdor ekansiz. Ko\'pchilikda bu sezgi yo\'q — sizda bor.',
      ru: '{name}, вы чувствуете продажу. У большинства этого нет — у вас есть.',
    },
    {
      uz: 'Agar buni tizimga aylantirsangiz — oldingizda katta yo\'l ochiladi.',
      ru: 'Если превратите это в систему — перед вами откроется большой путь.',
    },
  ],
  partial: [
    {
      uz: "{name}, siz sinab ko'rdingiz. Ko'pchilik bunga botinmaydi.",
      ru: '{name}, вы попробовали. Большинство на это не решаются.',
    },
    {
      uz: "Salohiyat bor — buni men aniq ko'ryapman. Faqat uni to'g'ri yo'naltirishingiz kerak.",
      ru: 'Потенциал есть — я это вижу точно. Нужно только направить его правильно.',
    },
  ],
  failure: [
    {
      uz: "{name}, bilasizmi nima muhim? Siz qo'rqmadingiz va boshlashga jur'at qildingiz.",
      ru: '{name}, знаете что важно? Вы не побоялись и решились начать.',
    },
    {
      uz: "Har bir professional bir paytlar boshlang'ich bo'lgan. Muhimi — to'g'ri boshlash.",
      ru: 'Каждый профессионал когда-то был новичком. Главное — стартовать правильно.',
    },
  ],
};

// ── Title Badges ────────────────────────────────────────────

export interface TitleBadge {
  title: LT;
  color: string;
}

export const titleBadges: Record<ConclusionEnding, TitleBadge> = {
  grandmaster: {
    title: { uz: 'Grandmaster', ru: 'Грандмастер' },
    color: '#ffd700',
  },
  success: {
    title: { uz: 'Professional', ru: 'Профессионал' },
    color: '#22c55e',
  },
  partial: {
    title: { uz: 'Stajor', ru: 'Стажёр' },
    color: '#4a90d9',
  },
  failure: {
    title: { uz: "Boshlang'ich", ru: 'Начинающий' },
    color: '#9ca3af',
  },
};

// ── Mentor Verdicts (per weakest dimension) ─────────────────
// Shown in FinalResults under the title as 1-line personalized feedback.

export const mentorVerdicts: Record<ScoreDimension, LT> = {
  empathy: {
    uz: "Mijozning his-tuyg'ularini payqash ko'nikmasi hali rivojlanmagan — bu kursda birinchi darslardan o'rganiladi.",
    ru: 'Навык чувствовать состояние клиента ещё не развит — этому учат с первых уроков курса.',
  },
  rapport: {
    uz: "Ishonch qurish — sotuvning asosi. Bu ko'nikma mashq orqali rivojlanadi.",
    ru: 'Навык выстраивать доверие — основа продажи. Это развивается практикой.',
  },
  discovery: {
    uz: "Savol berib, mijozning haqiqiy ehtiyojini topish — buni o'rganish mumkin.",
    ru: 'Умение задавать вопросы и находить реальную потребность — этому можно научиться.',
  },
  timing: {
    uz: "Qachon gapirib, qachon jim turish — bu ko'nikma hali shakllanmagan.",
    ru: 'Когда говорить, а когда молчать — этот навык ещё формируется.',
  },
  expertise: {
    uz: "Mahsulot bilimini mijozning hayotidagi foydaga aylantirish — bu alohida ko'nikma.",
    ru: 'Превращать знание продукта в пользу для клиента — это отдельный навык.',
  },
  persuasion: {
    uz: "Bosim qilmasdan ishontirish — bu eng nozik ko'nikma, va u o'rganiladi.",
    ru: 'Убеждать без давления — самый тонкий навык, и он развивается.',
  },
  opportunity: {
    uz: "Bitimni yopish — eng qiyin bosqich. Buning texnikasi bor va u o'rganiladi.",
    ru: 'Закрытие сделки — самый сложный этап. Для этого есть техники, и им можно научиться.',
  },
};

// ── Certificate ─────────────────────────────────────────────

export const certificateCopy = {
  title: {
    uz: 'Stajirovka sertifikati',
    ru: 'Сертификат стажировки',
  } as LT,
  subtitle: {
    uz: 'SalesUp Simulyatsiya',
    ru: 'SalesUp Симуляция',
  } as LT,
  completedLabel: {
    uz: 'Muvaffaqiyatli yakunladi',
    ru: 'Успешно завершил(а)',
  } as LT,
  strongestLabel: {
    uz: 'Kuchli tomon',
    ru: 'Сильная сторона',
  } as LT,
  share: {
    uz: 'Ulashish',
    ru: 'Поделиться',
  } as LT,
  next: {
    uz: 'Davom etish',
    ru: 'Далее',
  } as LT,
};

// ── School CTA (redesigned) ─────────────────────────────────

export const schoolCtaHeadlines: Record<ConclusionEnding, LT> = {
  grandmaster: {
    uz: "Sizning darajangiz yuqori. SalesUp buni tizimga aylantiradi.",
    ru: 'Ваш уровень высокий. SalesUp превратит это в систему.',
  },
  success: {
    uz: "Sezgi bor. Endi unga tizim kerak.",
    ru: 'Чутьё есть. Теперь ему нужна система.',
  },
  partial: {
    uz: "O'rganish istagi — eng katta kuch. SalesUp uni yo'naltiradi.",
    ru: 'Желание учиться — главная сила. SalesUp направит её.',
  },
  failure: {
    uz: "Har bir professional bir paytlar boshlang'ich bo'lgan. SalesUp — to'g'ri start.",
    ru: 'Каждый профессионал когда-то был новичком. SalesUp — правильный старт.',
  },
};

export const schoolCtaBridge: LT = {
  uz: "Simulyatsiya salohiyatingizni ko'rsatdi. Lekin simulyatsiya bilan barqaror natija o'rtasida — tizim bor.",
  ru: 'Симуляция показала ваш потенциал. Но между симуляцией и стабильным результатом — система.',
};

// Real data from /target page (lib/i18n.tsx target.product.*)
export const schoolBenefits: { icon: string; title: LT; desc: LT }[] = [
  {
    icon: 'speed',
    title: { ru: 'Быстрый старт', uz: 'Tez boshlash' },
    desc: {
      ru: 'Всего 4 недели от первого урока до первого оффера.',
      uz: "Birinchi darsdan birinchi taqlifgacha atigi 4 hafta.",
    },
  },
  {
    icon: 'groups',
    title: { ru: 'Комьюнити', uz: 'Jamoa' },
    desc: {
      ru: 'Доступ в закрытый чат с менторами и единомышленниками.',
      uz: 'Mentorlar va hamfikrlar bilan yopiq chatga kirish.',
    },
  },
  {
    icon: 'work',
    title: { ru: 'Трудоустройство', uz: 'Ishga joylashish' },
    desc: {
      ru: 'Лучших учеников забираем в Ethereal Group и партнерские сети.',
      uz: "Eng yaxshi o'quvchilarni Ethereal Group va hamkor tarmoqlarga olamiz.",
    },
  },
  {
    icon: 'laptop_mac',
    title: { ru: '100% Практика', uz: '100% Amaliyot' },
    desc: {
      ru: 'Минимум теории, максимум реальных переговоров.',
      uz: 'Minimum nazariya, maksimum real muzokaralar.',
    },
  },
];

// Real student cases from /target page (lib/i18n.tsx target.case.*)
export const studentCases: { name: LT; desc: LT; tag: string }[] = [
  {
    name: { ru: 'Анна, 22 года', uz: 'Anna, 22 yosh' },
    desc: {
      ru: 'До курса работала бариста. После обучения устроилась в SaaS компанию. Первый бонус — $450.',
      uz: "Kursdan oldin barista bo'lgan. O'qishdan keyin SaaS kompaniyasiga ishga kirdi. Birinchi bonus — $450.",
    },
    tag: 'B2B Sales',
  },
  {
    name: { ru: 'Максим, 19 лет', uz: 'Maksim, 19 yosh' },
    desc: {
      ru: 'Был студентом без опыта. Сейчас — Junior Account Manager. Доход от $900.',
      uz: 'Tajribasiz talaba edi. Hozir — Junior Account Manager. Daromad $900 dan.',
    },
    tag: 'IT Solutions',
  },
  {
    name: { ru: 'Игорь, 25 лет', uz: 'Igor, 25 yosh' },
    desc: {
      ru: 'Ушел из госсектора. Спустя 2 месяца обучения закрыл сделку на $2000 комиссии.',
      uz: "Davlat sektoridan ketdi. 2 oylik o'qishdan keyin $2000 komissiya bilan bitim tuzdi.",
    },
    tag: 'Real Estate',
  },
];

// Real stats from /target (target.stats.*)
export const schoolStats = {
  graduates: '500+',
  partners: '50+',
  lessons: '15',
};

// Personalized dimension → course lesson mapping
// Source: for the side.docx (full program details)
export const dimensionLessonMap: Record<ScoreDimension, { lesson: LT; detail: LT }> = {
  empathy: {
    lesson: {
      uz: "Dars 2: Mijoz ichida nima bo'ladi — 5 ta bosqich",
      ru: 'Урок 2: Что происходит внутри клиента — 5 этапов',
    },
    detail: {
      uz: "Instinkt → Reaksiya → Fikr → Emotsiya → So'z. Har bir gapingizga mijoz qanday javob berishi va nima his qilishini oldindan bilasiz.",
      ru: 'Инстинкт → Реакция → Мысль → Эмоция → Слово. Вы будете заранее знать, как клиент отреагирует на каждое ваше слово.',
    },
  },
  rapport: {
    lesson: {
      uz: 'Dars 3: Sening sotuvchi turing — 4 xil odam',
      ru: 'Урок 3: Ваш тип продавца — 4 типа людей',
    },
    detail: {
      uz: "Driver, Analytical, Amiable, Expressive. 20 savollik test orqali o'z xarakter turini aniqlab, kuchlaringni bilib olasiz.",
      ru: 'Driver, Analytical, Amiable, Expressive. С помощью теста из 20 вопросов определите свой тип и узнаете свои сильные стороны.',
    },
  },
  discovery: {
    lesson: {
      uz: 'Dars 4: Mijozni tushunish — 7 ta Discovery savol',
      ru: 'Урок 4: Понимание клиента — 7 Discovery-вопросов',
    },
    detail: {
      uz: "Reason, User, Time, Experience, Result, Price, Competitors. Savol berib, mijozning haqiqiy ehtiyojini topasiz.",
      ru: 'Reason, User, Time, Experience, Result, Price, Competitors. Задавая вопросы, вы находите реальную потребность клиента.',
    },
  },
  persuasion: {
    lesson: {
      uz: 'Dars 6: Mahsulotni taklif qilish — QQPR formulasi',
      ru: 'Урок 6: Презентация продукта — формула QQPR',
    },
    detail: {
      uz: "Question → Question → Presentation → Reflection. Mijoz o'zi 'ha' desin — siz majburlamasdan.",
      ru: 'Question → Question → Presentation → Reflection. Клиент сам говорит «да» — без давления с вашей стороны.',
    },
  },
  opportunity: {
    lesson: {
      uz: 'Dars 9: Bitimni yopish — 5 texnika',
      ru: 'Урок 9: Закрытие сделки — 5 техник',
    },
    detail: {
      uz: "FOMO, 2 Variant, Taxmin, Exclusive, Muammoni yop. So'ragandan keyin jim turish — eng kuchli texnika.",
      ru: 'FOMO, 2 варианта, Допущение, Эксклюзив, Закрой проблему. Молчание после вопроса — самая сильная техника.',
    },
  },
  timing: {
    lesson: {
      uz: "Dars 7: E'tirozlarning 5 turi va javob berish",
      ru: 'Урок 7: 5 типов возражений и как на них отвечать',
    },
    detail: {
      uz: "Price, Timing, Authority, Need, Trust. Har bir e'tiroz turiga mos javob berishni o'rganasiz.",
      ru: 'Price, Timing, Authority, Need, Trust. Вы научитесь давать правильный ответ на каждый тип возражения.',
    },
  },
  expertise: {
    lesson: {
      uz: "Dars 12: Vizual prezentatsiya — ko'rgan eslab qoladi",
      ru: 'Урок 12: Визуальная презентация — увиденное запоминается',
    },
    detail: {
      uz: '1 slide = 1 fikr. Steve Jobs Storytelling, Social Proof texnikalari.',
      ru: '1 слайд = 1 мысль. Техники Steve Jobs Storytelling и Social Proof.',
    },
  },
};

// CTA button text per ending
export const ctaButtonText: Record<ConclusionEnding, LT> = {
  grandmaster: {
    uz: "Ro'yxatdan o'tish",
    ru: 'Записаться',
  },
  success: {
    uz: 'Bepul konsultatsiya olish',
    ru: 'Получить бесплатную консультацию',
  },
  partial: {
    uz: "Ko'nikmalarimni kuchaytirishni xohlayman",
    ru: 'Хочу усилить навыки',
  },
  failure: {
    uz: 'Dastur haqida batafsil bilish',
    ru: 'Узнать подробнее о программе',
  },
};

export const dismissOptions = {
  saveResults: {
    uz: 'Natijalarimni saqlash',
    ru: 'Сохранить мои результаты',
  } as LT,
  later: {
    uz: 'Keyinroq',
    ru: 'Позже',
  } as LT,
};

// School tagline (from target.product.heading)
export const schoolTagline: LT = {
  uz: "Sales Up — sotish sizning kasbingizga aylanadigan maktab",
  ru: 'Sales Up — школа, где продажи становятся вашей профессией',
};

// Program summary (from target.program.*)
export const programModules: { range: string; title: LT }[] = [
  {
    range: '01–03',
    title: { ru: 'Психология покупателя и фундамент', uz: 'Xaridor psixologiyasi va asos' },
  },
  {
    range: '04–08',
    title: { ru: 'Работа с возражениями и скрипты', uz: "E'tirozlar bilan ishlash va skriptlar" },
  },
  {
    range: '09–12',
    title: { ru: 'Техники закрытия сделок', uz: 'Bitimlarni yopish texnikalari' },
  },
  {
    range: '13–15',
    title: { ru: 'Поиск работы и интервью', uz: 'Ish qidirish va suhbatdan o\'tish' },
  },
];

// Personalized recommendation label
export const recommendationLabel: LT = {
  uz: "Sizga tavsiya — aynan shu darsda o'rganasiz:",
  ru: 'Наша рекомендация — именно этот урок для вас:',
};
