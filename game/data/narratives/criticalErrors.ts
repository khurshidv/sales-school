// ============================================================
// Critical Error Insights — диагностические подписи к флагам
// методологических ошибок игрока.
//
// Рендерятся на экране DaySummary в блоке «Что именно пошло не так».
// Если у игрока установлен один из этих флагов, на экране показывается
// соответствующая подпись — честно, но с обучающим выводом.
//
// Флаги делятся на два уровня:
//   hard — грубая ошибка, сама по себе ломает сделку (роутинг в failure)
//   soft — серьёзный промах, кап на outcome = partial
//
// Логика блокировки outcome живёт в *_check нодах сценария,
// а здесь — только тексты для UI.
// ============================================================

import type { LocalizedText } from '@/game/engine/types';

export type CriticalErrorLevel = 'hard' | 'soft';

export interface CriticalErrorInsight {
  level: CriticalErrorLevel;
  title: LocalizedText;
  insight: LocalizedText;
}

export const CRITICAL_ERROR_INSIGHTS: Record<string, CriticalErrorInsight> = {
  // ─── Day 1 ────────────────────────────────────────────────

  ce_ignored_partner: {
    level: 'hard',
    title: {
      uz: 'Ikkinchisini eshitmadingiz',
      ru: 'Не услышали второго',
    },
    insight: {
      uz: "Juftlikka sotayotganda qarorni ikkalasi birga qabul qiladi. Bittasiga murojaat qilganingizda, ikkinchisi o'zini chetda his qildi — va uyda aynan u mashinaga \"yo'q\" deydi.",
      ru: 'В паре решение принимают оба. Когда вы обратились к одному, у второго остался осадок «меня не услышали» — и дома именно он скажет машине «нет».',
    },
  },

  ce_weak_compromise: {
    level: 'soft',
    title: {
      uz: 'Murosa emas — muammoni orqaga surdingiz',
      ru: 'Не компромисс — отложенная проблема',
    },
    insight: {
      uz: '"Hozir oling, keyin almashtirasiz" — bu yechim emas, ikkinchi qiyinchilikdir. Juftlik buni darhol sezdi va qaror qabul qilmay ketdi.',
      ru: '«Сейчас купите, потом обменяете» — это не решение, а вторая проблема в будущем. Пара это почувствовала сразу и ушла думать, не приняв решения.',
    },
  },

  ce_skipped_test_drive: {
    level: 'hard',
    title: {
      uz: 'Test-drayvsiz bitim bo\'lmaydi',
      ru: 'Без тест-драйва сделки не бывает',
    },
    insight: {
      uz: 'Avtomobil sotuvda test-drayv — bu nafaqat formallik, balki mijozning "bu mening mashinam" deyishiga imkon beradigan lahza. Uni o\'tkazib yuborib, siz aynan o\'sha lahzani yo\'qotdingiz.',
      ru: 'В продаже авто тест-драйв — не формальность, а момент, когда клиент сам себе говорит «это моя машина». Пропустив его, вы отняли у сделки именно этот момент.',
    },
  },

  // ─── Day 2 ────────────────────────────────────────────────

  ce_wasted_her_time: {
    level: 'soft',
    title: {
      uz: 'Tayyorlangan mijozga umumiy gap',
      ru: 'Подготовленному клиенту — общие слова',
    },
    insight: {
      uz: 'Kamola Malibu ni o\'rgangan va K5 bilan solishtirib kelgan edi. Siz unga bilganini qaytadan aytdingiz — va u "vaqtimni isrof qilayapti" deb o\'yladi.',
      ru: 'Камола уже изучила Malibu и сравнила с K5. Вы начали пересказывать ей то, что она и так знала — и она подумала «вы тратите моё время».',
    },
  },

  ce_dodged_price: {
    level: 'soft',
    title: {
      uz: 'Narx savolini chetlab o\'tdingiz',
      ru: 'Ушли от вопроса о цене',
    },
    insight: {
      uz: 'Mijoz aniq savol berdi — "farq nimaga to\'langan?". Aniq javob o\'rniga chegirma yoki "keyin aytaman" — bu ishonchni buzadi. Tayyorlangan mijoz bunga darhol reaksiya qiladi.',
      ru: 'Клиент задал прямой вопрос — «за что доплата?». Вместо прямого ответа ушли в скидку или «позже». Подготовленный клиент это считывает мгновенно — и доверие падает.',
    },
  },

  pressure_close: {
    level: 'soft',
    title: {
      uz: 'Bosim bilan yopish',
      ru: 'Давление в закрытии',
    },
    insight: {
      uz: '"Bugun qaror qilsangiz chegirma" — bu bosim, masla\'hat emas. Mijoz o\'zini manipulyatsiya qilinayotganday his qilishi bilan bitim yo\'qoladi.',
      ru: '«Решите сегодня — будет скидка» — это давление, а не предложение. Как только клиент чувствует манипуляцию, сделка испаряется.',
    },
  },

  // ─── Day 3 ────────────────────────────────────────────────

  ce_shallow_discovery: {
    level: 'soft',
    title: {
      uz: 'Byudjet — bu savol emas',
      ru: 'Бюджет — это не вопрос',
    },
    insight: {
      uz: "Birinchi savol \"byudjetingiz qancha?\" emas. Avval oila, marshrut, ehtiyoj — keyingina pul. Aks holda mijoz \"meni faqat pul deb ko'rishdi\" deb o'ylaydi.",
      ru: 'Первый вопрос не «какой у вас бюджет?». Сначала семья, маршруты, потребности — и только потом деньги. Иначе клиент чувствует, что его видят только как кошелёк.',
    },
  },

  ce_premature_pitch: {
    level: 'soft',
    title: {
      uz: "Eshitmasdan taklif qildingiz",
      ru: 'Предложили, не услышав',
    },
    insight: {
      uz: 'Ehtiyojlarni aniqlamasdan "oilaga Equinox yoki Tracker" deyish — bu taxmin. Mijoz buni darhol sezadi va yopiladi.',
      ru: '«Для семьи — Equinox или Tracker» без выяснения потребностей — это догадка. Клиент это чувствует и закрывается.',
    },
  },

  judged_by_appearance: {
    level: 'soft',
    title: {
      uz: "Mijozni tashqi ko'rinishiga qarab baholadingiz",
      ru: 'Оценили клиента по внешнему виду',
    },
    insight: {
      uz: "\"Siz Cobalt ko'ryapsizmi?\" — oddiy kiyingan odam, demak arzonroq model. Bu assumption. Mijoz aynan shundan uzoqlashadi.",
      ru: '«Cobalt смотрите?» — просто одетый значит подешевле. Это предубеждение. И клиент отстраняется именно от него.',
    },
  },
};

/**
 * Возвращает список insights для всех ce_* (и legacy) флагов,
 * которые стоят у игрока на конец дня.
 * Используется в DayNarrative.tsx.
 */
export function getCriticalErrorInsights(
  flags: Record<string, boolean> | undefined,
): CriticalErrorInsight[] {
  if (!flags) return [];
  const result: CriticalErrorInsight[] = [];
  for (const flag of Object.keys(CRITICAL_ERROR_INSIGHTS)) {
    if (flags[flag]) {
      result.push(CRITICAL_ERROR_INSIGHTS[flag]);
    }
  }
  return result;
}
