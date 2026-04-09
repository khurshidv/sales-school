# SalesUp Dialogue Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Russian dialogue for the 3-day car-dealership scenario so it feels like realistic Uzbek workplace speech, align character emotions and CTA copy with the new tone, and switch the player-facing school brand from `Sales School` to `SalesUp`.

**Architecture:** Keep the current scenario graph, node ids, scoring, and day structure intact. Treat `day1.ts`, `day2.ts`, and `day3.ts` as the canonical source for live dialogue, move CTA copy into a testable plain-data module, then adjust character emotion inventory and add only the missing visual prompt definitions required by the new script.

**Tech Stack:** TypeScript, Next.js 16, React 19, Framer Motion, Vitest, markdown prompt docs

**Spec:** `docs/superpowers/specs/2026-04-09-salesup-dialogue-redesign-design.md`

---

## File Structure Lock-In

Before implementation, keep these file responsibilities fixed:

- `game/data/scenarios/car-dealership/day1.ts`
  Russian/Uzbek node copy for Day 1 only
- `game/data/scenarios/car-dealership/day2.ts`
  Russian/Uzbek node copy for Day 2 only
- `game/data/scenarios/car-dealership/day3.ts`
  Russian/Uzbek node copy for Day 3 only, including in-scenario funnel setup
- `components/game/screens/schoolCtaCopy.ts`
  Plain exported CTA strings and brand copy used by the final screen
- `components/game/screens/SchoolCTA.tsx`
  UI-only CTA renderer consuming `schoolCtaCopy.ts`
- `game/data/characters/index.ts`
  Available emotion names for each character
- `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`
  Automated guardrails for brand strings and non-empty Russian content
- `game/docs/prompts/13-dialogue-revision-assets.md`
  New prompts for any extra emotions or rewritten scene visuals
- `game/docs/prompts/README.md`
  Prompt index entry for the new file

Do not move scenario data into new systems. Do not rename node ids. Do not add new runtime architecture.

---

### Task 0: Preflight Safety Pass

**Files:**
- Modify: none

- [ ] **Step 1: Inspect current dirty files before touching scenario content**

Run:
```bash
git status --short
git diff -- game/data/scenarios/car-dealership/day1.ts \
  components/game/screens/SchoolCTA.tsx \
  game/data/characters/index.ts
```

Expected:
- You can see existing local edits before starting.
- You know whether `day1.ts` already contains user changes that must be preserved.

- [ ] **Step 2: Confirm the current scenario still validates before content work**

Run:
```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/days.test.ts
```

Expected:
- PASS
- `9 passed`

- [ ] **Step 3: Read the approved design once before editing**

Run:
```bash
sed -n '1,260p' docs/superpowers/specs/2026-04-09-salesup-dialogue-redesign-design.md
```

Expected:
- The active constraints are visible: 3 days, realistic tone, no unexplained sales jargon, `SalesUp` branding.

---

### Task 1: Add Copy Guardrails And Extract CTA Copy

**Files:**
- Create: `components/game/screens/schoolCtaCopy.ts`
- Modify: `components/game/screens/SchoolCTA.tsx`
- Create: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Write the failing copy rules test**

```typescript
// game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
import { describe, it, expect } from 'vitest';
import { day1 } from '../day1';
import { day2 } from '../day2';
import { day3 } from '../day3';
import { schoolCtaCopy } from '@/components/game/screens/schoolCtaCopy';

function collectRuStrings(value: unknown, acc: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRuStrings(item, acc));
    return acc;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.ru === 'string') {
      acc.push(record.ru);
    }
    Object.values(record).forEach((child) => collectRuStrings(child, acc));
  }

  return acc;
}

describe('scenario copy rules', () => {
  it('all Russian scenario strings are non-empty and trimmed', () => {
    const lines = [
      ...collectRuStrings(day1.nodes),
      ...collectRuStrings(day2.nodes),
      ...collectRuStrings(day3.nodes),
    ];

    expect(lines.length).toBeGreaterThan(0);

    for (const line of lines) {
      expect(line.length).toBeGreaterThan(0);
      expect(line.trim()).toBe(line);
    }
  });

  it('CTA copy does not mention the old school brand', () => {
    const combined = JSON.stringify(schoolCtaCopy);

    expect(combined).not.toContain('Sales School');
    expect(combined).toContain('SalesUp');
  });

  it('CTA copy uses the SalesUp brand', () => {
    expect(schoolCtaCopy.schoolInfo.tagline.ru).toContain('SalesUp');
    expect(schoolCtaCopy.schoolInfo.tagline.uz).toContain('SalesUp');
  });

  it('CTA copy has ru and uz text for every ending', () => {
    const endings = ['grandmaster', 'success', 'partial', 'failure'] as const;

    for (const ending of endings) {
      expect(schoolCtaCopy.headlines[ending].ru.length).toBeGreaterThan(0);
      expect(schoolCtaCopy.headlines[ending].uz.length).toBeGreaterThan(0);
      expect(schoolCtaCopy.ctaText[ending].ru.length).toBeGreaterThan(0);
      expect(schoolCtaCopy.ctaText[ending].uz.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:
```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- FAIL
- `Cannot find module '@/components/game/screens/schoolCtaCopy'`

- [ ] **Step 3: Create `schoolCtaCopy.ts` and switch the brand to `SalesUp`**

```typescript
// components/game/screens/schoolCtaCopy.ts
export type SchoolCtaEnding = 'grandmaster' | 'success' | 'partial' | 'failure';

export const schoolCtaCopy = {
  headlines: {
    grandmaster: {
      uz: 'Siz tayyor. Keyingi qadam — buni barqaror natijaga aylantirish.',
      ru: 'У вас есть база. Следующий шаг — превратить это в стабильный результат.',
    },
    success: {
      uz: 'Siz yo\'nalishni ushladingiz. Endi buni tizimga aylantirish kerak.',
      ru: 'Направление вы поймали. Теперь это нужно превратить в систему.',
    },
    partial: {
      uz: 'Potensial bor. Uni ochish uchun mashq va yo\'l-yo\'riq kerak.',
      ru: 'Потенциал есть. Чтобы раскрыть его, нужны практика и правильное направление.',
    },
    failure: {
      uz: 'Qiyin bo\'ldi. Bu normal. Muhimi — shu yerdan to\'g\'ri boshlash.',
      ru: 'Было тяжело. Это нормально. Главное — правильно стартовать дальше.',
    },
  },
  ctaText: {
    grandmaster: {
      uz: 'SalesUp haqida maslahat olishni xohlayman',
      ru: 'Хочу получить консультацию по SalesUp',
    },
    success: {
      uz: 'SalesUp dasturi haqida ko\'proq bilmoqchiman',
      ru: 'Хочу подробнее узнать о программе SalesUp',
    },
    partial: {
      uz: 'Ko\'nikmalarimni SalesUp bilan kuchaytirmoqchiman',
      ru: 'Хочу усилить навыки через SalesUp',
    },
    failure: {
      uz: 'SalesUp bilan o\'qishni boshlashga tayyorman',
      ru: 'Я готов начать обучение в SalesUp',
    },
  },
  schoolInfo: {
    tagline: {
      uz: 'SalesUp — 3 oyda sotuvni ish darajasiga olib chiqadigan dastur',
      ru: 'SalesUp — программа, которая за 3 месяца доводит навыки продаж до рабочего уровня',
    },
    features: {
      uz: 'Shaxsiy mentor, amaliy mashg\'ulotlar va real vaziyatlarga yaqin simulyatsiyalar',
      ru: 'Личный ментор, практика и разбор ситуаций, похожих на реальные рабочие кейсы',
    },
    results: {
      uz: 'Bitiruvchilar amaliyot va tizim orqali daromadini tezroq o\'stiradi',
      ru: 'Выпускники быстрее растут в доходе за счёт системы, практики и обратной связи',
    },
  },
  dismissText: {
    uz: 'Hozircha emas',
    ru: 'Пока не сейчас',
  },
} satisfies {
  headlines: Record<SchoolCtaEnding, { uz: string; ru: string }>;
  ctaText: Record<SchoolCtaEnding, { uz: string; ru: string }>;
  schoolInfo: {
    tagline: { uz: string; ru: string };
    features: { uz: string; ru: string };
    results: { uz: string; ru: string };
  };
  dismissText: { uz: string; ru: string };
};
```

- [ ] **Step 4: Update `SchoolCTA.tsx` to consume the extracted copy**

```typescript
// components/game/screens/SchoolCTA.tsx
'use client';

import { motion } from 'framer-motion';
import { schoolCtaCopy, type SchoolCtaEnding } from './schoolCtaCopy';

interface SchoolCTAProps {
  ending: SchoolCtaEnding;
  lang: 'uz' | 'ru';
  playerPhone?: string;
  onConsultation: () => void;
  onDismiss: () => void;
}

export default function SchoolCTA({
  ending,
  lang,
  playerPhone,
  onConsultation,
  onDismiss,
}: SchoolCTAProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <motion.div className="flex flex-col items-center max-w-lg w-full px-6 py-8 gap-6 text-center">
        <motion.h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {schoolCtaCopy.headlines[ending][lang]}
        </motion.h1>

        <motion.div className="flex flex-col gap-3 w-full">
          <div className="rounded-xl px-5 py-4">
            <p className="text-sm font-medium mb-2">
              {schoolCtaCopy.schoolInfo.tagline[lang]}
            </p>
            <p className="text-xs leading-relaxed">
              {schoolCtaCopy.schoolInfo.features[lang]}
            </p>
          </div>

          <div className="rounded-xl px-5 py-3">
            <p className="text-sm">
              {schoolCtaCopy.schoolInfo.results[lang]}
            </p>
          </div>
        </motion.div>

        <motion.button onClick={onConsultation} className="w-full rounded-xl px-6 py-4 text-sm font-semibold">
          {schoolCtaCopy.ctaText[ending][lang]}
        </motion.button>

        <motion.button onClick={onDismiss} className="text-xs py-2 transition-colors">
          {schoolCtaCopy.dismissText[lang]}
        </motion.button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Re-run the copy rules test**

Run:
```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `4 passed`

- [ ] **Step 6: Commit**

```bash
git add components/game/screens/SchoolCTA.tsx \
  components/game/screens/schoolCtaCopy.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
git commit -m "refactor(copy): extract SalesUp CTA copy and add guardrails"
```

---

### Task 2: Rewrite Day 1 Into A Real First-Shift Scene

**Files:**
- Modify: `game/data/scenarios/car-dealership/day1.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Rewrite the opening staff beat so it sounds like a real sales floor**

Replace the opening `ru` lines in these nodes:
- `d1_morning`
- `d1_meet_rustam`
- `d1_rustam_tip`
- `d1_meet_dilnoza`
- `d1_dilnoza_tip`
- `d1_meet_anvar`
- `d1_anvar_info`

```typescript
d1_meet_rustam: {
  // ...
  text: {
    uz: 'Xush kelibsiz. Boshida eng katta xato — odamni eshitmay turib gapni boshlab yuborish.',
    ru: 'Добро пожаловать. В начале самая частая ошибка простая: человек ещё рот не открыл, а продавец уже говорит.',
  },
},
d1_rustam_tip: {
  // ...
  text: {
    uz: 'Bugun juftlik keladi. Biriga yopishib olmang. Ikkinchisi jim bo\'lsa ham, qarorni baribir ikkovi qiladi.',
    ru: 'Сегодня придёт пара. Не прилипайте к одному. Даже если второй молчит, решение всё равно принимают вдвоём.',
  },
},
d1_meet_dilnoza: {
  // ...
  text: {
    uz: 'Birinchi mijozdan oldin hamma hayajon qiladi. Faqat buni yuzingizdan bildirib qo\'ymang.',
    ru: 'Перед первым клиентом всех потряхивает. Просто не покажите это лицом.',
  },
},
d1_dilnoza_tip: {
  // ...
  text: {
    uz: 'Juftlik bilan gaplashganda mashinani darrov sotmaysiz. Avval ikkovini bitta suhbatga yig\'asiz.',
    ru: 'Когда приходят вдвоём, машину сразу не продают. Сначала собирают обоих в один разговор.',
  },
},
d1_anvar_info: {
  // ...
  text: {
    uz: 'Ular ichkariga kirishdan oldinyoq tortishib kelyapti shekilli. Eriga tezlik yoqadi, ayoli esa bolalar uchun qulaylikni o\'ylayapti.',
    ru: 'Похоже, они ещё на входе между собой спорили. Ему важнее драйв, ей — чтобы с детьми было удобно.',
  },
},
```

- [ ] **Step 2: Rewrite the couple conflict and player choices into plain speech**

Update these nodes and choice texts:
- `d1_who_first`
- `d1_conflict_both`
- `d1_conflict_both_nilufar`
- `d1_conflict_tracker`
- `d1_conflict_tracker_nilufar`
- `d1_conflict_equinox`
- `d1_conflict_equinox_javlon`
- `d1_compromise`
- `d1_compromise_balanced`
- `d1_compromise_balanced_nilufar`
- `d1_compromise_sport`
- `d1_compromise_sport_nilufar`
- `d1_compromise_tradein`
- `d1_compromise_tradein_nilufar`

```typescript
d1_compromise: {
  // ...
  prompt: {
    uz: 'Ikkovi ham o\'z gapida turibdi. Nima deysiz?',
    ru: 'Оба стоят на своём. Что скажете?',
  },
  choices: [
    {
      id: 'd1_compromise_a',
      text: {
        uz: 'Ikkovingiz ham to\'g\'ri gapiryapsiz. Keling, avval hozir oilaga nima qulayroq ekanini ajratib olaylik.',
        ru: 'Вы оба по-своему правы. Давайте сначала спокойно поймём, что вам сейчас важнее именно для семьи.',
      },
    },
    {
      id: 'd1_compromise_b',
      text: {
        uz: 'Equinoxni bir marta yurib ko\'raylik. Balki undagi qulaylik va boshqaruv ikkovingizga ham to\'g\'ri kelar.',
        ru: 'Давайте один раз проедем на Equinox. Возможно, по факту он устроит вас обоих больше, чем кажется сейчас.',
      },
    },
    {
      id: 'd1_compromise_c',
      text: {
        uz: 'Hozir Tracker olib, keyin almashtirishni ham ko\'rish mumkin. Lekin bu sizlarga qanchalik qulay — shuni oldin o\'ylab olaylik.',
        ru: 'Можно и через trade-in потом поменять. Но сначала честно поймём, удобно ли вам вообще жить с таким вариантом.',
      },
    },
  ],
},
d1_conflict_tracker_nilufar: {
  // ...
  text: {
    uz: 'Javlon, yana shu gap. Tezligi yaxshi bo\'lishi mumkin, lekin men har kuni bolalar bilan yuraman. Meni ham eshiting.',
    ru: 'Жавлон, опять то же самое. Может, он и резвый, но с детьми каждый день езжу я тоже. Меня тоже надо услышать.',
  },
},
d1_compromise_balanced_nilufar: {
  // ...
  text: {
    uz: 'Rahmat. Hech bo\'lmasa gapni ikkovimiz tomondan ham eshityapsiz.',
    ru: 'Спасибо. Хотя бы разговор не ушёл только в одну сторону.',
  },
},
```

- [ ] **Step 3: Rewrite the test drive, anniversary beat, and endings with less postcard language**

Update these nodes and choice texts:
- `d1_test_drive_offer`
- `d1_test_drive`
- `d1_test_drive_javlon`
- `d1_test_drive_nilufar`
- `d1_test_drive_choice`
- `d1_test_drive_safety`
- `d1_test_drive_value`
- `d1_test_drive_silent`
- `d1_anniversary_hint`
- `d1_closing`
- `d1_end_hidden`
- `d1_end_success`
- `d1_end_partial`
- `d1_end_fail`

```typescript
d1_anniversary_hint: {
  // ...
  text: {
    uz: 'Aytganday, keyingi hafta to\'yimizning besh yilligi.',
    ru: 'Кстати, на следующей неделе у нас пятилетие свадьбы.',
  },
},
d1_closing: {
  // ...
  choices: [
    {
      id: 'd1_closing_b',
      text: {
        uz: 'Agar qaror qilsangiz, topshirishni o\'sha kuningizga chiroyli qilib tayyorlab beramiz. Sovg\'adek bo\'ladi.',
        ru: 'Если решитесь, можем красиво подготовить выдачу именно к вашей дате. Получится как настоящий подарок.',
      },
    },
  ],
},
d1_end_hidden: {
  // ...
  dialogue: {
    speaker: 'javlon',
    emotion: 'touched',
    text: {
      uz: 'Mana bu yoqdi. Shunchaki mashina sotmay, vaziyatimizni ham ushladingiz. Olamiz.',
      ru: 'Вот это уже сильно. Вы не просто машину показали, вы нас самих правильно прочитали. Берём.',
    },
  },
},
d1_end_success: {
  // ...
  dialogue: {
    speaker: 'rustam',
    emotion: 'proud',
    text: {
      uz: 'Yomon ishlamadingiz. Eng muhimi — birini bosib, ikkinchisini yo\'qotib qo\'ymadingiz.',
      ru: 'Неплохо отработали. Главное — не потеряли одного, пока разговаривали со вторым.',
    },
  },
},
```

- [ ] **Step 4: Run validation tests after the full Day 1 rewrite**

Run:
```bash
npx vitest run \
  game/data/scenarios/car-dealership/__tests__/days.test.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `13 passed`

- [ ] **Step 5: Do the manual Day 1 copy review**

Run:
```bash
sed -n '1,260p' game/data/scenarios/car-dealership/day1.ts
sed -n '261,520p' game/data/scenarios/car-dealership/day1.ts
sed -n '521,900p' game/data/scenarios/car-dealership/day1.ts
```

Expected manual checklist:
- Rustam does not sound like a course lecturer
- Dilnoza sounds sharp, not banner-like
- the couple sounds like a real couple, not two training archetypes
- hidden ending line feels earned, not sugary

- [ ] **Step 6: Commit**

```bash
git add game/data/scenarios/car-dealership/day1.ts
git commit -m "feat(copy): rewrite day 1 dialogue for realistic tone"
```

---

### Task 3: Rewrite Day 2 So Kamola Feels Competent, Not Scripted

**Files:**
- Modify: `game/data/scenarios/car-dealership/day2.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Rewrite the opening brief and the first contact**

Update:
- `d2_intro`
- `d2_anvar_files`
- `d2_callback`
- `d2_kamola_enters`
- `d2_presentation`

```typescript
d2_intro: {
  // ...
  text: {
    uz: 'Bugungi mijozni ortiqcha gap bilan ushlab bo\'lmaysiz. Biladi. Sizdan kutadigani — aniq javob.',
    ru: 'Сегодняшнего клиента словами не впечатлишь. Она подготовлена. От вас ей нужен не блеск, а точный ответ.',
  },
},
d2_kamola_enters: {
  // ...
  text: {
    uz: 'Salom. Malibu bo\'yicha keldim. K5 bilan solishtirib chiqdim. Farqini quruq reklamasiz aytib bera olasizmi?',
    ru: 'Здравствуйте. Я по Malibu. С K5 уже сравнила. Сможете без рекламы по-простому объяснить, за что здесь разница?',
  },
},
d2_presentation: {
  // ...
  choices: [
    {
      id: 'd2_presentation_a',
      text: {
        uz: 'Siz tayyor kelibsiz. Unda vaqtni olmayman, faqat haqiqiy farqlarini aytaman.',
        ru: 'Вы пришли подготовленной. Тогда не буду отнимать время, скажу только по реальным отличиям.',
      },
    },
    {
      id: 'd2_presentation_c',
      text: {
        uz: 'Siz uchun birinchi o\'rinda nima turadi: qulaylikmi, texnologiyami, tinch haydashmi?',
        ru: 'Для вас сейчас что на первом месте: комфорт, технологии или то, как машина ощущается в езде?',
      },
    },
  ],
},
```

- [ ] **Step 2: Rewrite the objection block into plain business speech**

Update:
- `d2_kamola_obj_features`
- `d2_kamola_obj_value`
- `d2_kamola_obj_priorities`
- `d2_objection`
- `d2_objection_expired`
- `d2_kamola_reacts_service`
- `d2_kamola_reacts_resale`
- `d2_kamola_reacts_discount`
- `d2_kamola_reacts_timeout`

```typescript
d2_objection: {
  // ...
  prompt: {
    uz: 'Narx bo\'yicha savolga nima deysiz?',
    ru: 'Что ответите на вопрос про разницу в цене?',
  },
  choices: [
    {
      id: 'd2_objection_a',
      text: {
        uz: 'Bu yerda gap shunchaki opsiyada emas. Servis xarajatingizni ham kesadi. Ikki yil ichida farqining bir qismi qaytadi.',
        ru: 'Здесь разница не только в опциях. Она ещё и часть ваших будущих расходов снимает. За два года кусок этой доплаты возвращается.',
      },
    },
    {
      id: 'd2_objection_b',
      text: {
        uz: 'Bozorda keyinroq sotganda ham yo\'qotishingiz kamroq bo\'ladi. Bu ham pul.',
        ru: 'При перепродаже вы потом теряете меньше. Это тоже деньги, просто не в день покупки.',
      },
    },
    {
      id: 'd2_objection_c',
      text: {
        uz: 'Xohlasangiz chegirma tomonni ham so\'rab ko\'raman, lekin avval mashinaning o\'zini tushuntirib beray.',
        ru: 'Если хотите, могу отдельно уточнить по скидке. Но сначала честно объясню саму машину, чтобы не уводить разговор в сторону.',
      },
    },
  ],
},
d2_kamola_reacts_discount: {
  // ...
  text: {
    uz: 'Chegirma keyin ham gaplashiladi. Meni qiziqtirayotgani boshqa: nega aynan shu mashina?',
    ru: 'Скидку можно обсудить и позже. Меня пока интересует другое: почему именно эта машина?',
  },
},
```

- [ ] **Step 3: Rewrite the test drive and closing so Kamola respects clarity instead of pressure**

Update:
- `d2_test_drive_offer`
- `d2_test_drive`
- `d2_kamola_drives`
- `d2_test_drive_choice`
- `d2_kamola_test_cruise`
- `d2_kamola_test_general`
- `d2_closing`
- `d2_end_hidden`
- `d2_end_success`
- `d2_end_partial`
- `d2_end_fail`

```typescript
d2_test_drive_offer: {
  // ...
  choices: [
    {
      id: 'd2_test_drive_offer_a',
      text: {
        uz: 'Bir aylanish qilib ko\'ramizmi? Rulda ko\'p narsa o\'zi tushunarli bo\'lib qoladi.',
        ru: 'Давайте коротко проедем. За рулём такие вещи обычно становятся понятнее без лишних слов.',
      },
    },
  ],
},
d2_closing: {
  // ...
  choices: [
    {
      id: 'd2_closing_a',
      text: {
        uz: 'Istasangiz, bugungi gapning qisqa xulosasini telegramga tashlab beraman. Qayta ko\'rib chiqishingiz oson bo\'ladi.',
        ru: 'Если хотите, я скину вам в телеграм короткую выжимку по сегодняшнему разговору. Так будет проще спокойно ещё раз всё сверить.',
      },
    },
    {
      id: 'd2_closing_c',
      text: {
        uz: 'Shoshmang. O\'ylab ko\'ring. Savol tug\'ilsa, yozing — men aniq javob beraman.',
        ru: 'Не спешите. Спокойно подумайте. Если появятся вопросы, напишите — отвечу уже без воды, по делу.',
      },
    },
  ],
},
d2_end_hidden: {
  // ...
  dialogue: {
    speaker: 'kamola',
    emotion: 'impressed',
    text: {
      uz: 'Siz vaqtimni olmadingiz, shu yoqdi. Kontakt qoldiring. Balki yana bir odamga ham tavsiya qilarman.',
      ru: 'Вы хотя бы не тратили моё время впустую — это редкость. Оставьте контакт. Возможно, я ещё и подруге вас перешлю.',
    },
  },
},
```

- [ ] **Step 4: Run tests after the Day 2 rewrite**

Run:
```bash
npx vitest run \
  game/data/scenarios/car-dealership/__tests__/days.test.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `13 passed`

- [ ] **Step 5: Do the manual Day 2 copy review**

Run:
```bash
sed -n '1,260p' game/data/scenarios/car-dealership/day2.ts
sed -n '261,640p' game/data/scenarios/car-dealership/day2.ts
```

Expected manual checklist:
- Kamola sounds prepared, not cartoonishly difficult
- no raw training jargon appears in her conversation
- positive ending is restrained and believable
- player choices sound sayable out loud

- [ ] **Step 6: Commit**

```bash
git add game/data/scenarios/car-dealership/day2.ts
git commit -m "feat(copy): rewrite day 2 dialogue for realistic business tone"
```

---

### Task 4: Rewrite Day 3 VIP Block For Higher Stakes

**Files:**
- Modify: `game/data/scenarios/car-dealership/day3.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Rewrite the VIP intro and preparation so the money feels real**

Update:
- `d3_intro`
- `d3_intro2`
- `d3_preparation`
- `d3_anvar_info`
- `d3_abdullaev_arrives`
- `d3_abdullaev_enters`
- `d3_greeting`

```typescript
d3_intro: {
  // ...
  text: {
    uz: 'Bugun boshqa daraja. Vaqtni ham, xizmatni ham hisoblab gapiradigan odam keladi.',
    ru: 'Сегодня другой уровень. Придёт человек, который сразу считает и время, и сервис, и вашу собранность.',
  },
},
d3_abdullaev_enters: {
  // ...
  text: {
    uz: 'Salom. Vaqtim qisqa. Uchta Malibu ish uchun, bitta Tahoe uy uchun. Kerakli gapni ayting.',
    ru: 'Здравствуйте. Времени мало. Три Malibu для работы, один Tahoe для дома. Говорите только по делу.',
  },
},
d3_greeting: {
  // ...
  choices: [
    {
      id: 'd3_greeting_a',
      text: {
        uz: 'Abdullaev janoblari, tayyorgarlik ko\'rdik. Keling, tinch joyda qisqa va aniq ko\'rib chiqamiz.',
        ru: 'Господин Абдуллаев, мы подготовились. Давайте в спокойном месте коротко и по делу всё соберём.',
      },
    },
    {
      id: 'd3_greeting_c',
      text: {
        uz: 'Kompaniyangizning park bo\'yicha tajribasini ko\'rdim. Shunga qarab ikki variant tayyorlab qo\'ydim.',
        ru: 'Посмотрел, как ваша компания уже покупала парк раньше. Под это подготовил два понятных варианта.',
      },
    },
  ],
},
```

- [ ] **Step 2: Rewrite fleet and Tahoe offers to sound like assembled solutions, not brochure text**

Update:
- `d3_walk_to_vip`
- `d3_vip_arrival`
- `d3_abdullaev_reacts_direct`
- `d3_abdullaev_reacts_research`
- `d3_fleet`
- `d3_fleet_expired`
- `d3_wife_car`
- `d3_abd_hidden`
- `d3_abd_success`
- `d3_abd_partial`
- `d3_abd_fail`

```typescript
d3_fleet: {
  // ...
  prompt: {
    uz: 'Uchta Malibu bo\'yicha taklifni qanday yig\'asiz?',
    ru: 'Как соберёте предложение по трём Malibu?',
  },
  choices: [
    {
      id: 'd3_fleet_a',
      text: {
        uz: 'Mashinalarni yalang\'och bermaymiz: servis, kuzatuv va korporativ shartni bitta paketga yig\'amiz.',
        ru: 'Мы не отдаём машины "голыми": собираем пакет сразу с сервисом, сопровождением и корпоративными условиями.',
      },
    },
    {
      id: 'd3_fleet_c',
      text: {
        uz: 'Narxni ham shu yerda aniq ko\'rsataman, keyin ichida nimasi borligini birma-bir ochib beraman.',
        ru: 'Сразу покажу честную цифру по цене, а потом коротко разложу, что в неё уже входит.',
      },
    },
  ],
},
d3_wife_car: {
  // ...
  choices: [
    {
      id: 'd3_wife_a',
      text: {
        uz: 'Ayolingizga qulaylik tomonidan yig\'amiz: saloni, o\'rindig\'i, tovushi, mayda detalgacha.',
        ru: 'Для супруги соберём машину с упором на комфорт: посадка, салон, звук и все мелочи, которые чувствуются каждый день.',
      },
    },
    {
      id: 'd3_wife_c',
      text: {
        uz: 'Xohlasangiz, buni to\'rttasini alohida emas, bitta umumiy yechim sifatida yopamiz.',
        ru: 'Если вам удобно, можем закрыть всё это не четырьмя разрозненными машинами, а одним цельным решением.',
      },
    },
  ],
},
d3_abd_success: {
  // ...
  text: {
    uz: 'Yaxshi ushladingiz. VIP bilan gaplashganda ortiqcha gap emas, tayyorgarlik ishlaydi.',
    ru: 'Неплохо. С такими клиентами работает не красноречие, а подготовка.',
  },
},
```

- [ ] **Step 3: Run tests after the VIP rewrite**

Run:
```bash
npx vitest run \
  game/data/scenarios/car-dealership/__tests__/days.test.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `13 passed`

- [ ] **Step 4: Commit**

```bash
git add game/data/scenarios/car-dealership/day3.ts
git commit -m "feat(copy): rewrite day 3 vip block for higher stakes"
```

---

### Task 5: Rewrite Sardor And The Final Funnel Without Landing-Page Dialogue

**Files:**
- Modify: `game/data/scenarios/car-dealership/day3.ts`
- Modify: `components/game/screens/schoolCtaCopy.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Rewrite Sardor before the reveal so he is quiet, not theatrical**

Update:
- `d3_transition`
- `d3_rustam_mid`
- `d3_dilnoza_tip`
- `d3_sardor_enters`
- `d3_sardor_approach`
- `d3_sardor_approach_expired`
- `d3_needs`
- `d3_objection`
- `d3_objection_expired`
- `d3_sardor_closing`
- `d3_sardor_closing_expired`

```typescript
d3_sardor_enters: {
  // ...
  text: {
    uz: 'Ichkariga oddiy kiyingan odam kirdi. Hech narsaga shoshmaydi. Faqat kuzatyapti.',
    ru: 'В зал зашёл просто одетый мужчина. Ни к чему не тянется, никого не зовёт. Просто смотрит.',
  },
},
d3_sardor_approach: {
  // ...
  choices: [
    {
      id: 'd3_sardor_approach_a',
      text: {
        uz: 'Assalomu alaykum. Bemalol qarang. Kerak bo\'lsa, yoningizdaman.',
        ru: 'Здравствуйте. Спокойно смотрите. Если понадоблюсь, я рядом.',
      },
    },
    {
      id: 'd3_sardor_approach_c',
      text: {
        uz: 'Cobalt ko\'ryapsizmi? Bizda eng ko\'p shuni olishadi.',
        ru: 'Cobalt смотрите? Его у нас чаще всего и берут.',
      },
    },
  ],
},
d3_objection: {
  // ...
  choices: [
    {
      id: 'd3_objection_a',
      text: {
        uz: 'Bu savolni ko\'p berishadi. Yashirmay aytsam, rasmiy servis bilan ishlasangiz bosh og\'riq ancha kamayadi.',
        ru: 'Этот вопрос часто задают. Если честно, при нормальном официальном сервисе там намного меньше проблем, чем люди себе представляют.',
      },
    },
    {
      id: 'd3_objection_b',
      text: {
        uz: 'Yo\'q, unday muammo yo\'q endi.',
        ru: 'Нет, сейчас такой проблемы уже нет.',
      },
    },
  ],
},
```

- [ ] **Step 2: Rewrite the reveal and all four ending branches so they point to system, not slogans**

Update:
- `d3_reveal`
- `d3_team_reaction`
- `d3_gm_sardor1`
- `d3_gm_sardor2`
- `d3_gm_sardor3`
- `d3_gm_sardor4`
- `d3_gm_dilnoza`
- `d3_gm_rustam`
- `d3_gm_school`
- `d3_gm_cta`
- `d3_s_sardor1`
- `d3_s_sardor2`
- `d3_s_school`
- `d3_s_cta`
- `d3_p_sardor1`
- `d3_p_sardor2`
- `d3_p_school`
- `d3_p_cta`
- `d3_f_sardor1`
- `d3_f_sardor2`
- `d3_f_school`
- `d3_f_cta`

```typescript
d3_reveal: {
  // ...
  text: {
    uz: 'Aslida men oddiy xaridor emasman. Sizning ishlashingizni ko\'rish uchun yuborilgandim.',
    ru: 'На самом деле я пришёл не как обычный клиент. Меня отправили посмотреть, как вы работаете.',
  },
},
d3_gm_sardor2: {
  // ...
  text: {
    uz: 'Lekin bitta kunlik yaxshi ish hali yetarli emas. Natija har kuni takrorlanishi kerak.',
    ru: 'Но один сильный день ещё ничего не гарантирует. Настоящий уровень начинается там, где результат повторяется каждый день.',
  },
},
d3_s_sardor2: {
  // ...
  text: {
    uz: 'Sizda sezgi bor. Endi unga tayanch kerak: tizim, mashq va to\'g\'ri tahlil.',
    ru: 'Чутьё у вас есть. Теперь ему нужна опора: система, практика и разбор собственных ошибок.',
  },
},
d3_p_school: {
  // ...
  text: {
    uz: 'Buni yolg\'iz topish ham mumkin, lekin ustoz bilan yo\'l ancha tez qisqaradi.',
    ru: 'До этого можно дойти и самому. Но с наставником и нормальной практикой путь становится короче в разы.',
  },
},
d3_f_cta: {
  // ...
  dialogue: {
    speaker: 'sardor',
    emotion: 'satisfied',
    text: {
      uz: 'Boshlash uchun super bo\'lish shart emas. To\'g\'ri joyda, to\'g\'ri tartibda o\'rganish muhim.',
      ru: 'Чтобы начать, не нужно быть "талантом". Важнее попасть в правильную среду и учиться в правильном порядке.',
    },
  },
},
```

- [ ] **Step 3: Tighten `schoolCtaCopy.ts` so the final screen sounds like a career step, not a hard sell**

```typescript
// components/game/screens/schoolCtaCopy.ts
export const schoolCtaCopy = {
  // ...
  schoolInfo: {
    tagline: {
      uz: 'SalesUp — sotuvni amaliy ish darajasiga olib chiqadigan dastur',
      ru: 'SalesUp — программа, которая переводит продажи из "чутья" в рабочую систему',
    },
    features: {
      uz: 'Mentor, amaliy mashq va real ishga yaqin vaziyatlar bilan',
      ru: 'С наставником, практикой и разбором ситуаций, близких к реальной работе',
    },
    results: {
      uz: 'Tizimli o\'qiganlar tezroq o\'sadi va ishda o\'zini barqarorroq tutadi',
      ru: 'Те, кто учатся системно, быстрее растут и увереннее чувствуют себя в реальной работе',
    },
  },
};
```

- [ ] **Step 4: Run the full copy and day validation suite**

Run:
```bash
npx vitest run \
  game/data/scenarios/car-dealership/__tests__/days.test.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `13 passed`

- [ ] **Step 5: Do the manual Day 3 copy review**

Run:
```bash
sed -n '1,360p' game/data/scenarios/car-dealership/day3.ts
sed -n '361,760p' game/data/scenarios/car-dealership/day3.ts
sed -n '761,1345p' game/data/scenarios/car-dealership/day3.ts
```

Expected manual checklist:
- Abdullaev sounds expensive and dry, not theatrical
- Sardor before reveal is calm and easy to underestimate
- ending speeches say "system/practice/mentor" more often than brand names
- `SalesUp` appears clearly in the final CTA layer

- [ ] **Step 6: Commit**

```bash
git add game/data/scenarios/car-dealership/day3.ts \
  components/game/screens/schoolCtaCopy.ts
git commit -m "feat(copy): rewrite day 3 finale and SalesUp funnel"
```

---

### Task 6: Add Missing Emotions And Prompt Definitions

**Files:**
- Modify: `game/data/characters/index.ts`
- Create: `game/docs/prompts/13-dialogue-revision-assets.md`
- Modify: `game/docs/prompts/README.md`
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`

- [ ] **Step 1: Extend the character emotion registry for the new dialogue beats**

```typescript
// game/data/characters/index.ts
const kamola: CharacterDefinition = {
  id: 'kamola',
  name: { uz: 'Kamola', ru: 'Kamola' },
  role: 'client',
  emotions: ['confident', 'skeptical', 'impressed', 'checking', 'neutral', 'approving'],
  assetPath: makeAssetPath('kamola'),
};

const javlon: CharacterDefinition = {
  id: 'javlon',
  name: { uz: 'Javlon', ru: 'Javlon' },
  role: 'client',
  emotions: ['stubborn', 'thinking', 'touched', 'neutral', 'softened'],
  assetPath: makeAssetPath('javlon'),
};

const abdullaev: CharacterDefinition = {
  id: 'abdullaev',
  name: { uz: 'Abdullayev', ru: 'Abdullayev' },
  role: 'client',
  emotions: ['impatient', 'neutral', 'impressed', 'poker', 'evaluating'],
  assetPath: makeAssetPath('abdullaev'),
};

const sardor: CharacterDefinition = {
  id: 'sardor',
  name: { uz: 'Sardor', ru: 'Sardor' },
  role: 'client',
  emotions: [
    'neutral',
    'testing',
    'revealing',
    'impressed',
    'satisfied',
    'testing_notes',
    'observing',
    'neutral_alt',
    'measured',
  ],
  assetPath: makeAssetPath('sardor'),
};
```

- [ ] **Step 2: Create the new prompt pack for only the missing visual assets**

```markdown
# Промпты — Dialogue Revision Assets
# Инструмент: Gemini Imagen
# Размер: 512x768 portrait, PNG с прозрачным фоном

## CHR-R01 | Жавлон — `softened`
Используется: Day 1, когда его наконец услышали и спор внутри пары немного спал

### Промпт
GTA V loading screen portrait art style, half-body shot of an Uzbek man in his early 30s,
same base look as Javlon, confident sporty man whose posture has softened after being heard,
arms no longer crossed, guarded but calmer face, slight exhale, tension leaving the jaw,
still masculine and self-assured, semi-realistic illustration, Rockstar Games concept art quality,
transparent background, highly detailed, no text

## CHR-R02 | Камола — `approving`
Используется: Day 2, когда она слышит точный ответ и уважает собеседника, но без яркой улыбки

### Промпт
GTA V loading screen portrait art style, half-body shot of an Uzbek businesswoman in her mid-30s,
same base look as Kamola, subtle professional approval, measured nod, eyes softened slightly,
phone lowered a little, respect without warmth overload, restrained expression, semi-realistic illustration,
transparent background, highly detailed, no text

## CHR-R03 | Абдуллаев — `evaluating`
Используется: Day 3 VIP block, когда он ещё не впечатлён, но уже внимательно взвешивает предложение

### Промпт
GTA V loading screen portrait art style, half-body shot of a powerful Uzbek CEO in his 50s,
same base look as Abdullaev, cool analytical expression, eyes narrowed slightly, chin lowered a fraction,
measuring the speaker, composed expensive presence, no smile, semi-realistic illustration,
transparent background, highly detailed, no text

## CHR-R04 | Сардор — `measured`
Используется: Day 3 final branches, когда он уже раскрылся, но говорит спокойно и без пафоса

### Промпт
GTA V loading screen portrait art style, half-body shot of an Uzbek man in his 40s,
same revealed-authority base as Sardor, calm measured approval, very slight restrained smile,
steady eye contact, mentor-like but not warm, composed authority, semi-realistic illustration,
transparent background, highly detailed, no text
```

- [ ] **Step 3: Add the new prompt file to the prompt index**

```markdown
| [13-dialogue-revision-assets.md](13-dialogue-revision-assets.md) | Дополнительные эмоции и визуалы для новой версии диалогов | Gemini Imagen |
```

- [ ] **Step 4: Run scenario validation after the emotion registry change**

Run:
```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/days.test.ts
```

Expected:
- PASS
- `9 passed`

- [ ] **Step 5: Commit**

```bash
git add game/data/characters/index.ts \
  game/docs/prompts/13-dialogue-revision-assets.md \
  game/docs/prompts/README.md
git commit -m "feat(art): add dialogue revision emotion prompts"
```

---

### Task 7: Final Validation And Editorial Smoke Check

**Files:**
- Modify: none
- Test: `game/data/scenarios/car-dealership/__tests__/days.test.ts`
- Test: `game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

- [ ] **Step 1: Run the complete targeted validation suite**

Run:
```bash
npx vitest run \
  game/data/scenarios/car-dealership/__tests__/days.test.ts \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Expected:
- PASS
- `13 passed`

- [ ] **Step 2: Search for the old player-facing brand in the rewritten files**

Run:
```bash
rg -n "Sales School" \
  game/data/scenarios/car-dealership/day1.ts \
  game/data/scenarios/car-dealership/day2.ts \
  game/data/scenarios/car-dealership/day3.ts \
  components/game/screens/SchoolCTA.tsx \
  components/game/screens/schoolCtaCopy.ts \
  game/docs/prompts/13-dialogue-revision-assets.md
```

Expected:
- no matches

- [ ] **Step 3: Read key slices out loud and check them against the spec**

Run:
```bash
sed -n '52,160p' game/data/scenarios/car-dealership/day1.ts
sed -n '78,320p' game/data/scenarios/car-dealership/day2.ts
sed -n '157,345p' game/data/scenarios/car-dealership/day3.ts
sed -n '859,1295p' game/data/scenarios/car-dealership/day3.ts
sed -n '1,220p' components/game/screens/schoolCtaCopy.ts
```

Expected manual checklist:
- no unexplained sales jargon in live scenes
- no line sounds like webinar copy inside a normal character conversation
- Rustam/Dilnoza/Sardor voices stay distinct
- `SalesUp` feels like the next step, not a forced ad injection

- [ ] **Step 4: Commit the full rewrite**

```bash
git add game/data/scenarios/car-dealership/day1.ts \
  game/data/scenarios/car-dealership/day2.ts \
  game/data/scenarios/car-dealership/day3.ts \
  components/game/screens/SchoolCTA.tsx \
  components/game/screens/schoolCtaCopy.ts \
  game/data/characters/index.ts \
  game/docs/prompts/13-dialogue-revision-assets.md \
  game/docs/prompts/README.md \
  game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
git commit -m "feat(copy): redesign car dealership dialogue for SalesUp funnel"
```

---

## Self-Review

### Spec coverage

- 3-day structure preserved: Tasks 2-5
- realistic Uzbek workplace tone: Tasks 2-5 manual review checklists
- Russian-first rewrite: Tasks 2-5 only touch Russian text intentionally
- no unexplained jargon: Tasks 2-5 review checklists
- `SalesUp` brand switch: Task 1 and Task 5
- emotion alignment and new prompts: Task 6

### Placeholder scan

Search terms to verify before execution:

```bash
rg -n "T[O]DO|T[B]D|implement late[r]|appropriate error handlin[g]|simila[r] to Task" \
  docs/superpowers/plans/2026-04-09-salesup-dialogue-redesign-plan.md
```

Expected:
- no matches

### Type consistency

- `SchoolCtaEnding` is defined once in `schoolCtaCopy.ts` and reused in `SchoolCTA.tsx`
- new emotion ids are added to `game/data/characters/index.ts` before being referenced in scenario copy or prompt docs
