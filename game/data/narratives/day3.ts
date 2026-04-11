// ============================================================
// Day 3 Narratives — тексты для экрана DaySummary.
//
// День 3 — двойной: Абдуллаев (VIP fleet) + Сардор (тайный покупатель).
// Финальный исход определяется обоими. Текст говорит о том, как
// игрок справился с этими двумя очень разными типами клиентов.
//
// Тон — как в day1/day2: честно, с обучающим выводом.
// ============================================================

import type { DayOutcome, LocalizedText } from '@/game/engine/types';

export interface DayNarrative {
  title: LocalizedText;
  body: LocalizedText;
  insight: LocalizedText;
}

export const day3Narratives: Record<DayOutcome, DayNarrative> = {
  hidden_ending: {
    title: {
      uz: 'Grandmaster darajasi',
      ru: 'Уровень Grandmaster',
    },
    body: {
      uz: "Bir kunda ikki juda boshqa mijoz — korporativ VIP va oddiy ko'ringan oila boshlig'i. Siz ikkalasiga ham alohida yondashdingiz: Abdullaev bilan vaqtni qisqartirib, tayyorgarlikni ko'rsatib; Sardor bilan — shoshmasdan, avval eshitib, keyin taklif qilib.\n\nAynan shu — haqiqiy sotuvchining daraja: bir usul bilan hammaga sotish emas, har bir mijozda uning yo'lini topish.",
      ru: 'В один день — два очень разных клиента: корпоративный VIP и на вид обычный глава семьи. Вы подошли к каждому отдельно: с Абдуллаевым — сжимая время и показывая подготовку; с Сардором — не спеша, сначала услышать, потом предложить.\n\nВот это и есть уровень настоящего продавца: не одна формула на всех, а умение найти свой путь к каждому клиенту.',
    },
    insight: {
      uz: "Siz bir usulga emas, mijozga moslashishni o'rgandingiz. Bu — karyerangizdagi eng muhim ko'nikma.",
      ru: 'Вы научились подстраиваться не под один шаблон, а под клиента. Это — самый важный навык в карьере продавца.',
    },
  },

  success: {
    title: {
      uz: 'Yaxshi kun. Ikkalasi ham ishlagan',
      ru: 'Хороший день. Оба клиента сработали',
    },
    body: {
      uz: "Abdullaev bilan suhbat aniq va qisqa bo'ldi, Sardor bilan esa siz sezgi bilan yo'l topdingiz. Ikkalasida ham asosiy narsani qildingiz, lekin har birida kichik \"vau\" yetishmadi — o'sha lahzalar bitimni oddiy sotuvdan xotira bo'ladigan tajribaga aylantiradi.\n\nBu daraja yomon emas, lekin tizim hali tug'ilmagan. Bugun bo'lgani ertaga takrorlanmasligi mumkin.",
      ru: 'С Абдуллаевым разговор получился коротким и по делу, а с Сардором вы нашли дорогу на чутье. В обоих случаях вы сделали главное, но в каждом не хватило маленького «вау» — того самого момента, который превращает сделку в запомнившийся опыт.\n\nУровень неплохой, но системы ещё нет. То, что получилось сегодня, завтра может и не повториться.',
    },
    insight: {
      uz: 'Sezgi — bu boshlang\'ich. Haqiqiy o\'sish — sezgini tizimga aylantirishdan boshlanadi.',
      ru: 'Чутьё — это старт. Настоящий рост начинается там, где чутьё становится системой.',
    },
  },

  partial: {
    title: {
      uz: 'Potensial bor, lekin hali ochilmagan',
      ru: 'Потенциал есть, но не раскрыт',
    },
    body: {
      uz: "Bugungi kun siz uchun qiyin edi: bir mijozda siz ortiqcha shoshildingiz, ikkinchisida — kechikdingiz. VIP va oddiy mijozlarga yondashuvlar bir-biridan juda farq qilishini bugun birinchi marta aniq his qildingiz — lekin bu tushuncha hali ko'nikmaga aylanmagan.\n\nEhtimol, bir-ikkita muhim savolga siz aniq javob tayyorlab olmagandingiz. Va ishda bu darhol bilinadi.",
      ru: 'Сегодняшний день был для вас трудным: с одним клиентом вы поспешили, с другим — опоздали. Вы впервые ясно почувствовали, насколько по-разному нужно подходить к VIP и к обычному клиенту — но это понимание ещё не стало навыком.\n\nВозможно, на один-два ключевых вопроса вы не заготовили точного ответа. И в работе это моментально видно.',
    },
    insight: {
      uz: "Har bir mijoz o'z tilida so'zlaydi. Sotuvchining ishi — shu tilga o'tishni tez o'rganish.",
      ru: 'Каждый клиент говорит на своём языке. Работа продавца — быстро учиться переключаться на этот язык.',
    },
  },

  failure: {
    title: {
      uz: "Ikkalasi ham ketib qoldi",
      ru: 'Оба клиента ушли',
    },
    body: {
      uz: "Abdullaev vaqtini olib ketdi, Sardor esa hech nima demay chiqib ketdi. Siz hali VIP-mijozga \"kerakli gap\"ni tayyor kelmadingiz, oddiy mijozni esa tashqi ko'rinishiga qarab baholadingiz yoki bosim qildingiz.\n\nHar ikkala xato ham oddiy odamlarning farqini sezmagan sotuvchiga xosdir. Lekin shu farq — sotuvning asosida turadi.",
      ru: 'Абдуллаев унёс своё время с собой, а Сардор ушёл молча. К VIP-клиенту вы вышли без «нужного разговора», а обычного клиента либо оценили по внешнему виду, либо пытались продавить.\n\nОбе ошибки — от того, что продавец не видит разницы между людьми. А именно эта разница — фундамент продаж.',
    },
    insight: {
      uz: "Bu xatolar — boshlang'ich sotuvchining belgisi. Ular yo'qoladigan joy — tizimli mashq qiladigan jamoa. Siz allaqachon birinchi qadamni qo'ydingiz: sinab ko'rdingiz.",
      ru: 'Эти ошибки — признак начинающего продавца. Они уходят там, где есть системная практика с разборами. Первый шаг вы уже сделали: попробовали.',
    },
  },
};
