import type { Day } from '@/game/engine/types';

export const day5: Day = {
  id: 'car-day5',
  dayNumber: 5,
  title: { uz: 'Sirli xaridor', ru: 'Тайный покупатель' },
  rootNodeId: 'd5_intro',
  targetScore: 70,
  nodes: {
    // ── d5_intro ──────────────────────────────────────────────
    d5_intro: {
      id: 'd5_intro',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "Oxirgi kun. Siz 4 kunda 4 xil texnikani sezdingiz — SPIN, FAB, e'tirozlar, B2B. Professional sotuvchilar bularni uyg'unlikda, avtomatik ishlatadi. Bu 3 oylik trening natijasi. Buguni — sinovingiz.",
        ru: 'Последний день. За 4 дня вы почувствовали 4 техники — SPIN, FAB, работа с возражениями, B2B. Профессиональные продавцы применяют всё это одновременно, автоматически. Это результат 3 месяцев тренинга. Сегодня — ваш экзамен.',
      },
      nextNodeId: 'd5_morning_check',
    },

    // ── d5_morning_check ──────────────────────────────────────
    d5_morning_check: {
      id: 'd5_morning_check',
      type: 'condition_branch',
      branches: [
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'flag', flag: 'd1_success' },
              { type: 'flag', flag: 'd2_success' },
            ],
          },
          nextNodeId: 'd5_dilnoza_tip',
        },
      ],
      fallbackNodeId: 'd5_sardor_enters',
    },

    // ── d5_dilnoza_tip ────────────────────────────────────────
    d5_dilnoza_tip: {
      id: 'd5_dilnoza_tip',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'helpful',
      characters: [
        { id: 'dilnoza', emotion: 'helpful', position: 'center' },
      ],
      text: {
        uz: "Yaxshi ishlayapsiz. Oxirgi maslahat: eng qiyin mijoz — eng yashirin imkoniyat. — Men 2 yil oldin siz kabi edim. Tizimli o'rgandim, endi oyiga 3-4 ta yirik bitim yopaman. Siz ham qila olasiz.",
        ru: 'Хорошо работаете. Последний совет: самый сложный клиент — скрытая возможность. — 2 года назад я была такой же, как вы. Обучилась системно — теперь закрываю 3-4 крупных сделки в месяц. Вы тоже сможете.',
      },
      effects: [{ type: 'set_flag', flag: 'got_dilnoza_tip' }],
      nextNodeId: 'd5_sardor_enters',
    },

    // ── d5_sardor_enters ──────────────────────────────────────
    d5_sardor_enters: {
      id: 'd5_sardor_enters',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom_entrance',
      characters: [
        { id: 'sardor', emotion: 'observing', position: 'center' },
      ],
      text: {
        uz: "Salonга oddiy kiyingan kishi kirdi. Biroz qarab, hech kimga murojaat qilmadi.",
        ru: 'В салон зашёл скромно одетый мужчина. Осмотрелся, ни к кому не обратился.',
      },
      nextNodeId: 'd5_approach',
    },

    // ── d5_approach ───────────────────────────────────────────
    d5_approach: {
      id: 'd5_approach',
      type: 'choice',
      prompt: {
        uz: 'Nima qilasiz?',
        ru: 'Что сделаете?',
      },
      timeLimit: 10,
      expireNodeId: 'd5_approach_expired',
      choices: [
        {
          id: 'd5_approach_a',
          text: {
            uz: "Assalomu alaykum! Bemalol ko'rib chiqing. Savol bo'lsa — men shu yerdaman.",
            ru: 'Здравствуйте! Смотрите спокойно. Если будут вопросы — я рядом.',
          },
          nextNodeId: 'd5_needs_soft',
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 12 },
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'patient_approach' },
          ],
        },
        {
          id: 'd5_approach_b',
          text: {
            uz: 'Salom! Qaysi model qiziqtirdi?',
            ru: 'Здравствуйте! Какая модель заинтересовала?',
          },
          nextNodeId: 'd5_needs_direct',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
        },
        {
          id: 'd5_approach_c',
          text: {
            uz: "Cobalt ko'rayapsizmi? Bu bizning eng mashhur modelimiz.",
            ru: 'Смотрите Cobalt? Это наша самая популярная модель.',
          },
          nextNodeId: 'd5_needs_cobalt',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'add_score', dimension: 'empathy', amount: -5 },
            { type: 'set_flag', flag: 'judged_by_appearance' },
          ],
        },
      ],
    },

    // ── d5_approach_expired ───────────────────────────────────
    d5_approach_expired: {
      id: 'd5_approach_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -8 },
        { type: 'lose_life' },
      ],
      narrator: {
        uz: "Siz hech narsa qilmadingiz. Mijoz e'tiborsiz qoldi.",
        ru: 'Вы ничего не сделали. Клиент остался без внимания.',
      },
      nextNodeId: 'd5_needs_expired',
    },

    // ── d5_needs_soft (after patient approach) ────────────────
    d5_needs_soft: {
      id: 'd5_needs_soft',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: 'Rahmat, biroz qarab chiqdim. Aslida... oilam uchun mashina kerak. Qanday tanlashni bilmayman. Yordam bera olasizmi?',
        ru: 'Спасибо, осмотрелся. На самом деле... нужна машина для семьи. Не знаю как выбрать. Можете помочь?',
      },
      nextNodeId: 'd5_needs_choice',
    },

    // ── d5_needs_direct (after model question) ───────────────
    d5_needs_direct: {
      id: 'd5_needs_direct',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: 'Hali bilmayman qaysi model. Oilam uchun mashina kerak, lekin qanday tanlashni bilmayman.',
        ru: 'Пока не определился с моделью. Нужна машина для семьи, но не знаю с чего начать.',
      },
      nextNodeId: 'd5_needs_choice',
    },

    // ── d5_needs_cobalt (after Cobalt assumption) ─────────────
    d5_needs_cobalt: {
      id: 'd5_needs_cobalt',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing', position: 'center' },
      ],
      text: {
        uz: 'Cobalt? Yo\'q... Oilam uchun kattaroq mashina kerak. Nima tavsiya qilasiz?',
        ru: 'Cobalt? Нет... Нужна машина побольше, для семьи. Что порекомендуете?',
      },
      nextNodeId: 'd5_needs_choice',
    },

    // ── d5_needs_expired (client approaches himself) ──────────
    d5_needs_expired: {
      id: 'd5_needs_expired',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: 'Kechirasiz... menga maslahat bera olasizmi? Oilam uchun mashina kerak.',
        ru: 'Извините... можете проконсультировать? Нужна машина для семьи.',
      },
      nextNodeId: 'd5_needs_choice',
    },

    // ── d5_needs_choice ───────────────────────────────────────
    d5_needs_choice: {
      id: 'd5_needs_choice',
      type: 'choice',
      prompt: {
        uz: 'Qanday yordam berasiz?',
        ru: 'Как поможете?',
      },
      choices: [
        {
          id: 'd5_needs_choice_a',
          text: {
            uz: "Oilangiz haqida gapirib bering — nechta farzand, qayerga ko'p borasiz, nima muhim?",
            ru: 'Расскажите о семье — сколько детей, куда часто ездите, что важно?',
          },
          nextNodeId: 'd5_objection_after_family',
          effects: [
            { type: 'add_score', dimension: 'discovery', amount: 15 },
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'deep_discovery' },
          ],
        },
        {
          id: 'd5_needs_choice_b',
          text: {
            uz: "Byudjetingiz qancha? Shunga qarab tanlaymiz.",
            ru: 'Какой бюджет? Подберём под него.',
          },
          nextNodeId: 'd5_objection_after_budget',
          effects: [
            { type: 'add_score', dimension: 'discovery', amount: 5 },
            { type: 'add_score', dimension: 'timing', amount: 3 },
          ],
        },
        {
          id: 'd5_needs_choice_c',
          text: {
            uz: "Oila uchun Equinox yoki Tracker — keling ko'rsataman.",
            ru: 'Для семьи — Equinox или Tracker. Давайте покажу.',
          },
          nextNodeId: 'd5_objection_after_pitch',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'add_score', dimension: 'discovery', amount: -3 },
          ],
        },
      ],
    },

    // ── d5_objection_after_family (after asking about family) ──
    d5_objection_after_family: {
      id: 'd5_objection_after_family',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing_notes',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing_notes', position: 'center' },
      ],
      text: {
        uz: "Yaxshi savol berdingiz. 3 ta farzand, shaharga va qishloqqa tez-tez boramiz. Lekin... internetda yozdishgan — Chevrolet ehtiyot qismlari qimmat. Bu haqiqatmi?",
        ru: 'Хороший вопрос задали. 3 детей, часто ездим в город и за город. Но... в интернете пишут — запчасти на Chevrolet дорогие. Это правда?',
      },
      nextNodeId: 'd5_objection_choice',
    },

    // ── d5_objection_after_budget (after asking about budget) ──
    d5_objection_after_budget: {
      id: 'd5_objection_after_budget',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing_notes',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing_notes', position: 'center' },
      ],
      text: {
        uz: "Byudjet... 25 mingacha. Lekin narxdan oldin boshqa savol bor — internetda yozdishgan, Chevrolet ehtiyot qismlari qimmat va uzoq keladi. Haqiqatmi?",
        ru: 'Бюджет... до 25 тысяч. Но перед ценой другой вопрос — в интернете пишут, запчасти на Chevrolet дорогие и долго ждать. Правда?',
      },
      nextNodeId: 'd5_objection_choice',
    },

    // ── d5_objection_after_pitch (after jumping to models) ────
    d5_objection_after_pitch: {
      id: 'd5_objection_after_pitch',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing_notes',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing_notes', position: 'center' },
      ],
      text: {
        uz: "Kutib turing, modellardan oldin savol bor. Internetda yozdishgan — Chevrolet ehtiyot qismlari qimmat va uzoq keladi. Bu haqiqatmi?",
        ru: 'Подождите с моделями, сначала вопрос. В интернете пишут — запчасти на Chevrolet дорогие и долго ждать. Это правда?',
      },
      nextNodeId: 'd5_objection_choice',
    },

    // ── d5_objection_choice ───────────────────────────────────
    d5_objection_choice: {
      id: 'd5_objection_choice',
      type: 'choice',
      prompt: {
        uz: 'Qanday javob berasiz?',
        ru: 'Как ответите?',
      },
      timeLimit: 10,
      expireNodeId: 'd5_objection_expired',
      choices: [
        {
          id: 'd5_objection_choice_a',
          text: {
            uz: "To'g'ri savol. 2 yil bepul servis kiradi — bu vaqtda ehtiyot qismlar biz tomondan. Keyin ham Toshkentda rasmiy dillerlar bor.",
            ru: 'Правильный вопрос. 2 года бесплатного сервиса — запчасти за наш счёт. Потом — официальные дилеры в Ташкенте.',
          },
          nextNodeId: 'd5_sardor_reacts_service',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 15 },
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'set_flag', flag: 'honest_answer' },
          ],
        },
        {
          id: 'd5_objection_choice_b',
          text: {
            uz: "Yo'q, bu eski ma'lumot. Hozir barcha ehtiyot qismlar omborda bor.",
            ru: 'Нет, это старая информация. Сейчас все запчасти есть на складе.',
          },
          nextNodeId: 'd5_sardor_reacts_denial',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 5 },
            { type: 'add_score', dimension: 'rapport', amount: -5 },
            { type: 'set_flag', flag: 'dismissed_concern' },
          ],
        },
        {
          id: 'd5_objection_choice_c',
          text: {
            uz: "Tushunaman, bu xavotir. Lekin Chevrolet 5 yillik kafolat beradi — bu ishonchning belgisi.",
            ru: 'Понимаю, это беспокойство. Но Chevrolet даёт 5 лет гарантии — это знак надёжности.',
          },
          nextNodeId: 'd5_sardor_reacts_guarantee',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 10 },
            { type: 'add_score', dimension: 'empathy', amount: 5 },
          ],
        },
      ],
    },

    // ── d5_objection_expired ──────────────────────────────────
    d5_objection_expired: {
      id: 'd5_objection_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -10 },
        { type: 'lose_life' },
      ],
      narrator: {
        uz: 'Javob bera olmadingiz. Sardor shubha bilan qaradi.',
        ru: 'Вы не нашли ответа. Сардор посмотрел с сомнением.',
      },
      nextNodeId: 'd5_sardor_reacts_timeout',
    },

    // ── d5_sardor_reacts_service ──────────────────────────────
    d5_sardor_reacts_service: {
      id: 'd5_sardor_reacts_service',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: '2 yillik servis — bu konkret javob. Va rasmiy dillerlar ham bor. Yaxshi, ishonchli eshitildi.',
        ru: '2 года сервиса — это конкретный ответ. И официальные дилеры есть. Хорошо, звучит надёжно.',
      },
      nextNodeId: 'd5_closing',
    },

    // ── d5_sardor_reacts_denial ───────────────────────────────
    d5_sardor_reacts_denial: {
      id: 'd5_sardor_reacts_denial',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing', position: 'center' },
      ],
      text: {
        uz: 'Shunchaki "yo\'q" deyish — bu argument emas. Konkret dalillar kerak.',
        ru: 'Просто сказать "нет" — это не аргумент. Нужны конкретные доказательства.',
      },
      nextNodeId: 'd5_closing',
    },

    // ── d5_sardor_reacts_guarantee ────────────────────────────
    d5_sardor_reacts_guarantee: {
      id: 'd5_sardor_reacts_guarantee',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: '5 yillik kafolat — bu jiddiy. Demak, kompaniya o\'z mashinasiga ishonadi. Qabul qilaman.',
        ru: '5 лет гарантии — это серьёзно. Значит, компания уверена в своих машинах. Принимается.',
      },
      nextNodeId: 'd5_closing',
    },

    // ── d5_sardor_reacts_timeout ──────────────────────────────
    d5_sardor_reacts_timeout: {
      id: 'd5_sardor_reacts_timeout',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'testing',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'testing', position: 'center' },
      ],
      text: {
        uz: 'Javob yo\'q? O\'z mahsulotingizga ishonmaysizmi? Bu yaxshi belgi emas.',
        ru: 'Нет ответа? Не уверены в своём продукте? Это не лучший знак.',
      },
      nextNodeId: 'd5_closing',
    },

    // ── d5_closing ────────────────────────────────────────────
    d5_closing: {
      id: 'd5_closing',
      type: 'choice',
      prompt: {
        uz: 'Sardor ketmoqchi. Qanday yakunlaysiz?',
        ru: 'Сардор собирается уходить. Как завершите?',
      },
      timeLimit: 5,
      expireNodeId: 'd5_closing_expired',
      choices: [
        {
          id: 'd5_closing_a',
          text: {
            uz: "Test-drayvga chiqamizmi? 15 daqiqa — va siz farqni his qilasiz.",
            ru: 'Поедем на тест-драйв? 15 минут — и вы почувствуете разницу.',
          },
          nextNodeId: 'd5_reveal',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 12 },
            { type: 'add_score', dimension: 'persuasion', amount: 8 },
            { type: 'set_flag', flag: 'offered_test_drive_d5' },
          ],
        },
        {
          id: 'd5_closing_b',
          text: {
            uz: "Ma'lumotlarimni qoldiraman. O'ylab ko'ring va qo'ng'iroq qiling.",
            ru: 'Оставлю контакты. Подумайте и звоните.',
          },
          nextNodeId: 'd5_reveal',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
        },
        {
          id: 'd5_closing_c',
          text: {
            uz: "Bugun qaror qilsangiz, maxsus chegirma bo'ladi.",
            ru: 'Если решите сегодня, будет специальная скидка.',
          },
          nextNodeId: 'd5_reveal',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 3 },
            { type: 'add_score', dimension: 'empathy', amount: -5 },
            { type: 'set_flag', flag: 'pressure_close_d5' },
          ],
        },
      ],
    },

    // ── d5_closing_expired ────────────────────────────────────
    d5_closing_expired: {
      id: 'd5_closing_expired',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'timing', amount: -5 }],
      narrator: {
        uz: "Sardor o'zi chiqib ketdi. Siz yakunlay olmadingiz.",
        ru: 'Сардор ушёл сам. Вы не смогли завершить.',
      },
      nextNodeId: 'd5_reveal',
    },

    // ── d5_reveal ─────────────────────────────────────────────
    d5_reveal: {
      id: 'd5_reveal',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'revealing',
      characters: [
        { id: 'sardor', emotion: 'revealing', position: 'center' },
      ],
      text: {
        uz: 'Aslida, men sizni tekshirib keldim. Men bosh ofisdan — maxfiy xaridor.',
        ru: 'На самом деле, я пришёл проверить вас. Я из головного офиса — тайный покупатель.',
      },
      nextNodeId: 'd5_team_reaction',
    },

    // ── d5_team_reaction (team gathers) ──────────────────────
    d5_team_reaction: {
      id: 'd5_team_reaction',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'neutral',
      characters: [
        { id: 'rustam', emotion: 'neutral', position: 'left' },
        { id: 'sardor', emotion: 'revealing', position: 'center' },
        { id: 'dilnoza', emotion: 'neutral', position: 'right' },
      ],
      text: {
        uz: "Sardor janoblari... Biz sizni kutayotgan edik. Xo'sh, bizning yangi xodimimiz qanday natija ko'rsatdi?",
        ru: 'Господин Сардор... Мы вас ждали. Ну, как показал себя наш новый сотрудник?',
      },
      nextNodeId: 'd5_final_check',
    },

    // ── d5_final_check (grandmaster condition) ────────────────
    d5_final_check: {
      id: 'd5_final_check',
      type: 'condition_branch',
      branches: [
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'score_gte', value: 63 },
              { type: 'flag', flag: 'patient_approach' },
              { type: 'flag', flag: 'deep_discovery' },
              { type: 'flag', flag: 'honest_answer' },
              {
                type: 'or',
                conditions: [
                  { type: 'flag', flag: 'd1_success' },
                  { type: 'flag', flag: 'd2_success' },
                ],
              },
            ],
          },
          nextNodeId: 'd5_end_grandmaster',
        },
        {
          condition: { type: 'score_gte', value: 56 },
          nextNodeId: 'd5_end_success',
        },
        {
          condition: { type: 'score_gte', value: 30 },
          nextNodeId: 'd5_end_partial',
        },
      ],
      fallbackNodeId: 'd5_end_fail',
    },

    // ── d5_end_grandmaster ────────────────────────────────────
    d5_end_grandmaster: {
      id: 'd5_end_grandmaster',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'add_xp', amount: 500 },
        { type: 'unlock_achievement', id: 'grandmaster' },
        { type: 'gain_life' },
        { type: 'set_flag', flag: 'd5_grandmaster' },
      ],
      dialogue: {
        speaker: 'sardor',
        emotion: 'impressed',
        text: {
          uz: "Ajoyib. 5 kunda siz odatda 3 oy vaqt oladigan narsalarni o'rgandingiz. Bu — iste'dod. Lekin bilasizmi, bu faqat boshlanishi. Haqiqiy professional bo'lish uchun tizim kerak — Sales School ana shunday tizim.",
          ru: 'Отлично. За 5 дней вы освоили то, на что обычно уходит 3 месяца. Это — талант. Но знаете, это только начало. Чтобы стать настоящим профессионалом — нужна система. Sales School — это такая система.',
        },
        characters: [
          { id: 'rustam', emotion: 'proud', position: 'left' },
          { id: 'sardor', emotion: 'impressed', position: 'center' },
          { id: 'dilnoza', emotion: 'smirk', position: 'right' },
        ],
      },
    },

    // ── d5_end_success ────────────────────────────────────────
    d5_end_success: {
      id: 'd5_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 160 },
        { type: 'unlock_achievement', id: 'final_test_passed' },
        { type: 'set_flag', flag: 'd5_success' },
      ],
      dialogue: {
        speaker: 'sardor',
        emotion: 'satisfied',
        text: {
          uz: "Yaxshi natija. Siz intuitsiya bilan ishlayapsiz — bu yaxshi. Lekin top sotuvchilar intuitsiya + tizim bilan ishlaydi. O'sha tizimni o'rganmoqchimisiz?",
          ru: 'Хороший результат. Вы работаете на интуиции — это хорошо. Но топовые продавцы работают на интуиции + системе. Хотите освоить ту систему?',
        },
        characters: [
          { id: 'sardor', emotion: 'satisfied', position: 'center' },
        ],
      },
    },

    // ── d5_end_partial ────────────────────────────────────────
    d5_end_partial: {
      id: 'd5_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 90 },
        { type: 'set_flag', flag: 'd5_partial' },
      ],
      dialogue: {
        speaker: 'sardor',
        emotion: 'neutral_alt',
        text: {
          uz: "Yomon emas. Siz potensialingizni ko'rsatdingiz, lekin hali to'liq ochilmadi. Tajribali mentor va tizimli o'qish — ana shu ikkita narsani qo'shing, natija o'zgaradi.",
          ru: 'Неплохо. Вы показали потенциал, но он ещё не раскрыт полностью. Опытный наставник и системное обучение — добавьте эти два компонента, результат изменится.',
        },
        characters: [
          { id: 'sardor', emotion: 'neutral_alt', position: 'center' },
        ],
      },
    },

    // ── d5_end_fail ───────────────────────────────────────────
    d5_end_fail: {
      id: 'd5_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 50 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd5_fail' },
      ],
      dialogue: {
        speaker: 'sardor',
        emotion: 'disappointed',
        text: {
          uz: "Natija past. Lekin bu yerda bo'lganingiz allaqachon farq qiladi — ko'pchilik umuman urinib ko'rmaydi. Siz urinib ko'rdingiz, demak o'rganishga tayyor. O'sha tayyorlikni to'g'ri yo'naltirsangiz bo'ladi.",
          ru: 'Результат слабый. Но то, что вы здесь — уже отличает вас от большинства, которые вообще не пробуют. Вы попробовали — значит, готовы учиться. Эту готовность нужно направить правильно.',
        },
      },
    },
  },
};
