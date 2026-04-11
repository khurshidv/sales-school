// ============================================================
// Day 2 Narratives — тексты для экрана DaySummary.
//
// Kamola — подготовленная клиентка, которая уже изучила Malibu и
// сравнила с K5. Её ждёт точный ответ, а не презентация. Каждый
// исход раскрывает, как игрок прочитал (или не прочитал) её запрос.
//
// Тон — как в day1: честно, но с обучающим выводом. Для failure/
// partial — конкретика, что именно пошло не так.
// ============================================================

import type { DayOutcome, LocalizedText } from '@/game/engine/types';

export interface DayNarrative {
  title: LocalizedText;
  body: LocalizedText;
  insight: LocalizedText;
}

export const day2Narratives: Record<DayOutcome, DayNarrative> = {
  hidden_ending: {
    title: {
      uz: 'Kamola sizni tavsiya qiladi',
      ru: 'Камола вас порекомендует',
    },
    body: {
      uz: "Kamola siz bilan gaplashib chiqqandan keyin telefon raqamingizni o'zi so'radi. Unday tayyorlanib kelgan mijoz bunday qadamni ishongan odamgagina qiladi. Siz unga ma'ruza o'qimadingiz, vaqtini olmadingiz va savoliga aniq javob berdingiz.\n\nAynan shu — tayyor mijozlarning til topishuvi: u sizni boshqa odamga tavsiya qilishidan oldin, siz uning oldida \"boshqa sotuvchilarga o'xshamagan\" bo'lishingiz kerak edi. Siz shunday bo'ldingiz.",
      ru: 'После разговора Камола сама попросила ваш номер. Подготовленный клиент делает такой шаг только тому, кому доверяет. Вы не читали ей лекцию, не тратили её время и ответили точно на её вопрос.\n\nВот так и работают «готовые» клиенты: чтобы она вас порекомендовала, вы сначала должны были быть «не как другие продавцы». И вы им стали.',
    },
    insight: {
      uz: 'Tayyor mijozga sotuv — bu yangi bitim emas, bu tavsiya uchun zamin. Eng qimmatli lidlar aynan shundan keladi.',
      ru: 'Продажа подготовленному клиенту — это не новая сделка, это фундамент для рекомендации. Самые ценные лиды приходят именно оттуда.',
    },
  },

  success: {
    title: {
      uz: 'Kamola fikrlash uchun ketdi',
      ru: 'Камола ушла думать',
    },
    body: {
      uz: "Siz asosiy narsalarni to'g'ri qildingiz: u tayyor ekanligini sezdingiz, umumiy gap aytmadingiz, narx bo'yicha savolga javob topdingiz. Lekin u hali qaytmaydigan darajada ishonch hosil qilmadi — bir lahzada siz uning tomoni o'rniga mashinaning tomonida turgandingiz.\n\nSotuv bo'lishi mumkin. Lekin hali hammasi uning qo'lida.",
      ru: 'Основное вы сделали правильно: почувствовали, что она подготовлена, не ушли в общие слова, на вопрос о цене ответ нашли. Но уровня доверия, при котором она точно вернётся, вы не достигли — в какой-то момент вы были на стороне машины, а не на её стороне.\n\nСделка возможна. Но пока всё в её руках.',
    },
    insight: {
      uz: "Tayyor mijozning ishonchini olish — bu darajada aniq gapirish demak. Ortiqcha so'z — ishonchni pasaytiradigan birinchi narsa.",
      ru: 'Доверие подготовленного клиента — это умение говорить точно. Лишнее слово — первое, что это доверие снижает.',
    },
  },

  partial: {
    title: {
      uz: "Yaxshi emas, lekin katta xatolar ham yo'q",
      ru: 'Не сделка, но и не провал',
    },
    body: {
      uz: "Kamola tinchgina eshitdi, savollarini berdi, javoblarni oldi va ketdi. Qaytadimi — noma'lum. Siz birinchi daqiqada uni to'g'ri o'qimadingiz, shuning uchun keyingi har bir qadam xavfsiz, lekin betaraf yo'lga o'tdi.\n\nBunday mijoz qayta kelmaydi — faqat o'ziga keraklisi sotuvchini topguncha boshqa joyga boradi.",
      ru: 'Камола спокойно выслушала, задала вопросы, получила ответы и ушла. Вернётся ли — непонятно. Вы не прочитали её в первую минуту правильно, и дальше каждый шаг пошёл по безопасному, но нейтральному пути.\n\nТакие клиенты не возвращаются — они просто идут искать продавца, который попадёт в их запрос с первой минуты.',
    },
    insight: {
      uz: 'Tayyor mijoz bilan "xavfsiz" yo\'l — aslida eng xavflisi. U sizni eslay olmasa, qaytmaydi.',
      ru: 'С подготовленным клиентом «безопасный» путь — это как раз самый опасный. Если он вас не запомнит, он не вернётся.',
    },
  },

  failure: {
    title: {
      uz: 'Kamola boshqa salonga ketdi',
      ru: 'Камола пошла в другой салон',
    },
    body: {
      uz: "Bu mijoz savolga aniq javob kutgan edi. Siz esa unga prezentatsiya o'tkazdingiz yoki bosim qildingiz. Tayyor mijoz bu ikkisini ham bir lahzada sezadi va yopiladi.\n\nKamola hech nima demay ketdi — uning uchun bu salonda ishlaydigan sotuvchi topilmadi. Ertaga u boshqa yerda sotib oladi — va qaytib kelmaydi.",
      ru: 'Этот клиент ждал точного ответа на вопрос. Вы же начали презентовать или давить. Подготовленный клиент считывает и то и другое мгновенно и закрывается.\n\nКамола ушла молча — для неё в этом салоне продавца, который её понимает, не нашлось. Завтра она купит в другом месте и больше не вернётся.',
    },
    insight: {
      uz: "Tayyor mijozga sotish — bu bilgan narsalarni aytmaslik. Uning savoliga javob bering, ko'p gapirmang.",
      ru: 'Продавать подготовленному клиенту — это не рассказывать то, что он знает. Ответьте на его вопрос и не говорите лишнего.',
    },
  },
};
