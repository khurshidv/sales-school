// ============================================================
// Dimension metadata — единый источник локализованных лейблов и
// описаний для всех 7 игровых измерений.
//
// Используется в DaySummary и FinalResults, чтобы игроку показывать
// понятные, не-жаргонные названия + короткое объяснение навыка.
// ============================================================

import type { ScoreDimension, LocalizedText } from '@/game/engine/types';

export interface DimensionMeta {
  /** Крупное название в UI — понятное новичку, без маркетингового жаргона. */
  label: LocalizedText;
  /** Однострочное описание, что этот навык значит в реальной продаже. */
  description: LocalizedText;
}

export const DIMENSION_META: Record<ScoreDimension, DimensionMeta> = {
  empathy: {
    label: {
      uz: 'Empatiya',
      ru: 'Эмпатия',
    },
    description: {
      uz: 'Mijozning his-tuyg\'ularini payqash. Unga o\'zini tushunishgan kabi his qilgan odam bitim yopishga tayyor bo\'ladi.',
      ru: 'Умение чувствовать состояние клиента. Когда человек ощущает, что его понимают — он готов купить.',
    },
  },
  rapport: {
    label: {
      uz: 'Mijoz ishonchi',
      ru: 'Доверие клиента',
    },
    description: {
      uz: 'Mijozlar ishongan odamdan xarid qilishadi. Ishonch bo\'lmasa, har qanday narx ham qimmat tuyuladi.',
      ru: 'Клиенты покупают у тех, кому доверяют. Без доверия любая цена кажется завышенной.',
    },
  },
  timing: {
    label: {
      uz: 'Lahzani his qilish',
      ru: 'Чувство момента',
    },
    description: {
      uz: 'Qachon gapirib, qachon jim turishni bilish. Noto\'g\'ri paytda aytilgan to\'g\'ri gap ham bitimni buzadi.',
      ru: 'Понимание, когда говорить, а когда молчать. Правильное слово в неправильный момент убивает сделку.',
    },
  },
  expertise: {
    label: {
      uz: 'Mahsulot bilimi',
      ru: 'Знание продукта',
    },
    description: {
      uz: 'Mahsulotni puxta bilish — asos. Lekin bu bilimni mijozning hayotidagi foydaga aylantira olish muhim.',
      ru: 'Знание продукта — основа. Но важнее уметь превращать это знание в пользу для жизни клиента.',
    },
  },
  persuasion: {
    label: {
      uz: 'Yumshoq ishontirish',
      ru: 'Мягкое убеждение',
    },
    description: {
      uz: 'Mijozga bosim o\'tkazish emas — uni o\'zi uchun to\'g\'ri qarorga olib kelish. Bosim ostida sotilgan narsa qaytib keladi.',
      ru: 'Не давить, а подводить клиента к своему же решению. Продано под давлением — возвращается обратно.',
    },
  },
  discovery: {
    label: {
      uz: 'Mijozni tushunish',
      ru: 'Понимание клиента',
    },
    description: {
      uz: 'Mijozga aslida nima kerakligini so\'rab, eshitib bilish. Bu — "maslahatchi" bilan "sotuvchi"ning asosiy farqi.',
      ru: 'Умение расспросить и услышать, что на самом деле нужно клиенту. Главное, чем продавец отличается от консультанта.',
    },
  },
  opportunity: {
    label: {
      uz: 'Bitimni yopish',
      ru: 'Умение закрывать сделку',
    },
    description: {
      uz: 'Eng qiyin bosqich: suhbatni qarorga olib kelib, mijozga "ha" deyishiga yordam berish.',
      ru: 'Самый сложный этап: довести разговор до решения и помочь клиенту сказать «да».',
    },
  },
};

/** Удобный хелпер: получить лейбл в нужном языке. */
export function getDimensionLabel(
  dimension: ScoreDimension,
  lang: 'uz' | 'ru',
): string {
  return DIMENSION_META[dimension].label[lang];
}

/** Удобный хелпер: получить описание в нужном языке. */
export function getDimensionDescription(
  dimension: ScoreDimension,
  lang: 'uz' | 'ru',
): string {
  return DIMENSION_META[dimension].description[lang];
}
