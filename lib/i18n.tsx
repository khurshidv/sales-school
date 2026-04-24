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
    ru: "Узнайте, как с нуля стать менеджером по продажам и за 30 дней найти работу с зарплатой от 6-10 млн сум+",
    uz: "Qanday qilib 0 dan sotuv menejerlikni o'rganib 30 kunda 6-10 mln so'm+ oylik oladigan ishga kirish mumkinligini bilib oling",
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
    ru: "6-10 млн сум/мес",
    uz: "6-10 mln so'm/oy",
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
    ru: 'Шаблон резюме "Продажник от 10 млн"',
    uz: '"10 mln+ sotuvchi" rezyume shabloni',
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
  "ba.after3": { ru: "Первая работа с окладом от 10 млн сум+", uz: "10 mln so'm+ maoshli birinchi ish" },
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
    ru: "В конце расскажем про курс Sales Up. Но вебинар полезен и без покупки — уйдёте с планом и 3 материалами.",
    uz: "Oxirida Sales Up kursi haqida aytamiz. Lekin vebinar xaridsiz ham foydali — reja va 3 ta material bilan ketasiz.",
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
    ru: "Founder of Sales Up. 12 лет в международных продажах.",
    uz: "Sales Up asoschisi. Xalqaro savdoda 12 yillik tajriba.",
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

  /* ══════════════════════════ TARGET LANDING ══════════════════════════ */

  /* --- Target Hero --- */
  "target.hero.badge": {
    ru: "Для тех кто ищет работу!",
    uz: "Ish qidirib yurganlar diqqatiga!",
  },
  "target.hero.heading": {
    ru: "Нет опыта? Не проблема. Мы поможем вам найти работу в сфере продаж с зарплатой от 6-10 млн сум+",
    uz: "Tajriba yo'qmi? Muammo emas. Biz sizga sotuv sohasida oyligi 6-10 mln so'm+ dan boshlanadigan ish topishga yordam beramiz",
  },
  "target.hero.subheading": {
    ru: "Обучение + практика + реальное трудоустройство",
    uz: "O'qish + amaliyot + real ishga joylashish",
  },
  "target.hero.cta": {
    ru: "Узнать сколько вы могли бы зарабатывать",
    uz: "Daromadingizni bilib oling",
  },
  "target.hero.income_label": {
    ru: "Гарантия трудоустройства",
    uz: "Ishga joylashish kafolati",
  },
  "target.hero.income_value": {
    ru: "100%",
    uz: "100%",
  },

  /* --- Target Contrast Bar --- */
  "target.contrast.avg_label": {
    ru: "Средняя ЗП УЗ",
    uz: "O'rtacha oylik UZ",
  },
  "target.contrast.junior_label": {
    ru: "Junior Sales",
    uz: "Junior Sales",
  },
  "target.contrast.expert_label": {
    ru: "Expert Sales",
    uz: "Expert Sales",
  },
  "target.contrast.growth_title": {
    ru: "Рост дохода за первые 3 месяца",
    uz: "Birinchi 3 oyda daromad o'sishi",
  },
  "target.contrast.month1": { ru: "1 месяц", uz: "1-oy" },
  "target.contrast.month2": { ru: "2 месяц", uz: "2-oy" },
  "target.contrast.month3": { ru: "3 месяц", uz: "3-oy" },

  /* --- Target Trust Bar --- */
  "target.trust.label": {
    ru: "Наши партнеры",
    uz: "Bizning hamkorlarimiz",
  },

  /* --- Target Pain Points --- */
  "target.pain.label": {
    ru: "01. Проблема",
    uz: "01. Muammo",
  },
  "target.pain.heading": {
    ru: "Почему ты до сих пор не зарабатываешь 10 млн сум+?",
    uz: "Nega siz hali ham 10 mln so'm+ ishlamayapsiz?",
  },
  "target.pain.1": {
    ru: "Работаешь, но доход остаётся на уровне 2,5–3,5 млн сум",
    uz: "Ishlaysiz, lekin daromad 2,5–3,5 mln so'm darajasida qolmoqda",
  },
  "target.pain.2": {
    ru: "Нет навыка, который реально приносит деньги",
    uz: "Haqiqatan pul keltiradigan ko'nikma yo'q",
  },
  "target.pain.3": {
    ru: "Не берут без опыта",
    uz: "Tajribasiz ishga olmaydilar",
  },
  "target.pain.4": {
    ru: "Нет понимания, куда расти",
    uz: "Qayerga o'sish kerakligini bilmaysiz",
  },
  "target.pain.5": {
    ru: "Чувствуете, что застряли на месте, пока другие растут",
    uz: "Boshqalar o'sib ketayotganini ko'rib, joyingizda qotib qolgan deb his qilasiz",
  },
  "target.pain.quote": {
    ru: "Многие думают, что продажи — это талант. На самом деле — это **технология**, которой можно обучиться за 4 недели.",
    uz: "Ko'pchilik sotish — bu iste'dod deb o'ylaydi. Aslida — bu 4 haftada o'rganish mumkin bo'lgan **texnologiya**.",
  },

  /* --- Target Myth Reframe --- */
  "target.myth.heading": {
    ru: "Хватит верить в мифы",
    uz: "Miflarni bo'ldi qiling",
  },
  "target.myth.left_title": {
    ru: "Как вы представляли",
    uz: "Siz tasavvur qilganday",
  },
  "target.myth.left_1": {
    ru: "Бесконечные холодные звонки",
    uz: "Cheksiz sovuq qo'ng'iroqlar",
  },
  "target.myth.left_2": {
    ru: 'Нужно "впаривать" и уговаривать',
    uz: "Zo'rlab sotish va ko'ndirish kerak",
  },
  "target.myth.left_3": {
    ru: "Стресс и низкий престиж",
    uz: "Stress va past nufuz",
  },
  "target.myth.right_title": {
    ru: "Как на самом деле",
    uz: "Aslida qanday",
  },
  "target.myth.right_1": {
    ru: "Развитие коммуникации с людьми",
    uz: "Odamlar bilan muloqotni rivojlantirish",
  },
  "target.myth.right_2": {
    ru: "Высокий доход который зависит только от твоего желания заработать",
    uz: "Faqat ishlash istaging ga bog'liq yuqori daromad",
  },
  "target.myth.right_3": {
    ru: "Возможность быстрого карьерного роста",
    uz: "Tez karyera o'sishi imkoniyati",
  },

  /* --- Target Loss Aversion --- */
  "target.loss.heading": {
    ru: "Вы теряете минимум 6 млн сум каждый месяц, оставаясь на текущем месте",
    uz: "Hozirgi joyingizda qolish orqali har oyda kamida 6 mln so'm yo'qotmoqdasiz",
  },
  "target.loss.desc": {
    ru: "Каждый месяц без навыка продаж = минус 6–12 млн сум к вашему доходу. Пока вы откладываете — другие уже зарабатывают и растут в 2–3 раза быстрее.",
    uz: "Sotuv ko'nikmasiz har oy = daromadingizga minus 6–12 mln so'm. Siz kechiktirganingizda — boshqalar allaqachon 2–3 baravar tezroq ishlaydi va o'sadi.",
  },
  "target.loss.cta": {
    ru: "Рассчитать мой доход",
    uz: "Daromadimni hisoblash",
  },
  "target.loss.chart_regular": {
    ru: "Обычная работа",
    uz: "Oddiy ish",
  },
  "target.loss.chart_school": {
    ru: "Sales Up",
    uz: "Sales Up",
  },
  "target.loss.chart_year": {
    ru: "Через 1 год",
    uz: "1 yildan keyin",
  },
  "target.loss.chart_start": {
    ru: "Старт",
    uz: "Start",
  },
  "target.loss.chart_3m": {
    ru: "3 месяца",
    uz: "3 oy",
  },
  "target.loss.chart_12m": {
    ru: "12 месяцев",
    uz: "12 oy",
  },

  /* --- Target Why Sales (savdo jamoasi) --- */
  "target.why.label": {
    ru: "Почему продажи?",
    uz: "Nega sotuv?",
  },
  "target.why.heading": {
    ru: "Почему отдел продаж — самое ценное в любой компании",
    uz: "Nima uchun katta kompaniyalarda savdo jamoasi eng muhim bo'lim?",
  },
  "target.why.subheading": {
    ru: "Без продавца продукт не продаётся. Именно поэтому компании готовы платить хорошим продажникам в 3–5 раз больше рынка.",
    uz: "Sotuvchisiz mahsulot sotilmaydi. Aynan shuning uchun kompaniyalar yaxshi savdochilarga bozordan 3–5 baravar ko'p to'lashga tayyor.",
  },

  "target.why.stat1.value": { ru: "~2x", uz: "~2x" },
  "target.why.stat1.label": {
    ru: "Средний рост компании без отдела продаж",
    uz: "Savdo jamoasisiz o'rtacha o'sish",
  },
  "target.why.stat2.value": { ru: "~7x", uz: "~7x" },
  "target.why.stat2.label": {
    ru: "Рост с сильным отделом продаж",
    uz: "Kuchli savdo jamoasi bilan o'sish",
  },
  "target.why.stat3.value": { ru: "70%", uz: "70%" },
  "target.why.stat3.label": {
    ru: "Доли выручки приносят продажи",
    uz: "Daromad ulushini savdo keltiradi",
  },

  "target.why.chart.title": {
    ru: "Рост выручки компании за 5 лет (старт = 100)",
    uz: "Yillar davomida daromad o'sishi (boshlang'ich = 100)",
  },
  "target.why.chart.axis": {
    ru: "Индекс дохода",
    uz: "Daromad indeksi",
  },
  "target.why.chart.with": {
    ru: "С сильным отделом продаж",
    uz: "Savdo jamoasi bor kompaniya",
  },
  "target.why.chart.without": {
    ru: "Без отдела продаж",
    uz: "Savdo jamoasi yo'q",
  },
  "target.why.chart.year": { ru: "год", uz: "yil" },

  "target.why.reasons_title": {
    ru: "5 причин, почему сильные продавцы — золото для любой компании",
    uz: "5 ta sabab, nega kuchli savdochilar har qanday kompaniya uchun oltin",
  },
  "target.why.reason.1.title": { ru: "Приносят доход", uz: "Daromad keltiradi" },
  "target.why.reason.1.desc": {
    ru: "Продукт сам себя не продаёт. Без отдела продаж не продаётся ничего.",
    uz: "Mahsulot o'zini sotmaydi. Savdo jamoasi bo'lmasa — hech narsa sotilmaydi.",
  },
  "target.why.reason.2.title": { ru: "Открывают рынки", uz: "Bozorga kiradi" },
  "target.why.reason.2.desc": {
    ru: "Новые клиенты, регионы и отрасли — это всё работа отдела продаж.",
    uz: "Yangi mijozlar, yangi hududlar, yangi sohalar — bularni savdo jamoasi ochadi.",
  },
  "target.why.reason.3.title": { ru: "Знают клиента", uz: "Mijozni biladi" },
  "target.why.reason.3.desc": {
    ru: "Продавцы говорят с клиентами напрямую — это золото для стратегии бизнеса.",
    uz: "Savdochilar mijozlar bilan to'g'ridan-to'g'ri gaplashadi — bu strategiya uchun oltin.",
  },
  "target.why.reason.4.title": { ru: "Дают прогноз", uz: "Prognoz beradi" },
  "target.why.reason.4.desc": {
    ru: "Хорошая система продаж позволяет видеть выручку наперёд и строить план роста.",
    uz: "Yaxshi savdo tizimi har oylik daromadni oldindan ko'rish imkonini beradi.",
  },
  "target.why.reason.5.title": {
    ru: "Отстраивают от конкурентов",
    uz: "Raqibdan ajratadi",
  },
  "target.why.reason.5.desc": {
    ru: "Когда продукты одинаковые — побеждает тот, у кого сильнее отдел продаж.",
    uz: "Mahsulotlar bir xil bo'lganda — savdo jamoasining kuchi g'olibni belgilaydi.",
  },
  "target.why.quote": {
    ru: "Без отдела продаж компания не растёт. Хороший продукт + сильные продажи = рост. Одного продукта мало.",
    uz: "Savdo jamoasiz kompaniya o'smaydi. Yaxshi mahsulot + kuchli savdo = o'sish. Faqat birinchisi yetarli emas.",
  },

  /* --- Target Pricing --- */
  "target.pricing.label": { ru: "Стоимость", uz: "Narxi" },
  "target.pricing.heading": {
    ru: "Один курс — одна цена. Без скрытых доплат.",
    uz: "Bitta kurs — bitta narx. Yashirin to'lovlarsiz.",
  },
  "target.pricing.subheading": {
    ru: "Полная программа Sales Up: обучение, практика и трудоустройство в одной упаковке.",
    uz: "Sales Up to'liq dasturi: o'qish, amaliyot va ishga joylashish — bitta paketda.",
  },
  "target.pricing.card.badge": { ru: "Полный курс", uz: "To'liq kurs" },
  "target.pricing.card.title": { ru: "Sales Up Full", uz: "Sales Up Full" },
  "target.pricing.card.price": { ru: "8 000 000", uz: "8 000 000" },
  "target.pricing.card.currency": { ru: "сум", uz: "so'm" },
  "target.pricing.card.note": {
    ru: "за весь курс · доступна рассрочка",
    uz: "butun kurs uchun · bo'lib to'lash mavjud",
  },
  "target.pricing.feat.1": {
    ru: "4 недели интенсивного обучения офлайн",
    uz: "4 hafta intensiv offline o'qish",
  },
  "target.pricing.feat.2": {
    ru: "15 практических уроков и живые ролевые игры",
    uz: "15 ta amaliy dars va jonli rol o'yinlar",
  },
  "target.pricing.feat.3": {
    ru: "Скрипты, шаблоны и техники закрытия сделок",
    uz: "Skriptlar, shablonlar va bitimlarni yopish texnikalari",
  },
  "target.pricing.feat.4": {
    ru: "Работа с возражениями: «дорого», «подумаю», «нет»",
    uz: "E'tirozlar bilan ishlash: «qimmat», «o'ylab ko'raman», «yo'q»",
  },
  "target.pricing.feat.5": {
    ru: "Личный ментор и обратная связь по домашним заданиям",
    uz: "Shaxsiy mentor va uy vazifalariga teskari aloqa",
  },
  "target.pricing.feat.6": {
    ru: "Доступ в закрытое комьюнити выпускников",
    uz: "Bitiruvchilarning yopiq jamoasiga kirish",
  },
  "target.pricing.feat.7": {
    ru: "Сертификат об окончании курса",
    uz: "Kursni tugatganlik haqida sertifikat",
  },
  "target.pricing.feat.8": {
    ru: "Подготовка к собеседованию: резюме, тест-офферы, интервью",
    uz: "Suhbatga tayyorgarlik: rezyume, test offerlar, intervyu",
  },
  "target.pricing.feat.9": {
    ru: "Доступ к базе вакансий компаний-партнёров",
    uz: "Hamkor kompaniyalar vakansiya bazasiga kirish",
  },
  "target.pricing.feat.10": {
    ru: "Гарантия трудоустройства 100%",
    uz: "100% ishga joylashish kafolati",
  },
  "target.pricing.cta": {
    ru: "Записаться на курс",
    uz: "Kursga yozilish",
  },
  "target.pricing.guarantee": {
    ru: "Группы до 30 человек — места ограничены.",
    uz: "30 kishigacha guruhlar — joylar cheklangan.",
  },

  /* --- Target Cases --- */
  "target.cases.heading": {
    ru: "Как наши ученики вышли на доход 10 млн сум+",
    uz: "10 mln so'm+ daromad qiladigan o'quvchilarimiz",
  },
  "target.cases.placeholder": {
    ru: "Видео кейсы скоро будут добавлены",
    uz: "Video keyslar tez orada qo'shiladi",
  },
  "target.case.1.name": {
    ru: "Анна, 22 года",
    uz: "Anna, 22 yosh",
  },
  "target.case.1.desc": {
    ru: "До курса работала бариста. После обучения устроилась в SaaS компанию. Первый бонус — 5,5 млн сум.",
    uz: "Kursdan oldin barista bo'lgan. O'qishdan keyin SaaS kompaniyasiga ishga kirdi. Birinchi bonus — 5,5 mln so'm.",
  },
  "target.case.1.tag": { ru: "B2B Sales", uz: "B2B Sales" },
  "target.case.2.name": {
    ru: "Максим, 19 лет",
    uz: "Maksim, 19 yosh",
  },
  "target.case.2.desc": {
    ru: "Был студентом без опыта. Сейчас — Junior Account Manager. Доход от 11 млн сум.",
    uz: "Tajribasiz talaba edi. Hozir — Junior Account Manager. Daromad 11 mln so'mdan.",
  },
  "target.case.2.tag": { ru: "IT Solutions", uz: "IT Solutions" },
  "target.case.3.name": {
    ru: "Игорь, 25 лет",
    uz: "Igor, 25 yosh",
  },
  "target.case.3.desc": {
    ru: "Ушел из госсектора. Спустя 2 месяца обучения закрыл сделку на 25 млн сум комиссии.",
    uz: "Davlat sektoridan ketdi. 2 oylik o'qishdan keyin 25 mln so'm komissiya bilan bitim tuzdi.",
  },
  "target.case.3.tag": { ru: "Real Estate", uz: "Real Estate" },
  "target.cases.watch": {
    ru: "Смотреть интервью",
    uz: "Intervyuni ko'rish",
  },

  /* --- Target Product Benefits --- */
  "target.product.heading": {
    ru: "Sales Up — школа, где продажи становятся вашей профессией",
    uz: "Sales Up — sotish sizning kasbingizga aylanadigan maktab",
  },
  "target.product.desc": {
    ru: "Мы не учим «впаривать». Мы учим выстраивать долгосрочные отношения с клиентами и зарабатывать на этом легально и много.",
    uz: "Biz majburlab sotishni o'rgatmaymiz. Biz mijozlar bilan uzoq muddatli munosabatlar qurishni va bundan qonuniy ravishda ko'p ishlashni o'rgatamiz.",
  },
  "target.product.1.title": { ru: "Быстрый старт", uz: "Tez boshlash" },
  "target.product.1.desc": {
    ru: "Всего 4 недели от первого урока до первого оффера.",
    uz: "Birinchi darsdan birinchi ish taklifigacha atigi 4 hafta.",
  },
  "target.product.2.title": { ru: "Комьюнити", uz: "Jamoa" },
  "target.product.2.desc": {
    ru: "Доступ в закрытый чат с менторами и единомышленниками.",
    uz: "Mentorlar va hamfikrlar bilan yopiq chatga kirish.",
  },
  "target.product.3.title": { ru: "Трудоустройство", uz: "Ishga joylashish" },
  "target.product.3.desc": {
    ru: "Лучших учеников трудоустраиваем в компании-партнёры.",
    uz: "Yaxshi o'quvchilarimizni hamkor kompaniyalarga ishga joylashtirib qo'yamiz.",
  },
  "target.product.4.title": { ru: "100% Практика", uz: "100% Amaliyot" },
  "target.product.4.desc": {
    ru: "Минимум теории, максимум реальных переговоров.",
    uz: "Minimum nazariya, maksimum real muzokaralar.",
  },

  /* --- Target Program --- */
  "target.program.label": {
    ru: "Программа",
    uz: "Dastur",
  },
  "target.program.heading": {
    ru: "Всё, что нужно, чтобы начать зарабатывать в продажах",
    uz: "Sotuvda ishlay boshlash uchun zarur bo'lgan hamma narsa",
  },
  "target.program.lessons": {
    ru: "15 интенсивных уроков",
    uz: "15 ta intensiv dars",
  },
  "target.program.outcome.1": {
    ru: "Понимать клиента и вести к покупке",
    uz: "Mijozni tushunish va xaridga yo'naltirish",
  },
  "target.program.outcome.2": {
    ru: 'Отвечать на "дорого / подумаю" и закрывать сделки',
    uz: '"Qimmat / o\'ylab ko\'raman" ga javob berish va bitimlarni yopish',
  },
  "target.program.outcome.3": {
    ru: "Закрывать сделки и зарабатывать на этом",
    uz: "Bitimlarni yopish va buning ustida ishlash",
  },
  "target.program.outcome.4": {
    ru: "Получить работу и выйти на доход от 10 млн сум",
    uz: "Ishga kirish va 10 mln so'mdan daromadga chiqish",
  },
  "target.program.module.1.range": { ru: "01-03", uz: "01-03" },
  "target.program.module.1.title": {
    ru: "Психология покупателя и фундамент",
    uz: "Xaridor psixologiyasi va asos",
  },
  "target.program.module.2.range": { ru: "04-08", uz: "04-08" },
  "target.program.module.2.title": {
    ru: "Работа с возражениями и скрипты",
    uz: "E'tirozlar bilan ishlash va skriptlar",
  },
  "target.program.module.3.range": { ru: "09-12", uz: "09-12" },
  "target.program.module.3.title": {
    ru: "Техники закрытия сделок на миллион",
    uz: "Millionlik bitimlarni yopish texnikalari",
  },
  "target.program.module.4.range": { ru: "13-15", uz: "13-15" },
  "target.program.module.4.title": {
    ru: "Поиск работы и прохождение интервью",
    uz: "Ish qidirish va suhbatdan o'tish",
  },
  "target.program.cert.title": {
    ru: "Сертификат + трудоустройство",
    uz: "Sertifikat + ishga joylashish",
  },
  "target.program.cert.desc": {
    ru: "После финального теста вы получаете официальный сертификат и доступ к базе вакансий партнеров.",
    uz: "Yakuniy testdan keyin rasmiy sertifikat va hamkorlar vakansiyalari bazasiga kirish olasiz.",
  },

  /* --- Target For Whom --- */
  "target.whom.heading": {
    ru: "Кому подойдет этот курс?",
    uz: "Bu kurs kimga mos keladi?",
  },
  "target.whom.yes_title": {
    ru: "Идеально, если вы:",
    uz: "Ideal, agar siz:",
  },
  "target.whom.yes_1": {
    ru: "Вам 18–30 лет и вы ищете перспективный старт",
    uz: "Siz 18–30 yoshdasiz va istiqbolli boshlanish qidirmoqdasiz",
  },
  "target.whom.yes_2": {
    ru: "Хотите зарабатывать от 10 млн сум+ сразу после курса",
    uz: "Kursdan keyin darhol 10 mln so'm+ ishlashni xohlaysiz",
  },
  "target.whom.yes_3": {
    ru: "Готовы учиться и работать на результат",
    uz: "O'qishga va natijaga ishlashga tayyorsiz",
  },
  "target.whom.no_title": {
    ru: "Не тратьте время, если:",
    uz: "Vaqtingizni sarflamang, agar:",
  },
  "target.whom.no_1": {
    ru: 'Ищете "кнопку бабло" или легкие деньги без усилий',
    uz: "\"Pul tugmasi\" yoki kuchsiz oson pul izlayotgan bo'lsangiz",
  },
  "target.whom.no_2": {
    ru: "Не любите общаться с людьми и боитесь ответственности",
    uz: "Odamlar bilan muloqotni yoqtirmaysiz va javobgarlikdan qo'rqasiz",
  },
  "target.whom.no_3": {
    ru: "Считаете, что продажи — это стыдно и неблагородно",
    uz: "Sotish — uyat va nojo'ya deb hisoblaysiz",
  },

  /* --- Target Stats --- */
  "target.stats.graduates": { ru: "Выпускников", uz: "Bitiruvchilar" },
  "target.stats.years": { ru: "Лет опыта", uz: "Yillik tajriba" },
  "target.stats.partners": { ru: "Компаний-партнеров", uz: "Hamkor kompaniyalar" },

  /* --- Target Telegram/Media --- */
  "target.tg.heading": {
    ru: "Больше кейсов и инсайдов в нашем Telegram-канале",
    uz: "Ko'proq keyslar va insaydlar Telegram kanalimizda",
  },
  "target.tg.cta": {
    ru: "Перейти в Telegram",
    uz: "Telegramga o'tish",
  },
  "target.press.label": {
    ru: "О нас пишут",
    uz: "Biz haqimizda yozishadi",
  },

  /* --- Target FAQ --- */
  "target.faq.heading": { ru: "Частые вопросы", uz: "Ko'p beriladigan savollar" },
  "target.faq.1.q": { ru: "Сколько стоит обучение?", uz: "O'qish qancha turadi?" },
  "target.faq.1.a": {
    ru: "Мы подберём условия под ваше финансовое состояние. Есть рассрочка и гибкие варианты оплаты — обсудим на бесплатной консультации.",
    uz: "Biz sizning moliyaviy ahvolingizga mos sharoitlarni tanlab beramiz. Bo'lib to'lash va moslashuvchan to'lov variantlari mavjud — bepul konsultatsiyada muhokama qilamiz.",
  },
  "target.faq.2.q": { ru: "Сколько времени в день нужно уделять?", uz: "Kuniga qancha vaqt ajratish kerak?" },
  "target.faq.2.a": {
    ru: "Нужно примерно 2 часа в день.",
    uz: "Kuniga taxminan 2 soat kerak bo'ladi.",
  },
  "target.faq.3.q": { ru: "Если у меня совсем нет опыта?", uz: "Agar umuman tajribam bo'lmasa?" },
  "target.faq.3.a": {
    ru: "Курс создан для новичков. 80% наших учеников начинали с нуля.",
    uz: "Kurs yangi boshlovchilar uchun yaratilgan. O'quvchilarimizning 80% noldan boshlagan.",
  },
  "target.faq.4.q": { ru: "Какой формат занятий?", uz: "Darslar qanday formatda?" },
  "target.faq.4.a": {
    ru: "Офлайн-занятия + живые практики с менторами + домашние задания с обратной связью.",
    uz: "Offline darslar + mentorlar bilan jonli amaliyot + qayta aloqa bilan uy vazifalari.",
  },
  "target.faq.5.q": { ru: "Можно ли работать студентам?", uz: "Talabalar ishlashi mumkinmi?" },
  "target.faq.5.a": {
    ru: "Да, можно. Гибкий график позволяет совмещать обучение с учёбой в университете.",
    uz: "Ha, mumkin. Moslashuvchan jadval universitetda o'qish bilan birlashtirish imkonini beradi.",
  },

  /* --- Target Final CTA --- */
  "target.cta.heading": {
    ru: "Вы всё ещё думаете — или уже считаете доход?",
    uz: "Siz hali ham o'ylayapsizmi — yoki daromadni hisoblayapsizmi?",
  },
  "target.cta.desc": {
    ru: "Забронируйте место в следующем потоке. Группы до 30 человек для максимального фокуса.",
    uz: "Keyingi oqimda joy band qiling. Maksimal e'tibor uchun 30 kishigacha guruhlar.",
  },
  "target.cta.primary": {
    ru: "Хочу начать сейчас",
    uz: "Hozir boshlashni xohlayman",
  },
  "target.cta.secondary": {
    ru: "Бесплатная консультация",
    uz: "Bepul konsultatsiya",
  },

  /* --- Target Footer --- */
  "target.footer.tagline": {
    ru: "Ваш путь в мир больших продаж и профессионального роста.",
    uz: "Katta savdolar va kasbiy o'sish dunyosiga yo'lingiz.",
  },
  "target.footer.explore": { ru: "Навигация", uz: "Navigatsiya" },
  "target.footer.about": { ru: "О нас", uz: "Biz haqimizda" },
  "target.footer.program": { ru: "Программа", uz: "Dastur" },
  "target.footer.reviews": { ru: "Отзывы", uz: "Sharhlar" },
  "target.footer.contact": { ru: "Контакты", uz: "Kontaktlar" },
  "target.footer.contact_us": { ru: "Связаться с нами", uz: "Biz bilan bog'lanish" },
  "target.footer.support": { ru: "Поддержка", uz: "Qo'llab-quvvatlash" },
  "target.footer.join": { ru: "Стать частью команды", uz: "Jamoa a'zosi bo'lish" },
  "target.footer.legal": { ru: "Правовая информация", uz: "Huquqiy ma'lumot" },
  "target.footer.privacy": { ru: "Политика конфиденциальности", uz: "Maxfiylik siyosati" },
  "target.footer.terms": { ru: "Условия использования", uz: "Foydalanish shartlari" },
  "target.footer.rights": { ru: "SALES UP. ВСЕ ПРАВА ЗАЩИЩЕНЫ.", uz: "SALES UP. BARCHA HUQUQLAR HIMOYALANGAN." },

  /* --- Target Nav --- */
  "target.nav.about": { ru: "О нас", uz: "Biz haqimizda" },
  "target.nav.program": { ru: "Программа", uz: "Dastur" },
  "target.nav.cases": { ru: "Кейсы", uz: "Keyslar" },
  "target.nav.mentors": { ru: "Менторы", uz: "Mentorlar" },
  "target.nav.cta": { ru: "Начать", uz: "Boshlash" },

  /* --- Target Mobile Bottom --- */
  "target.mobile.cta": {
    ru: "Узнать свой доход →",
    uz: "Daromadingizni bilib oling →",
  },

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

  /* ══════════════════════════ MODAL (TARGET PAGE) ══════════════════════════ */
  "modal.target.heading": {
    ru: "Получите бонусы в Telegram-канале",
    uz: "Telegram-kanalda bonuslar oling",
  },
  "modal.target.subtitle": {
    ru: "Бесплатно · 3 бонуса сразу · Telegram-канал",
    uz: "Bepul · 3 ta bonus darhol · Telegram-kanal",
  },
  "modal.target.submit": {
    ru: "Получить бесплатно",
    uz: "Bepul olish",
  },

  /* ══════════════════════════ PROGRAM LESSONS ══════════════════════════ */
  /* Module 1: 01-03 */
  "target.program.module.1.lesson.1": {
    ru: "Что такое продажи и главные заблуждения о профессии",
    uz: "Sotuv nima va kasb haqidagi asosiy tushunmovchiliklar",
  },
  "target.program.module.1.lesson.2": {
    ru: "5 этапов психологии покупателя: от инстинкта до слов",
    uz: "Xaridor psixologiyasining 5 bosqichi: instinktdan so'zlargacha",
  },
  "target.program.module.1.lesson.3": {
    ru: "4 типа личности: тест из 20 вопросов и работа с каждым типом",
    uz: "4 xil shaxs turi: 20 savollik test va har bir tur bilan ishlash",
  },
  /* Module 2: 04-08 */
  "target.program.module.2.lesson.1": {
    ru: "7 вопросов разведки: формула RUERPC",
    uz: "7 ta razvedka savoli: RUERPC formulasi",
  },
  "target.program.module.2.lesson.2": {
    ru: "4 ключа, которые нужно знать до презентации предложения",
    uz: "Taklif taqdimotidan oldin bilish kerak bo'lgan 4 kalit",
  },
  "target.program.module.2.lesson.3": {
    ru: "Формула QQPR: вопрос → вопрос → презентация → рефлексия",
    uz: "QQPR formulasi: savol → savol → taqdimot → fikrlash",
  },
  "target.program.module.2.lesson.4": {
    ru: "5 типов возражений и правила ответа на каждый",
    uz: "5 turdagi e'tirozlar va har biriga javob berish qoidalari",
  },
  "target.program.module.2.lesson.5": {
    ru: "Матрица характеров: как подстроиться под любого клиента",
    uz: "Xarakter matritsasi: har qanday mijozga moslashish",
  },
  /* Module 3: 09-12 */
  "target.program.module.3.lesson.1": {
    ru: "5 техник закрытия: FOMO, 2 варианта, Допущение, Эксклюзив, Решение проблемы",
    uz: "5 ta yopish texnikasi: FOMO, 2 variant, Taxmin, Eksklyuziv, Muammo yechimi",
  },
  "target.program.module.3.lesson.2": {
    ru: "Интеграционные ролевые игры: полный цикл продажи",
    uz: "Integratsion rol o'yinlari: to'liq sotuv tsikli",
  },
  "target.program.module.3.lesson.3": {
    ru: "Воронка продаж и система 4 касаний",
    uz: "Sotuv hunisi va 4 ta teginish tizimi",
  },
  "target.program.module.3.lesson.4": {
    ru: "Визуальная презентация: 1 слайд = 1 мысль",
    uz: "Vizual taqdimot: 1 slayd = 1 fikr",
  },
  /* Module 4: 13-15 */
  "target.program.module.4.lesson.1": {
    ru: "Техника Black Swan для повторных касаний и follow-up",
    uz: "Takroriy teginishlar va follow-up uchun Black Swan texnikasi",
  },
  "target.program.module.4.lesson.2": {
    ru: "Протокол обработки отказов: как превратить «нет» в «да»",
    uz: "Rad etishlarni qayta ishlash protokoli: 'yo'q'ni 'ha'ga aylantirish",
  },
  "target.program.module.4.lesson.3": {
    ru: "KPI, зарплата и карьерные пути: Junior → Senior → Manager → Свой бизнес. Финальный экзамен + сертификат",
    uz: "KPI, maosh va martaba yo'llari: Junior → Senior → Manager → O'z biznesi. Yakuniy imtihon + sertifikat",
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
