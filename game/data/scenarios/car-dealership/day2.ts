import type { Day } from '@/game/engine/types';

export const day2: Day = {
  id: 'car-day2',
  dayNumber: 2,
  title: {
    uz: 'Talabchan mijoz',
    ru: 'Требовательный клиент',
  },
  rootNodeId: 'd2_intro',
  targetScore: 40,
  nodes: {
    d2_intro: {
      id: 'd2_intro',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      text: {
        uz: 'Bugun Kamola xonim keladi — u hamma narsani biladi. Unga o\'rgatmang. Bu siz uchun FAB texnikasini sinab ko\'rish imkoniyati: Feature, Advantage, Benefit. Uch so\'z — bitta tizim.',
        ru: 'Сегодня придёт Камола — она всё знает. Не учите её. Это ваш шанс попробовать технику FAB: Feature, Advantage, Benefit. Три слова — одна система.',
      },
      nextNodeId: 'd2_callback_check',
    },

    d2_callback_check: {
      id: 'd2_callback_check',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'd1_success' },
          nextNodeId: 'd2_callback',
        },
      ],
      fallbackNodeId: 'd2_kamola_enters',
    },

    d2_callback: {
      id: 'd2_callback',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: {
        uz: 'Telefon jiringladi — kechagi Bobur qo\'ng\'iroq qildi. Xotini bilan test-drayvga kelmoqchi!',
        ru: 'Зазвонил телефон — вчерашний Бобур звонит. Хочет приехать с женой на тест-драйв!',
      },
      effects: [
        { type: 'add_score', amount: 5, dimension: 'opportunity' },
        { type: 'add_bonus', bonusType: 'callback_bonus', multiplier: 1.5 },
      ],
      nextNodeId: 'd2_kamola_enters',
    },

    d2_kamola_enters: {
      id: 'd2_kamola_enters',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'confident',
      text: {
        uz: 'Salom. Malibu ko\'rmoqchiman. Kia K5 bilan solishtirib bo\'ldim, Malibu yutadi — lekin narxi baland.',
        ru: 'Здравствуйте. Хочу посмотреть Malibu. Я уже сравнила с Kia K5 — Malibu выигрывает, но цена выше.',
      },
      nextNodeId: 'd2_presentation',
    },

    d2_presentation: {
      id: 'd2_presentation',
      type: 'choice',
      prompt: {
        uz: 'Kamola xonimga qanday prezentatsiya qilasiz?',
        ru: 'Как будете презентовать Камоле?',
      },
      choices: [
        {
          id: 'd2_presentation_a',
          text: {
            uz: 'Siz allaqachon yaxshi tahlil qilgansiz. Men faqat K5 da yo\'q farqlarni aytaman — adaptive cruise va 360\u00B0 kamera.',
            ru: 'Вы уже отлично проанализировали. Покажу только то, чего нет у K5 — адаптивный круиз и камера 360\u00B0.',
          },
          effects: [
            { type: 'add_score', amount: 15, dimension: 'expertise' },
            { type: 'add_score', amount: 5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'respected_knowledge' },
          ],
          nextNodeId: 'd2_kamola_objection',
        },
        {
          id: 'd2_presentation_b',
          text: {
            uz: 'Malibu biznes-klass segmentida eng yaxshi narx-sifat nisbati. Keling, asosiy xususiyatlarni ko\'rib chiqamiz.',
            ru: 'Malibu — лучшее соотношение цена-качество в бизнес-классе. Давайте пройдёмся по основным характеристикам.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'expertise' },
            { type: 'set_flag', flag: 'standard_pitch' },
          ],
          nextNodeId: 'd2_kamola_objection',
        },
        {
          id: 'd2_presentation_c',
          text: {
            uz: 'Qaysi jihati sizga eng muhim — qulaylik, xavfsizlik yoki texnologiyalar?',
            ru: 'Что для вас важнее всего — комфорт, безопасность или технологии?',
          },
          effects: [
            { type: 'add_score', amount: 8, dimension: 'discovery' },
            { type: 'add_score', amount: 5, dimension: 'empathy' },
            { type: 'set_flag', flag: 'asked_priorities_d2' },
          ],
          nextNodeId: 'd2_kamola_objection',
        },
      ],
    },

    d2_kamola_objection: {
      id: 'd2_kamola_objection',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'skeptical',
      text: {
        uz: 'Hammasi yaxshi, lekin K5 — 25 ming, Malibu — 28 ming. 3 ming farq uchun nima olaman?',
        ru: 'Всё хорошо, но K5 — 25 тысяч, Malibu — 28. За 3 тысячи разницы что я получу?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_objection: {
      id: 'd2_objection',
      type: 'choice',
      prompt: {
        uz: 'Narx e\'tiroziga qanday javob berasiz?',
        ru: 'Как ответите на возражение по цене?',
      },
      timeLimit: 10,
      expireNodeId: 'd2_objection_expired',
      choices: [
        {
          id: 'd2_objection_a',
          text: {
            uz: '3 ming — bu 2 yillik bepul servis. K5 da yo\'q. Yiliga 1500 tejaysiz servisga.',
            ru: '3 тысячи — это 2 года бесплатного сервиса. У K5 нет. Экономия $1500 в год на обслуживании.',
          },
          effects: [
            { type: 'add_score', amount: 15, dimension: 'persuasion' },
            { type: 'add_score', amount: 5, dimension: 'expertise' },
            { type: 'set_flag', flag: 'value_reframe' },
          ],
          nextNodeId: 'd2_closing',
        },
        {
          id: 'd2_objection_b',
          text: {
            uz: 'Tushunaman. Ko\'p mijozlarimiz ham shunday o\'ylagan, lekin Malibu egalari o\'z tanlovlaridan mamnun — qayta sotish narxi ham yuqori.',
            ru: 'Понимаю. Многие клиенты думали так же, но владельцы Malibu довольны — и перепродажная стоимость выше.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'persuasion' },
            { type: 'add_score', amount: 5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'social_proof' },
          ],
          nextNodeId: 'd2_closing',
        },
        {
          id: 'd2_objection_c',
          text: {
            uz: 'Chegirma qilsam bo\'ladimi? Menejer bilan gaplashaman.',
            ru: 'Могу попросить скидку? Поговорю с менеджером.',
          },
          effects: [
            { type: 'add_score', amount: -5, dimension: 'persuasion' },
            { type: 'add_score', amount: 3, dimension: 'empathy' },
            { type: 'set_flag', flag: 'offered_discount' },
          ],
          nextNodeId: 'd2_closing',
        },
      ],
    },

    d2_objection_expired: {
      id: 'd2_objection_expired',
      type: 'score',
      effects: [{ type: 'add_score', amount: -8, dimension: 'timing' }],
      narrator: {
        uz: 'Siz javob topa olmadingiz. Kamola xonim sabrsizlanmoqda.',
        ru: 'Вы не нашли что ответить. Камола теряет терпение.',
      },
      nextNodeId: 'd2_closing',
    },

    d2_closing: {
      id: 'd2_closing',
      type: 'choice',
      prompt: {
        uz: 'Qanday yakunlaysiz?',
        ru: 'Как завершите разговор?',
      },
      choices: [
        {
          id: 'd2_closing_a',
          text: {
            uz: 'Test-drayvga chiqamizmi? O\'tirib ko\'rganingizda farq boshqacha his etiladi.',
            ru: 'Поедем на тест-драйв? Когда сядете за руль, разница чувствуется совсем иначе.',
          },
          effects: [
            { type: 'add_score', amount: 12, dimension: 'timing' },
            { type: 'add_score', amount: 5, dimension: 'persuasion' },
            { type: 'set_flag', flag: 'offered_test_drive_d2' },
          ],
          nextNodeId: 'd2_check',
        },
        {
          id: 'd2_closing_b',
          text: {
            uz: 'Ma\'lumotlarni telegramga yuborsam bo\'ladimi? Solishtirish jadvalini tayyorlayman.',
            ru: 'Могу отправить в телеграм? Подготовлю сравнительную таблицу.',
          },
          effects: [
            { type: 'add_score', amount: 8, dimension: 'rapport' },
            { type: 'add_score', amount: 3, dimension: 'expertise' },
            { type: 'set_flag', flag: 'sent_info' },
          ],
          nextNodeId: 'd2_check',
        },
        {
          id: 'd2_closing_c',
          text: {
            uz: 'Hozir qaror qilsangiz, maxsus shartlar taklif qila olaman.',
            ru: 'Если решите сейчас, могу предложить особые условия.',
          },
          effects: [
            { type: 'add_score', amount: 5, dimension: 'timing' },
            { type: 'add_score', amount: -3, dimension: 'rapport' },
            { type: 'set_flag', flag: 'pressure_close' },
          ],
          nextNodeId: 'd2_check',
        },
      ],
    },

    d2_check: {
      id: 'd2_check',
      type: 'condition_branch',
      branches: [
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'score_gte', value: 35 },
              { type: 'flag', flag: 'respected_knowledge' },
            ],
          },
          nextNodeId: 'd2_end_hidden',
        },
        {
          condition: { type: 'score_gte', value: 32 },
          nextNodeId: 'd2_end_success',
        },
        {
          condition: { type: 'score_gte', value: 18 },
          nextNodeId: 'd2_end_partial',
        },
      ],
      fallbackNodeId: 'd2_end_fail',
    },

    d2_end_hidden: {
      id: 'd2_end_hidden',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'add_xp', amount: 150 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'respect_earns_referrals' },
        { type: 'set_flag', flag: 'd2_hidden' },
      ],
      dialogue: {
        speaker: 'kamola',
        emotion: 'impressed',
        text: {
          uz: 'Bilasizmi, siz boshqalarga o\'xshamaysiz. Dugonalarimga ham aytaman — sizga kelsinlar.',
          ru: 'Знаете, вы не похожи на остальных. Скажу подругам — пусть к вам приходят.',
        },
      },
    },

    d2_end_success: {
      id: 'd2_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 110 },
        { type: 'set_flag', flag: 'd2_success' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'proud',
        text: {
          uz: 'Kamola xonim qiyin mijoz, lekin siz yaxshi ishladingiz. E\'tirozga javob berdingiz — bu muhim.',
          ru: 'Камола — сложный клиент, но вы справились. Ответили на возражение — это важно.',
        },
      },
    },

    d2_end_partial: {
      id: 'd2_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 70 },
        { type: 'set_flag', flag: 'd2_partial' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'serious',
        text: {
          uz: 'Kamola xonim ketdi, lekin qaytishi noaniq. Narx e\'tiroziga kuchliroq javob kerak edi.',
          ru: 'Камола ушла, но вернётся ли — неизвестно. Нужен был более сильный ответ на возражение по цене.',
        },
      },
    },

    d2_end_fail: {
      id: 'd2_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 35 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd2_fail' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'disappointed',
        text: {
          uz: 'Kamola xonim ketdi. Eslab qoling: bilimli mijozga hurmat ko\'rsating, o\'rgatmang.',
          ru: 'Камола ушла. Запомните: знающему клиенту — уважение, а не лекции.',
        },
      },
    },
  },
};
