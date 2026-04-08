import type { Day } from '@/game/engine/types';

export const day2: Day = {
  id: 'car-day2',
  dayNumber: 2,
  title: {
    uz: 'Talabchan mijoz',
    ru: 'Требовательный клиент',
  },
  rootNodeId: 'd2_intro',
  targetScore: 45,
  nodes: {
    d2_intro: {
      id: 'd2_intro',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_manager_office',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: 'Bugungi mijoz — hamma narsani biladi. Unga o\'rgatmang. Sizning vazifangiz: xususiyat emas, QIYMAT ko\'rsating.',
        ru: 'Сегодняшний клиент — всё знает наперёд. Не учите её. Ваша задача: показать ЦЕННОСТЬ, а не характеристики.',
      },
      nextNodeId: 'd2_anvar_files',
    },

    d2_anvar_files: {
      id: 'd2_anvar_files',
      type: 'dialogue',
      speaker: 'anvar',
      emotion: 'nervous',
      background: 'bg_manager_office',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'left' },
        { id: 'anvar', emotion: 'nervous', position: 'right' },
      ],
      text: {
        uz: 'Rustam aka, Kamola xonim oldin ham so\'ragan ekan. Malibu va K5 ni solishtirgan.',
        ru: 'Рустам-ака, Камола уже обращалась раньше. Сравнивала Malibu и K5.',
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
        uz: 'Telefon jiringladi — kechagi er-xotin! Javlon qo\'ng\'iroq qildi: Nilufar bilan gaplashgan, Equinox ga qaytmoqchi!',
        ru: 'Зазвонил телефон — вчерашняя пара! Жавлон звонит: обсудил с Нилуфар, хотят вернуться за Equinox!',
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
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'confident', position: 'center' },
      ],
      text: {
        uz: 'Salom. Malibu ga keldim. K5 bilan taqqosladim — Malibu yaxshiroq. Lekin narxi balandroq.',
        ru: 'Здравствуйте. Пришла за Malibu. Сравнила с K5 — Malibu лучше. Но цена выше.',
      },
      nextNodeId: 'd2_presentation',
    },

    d2_presentation: {
      id: 'd2_presentation',
      type: 'choice',
      prompt: {
        uz: 'Kamola xonimga qanday yondashishni tanlang.',
        ru: 'Как подойдёте к Камоле?',
      },
      choices: [
        {
          id: 'd2_presentation_a',
          text: {
            uz: 'Siz yaxshi tahlil qilgansiz. Men faqat K5 da yo\'q narsalarni ko\'rsataman.',
            ru: 'Вы отлично разобрались. Покажу только то, чего нет у K5.',
          },
          effects: [
            { type: 'add_score', amount: 15, dimension: 'expertise' },
            { type: 'add_score', amount: 5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'respected_knowledge' },
          ],
          nextNodeId: 'd2_kamola_obj_features',
        },
        {
          id: 'd2_presentation_b',
          text: {
            uz: 'Malibu o\'z segmentida eng yaxshi tanlov. Keling, birga ko\'rib chiqamiz.',
            ru: 'Malibu — лучший выбор в своём сегменте. Давайте посмотрим вместе.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'expertise' },
            { type: 'set_flag', flag: 'standard_pitch' },
          ],
          nextNodeId: 'd2_kamola_obj_value',
        },
        {
          id: 'd2_presentation_c',
          text: {
            uz: 'Sizga eng muhimi nima — qulaylik, xavfsizlik yoki texnologiya?',
            ru: 'Что для вас важнее — комфорт, безопасность или технологии?',
          },
          effects: [
            { type: 'add_score', amount: 8, dimension: 'discovery' },
            { type: 'add_score', amount: 5, dimension: 'empathy' },
            { type: 'set_flag', flag: 'asked_priorities_d2' },
          ],
          nextNodeId: 'd2_kamola_obj_priorities',
        },
      ],
    },

    d2_kamola_obj_features: {
      id: 'd2_kamola_obj_features',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'checking',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'checking', position: 'center' },
      ],
      text: {
        uz: 'Yaxshi. Lekin K5 da ham kamera bor. 3 ming dollar farq — faqat qo\'shimcha funksiyalar uchunmi?',
        ru: 'Хорошо. Но у K5 тоже есть камера. 3 тысячи разницы — только за доп. функции?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_kamola_obj_value: {
      id: 'd2_kamola_obj_value',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'checking',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'checking', position: 'center' },
      ],
      text: {
        uz: 'Chiroyli gapirasiz. Lekin K5 — 25 ming, Malibu — 28 ming. 3 ming uchun aniq nima olaman?',
        ru: 'Красиво говорите. Но K5 — 25 тысяч, Malibu — 28. За 3 тысячи — конкретно что получу?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_kamola_obj_priorities: {
      id: 'd2_kamola_obj_priorities',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'confident',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'confident', position: 'center' },
      ],
      text: {
        uz: 'Texnologiya va qulaylik. Lekin buni bilaman — K5 bilan solishtirdim. Savol boshqa: 3 ming uchun nima beradi?',
        ru: 'Технологии и комфорт. Но я это знаю — сравнивала с K5. Вопрос: за 3 тысячи — что получу?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_objection: {
      id: 'd2_objection',
      type: 'choice',
      prompt: {
        uz: 'Narx bo\'yicha e\'tirozga qanday javob berasiz?',
        ru: 'Как ответите на возражение по цене?',
      },
      timeLimit: 10,
      expireNodeId: 'd2_objection_expired',
      choices: [
        {
          id: 'd2_objection_a',
          text: {
            uz: '3 ming — bu 2 yillik bepul servis. K5 da yo\'q. Yiliga 1500 tejaysiz.',
            ru: '3 тысячи — это 2 года бесплатного сервиса. У K5 нет. Экономия $1500 в год.',
          },
          effects: [
            { type: 'add_score', amount: 15, dimension: 'persuasion' },
            { type: 'add_score', amount: 5, dimension: 'expertise' },
            { type: 'set_flag', flag: 'value_reframe' },
          ],
          nextNodeId: 'd2_kamola_reacts_service',
        },
        {
          id: 'd2_objection_b',
          text: {
            uz: 'Tushunaman. Ko\'pchilik shunday o\'ylagan. Lekin Malibu egalari mamnun — qayta sotsangiz ham narxi yuqori.',
            ru: 'Понимаю. Многие думали так же. Но владельцы Malibu довольны — и при перепродаже цена выше.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'persuasion' },
            { type: 'add_score', amount: 5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'social_proof' },
          ],
          nextNodeId: 'd2_kamola_reacts_resale',
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
          nextNodeId: 'd2_kamola_reacts_discount',
        },
      ],
    },

    d2_objection_expired: {
      id: 'd2_objection_expired',
      type: 'score',
      effects: [{ type: 'add_score', amount: -8, dimension: 'timing' }],
      narrator: {
        uz: 'Javob topa olmadingiz. Kamola sabrsizlanmoqda.',
        ru: 'Вы не нашли ответа. Камола теряет терпение.',
      },
      nextNodeId: 'd2_kamola_reacts_timeout',
    },

    d2_kamola_reacts_service: {
      id: 'd2_kamola_reacts_service',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'checking',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'checking', position: 'center' },
      ],
      text: {
        uz: 'Hmm, 2 yillik servis... Yiliga 1500 tejash — bu hisoblasa arziydi. Qiziq.',
        ru: 'Хм, 2 года сервиса... $1500 в год экономии — если посчитать, выгодно. Интересно.',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    d2_kamola_reacts_resale: {
      id: 'd2_kamola_reacts_resale',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'checking',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'checking', position: 'center' },
      ],
      text: {
        uz: 'Qayta sotish narxi... To\'g\'ri, lekin K5 ham yaxshi sotiladi. Yana nimasi bor?',
        ru: 'Перепродажная стоимость... Верно, но K5 тоже хорошо продаётся. Что ещё?',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    d2_kamola_reacts_discount: {
      id: 'd2_kamola_reacts_discount',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'skeptical',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'skeptical', position: 'center' },
      ],
      text: {
        uz: 'Chegirma? Men chegirma uchun kelganim yo\'q. Nimasi yaxshiroq — shuni ayting.',
        ru: 'Скидка? Я не за скидками пришла. Скажите — чем Malibu лучше.',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    d2_kamola_reacts_timeout: {
      id: 'd2_kamola_reacts_timeout',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'skeptical',
      background: 'bg_showroom',
      characters: [
        { id: 'kamola', emotion: 'skeptical', position: 'center' },
      ],
      text: {
        uz: 'Javob yo\'qmi? Demak, 3 ming uchun argument yo\'q ekan.',
        ru: 'Нет ответа? Значит, аргументов за 3 тысячи нет.',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    // ─── TEST DRIVE SCENE ───────────────────────────────────

    d2_test_drive_offer: {
      id: 'd2_test_drive_offer',
      type: 'choice',
      prompt: {
        uz: 'Kamola hali ikkilanmoqda. Nima qilasiz?',
        ru: 'Камола пока сомневается. Что сделаете?',
      },
      choices: [
        {
          id: 'd2_test_drive_offer_a',
          text: {
            uz: 'Test-drayv qilamizmi? Rulga o\'tirsangiz, farq o\'zi gapiradi.',
            ru: 'Поедем на тест-драйв? Сядете за руль — разница скажет сама.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'timing' },
            { type: 'add_score', amount: 5, dimension: 'persuasion' },
            { type: 'set_flag', flag: 'offered_test_drive_d2' },
          ],
          nextNodeId: 'd2_test_drive',
        },
        {
          id: 'd2_test_drive_offer_b',
          text: {
            uz: 'Keling, yakunlashtiramiz. Yana savollar bormi?',
            ru: 'Давайте подведём итог. Есть ещё вопросы?',
          },
          effects: [
            { type: 'add_score', amount: 3, dimension: 'timing' },
          ],
          nextNodeId: 'd2_closing',
        },
      ],
    },

    d2_test_drive: {
      id: 'd2_test_drive',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_test_drive_city',
      characters: [],
      text: {
        uz: 'Kamola rulga o\'tirdi. Malibu Toshkent ko\'chalarida ohista suzib bormoqda.',
        ru: 'Камола села за руль. Malibu плавно скользит по улицам Ташкента.',
      },
      nextNodeId: 'd2_kamola_drives',
    },

    d2_kamola_drives: {
      id: 'd2_kamola_drives',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'impressed',
      background: 'bg_test_drive_city',
      characters: [
        { id: 'kamola', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'Hmm... podveska K5 dan yumshoqroq. Ichkarisi ham juda chiroyli — premium his qilyapman.',
        ru: 'Хм... подвеска мягче, чем у K5. И салон — реально премиум чувствуется.',
      },
      nextNodeId: 'd2_test_drive_choice',
    },

    d2_test_drive_choice: {
      id: 'd2_test_drive_choice',
      type: 'choice',
      prompt: {
        uz: 'Kamola haydayotganda nima deysiz?',
        ru: 'Что скажете, пока Камола ведёт?',
      },
      choices: [
        {
          id: 'd2_test_drive_choice_a',
          text: {
            uz: 'Avtopilotni ko\'ring — qo\'yib qo\'ying, mashina o\'zi oqimga tushadi.',
            ru: 'Попробуйте круиз — включите, и машина сама держит поток.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'expertise' },
            { type: 'set_flag', flag: 'test_drive_cruise' },
          ],
          nextNodeId: 'd2_kamola_test_reaction',
        },
        {
          id: 'd2_test_drive_choice_b',
          text: {
            uz: '360 kamerani ko\'ring — Toshkentda parkovka oson bo\'ladi.',
            ru: 'Попробуйте камеру 360° — парковка в Ташкенте станет проще.',
          },
          effects: [
            { type: 'add_score', amount: 8, dimension: 'expertise' },
            { type: 'add_score', amount: 5, dimension: 'empathy' },
          ],
          nextNodeId: 'd2_kamola_test_reaction',
        },
        {
          id: 'd2_test_drive_choice_c',
          text: {
            uz: 'Jim turaman. O\'zi his qilsin.',
            ru: 'Молчу. Пусть сама почувствует.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'rapport' },
            { type: 'add_score', amount: 5, dimension: 'timing' },
          ],
          nextNodeId: 'd2_kamola_test_reaction',
        },
      ],
    },

    d2_kamola_test_reaction: {
      id: 'd2_kamola_test_reaction',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'test_drive_cruise' },
          nextNodeId: 'd2_kamola_test_cruise',
        },
      ],
      fallbackNodeId: 'd2_kamola_test_general',
    },

    d2_kamola_test_cruise: {
      id: 'd2_kamola_test_cruise',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'impressed',
      background: 'bg_test_drive_city',
      characters: [
        { id: 'kamola', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'Voy... Mashina o\'zi tezlikni ushlab turibdi. Toshkent-Samarqand yo\'lida zo\'r bo\'ladi.',
        ru: 'Ого... Машина сама держит скорость. На трассе Ташкент-Самарканд — это супер.',
      },
      nextNodeId: 'd2_closing',
    },

    d2_kamola_test_general: {
      id: 'd2_kamola_test_general',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'impressed',
      background: 'bg_test_drive_city',
      characters: [
        { id: 'kamola', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'Haydashda farq boshqa. Raqamlar bir narsa, his etish — boshqa narsa.',
        ru: 'За рулём — другое дело. Цифры — это одно, а чувствовать — совсем другое.',
      },
      nextNodeId: 'd2_closing',
    },

    // ─── CLOSING ────────────────────────────────────────────

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
          id: 'd2_closing_b',
          text: {
            uz: 'Bugun qaror qilsangiz, maxsus shartlar taklif qilaman.',
            ru: 'Если решите сегодня — предложу особые условия.',
          },
          effects: [
            { type: 'add_score', amount: 5, dimension: 'timing' },
            { type: 'add_score', amount: -3, dimension: 'rapport' },
            { type: 'set_flag', flag: 'pressure_close' },
          ],
          nextNodeId: 'd2_check',
        },
        {
          id: 'd2_closing_c',
          text: {
            uz: 'O\'ylab ko\'ring, shoshilmang. Savollar bo\'lsa — yozing.',
            ru: 'Подумайте, не торопитесь. Будут вопросы — пишите.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'rapport' },
            { type: 'add_score', amount: 5, dimension: 'empathy' },
            { type: 'set_flag', flag: 'soft_close' },
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
              { type: 'score_gte', value: 40 },
              { type: 'flag', flag: 'respected_knowledge' },
            ],
          },
          nextNodeId: 'd2_end_hidden',
        },
        {
          condition: { type: 'score_gte', value: 35 },
          nextNodeId: 'd2_end_success',
        },
        {
          condition: { type: 'score_gte', value: 20 },
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
          uz: 'Bilasizmi, siz boshqalarga o\'xshamaysiz. Dugonalarimga aytaman — sizga kelsinlar.',
          ru: 'Знаете, вы не как все. Скажу подругам — пусть приходят к вам.',
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
          uz: 'Kamola oson mijoz emas, lekin siz yaxshi ishladingiz. E\'tirozga javob berdingiz.',
          ru: 'Камола — непростой клиент, но вы справились. Ответили на возражение.',
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
          uz: 'Kamola ketdi, qaytishi noaniq. Narx savoli uchun kuchliroq javob kerak edi.',
          ru: 'Камола ушла, вернётся ли — вопрос. Нужен был более сильный ответ на цену.',
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
          uz: 'Kamola ketdi. Eslab qoling: bilimli mijozga hurmat ko\'rsating, ma\'ruza o\'qimang.',
          ru: 'Камола ушла. Запомните: знающему клиенту — уважение, а не лекции.',
        },
      },
    },
  },
};
