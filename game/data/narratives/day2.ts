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
      uz: 'Suhbatdan so‘ng Kamolaning o‘zi sizdan telefon raqamingizni so‘radi. Tayyorlangan mijoz bunday qadamni faqat o‘ziga ishongan kishiga qo‘yadi. Sen unga ma’ruza o‘qimading, vaqtini behuda o‘tkazmading va savoliga aniq javob berding.\n\n"Tayyor" mijozlar shunday ishlaydi: u sizni tavsiya qilishi uchun avvalo siz "boshqa sotuvchilardan farqli" bo‘lishingiz kerak edi. Shunday qilib, siz ham shunday bo‘lib qoldingiz.',
      ru: 'После разговора Камола сама попросила ваш номер. Подготовленный клиент делает такой шаг только тому, кому доверяет. Вы не читали ей лекцию, не тратили её время и ответили точно на её вопрос.\n\nВот так и работают «готовые» клиенты: чтобы она вас порекомендовала, вы сначала должны были быть «не как другие продавцы». И вы им стали.',
    },
    insight: {
      uz: 'Tayyorlangan mijozga sotish - bu yangi bitim emas, bu tavsiya qilish uchun asosdir. Eng qimmatli mijozlar aynan shundan kelib chiqadi.',
      ru: 'Продажа подготовленному клиенту — это не новая сделка, это фундамент для рекомендации. Самые ценные лиды приходят именно оттуда.',
    },
  },

  success: {
    title: {
      uz: "Kamola o'ylash uchun ketdi",
      ru: 'Камола ушла думать',
    },
    body: {
      uz: "Asosiy ishni to‘g‘ri bajardingiz: uning tayyor ekanligini sezdingiz, umumiy gaplarga berilmadingiz, narx haqidagi savolga javob topdingiz. Ammo u albatta qaytib keladigan ishonch darajasiga yetmadingiz - bir paytlar siz mashinaning tarafida emas, uning qarshisida turgandingiz.\n\nBitim amalga oshishi mumkin. Ammo hozircha hammasi uning qo‘lida.",
      ru: 'Основное вы сделали правильно: почувствовали, что она подготовлена, не ушли в общие слова, на вопрос о цене ответ нашли. Но уровня доверия, при котором она точно вернётся, вы не достигли — в какой-то момент вы были на стороне машины, а не на её стороне.\n\nСделка возможна. Но пока всё в её руках.',
    },
    insight: {
      uz: "Tayyorlangan mijozning ishonchi - bu aniq gapirish qobiliyatidir. Ortiqcha so‘z - bu ishonchni pasaytiradigan birinchi narsa.",
      ru: 'Доверие подготовленного клиента — это умение говорить точно. Лишнее слово — первое, что это доверие снижает.',
    },
  },

  partial: {
    title: {
      uz: "Bitim emas, balki muvaffaqiyatsizlik ham emas",
      ru: 'Не сделка, но и не провал',
    },
    body: {
      uz: "Kamola xotirjam tinglab, savollar berdi, javob oldi va ketib qoldi. Qaytib keladimi-yo‘qmi, noma’lum. Uni birinchi daqiqada to‘g‘ri tushunmadingiz, keyin esa har bir qadamingiz xavfsiz, ammo betaraf yo‘ldan bordi.\n\nBunday mijozlar qaytib kelmaydi - ular shunchaki birinchi daqiqadayoq o‘z so‘roviga mos keladigan sotuvchini izlashga tushadi.",
      ru: 'Камола спокойно выслушала, задала вопросы, получила ответы и ушла. Вернётся ли — непонятно. Вы не прочитали её в первую минуту правильно, и дальше каждый шаг пошёл по безопасному, но нейтральному пути.\n\nТакие клиенты не возвращаются — они просто идут искать продавца, который попадёт в их запрос с первой минуты.',
    },
    insight: {
      uz: 'Tayyorlangan mijoz bilan "xavfsiz" yo‘l - aynan eng xatarli yo‘ldir. Agar u seni eslamasa, qaytib kelmaydi.',
      ru: 'С подготовленным клиентом «безопасный» путь — это как раз самый опасный. Если он вас не запомнит, он не вернётся.',
    },
  },

  failure: {
    title: {
      uz: 'Kamola boshqa salonga bordi',
      ru: 'Камола пошла в другой салон',
    },
    body: {
      uz: "Bu mijoz savolga aniq javob kutayotgan edi. Siz esa taqdimot qilishni yoki bosim o‘tkazishni boshladingiz. Tayyorlangan mijoz ikkalasini ham bir zumda ilg‘ab oladi va yopiladi.\n\nKamola indamay chiqib ketdi - bu salonda uni tushunadigan sotuvchi topilmadi. Ertaga boshqa joydan sotib olib, qaytib kelmaydi.",
      ru: 'Этот клиент ждал точного ответа на вопрос. Вы же начали презентовать или давить. Подготовленный клиент считывает и то и другое мгновенно и закрывается.\n\nКамола ушла молча — для неё в этом салоне продавца, который её понимает, не нашлось. Завтра она купит в другом месте и больше не вернётся.',
    },
    insight: {
      uz: "Tayyorlangan mijozga mahsulot sotish - u bilgan narsalarni aytib bermaslik demakdir. Uning savoliga javob bering va ortiqcha gapirmang.",
      ru: 'Продавать подготовленному клиенту — это не рассказывать то, что он знает. Ответьте на его вопрос и не говорите лишнего.',
    },
  },
};
