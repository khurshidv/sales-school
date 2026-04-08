import type { Day } from '@/game/engine/types';

export const day1: Day = {
  id: 'car-day1',
  dayNumber: 1,
  title: {
    uz: 'Birinchi kun',
    ru: 'Первый день',
  },
  rootNodeId: 'd1_day_intro',
  targetScore: 40,
  nextDayTeaser: {
    uz: 'Ertaga Kamola xonim keladi — hamma narsani biladi...',
    ru: 'Завтра придёт Камола — она всё знает...',
  },
  nodes: {
    // ============================================================
    // PROLOGUE: Meeting Colleagues
    // ============================================================

    d1_day_intro: {
      id: 'd1_day_intro',
      type: 'day_intro',
      background: 'bg_showroom_entrance_exterior',
      title: {
        uz: '1-kun: Yangi boshlanish',
        ru: 'День 1: Новое начало',
      },
      subtitle: {
        uz: 'Toshkent, Chevrolet saloni',
        ru: 'Ташкент, салон Chevrolet',
      },
      nextNodeId: 'd1_morning',
    },

    d1_morning: {
      id: 'd1_morning',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom_entrance_exterior',
      text: {
        uz: 'Ertalab, Toshkent. Quyosh endigina ko\'tarilibdi. Bugun sizning Chevrolet salonidagi birinchi ish kuningiz. Yurak tez urayapti.',
        ru: 'Утро, Ташкент. Солнце только поднимается. Сегодня ваш первый рабочий день в салоне Chevrolet. Сердце бьётся быстрее.',
      },
      nextNodeId: 'd1_meet_rustam',
    },

    d1_meet_rustam: {
      id: 'd1_meet_rustam',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'friendly',
      background: 'bg_manager_office',
      characters: [
        { id: 'rustam', emotion: 'friendly', position: 'center' },
      ],
      text: {
        uz: 'Xush kelibsiz! Men Rustam, salonning bosh menejeri. Asosiy qoida: avval tinglang, keyin gapiring.',
        ru: 'Добро пожаловать! Я Рустам, главный менеджер салона. Главное правило: сначала слушай, потом говори.',
      },
      nextNodeId: 'd1_rustam_tip',
    },

    d1_rustam_tip: {
      id: 'd1_rustam_tip',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: 'Bugun bir juftlik keladi. Ikkalasini ham tinglang — bu juda muhim.',
        ru: 'Сегодня придёт пара. Слушай обоих — это очень важно.',
      },
      nextNodeId: 'd1_meet_dilnoza',
    },

    d1_meet_dilnoza: {
      id: 'd1_meet_dilnoza',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'smirk',
      background: 'bg_showroom',
      characters: [
        { id: 'dilnoza', emotion: 'smirk', position: 'center' },
      ],
      text: {
        uz: '2 yil oldin men ham xuddi siz kabi boshlaganman. Hozir oyiga 15 million ishlayman. Hammasi mumkin.',
        ru: '2 года назад я была такой же, как ты. Сейчас зарабатываю 15 миллионов в месяц. Всё возможно.',
      },
      nextNodeId: 'd1_dilnoza_tip',
    },

    d1_dilnoza_tip: {
      id: 'd1_dilnoza_tip',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'smirk',
      characters: [
        { id: 'dilnoza', emotion: 'smirk', position: 'center' },
      ],
      effects: [{ type: 'set_flag', flag: 'met_dilnoza' }],
      text: {
        uz: 'Sir aytaymi? Juftliklar kelganda — ikkalasini bog\'laydigan narsani toping.',
        ru: 'Секрет? Когда приходит пара — найди то, что связывает обоих.',
      },
      nextNodeId: 'd1_meet_anvar',
    },

    d1_meet_anvar: {
      id: 'd1_meet_anvar',
      type: 'dialogue',
      speaker: 'anvar',
      emotion: 'nervous',
      background: 'bg_showroom',
      characters: [
        { id: 'anvar', emotion: 'nervous', position: 'center' },
      ],
      text: {
        uz: 'Salom! Men Anvar, men ham yangi boshladim. Mana bugungi uchrashuvlar ro\'yxati.',
        ru: 'Привет! Я Анвар, тоже недавно начал. Вот список сегодняшних встреч.',
      },
      nextNodeId: 'd1_anvar_info',
    },

    d1_anvar_info: {
      id: 'd1_anvar_info',
      type: 'dialogue',
      speaker: 'anvar',
      emotion: 'nervous',
      characters: [
        { id: 'anvar', emotion: 'nervous', position: 'center' },
      ],
      effects: [{ type: 'set_flag', flag: 'met_anvar' }],
      text: {
        uz: 'Yosh juftlik keladi. Er — sportni yaxshi ko\'radi, tezlikka o\'ch. Xotini esa — bolalar uchun keng joy kerak deydi.',
        ru: 'Придёт молодая пара. Муж любит спорт и скорость. А жена говорит — нужно просторное для детей.',
      },
      nextNodeId: 'd1_couple_enters',
    },

    // ============================================================
    // MAIN: Couple Enters
    // ============================================================

    d1_couple_enters: {
      id: 'd1_couple_enters',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: 'Eshik ochildi. Yosh juftlik kirdi. Er darhol Tracker tomon yurdi. Xotini esa Equinox oldida to\'xtadi.',
        ru: 'Дверь открылась. Вошла молодая пара. Муж сразу пошёл к Tracker. Жена остановилась у Equinox.',
      },
      nextNodeId: 'd1_who_first',
    },

    d1_who_first: {
      id: 'd1_who_first',
      type: 'choice',
      prompt: {
        uz: 'Kimga birinchi yondashasiz?',
        ru: 'К кому подойдёте первым?',
      },
      choices: [
        {
          id: 'd1_who_first_a',
          text: {
            uz: 'Ikkalasini birga kutib olaman: "Assalomu alaykum! Xush kelibsiz, birga ko\'raylikmi?"',
            ru: 'Приветствую обоих вместе: "Здравствуйте! Добро пожаловать, давайте вместе посмотрим?"',
          },
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 15 },
            { type: 'add_score', dimension: 'empathy', amount: 5 },
            { type: 'set_flag', flag: 'addressed_both' },
          ],
          nextNodeId: 'd1_conflict_both',
        },
        {
          id: 'd1_who_first_b',
          text: {
            uz: 'Er tomon boraman — Tracker oldiga: "Salom! Trackerga qarayapsizmi?"',
            ru: 'Подхожу к мужу — к Tracker: "Привет! Смотрите Tracker?"',
          },
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'set_flag', flag: 'approached_javlon' },
          ],
          nextNodeId: 'd1_conflict_tracker',
        },
        {
          id: 'd1_who_first_c',
          text: {
            uz: 'Xotini tomon boraman — Equinox oldiga: "Salom! Equinox yoqdimi?"',
            ru: 'Подхожу к жене — к Equinox: "Здравствуйте! Нравится Equinox?"',
          },
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'approached_nilufar' },
          ],
          nextNodeId: 'd1_conflict_equinox',
        },
      ],
    },

    // --- Branch: Addressed Both ---

    d1_conflict_both: {
      id: 'd1_conflict_both',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Ha, birga ko\'raylik. Lekin men Tracker xohlayman. Tez, kuchli, sport rejim bor.',
        ru: 'Ладно, давайте вместе. Но я хочу Tracker. Быстрый, мощный, есть спорт-режим.',
      },
      nextNodeId: 'd1_conflict_both_nilufar',
    },

    d1_conflict_both_nilufar: {
      id: 'd1_conflict_both_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'worried',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Bolalarga joy kerak! Tracker tor. Lekin birga ko\'rsak — yaxshi.',
        ru: 'Детям нужно место! Tracker тесный. Но вместе посмотрим — это хорошо.',
      },
      nextNodeId: 'd1_compromise',
    },

    // --- Branch: Approached Javlon (Tracker) ---

    d1_conflict_tracker: {
      id: 'd1_conflict_tracker',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'touched',
      background: 'bg_showroom',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Ha! Tracker — zo\'r mashina! 174 ot kuchi, sport rejim. Bu menga yoqadi!',
        ru: 'Да! Tracker — отличная машина! 174 лошадки, спорт-режим. Мне нравится!',
      },
      nextNodeId: 'd1_conflict_tracker_nilufar',
    },

    d1_conflict_tracker_nilufar: {
      id: 'd1_conflict_tracker_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'worried',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Javlon, yana sport mashina? Bolalarimiz qaerda o\'tiradi? Menga ham fikrimni so\'rashingizni istayman.',
        ru: 'Жавлон, опять спортивная? А дети где сядут? Мне тоже хочется, чтобы спросили моё мнение.',
      },
      nextNodeId: 'd1_compromise',
    },

    // --- Branch: Approached Nilufar (Equinox) ---

    d1_conflict_equinox: {
      id: 'd1_conflict_equinox',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'happy',
      background: 'bg_showroom',
      characters: [
        { id: 'javlon', emotion: 'stubborn', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Equinox juda keng! Bolalar uchun joy ko\'p. Xavfsizlik ham yuqori. Menga yoqdi.',
        ru: 'Equinox такой просторный! Много места для детей. И безопасность высокая. Мне нравится.',
      },
      nextNodeId: 'd1_conflict_equinox_javlon',
    },

    d1_conflict_equinox_javlon: {
      id: 'd1_conflict_equinox_javlon',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'stubborn',
      characters: [
        { id: 'javlon', emotion: 'stubborn', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Hey, men ham bormisanmi? Equinox sekin, og\'ir. Men Tracker xohlayman — tezlik kerak.',
        ru: 'Эй, а я тут есть? Equinox медленный, тяжёлый. Я хочу Tracker — мне нужна скорость.',
      },
      nextNodeId: 'd1_compromise',
    },

    // --- Compromise Choice (converge point) ---

    d1_compromise: {
      id: 'd1_compromise',
      type: 'choice',
      prompt: {
        uz: 'Ikkalasining fikri har xil. Nima deysiz?',
        ru: 'У обоих разные мнения. Что скажете?',
      },
      timeLimit: 10,
      expireNodeId: 'd1_compromise_expired',
      choices: [
        {
          id: 'd1_compromise_a',
          text: {
            uz: 'Ikkalangizning fikringiz to\'g\'ri. Tracker — har kungi yurish uchun. Equinox — oila uchun. Hozir nima muhimroq?',
            ru: 'Вы оба правы. Tracker — для ежедневных поездок. Equinox — для семьи. Что сейчас важнее?',
          },
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 15 },
            { type: 'add_score', dimension: 'persuasion', amount: 10 },
            { type: 'set_flag', flag: 'balanced_both' },
          ],
          nextNodeId: 'd1_compromise_balanced',
        },
        {
          id: 'd1_compromise_b',
          text: {
            uz: 'Equinoxda ham sport rejim bor — tezlik HAM joy. Ikkalasi bittada.',
            ru: 'У Equinox тоже есть спорт-режим — скорость И пространство. Два в одном.',
          },
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 12 },
            { type: 'add_score', dimension: 'persuasion', amount: 5 },
          ],
          nextNodeId: 'd1_compromise_sport',
        },
        {
          id: 'd1_compromise_c',
          text: {
            uz: 'Hozir Tracker oling, keyinroq trade-in bilan Equinoxga almashtirasiz.',
            ru: 'Берите сейчас Tracker, потом по trade-in обменяете на Equinox.',
          },
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'add_score', dimension: 'opportunity', amount: 5 },
          ],
          nextNodeId: 'd1_compromise_tradein',
        },
      ],
    },

    d1_compromise_expired: {
      id: 'd1_compromise_expired',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'timing', amount: -5 }],
      narrator: {
        uz: 'Siz ikkilandingiz. Javlon bilan Nilufar bir-biriga qarab, noqulay jimlik cho\'kdi.',
        ru: 'Вы замешкались. Жавлон и Нилуфар переглянулись, повисла неловкая тишина.',
      },
      nextNodeId: 'd1_test_drive_offer',
    },

    // --- Compromise Reactions ---

    d1_compromise_balanced: {
      id: 'd1_compromise_balanced',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'thinking',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Hmm... to\'g\'ri aytasiz. Hozir oila muhimroq. Lekin Tracker ham yoqadi...',
        ru: 'Хм... вы правы. Сейчас семья важнее. Но Tracker тоже нравится...',
      },
      nextNodeId: 'd1_compromise_balanced_nilufar',
    },

    d1_compromise_balanced_nilufar: {
      id: 'd1_compromise_balanced_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'happy',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Rahmat, ikkalamizni ham tingladingiz. Bu muhim. Equinoxni birga ko\'raylikmi?',
        ru: 'Спасибо, что выслушали обоих. Это важно. Давайте вместе посмотрим Equinox?',
      },
      nextNodeId: 'd1_test_drive_offer',
    },

    d1_compromise_sport: {
      id: 'd1_compromise_sport',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'thinking',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Sport rejim bormi? Qiziq... Tezligi qancha chiqadi?',
        ru: 'Спорт-режим есть? Интересно... Какую скорость набирает?',
      },
      nextNodeId: 'd1_compromise_sport_nilufar',
    },

    d1_compromise_sport_nilufar: {
      id: 'd1_compromise_sport_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'thoughtful',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Agar ikkalasi ham bo\'lsa — yaxshi. Lekin avval bolalar o\'rindiqlarini ko\'raman.',
        ru: 'Если есть и то, и другое — хорошо. Но сначала посмотрю детские кресла.',
      },
      nextNodeId: 'd1_test_drive_offer',
    },

    d1_compromise_tradein: {
      id: 'd1_compromise_tradein',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'touched',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Trade-in — bu variant! Hozir Tracker, keyin Equinox. Yoqdi menga!',
        ru: 'Trade-in — это вариант! Сейчас Tracker, потом Equinox. Мне нравится!',
      },
      nextNodeId: 'd1_compromise_tradein_nilufar',
    },

    d1_compromise_tradein_nilufar: {
      id: 'd1_compromise_tradein_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'worried',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Lekin bolalar hozir kerak... Almashguncha nima qilamiz?',
        ru: 'Но дети уже сейчас... Что будем делать, пока не обменяем?',
      },
      nextNodeId: 'd1_test_drive_offer',
    },

    // ============================================================
    // TEST DRIVE
    // ============================================================

    d1_test_drive_offer: {
      id: 'd1_test_drive_offer',
      type: 'choice',
      prompt: {
        uz: 'Nima qilasiz?',
        ru: 'Что предложите?',
      },
      choices: [
        {
          id: 'd1_test_drive_offer_a',
          text: {
            uz: 'Keling, hamma birga test-drayvga chiqaylik! Yo\'lda ko\'rasiz.',
            ru: 'Давайте все вместе на тест-драйв! На дороге сами почувствуете.',
          },
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 5 },
            { type: 'set_flag', flag: 'offered_test_drive' },
          ],
          nextNodeId: 'd1_test_drive',
        },
        {
          id: 'd1_test_drive_offer_b',
          text: {
            uz: 'Keling, hisob-kitobni gaplashaylik.',
            ru: 'Давайте обсудим условия.',
          },
          effects: [],
          nextNodeId: 'd1_anniversary_check',
        },
      ],
    },

    d1_test_drive: {
      id: 'd1_test_drive',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_city_street_tashkent',
      text: {
        uz: 'Toshkent ko\'chalari. Mashina yo\'lga chiqdi. Oyna tushirilgan, shabada esyapti. Javlon rulda, Nilufar orqa o\'rindiqda.',
        ru: 'Улицы Ташкента. Машина выехала на дорогу. Окна опущены, дует ветерок. Жавлон за рулём, Нилуфар на заднем сиденье.',
      },
      nextNodeId: 'd1_test_drive_javlon',
    },

    d1_test_drive_javlon: {
      id: 'd1_test_drive_javlon',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'touched',
      background: 'bg_city_street_tashkent',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Voy! Tezlashishi yaxshi ekan. Yo\'lni yaxshi ushlaydi. Yoqyapti!',
        ru: 'Ого! Разгон хороший. Дорогу держит отлично. Нравится!',
      },
      nextNodeId: 'd1_test_drive_nilufar',
    },

    d1_test_drive_nilufar: {
      id: 'd1_test_drive_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'happy',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Orqa o\'rindiq keng ekan! Bolalar kreslosi sig\'adi. Va juda tinch — shovqin kam.',
        ru: 'Сзади просторно! Детское кресло поместится. И очень тихо — мало шума.',
      },
      nextNodeId: 'd1_test_drive_choice',
    },

    d1_test_drive_choice: {
      id: 'd1_test_drive_choice',
      type: 'choice',
      prompt: {
        uz: 'Haydash davomida nima deysiz?',
        ru: 'Что скажете во время поездки?',
      },
      choices: [
        {
          id: 'd1_test_drive_choice_a',
          text: {
            uz: 'Xavfsizlik tizimlari haqida gapirib beraman — bolalar uchun muhim.',
            ru: 'Расскажу про системы безопасности — важно для детей.',
          },
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 8 },
          ],
          nextNodeId: 'd1_test_drive_safety',
        },
        {
          id: 'd1_test_drive_choice_b',
          text: {
            uz: 'Qayta sotish narxi haqida aytaman — bu mashinaning qiymati tushmaydi.',
            ru: 'Расскажу о стоимости перепродажи — эта машина не теряет в цене.',
          },
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
          ],
          nextNodeId: 'd1_test_drive_value',
        },
        {
          id: 'd1_test_drive_choice_c',
          text: {
            uz: 'Hech narsa demayman — o\'zlari his qilsin.',
            ru: 'Промолчу — пусть сами прочувствуют.',
          },
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 10 },
          ],
          nextNodeId: 'd1_test_drive_silent',
        },
      ],
    },

    d1_test_drive_safety: {
      id: 'd1_test_drive_safety',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'happy',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: '6 ta airbag va bolalar qulfi? Bu menga juda muhim. Rahmat aytganingiz uchun.',
        ru: '6 подушек и детский замок? Это для меня очень важно. Спасибо, что рассказали.',
      },
      nextNodeId: 'd1_anniversary_check',
    },

    d1_test_drive_value: {
      id: 'd1_test_drive_value',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'thinking',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Qiymati tushmaslik — bu yaxshi. Demak, investitsiya ham bo\'ladi.',
        ru: 'Не теряет в цене — это хорошо. Значит, и инвестиция тоже.',
      },
      nextNodeId: 'd1_anniversary_check',
    },

    d1_test_drive_silent: {
      id: 'd1_test_drive_silent',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'touched',
      background: 'bg_city_street_tashkent',
      characters: [
        { id: 'javlon', emotion: 'touched', position: 'left' },
        { id: 'nilufar', emotion: 'happy', position: 'right' },
      ],
      text: {
        uz: 'Biliysizmi... Tinchgina haydash — eng yaxshi taklif. O\'zimiz his qilyapmiz.',
        ru: 'Знаете... Спокойная поездка — лучшая презентация. Мы сами всё чувствуем.',
      },
      nextNodeId: 'd1_anniversary_check',
    },

    // ============================================================
    // ANNIVERSARY HINT (conditional)
    // ============================================================

    d1_anniversary_check: {
      id: 'd1_anniversary_check',
      type: 'condition_branch',
      branches: [
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'flag', flag: 'addressed_both' },
              { type: 'flag', flag: 'balanced_both' },
            ],
          },
          nextNodeId: 'd1_anniversary_hint',
        },
      ],
      fallbackNodeId: 'd1_closing',
    },

    d1_anniversary_hint: {
      id: 'd1_anniversary_hint',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'caring',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'caring', position: 'right' },
      ],
      text: {
        uz: 'Aytganday... Kelasi hafta bizning 5 yillik to\'y kunimiz.',
        ru: 'Кстати... На следующей неделе у нас 5-я годовщина свадьбы.',
      },
      effects: [{ type: 'set_flag', flag: 'knows_anniversary' }],
      nextNodeId: 'd1_closing',
    },

    // ============================================================
    // CLOSING
    // ============================================================

    d1_closing: {
      id: 'd1_closing',
      type: 'choice',
      prompt: {
        uz: 'Yakuniy taklif nima bo\'ladi?',
        ru: 'Какое финальное предложение сделаете?',
      },
      choices: [
        {
          id: 'd1_closing_a',
          text: {
            uz: 'Ikkalangiz birga yana test-drayvga keling. Qaror qilish osonroq bo\'ladi.',
            ru: 'Приходите вдвоём ещё раз на тест-драйв. Так легче решить.',
          },
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 10 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
          nextNodeId: 'd1_check',
        },
        {
          id: 'd1_closing_b',
          text: {
            uz: '5 yillik to\'yga sovg\'a — Equinox, lenta bilan! Oila bayrami!',
            ru: 'Подарок на 5-летие — Equinox с бантом! Семейный праздник!',
          },
          condition: { type: 'flag', flag: 'knows_anniversary' },
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 20 },
            { type: 'add_score', dimension: 'empathy', amount: 10 },
            { type: 'set_flag', flag: 'anniversary_surprise' },
          ],
          nextNodeId: 'd1_check',
        },
        {
          id: 'd1_closing_c',
          text: {
            uz: 'Shu hafta oxirigacha maxsus narx bor. O\'ylab ko\'ring.',
            ru: 'До конца недели специальная цена. Подумайте.',
          },
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 5 },
          ],
          nextNodeId: 'd1_check',
        },
      ],
    },

    // ============================================================
    // ENDINGS
    // ============================================================

    d1_check: {
      id: 'd1_check',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'anniversary_surprise' },
          nextNodeId: 'd1_end_hidden',
        },
        {
          condition: { type: 'score_gte', value: 32 },
          nextNodeId: 'd1_end_success',
        },
        {
          condition: { type: 'score_gte', value: 18 },
          nextNodeId: 'd1_end_partial',
        },
      ],
      fallbackNodeId: 'd1_end_fail',
    },

    d1_end_hidden: {
      id: 'd1_end_hidden',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'add_xp', amount: 180 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'love_sells' },
        { type: 'set_flag', flag: 'd1_hidden' },
        { type: 'set_flag', flag: 'd1_success' },
      ],
      dialogue: {
        speaker: 'javlon',
        emotion: 'touched',
        text: {
          uz: 'Voy... ajoyib fikr! Nilufar yig\'lab yuboradi. Olamiz! Equinox — bizniki!',
          ru: 'Ого... потрясающая идея! Нилуфар расплачется. Берём! Equinox — наш!',
        },
        characters: [
          { id: 'javlon', emotion: 'touched', position: 'left' },
          { id: 'nilufar', emotion: 'happy', position: 'right' },
        ],
      },
    },

    d1_end_success: {
      id: 'd1_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 120 },
        { type: 'set_flag', flag: 'd1_success' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'proud',
        text: {
          uz: 'Juftliklar bilan ishlash qiyin. Lekin siz ikkalasini ham tingladingiz. Ajoyib ish!',
          ru: 'Работать с парами сложно. Но вы выслушали обоих. Отличная работа!',
        },
        characters: [
          { id: 'rustam', emotion: 'proud', position: 'center' },
        ],
      },
    },

    d1_end_partial: {
      id: 'd1_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 75 },
        { type: 'set_flag', flag: 'd1_partial' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'serious',
        text: {
          uz: 'Yomon emas. Lekin bir tomonga og\'ib ketdingiz. Ikkalasini teng tinglang.',
          ru: 'Неплохо. Но вы склонились к одной стороне. Слушайте обоих одинаково.',
        },
        characters: [
          { id: 'rustam', emotion: 'serious', position: 'center' },
        ],
      },
    },

    d1_end_fail: {
      id: 'd1_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 40 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd1_fail' },
      ],
      dialogue: {
        speaker: 'dilnoza',
        emotion: 'explaining',
        text: {
          uz: 'Juftliklar — eng qiyin mijozlar. Sir: ikkalasi ham xohlagan narsani toping.',
          ru: 'Пары — самые сложные клиенты. Секрет: найди то, чего хотят оба.',
        },
        characters: [
          { id: 'dilnoza', emotion: 'explaining', position: 'center' },
        ],
      },
    },
  },
};
