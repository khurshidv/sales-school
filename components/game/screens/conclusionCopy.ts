// ============================================================
// Conclusion Flow Copy — localized text for the post-game
// conclusion sequence: mentor debrief, enhanced final results,
// and the pitch screen (SchoolPitch, reuses /target blocks).
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

// ── SchoolPitch (game-contextual copy) ──────────────────────
// Adapts /target page blocks for the post-simulation pitch.
// Strong claims (benefits, cases, program, stats)
// are rendered 1:1 via the existing /target components.
// Only the hero banner + final CTA copy are game-contextual.

export const pitchCopy = {
  heroEyebrow: {
    uz: 'Simulyatsiya tugadi',
    ru: 'Симуляция завершена',
  } as LT,
  heroHeading: {
    uz: 'Siz qila olasiz. Endi — buni kasbga aylantirish vaqti.',
    ru: 'Вы справились. Теперь — время сделать это профессией.',
  } as LT,
  heroSub: {
    uz: 'Simulyatsiya salohiyatingizni ko\'rsatdi. SalesUp sizga tizim beradi — va real daromad.',
    ru: 'Симуляция показала ваш потенциал. SalesUp даст систему — и реальный доход.',
  } as LT,
  heroCta: {
    uz: 'Bepul konsultatsiya olish',
    ru: 'Получить бесплатную консультацию',
  } as LT,
  finalHeading: {
    uz: "O'yinni tugatdingiz. Endi haqiqiy natija uchun bir qadam qoldi.",
    ru: 'Вы прошли игру. До реального результата — один шаг.',
  } as LT,
  finalSub: {
    uz: "Biz bilan Telegramda bog'laning — keyingi oqimda joy band qilamiz va savollaringizga javob beramiz.",
    ru: 'Свяжитесь с нами в Telegram — забронируем место в потоке и ответим на вопросы.',
  } as LT,
  finalCta: {
    uz: 'Bepul konsultatsiya olish',
    ru: 'Получить бесплатную консультацию',
  } as LT,
  dismiss: {
    uz: 'Keyinroq',
    ru: 'Позже',
  } as LT,
  rotateHeading: {
    uz: 'Telefoningizni vertikal holatga buring',
    ru: 'Поверните телефон вертикально',
  } as LT,
  rotateSub: {
    uz: "Bu sahifa vertikal ko'rinishda qulayroq",
    ru: 'Эту страницу удобнее смотреть вертикально',
  } as LT,
};

export const TELEGRAM_URL = 'https://t.me/salesup_uz';
