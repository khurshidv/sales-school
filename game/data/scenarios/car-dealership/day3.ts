import type { Day } from '@/game/engine/types';

export const day3: Day = {
  id: 'car-day3',
  dayNumber: 3,
  title: {
    uz: 'VIP va sirli mijoz',
    ru: 'VIP и тайный покупатель',
  },
  rootNodeId: 'd3_day_intro',
  targetScore: 60,
  nodes: {
    // ════════════════════════════════════════════════════════════
    // PART A: VIP CLIENT ABDULLAEV
    // ════════════════════════════════════════════════════════════

    // ── Day Intro (Ken Burns) ────────────────────────────────
    d3_day_intro: {
      id: 'd3_day_intro',
      type: 'day_intro',
      background: 'bg_showroom',
      title: {
        uz: 'VIP va sirli mijoz',
        ru: 'VIP и тайный покупатель',
      },
      nextNodeId: 'd3_intro',
    },

    // ── Morning Briefing ─────────────────────────────────────
    d3_intro: {
      id: 'd3_intro',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_manager_office',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "Bugun maxsus kun. Qurilish kompaniyasi direktori keladi. Katta mijoz.",
        ru: 'Сегодня особенный день. Приедет директор строительной компании. Крупный клиент.',
      },
      nextNodeId: 'd3_intro2',
    },

    d3_intro2: {
      id: 'd3_intro2',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_manager_office',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "Yaxshi tayyorlaning. Uning bo'sh gaplarga vaqti yo'q.",
        ru: 'Подготовьтесь как следует. У него нет времени на пустые разговоры.',
      },
      nextNodeId: 'd3_preparation',
    },

    // ── Preparation (multiSelect 2 of 3) ─────────────────────
    d3_preparation: {
      id: 'd3_preparation',
      type: 'choice',
      prompt: {
        uz: 'Tayyorgarlik: 2 ta tanlang',
        ru: 'Подготовка: выберите 2',
      },
      multiSelect: { count: 2 },
      choices: [
        {
          id: 'd3_prep_a',
          text: {
            uz: "Uning kompaniyasini internetdan o'rganish",
            ru: 'Изучить его компанию в интернете',
          },
          nextNodeId: 'd3_anvar_check',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'researched_company' },
          ],
        },
        {
          id: 'd3_prep_b',
          text: {
            uz: "Rustamdan VIP protokolini so'rash",
            ru: 'Спросить у Рустама о VIP-протоколе',
          },
          nextNodeId: 'd3_anvar_check',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'knows_vip_protocol' },
          ],
        },
        {
          id: 'd3_prep_c',
          text: {
            uz: "Moliya bo'limidan fleet chegirma limitini bilish",
            ru: 'Уточнить лимиты корпоративных скидок у финансистов',
          },
          nextNodeId: 'd3_anvar_check',
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 8 },
            { type: 'set_flag', flag: 'has_discount_authority' },
          ],
        },
      ],
    },

    // ── Anvar Check ──────────────────────────────────────────
    d3_anvar_check: {
      id: 'd3_anvar_check',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'researched_company' },
          nextNodeId: 'd3_anvar_info',
        },
      ],
      fallbackNodeId: 'd3_abdullaev_arrives',
    },

    d3_anvar_info: {
      id: 'd3_anvar_info',
      type: 'dialogue',
      speaker: 'anvar',
      emotion: 'eager',
      background: 'bg_manager_office',
      characters: [
        { id: 'anvar', emotion: 'eager', position: 'center' },
      ],
      text: {
        uz: "Bitta narsa topdim — uning kompaniyasi o'tgan yili 12 ta Cobalt sotib olgan! Katta mijoz.",
        ru: 'Кое-что нашёл — его компания в прошлом году купила 12 Cobalt! Крупный клиент.',
      },
      nextNodeId: 'd3_abdullaev_arrives',
    },

    // ── Abdullaev Arrives (MAIN ENTRANCE) ────────────────────
    d3_abdullaev_arrives: {
      id: 'd3_abdullaev_arrives',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom_entrance_exterior',
      text: {
        uz: "Qora mashina kelib to'xtadi. Ishonchli yurgan kishi salonga kirdi.",
        ru: 'Подъехала чёрная машина. Уверенный мужчина вошёл в салон.',
      },
      nextNodeId: 'd3_abdullaev_enters',
    },

    d3_abdullaev_enters: {
      id: 'd3_abdullaev_enters',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impatient',
      background: 'bg_showroom_entrance_exterior',
      characters: [
        { id: 'abdullaev', emotion: 'impatient', position: 'center' },
      ],
      text: {
        uz: "Salom. Vaqtim kam. Menejerlar uchun 3 ta Malibu. Xotinimga Tahoe. Taklifingiz nima?",
        ru: 'Здравствуйте. Времени мало. 3 Malibu для менеджеров. Tahoe для жены. Что предложите?',
      },
      nextNodeId: 'd3_greeting',
    },

    // ── Greeting Choice ──────────────────────────────────────
    d3_greeting: {
      id: 'd3_greeting',
      type: 'choice',
      prompt: {
        uz: 'Qanday kutib olasiz?',
        ru: 'Как встретите?',
      },
      choices: [
        {
          id: 'd3_greeting_a',
          text: {
            uz: "Janob Abdullaev, xush kelibsiz. VIP zalga marhamat — choy va taqdimot tayyor.",
            ru: 'Господин Абдуллаев, добро пожаловать. Пройдёмте в VIP-зал — чай и презентация готовы.',
          },
          nextNodeId: 'd3_walk_to_vip',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 15 },
            { type: 'add_score', dimension: 'timing', amount: 5 },
            { type: 'set_flag', flag: 'vip_greeting' },
          ],
          condition: { type: 'flag', flag: 'knows_vip_protocol' },
        },
        {
          id: 'd3_greeting_b',
          text: {
            uz: "Xush kelibsiz! Malibu ko'rsatay.",
            ru: 'Добро пожаловать! Давайте покажу Malibu.',
          },
          nextNodeId: 'd3_abdullaev_reacts_direct',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
          ],
        },
        {
          id: 'd3_greeting_c',
          text: {
            uz: "Salom! Kompaniyangiz kengayayotganini o'qidim — tabriklayman! Bizda maxsus fleet shartlar bor.",
            ru: 'Здравствуйте! Читал, что ваша компания расширяется — поздравляю! У нас есть специальные корпоративные условия.',
          },
          nextNodeId: 'd3_abdullaev_reacts_research',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 12 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
            { type: 'set_flag', flag: 'showed_research' },
          ],
          condition: { type: 'flag', flag: 'researched_company' },
        },
      ],
    },

    // ── VIP Lounge Transition ────────────────────────────────
    d3_walk_to_vip: {
      id: 'd3_walk_to_vip',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_vip_lounge_hallway',
      text: {
        uz: "Siz birga premium yo'lakdan VIP zalga yo'l olasiz.",
        ru: 'Вы вместе идёте по премиум-коридору в VIP-зал.',
      },
      nextNodeId: 'd3_vip_arrival',
    },

    d3_vip_arrival: {
      id: 'd3_vip_arrival',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impressed',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: "Yaxshi. Tayyorsiz. Choy, keyin ish. 20 daqiqa.",
        ru: 'Хорошо. Вы подготовлены. Чай, потом дело. 20 минут.',
      },
      nextNodeId: 'd3_fleet',
    },

    // ── Direct reaction (no VIP protocol) ────────────────────
    d3_abdullaev_reacts_direct: {
      id: 'd3_abdullaev_reacts_direct',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'abdullaev', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Yaxshi, ko'rsating. Lekin tezroq — vaqtim kam.",
        ru: 'Хорошо, показывайте. Но быстрее — времени мало.',
      },
      nextNodeId: 'd3_fleet',
    },

    // ── Research reaction ────────────────────────────────────
    d3_abdullaev_reacts_research: {
      id: 'd3_abdullaev_reacts_research',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impressed',
      background: 'bg_showroom',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: "O'rganibsiz demak. Yaxshi. Fleet shartlar haqida gapiramiz.",
        ru: 'Значит, изучили. Хорошо. Поговорим о корпоративных условиях.',
      },
      nextNodeId: 'd3_fleet',
    },

    // ── Fleet Presentation (timed) ───────────────────────────
    d3_fleet: {
      id: 'd3_fleet',
      type: 'choice',
      prompt: {
        uz: '3 ta Malibu uchun taklif:',
        ru: 'Предложение по 3 Malibu:',
      },
      timeLimit: 10,
      expireNodeId: 'd3_fleet_expired',
      choices: [
        {
          id: 'd3_fleet_a',
          text: {
            uz: "Fleet paket: 3 Malibu, 2 yil servis, GPS, 7% korporativ chegirma.",
            ru: 'Fleet-пакет: 3 Malibu, 2 года сервис, GPS, 7% корпоративная скидка.',
          },
          nextNodeId: 'd3_wife_car',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 15 },
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'fleet_package' },
          ],
        },
        {
          id: 'd3_fleet_b',
          text: {
            uz: "Malibu — biznes-klassda eng ishonchli. Ranglar qaysi yoqadi?",
            ru: 'Malibu — самый надёжный в бизнес-классе. Какие цвета нравятся?',
          },
          nextNodeId: 'd3_wife_car',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 10 },
            { type: 'add_score', dimension: 'timing', amount: 5 },
          ],
        },
        {
          id: 'd3_fleet_c',
          text: {
            uz: "Fleet narx: har biri $26k ($28k o'rniga). 3 taga $6k tejaysiz.",
            ru: 'Fleet-цена: каждый $26k (вместо $28k). На 3 машины — экономия $6k.',
          },
          nextNodeId: 'd3_wife_car',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 12 },
            { type: 'add_score', dimension: 'opportunity', amount: 10 },
            { type: 'set_flag', flag: 'gave_fleet_price' },
          ],
          condition: { type: 'flag', flag: 'has_discount_authority' },
        },
      ],
    },

    // ── Fleet Timer Expired ──────────────────────────────────
    d3_fleet_expired: {
      id: 'd3_fleet_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -8 },
      ],
      narrator: {
        uz: "Abdullaev soatiga qaradi. Vaqt ketdi.",
        ru: 'Абдуллаев посмотрел на часы. Время уходит.',
      },
      nextNodeId: 'd3_wife_car',
    },

    // ── Wife's Car (Tahoe) ───────────────────────────────────
    d3_wife_car: {
      id: 'd3_wife_car',
      type: 'choice',
      prompt: {
        uz: 'Xotini uchun Tahoe:',
        ru: 'Tahoe для жены:',
      },
      choices: [
        {
          id: 'd3_wife_a',
          text: {
            uz: "Shaxsiy sozlash: comfort paket, premium audio, massaj o'rindiqlari, eksklyuziv ranglar.",
            ru: 'Персональная настройка: комфорт-пакет, премиум-аудио, массажные сиденья, эксклюзивные цвета.',
          },
          nextNodeId: 'd3_abd_check',
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 12 },
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'set_flag', flag: 'personalized_tahoe' },
          ],
        },
        {
          id: 'd3_wife_b',
          text: {
            uz: "Quvvat: 5.3L V8, 355 ot kuchi. Yo'lda shoh.",
            ru: 'Мощность: 5.3L V8, 355 л.с. Король дороги.',
          },
          nextNodeId: 'd3_abd_check',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
          ],
        },
        {
          id: 'd3_wife_c',
          text: {
            uz: "Hammasi — 4 ta mashinani bitta korporativ paketga jamlaymiz.",
            ru: 'Всё вместе — объединим 4 машины в один корпоративный пакет.',
          },
          nextNodeId: 'd3_abd_check',
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 10 },
            { type: 'add_score', dimension: 'persuasion', amount: 8 },
            { type: 'set_flag', flag: 'bundled_deal' },
          ],
        },
      ],
    },

    // ── Abdullaev Result Check ───────────────────────────────
    d3_abd_check: {
      id: 'd3_abd_check',
      type: 'condition_branch',
      branches: [
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'flag', flag: 'fleet_package' },
              { type: 'flag', flag: 'bundled_deal' },
              { type: 'score_gte', value: 55 },
            ],
          },
          nextNodeId: 'd3_abd_hidden',
        },
        {
          condition: { type: 'score_gte', value: 48 },
          nextNodeId: 'd3_abd_success',
        },
        {
          condition: { type: 'score_gte', value: 28 },
          nextNodeId: 'd3_abd_partial',
        },
      ],
      fallbackNodeId: 'd3_abd_fail',
    },

    // ── Abdullaev Hidden Ending ──────────────────────────────
    d3_abd_hidden: {
      id: 'd3_abd_hidden',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impressed',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: "Zo'r! Yillik korporativ shartnoma. Barcha yangi mashinalar siz orqali.",
        ru: 'Отлично! Годовой корпоративный контракт. Все новые машины — через вас.',
      },
      effects: [
        { type: 'add_xp', amount: 200 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'corporate_king' },
        { type: 'set_flag', flag: 'd3_abd_hidden' },
      ],
      nextNodeId: 'd3_transition',
    },

    // ── Abdullaev Success ────────────────────────────────────
    d3_abd_success: {
      id: 'd3_abd_success',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'proud',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'proud', position: 'center' },
      ],
      text: {
        uz: "VIP mijoz bilan yaxshi ishladingiz! Professional yondashuv!",
        ru: 'VIP-клиент обработан хорошо! Профессиональный подход!',
      },
      effects: [
        { type: 'add_xp', amount: 140 },
      ],
      nextNodeId: 'd3_transition',
    },

    // ── Abdullaev Partial ────────────────────────────────────
    d3_abd_partial: {
      id: 'd3_abd_partial',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "U hayron bo'ldi. VIP tayyorgarlik talab qiladi.",
        ru: 'Он был удивлён. VIP требует подготовки.',
      },
      effects: [
        { type: 'add_xp', amount: 85 },
      ],
      nextNodeId: 'd3_transition',
    },

    // ── Abdullaev Fail ───────────────────────────────────────
    d3_abd_fail: {
      id: 'd3_abd_fail',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'disappointed',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'disappointed', position: 'center' },
      ],
      text: {
        uz: "U ketdi. VIP — bu tayyorgarlik degani. Avval tadqiqot.",
        ru: 'Он ушёл. VIP — это подготовка. Сначала исследование.',
      },
      effects: [
        { type: 'add_xp', amount: 45 },
        { type: 'lose_life' },
      ],
      nextNodeId: 'd3_transition',
    },

    // ════════════════════════════════════════════════════════════
    // MID-DAY TRANSITION
    // ════════════════════════════════════════════════════════════

    d3_transition: {
      id: 'd3_transition',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: "Tushdan keyin. Abdullaevning qora mashinasi uzoqlashdi. Lekin kun hali tugamadi...",
        ru: 'После обеда. Чёрная машина Абдуллаева уехала. Но день ещё не закончен...',
      },
      nextNodeId: 'd3_rustam_mid',
    },

    d3_rustam_mid: {
      id: 'd3_rustam_mid',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "Yaxshi ish. Lekin sezaman, bugun yana bir kutilmagan hodisa bo'ladi.",
        ru: 'Хорошая работа. Но чувствую, сегодня будет ещё один сюрприз.',
      },
      nextNodeId: 'd3_dilnoza_check',
    },

    // ── Dilnoza Tip (conditional) ────────────────────────────
    d3_dilnoza_check: {
      id: 'd3_dilnoza_check',
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
          nextNodeId: 'd3_dilnoza_tip',
        },
      ],
      fallbackNodeId: 'd3_sardor_enters',
    },

    d3_dilnoza_tip: {
      id: 'd3_dilnoza_tip',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'helpful',
      background: 'bg_showroom',
      characters: [
        { id: 'dilnoza', emotion: 'helpful', position: 'center' },
      ],
      text: {
        uz: "Zo'r ishladingiz shu kunlarda. Oxirgi maslahat: eng qiyin mijoz — eng katta imkoniyat.",
        ru: 'Вы отлично работали эти дни. Последний совет: самый сложный клиент — это самая большая возможность.',
      },
      effects: [
        { type: 'set_flag', flag: 'got_dilnoza_tip' },
      ],
      nextNodeId: 'd3_sardor_enters',
    },

    // ════════════════════════════════════════════════════════════
    // PART B: MYSTERY SHOPPER SARDOR
    // ════════════════════════════════════════════════════════════

    d3_sardor_enters: {
      id: 'd3_sardor_enters',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom_entrance',
      characters: [
        { id: 'sardor', emotion: 'observing', position: 'center' },
      ],
      text: {
        uz: "Oddiy kiyingan kishi kirdi. Atrofga qaraydi, hech kimga yaqinlashmaydi.",
        ru: 'Вошёл скромно одетый мужчина. Осматривается, ни к кому не подходит.',
      },
      nextNodeId: 'd3_sardor_approach',
    },

    // ── Sardor Approach (timed) ──────────────────────────────
    d3_sardor_approach: {
      id: 'd3_sardor_approach',
      type: 'choice',
      prompt: {
        uz: 'Qanday murojaat qilasiz?',
        ru: 'Как подойдёте?',
      },
      timeLimit: 10,
      expireNodeId: 'd3_sardor_approach_expired',
      choices: [
        {
          id: 'd3_sardor_approach_a',
          text: {
            uz: "Salom! Bemalol ko'ring. Savol bo'lsa — men shu yerdaman.",
            ru: 'Здравствуйте! Смотрите спокойно. Вопросы — я рядом.',
          },
          nextNodeId: 'd3_needs',
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 12 },
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'patient_approach' },
          ],
        },
        {
          id: 'd3_sardor_approach_b',
          text: {
            uz: "Salom! Qaysi model qiziqtirdi?",
            ru: 'Здравствуйте! Какая модель заинтересовала?',
          },
          nextNodeId: 'd3_needs',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
        },
        {
          id: 'd3_sardor_approach_c',
          text: {
            uz: "Cobalt ko'ryapsizmi? Eng mashhur modelimiz.",
            ru: 'Смотрите Cobalt? Наша самая популярная модель.',
          },
          nextNodeId: 'd3_needs',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'add_score', dimension: 'empathy', amount: -5 },
            { type: 'set_flag', flag: 'judged_by_appearance' },
          ],
        },
      ],
    },

    // ── Sardor Approach Expired ──────────────────────────────
    d3_sardor_approach_expired: {
      id: 'd3_sardor_approach_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -8 },
        { type: 'add_score', dimension: 'rapport', amount: -5 },
      ],
      narrator: {
        uz: "Siz yaqinlashmadingiz. U o'zi atrofga qarab yurdi.",
        ru: 'Вы не подошли. Он сам бродил по залу.',
      },
      nextNodeId: 'd3_needs',
    },

    // ── Needs Discovery ──────────────────────────────────────
    d3_needs: {
      id: 'd3_needs',
      type: 'choice',
      prompt: {
        uz: 'Ehtiyojlarini qanday bilasiz?',
        ru: 'Как выясните потребности?',
      },
      choices: [
        {
          id: 'd3_needs_a',
          text: {
            uz: "Oilangiz haqida ayting — nechta bola, qayerga haydaysiz, nima muhim?",
            ru: 'Расскажите о семье — сколько детей, куда ездите, что важно?',
          },
          nextNodeId: 'd3_objection',
          effects: [
            { type: 'add_score', dimension: 'discovery', amount: 15 },
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'deep_discovery' },
          ],
        },
        {
          id: 'd3_needs_b',
          text: {
            uz: "Byudjetingiz qancha?",
            ru: 'Какой у вас бюджет?',
          },
          nextNodeId: 'd3_objection',
          effects: [
            { type: 'add_score', dimension: 'discovery', amount: 5 },
            { type: 'add_score', dimension: 'timing', amount: 3 },
          ],
        },
        {
          id: 'd3_needs_c',
          text: {
            uz: "Oila uchun — Equinox yoki Tracker. Ko'rsatay.",
            ru: 'Для семьи — Equinox или Tracker. Давайте покажу.',
          },
          nextNodeId: 'd3_objection',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'add_score', dimension: 'discovery', amount: -3 },
          ],
        },
      ],
    },

    // ── Objection Handling (timed) ───────────────────────────
    d3_objection: {
      id: 'd3_objection',
      type: 'choice',
      prompt: {
        uz: "Sardor: \"Servis qimmat deyishadi. Ehtiyot qismlar ham muammo.\"",
        ru: 'Сардор: "Говорят, сервис дорогой. И с запчастями проблемы."',
      },
      timeLimit: 10,
      expireNodeId: 'd3_objection_expired',
      choices: [
        {
          id: 'd3_objection_a',
          text: {
            uz: "Yaxshi savol. 2 yil bepul servis kiradi. Keyin — rasmiy dilerlar Toshkentda.",
            ru: 'Хороший вопрос. 2 года бесплатный сервис включён. Потом — официальные дилеры в Ташкенте.',
          },
          nextNodeId: 'd3_sardor_closing',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 15 },
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'set_flag', flag: 'honest_answer' },
          ],
        },
        {
          id: 'd3_objection_b',
          text: {
            uz: "Yo'q, eski ma'lumot. Hamma qismlar bor hozir.",
            ru: 'Нет, это старая информация. Сейчас все запчасти в наличии.',
          },
          nextNodeId: 'd3_sardor_closing',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 5 },
            { type: 'add_score', dimension: 'rapport', amount: -5 },
          ],
        },
        {
          id: 'd3_objection_c',
          text: {
            uz: "Tushunaman. Chevrolet 5 yillik kafolat beradi — bu ishonch belgisi.",
            ru: 'Понимаю. Chevrolet даёт 5-летнюю гарантию — это знак уверенности.',
          },
          nextNodeId: 'd3_sardor_closing',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 10 },
            { type: 'add_score', dimension: 'empathy', amount: 5 },
          ],
        },
      ],
    },

    // ── Objection Timer Expired ──────────────────────────────
    d3_objection_expired: {
      id: 'd3_objection_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -5 },
        { type: 'add_score', dimension: 'persuasion', amount: -5 },
      ],
      narrator: {
        uz: "Javob bermadingiz. Sardor boshini chayqadi.",
        ru: 'Вы не ответили. Сардор покачал головой.',
      },
      nextNodeId: 'd3_sardor_closing',
    },

    // ── Sardor Closing (timed, 5s) ───────────────────────────
    d3_sardor_closing: {
      id: 'd3_sardor_closing',
      type: 'choice',
      prompt: {
        uz: 'Qanday yakunlaysiz?',
        ru: 'Как завершите?',
      },
      timeLimit: 5,
      expireNodeId: 'd3_sardor_closing_expired',
      choices: [
        {
          id: 'd3_closing_a',
          text: {
            uz: "Test-drayv? 15 daqiqa va farqni his qilasiz.",
            ru: 'Тест-драйв? 15 минут — и почувствуете разницу.',
          },
          nextNodeId: 'd3_reveal',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 12 },
            { type: 'add_score', dimension: 'persuasion', amount: 8 },
            { type: 'set_flag', flag: 'offered_test_drive' },
          ],
        },
        {
          id: 'd3_closing_b',
          text: {
            uz: "Kontaktlarimni qoldiraman. O'ylang va qo'ng'iroq qiling.",
            ru: 'Оставлю свои контакты. Подумайте и позвоните.',
          },
          nextNodeId: 'd3_reveal',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
        },
        {
          id: 'd3_closing_c',
          text: {
            uz: "Bugun qaror qilsangiz, maxsus chegirma.",
            ru: 'Если решите сегодня, специальная скидка.',
          },
          nextNodeId: 'd3_reveal',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 3 },
            { type: 'add_score', dimension: 'empathy', amount: -5 },
            { type: 'set_flag', flag: 'pressure_close' },
          ],
        },
      ],
    },

    // ── Sardor Closing Expired ───────────────────────────────
    d3_sardor_closing_expired: {
      id: 'd3_sardor_closing_expired',
      type: 'score',
      effects: [
        { type: 'add_score', dimension: 'timing', amount: -5 },
        { type: 'lose_life' },
      ],
      narrator: {
        uz: "Vaqt o'tdi. Siz yakunlay olmadingiz.",
        ru: 'Время вышло. Вы не смогли завершить.',
      },
      nextNodeId: 'd3_reveal',
    },

    // ════════════════════════════════════════════════════════════
    // THE REVEAL
    // ════════════════════════════════════════════════════════════

    d3_reveal: {
      id: 'd3_reveal',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'revealing',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'revealing', position: 'center' },
      ],
      text: {
        uz: "Aslida, men sizni tekshirgani keldim. Men bosh ofisdan — sirli mijozman.",
        ru: 'Вообще-то, я пришёл вас проверить. Я из головного офиса — тайный покупатель.',
      },
      nextNodeId: 'd3_team_reaction',
    },

    d3_team_reaction: {
      id: 'd3_team_reaction',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'friendly',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'friendly', position: 'left' },
        { id: 'sardor', emotion: 'revealing', position: 'center' },
        { id: 'dilnoza', emotion: 'neutral', position: 'right' },
      ],
      text: {
        uz: "Janob Sardor... Sizni kutgan edik. Xo'sh, yangi hamkasbimiz qanday ishladi?",
        ru: 'Господин Сардор... Мы вас ждали. Ну, как наш новый коллега?',
      },
      nextNodeId: 'd3_grandmaster_check',
    },

    // ── Grandmaster Check ────────────────────────────────────
    d3_grandmaster_check: {
      id: 'd3_grandmaster_check',
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
          nextNodeId: 'd3_end_grandmaster',
        },
        {
          condition: { type: 'score_gte', value: 56 },
          nextNodeId: 'd3_end_success',
        },
        {
          condition: { type: 'score_gte', value: 30 },
          nextNodeId: 'd3_end_partial',
        },
      ],
      fallbackNodeId: 'd3_end_fail',
    },

    // ════════════════════════════════════════════════════════════
    // SCHOOL CTA ENDINGS
    // ════════════════════════════════════════════════════════════

    // ── GRANDMASTER ENDING ───────────────────────────────────
    d3_end_grandmaster: {
      id: 'd3_end_grandmaster',
      type: 'score',
      effects: [
        { type: 'add_xp', amount: 500 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'grandmaster' },
        { type: 'set_flag', flag: 'd3_grandmaster' },
      ],
      nextNodeId: 'd3_gm_sardor1',
    },

    d3_gm_sardor1: {
      id: 'd3_gm_sardor1',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'impressed',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: "Ajoyib. 3 kunda odatda 3 oyda o'rganadigan narsani o'rgandingiz. Sizda iste'dod bor.",
        ru: 'Невероятно. За 3 дня вы освоили то, что обычно занимает 3 месяца. У вас талант.',
      },
      nextNodeId: 'd3_gm_sardor2',
    },

    d3_gm_sardor2: {
      id: 'd3_gm_sardor2',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Lekin tizimsiz iste'dod — haydovchisiz sport mashina.",
        ru: 'Но талант без системы — как спорткар без водителя.',
      },
      nextNodeId: 'd3_gm_sardor3',
    },

    d3_gm_sardor3: {
      id: 'd3_gm_sardor3',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Men yuzlab sotuvchilarni ko'rganman. G'olib bo'lganlar — eng iste'dodlilar emas, eng ko'p mashq qilganlar.",
        ru: 'Я видел сотни продавцов. Побеждают не самые талантливые — а самые тренированные.',
      },
      nextNodeId: 'd3_gm_sardor4',
    },

    d3_gm_sardor4: {
      id: 'd3_gm_sardor4',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'satisfied',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'satisfied', position: 'center' },
      ],
      text: {
        uz: "Xom iste'doddan professional yasaydigan joy bor. Sales School.",
        ru: 'Есть место, где из сырого таланта делают профессионалов. Sales School.',
      },
      nextNodeId: 'd3_gm_dilnoza',
    },

    d3_gm_dilnoza: {
      id: 'd3_gm_dilnoza',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'proud',
      background: 'bg_showroom',
      characters: [
        { id: 'dilnoza', emotion: 'proud', position: 'center' },
      ],
      text: {
        uz: "Men o'sha yerda o'qiganman. Birinchi yiliyoq maoshim 3 barobar oshdi.",
        ru: 'Я окончила эту программу. Зарплата выросла в 3 раза за первый год.',
      },
      nextNodeId: 'd3_gm_rustam',
    },

    d3_gm_rustam: {
      id: 'd3_gm_rustam',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'proud',
      background: 'bg_showroom',
      characters: [
        { id: 'rustam', emotion: 'proud', position: 'center' },
      ],
      text: {
        uz: "Men eng yaxshi odamlarimni o'sha yerga yuboraman. Haqiqiy tizim.",
        ru: 'Я отправляю туда лучших. Это настоящая система.',
      },
      nextNodeId: 'd3_gm_school',
    },

    d3_gm_school: {
      id: 'd3_gm_school',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: "Sales School 3 oyda professionallarni tayyorlaydi. Bitiruvchilar yarim yil ichida 2-3 barobar ko'proq ishlaydi. Yangi boshlovchilar ham, tajribalilар ham.",
        ru: 'Sales School готовит профессионалов за 3 месяца. Выпускники зарабатывают в 2-3 раза больше за полгода. И новички, и опытные.',
      },
      nextNodeId: 'd3_gm_cta',
    },

    d3_gm_cta: {
      id: 'd3_gm_cta',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [],
      dialogue: {
        speaker: 'sardor',
        emotion: 'impressed',
        text: {
          uz: "Sizda kerakli narsa borligini isbotladingiz. Keyingi qadam: buni har kuni izchil qilishni o'rganing. Bu haqiqiy karyeraning boshlanishi.",
          ru: 'Вы доказали, что у вас есть всё необходимое. Следующий шаг: научиться делать это стабильно, каждый день. Это начало настоящей карьеры.',
        },
        characters: [
          { id: 'rustam', emotion: 'proud', position: 'left' },
          { id: 'sardor', emotion: 'impressed', position: 'center' },
          { id: 'dilnoza', emotion: 'smirk', position: 'right' },
        ],
      },
    },

    // ── SUCCESS ENDING ───────────────────────────────────────
    d3_end_success: {
      id: 'd3_end_success',
      type: 'score',
      effects: [
        { type: 'add_xp', amount: 160 },
        { type: 'unlock_achievement', id: 'final_test_passed' },
        { type: 'set_flag', flag: 'd3_success' },
      ],
      nextNodeId: 'd3_s_sardor1',
    },

    d3_s_sardor1: {
      id: 'd3_s_sardor1',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'satisfied',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'satisfied', position: 'center' },
      ],
      text: {
        uz: "Yaxshi natija. Siz intuitsiyaga ishlaysiz — bu yaxshi.",
        ru: 'Хороший результат. Вы работаете на интуиции — это хорошо.',
      },
      nextNodeId: 'd3_s_sardor2',
    },

    d3_s_sardor2: {
      id: 'd3_s_sardor2',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Lekin top sotuvchilar intuitsiya PLUS tizim bilan ishlaydi. O'sha tizimni o'rganmoqchimisiz?",
        ru: 'Но топ-продавцы работают на интуиции ПЛЮС система. Хотите освоить эту систему?',
      },
      nextNodeId: 'd3_s_school',
    },

    d3_s_school: {
      id: 'd3_s_school',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: "Aynan shuni o'rgatadigan dastur bor. 3 oy, shaxsiy mentor, amaliy mashqlar.",
        ru: 'Есть программа, которая учит именно этому. 3 месяца, личный ментор, реальная практика.',
      },
      nextNodeId: 'd3_s_cta',
    },

    d3_s_cta: {
      id: 'd3_s_cta',
      type: 'end',
      outcome: 'success',
      effects: [],
      dialogue: {
        speaker: 'sardor',
        emotion: 'satisfied',
        text: {
          uz: "Sizda asos bor. Professional dastur uni ko'paytiradi.",
          ru: 'У вас есть база. Профессиональная программа её умножит.',
        },
        characters: [
          { id: 'sardor', emotion: 'satisfied', position: 'center' },
        ],
      },
    },

    // ── PARTIAL ENDING ───────────────────────────────────────
    d3_end_partial: {
      id: 'd3_end_partial',
      type: 'score',
      effects: [
        { type: 'add_xp', amount: 90 },
        { type: 'set_flag', flag: 'd3_partial' },
      ],
      nextNodeId: 'd3_p_sardor1',
    },

    d3_p_sardor1: {
      id: 'd3_p_sardor1',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Yomon emas. Potentsial bor, lekin hali to'liq ochilmagan.",
        ru: 'Неплохо. Потенциал есть, но он ещё не раскрыт полностью.',
      },
      nextNodeId: 'd3_p_sardor2',
    },

    d3_p_sardor2: {
      id: 'd3_p_sardor2',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Tajribali mentor va tizimli ta'lim — shu ikkitasini qo'shing, natija o'zgaradi.",
        ru: 'Опытный ментор и системное обучение — добавьте эти два, и результат изменится.',
      },
      nextNodeId: 'd3_p_school',
    },

    d3_p_school: {
      id: 'd3_p_school',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: "Buni o'rgatadigan odamlar bor. Tizimli, bosqichma-bosqich.",
        ru: 'Есть люди, которые этому учат. Системно, шаг за шагом.',
      },
      nextNodeId: 'd3_p_cta',
    },

    d3_p_cta: {
      id: 'd3_p_cta',
      type: 'end',
      outcome: 'partial',
      effects: [],
      dialogue: {
        speaker: 'sardor',
        emotion: 'satisfied',
        text: {
          uz: "O'rganish istagi — bu allaqachon birinchi qadam.",
          ru: 'Желание учиться — это уже первый шаг.',
        },
        characters: [
          { id: 'sardor', emotion: 'satisfied', position: 'center' },
        ],
      },
    },

    // ── FAILURE ENDING ───────────────────────────────────────
    d3_end_fail: {
      id: 'd3_end_fail',
      type: 'score',
      effects: [
        { type: 'add_xp', amount: 50 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd3_fail' },
      ],
      nextNodeId: 'd3_f_sardor1',
    },

    d3_f_sardor1: {
      id: 'd3_f_sardor1',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral_alt',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral_alt', position: 'center' },
      ],
      text: {
        uz: "Natija kuchsiz. Lekin bilasizmi nima? Ko'pchilik umuman sinab ko'rmaydi.",
        ru: 'Результат слабый. Но знаете что? Большинство людей даже не пытаются.',
      },
      nextNodeId: 'd3_f_sardor2',
    },

    d3_f_sardor2: {
      id: 'd3_f_sardor2',
      type: 'dialogue',
      speaker: 'sardor',
      emotion: 'neutral',
      background: 'bg_showroom',
      characters: [
        { id: 'sardor', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: "Siz sinab ko'rdingiz. Demak, o'rganishga tayyorsiz.",
        ru: 'Вы попробовали. Значит, готовы учиться.',
      },
      nextNodeId: 'd3_f_school',
    },

    d3_f_school: {
      id: 'd3_f_school',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      text: {
        uz: "Sotish — bu ko'nikma. Har qanday ko'nikma singari, uni o'rganish mumkin. Buni professional o'rgatadigan odamlar bor.",
        ru: 'Продажи — это навык. Как любой навык, ему можно научиться. Есть те, кто учит этому профессионально.',
      },
      nextNodeId: 'd3_f_cta',
    },

    d3_f_cta: {
      id: 'd3_f_cta',
      type: 'end',
      outcome: 'failure',
      effects: [],
      dialogue: {
        speaker: 'sardor',
        emotion: 'satisfied',
        text: {
          uz: "Har bir ekspert bir paytlar yangi boshlovchi bo'lgan. Farqi — ular to'g'ri ustozni topgan.",
          ru: 'Каждый эксперт когда-то был новичком. Разница — они нашли правильного учителя.',
        },
        characters: [
          { id: 'sardor', emotion: 'satisfied', position: 'center' },
        ],
      },
    },
  },
};
