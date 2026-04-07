import type { Day } from '@/game/engine/types';

export const day3: Day = {
  id: 'car-day3',
  dayNumber: 3,
  title: { uz: 'Juftlik', ru: 'Пара' },
  rootNodeId: 'd3_intro',
  targetScore: 50,
  nodes: {
    // ── d3_intro ──────────────────────────────────────────────
    d3_intro: {
      id: 'd3_intro',
      type: 'dialogue',
      speaker: 'dilnoza',
      emotion: 'smirk',
      text: {
        uz: "Bugun er-xotin keladi. Maslaha: ikkalasini ham tinglang. Tomonini olmang. — Aytmoqchi, kecha LuxeWay test-drayvidan qaytdim, yangi Tahoe sinab ko'rdim. Yaxshi sotuvchi bo'lsangiz, buni o'zingiz xarid qila olasiz.",
        ru: 'Сегодня придёт пара. Слушайте обоих, не принимайте сторону. — Кстати, вчера вернулась с тест-драйва LuxeWay, попробовала новый Tahoe. Станете хорошим продавцом — сможете себе позволить.',
      },
      nextNodeId: 'd3_couple_enters',
    },

    // ── d3_couple_enters ──────────────────────────────────────
    d3_couple_enters: {
      id: 'd3_couple_enters',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: {
        uz: "Salon eshigi ochildi. Yosh er-xotin kirdi — u Tracker tomon, u esa Equinox tomon yo'naldi.",
        ru: 'Дверь салона открылась. Вошла молодая пара — он к Tracker, она к Equinox.',
      },
      nextNodeId: 'd3_who_first',
    },

    // ── d3_who_first ──────────────────────────────────────────
    d3_who_first: {
      id: 'd3_who_first',
      type: 'choice',
      prompt: {
        uz: 'Avval kim bilan gaplashasiz?',
        ru: 'С кем заговорите первым?',
      },
      choices: [
        {
          id: 'd3_who_first_a',
          text: {
            uz: "Ikkalangizga ham salom! Birga ko'rib chiqamizmi?",
            ru: 'Здравствуйте оба! Давайте вместе посмотрим?',
          },
          nextNodeId: 'd3_conflict',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 15 },
            { type: 'add_score', dimension: 'empathy', amount: 5 },
            { type: 'set_flag', flag: 'addressed_both' },
          ],
        },
        {
          id: 'd3_who_first_b',
          text: {
            uz: "Assalomu alaykum! Tracker qiziqtirdi? Keling, ko'rsataman.",
            ru: 'Здравствуйте! Tracker заинтересовал? Давайте покажу.',
          },
          nextNodeId: 'd3_conflict',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'set_flag', flag: 'approached_javlon' },
          ],
        },
        {
          id: 'd3_who_first_c',
          text: {
            uz: "Salom! Equinox — ajoyib tanlov oilalar uchun. Ko'rsatay?",
            ru: 'Здравствуйте! Equinox — отличный выбор для семьи. Показать?',
          },
          nextNodeId: 'd3_conflict',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 8 },
            { type: 'set_flag', flag: 'approached_nilufar' },
          ],
        },
      ],
    },

    // ── d3_conflict ───────────────────────────────────────────
    d3_conflict: {
      id: 'd3_conflict',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'stubborn',
      text: {
        uz: "Men Tracker xohlayman — sportiv, tez, chiroyli. Equinox juda katta.\n\nNilufar: Bolalarga joy kerak! Tracker kichik. Equinox — 7 o'rindiq, xavfsiz.",
        ru: 'Я хочу Tracker — спортивный, быстрый, красивый. Equinox слишком большой.\n\nНилуфар: Детям нужно место! Tracker маленький. Equinox — 7 мест, безопасный.',
      },
      nextNodeId: 'd3_compromise',
    },

    // ── d3_compromise ─────────────────────────────────────────
    d3_compromise: {
      id: 'd3_compromise',
      type: 'choice',
      prompt: {
        uz: 'Qanday kelishuv topasiz?',
        ru: 'Как найдёте компромисс?',
      },
      timeLimit: 10,
      expireNodeId: 'd3_compromise_expired',
      choices: [
        {
          id: 'd3_compromise_a',
          text: {
            uz: "Ikkalangizning ham talablaringiz to'g'ri. Tracker — kundalik uchun, Equinox — oila uchun. Hozir nima ko'proq kerak?",
            ru: 'Вы оба правы. Tracker — для будней, Equinox — для семьи. Что сейчас нужнее?',
          },
          nextNodeId: 'd3_anniversary_check',
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 15 },
            { type: 'add_score', dimension: 'persuasion', amount: 10 },
            { type: 'set_flag', flag: 'balanced_both' },
          ],
        },
        {
          id: 'd3_compromise_b',
          text: {
            uz: 'Equinox sport rejimi ham bor — tezlik ham, joy ham. Ikkalangiz uchun yechim.',
            ru: 'У Equinox есть спорт-режим — и скорость, и пространство. Решение для обоих.',
          },
          nextNodeId: 'd3_anniversary_check',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 12 },
            { type: 'add_score', dimension: 'persuasion', amount: 5 },
            { type: 'set_flag', flag: 'equinox_sport_mode' },
          ],
        },
        {
          id: 'd3_compromise_c',
          text: {
            uz: "Tracker olib, keyinroq Equinoxga almashtirsangiz bo'ladi. Trade-in dasturimiz bor.",
            ru: 'Можете взять Tracker, а позже обменять на Equinox. У нас есть trade-in программа.',
          },
          nextNodeId: 'd3_anniversary_check',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 8 },
            { type: 'add_score', dimension: 'opportunity', amount: 5 },
            { type: 'set_flag', flag: 'trade_in_offer' },
          ],
        },
      ],
    },

    // ── d3_compromise_expired ─────────────────────────────────
    d3_compromise_expired: {
      id: 'd3_compromise_expired',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'timing', amount: -5 }],
      narrator: {
        uz: "Ikkilandingiz va er-xotin bir-biri bilan bahslashishda davom etdi.",
        ru: 'Вы замешкались, и пара продолжила спорить между собой.',
      },
      nextNodeId: 'd3_anniversary_check',
    },

    // ── d3_anniversary_check ──────────────────────────────────
    d3_anniversary_check: {
      id: 'd3_anniversary_check',
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
          nextNodeId: 'd3_anniversary_hint',
        },
      ],
      fallbackNodeId: 'd3_closing',
    },

    // ── d3_anniversary_hint ───────────────────────────────────
    d3_anniversary_hint: {
      id: 'd3_anniversary_hint',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'happy',
      text: {
        uz: "Bilasizmi, kelasi haftada to'yimizning 5 yilligi...",
        ru: 'Знаете, на следующей неделе у нас 5-летие свадьбы...',
      },
      effects: [{ type: 'set_flag', flag: 'knows_anniversary' }],
      nextNodeId: 'd3_closing',
    },

    // ── d3_closing ────────────────────────────────────────────
    d3_closing: {
      id: 'd3_closing',
      type: 'choice',
      prompt: {
        uz: 'Qanday yakunlaysiz?',
        ru: 'Как завершите?',
      },
      choices: [
        {
          id: 'd3_closing_a',
          text: {
            uz: "Ikkalangiz ham test-drayvga chiqing. Equinoxni hissiy ko'ring.",
            ru: 'Приезжайте оба на тест-драйв. Почувствуйте Equinox вместе.',
          },
          nextNodeId: 'd3_check',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 10 },
            { type: 'add_score', dimension: 'rapport', amount: 5 },
          ],
        },
        {
          id: 'd3_closing_b',
          text: {
            uz: "5 yillik yubilayga — Equinoxni sovg'a qilsangiz? Biz maxsus tayyorlab beramiz, lenta bilan.",
            ru: 'На 5-летие — подарить Equinox? Мы оформим специально, с лентой.',
          },
          nextNodeId: 'd3_check',
          effects: [
            { type: 'add_score', dimension: 'opportunity', amount: 20 },
            { type: 'add_score', dimension: 'empathy', amount: 10 },
            { type: 'set_flag', flag: 'anniversary_surprise' },
          ],
          condition: { type: 'flag', flag: 'knows_anniversary' },
        },
        {
          id: 'd3_closing_c',
          text: {
            uz: 'Hafta oxirigacha maxsus narx taklif qila olaman.',
            ru: 'До конца недели могу предложить специальную цену.',
          },
          nextNodeId: 'd3_check',
          effects: [
            { type: 'add_score', dimension: 'timing', amount: 5 },
          ],
        },
      ],
    },

    // ── d3_check ──────────────────────────────────────────────
    d3_check: {
      id: 'd3_check',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'flag', flag: 'anniversary_surprise' },
          nextNodeId: 'd3_end_hidden',
        },
        {
          condition: { type: 'score_gte', value: 40 },
          nextNodeId: 'd3_end_success',
        },
        {
          condition: { type: 'score_gte', value: 22 },
          nextNodeId: 'd3_end_partial',
        },
      ],
      fallbackNodeId: 'd3_end_fail',
    },

    // ── d3_end_hidden ─────────────────────────────────────────
    d3_end_hidden: {
      id: 'd3_end_hidden',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'add_xp', amount: 180 },
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'love_sells' },
        { type: 'set_flag', flag: 'd3_hidden' },
      ],
      dialogue: {
        speaker: 'javlon',
        emotion: 'touched',
        text: {
          uz: "Voy... ajoyib fikr. Xotinim yig'lab yuboradi. Olamiz! Equinox — bizniki.",
          ru: 'Ого... отличная идея. Жена расплачется. Берём! Equinox — наш.',
        },
      },
    },

    // ── d3_end_success ────────────────────────────────────────
    d3_end_success: {
      id: 'd3_end_success',
      type: 'end',
      outcome: 'success',
      effects: [
        { type: 'add_xp', amount: 120 },
        { type: 'set_flag', flag: 'd3_success' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'proud',
        text: {
          uz: "Er-xotin bilan ishlash qiyin, lekin siz ikkalasini ham tingladingiz. Zo'r ish!",
          ru: 'С парами сложно, но вы выслушали обоих. Отличная работа!',
        },
      },
    },

    // ── d3_end_partial ────────────────────────────────────────
    d3_end_partial: {
      id: 'd3_end_partial',
      type: 'end',
      outcome: 'partial',
      effects: [
        { type: 'add_xp', amount: 75 },
        { type: 'set_flag', flag: 'd3_partial' },
      ],
      dialogue: {
        speaker: 'rustam',
        emotion: 'serious',
        text: {
          uz: "Yomon emas, lekin bir tomonga og'ib ketdingiz. Ikkalasini teng tinglang.",
          ru: 'Неплохо, но вы склонились к одному. Слушайте обоих одинаково.',
        },
      },
    },

    // ── d3_end_fail ───────────────────────────────────────────
    d3_end_fail: {
      id: 'd3_end_fail',
      type: 'end',
      outcome: 'failure',
      effects: [
        { type: 'add_xp', amount: 40 },
        { type: 'lose_life' },
        { type: 'set_flag', flag: 'd3_fail' },
      ],
      dialogue: {
        speaker: 'dilnoza',
        emotion: 'helpful',
        text: {
          uz: "Er-xotinlar — qiyin mijozlar. Sir: o'rtadagi qadriyatni toping.",
          ru: 'Пары — сложные клиенты. Секрет: найдите общую ценность.',
        },
      },
    },
  },
};
