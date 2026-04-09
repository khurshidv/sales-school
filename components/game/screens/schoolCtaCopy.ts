export type SchoolCtaEnding = 'grandmaster' | 'success' | 'partial' | 'failure';

type LocalizedText = {
  ru: string;
  uz: string;
};

type SchoolCtaCopy = {
  headlines: Record<SchoolCtaEnding, LocalizedText>;
  ctaText: Record<SchoolCtaEnding, LocalizedText>;
  schoolInfo: {
    tagline: LocalizedText;
    features: LocalizedText;
    results: LocalizedText;
  };
  dismissText: LocalizedText;
};

export const schoolCtaCopy = {
  headlines: {
    grandmaster: {
      ru: 'У вас есть база. Следующий шаг — превратить это в стабильный результат.',
      uz: "Sizda baza bor. Keyingi qadam — buni barqaror natijaga aylantirish.",
    },
    success: {
      ru: 'Направление вы поймали. Теперь это нужно превратить в систему.',
      uz: "Yo'nalishni topdingiz. Endi buni tizimga aylantirish kerak.",
    },
    partial: {
      ru: 'Потенциал есть. Чтобы раскрыть его, нужны практика и правильное направление.',
      uz: "Salohiyat bor. Uni ochish uchun amaliyot va to'g'ri yo'nalish kerak.",
    },
    failure: {
      ru: 'Было тяжело. Это нормально. Главное — правильно стартовать дальше.',
      uz: "Qiyin bo'ldi. Bu normal. Muhimi, keyingi bosqichni to'g'ri boshlash.",
    },
  },
  ctaText: {
    grandmaster: {
      ru: 'Хочу получить консультацию по SalesUp',
      uz: "SalesUp'da konsultatsiya olishni xohlayman",
    },
    success: {
      ru: 'Хочу подробнее узнать о программе SalesUp',
      uz: 'SalesUp dasturi haqida batafsil bilishni xohlayman',
    },
    partial: {
      ru: 'Хочу усилить навыки через SalesUp',
      uz: "SalesUp orqali ko'nikmalarimni kuchaytirmoqchiman",
    },
    failure: {
      ru: 'Я готов начать обучение в SalesUp',
      uz: "SalesUp'da o'qishni boshlashga tayyorman",
    },
  },
  schoolInfo: {
    tagline: {
      ru: 'SalesUp — программа, которая за 3 месяца доводит навыки продаж до рабочего уровня',
      uz: "SalesUp — 3 oyda savdo ko'nikmalarini ish darajasiga olib chiqadigan dastur",
    },
    features: {
      ru: 'Личный ментор, практика и разбор ситуаций, похожих на реальные рабочие кейсы',
      uz: "Shaxsiy mentor, amaliyot va real ish holatlariga o'xshash vaziyatlarni tahlil qilish",
    },
    results: {
      ru: 'Выпускники быстрее растут в доходе за счёт системы, практики и обратной связи',
      uz: 'Bitiruvchilar tizim, amaliyot va fikr-mulohaza hisobiga daromadni tezroq oshiradi',
    },
  },
  dismissText: {
    ru: 'Пока не сейчас',
    uz: "Hozircha yo'q",
  },
} satisfies SchoolCtaCopy;
