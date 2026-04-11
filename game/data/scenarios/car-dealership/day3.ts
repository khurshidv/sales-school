import type { Day } from '@/game/engine/types';

export const day3: Day = {
  id: 'car-day3',
  dayNumber: 3,
  title: {
    uz: 'VIP va maxfiy xaridor',
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
        uz: 'VIP va maxfiy xaridor',
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
        uz: 'Bugun boshqa bosqich. Vaqtni ham, xizmatni ham, tartibliligingizni ham darhol hisoblaydigan odam keladi.',
        ru: 'Сегодня другой уровень. Придёт человек, который сразу считает и время, и сервис, и вашу собранность.',
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
        uz: "Abdullaev hamma narsani birinchi daqiqadayoq baholaydi. Tayyorgarliksiz maydonga tushsangiz, ikkinchi imkoniyat bo‘lmaydi.",
        ru: 'Абдуллаев оценивает всё в первую минуту. Выйдете неподготовленным — второго шанса не будет.',
      },
      nextNodeId: 'd3_preparation',
    },

    // ── Preparation (multiSelect 2 of 3) ─────────────────────
    d3_preparation: {
      id: 'd3_preparation',
      type: 'choice',
      prompt: {
        uz: 'Tayyorgarlik: 2 ni tanlang',
        ru: 'Подготовка: выберите 2',
      },
      multiSelect: { count: 2 },
      choices: [
        {
          id: 'd3_prep_a',
          text: {
            uz: "Uning kompaniyasini internetda o'rganing",
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
            uz: "Rustamdan VIP-protokol haqida so‘ra.",
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
            uz: "Moliyachilardan so‘rash kerak: kompaniyaga qancha chegirma berish mumkin?",
            ru: 'Спросить у финансистов: какую скидку можно дать компании?',
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
        uz: "Biror narsa topdim - o‘tgan yili ular 12 ta Cobalt sotib olishgan ekan. Ehtimol, parkni yangilashni rejalashtirishayotgandir.",
        ru: 'Кое-что нашёл — в прошлом году они купили 12 Cobalt. Возможно, планируют обновление парка.',
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
      characters: [],
      text: {
        uz: "Qora rangli mashina kelib to‘xtadi. Haydovchi eshikni ochdi. Kostyum kiygan erkak tushib, to‘g‘ri salonga kirdi.",
        ru: 'Подъехала чёрная машина. Водитель открыл дверь. Мужчина в костюме вышел и прошёл прямо в салон.',
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
        uz: 'Salom alaykum. Vaqt oz qoldi. Ish uchun uchta Malibu, uy uchun bitta Tahoe kerak. Faqat ish yuzasidan gaplashing.',
        ru: 'Здравствуйте. Времени мало. Три Malibu для работы, один Tahoe для дома. Говорите только по делу.',
      },
      nextNodeId: 'd3_greeting',
    },

    // ── Greeting Choice ──────────────────────────────────────
    d3_greeting: {
      id: 'd3_greeting',
      type: 'choice',
      prompt: {
        uz: 'Qanday uchrashasiz?',
        ru: 'Как встретите?',
      },
      choices: [
        {
          id: 'd3_greeting_a',
          text: {
            uz: "Janob Abdullayev, biz tayyorgarlik ko'rdik. Keling, tinch joyda qisqa vaqt ichida hamma narsani yig'amiz.",
            ru: 'Господин Абдуллаев, мы подготовились. Давайте в спокойном месте коротко и по делу всё соберём.',
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
            uz: "Xush kelibsiz! Malibuni ko‘rsatib beray.",
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
            uz: "Kompaniyangiz avval ham park sotib olganini ko‘rib chiqdim. Buning uchun ikkita tushunarli variant tayyorlab qo‘ydim.",
            ru: 'Посмотрел, как ваша компания уже покупала парк раньше. Под это подготовил два понятных варианта.',
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
      characters: [],
      text: {
        uz: "Abdullayev oldinga yurdi. Yoningizda bo‘lsangiz - xotirjam, ortiqcha gap-so‘zsiz.",
        ru: 'Абдуллаев пошёл вперёд. Вы рядом — спокойно, без лишних слов.',
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
        uz: "Mayli. Choy ichib olaylik, keyin ishga kirishamiz. Sizda 20 daqiqa vaqt bor.",
        ru: 'Хорошо. Чай, потом дело. У вас 20 минут.',
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
        uz: "Mayli. Mana bu yerga ko‘rsatinglar. Faqat qisqa qilib.",
        ru: 'Ладно. Показывайте здесь. Только коротко.',
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
        uz: "Demak, o‘rganib chiqdinglar. Yaxshi. Agar tayyor biror narsa bo‘lsa, ko‘rsating.",
        ru: 'Значит, изучили. Хорошо. Если есть что-то готовое — показывайте.',
      },
      nextNodeId: 'd3_fleet',
    },

    // ── Fleet Presentation (timed) ───────────────────────────
    d3_fleet: {
      id: 'd3_fleet',
      type: 'choice',
      prompt: {
        uz: "Uchta Malibu bo‘yicha taklifni qanday shakllantirasiz?",
        ru: 'Как соберёте предложение по трём Malibu?',
      },
      timeLimit: 20,
      expireNodeId: 'd3_fleet_expired',
      choices: [
        {
          id: 'd3_fleet_a',
          text: {
            uz: 'Biz mashinalarni "yalang‘och" holda bermaymiz: paketni darhol xizmat ko‘rsatish, kuzatib borish va korporativ shartlar bilan yig‘amiz.',
            ru: 'Мы не отдаём машины "голыми": собираем пакет сразу с сервисом, сопровождением и корпоративными условиями.',
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
            uz: "Malibu - biznes-klassdagi eng ishonchli avtomobil. Qaysi ranglar yoqadi?",
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
            uz: "Narxning aniq miqdorini darhol aytaman, keyin esa unga nimalar kiritilganini qisqacha tushuntirib beraman.",
            ru: 'Сразу покажу честную цифру по цене, а потом коротко разложу, что в неё уже входит.',
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
        uz: "Abdullayev soatiga qaradi. Bir og‘iz ham gapirmadi.",
        ru: 'Абдуллаев посмотрел на часы. Не сказал ни слова.',
      },
      nextNodeId: 'd3_wife_car',
    },

    // ── Wife's Car (Tahoe) ───────────────────────────────────
    d3_wife_car: {
      id: 'd3_wife_car',
      type: 'choice',
      prompt: {
        uz: "Tahoe haqida nimalarni ta’kidlamoqchisiz?",
        ru: 'Что подчеркнёте по Tahoe?',
      },
      choices: [
        {
          id: 'd3_wife_a',
          text: {
            uz: "Turmush o‘rtog‘im uchun qulaylikka urg‘u berilgan avtomobil yig‘amiz: o‘rindiq, salon, ovoz va har kuni seziladigan barcha mayda-chuydalar.",
            ru: 'Для супруги соберём машину с упором на комфорт: посадка, салон, звук и все мелочи, которые чувствуются каждый день.',
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
            uz: "Quvvati: 5,3L V8, 355 ot kuchi Yo‘l shohi.",
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
            uz: "Agar sizga qulay bo‘lsa, bularning barchasini to‘rtta alohida mashina bilan emas, balki yagona yaxlit yechim bilan yopib qo‘yishimiz mumkin.",
            ru: 'Если вам удобно, можем закрыть всё это не четырьмя разрозненными машинами, а одним цельным решением.',
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
      background: 'bg_showroom',
      characters: [
        { id: 'abdullaev', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: "Taklifingiz menga ma’qul. Bir yillik shartnoma imzolashimiz mumkin.",
        ru: 'Ваше предложение мне подходит. Можем подписать годовой контракт.',
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
        uz: "Juda soz. Bunday mijozlar bilan so‘zamollik emas, tayyorgarlik ishlaydi.",
        ru: 'Неплохо. С такими клиентами работает не красноречие, а подготовка.',
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
        uz: "Uning darajasiga yetolmadik. Bunday mijozga tayyorgarliksiz chiqish - imkoniyatni boy berish demakdir.",
        ru: 'Не дотянули до его уровня. Выходить к такому клиенту без подготовки — упускать возможность.',
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
        uz: "U ketdi. Hech narsa demadi. Shunchaki o‘rnidan turib, chiqib ketdi. Bunday odamlar ikkinchi marta kelmaydi.",
        ru: 'Он ушёл. Ничего не сказал. Просто встал и ушёл. Такие люди второй раз не приходят.',
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
      characters: [],
      text: {
        uz: "Tushlikdan so‘ng. Abdullayevning mashinasi jo‘nab ketdi. Salon jim bo‘lib qoldi. Ammo kun hali tugamagan edi.",
        ru: 'После обеда. Машина Абдуллаева уехала. В салоне стало тихо. Но день ещё не закончен.',
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
        uz: "Xotirjam bo‘lmanglar. Bugun yana kimdir kelishi mumkin.",
        ru: 'Не расслабляйтесь. Сегодня может зайти ещё кто-нибудь.',
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
        uz: "Bu kunlarda yaxshi ishladingiz. Bir narsa: eng oddiy ko‘ringan odam ko‘pincha eng muhim shaxs bo‘lib chiqadi.",
        ru: 'Вы хорошо работали эти дни. Одно: самый обычный на вид человек часто оказывается самым важным.',
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
        uz: "Zalga oddiy kiyingan bir erkak kirib keldi. Hech narsaga qo‘l cho‘zmay, hech kimni chaqirmaydi. Shunchaki qarab turibdi.",
        ru: 'В зал зашёл просто одетый мужчина. Ни к чему не тянется, никого не зовёт. Просто смотрит.',
      },
      nextNodeId: 'd3_sardor_approach',
    },

    // ── Sardor Approach (timed) ──────────────────────────────
    d3_sardor_approach: {
      id: 'd3_sardor_approach',
      type: 'choice',
      prompt: {
        uz: 'Qanday yaqinlashasiz?',
        ru: 'Как подойдёте?',
      },
      timeLimit: 20,
      expireNodeId: 'd3_sardor_approach_expired',
      choices: [
        {
          id: 'd3_sardor_approach_a',
          text: {
            uz: "Salom alaykum. Xotirjam tomosha qiling. Zarur bo‘lsam, yoningizda turaman.",
            ru: 'Здравствуйте. Спокойно смотрите. Если понадоблюсь, я рядом.',
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
            uz: "Assalomu alaykum! Qaysi model sizni qiziqtirdi?",
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
            uz: "Kobaltni ko‘ryapsanmi? Bizda uni ko‘pincha sotib olishadi.",
            ru: 'Cobalt смотрите? Его у нас чаще всего и берут.',
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
        uz: "Sen yaqinlashmading. U o‘zi zalni aylanib yurardi.",
        ru: 'Вы не подошли. Он сам бродил по залу.',
      },
      nextNodeId: 'd3_needs',
    },

    // ── Needs Discovery ──────────────────────────────────────
    d3_needs: {
      id: 'd3_needs',
      type: 'choice',
      prompt: {
        uz: 'Ehtiyojlarni qanday aniqlash mumkin?',
        ru: 'Как выясните потребности?',
      },
      choices: [
        {
          id: 'd3_needs_a',
          text: {
            uz: "Oilangiz haqida so‘zlab bersangiz - farzandlaringiz nechta, qayerlarga borasiz, nimalarni qadrlayapsiz?",
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
            uz: "Sizning byudjetingiz qanday?",
            ru: 'Какой у вас бюджет?',
          },
          // «Какой у вас бюджет?» в лоб — клиент чувствует, что его
          // видят только как кошелёк. Soft-ошибка ce_shallow_discovery
          // блокирует grandmaster в финальной проверке.
          nextNodeId: 'd3_objection',
          effects: [
            { type: 'add_score', dimension: 'discovery', amount: -3 },
            { type: 'add_score', dimension: 'rapport', amount: -5 },
            { type: 'set_flag', flag: 'ce_shallow_discovery' },
          ],
        },
        {
          id: 'd3_needs_c',
          text: {
            uz: "Oila uchun - Equinox yoki Tracker. Ko‘rsatib beray.",
            ru: 'Для семьи — Equinox или Tracker. Давайте покажу.',
          },
          // Преждевременное предложение модели без выяснения потребностей.
          // Soft-ошибка ce_premature_pitch блокирует grandmaster.
          nextNodeId: 'd3_objection',
          effects: [
            { type: 'add_score', dimension: 'expertise', amount: 5 },
            { type: 'add_score', dimension: 'discovery', amount: -8 },
            { type: 'set_flag', flag: 'ce_premature_pitch' },
          ],
        },
      ],
    },

    // ── Objection Handling (timed) ───────────────────────────
    d3_objection: {
      id: 'd3_objection',
      type: 'choice',
      prompt: {
        uz: "Sardor: - Aytishlaricha, xizmat ko‘rsatish qimmat ekan. Ehtiyot qismlar bilan ham muammolar bor ekan.",
        ru: 'Сардор: "Говорят, сервис дорогой. И с запчастями проблемы."',
      },
      timeLimit: 20,
      expireNodeId: 'd3_objection_expired',
      choices: [
        {
          id: 'd3_objection_a',
          text: {
            uz: "Bu savol ko‘p so‘raladi. Ochig‘ini aytsam, oddiy rasmiy xizmatda odamlar tasavvur qilganidan ancha kamroq muammolar mavjud.",
            ru: 'Этот вопрос часто задают. Если честно, при нормальном официальном сервисе там намного меньше проблем, чем люди себе представляют.',
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
            uz: "Yo‘q, hozir bunday muammo yo‘q.",
            ru: 'Нет, сейчас такой проблемы уже нет.',
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
            uz: "Tushunaman. Chevrolet 5 yillik kafolat beradi - bu ishonch belgisidir.",
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
        uz: "Sen javob bermading. Sardor bosh chayqadi.",
        ru: 'Вы не ответили. Сардор покачал головой.',
      },
      nextNodeId: 'd3_sardor_closing',
    },

    // ── Sardor Closing (timed, 5s) ───────────────────────────
    d3_sardor_closing: {
      id: 'd3_sardor_closing',
      type: 'choice',
      prompt: {
        uz: 'Qanday qilib tugatasiz?',
        ru: 'Как завершите?',
      },
      timeLimit: 5,
      expireNodeId: 'd3_sardor_closing_expired',
      choices: [
        {
          id: 'd3_closing_a',
          text: {
            uz: "Test-drayvmi? 15 daqiqa - va farqni his qilasiz.",
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
            uz: "Aloqa ma’lumotlarimni qoldiraman. O‘ylab ko‘rib, qo‘ng‘iroq qiling.",
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
            uz: "Agar bugun qaror qilsangiz, maxsus chegirma.",
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
        uz: "Vaqt tugadi. Siz uni yakunlay olmadingiz.",
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
        uz: "Aslida men oddiy mijoz sifatida emas, boshqa maqsadda kelganman. Meni sizlarning ishingizni ko‘rish uchun yuborishgan.",
        ru: 'На самом деле я пришёл не как обычный клиент. Меня отправили посмотреть, как вы работаете.',
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
        uz: "Sardor... Xo‘sh, yangi hamkasbimiz sizga yoqdimi?",
        ru: 'Сардор... Ну, как вам наш новый коллега?',
      },
      nextNodeId: 'd3_grandmaster_check',
    },

    // ── Grandmaster Check ────────────────────────────────────
    //
    // Логика:
    //   1. Две или более критических ошибок за день 3 → fail.
    //      Grandmaster не должен достигаться, если игрок оступился.
    //   2. Grandmaster — все фирменные флаги + score >= 63 + нет CE.
    //   3. Одна soft CE → cap на partial (даже при высоком score).
    //   4. Success по score.
    //   5. Partial/fail fallback.
    d3_grandmaster_check: {
      id: 'd3_grandmaster_check',
      type: 'condition_branch',
      branches: [
        // 1. Two or more critical errors → fail
        {
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'ce_shallow_discovery' },
                  { type: 'flag', flag: 'ce_premature_pitch' },
                ],
              },
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'ce_shallow_discovery' },
                  { type: 'flag', flag: 'pressure_close' },
                ],
              },
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'ce_premature_pitch' },
                  { type: 'flag', flag: 'pressure_close' },
                ],
              },
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'judged_by_appearance' },
                  { type: 'flag', flag: 'pressure_close' },
                ],
              },
            ],
          },
          nextNodeId: 'd3_end_fail',
        },
        // 2. Grandmaster — pristine path + high score + no CE
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
              { type: 'not', condition: { type: 'flag', flag: 'ce_shallow_discovery' } },
              { type: 'not', condition: { type: 'flag', flag: 'ce_premature_pitch' } },
              { type: 'not', condition: { type: 'flag', flag: 'pressure_close' } },
              { type: 'not', condition: { type: 'flag', flag: 'judged_by_appearance' } },
            ],
          },
          nextNodeId: 'd3_end_grandmaster',
        },
        // 3. Single soft CE → partial cap
        {
          condition: {
            type: 'or',
            conditions: [
              { type: 'flag', flag: 'ce_shallow_discovery' },
              { type: 'flag', flag: 'ce_premature_pitch' },
              { type: 'flag', flag: 'pressure_close' },
              { type: 'flag', flag: 'judged_by_appearance' },
            ],
          },
          nextNodeId: 'd3_end_partial',
        },
        // 4. Success by score
        {
          condition: { type: 'score_gte', value: 56 },
          nextNodeId: 'd3_end_success',
        },
        // 5. Partial by score
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
        uz: "Yaxshi ishladingiz. Ko‘pchilik bu darajaga ancha keyinroq chiqadi.",
        ru: 'Хорошо отработали. Большинство выходят на этот уровень значительно позже.',
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
        uz: "Ammo birgina kuchli kun hech narsani kafolatlamaydi. Haqiqiy daraja natija har kuni takrorlanadigan joyda boshlanadi.",
        ru: 'Но один сильный день ещё ничего не гарантирует. Настоящий уровень начинается там, где результат повторяется каждый день.',
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
        uz: "Men ko‘plab sotuvchilarni ko‘rganman. Eng iqtidorlilar emas, balki tizimli ravishda shug‘ullanadiganlar o‘sib bormoqda.",
        ru: 'Я видел много продавцов. Растут не самые талантливые, а те, кто тренируются системно.',
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
        uz: "Davom ettirmoqchi bo‘lsangiz, tizim, amaliyot va ustoz kerak bo‘ladi. Aynan shuni ta’minlaydigan dastur mavjud.",
        ru: 'Если хотите продолжить — нужна система, практика и наставник. Есть программа, которая даёт именно это.',
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
        uz: "Men ushbu dasturni tugatdim. Birinchi yilning o‘zida maoshim 3 barobar oshdi.",
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
        uz: "U yerga eng yaxshilarini yuborayapman. Bu haqiqiy tizim.",
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
      characters: [],
      text: {
        uz: 'Tizimli o‘qiganlar tezroq o‘sadi. 3 oy ichida yangi boshlovchilar ham, tajribali mutaxassislar ham ish darajasiga chiqishi mumkin.',
        ru: 'Те, кто учатся системно, растут быстрее. За 3 месяца можно выйти на рабочий уровень — и новички, и опытные.',
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
          uz: "Sizda barcha zarur narsalar borligini isbotladingiz. Keyingi qadam: buni har kuni muntazam bajarishni o‘rganish. Bu haqiqiy martabaning boshlanishi.",
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
        uz: "Yaxshi natija. Intuitsiyaga tayanasiz - bu yaxshi.",
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
        uz: "Sizda sezgi bor ekan. Endi unga tayanch kerak: tizim, amaliyot va o‘z xatolarini tahlil qilish.",
        ru: 'Чутьё у вас есть. Теперь ему нужна опора: система, практика и разбор собственных ошибок.',
      },
      nextNodeId: 'd3_s_school',
    },

    d3_s_school: {
      id: 'd3_s_school',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      background: 'bg_showroom',
      characters: [],
      text: {
        uz: "Aynan shuni o‘rgatadigan dastur mavjud. 3 oy, shaxsiy murabbiy, haqiqiy amaliyot.",
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
          uz: "Sizda baza mavjud. Professional dastur uni yanada kengaytiradi.",
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
        uz: "Yomon emas. Imkoniyat bor, lekin u hali to‘liq ishga solinmagan.",
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
        uz: "Tajribali murabbiy va tizimli ta’lim - bu ikkisini qo‘shsangiz, natija o‘zgaradi.",
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
      characters: [],
      text: {
        uz: "Bunga o‘z kuchingiz bilan ham erishishingiz mumkin. Ammo ustoz va oddiy amaliyot bilan bu yo‘l bir necha barobar qisqaradi.",
        ru: 'До этого можно дойти и самому. Но с наставником и нормальной практикой путь становится короче в разы.',
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
          uz: "O‘qishga intilish - bu allaqachon birinchi qadamdir.",
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
        uz: "Natijasi qoniqarsiz. Bilasanmi? Aksariyat odamlar bunga urinib ham ko‘rishmaydi.",
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
        uz: "Siz sinab ko'rdingiz. Shunday qilib, ular o'rganishga tayyor.",
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
      characters: [],
      text: {
        uz: "Sotuvchilik - bu mahorat. Har qanday mahorat singari, uni ham o‘rganish mumkin. Buni professional darajada o‘rgatadiganlar ham bor.",
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
          uz: 'Boshlash uchun "iste’dodli" bo‘lish shart emas. Muhimi, to‘g‘ri muhitga tushib, to‘g‘ri tartibda o‘qish.',
          ru: 'Чтобы начать, не нужно быть "талантом". Важнее попасть в правильную среду и учиться в правильном порядке.',
        },
        characters: [
          { id: 'sardor', emotion: 'satisfied', position: 'center' },
        ],
      },
    },
  },
};
