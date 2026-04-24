// All Uzbek strings used by the funnel UI.
// Keep plain object, no i18n hook — the funnel is Uzbek-only.
export const copy = {
  landing: {
    eyebrow: 'Sotuv maktabi',
    heading: '4 ta bepul dars — va sotuv simulyatori',
    subheading:
      "Har bir darsdan keyin — kichik topshiriq. Barchasini tamomlasangiz — o'yin ko'rinishidagi simulyator sizniki.",
    bullets: [
      '4 ta qisqa video dars',
      'Har darsga 1 ta savol',
      'Yakunda — sotuv simulyatori',
    ],
    playHint: "Birinchi darsni ko'rish",
  },
  gate: {
    title: "Darsni ko'rish uchun ma'lumotlaringizni qoldiring",
    nameLabel: 'Ismingiz',
    namePlaceholder: 'Ismingizni kiriting',
    phoneLabel: 'Telefon raqamingiz',
    submit: "Darslikni ko'rish",
    submitting: 'Yuborilmoqda...',
    teaser: {
      heading: 'Barcha darslarni tamomlasangiz',
      body: "Sotuv simulyatori — interaktiv o'yin — sizga sovg'a sifatida beriladi.",
    },
    errorGeneric: "Xatolik yuz berdi. Qayta urinib ko'ring.",
    errorName: "Ismingizni to'liq kiriting",
    errorPhone: "Telefon raqamini to'g'ri kiriting",
    close: 'Yopish',
  },
  lesson: {
    stepCaption: (n: number, total: number) => `Dars ${n} / ${total}`,
    nextCta: "Keyingi darsga o'tish",
    loadingVideo: 'Video yuklanmoqda...',
  },
  quiz: {
    title: "Keyingi darsga o'tish uchun to'g'ri javobni tanlang",
    submit: 'Javobni yuborish',
    submitting: 'Tekshirilmoqda...',
    wrong: "Qayta urinib ko'ring",
    back: 'Orqaga',
  },
  stepper: {
    lockedAria: 'Dars hali ochilmagan',
    doneAria: 'Dars tamomlangan',
    currentAria: 'Joriy dars',
  },
} as const;
