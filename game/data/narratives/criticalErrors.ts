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
      uz: 'Ikkinchisini eshitmadim',
      ru: 'Не услышали второго',
    },
    insight: {
      uz: 'Er-xotin birgalikda qaror qabul qiladi. Biriga murojaat qilganingda, ikkinchisida "meni eshitmadinglar" degan taassurot qoladi - uyda esa aynan u mashinaga "yo‘q" deydi.',
      ru: 'В паре решение принимают оба. Когда вы обратились к одному, у второго остался осадок «меня не услышали» — и дома именно он скажет машине «нет».',
    },
  },

  ce_weak_compromise: {
    level: 'soft',
    title: {
      uz: 'Murosasiz-kechiktirilgan muammo',
      ru: 'Не компромисс — отложенная проблема',
    },
    insight: {
      uz: '"Hozir sotib oling, keyin almashtirasiz" - bu yechim emas, kelajakdagi ikkinchi muammodir. Er-xotin buni darhol payqab, qaror qabul qilmasdan, o‘ylab ko‘rishga ketishdi.',
      ru: '«Сейчас купите, потом обменяете» — это не решение, а вторая проблема в будущем. Пара это почувствовала сразу и ушла думать, не приняв решения.',
    },
  },

  ce_skipped_test_drive: {
    level: 'hard',
    title: {
      uz: 'Bitim test-drayvsiz amalga oshmaydi',
      ru: 'Без тест-драйва сделки не бывает',
    },
    insight: {
      uz: 'Sotuvda avtomobil sinov drayveri rasmiyatchilik emas, balki mijozning o\'ziga "bu mening mashinam"degan paytidir. Uni o\'tkazib yuborganingizdan so\'ng, siz ushbu daqiqani bitimdan olib qo\'ydingiz.',
      ru: 'В продаже авто тест-драйв — не формальность, а момент, когда клиент сам себе говорит «это моя машина». Пропустив его, вы отняли у сделки именно этот момент.',
    },
  },

  // ─── Day 2 ────────────────────────────────────────────────

  ce_wasted_her_time: {
    level: 'soft',
    title: {
      uz: "Tayyorlangan mijoz - umumiy so'zlar",
      ru: 'Подготовленному клиенту — общие слова',
    },
    insight: {
      uz: 'Kamola allaqachon Malibu’ni o‘rganib, uni K5 bilan solishtirib ko‘rgan ekan. Sen unga o‘zi bilgan narsalarni aytib bera boshlading - u esa "vaqtimni behuda olyapsizlar" deb o‘yladi.',
      ru: 'Камола уже изучила Malibu и сравнила с K5. Вы начали пересказывать ей то, что она и так знала — и она подумала «вы тратите моё время».',
    },
  },

  ce_dodged_price: {
    level: 'soft',
    title: {
      uz: 'Narx masalasidan uzoqlashdi',
      ru: 'Ушли от вопроса о цене',
    },
    insight: {
      uz: 'Mijoz to\'g\'ridan — to\'g\'ri savol berdi - "nima uchun qo\'shimcha to\'lov?». To\'g\'ridan-to\'g\'ri javob berish o\'rniga, ular chegirmaga yoki "keyinroq"ketishdi. Tayyorlangan mijoz buni darhol o\'qiydi-va ishonch pasayadi.',
      ru: 'Клиент задал прямой вопрос — «за что доплата?». Вместо прямого ответа ушли в скидку или «позже». Подготовленный клиент это считывает мгновенно — и доверие падает.',
    },
  },

  pressure_close: {
    level: 'soft',
    title: {
      uz: 'Yopish bosimi',
      ru: 'Давление в закрытии',
    },
    insight: {
      uz: '"Bugun qaror qabul qilsangiz, chegirma bo‘ladi" - bu taklif emas, bosimdir. Mijoz manipulyatsiyani sezishi bilan bitim barbod bo‘ladi.',
      ru: '«Решите сегодня — будет скидка» — это давление, а не предложение. Как только клиент чувствует манипуляцию, сделка испаряется.',
    },
  },

  // ─── Day 3 ────────────────────────────────────────────────

  ce_shallow_discovery: {
    level: 'soft',
    title: {
      uz: 'Byudjet savol emas',
      ru: 'Бюджет — это не вопрос',
    },
    insight: {
      uz: 'Birinchi savol "byudjetingiz qancha?" emas. Avval oila, yo‘nalishlar, ehtiyojlar - shundan keyingina pul haqida so‘z boradi. Aks holda mijoz o‘zini faqat hamyon sifatida ko‘rayotganini his qiladi.',
      ru: 'Первый вопрос не «какой у вас бюджет?». Сначала семья, маршруты, потребности — и только потом деньги. Иначе клиент чувствует, что его видят только как кошелёк.',
    },
  },

  ce_premature_pitch: {
    level: 'soft',
    title: {
      uz: "Eshitmasdan taklif qilindi",
      ru: 'Предложили, не услышав',
    },
    insight: {
      uz: '"Oila uchun - Equinox yoki Tracker" ehtiyojlarni aniqlamasdan - bu taxmin. Mijoz buni sezadi va yopiladi.',
      ru: '«Для семьи — Equinox или Tracker» без выяснения потребностей — это догадка. Клиент это чувствует и закрывается.',
    },
  },

  judged_by_appearance: {
    level: 'soft',
    title: {
      uz: "Mijoz tashqi ko'rinishi bo'yicha baholandi",
      ru: 'Оценили клиента по внешнему виду',
    },
    insight: {
      uz: '- "Kobaltni ko‘ryapsanmi?" - oddiy kiyingan bo‘lsa, arzonroq bo‘ladi-da. Bu noto‘g‘ri qarash. Mijoz aynan undan uzoqlashadi.',
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
