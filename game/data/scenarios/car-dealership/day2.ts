import type { Day } from '@/game/engine/types';

export const day2: Day = {
  id: 'car-day2',
  dayNumber: 2,
  title: {
    uz: `Talabchan mijoz`,
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
        uz: `Bugungi mijozga uzoq tushuntirish shart emas. U o'zi mashinalarni yaxshi tushunadi. Sizdan aniq va qisqa javob kutadi.`,
        ru: 'Сегодняшнему клиенту не нужно долго объяснять. Она сама хорошо разбирается в машинах. От вас ждёт — чётких и коротких ответов.',
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
        uz: `Rustam aka, Kamola allaqachon kelibdi. Malibuni ko'rib, K5 bilan ham solishtiribdi.`,
        ru: 'Рустам-ака, Камола уже приезжала. Malibu посмотрела, с K5 тоже сравнила.',
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
      characters: [],
      text: {
        uz: `Kecha bo'lib o'tgan juftlik haqida qo'ng'iroq bo'ldi: Javlon Nilufar bilan maslahatlashganini va Equinoxni yana bir bor ko'rishni istashayotganini aytdi.`,
        ru: 'Звонок по вчерашней паре: Жавлон сказал, что обсудили с Нилуфар и хотят ещё раз посмотреть Equinox.',
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
        uz: `Salom alaykum. Men Malibu haqida so'ramoqchiman. K5 bilan solishtirib ko'rdim. Reklamasiz, sodda tilda tushuntirib bera olasizmi, bu yerda qanday farq bor?`,
        ru: 'Здравствуйте. Я по Malibu. С K5 уже сравнила. Сможете без рекламы по-простому объяснить, за что здесь разница?',
      },
      nextNodeId: 'd2_presentation',
    },

    d2_presentation: {
      id: 'd2_presentation',
      type: 'choice',
      prompt: {
        uz: `Kamola bilan suhbatni qanday boshlaysan?`,
        ru: 'Как начнёте разговор с Камолой?',
      },
      choices: [
        {
          id: 'd2_presentation_a',
          text: {
            uz: `Tayyorgarlik bilan kelgan ekansiz. Unday bo'lsa, vaqtingizni olmayman, faqat haqiqiy farqlar haqida gapiraman.`,
            ru: 'Вы пришли подготовленной. Тогда не буду отнимать время, скажу только по реальным отличиям.',
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
            uz: `Malibu yaxshi variant ekan. Mashinani qisqacha ko'rib chiqaylik, keyin narxiga qaytamiz.`,
            ru: 'Malibu вариант хороший. Давайте коротко пройдёмся по машине, потом вернёмся к цене.',
          },
          // Камола уже изучила Malibu и сравнила с K5 (d2_anvar_files).
          // Предлагать ей «короткий обзор машины» — значит пересказывать
          // то, что она знает. Soft-флаг ce_wasted_her_time в d2_check
          // ограничивает исход до partial.
          effects: [
            { type: 'add_score', amount: -8, dimension: 'expertise' },
            { type: 'add_score', amount: -5, dimension: 'rapport' },
            { type: 'set_flag', flag: 'ce_wasted_her_time' },
          ],
          nextNodeId: 'd2_kamola_obj_value',
        },
        {
          id: 'd2_presentation_c',
          text: {
            uz: `Siz uchun hozir qaysi jihat muhimroq: qulaylik, texnologiyalarmi yoki mashinaning haydashdagi his-tuyg'ulari?`,
            ru: 'Для вас сейчас что на первом месте: комфорт, технологии или то, как машина ощущается в езде?',
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
        uz: `Mayli. Ammo variantlar ro'yxatini o'zim ham ko'rib chiqdim. 3 ming dollar farq - faqat shu kichik qo'shimchalar uchunmi?`,
        ru: 'Хорошо. Но список опций я и сама посмотрела. 3 тысячи разницы - только за эти мелкие допы?',
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
        uz: `Umumiy gaplarni avval ham eshitganman. K5 - 25 ming, Malibu - 28 ming. Bu 3 ming dollarga amalda nima olaman?`,
        ru: 'Общие слова я уже слышала. K5 — 25 тысяч, Malibu — 28. За эти 3 тысячи что я получаю на практике?',
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
        uz: `Qulaylik va texnologiyalar. Ammo buni men allaqachon taqqoslab bo'lganman. Savol boshqa masalada: bu 3 ming dollarlik qo'shimcha to'lov nimani qoplaydi?`,
        ru: 'Комфорт и технологии. Но это я уже сравнила. Вопрос в другом: что закрывает эта доплата в 3 тысячи?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_objection: {
      id: 'd2_objection',
      type: 'choice',
      prompt: {
        uz: `Narxlardagi farq haqidagi savolga qanday javob berasiz?`,
        ru: 'Что ответите на вопрос про разницу в цене?',
      },
      timeLimit: 20,
      expireNodeId: 'd2_objection_expired',
      choices: [
        {
          id: 'd2_objection_a',
          text: {
            uz: `Bu yerda farq faqat imkoniyatlarda emas. U kelajakdagi xarajatlaringizning bir qismini ham qoplaydi. Ikki yil davomida ushbu qo'shimcha to'lovning bir qismi qaytarib beriladi.`,
            ru: 'Здесь разница не только в опциях. Она ещё и часть ваших будущих расходов снимает. За два года кусок этой доплаты возвращается.',
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
            uz: `Qayta sotishda keyinchalik kamroq zarar ko'rasiz. Bu ham pul, shunchaki sotib olingan kuni emas.`,
            ru: 'При перепродаже вы потом теряете меньше. Это тоже деньги, просто не в день покупки.',
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
            uz: `Xohlasangiz, chegirma haqida alohida aniqlashtirib berishim mumkin. Lekin avval suhbatni boshqa tomonga burmaslik uchun mashinaning o'zini ochiqchasiga tushuntirib beraman.`,
            ru: 'Если хотите, могу отдельно уточнить по скидке. Но сначала честно объясню саму машину, чтобы не уводить разговор в сторону.',
          },
          // Клиент задал прямой вопрос про разницу в цене. Этот ответ
          // уводит в скидку и «ещё раз о машине» — манипуляция, не ответ.
          // Soft-флаг ce_dodged_price ограничивает исход до partial.
          effects: [
            { type: 'add_score', amount: -5, dimension: 'persuasion' },
            { type: 'add_score', amount: 3, dimension: 'empathy' },
            { type: 'set_flag', flag: 'offered_discount' },
            { type: 'set_flag', flag: 'ce_dodged_price' },
          ],
          nextNodeId: 'd2_kamola_reacts_discount',
        },
      ],
    },

    d2_objection_expired: {
      id: 'd2_objection_expired',
      type: 'score',
      // Таймаут на ценовом вопросе = молчание. С точки зрения клиента
      // это уход от прямого ответа — ставим ce_dodged_price.
      effects: [
        { type: 'add_score', amount: -8, dimension: 'timing' },
        { type: 'set_flag', flag: 'ce_dodged_price' },
      ],
      narrator: {
        uz: `Sukunat cho'zilib ketdi. Kamola aniq ma'lumot kutyapti.`,
        ru: 'Пауза затянулась. Камола ждёт конкретики.',
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
        uz: `Agar xizmat ikki yilga yopilsa, bu jiddiy masala. Mayli, davom etamiz.`,
        ru: 'Если сервис на два года закрыт, это уже предметный разговор. Ладно, давайте дальше.',
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
        uz: `Qayta sotishni ham hisobga olaman. Ammo bu asosiy dalil emas. Mashinaning o'ziga kelsak, yana qanday afzalliklar bor?`,
        ru: 'Перепродажу я тоже учитываю. Но это не главный аргумент. Что ещё есть по самой машине?',
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
        uz: `Chegirmani keyinroq muhokama qilishimiz mumkin. Hozircha meni boshqa narsa qiziqtiryapti: nega aynan shu mashina?`,
        ru: 'Скидку можно обсудить и позже. Меня пока интересует другое: почему именно эта машина?',
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
        uz: `Tushundim. Demak, narxlardagi farq tufayli hozircha aniq javob yo'q ekan-da.`,
        ru: 'Поняла. Значит, по разнице в цене внятного ответа у вас пока нет.',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    // ─── TEST DRIVE SCENE ───────────────────────────────────

    d2_test_drive_offer: {
      id: 'd2_test_drive_offer',
      type: 'choice',
      prompt: {
        uz: `Kamola hali qaror qabul qilmagan. Davom ettiraymi?`,
        ru: 'Камола ещё не приняла решение. Как продолжите?',
      },
      choices: [
        {
          id: 'd2_test_drive_offer_a',
          text: {
            uz: `Qisqacha aylanib chiqaylik. Rulda o'tirganimizda bunday narsalar odatda ortiqcha gap-so'zsiz tushunarli bo'ladi.`,
            ru: 'Давайте коротко проедем. За рулём такие вещи обычно становятся понятнее без лишних слов.',
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
            uz: `Xohlasangiz, shu yerning o'zida qisqacha xulosa qilib o'tamiz. Savollaringiz bormi?`,
            ru: 'Если хотите, прямо здесь коротко подведём итог. У вас ещё есть вопросы?',
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
        uz: `Kamola rulga o'tirdi. Shaharda qog'ozda ifodalab bo'lmaydigan narsalarni darhol his qilish mumkin.`,
        ru: 'Камола села за руль. В городе сразу лучше чувствуются вещи, которые на бумаге не объяснишь.',
      },
      nextNodeId: 'd2_kamola_drives',
    },

    d2_kamola_drives: {
      id: 'd2_kamola_drives',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'impressed',
      // Car interior scene — sprite скрыт, фон уже показывает Камолу
      // за рулём. Разные фоны (driver / passenger POV) используются
      // вместо отдельных спрайтов.
      background: 'bg_test_drive_city',
      characters: [],
      text: {
        uz: "Hm, yuribdi... K5'dan yumshoqroq ekan. Salon ham ixchamroq, sokinroq tuyulmoqda.",
        ru: 'Хм, едет... мягче, чем K5. И салон ощущается собраннее, тише.',
      },
      nextNodeId: 'd2_test_drive_choice',
    },

    d2_test_drive_choice: {
      id: 'd2_test_drive_choice',
      type: 'choice',
      prompt: {
        uz: `Kamola rulda o'tirgan paytda o'zingizni qanday tutasiz?`,
        ru: 'Как себя поведёте, пока Камола за рулём?',
      },
      choices: [
        {
          id: 'd2_test_drive_choice_a',
          text: {
            uz: `Xohlasangiz, to'g'ri yo'lda kruiz rejimini yoqing. Shunda mashina qanday tezlikda harakatlanayotganini xotirjamroq his qilasiz.`,
            ru: 'Если хотите, включите круиз на прямом участке. Так спокойнее чувствуется, как машина держит ход.',
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
            uz: `Keyingi manevrda 360° kameraga qarang. Shahar avtoturargohida uning foydasi darhol seziladi.`,
            ru: 'На следующем манёвре посмотрите на камеру 360°. В городской парковке её польза сразу видна.',
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
            uz: `Hech narsa qo'shmayapman. Mashinani o'zi xotirjam his qilsin.`,
            ru: 'Ничего не добавляю. Пусть спокойно сама почувствует машину.',
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
      characters: [],
      text: {
        uz: `Tushunarli. Uzoq yo'lda oyoq kamroq charchaydi va mashina tekisroq yuradi.`,
        ru: 'Понятно. На длинной дороге нога меньше устаёт, и машина идёт ровнее.',
      },
      nextNodeId: 'd2_closing',
    },

    d2_kamola_test_general: {
      id: 'd2_kamola_test_general',
      type: 'dialogue',
      speaker: 'kamola',
      emotion: 'impressed',
      background: 'bg_test_drive_city',
      characters: [],
      text: {
        uz: `Rulda o'tirganda bu boshqacha qabul qilinadi. Jadvalda bunday ko'rinmaydi.`,
        ru: 'За рулём это воспринимается иначе. По таблице так не видно.',
      },
      nextNodeId: 'd2_closing',
    },

    // ─── CLOSING ────────────────────────────────────────────

    d2_closing: {
      id: 'd2_closing',
      type: 'choice',
      prompt: {
        uz: `Suhbatni qanday tugatish kerak?`,
        ru: 'Как завершите разговор?',
      },
      choices: [
        {
          id: 'd2_closing_a',
          text: {
            uz: `Xohlasangiz, bugungi suhbatning qisqacha mazmunini telegram orqali yuboraman. Shunda hamma narsani yana bir bor diqqat bilan tekshirish osonroq bo'ladi.`,
            ru: 'Если хотите, я скину вам в телеграм короткую выжимку по сегодняшнему разговору. Так будет проще спокойно ещё раз всё сверить.',
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
            uz: `Bugun qaror qilsangiz, siz uchun alohida shartlarni kelishib ko'raman.`,
            ru: 'Если решите сегодня, я попробую отдельно согласовать для вас условия.',
          },
          // «Решите сегодня — будут условия» = давление. С подготовленным
          // клиентом вроде Камолы это срабатывает как красный флаг.
          // pressure_close учитывается в CRITICAL_ERROR_INSIGHTS и
          // в d2_check → cap на partial.
          effects: [
            { type: 'add_score', amount: 5, dimension: 'timing' },
            { type: 'add_score', amount: -10, dimension: 'rapport' },
            { type: 'set_flag', flag: 'pressure_close' },
          ],
          nextNodeId: 'd2_check',
        },
        {
          id: 'd2_closing_c',
          text: {
            uz: `Shoshilmang. Xotirjam o'ylab ko'ring. Savollaringiz bo'lsa, yozing - suvga cho'ktirmasdan, aniq javob beraman.`,
            ru: 'Не спешите. Спокойно подумайте. Если появятся вопросы, напишите — отвечу уже без воды, по делу.',
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

    // d2_check — routing based on critical-error flags + score.
    //
    // Логика:
    //   1. Две soft-ошибки в одном дне (любая пара) → fail.
    //      С подготовленным клиентом два промаха = потеря сделки.
    //   2. Hidden — respected_knowledge + score >= 40 + ни одной ошибки.
    //   3. Одна soft-ошибка → cap на partial, очки не помогают.
    //   4. Success — score >= 35, без флагов ошибок.
    //   5. Partial по score, иначе fail.
    d2_check: {
      id: 'd2_check',
      type: 'condition_branch',
      branches: [
        // 1. Any two soft critical errors → failure
        {
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'ce_wasted_her_time' },
                  { type: 'flag', flag: 'pressure_close' },
                ],
              },
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'ce_wasted_her_time' },
                  { type: 'flag', flag: 'ce_dodged_price' },
                ],
              },
              {
                type: 'and',
                conditions: [
                  { type: 'flag', flag: 'pressure_close' },
                  { type: 'flag', flag: 'ce_dodged_price' },
                ],
              },
            ],
          },
          nextNodeId: 'd2_end_fail',
        },
        // 2. Hidden — respected knowledge + score >= 40 (no CE flags, implicit
        //    since branch 1 already filtered out double-error cases and this
        //    branch doesn't match with pressure_close/ce_dodged_price alone).
        {
          condition: {
            type: 'and',
            conditions: [
              { type: 'score_gte', value: 40 },
              { type: 'flag', flag: 'respected_knowledge' },
              { type: 'not', condition: { type: 'flag', flag: 'ce_wasted_her_time' } },
              { type: 'not', condition: { type: 'flag', flag: 'pressure_close' } },
              { type: 'not', condition: { type: 'flag', flag: 'ce_dodged_price' } },
            ],
          },
          nextNodeId: 'd2_end_hidden',
        },
        // 3. Single soft critical error → cap at partial
        {
          condition: {
            type: 'or',
            conditions: [
              { type: 'flag', flag: 'ce_wasted_her_time' },
              { type: 'flag', flag: 'pressure_close' },
              { type: 'flag', flag: 'ce_dodged_price' },
            ],
          },
          nextNodeId: 'd2_end_partial',
        },
        // 4. Success by score (no CE flags at this point)
        {
          condition: { type: 'score_gte', value: 35 },
          nextNodeId: 'd2_end_success',
        },
        // 5. Partial fallback
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
          uz: `Hech bo'lmasa mening vaqtimni bekorga o'tkazmadingiz - bu kamdan-kam uchraydigan holat. Aloqa ma'lumotlarini qoldiring. Ehtimol, do'stimga ham siz haqingizda xabar berarman.`,
          ru: 'Вы хотя бы не тратили моё время впустую — это редкость. Оставьте контакт. Возможно, я ещё и подруге вас перешлю.',
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
          uz: `Kamola tayyor mijoz edi. Sen bahslashmading va bosim o'tkazmading. Aynan shu narsa natija berdi.`,
          ru: 'Камола была подготовленным клиентом. Вы не спорили и не давили. Это и сработало.',
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
          uz: `Kamola suhbatni oxirigacha eshitdi, ammo qaytib keladimi-yo'qmi, noma'lum. Narxlardagi farq haqida aniqroq javob kerak edi.`,
          ru: 'Камола разговор дослушала, но вернётся ли — непонятно. По разнице в цене нужен был более точный ответ.',
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
          uz: `Kamola chiqib ketdi. Tayyorlangan mijoz umumiy gaplarni darhol eshitadi. Unga ma'ruza emas, aniq javob kerak.`,
          ru: 'Камола ушла. Подготовленный клиент сразу слышит общие слова. Ему нужна не лекция, а точный ответ.',
        },
      },
    },
  },
};
