import type { Day } from '@/game/engine/types';

export const day4: Day = {
  id: 'car-day4',
  dayNumber: 4,
  title: { uz: 'VIP', ru: 'VIP' },
  rootNodeId: 'd4_intro',
  targetScore: 60,
  nodes: {
    // ── d4_intro ──────────────────────────────────────────────
    d4_intro: {
      id: 'd4_intro',
      type: 'dialogue',
      speaker: 'rustam',
      emotion: 'serious',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'rustam', emotion: 'serious', position: 'center' },
      ],
      text: {
        uz: "Bugun Abdullaev — qurilish kompaniyasi direktori, VIP. Korporativ sotuv — bu alohida dunyo. B2B texnikasi oddiy B2C dan farq qiladi. Tayyorlanish muhim — professional sotuvchilar doim tayyorlanadi.",
        ru: 'Сегодня Абдуллаев — директор строительной компании, VIP. Корпоративные продажи — отдельный мир. Техника B2B отличается от обычного B2C. Подготовка — профессиональные продавцы всегда готовятся.',
      },
      nextNodeId: 'd4_preparation',
    },

    // ── d4_preparation (multiSelect: 2 of 3) ─────────────────
    d4_preparation: {
      id: 'd4_preparation',
      type: 'choice',
      prompt: {
        uz: "Uchrashuvgacha 2 ta tayyorgarlik ko'rishingiz mumkin. Qaysilarni tanlaysiz?",
        ru: 'До встречи можете сделать 2 подготовки из 3. Что выберете?',
      },
      multiSelect: { count: 2 },
      choices: [
        {
          id: 'd4_preparation_a',
          text: {
            uz: 'Kompaniyasi haqida internetdan izlash',
            ru: 'Погуглить его компанию',
          },
          nextNodeId: 'd4_anvar_helps',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'researched_company' },
          ],
        },
        {
          id: 'd4_preparation_b',
          text: {
            uz: "Rustam akadan VIP protokolni so'rash",
            ru: 'Спросить у Рустама про VIP-протокол',
          },
          nextNodeId: 'd4_anvar_helps',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 8 },
            { type: 'set_flag', flag: 'knows_vip_protocol' },
          ],
        },
        {
          id: 'd4_preparation_c',
          text: {
            uz: "Moliya bo'limidan fleet chegirma limitini aniqlash",
            ru: 'Уточнить у финансов лимит fleet-скидки',
          },
          nextNodeId: 'd4_anvar_helps',
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 8 },
            { type: 'set_flag', flag: 'has_discount_authority' },
          ],
        },
      ],
    },

    // ── d4_anvar_helps (conditional — only if researched) ─────
    d4_anvar_helps: {
      id: 'd4_anvar_helps',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'researched_company' },
          nextNodeId: 'd4_anvar_info',
        },
      ],
      fallbackNodeId: 'd4_abdullaev_enters',
    },

    d4_anvar_info: {
      id: 'd4_anvar_info',
      type: 'dialogue',
      speaker: 'anvar',
      emotion: 'eager',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'anvar', emotion: 'eager', position: 'center' },
      ],
      text: {
        uz: "Men ham izladim — Abdullaev kompaniyasi o'tgan yili 12 ta Cobalt olgan! Katta mijoz ekan.",
        ru: 'Я тоже поискал — компания Абдуллаева в прошлом году купила 12 Cobalt! Крупный клиент.',
      },
      nextNodeId: 'd4_abdullaev_enters',
    },

    // ── d4_abdullaev_enters ───────────────────────────────────
    d4_abdullaev_enters: {
      id: 'd4_abdullaev_enters',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impatient',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impatient', position: 'center' },
      ],
      text: {
        uz: 'Salom. Vaqtim kam. 3 ta Malibu — menejerlarimga. Va xotinimga Tahoe. Nima taklif bor?',
        ru: 'Здравствуйте. Времени мало. 3 Malibu — менеджерам. И Tahoe жене. Что предложите?',
      },
      nextNodeId: 'd4_greeting',
    },

    // ── d4_greeting ───────────────────────────────────────────
    d4_greeting: {
      id: 'd4_greeting',
      type: 'choice',
      prompt: {
        uz: 'Qanday javob berasiz?',
        ru: 'Как ответите?',
      },
      choices: [
        {
          id: 'd4_greeting_a',
          text: {
            uz: "Abdullaev janoblari, xush kelibsiz. VIP xonaga marhamat — choy va taqdimot tayyorlab qo'ydim.",
            ru: 'Господин Абдуллаев, добро пожаловать. Прошу в VIP-зону — чай и презентация уже готовы.',
          },
          nextNodeId: 'd4_abdullaev_reacts_vip',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 15 },
            { type: 'add_score', dimension: 'timing', amount: 5 },
            { type: 'set_flag', flag: 'vip_greeting' },
          ],
          condition: { type: 'flag', flag: 'knows_vip_protocol' },
        },
        {
          id: 'd4_greeting_b',
          text: {
            uz: "Xush kelibsiz! Keling, Malibu larni ko'rsataman.",
            ru: 'Добро пожаловать! Давайте покажу Malibu.',
          },
          nextNodeId: 'd4_abdullaev_reacts_direct',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
          ],
        },
        {
          id: 'd4_greeting_c',
          text: {
            uz: "Salom! Kompaniyangiz kengayayotganini o'qidim — tabriklayman! Flot uchun maxsus shartlarimiz bor.",
            ru: 'Здравствуйте! Читал, что компания расширяется — поздравляю! Для флота есть особые условия.',
          },
          nextNodeId: 'd4_abdullaev_reacts_research',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 12 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
            { type: 'set_flag', flag: 'showed_research' },
          ],
          condition: { type: 'flag', flag: 'researched_company' },
        },
      ],
    },

    // ── d4_abdullaev_reacts_vip ─────────────────────────────────
    d4_abdullaev_reacts_vip: {
      id: 'd4_abdullaev_reacts_vip',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'neutral',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: 'Yaxshi. Tayyorlanibsiz. Choy ichib, ishga kirishamiz. Vaqtim kam — 20 daqiqa.',
        ru: 'Хорошо. Подготовились. Попьём чаю и к делу. У меня 20 минут.',
      },
      nextNodeId: 'd4_fleet',
    },

    // ── d4_abdullaev_reacts_direct ────────────────────────────
    d4_abdullaev_reacts_direct: {
      id: 'd4_abdullaev_reacts_direct',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impatient',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impatient', position: 'center' },
      ],
      text: {
        uz: 'Shunchaki ko\'rsatasizmi? Men narx va shart kutayapman. Malibu ko\'rganman — taklif nima?',
        ru: 'Просто покажете? Я жду цену и условия. Malibu я видел — что предложите?',
      },
      nextNodeId: 'd4_fleet',
    },

    // ── d4_abdullaev_reacts_research ──────────────────────────
    d4_abdullaev_reacts_research: {
      id: 'd4_abdullaev_reacts_research',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impressed',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'O\'qibsiz? Yaxshi. Bilimli sotuvchini yoqtiraman. Maxsus shartlar — eshitaman.',
        ru: 'Читали? Хорошо. Люблю подготовленных продавцов. Особые условия — слушаю.',
      },
      nextNodeId: 'd4_fleet',
    },

    // ── d4_fleet ──────────────────────────────────────────────
    d4_fleet: {
      id: 'd4_fleet',
      type: 'choice',
      prompt: {
        uz: '3 ta Malibu uchun qanday taqdimot qilasiz?',
        ru: 'Как представите 3 Malibu для флота?',
      },
      timeLimit: 10,
      expireNodeId: 'd4_fleet_expired',
      choices: [
        {
          id: 'd4_fleet_a',
          text: {
            uz: 'Flot paketi: 3 ta Malibu — har biriga 2 yillik servis, GPS monitoring, va korporativ chegirma 7%.',
            ru: 'Пакет флота: 3 Malibu — каждому 2 года сервиса, GPS мониторинг, корпоративная скидка 7%.',
          },
          nextNodeId: 'd4_fleet_react_package',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 15 },
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'fleet_package' },
          ],
        },
        {
          id: 'd4_fleet_b',
          text: {
            uz: "Malibu — biznes segmentda eng ishonchli. Menejerlaringiz uchun ideal. Ranglarni tanlashni boshlaylikmi?",
            ru: 'Malibu — самый надёжный в бизнес-сегменте. Идеален для менеджеров. Начнём выбирать цвета?',
          },
          nextNodeId: 'd4_fleet_react_reliable',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 10 },
            { type: 'add_score', dimension: 'timing', amount: 5 },
          ],
        },
        {
          id: 'd4_fleet_c',
          text: {
            uz: "3 ta Malibu uchun maxsus fleet narx — har biri $26,000 ($28k o'rniga). Yiliga $6,000 tejaysiz.",
            ru: 'Специальная fleet-цена на 3 Malibu — $26,000 каждый (вместо $28к). Экономия $6,000 в год.',
          },
          nextNodeId: 'd4_fleet_react_price',
          effects: [
            { type: 'add_score', dimension: 'persuasion', amount: 12 },
            { type: 'add_score', dimension: 'opportunity', amount: 10 },
            { type: 'set_flag', flag: 'gave_fleet_price' },
          ],
          condition: { type: 'flag', flag: 'has_discount_authority' },
        },
      ],
    },

    // ── d4_fleet_expired ──────────────────────────────────────
    d4_fleet_expired: {
      id: 'd4_fleet_expired',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'timing', amount: -8 }],
      narrator: {
        uz: "Abdullaev sabrsiz. Siz tayyorlanmagansiz deb o'yladi.",
        ru: 'Абдуллаев нетерпелив. Он подумал, что вы не подготовились.',
      },
      nextNodeId: 'd4_fleet_react_timeout',
    },

    // ── d4_fleet_react_package ────────────────────────────────
    d4_fleet_react_package: {
      id: 'd4_fleet_react_package',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'neutral',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'neutral', position: 'center' },
      ],
      text: {
        uz: 'Servis va GPS — bu yaxshi. 7% chegirma... Qabul qilaman. Endi xotinimga Tahoe — gapiring.',
        ru: 'Сервис и GPS — хорошо. Скидка 7%... Принимается. Теперь про Tahoe для жены.',
      },
      nextNodeId: 'd4_wife_car',
    },

    // ── d4_fleet_react_reliable ───────────────────────────────
    d4_fleet_react_reliable: {
      id: 'd4_fleet_react_reliable',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impatient',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impatient', position: 'center' },
      ],
      text: {
        uz: 'Ishonchli — bu yaxshi. Lekin rang emas, narx kerak. Chegirma bormi? Endi Tahoe haqida gapiring.',
        ru: 'Надёжный — хорошо. Но не цвета, а цену давайте. Скидка есть? И расскажите про Tahoe.',
      },
      nextNodeId: 'd4_wife_car',
    },

    // ── d4_fleet_react_price ──────────────────────────────────
    d4_fleet_react_price: {
      id: 'd4_fleet_react_price',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impressed',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: '$6,000 tejash — bu raqam. Tayyorlanibsiz. Yaxshi. Endi Tahoe — xotinimga.',
        ru: 'Экономия $6,000 — это цифра. Подготовились. Хорошо. Теперь Tahoe — для жены.',
      },
      nextNodeId: 'd4_wife_car',
    },

    // ── d4_fleet_react_timeout ────────────────────────────────
    d4_fleet_react_timeout: {
      id: 'd4_fleet_react_timeout',
      type: 'dialogue',
      speaker: 'abdullaev',
      emotion: 'impatient',
      background: 'bg_vip_lounge',
      characters: [
        { id: 'abdullaev', emotion: 'impatient', position: 'center' },
      ],
      text: {
        uz: 'Javob yo\'qmi? Yaxshi, Tahoe haqida gapiring — balki u yaxshiroq tayyorlangandirsiz.',
        ru: 'Нет ответа? Ладно, расскажите про Tahoe — может, там подготовились лучше.',
      },
      nextNodeId: 'd4_wife_car',
    },

    // ── d4_wife_car ───────────────────────────────────────────
    d4_wife_car: {
      id: 'd4_wife_car',
      type: 'choice',
      prompt: {
        uz: "Abdullaev xotiniga Tahoe haqida so'radi. Qanday taqdimot qilasiz?",
        ru: 'Абдуллаев спросил про Tahoe для жены. Как представите?',
      },
      choices: [
        {
          id: 'd4_wife_car_a',
          text: {
            uz: "Tahoe — xotiningizga qulay va xavfsiz. Premium audio, massaj o'rindiqlari. Maxsus ranglar ham bor.",
            ru: 'Tahoe — комфортный и безопасный для вашей супруги. Premium аудио, массажные кресла. Есть эксклюзивные цвета.',
          },
          nextNodeId: 'd4_check',
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 12 },
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'set_flag', flag: 'personalized_tahoe' },
          ],
        },
        {
          id: 'd4_wife_car_b',
          text: {
            uz: 'Tahoe — eng kuchli SUV. 5.3L V8, 355 ot kuchi.',
            ru: 'Tahoe — самый мощный SUV. 5.3L V8, 355 л.с.',
          },
          nextNodeId: 'd4_check',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
          ],
        },
        {
          id: 'd4_wife_car_c',
          text: {
            uz: 'Tahoe + 3 Malibu — umumiy paket. Barcha 4 ta uchun maxsus korporativ shart.',
            ru: 'Tahoe + 3 Malibu — общий пакет. Особые корпоративные условия на все 4.',
          },
          nextNodeId: 'd4_check',
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 10 },
            { type: 'add_score', dimension: 'persuasion', amount: 8 },
            { type: 'set_flag', flag: 'bundled_deal' },
          ],
        },
      ],
    },

    // ── d4_check ──────────────────────────────────────────────
    d4_check: {
      id: 'd4_check',
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
          nextNodeId: 'd4_end_hidden',
        },
        {
          condition: { type: 'score_gte', value: 48 },
          nextNodeId: 'd4_end_success',
        },
        {
          condition: { type: 'score_gte', value: 28 },
          nextNodeId: 'd4_end_partial',
        },
      ],
      fallbackNodeId: 'd4_end_fail',
    },

    // ── d4_end_hidden ─────────────────────────────────────────
    d4_end_hidden: {
      id: 'd4_end_hidden',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'add_xp', amount: 200 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'corporate_king' },
        { type: 'set_flag', flag: 'd4_hidden' },
      ],
      dialogue: {
        speaker: 'abdullaev',
        emotion: 'impressed',
        text: {
          uz: 'Ajoyib! Yillik korporativ shartnoma tuzamiz. Barcha yangi mashinalar — sizdan.',
          ru: 'Отлично! Заключим годовой корпоративный контракт. Все новые машины — через вас.',
        },
      },
    },

    // ── d4_end_success ────────────────────────────────────────
    d4_end_success: {
      id: 'd4_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 140 },
        { type: 'set_flag', flag: 'd4_success' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'proud',
        text: {
          uz: "VIP mijoz bilan ishlash oson emas. Siz professional yondashuvni ko'rsatdingiz!",
          ru: 'С VIP-клиентами непросто. Вы показали профессиональный подход!',
        },
      },
    },

    // ── d4_end_partial ────────────────────────────────────────
    d4_end_partial: {
      id: 'd4_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 85 },
        { type: 'set_flag', flag: 'd4_partial' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'serious',
        text: {
          uz: "Abdullaev biroz hayron qoldi. VIP mijozga oldindan tayyorlanish muhim.",
          ru: 'Абдуллаев слегка удивлён. Для VIP важно подготовиться заранее.',
        },
      },
    },

    // ── d4_end_fail ───────────────────────────────────────────
    d4_end_fail: {
      id: 'd4_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 45 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd4_fail' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'disappointed',
        text: {
          uz: "Abdullaev ketdi. VIP — bu tayyorgarlik. Oldindan ma'lumot to'plang.",
          ru: 'Абдуллаев ушёл. VIP — это подготовка. Собирайте информацию заранее.',
        },
      },
    },
  },
};
