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
      uz: 'Grandmaster Darajasi',
      ru: 'Уровень Grandmaster',
    },
    body: {
      uz: "Bir kunning o‘zida ikki xil mijozga duch kelding: korporativ VIP va oddiy ko‘rinishdagi oila boshlig‘i. Har biriga alohida yaqinlashding: Abdullayevga - vaqtni tejash va tayyorgarlikni ko‘rsatish orqali; Sardorga - shoshilmasdan, avval eshitib, keyin taklif qilish orqali.\n\nAynan mana shu haqiqiy sotuvchining darajasi: hammaga bir xil formula emas, balki har bir mijozga o‘z yo‘lini topa olish qobiliyati.",
      ru: 'В один день — два очень разных клиента: корпоративный VIP и на вид обычный глава семьи. Вы подошли к каждому отдельно: с Абдуллаевым — сжимая время и показывая подготовку; с Сардором — не спеша, сначала услышать, потом предложить.\n\nВот это и есть уровень настоящего продавца: не одна формула на всех, а умение найти свой путь к каждому клиенту.',
    },
    insight: {
      uz: "Siz bitta andozaga emas, balki mijozga moslashishni o‘rgandingiz. Bu sotuvchi faoliyatidagi eng muhim ko‘nikmadir.",
      ru: 'Вы научились подстраиваться не под один шаблон, а под клиента. Это — самый важный навык в карьере продавца.',
    },
  },

  success: {
    title: {
      uz: 'Yaxshi kun bo‘ldi. Ikkala mijoz ham ishlayapti.',
      ru: 'Хороший день. Оба клиента сработали',
    },
    body: {
      uz: 'Abdullayev bilan suhbat qisqa va aniq bo‘ldi, Sardor bilan esa sezgi kuchingizga tayandingiz. Ikkala holatda ham asosiy ishni bajardingiz, ammo har birida kichik "vau" yetishmadi - bitimni esda qolarli tajribaga aylantiradigan lahza.\n\nDarajasi yomon emas, ammo tizim hali yo‘q. Bugun erishilgan natija ertaga takrorlanmasligi mumkin.',
      ru: 'С Абдуллаевым разговор получился коротким и по делу, а с Сардором вы нашли дорогу на чутье. В обоих случаях вы сделали главное, но в каждом не хватило маленького «вау» — того самого момента, который превращает сделку в запомнившийся опыт.\n\nУровень неплохой, но системы ещё нет. То, что получилось сегодня, завтра может и не повториться.',
    },
    insight: {
      uz: 'Sezgi - bu boshlanish nuqtasi. Haqiqiy o‘sish sezgi tizimga aylangan joyda boshlanadi.',
      ru: 'Чутьё — это старт. Настоящий рост начинается там, где чутьё становится системой.',
    },
  },

  partial: {
    title: {
      uz: 'Imkoniyatlar mavjud, ammo ulardan to‘liq foydalanilmayapti',
      ru: 'Потенциал есть, но не раскрыт',
    },
    body: {
      uz: "Bugungi kun siz uchun og‘ir kechdi: bir mijozga shoshildingiz, boshqasiga esa kechikdingiz. Siz birinchi marta VIP va oddiy mijozga turlicha yondashish kerakligini aniq his qildingiz - ammo bu tushuncha hali ko‘nikmaga aylanmadi.\n\nEhtimol, bitta-ikkita muhim savolga aniq javob tayyorlamagandirsiz. Bu esa ish jarayonida darhol seziladi.",
      ru: 'Сегодняшний день был для вас трудным: с одним клиентом вы поспешили, с другим — опоздали. Вы впервые ясно почувствовали, насколько по-разному нужно подходить к VIP и к обычному клиенту — но это понимание ещё не стало навыком.\n\nВозможно, на один-два ключевых вопроса вы не заготовили точного ответа. И в работе это моментально видно.',
    },
    insight: {
      uz: "Har bir mijoz o‘z tilida so‘zlashadi. Sotuvchining vazifasi - bu tilga tezda o‘tishni o‘rganish.",
      ru: 'Каждый клиент говорит на своём языке. Работа продавца — быстро учиться переключаться на этот язык.',
    },
  },

  failure: {
    title: {
      uz: "Ikkala mijoz ham ketishdi",
      ru: 'Оба клиента ушли',
    },
    body: {
      uz: "Abdullayev o‘z vaqtini o‘zi bilan olib ketdi, Sardor esa jim ketib qoldi. VIP-mijozga \"zarur suhbat\"siz chiqdinglar, oddiy mijozni esa tashqi ko‘rinishiga qarab baholadingiz yoki majburlashga urindingiz.\n\nIkkala xato ham sotuvchi odamlar o'rtasidagi farqni ko'rmasligidan kelib chiqadi. Aynan shu farq sotishning asosidir.",
      ru: 'Абдуллаев унёс своё время с собой, а Сардор ушёл молча. К VIP-клиенту вы вышли без «нужного разговора», а обычного клиента либо оценили по внешнему виду, либо пытались продавить.\n\nОбе ошибки — от того, что продавец не видит разницы между людьми. А именно эта разница — фундамент продаж.',
    },
    insight: {
      uz: "Bu xatolar - boshlang‘ich sotuvchining belgisi. Ular tizimli tahlil amaliyoti mavjud bo‘lgan joyda yo‘qoladi. Birinchi qadamni allaqachon tashladingiz: sinab ko‘rdingiz.",
      ru: 'Эти ошибки — признак начинающего продавца. Они уходят там, где есть системная практика с разборами. Первый шаг вы уже сделали: попробовали.',
    },
  },
};
