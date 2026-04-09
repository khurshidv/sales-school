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
      uz: 'SalesUp — sotuvni amaliy ish darajasiga olib chiqadigan dastur',
      ru: 'SalesUp — программа, которая переводит продажи из "чутья" в рабочую систему',
    },
    features: {
      uz: 'Mentor, amaliy mashq va real ishga yaqin vaziyatlar bilan',
      ru: 'С наставником, практикой и разбором ситуаций, близких к реальной работе',
    },
    results: {
      uz: "Tizimli o'qiganlar tezroq o'sadi va ishda o'zini barqarorroq tutadi",
      ru: 'Те, кто учатся системно, быстрее растут и увереннее чувствуют себя в реальной работе',
    },
  },
  dismissText: {
    ru: 'Пока не сейчас',
    uz: "Hozircha yo'q",
  },
} satisfies SchoolCtaCopy;
