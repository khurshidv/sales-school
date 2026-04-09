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
        uz: 'Bugungi mijozni ortiqcha gap bilan ushlab bo\'lmaysiz. Biladi. Sizdan kutadigani — aniq javob.',
        ru: 'Сегодняшнего клиента словами не впечатлишь. Она подготовлена. От вас ей нужен не блеск, а точный ответ.',
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
        uz: 'Rustam aka, Kamola xonim oldin ham kelgan. Malibu ni ko\'rib chiqqan, K5 bilan ham solishtirib bo\'lgan.',
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
      text: {
        uz: 'Qo\'ng\'iroq bo\'ldi: kechagi er-xotin bo\'yicha Javlon telefon qildi. Nilufar bilan gaplashibdi, Equinox ni yana bir ko\'rmoqchi ekanlar.',
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
        uz: 'Salom. Malibu bo\'yicha keldim. K5 bilan solishtirib chiqdim. Farqini quruq reklamasiz aytib bera olasizmi?',
        ru: 'Здравствуйте. Я по Malibu. С K5 уже сравнила. Сможете без рекламы по-простому объяснить, за что здесь разница?',
      },
      nextNodeId: 'd2_presentation',
    },

    d2_presentation: {
      id: 'd2_presentation',
      type: 'choice',
      prompt: {
        uz: 'Kamola xonim bilan suhbatni qanday boshlaysiz?',
        ru: 'Как начнёте разговор с Камолой?',
      },
      choices: [
        {
          id: 'd2_presentation_a',
          text: {
            uz: 'Siz tayyor kelibsiz. Unda vaqtni olmayman, faqat haqiqiy farqlarini aytaman.',
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
            uz: 'Malibu yomon variant emas. Keling, mashinani qisqa ko\'rib chiqamiz, keyin narxga qaytamiz.',
            ru: 'Malibu вариант хороший. Давайте коротко пройдёмся по машине, потом вернёмся к цене.',
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
            uz: 'Siz uchun birinchi o\'rinda nima turadi: qulaylikmi, texnologiyami, tinch haydashmi?',
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
        uz: 'Yaxshi. Lekin opsiyalar ro\'yxatini o\'zim ham ko\'rdim. 3 ming dollar farq faqat shu mayda qo\'shimchalar uchunmi?',
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
        uz: 'Umumiy gaplarni eshitganman. K5 — 25 ming, Malibu — 28 ming. Shu 3 ming uchun amalda nimaga ega bo\'laman?',
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
        uz: 'Qulaylik va texnologiya. Lekin buni men allaqachon solishtirganman. Savol boshqa: shu 3 ming nimani yopadi?',
        ru: 'Комфорт и технологии. Но это я уже сравнила. Вопрос в другом: что закрывает эта доплата в 3 тысячи?',
      },
      nextNodeId: 'd2_objection',
    },

    d2_objection: {
      id: 'd2_objection',
      type: 'choice',
      prompt: {
        uz: 'Narx bo\'yicha savolga nima deysiz?',
        ru: 'Что ответите на вопрос про разницу в цене?',
      },
      timeLimit: 10,
      expireNodeId: 'd2_objection_expired',
      choices: [
        {
          id: 'd2_objection_a',
          text: {
            uz: 'Bu yerda gap shunchaki opsiyada emas. Servis xarajatingizni ham kesadi. Ikki yil ichida farqining bir qismi qaytadi.',
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
            uz: 'Bozorda keyinroq sotganda ham yo\'qotishingiz kamroq bo\'ladi. Bu ham pul.',
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
            uz: 'Xohlasangiz chegirma tomonni ham so\'rab ko\'raman, lekin avval mashinaning o\'zini tushuntirib beray.',
            ru: 'Если хотите, могу отдельно уточнить по скидке. Но сначала честно объясню саму машину, чтобы не уводить разговор в сторону.',
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
        uz: 'Pauza cho\'zildi. Kamola aniqlik kutmoqda.',
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
        uz: 'Agar ikki yil servis masalasi yopilsa, bu endi aniqroq gap. Mayli, davom etamiz.',
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
        uz: 'Qayta sotishni hisobga olaman. Lekin bu asosiy sabab emas. Mashinaning o\'zi bo\'yicha yana nima deysiz?',
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
        uz: 'Chegirma keyin ham gaplashiladi. Meni qiziqtirayotgani boshqa: nega aynan shu mashina?',
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
        uz: 'Tushundim. Demak, narxdagi farq bo\'yicha hozircha aniq javob yo\'q.',
        ru: 'Поняла. Значит, по разнице в цене внятного ответа у вас пока нет.',
      },
      nextNodeId: 'd2_test_drive_offer',
    },

    // ─── TEST DRIVE SCENE ───────────────────────────────────

    d2_test_drive_offer: {
      id: 'd2_test_drive_offer',
      type: 'choice',
      prompt: {
        uz: 'Kamola hali qaror qilgani yo\'q. Qanday davom etasiz?',
        ru: 'Камола ещё не приняла решение. Как продолжите?',
      },
      choices: [
        {
          id: 'd2_test_drive_offer_a',
          text: {
            uz: 'Bir aylanish qilib ko\'ramizmi? Rulda ko\'p narsa o\'zi tushunarli bo\'lib qoladi.',
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
            uz: 'Istasangiz, shu yerning o\'zida qisqa xulosa qilamiz. Sizda yana savol bormi?',
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
        uz: 'Kamola rulga o\'tirdi. Shahar ichida qog\'ozda bilinmaydigan narsalar tezroq sezila boshladi.',
        ru: 'Камола села за руль. В городе сразу лучше чувствуются вещи, которые на бумаге не объяснишь.',
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
        uz: 'Hmm... osmasi K5 ga qaraganda yumshoqroq ekan. Salon ham yig\'iqroq, tinchroq sezilyapti.',
        ru: 'Хм... подвеска мягче, чем у K5. И салон ощущается собраннее, тише.',
      },
      nextNodeId: 'd2_test_drive_choice',
    },

    d2_test_drive_choice: {
      id: 'd2_test_drive_choice',
      type: 'choice',
      prompt: {
        uz: 'Kamola haydayotganda o\'zingizni qanday tutasiz?',
        ru: 'Как себя поведёте, пока Камола за рулём?',
      },
      choices: [
        {
          id: 'd2_test_drive_choice_a',
          text: {
            uz: 'Istasangiz, to\'g\'ri uchastkada kruizni yoqib ko\'ring. Yurganda qanday ushlashini tinchroq seziladi.',
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
            uz: 'Burilishda 360 kameraga qarab ko\'ring. Shahar parkovkasida foydasi tez bilinadi.',
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
            uz: 'Hech narsa demayman. Mashinani o\'zi xotirjam his qilib olsin.',
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
      characters: [
        { id: 'kamola', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'Tushunarli. Uzoq yo\'lda oyoq kamroq charchaydi, mashina ham tekisroq yuradi.',
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
      characters: [
        { id: 'kamola', emotion: 'impressed', position: 'center' },
      ],
      text: {
        uz: 'Rulda boshqacha bilinadi. Jadvalda buni bunaqa ko\'rmaydi odam.',
        ru: 'За рулём это воспринимается иначе. По таблице так не видно.',
      },
      nextNodeId: 'd2_closing',
    },

    // ─── CLOSING ────────────────────────────────────────────

    d2_closing: {
      id: 'd2_closing',
      type: 'choice',
      prompt: {
        uz: 'Suhbatni qanday yakunlaysiz?',
        ru: 'Как завершите разговор?',
      },
      choices: [
        {
          id: 'd2_closing_a',
          text: {
            uz: 'Istasangiz, bugungi gapning qisqa xulosasini telegramga tashlab beraman. Qayta ko\'rib chiqishingiz oson bo\'ladi.',
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
            uz: 'Agar bugun qaror qilsangiz, men shartlarni alohida kelishib ko\'rishga harakat qilaman.',
            ru: 'Если решите сегодня, я попробую отдельно согласовать для вас условия.',
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
            uz: 'Shoshmang. O\'ylab ko\'ring. Savol tug\'ilsa, yozing — men aniq javob beraman.',
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
          uz: 'Siz vaqtimni olmadingiz, shu yoqdi. Kontakt qoldiring. Balki yana bir odamga ham tavsiya qilarman.',
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
          uz: 'Kamola tayyor kelgan mijoz edi. Siz bahslashmadingiz, bosim ham qilmadingiz. Shu ish berdi.',
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
          uz: 'Kamola suhbatni eshitdi, lekin qaytadimi yo\'qmi noma\'lum. Narxdagi farqni aniqroq ochib berish kerak edi.',
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
          uz: 'Kamola ketdi. Tayyor kelgan mijoz umumiy gapni darrov sezadi. Unga ma\'ruza emas, aniq javob kerak.',
          ru: 'Камола ушла. Подготовленный клиент сразу слышит общие слова. Ему нужна не лекция, а точный ответ.',
        },
      },
    },
  },
};
