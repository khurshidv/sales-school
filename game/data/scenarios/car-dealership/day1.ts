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
      characters: [],
      text: {
        uz: 'Tong, salon hali sokin. Chiroqlar endigina yoqilgan, havoda tozalik hidi ufurib turibdi. Bugun sizning "Chevrolet" salonidagi birinchi ish kuningiz. Ichingizda sezilarli hayajon bor.',
        ru: 'Утро, салон ещё тихий. Свет только включили, в воздухе запах после уборки. Сегодня ваш первый рабочий день в салоне Chevrolet. Внутри заметное волнение.',
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
        uz: 'Keldingizmi. Ismim Rustam, bosh menejerman. Mijozlar bilan gaplashganda avval ularni yaxshilab eshiting, keyin esa gapiring.',
        ru: 'Пришли. Меня зовут Рустам, я главный менеджер. Когда общаетесь с клиентами — сначала внимательно слушайте, потом говорите.',
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
        uz: 'Bugun bir juftlik keladi. Bittasiga yopishib olmang. Biri jim tursa ham, qarorni baribir ikkalasi qiladi.',
        ru: 'Сегодня придёт пара. Не прилипайте к одному. Даже если второй молчит, решение всё равно принимают вдвоём.',
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
        uz: 'Yuzingizdan bilinib turibdi, birinchi mijozni kutyapsiz. Ismim Dilnoza. Hammaning birinchi kuni shunaqa o\'tadi.',
        ru: 'По лицу видно, ждёте первого клиента. Меня зовут Дильноза. У всех первый день проходит примерно так.',
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
        uz: 'Birinchi mijoz oldida hamma bir oz hayajonlanadi. Faqat buni yuzingizda bildirmang. Agar juftlik kelsa, ikkalasini ham qiziqtiradigan bitta sabab toping.',
        ru: 'Перед первым клиентом все немного волнуются. Только не показывайте это на лице. Если приходит пара — найдите одну причину, которая заинтересует обоих.',
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
        uz: 'Salom, ismim Anvar. Men ham bu yerda yangi sotuvchiman. Mana, bugungi mijozlar ro\'yxati.',
        ru: 'Привет, меня зовут Анвар. Я тоже здесь новый продавец. Вот список клиентов на сегодня.',
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
        uz: 'Bir juftlik kelishi kerak edi. Ular o\'zaro tortishayotgan edi menimcha. Erkak uchun mashinaning yurishi muhim, ayol uchun esa bolalarga qulay bo\'lishi kerak ekan.',
        ru: 'Должна прийти одна пара. По-моему, они между собой спорили. Мужу важно, как машина едет, а жене — чтобы детям было удобно.',
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
      characters: [],
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
        uz: 'Kimni yoniga birinchi borasiz?',
        ru: 'К кому подойдёте первым?',
      },
      choices: [
        {
          id: 'd1_who_first_a',
          text: {
            uz: 'Ikkalasini oldiga boraman: "Assalomu alaykum. Keling, birga ko\'raylik. Qaysi tomonga qarayapsizlar?"',
            ru: 'Подхожу сразу к обоим: "Здравствуйте. Давайте посмотрим вместе. К какой машине присматриваетесь?"',
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
            uz: 'Javlon tomonga boraman: "Assalomu alaykum. Tracker ko\'ryapsizmi?"',
            ru: 'Подхожу к Жавлону: "Здравствуйте. Смотрите Tracker?"',
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
            uz: 'Nilufar tomonga boraman: "Assalomu alaykum. Equinoxga qarayapsizmi?"',
            ru: 'Подхожу к Нилуфар: "Здравствуйте. Смотрите Equinox?"',
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
      emotion: 'stubborn',
      background: 'bg_showroom',
      characters: [
        { id: 'javlon', emotion: 'stubborn', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Mayli, birgalikda ko\'ramiz. Lekin men Trackerni qo\'llab-quvvatlayman. Tez ishlaydi, bosganingda darhol javob chiqadi.',
        ru: 'Ладно, посмотрим вместе. Но я за Tracker. Работает быстро, нажимаешь — сразу отклик.',
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
        uz: 'Men esa orqa qatorda kim o\'tirishini o\'ylayman. Ikki bola bilan Tracker torlik qiladi. Lekin birga ko\'rsak, mayli.',
        ru: 'А я думаю о том, кто будет сидеть сзади. С двумя детьми Tracker тесноват. Но если смотреть вместе, хорошо.',
      },
      nextNodeId: 'd1_compromise',
    },

    // --- Branch: Approached Javlon (Tracker) ---

    d1_conflict_tracker: {
      id: 'd1_conflict_tracker',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'stubborn',
      background: 'bg_showroom',
      characters: [
        { id: 'javlon', emotion: 'stubborn', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Ha, Tracker menga o\'tiradi. Yengil, chaqqon, rulda jon bor. Menga shunisi kerak.',
        ru: 'Да, Tracker мне подходит. Лёгкий, шустрый, за рулём живой. Мне именно это и нужно.',
      },
      nextNodeId: 'd1_conflict_tracker_nilufar',
    },

    d1_conflict_tracker_nilufar: {
      id: 'd1_conflict_tracker_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'worried',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Javlon, yana o\'sha gapmi? Bolalarni har kuni men olib yuraman. Meni ham bir eshitish kerak-ku.',
        ru: 'Жавлон, опять то же самое? Детей каждый день вожу я. Меня тоже надо хоть раз услышать.',
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
        uz: 'Equinoxning ichi kengroq ekan. Kreslo, sumka, bolalar narsasi hammasi sig\'adi. Men shunga qarayman.',
        ru: 'У Equinox салон просторнее. Кресло, сумки, детские вещи, всё поместится. Я на это и смотрю.',
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
        uz: 'Men ham shu yerdaman. Mashina faqat bagaj emas-ku. Men rulga o\'tiraman, yurishi ham ahamiyatli.',
        ru: 'Я вообще-то тоже здесь. Машина не только для багажника. За руль сажусь я, как она едет тоже важно.',
      },
      nextNodeId: 'd1_compromise',
    },

    // --- Compromise Choice (converge point) ---

    d1_compromise: {
      id: 'd1_compromise',
      type: 'choice',
      prompt: {
        uz: 'Ikkalasi ham o\'z gapida turibdi. Nima deysiz?',
        ru: 'Оба стоят на своём. Что скажете?',
      },
      timeLimit: 10,
      expireNodeId: 'd1_compromise_expired',
      choices: [
        {
          id: 'd1_compromise_a',
          text: {
            uz: 'Ikkalangiz ham boshqa narsani himoya qilyapsiz, lekin ikkalasi ham uy uchun. Keling, hozir sizlar uchun qaysi masala og\'irroq ekanini ajratib olaylik.',
            ru: 'Вы оба отстаиваете разное, но оба про дом. Давайте сначала отделим, что для вас сейчас тяжелее: удобство семьи или ощущения за рулём.',
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
            uz: 'Equinox faqat oilaviy emas. Yurishi ham sust emas. Avval ichini ko\'ramiz, keyin rulda o\'zingiz his qilasiz.',
            ru: 'Equinox не только семейный. И едет он не вяло. Сначала посмотрим салон, потом сами почувствуете за рулём.',
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
            uz: 'Yana bir yo\'l bor: hozir bittasini olasiz, keyin eski mashinani topshirib boshqasiga o\'tasiz.',
            ru: 'Есть ещё вариант: сейчас берёте одну, потом сдаёте её и переходите на другую.',
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
        uz: 'Gapingiz bor. Oila tomoni ham bor. Men faqat keyin afsus bo\'ladigan mashina olib qo\'ymaylik deyman.',
        ru: 'В ваших словах есть смысл. Семейная сторона тоже есть. Я просто не хочу взять машину и потом жалеть.',
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
        uz: 'Mana shu. Ikkalamizni ham eshitdingiz. Endi xotirjam ko\'ramiz, keyin qaror qilamiz.',
        ru: 'Вот. Вы услышали нас обоих. Теперь спокойно посмотрим и потом решим.',
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
        uz: 'Mayli, agar yurishi o\'lik bo\'lmasa, ko\'ramiz. O\'zim minib ko\'rishim kerak.',
        ru: 'Ладно, если едет не вяло, посмотрим. Мне самому надо прокатиться.',
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
        uz: 'Mayli. Lekin men avval orqa o\'rindiq bilan bagajni ko\'raman. Gap o\'shanda bilinadi.',
        ru: 'Хорошо. Но я сначала посмотрю задний ряд и багажник. Там всё и станет понятно.',
      },
      nextNodeId: 'd1_test_drive_offer',
    },

    d1_compromise_tradein: {
      id: 'd1_compromise_tradein',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'thinking',
      characters: [
        { id: 'javlon', emotion: 'thinking', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Variant sifatida bor. Lekin keyin yana almashtirish bilan yugurish ham oson emas. Bir marta olib, ko\'ngil tinch bo\'lgani yaxshi.',
        ru: 'Как вариант звучит. Но потом снова бегать, менять, терять время тоже не хочется. Лучше бы сразу понять, что нам подойдёт.',
      },
      nextNodeId: 'd1_compromise_tradein_nilufar',
    },

    d1_compromise_tradein_nilufar: {
      id: 'd1_compromise_tradein_nilufar',
      type: 'dialogue',
      speaker: 'nilufar',
      emotion: 'worried',
      characters: [
        { id: 'javlon', emotion: 'neutral', position: 'left' },
        { id: 'nilufar', emotion: 'worried', position: 'right' },
      ],
      text: {
        uz: 'Meni ham shu o\'ylantiradi. Bolalar masalasi keyin emas, hozir. Shuning uchun hozirdan to\'g\'ri tanlagan yaxshi.',
        ru: 'Вот это меня и смущает. Дети у нас уже сейчас, не потом. Поэтому лучше сразу выбрать нормально.',
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
        uz: 'Qanday davom etasiz?',
        ru: 'Как продолжите?',
      },
      choices: [
        {
          id: 'd1_test_drive_offer_a',
          text: {
            uz: 'Keling, gapni hozircha to\'xtataylik-da, bir aylantirib ko\'raylik. Yo\'lda ko\'p narsa bilinadi.',
            ru: 'Давайте пока отложим разговор и просто прокатимся. На дороге многое становится понятно.',
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
            uz: 'Mayli, unda o\'tirib shartlarini gaplashaylik.',
            ru: 'Хорошо, тогда давайте сядем и обсудим условия.',
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
      characters: [],
      text: {
        uz: 'Shahar ichidagi odatiy yo\'l. Svetofor, burilish, biroz notekis joylar. Javlon rulda, Nilufar orqa tomonda o\'rindiqni tekshirib o\'tirdi.',
        ru: 'Обычный городской маршрут. Светофоры, повороты, местами неровная дорога. Жавлон за рулём, Нилуфар сзади проверяет, как там сидится.',
      },
      nextNodeId: 'd1_test_drive_javlon',
    },

    d1_test_drive_javlon: {
      id: 'd1_test_drive_javlon',
      type: 'dialogue',
      speaker: 'javlon',
      emotion: 'stubborn',
      background: 'bg_city_street_tashkent',
      characters: [
        { id: 'javlon', emotion: 'stubborn', position: 'left' },
        { id: 'nilufar', emotion: 'thoughtful', position: 'right' },
      ],
      text: {
        uz: 'Yurishi yomon emas ekan. Gazga javobi bor. Men kutgandan yengilroq sezildi.',
        ru: 'Едет, кстати, неплохо. На газ откликается. Ощущается легче, чем я ожидал.',
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
        uz: 'Orqasi tor emas ekan. Kreslo ham sig\'adi, yoniga sumka ham tushadi. Ichkari shovqin ham bezor qilmayapti.',
        ru: 'Сзади не тесно. Кресло встанет, рядом ещё и сумка поместится. И внутри шум не раздражает.',
      },
      nextNodeId: 'd1_test_drive_choice',
    },

    d1_test_drive_choice: {
      id: 'd1_test_drive_choice',
      type: 'choice',
      prompt: {
        uz: 'Yo\'lda nima deysiz?',
        ru: 'Что скажете по дороге?',
      },
      choices: [
        {
          id: 'd1_test_drive_choice_a',
          text: {
            uz: 'Xavfsizlik bilan bolalar uchun qulay joylarini ko\'rsatib beraman.',
            ru: 'Покажу, что тут по безопасности и что удобно для детей.',
          },
          effects: [
            { type: 'add_score', dimension: 'empathy', amount: 8 },
          ],
          nextNodeId: 'd1_test_drive_safety',
        },
        {
          id: 'd1_test_drive_choice_b',
          text: {
            uz: 'Keyin sotganda ham qadrini ushlashi haqida aytaman.',
            ru: 'Скажу, что потом при продаже она тоже держит цену.',
          },
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
          ],
          nextNodeId: 'd1_test_drive_value',
        },
        {
          id: 'd1_test_drive_choice_c',
          text: {
            uz: 'Biroz jim turaman, o\'zlari sezib olsin.',
            ru: 'Немного помолчу, пусть сами почувствуют.',
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
        uz: 'Orqa eshik qulfi bilan xavfsizlik yostiqlari bor ekanmi? Men uchun shu muhim. Rahmat, shuni aytdingiz.',
        ru: 'Есть блокировка задних дверей и подушки безопасности? Для меня вот это важно. Спасибо, что сказали.',
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
        uz: 'Keyin sotganda ham odamni kuydirmasa, yomon emas. Demak, pul butunlay havoga ketmaydi.',
        ru: 'Если потом при продаже не сильно просядет, уже неплохо. Значит, деньги не уйдут в воздух совсем.',
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
        uz: 'To\'g\'risi, shu jimlik yaxshi bo\'ldi. Har kim o\'zi nimani sezsa, shuni aytadi.',
        ru: 'Если честно, эта тишина как раз к месту. Каждый сам чувствует своё.',
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
        uz: 'Aytgancha, kelasi hafta to\'y qilganimizga besh yil bo\'ladi. Shunga ham bir qarorga kelishimiz kerak.',
        ru: 'Кстати, на следующей неделе будет пять лет, как мы женаты. Так что нам и с этим надо определиться.',
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
        uz: 'Yakunida nima deysiz?',
        ru: 'Что скажете в конце?',
      },
      choices: [
        {
          id: 'd1_closing_a',
          text: {
            uz: 'Shoshilmang. Yana bir kun ikkalangiz kelib, odatdagi yo\'lingizda minib ko\'ring. Qaror shunda osonroq bo\'ladi.',
            ru: 'Не спешите. Приезжайте ещё раз вдвоём и прокатитесь по своему обычному маршруту. Так решать будет проще.',
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
            uz: 'Yubileyingiz yaqin ekan. Agar qaror qilsangiz, mashinani aynan o\'sha kuningizga tayyorlab beramiz. Sovg\'adek chiqadi.',
            ru: 'У вас скоро годовщина. Если решитесь, можем подготовить выдачу именно к этой дате. Получится не просто покупка, а хороший подарок.',
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
            uz: 'Istasangiz, hafta oxirigacha shu variantni ushlab turamiz. Uyda yana gaplashib, keyin aytasiz.',
            ru: 'Если хотите, до конца недели удержим этот вариант за вами. Дома ещё раз обсудите и потом скажете.',
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
          uz: 'Ha, shu bo\'ldi. Siz bizga mashina ko\'rsatmadiz, avval bizni to\'g\'ri tushundingiz. Olamiz. Equinoxni rasmiylashtiraylik.',
          ru: 'Вот, это точно. Вы нам не просто машину показали, вы сначала нас правильно поняли. Берём. Давайте оформлять Equinox.',
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
          uz: 'Asosiysi, bittasi bilan gaplashib turib, ikkinchisini yo\'qotmadingiz. Shu usulni ushlab qoling.',
          ru: 'Главное, вы не потеряли одного, пока разговаривали со вторым. Держите эту линию.',
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
          uz: 'Yomon emas. Lekin bir paytning o\'zida faqat bittasini ushlab qoldingiz. Ikkinchisi chetda qolib ketdi.',
          ru: 'Неплохо. Но в какой-то момент вы держали только одного. Второй в разговоре остался в стороне.',
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
          uz: 'Juftlikda bittasi sovusa, gap ham soviydi. Keyingi safar suhbatni ikkoviga bo\'lib olib boring.',
          ru: 'В паре если один остывает, разговор тоже остывает. В следующий раз ведите беседу сразу на двоих.',
        },
        characters: [
          { id: 'dilnoza', emotion: 'explaining', position: 'center' },
        ],
      },
    },
  },
};
