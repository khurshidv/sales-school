"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "uz" | "ru";

const translations = {
  /* ══════════════════════════ HERO ══════════════════════════ */
  "hero.badge": {
    ru: "🎙 БЕСПЛАТНЫЙ ВЕБИНАР",
    uz: "🎙 BEPUL VEBINAR",
  },
  "hero.heading": {
    ru: "Узнайте, как с нуля стать менеджером по продажам и за 30 дней найти работу с зарплатой $800+",
    uz: "Qanday qilib 0 dan sotuv menejerlikni o'rganib 30 kunda $800+ oylik oladigan ishga kirish mumkinligini bilib oling",
  },
  "hero.subheading": {
    ru: "Пошаговый план входа в профессию продаж: где искать первую работу, как пройти собеседование и сколько можно заработать в первый месяц.",
    uz: "Sotuvchilik kasbiga kirish bo'yicha bosqichma-bosqich reja: birinchi ishni qayerdan topish, suhbatdan qanday o'tish va birinchi oyda qancha ishlash mumkin.",
  },
  "hero.bullet1": {
    ru: "Узнаете, где найти первую работу в продажах",
    uz: "Birinchi ishni qayerdan topish kerakligini bilib olasiz",
  },
  "hero.bullet2": {
    ru: "Научитесь успешно проходить собеседования",
    uz: "Suhbatdan qanday muvaffaqiyatli o'tishni o'rganasiz",
  },
  "hero.bullet3": {
    ru: "Увидите, сколько можно заработать в первый месяц",
    uz: "Birinchi oyda qancha ishlash mumkinligini ko'rasiz",
  },
  "hero.registered": {
    ru: "участников уже зарегистрировались",
    uz: "ishtirokchi allaqachon ro'yxatdan o'tdi",
  },
  "hero.cta": {
    ru: "Записаться на вебинар",
    uz: "Vebinarga yozilish",
  },
  "hero.free": {
    ru: "Бесплатно",
    uz: "Bepul",
  },
  "hero.bonuses_tg": {
    ru: "3 бонуса в Telegram",
    uz: "Telegramda 3 ta bonus",
  },
  "hero.no_strings": {
    ru: "Без обязательств",
    uz: "Majburiyatsiz",
  },
  "hero.badge_income": {
    ru: "$800/мес",
    uz: "$800/oy",
  },
  "hero.badge_income_label": {
    ru: "Стартовый доход",
    uz: "Boshlang'ich daromad",
  },
  "hero.badge_days": {
    ru: "30 дней",
    uz: "30 kun",
  },
  "hero.badge_days_label": {
    ru: "Срок обучения",
    uz: "O'qish muddati",
  },
  "hero.badge_noexp": {
    ru: "БЕЗ ОПЫТА",
    uz: "TAJRIBASIZ",
  },
  "hero.badge_noexp_label": {
    ru: "Для новичков",
    uz: "Yangi boshlovchilar uchun",
  },
  "hero.step1": { ru: "Регистрация", uz: "Ro'yxatdan o'tish" },
  "hero.step2": { ru: "Вход в Telegram", uz: "Telegramga kirish" },
  "hero.step3": { ru: "3 Бонуса Сразу", uz: "3 ta bonus darhol olish" },
  "hero.step4": { ru: "Участвовать в вебинаре", uz: "Vebinarda ishtirok etish" },

  /* ══════════════════════════ VALUE SECTION ══════════════════════════ */
  "value.before_after_heading": {
    ru: "До Pro",
    uz: "Progacha",
  },
  "value.before_after_desc": {
    ru: "Разберем реальный путь от новичка до профессионала",
    uz: "bo'lgan real yo'lni ko'rib chiqamiz",
  },
  "value.bonuses_heading": {
    ru: "Зарегистрируйтесь и узнайте, какие **бонусы** вас ждут",
    uz: "Ro'yxatdan o'tsangiz sizni qanday **bonuslar** kutmoqda",
  },
  "value.speakers_heading": {
    ru: "Ваши наставники",
    uz: "Sizning mentorlaringiz",
  },
  "value.faq_heading": {
    ru: "Частые вопросы",
    uz: "Ko'p so'raladigan savollar",
  },

  /* Bonus 1 */
  "bonus.1.badge": { ru: "PDF Гайд", uz: "PDF Qo'llanma" },
  "bonus.1.title": {
    ru: "Checklist: 5 навыков, которые ищут работодатели",
    uz: "Checklist: Ish beruvchilar izlayotgan 5 ta ko'nikma",
  },
  "bonus.1.desc": {
    ru: "Проверьте себя перед первым звонком в HR.",
    uz: "HR ga birinchi qo'ng'iroqdan oldin o'zingizni tekshiring.",
  },
  /* Bonus 2 */
  "bonus.2.badge": { ru: "Видео-урок", uz: "Video dars" },
  "bonus.2.title": {
    ru: 'Отработка возражения "Я подумаю"',
    uz: '"O\'ylab ko\'raman" e\'tirozini bartaraf etish',
  },
  "bonus.2.desc": {
    ru: "3 скрипта, которые закрывают сделку моментально.",
    uz: "Bitimni bir zumda yopuvchi 3 ta skript.",
  },
  /* Bonus 3 */
  "bonus.3.badge": { ru: "Template", uz: "Shablon" },
  "bonus.3.title": {
    ru: 'Шаблон резюме "Продажник на миллион"',
    uz: '"10mln+ sotuvchi" rezyume shabloni',
  },
  "bonus.3.desc": {
    ru: "Выделитесь среди сотен кандидатов за 2 минуты.",
    uz: "2 daqiqada yuzlab nomzodlar orasidan ajralib chiqing.",
  },

  /* Bonus ticket */
  "bonus.available": { ru: "Получить бонус", uz: "Bonusni olish" },

  /* Office block */
  "office.heading": {
    ru: "Мы работаем с компаниями, которые дают возможность выйти на доход 10 млн+ сум в месяц",
    uz: "Biz 10mln+ so'm oylik daromadga chiqish imkoniyatini beradigan kompaniyalar bilan ishlaymiz",
  },
  "office.card1_title": { ru: "Современные офисы", uz: "Zamonaviy ofislar" },
  "office.card1_desc": {
    ru: "Топ-компании с комфортными рабочими пространствами, не подвалы и не гаражи.",
    uz: "Qulay ish joylari bo'lgan top-kompaniyalar, yerto'la va garajlar emas.",
  },
  "office.card2_title": { ru: "Профессиональный вид", uz: "Professional ko'rinish" },
  "office.card2_desc": {
    ru: "Деловой дресс-код, который вызывает доверие у клиентов и коллег.",
    uz: "Mijozlar va hamkasblarda ishonch uyg'otadigan ishchan kiyinish tarzi.",
  },
  "office.card3_title": { ru: "Престижные позиции", uz: "Nufuzli lavozimlar" },
  "office.card3_desc": {
    ru: "Должности в компаниях, где ценят навыки продаж и платят за результат.",
    uz: "Sotuv ko'nikmalarini qadrlaydigan va natija uchun to'laydigan kompaniyalardagi lavozimlar.",
  },

  /* Telegram block */
  "tg.heading": {
    ru: "Подпишитесь на наш Telegram-канал для ежедневных полезных материалов по продажам",
    uz: "Har kunlik sotuv bo'yicha foydali materiallarni olish uchun telegram kanalimizga qo'shiling",
  },
  "tg.desc": {
    ru: "Потому что вебинар — это только начало. В канале каждый день:",
    uz: "Chunki vebinar — bu faqat boshlanish. Kanalda har kuni:",
  },
  "tg.tips_title": { ru: "Советы по продажам", uz: "Sotuv bo'yicha maslahatlar" },
  "tg.tips_desc": {
    ru: "Практические приёмы, которые работают прямо сейчас",
    uz: "Hozir ishlaydigan amaliy usullar",
  },
  "tg.lessons_title": { ru: "Бесплатные уроки", uz: "Bepul darslar" },
  "tg.lessons_desc": {
    ru: "Мини-курсы и разборы реальных кейсов",
    uz: "Mini-kurslar va real keyslar tahlili",
  },
  "tg.materials_title": { ru: "Материалы и шаблоны", uz: "Materiallar va shablonlar" },
  "tg.materials_desc": {
    ru: "Скрипты, чек-листы, шаблоны резюме",
    uz: "Skriptlar, chek-listlar, rezyume shablonlari",
  },
  "tg.community_title": { ru: "Community", uz: "Community" },
  "tg.community_desc": {
    ru: "Общение с единомышленниками и менторами",
    uz: "Hamfikrlar va mentorlar bilan muloqot",
  },
  "tg.cta": {
    ru: "Перейти в Telegram канал",
    uz: "Telegram kanalga o'tish",
  },

  /* ══════════════════════════ ACTION ══════════════════════════ */
  "action.heading": {
    ru: "Через 3 дня у тех, кто зарегистрировался, будут эти знания. А у вас?",
    uz: "3 kundan keyin ro'yxatdan o'tganlar bu bilimga ega bo'ladi. Siz-chi?",
  },
  "action.subheading": {
    ru: "90 минут. Бесплатно. 3 материала сразу. Одна кнопка, чтобы изменить карьеру.",
    uz: "90 daqiqa. Bepul. Darhol 3 ta material. Karyerani o'zgartirish uchun bitta tugma.",
  },
  "action.cta": {
    ru: "Забронировать место + 3 бонуса",
    uz: "Joyni band qilish + 3 bonus",
  },
  "action.seats": {
    ru: "Осталось всего 42 свободных места на эфир",
    uz: "Efirda atigi 42 ta bo'sh joy qoldi",
  },

  /* ══════════════════════════ TIMER ══════════════════════════ */
  "timer.days": { ru: "Дней", uz: "Kun" },
  "timer.hours": { ru: "Часов", uz: "Soat" },
  "timer.minutes": { ru: "Минут", uz: "Daqiqa" },
  "timer.seconds": { ru: "Секунд", uz: "Soniya" },
  "timer.days_short": { ru: "д", uz: "k" },
  "timer.hours_short": { ru: "ч", uz: "s" },
  "timer.minutes_short": { ru: "м", uz: "d" },
  "timer.seconds_short": { ru: "с", uz: "sn" },
  "timer.started": { ru: "Вебинар уже начался!", uz: "Vebinar allaqachon boshlandi!" },
  "timer.before": { ru: "До вебинара:", uz: "Vebinargacha:" },

  /* ══════════════════════════ BEFORE / AFTER ══════════════════════════ */
  "ba.before1": { ru: "Непонятно, с чего начать", uz: "Nimadan boshlashni bilmaslik" },
  "ba.before2": { ru: "Страх отказов на собеседованиях", uz: "Suhbatlarda rad etilish qo'rquvi" },
  "ba.before3": { ru: "Маленький доход или его отсутствие", uz: "Kam daromad yoki umuman yo'qligi" },
  "ba.after1": { ru: "Четкий план действий 1-2-3", uz: "Aniq harakatlar rejasi 1-2-3" },
  "ba.after2": { ru: "Уверенность в своих навыках", uz: "O'z ko'nikmalariga ishonch" },
  "ba.after3": { ru: "Первая работа с окладом $800+", uz: "$800+ maoshli birinchi ish" },
  "ba.now": { ru: "Сейчас", uz: "Hozir" },
  "ba.goal": { ru: "Цель за 30 дней", uz: "30 kunlik maqsad" },
  "ba.after_label": { ru: "После вебинара", uz: "Vebinardan keyin" },

  /* ══════════════════════════ FAQ ══════════════════════════ */
  "faq.1.q": { ru: "Нужен ли опыт работы, чтобы участвовать?", uz: "Ishtirok etish uchun ish tajribasi kerakmi?" },
  "faq.1.a": {
    ru: "Нет. Вебинар специально для тех, кто начинает с нуля. Никакой подготовки не требуется.",
    uz: "Yo'q. Vebinar noldan boshlovchilar uchun mo'ljallangan. Hech qanday tayyorgarlik talab qilinmaydi.",
  },
  "faq.2.q": { ru: "Сколько времени займет вебинар?", uz: "Vebinar qancha vaqt oladi?" },
  "faq.2.a": {
    ru: "90 минут живого эфира. Всё по делу, без воды.",
    uz: "90 daqiqa jonli efir. Hammasi aniq, keraksiz gaplarsiz.",
  },
  "faq.3.q": { ru: "Будет ли запись эфира?", uz: "Efir yozib olinadimi?" },
  "faq.3.a": {
    ru: "Только живой эфир. Запись не гарантируем — приходите вживую.",
    uz: "Faqat jonli efir. Yozib olish kafolatlanmaydi — jonli keling.",
  },
  "faq.4.q": { ru: "Что будут продавать?", uz: "Nima sotiladi?" },
  "faq.4.a": {
    ru: "В конце расскажем про курс Sales School. Но вебинар полезен и без покупки — уйдёте с планом и 3 материалами.",
    uz: "Oxirida Sales School kursi haqida aytamiz. Lekin vebinar xaridsiz ham foydali — reja va 3 ta material bilan ketasiz.",
  },

  /* ══════════════════════════ FOOTER / NAV ══════════════════════════ */
  "footer.rights": { ru: "Все права защищены.", uz: "Barcha huquqlar himoyalangan." },
  "footer.privacy": { ru: "Политика конфиденциальности", uz: "Maxfiylik siyosati" },
  "footer.terms": { ru: "Условия использования", uz: "Foydalanish shartlari" },
  "footer.support": { ru: "Поддержка", uz: "Qo'llab-quvvatlash" },
  "nav.program": { ru: "Программа", uz: "Dastur" },
  "nav.speakers": { ru: "Спикеры", uz: "Spikerlar" },
  "nav.faq": { ru: "FAQ", uz: "FAQ" },
  "nav.register": { ru: "Регистрация", uz: "Ro'yxatdan o'tish" },
  "nav.grab_seat": { ru: "Забрать место", uz: "Joyni band qilish" },
  "sticky.free": { ru: "Бесплатно", uz: "Bepul" },

  /* ══════════════════════════ SPEAKERS ══════════════════════════ */
  "speaker.founder_role": {
    ru: "Founder of Sales School. 12 лет в международных продажах.",
    uz: "Sales School asoschisi. Xalqaro savdoda 12 yillik tajriba.",
  },
  "speaker.mentor_role": {
    ru: "Head of Sales Training. Обучила более 1000 новичков.",
    uz: "Sotuv treningi rahbari. 1000 dan ortiq yangi boshlovchini o'qitgan.",
  },

  /* ══════════════════════════ MOCKUPS ══════════════════════════ */
  "mockup.skill1": { ru: "Навыки переговоров", uz: "Muzokaralar ko'nikmalari" },
  "mockup.skill2": { ru: "Работа с CRM", uz: "CRM bilan ishlash" },
  "mockup.skill3": { ru: "Холодные звонки", uz: "Sovuq qo'ng'iroqlar" },
  "mockup.skill4": { ru: "Презентация продукта", uz: "Mahsulot taqdimoti" },
  "mockup.skill5": { ru: "Закрытие сделки", uz: "Bitimni yopish" },

  /* ══════════════════════════ MONTHS ══════════════════════════ */
  "month.1": { ru: "января", uz: "yanvar" },
  "month.2": { ru: "февраля", uz: "fevral" },
  "month.3": { ru: "марта", uz: "mart" },
  "month.4": { ru: "апреля", uz: "aprel" },
  "month.5": { ru: "мая", uz: "may" },
  "month.6": { ru: "июня", uz: "iyun" },
  "month.7": { ru: "июля", uz: "iyul" },
  "month.8": { ru: "августа", uz: "avgust" },
  "month.9": { ru: "сентября", uz: "sentabr" },
  "month.10": { ru: "октября", uz: "oktabr" },
  "month.11": { ru: "ноября", uz: "noyabr" },
  "month.12": { ru: "декабря", uz: "dekabr" },
  "month_short.1": { ru: "ЯНВ", uz: "YAN" },
  "month_short.2": { ru: "ФЕВ", uz: "FEV" },
  "month_short.3": { ru: "МАР", uz: "MAR" },
  "month_short.4": { ru: "АПР", uz: "APR" },
  "month_short.5": { ru: "МАЙ", uz: "MAY" },
  "month_short.6": { ru: "ИЮН", uz: "IYN" },
  "month_short.7": { ru: "ИЮЛ", uz: "IYL" },
  "month_short.8": { ru: "АВГ", uz: "AVG" },
  "month_short.9": { ru: "СЕН", uz: "SEN" },
  "month_short.10": { ru: "ОКТ", uz: "OKT" },
  "month_short.11": { ru: "НОЯ", uz: "NOY" },
  "month_short.12": { ru: "ДЕК", uz: "DEK" },

  /* ══════════════════════════ MODAL ══════════════════════════ */
  "modal.heading": {
    ru: "Зарегистрируйтесь на вебинар",
    uz: "Vebinarga ro'yxatdan o'ting",
  },
  "modal.name": { ru: "Ваше имя", uz: "Ismingiz" },
  "modal.phone": { ru: "Номер телефона", uz: "Telefon raqamingiz" },
  "modal.subtitle": {
    ru: "Бесплатно · 90 минут · 3 бонуса",
    uz: "Bepul · 90 daqiqa · 3 ta bonus",
  },
  "modal.submit": { ru: "Записаться бесплатно", uz: "Bepul ro'yxatdan o'tish" },
  "modal.privacy": {
    ru: "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности",
    uz: "Tugmani bosish orqali maxfiylik siyosatiga rozilik bildirasiz",
  },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[key]?.[locale] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
