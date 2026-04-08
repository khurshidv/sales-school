import type { Day } from '@/game/engine/types';

export const day1: Day = {
  id: 'car-day1',
  dayNumber: 1,
  title: {
    uz: 'Birinchi mijoz',
    ru: 'Первый клиент',
  },
  rootNodeId: 'd1_intro',
  targetScore: 30,
  nextDayTeaser: {
    uz: 'Ertaga Kamola xonim keladi — u hamma narsani biladi. Tayyor bo\'ling.',
    ru: 'Завтра придёт Камола — она всё знает. Готовьтесь.',
  },
  nodes: {
    d1_intro: {
      id: 'd1_intro',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom_entrance',
      text: {
        uz: 'Ertalab. Toshkentdagi Chevrolet saloni eshiklari ochilyapti. Quyosh nuri vitrina oynalarida o\'ynayapti. Bugun — sizning birinchi ish kuningiz.',
        ru: 'Утро. Двери Chevrolet-салона в Ташкенте открываются. Солнечные лучи играют на витринных стёклах. Сегодня — ваш первый рабочий день.',
      },
      nextNodeId: 'd1_briefing',
    },

    d1_briefing: {
      id: 'd1_briefing',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'friendly',
      background: 'bg_manager_office',
      text: {
        uz: 'Xush kelibsiz! Birinchi qoidani bepul aytaman: avval tinglang. Professionallar bunga \'aktiv tinglash\' deydi — bu alohida san\'at. Keling, birinchi mijozingiz kelayotganga o\'xshaydi.',
        ru: 'Добро пожаловать! Первое правило — бесплатно: слушайте сначала. Профессионалы называют это \'активное слушание\' — это отдельное искусство. Кстати, ваш первый клиент, кажется, уже идёт.',
      },
      nextNodeId: 'd1_client_enters',
    },

    d1_client_enters: {
      id: 'd1_client_enters',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: 'Salonга yosh yigit kirdi. U atrofga qarayapti, Tracker va Equinox orasida to\'xtadi.',
        ru: 'В салон зашёл молодой мужчина. Он осматривается, остановился между Tracker и Equinox.',
      },
      nextNodeId: 'd1_approach',
    },

    d1_approach: {
      id: 'd1_approach',
      type: 'choice',
      prompt: {
        uz: 'Mijozga qanday murojaat qilasiz?',
        ru: 'Как вы подойдёте к клиенту?',
      },
      timeLimit: 15,
      expireNodeId: 'd1_approach_expired',
      choices: [
        {
          id: 'd1_approach_a',
          text: {
            uz: 'Assalomu alaykum! Chevrolet saloniga xush kelibsiz. Qanday yordam bera olaman?',
            ru: 'Здравствуйте! Добро пожаловать в Chevrolet. Чем могу помочь?',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'rapport' },
            { type: 'set_flag', flag: 'approach_warm' },
          ],
          nextNodeId: 'd1_converge_warm',
        },
        {
          id: 'd1_approach_b',
          text: {
            uz: 'Salom! Tracker yoki Equinox — qaysi biri qiziqtirdi?',
            ru: 'Привет! Tracker или Equinox — какой заинтересовал?',
          },
          effects: [
            { type: 'add_score', amount: 5, dimension: 'timing' },
            { type: 'set_flag', flag: 'approach_direct' },
          ],
          nextNodeId: 'd1_converge_direct',
        },
        {
          id: 'd1_approach_c',
          text: {
            uz: 'Assalomu alaykum! Biroz ko\'rib chiqing, savol bo\'lsa — men shu yerdaman.',
            ru: 'Здравствуйте! Посмотрите спокойно, если будут вопросы — я рядом.',
          },
          effects: [
            { type: 'add_score', amount: 12, dimension: 'empathy' },
            { type: 'set_flag', flag: 'approach_soft' },
          ],
          nextNodeId: 'd1_converge_soft',
        },
      ],
    },

    d1_approach_expired: {
      id: 'd1_approach_expired',
      type: 'score',
      effects: [{ type: 'add_score', amount: -5, dimension: 'timing' }],
      narrator: {
        uz: 'Siz ikkilandingiz va mijoz o\'zi qarab ketdi.',
        ru: 'Вы замешкались, и клиент сам продолжил осматривать.',
      },
      nextNodeId: 'd1_converge_expired',
    },

    d1_converge_warm: {
      id: 'd1_converge_warm',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'neutral',
      text: {
        uz: 'Rahmat, yaxshi kutib oldingiz. Aslida... xotinim ikkinchi farzandimizni kutyapti. Hozirgi Cobaltimiz kichik bo\'lib qoldi. Kattaroq mashina kerak.',
        ru: 'Спасибо, приятно. Вообще-то... жена ждёт второго ребёнка. Наш Cobalt стал маловат. Нужна машина побольше.',
      },
      nextNodeId: 'd1_needs',
    },

    d1_converge_direct: {
      id: 'd1_converge_direct',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'neutral',
      text: {
        uz: 'Ha, shu ikkalasiga qarayapman. Oilam uchun kattaroq mashina kerak — xotinim ikkinchi farzandimizni kutyapti. Cobaltimiz endi sig\'mayapti.',
        ru: 'Да, смотрю на эти два. Нужна машина побольше для семьи — жена ждёт второго. Cobalt уже не вмещает.',
      },
      nextNodeId: 'd1_needs',
    },

    d1_converge_soft: {
      id: 'd1_converge_soft',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'happy',
      text: {
        uz: 'Rahmat, shoshilmasdan ko\'rib chiqdim. Aslida savol bor — xotinim ikkinchi farzandimizni kutyapti, Cobaltimiz kichik bo\'lib qoldi. Oilaviy mashina kerak.',
        ru: 'Спасибо, что дали осмотреться. У меня вопрос — жена ждёт второго ребёнка, наш Cobalt стал мал. Нужна семейная машина.',
      },
      nextNodeId: 'd1_needs',
    },

    d1_converge_expired: {
      id: 'd1_converge_expired',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'neutral',
      text: {
        uz: 'Kechirasiz, siz shu yerdamisiz? Menga maslahat kerak — xotinim ikkinchi farzandimizni kutyapti, Cobaltimiz kichik bo\'lib qoldi.',
        ru: 'Извините, вы здесь работаете? Мне нужна консультация — жена ждёт второго, наш Cobalt стал маловат.',
      },
      nextNodeId: 'd1_needs',
    },

    d1_needs: {
      id: 'd1_needs',
      type: 'choice',
      prompt: {
        uz: 'Qanday savol berasiz?',
        ru: 'Какой вопрос зададите?',
      },
      choices: [
        {
          id: 'd1_needs_a',
          text: {
            uz: 'Sizga mashinada eng muhim narsa nima — xavfsizlik, joy yoki narx?',
            ru: 'Что для вас самое важное в машине — безопасность, пространство или цена?',
          },
          effects: [
            { type: 'add_score', amount: 12, dimension: 'discovery' },
            { type: 'add_score', amount: 5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'asked_priorities' },
          ],
          nextNodeId: 'd1_needs_resp_priorities',
        },
        {
          id: 'd1_needs_b',
          text: {
            uz: 'Byudjetingiz qancha atrofida?',
            ru: 'На какой бюджет рассчитываете?',
          },
          effects: [
            { type: 'add_score', amount: 3, dimension: 'discovery' },
            { type: 'set_flag', flag: 'asked_budget' },
          ],
          nextNodeId: 'd1_needs_resp_budget',
        },
        {
          id: 'd1_needs_c',
          text: {
            uz: 'Equinox — oilalar uchun eng zo\'r tanlov! Ko\'rsatay?',
            ru: 'Equinox — лучший выбор для семьи! Показать?',
          },
          effects: [
            { type: 'add_score', amount: -3, dimension: 'discovery' },
            { type: 'add_score', amount: 5, dimension: 'expertise' },
            { type: 'set_flag', flag: 'jumped_to_pitch' },
          ],
          nextNodeId: 'd1_needs_resp_pitch',
        },
      ],
    },

    d1_needs_resp_priorities: {
      id: 'd1_needs_resp_priorities',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'thoughtful',
      text: {
        uz: 'Yaxshi savol. Xavfsizlik birinchi o\'rinda — bolalar uchun airbag ko\'p bo\'lsin. Lekin narx ham muhim — Tracker 22 ming, Equinox 30 ming... Farqi katta.',
        ru: 'Хороший вопрос. Безопасность на первом месте — чтобы подушек побольше для детей. Но и цена важна — Tracker 22 тысячи, Equinox 30... Разница большая.',
      },
      nextNodeId: 'd1_suggest',
    },

    d1_needs_resp_budget: {
      id: 'd1_needs_resp_budget',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'thoughtful',
      text: {
        uz: 'Byudjet... 22-25 ming dollar atrofida. Kredit bo\'lsa ham ko\'rib chiqaman. Lekin menga narxdan ko\'ra xavfsizlik muhimroq — bolalar uchun.',
        ru: 'Бюджет... в районе 22-25 тысяч долларов. Кредит тоже рассмотрю. Но мне важнее безопасности, чем цена — ради детей.',
      },
      nextNodeId: 'd1_suggest',
    },

    d1_needs_resp_pitch: {
      id: 'd1_needs_resp_pitch',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'surprised',
      text: {
        uz: 'Kutib turing... Men hali qaror qilganim yo\'q. Avval nimalar borligini bilishim kerak. Narxlar qanday? Xavfsizlik bo\'yicha farq bormi?',
        ru: 'Подождите... Я ещё не решил. Сначала хочу понять, что есть. Какие цены? Есть разница по безопасности?',
      },
      nextNodeId: 'd1_suggest',
    },

    d1_suggest: {
      id: 'd1_suggest',
      type: 'choice',
      prompt: {
        uz: 'Qaysi mashinani tavsiya qilasiz?',
        ru: 'Какую машину порекомендуете?',
      },
      choices: [
        {
          id: 'd1_suggest_a',
          text: {
            uz: 'Equinox — 6 ta airbag, 7 o\'rindiq. Bolalar xavfsizligi uchun eng yaxshi. Narxi ko\'proq, lekin oilangiz uchun sarmoya.',
            ru: 'Equinox — 6 подушек, 7 мест. Лучший для безопасности детей. Дороже, но это инвестиция в семью.',
          },
          effects: [
            { type: 'add_score', amount: 12, dimension: 'persuasion' },
            { type: 'add_score', amount: 5, dimension: 'expertise' },
            { type: 'set_flag', flag: 'suggested_equinox' },
          ],
          nextNodeId: 'd1_result_equinox',
        },
        {
          id: 'd1_suggest_b',
          text: {
            uz: 'Tracker ham yomon emas — 4 ta airbag bor, va 8 ming arzon. Bo\'lib to\'lash ham bor.',
            ru: 'Tracker тоже неплох — 4 подушки есть, и на 8 тысяч дешевле. Есть рассрочка.',
          },
          effects: [
            { type: 'add_score', amount: 8, dimension: 'empathy' },
            { type: 'add_score', amount: 5, dimension: 'persuasion' },
            { type: 'set_flag', flag: 'suggested_tracker' },
          ],
          nextNodeId: 'd1_result_tracker',
        },
        {
          id: 'd1_suggest_c',
          text: {
            uz: 'Ikkalasini solishtiramizmi? Hozir xususiyatlarini yonma-yon ko\'rsataman.',
            ru: 'Давайте сравним оба? Сейчас покажу характеристики рядом.',
          },
          effects: [
            { type: 'add_score', amount: 10, dimension: 'expertise' },
            { type: 'add_score', amount: 3, dimension: 'discovery' },
            { type: 'set_flag', flag: 'compared_models' },
          ],
          nextNodeId: 'd1_result_compare',
        },
      ],
    },

    d1_result_equinox: {
      id: 'd1_result_equinox',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'interested',
      text: {
        uz: '6 ta airbag — bu jiddiy. Narxi qimmatroq, lekin bolalar xavfsizligi uchun... Bo\'lib to\'lash shartlari qanday? Xotinimga ham ko\'rsatishim kerak.',
        ru: '6 подушек — это серьёзно. Дороже, конечно, но ради безопасности детей... А какие условия рассрочки? Жене тоже надо показать.',
      },
      nextNodeId: 'd1_check',
    },

    d1_result_tracker: {
      id: 'd1_result_tracker',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'thoughtful',
      text: {
        uz: 'Tracker arzonroq, bu yaxshi. Lekin 4 ta airbag yetarlimi oila uchun? Equinox bilan solishtirib ko\'rsangiz... Vizitkangiz bormi? Xotinimga ham maslahat qilishim kerak.',
        ru: 'Tracker дешевле, это хорошо. Но 4 подушки — достаточно для семьи? Может, сравните с Equinox... Есть визитка? Надо с женой посоветоваться.',
      },
      nextNodeId: 'd1_check',
    },

    d1_result_compare: {
      id: 'd1_result_compare',
      type: 'dialogue',
      speaker: 'bobur',
      emotion: 'happy',
      text: {
        uz: 'Ana bu yaxshi yondashuv! Solishtirib ko\'rsak, aniqroq bo\'ladi. Xotinimga ham shu solishtirishni ko\'rsataman. Vizitkangiz bormi?',
        ru: 'Вот это правильный подход! Сравнение — это наглядно. Покажу жене. Есть ваша визитка?',
      },
      nextNodeId: 'd1_check',
    },

    d1_check: {
      id: 'd1_check',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'score_gte', value: 25 },
          nextNodeId: 'd1_end_success',
        },
        {
          condition: { type: 'score_gte', value: 12 },
          nextNodeId: 'd1_end_partial',
        },
      ],
      fallbackNodeId: 'd1_end_fail',
    },

    d1_end_success: {
      id: 'd1_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 100 },
        { type: 'unlock_achievement', id: 'first_contact' },
        { type: 'set_flag', flag: 'd1_success' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'proud',
        text: {
          uz: 'Ajoyib! Siz hozirgina \'ehtiyojlarni aniqlash\' texnikasini sezdingizmi? Yaxshi sotuvchilar buni ataylab, tizimli qiladi. Dilnoza shu sababli oyiga 15 million oladi.',
          ru: 'Отлично! Вы только что применили технику \'выявление потребностей\' — почувствовали? Хорошие продавцы делают это намеренно, системно. Именно поэтому Дильноза зарабатывает 15 миллионов в месяц.',
        },
      },
    },

    d1_end_partial: {
      id: 'd1_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 65 },
        { type: 'set_flag', flag: 'd1_partial' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'serious',
        text: {
          uz: 'Yomon emas. Lekin professional sotuvchi savollarni tasodifan emas, tizim bilan beradi — SPIN texnikasi deyiladi. Shuning uchun yaxshi sotuvchilar o\'rtacha ish haqi 2-3 baravar ko\'p oladi.',
          ru: 'Неплохо. Но профессиональный продавец задаёт вопросы не случайно, а по системе — это называется техника SPIN. Именно поэтому хорошие продавцы зарабатывают в 2-3 раза больше среднего.',
        },
      },
    },

    d1_end_fail: {
      id: 'd1_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 30 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd1_fail' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'disappointed',
        text: {
          uz: 'Hech gap yo\'q. Bilasizmi, men ham birinchi yilda shunday xato qilganman. Farq shundaki — men o\'sha xatolardan tizimli o\'rgandim. Ana shunday tizim bor, o\'rgatadigan.',
          ru: 'Ничего. Знаете, я в первый год делал те же ошибки. Разница в том — я учился на них системно. Есть такая система, которой учат.',
        },
      },
    },
  },
};
