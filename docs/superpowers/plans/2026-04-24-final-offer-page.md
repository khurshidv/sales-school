# Final Offer Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Вставить промежуточную узбекскую offer-страницу `/start/final` между уроком 4 и игровым симулятором: два CTA (игра / узнать больше) + отфильтрованный лендинг + форма консультации во все точки.

**Architecture:** Новый Next.js client-route `app/start/final/page.tsx` + пять новых компонентов в `components/final/`, переиспользующих 7 существующих `components/target/*` блоков **без изменений**. `RegistrationModal` монтируется в рамках страницы через локальный `ModalProvider`. Трекинг через существующий `postFunnelEvent` (+5 новых event-type в whitelist). Bitrix — новый `sourcePage='final'` с стадией `UC_GAME_CONS`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Framer Motion (FadeUp), существующий `lib/i18n` и `lib/modal-context`, Supabase + Bitrix24.

**Spec:** [2026-04-24-final-offer-page-design.md](../specs/2026-04-24-final-offer-page-design.md).

**Hard rule:** `/target` должен работать **идентично** после всех правок. Любые изменения в разделяемых модулях (`RegistrationModal`, bitrix route, i18n, event whitelist) — только аддитивные.

---

## File Structure

### Новые файлы

| Путь | Ответственность |
|---|---|
| `app/start/final/page.tsx` | Роут, валидация lead_token, монтаж `<ModalProvider>` + `<RegistrationModal />`, композиция секций. |
| `components/final/FinalHero.tsx` | Hero-секция с 2 CTA («Simulyatorni boshlash», «Ko'proq bilib olish»). |
| `components/final/FinalOfferSection.tsx` | Обёртка с `id="ko-proq"` над 7 target-блоками (рендерит их как есть). |
| `components/final/FinalOfferCta.tsx` | Блок с заголовком и кнопкой «Konsultatsiya olish» (открывает модалку). |
| `components/final/StickyConsultationBar.tsx` | Sticky CTA для мобильных (md:hidden, появляется после скролла). |

### Правки существующих файлов

| Файл | Характер правки |
|---|---|
| `app/api/funnel/quiz/route.ts` | Для `lesson === 4`: `next_url` = `/start/final?lead_token=...` (вместо `/game?...`). |
| `app/api/funnel/quiz/__tests__/route.test.ts` | Обновить assertion `next_url` на новое значение. |
| `lib/funnel/types.ts` | Расширить `FunnelEventType` пятью новыми значениями. |
| `app/api/funnel/event/route.ts` | Добавить новые event-type в `ALL_TYPES` whitelist. |
| `lib/funnel/copy.ts` | Добавить `lesson.finalStepCta = "Keyingi qadamga o'tish"`. |
| `components/funnel/YouTubeLesson.tsx` | Добавить опциональный проп `ctaLabel?: string` (default = `copy.lesson.nextCta`). |
| `app/start/dars/[n]/page.tsx` | Для `lessonNumber === TOTAL_LESSONS` — прокинуть `ctaLabel={copy.lesson.finalStepCta}`. |
| `lib/i18n.tsx` | Добавить ключи `final.hero.*`, `final.cta.*`, `final.final_cta.*`, `modal.final.*` (uz + ru). |
| `components/RegistrationModal.tsx` | В `getSourcePage()` добавить ветку `/start/final → 'final'`; ветка `keyPrefix` для модалки; `gameStage` остаётся `null` для `final`; `postFunnelEvent('final_consultation_submitted')` после submit. |
| `app/api/bitrix/lead/route.ts` | Расширить `SourcePage` union + словари `SOURCE_ID_BY_PAGE`/`SOURCE_LABEL`/`SOURCE_PATH`/`isSourcePage`; `stageFor` для `final` → `STAGE_GAME_CONS`. |

### Миграции БД
**Нет.**

---

## Задачи

### Задача 0: Baseline smoke-теста `/target`

Зафиксировать что `/target` сейчас работает — чтобы в конце сравнить.

**Files:** ничего не меняем.

- [ ] **Step 0.1: Запустить dev-сервер**

Run:
```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school" && npm run dev
```

Expected: dev-сервер стартует на `http://localhost:3000` без ошибок.

- [ ] **Step 0.2: Открыть `/target` и проверить визуальный baseline**

Open: `http://localhost:3000/target`.

Expected: страница грузится без ошибок, видны все 17 блоков (Hero, ContrastBar, TrustBar, PainPoints, …, FinalCTA). Зафиксировать (скрин или ментально) как выглядит — после реализации всех задач сравнить.

- [ ] **Step 0.3: Прогнать существующие unit-тесты**

Run:
```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school" && npm test -- --run
```

Expected: все тесты проходят. Если какой-то упал — это baseline, не связанный с нашей работой. Зафиксировать.

---

### Задача 1: Расширить `FunnelEventType` и event whitelist

**Files:**
- Modify: `lib/funnel/types.ts:23-32`
- Modify: `app/api/funnel/event/route.ts:8-18`

- [ ] **Step 1.1: Расширить union type**

Отредактировать `lib/funnel/types.ts`, строки 23–32:

```typescript
export type FunnelEventType =
  | 'landing_view'
  | 'play_clicked'
  | 'lead_created'
  | 'lesson_opened'
  | 'quiz_shown'
  | 'quiz_wrong'
  | 'quiz_passed'
  | 'funnel_completed'
  | 'simulator_redirected'
  | 'final_page_viewed'
  | 'final_cta_simulator_clicked'
  | 'final_cta_learn_more_clicked'
  | 'final_consultation_opened'
  | 'final_consultation_submitted';
```

- [ ] **Step 1.2: Расширить `ALL_TYPES` whitelist**

Отредактировать `app/api/funnel/event/route.ts`, строки 8–18:

```typescript
const ALL_TYPES: ReadonlySet<FunnelEventType> = new Set([
  'landing_view',
  'play_clicked',
  'lead_created',
  'lesson_opened',
  'quiz_shown',
  'quiz_wrong',
  'quiz_passed',
  'funnel_completed',
  'simulator_redirected',
  'final_page_viewed',
  'final_cta_simulator_clicked',
  'final_cta_learn_more_clicked',
  'final_consultation_opened',
  'final_consultation_submitted',
]);
```

- [ ] **Step 1.3: Прогнать тесты на event route**

Run:
```bash
npm test -- --run app/api/funnel/event
```

Expected: все тесты проходят (новые типы валидны, старые не сломались).

- [ ] **Step 1.4: Проверить, что TypeScript собирается**

Run:
```bash
npx tsc --noEmit
```

Expected: нет ошибок компиляции.

- [ ] **Step 1.5: Commit**

```bash
git add lib/funnel/types.ts app/api/funnel/event/route.ts
git commit -m "feat(funnel): add final-offer event types to whitelist"
```

---

### Задача 2: Изменить редирект после урока 4

**Files:**
- Modify: `app/api/funnel/quiz/route.ts:106-109`
- Modify: `app/api/funnel/quiz/__tests__/route.test.ts`

- [ ] **Step 2.1: Прочитать существующий тест**

Read file: `app/api/funnel/quiz/__tests__/route.test.ts`. Найти тест, который проверяет `next_url` для `lesson === 4` — он сейчас ожидает `/game?lead_token=...`.

- [ ] **Step 2.2: Обновить тест на новое значение**

Заменить ожидание в соответствующем тесте:

```typescript
// было: expect(body.next_url).toBe(`/game?lead_token=${encodeURIComponent(token)}`);
expect(body.next_url).toBe(`/start/final?lead_token=${encodeURIComponent(token)}`);
```

- [ ] **Step 2.3: Прогнать тест — он должен упасть**

Run:
```bash
npm test -- --run app/api/funnel/quiz
```

Expected: тест с `lesson=4` падает (ожидает `/start/final?...`, получает `/game?...`).

- [ ] **Step 2.4: Обновить продуктовый код**

В `app/api/funnel/quiz/route.ts`, строки 106–109:

```typescript
    return NextResponse.json({
      ok: true,
      next_url: `/start/final?lead_token=${encodeURIComponent(player.token)}`,
    });
```

- [ ] **Step 2.5: Прогнать тест — он должен пройти**

Run:
```bash
npm test -- --run app/api/funnel/quiz
```

Expected: все тесты проходят.

- [ ] **Step 2.6: Commit**

```bash
git add app/api/funnel/quiz/route.ts app/api/funnel/quiz/__tests__/route.test.ts
git commit -m "feat(funnel): redirect lesson 4 to /start/final instead of /game"
```

---

### Задача 3: I18n ключи для страницы и модалки

**Files:**
- Modify: `lib/i18n.tsx` (добавить перед закрывающим `} as const;` на строке 987)

- [ ] **Step 3.1: Добавить блок `final.*`**

Добавить в объект `translations` в `lib/i18n.tsx` (перед `} as const;`):

```typescript
  /* ══════════════════════════ FINAL OFFER PAGE ══════════════════════════ */
  "final.hero.badge": {
    ru: "4/4 дарс пройден — поздравляем",
    uz: "4/4 dars bajarildi — tabriklaymiz",
  },
  "final.hero.heading": {
    ru: "Теперь время практики",
    uz: "Endi amaliyot vaqti",
  },
  "final.hero.subheading": {
    ru: "Вы прошли 4 урока. Попробуйте симулятор или узнайте больше о полном обучении и трудоустройстве.",
    uz: "Siz 4 ta darsni tamomladingiz. Endi simulyatorni sinab ko'ring yoki to'liq o'qish va ishga joylashuv haqida ko'proq bilib oling.",
  },
  "final.hero.cta_simulator": {
    ru: "Начать симулятор",
    uz: "Simulyatorni boshlash",
  },
  "final.hero.cta_learn_more": {
    ru: "Узнать больше",
    uz: "Ko'proq bilib olish",
  },
  "final.offer.anchor_hint": {
    ru: "О школе и программе",
    uz: "Maktab va dastur haqida",
  },
  "final.final_cta.heading": {
    ru: "Есть вопросы?",
    uz: "Savollaringiz bormi?",
  },
  "final.final_cta.body": {
    ru: "Наш менеджер бесплатно проконсультирует вас и поможет выбрать подходящий курс.",
    uz: "Menejerimiz bepul konsultatsiya berib, sizga mos kursni tanlashga yordam beradi.",
  },
  "final.final_cta.button": {
    ru: "Получить консультацию",
    uz: "Konsultatsiya olish",
  },
  "final.sticky.button": {
    ru: "Получить консультацию",
    uz: "Konsultatsiya olish",
  },
  "modal.final.heading": {
    ru: "Получить бесплатную консультацию",
    uz: "Bepul konsultatsiya oling",
  },
  "modal.final.subtitle": {
    ru: "Оставьте контакты — менеджер свяжется с вами в Telegram и ответит на все вопросы.",
    uz: "Kontaktlaringizni qoldiring — menejer Telegramda bog'lanib, barcha savollarga javob beradi.",
  },
  "modal.final.submit": {
    ru: "Записаться на консультацию",
    uz: "Konsultatsiyaga yozilish",
  },
```

- [ ] **Step 3.2: Проверить TypeScript**

Run:
```bash
npx tsc --noEmit
```

Expected: нет ошибок. Новые ключи попадают в `TranslationKey`.

- [ ] **Step 3.3: Commit**

```bash
git add lib/i18n.tsx
git commit -m "feat(i18n): add final-offer page keys (uz + ru)"
```

---

### Задача 4: Правка `RegistrationModal` под `source_page='final'`

**Files:**
- Modify: `components/RegistrationModal.tsx`

- [ ] **Step 4.1: Обновить `getSourcePage()`**

В `components/RegistrationModal.tsx`, строки 12–18:

```typescript
function getSourcePage(): string {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path.startsWith('/start/final')) return 'final';
  if (path.startsWith('/target')) return 'target';
  if (path.startsWith('/game')) return 'game';
  return 'home';
}
```

*Порядок важен: `/start/final` проверяется раньше `/start/*` (которого нет явно — попадёт в `home`).*

- [ ] **Step 4.2: Добавить ветку ключей модалки**

Найти блок рендеринга заголовка и CTA модалки (строки ~84–88, 182–184). Заменить:

```tsx
{getSourcePage() !== 'home' ? t("modal.target.heading") : t("modal.heading")}
```
на:
```tsx
{(() => {
  const src = getSourcePage();
  if (src === 'final') return t("modal.final.heading");
  if (src !== 'home') return t("modal.target.heading");
  return t("modal.heading");
})()}
```

Аналогично для `subtitle` и `submit`. Чтобы не дублировать IIFE — вынести в переменную `keyPrefix` наверху функции `RegistrationModal`:

```typescript
const source = getSourcePage();
const keyPrefix: 'modal' | 'modal.target' | 'modal.final' =
  source === 'final' ? 'modal.final' : source !== 'home' ? 'modal.target' : 'modal';
```

И использовать: `t(`${keyPrefix}.heading` as TranslationKey)` и т. п.

*Важно:* `keyPrefix` вычисляется внутри тела функции компонента — пересчитывается при рендере, как и текущий `getSourcePage()` вызов.

- [ ] **Step 4.3: Прокинуть событие `final_consultation_submitted` после submit**

Импорт вверху файла:
```typescript
import { postFunnelEvent, readIdentity } from '@/lib/funnel/progress-client';
```

В теле `onSubmit`, сразу перед `window.open('https://t.me/salesup_uz', ...)`:

```typescript
if (sourcePage === 'final') {
  const id = readIdentity();
  postFunnelEvent('final_consultation_submitted', {
    leadId: id?.leadId,
    token: id?.token,
  });
}
```

Это не блокирует основной поток (fire-and-forget, сам `postFunnelEvent` обёрнут в try/catch).

- [ ] **Step 4.4: Проверить `/target` визуально**

Run:
```bash
npm run dev
```

Open: `http://localhost:3000/target` → нажать любую CTA «Записаться». Модалка должна открыться с текстами `modal.target.*` (текущее поведение).

Expected: никаких визуальных изменений на `/target`.

- [ ] **Step 4.5: Commit**

```bash
git add components/RegistrationModal.tsx
git commit -m "feat(modal): add final-offer source_page and submit event"
```

---

### Задача 5: Расширить Bitrix route на `sourcePage='final'`

**Files:**
- Modify: `app/api/bitrix/lead/route.ts`

- [ ] **Step 5.1: Расширить union + type-guard + словари**

В `app/api/bitrix/lead/route.ts`:

Строка 29:
```typescript
type SourcePage = 'home' | 'target' | 'game' | 'funnel' | 'final';
```

Строка 48–53 (`SOURCE_ID_BY_PAGE`):
```typescript
const SOURCE_ID_BY_PAGE: Record<SourcePage, string> = {
  target: 'SALESUP_TARGET',
  home: 'SALESUP_HOME',
  game: 'SALESUP_GAME',
  funnel: 'SALESUP_FUNNEL',
  final: 'SALESUP_FINAL',
};
```

Строка 55–60 (`SOURCE_LABEL`):
```typescript
const SOURCE_LABEL: Record<SourcePage, string> = {
  target: 'Sales Up лендинг',
  home: 'Вебинар',
  game: 'RPG игра',
  funnel: '4 darslik voronka',
  final: 'Final offer (после dars 4)',
};
```

Строка 62–67 (`SOURCE_PATH`):
```typescript
const SOURCE_PATH: Record<SourcePage, string> = {
  target: '/target',
  home: '/',
  game: '/game',
  funnel: '/start',
  final: '/start/final',
};
```

Строка 85–87 (type-guard):
```typescript
function isSourcePage(v: unknown): v is SourcePage {
  return v === 'home' || v === 'target' || v === 'game' || v === 'funnel' || v === 'final';
}
```

- [ ] **Step 5.2: Обновить `stageFor` для `final → UC_GAME_CONS`**

Строка 93–97:
```typescript
function stageFor(sourcePage: SourcePage, gameStage: GameStage | null): string {
  if (sourcePage === 'game' && gameStage === 'onboarding') return STAGE_GAME_ONB;
  if (sourcePage === 'game' && gameStage === 'consultation') return STAGE_GAME_CONS;
  if (sourcePage === 'final') return STAGE_GAME_CONS;
  return STAGE_NEW;
}
```

**Мотивация:** Final offer — это заявка на консультацию в той же воронке, что и `/game + consultation`. Переиспользуем стадию `UC_GAME_CONS`, чтобы продавцы не делили один и тот же статус между двумя колонками. `SOURCE_ID=SALESUP_FINAL` отличит происхождение лида.

- [ ] **Step 5.3: Проверить TypeScript**

Run:
```bash
npx tsc --noEmit
```

Expected: нет ошибок.

- [ ] **Step 5.4: Прогнать существующие тесты bitrix (если есть)**

Run:
```bash
npm test -- --run bitrix
```

Expected: все проходят (или вернётся сообщение «no tests found» — приемлемо, это не критичный регрессионный риск на данном шаге).

- [ ] **Step 5.5: Commit**

```bash
git add app/api/bitrix/lead/route.ts
git commit -m "feat(bitrix): add 'final' sourcePage mapping to consultation stage"
```

---

### Задача 6: Новая пара ключей для кнопки урока 4 в `copy.ts`

**Files:**
- Modify: `lib/funnel/copy.ts:32-37`
- Modify: `components/funnel/YouTubeLesson.tsx:49-140`
- Modify: `app/start/dars/[n]/page.tsx`

- [ ] **Step 6.1: Добавить `finalStepCta` в `copy.ts`**

В `lib/funnel/copy.ts`, блок `lesson:` (строки 32–37):

```typescript
  lesson: {
    stepCaption: (n: number, total: number) => `Dars ${n} / ${total}`,
    nextCta: "Keyingi darsga o'tish",
    finalStepCta: "Keyingi qadamga o'tish",
    watchHint: "Keyingi darsga o'tish uchun bu darsni oxirigacha ko'ring",
    loadingVideo: 'Video yuklanmoqda...',
  },
```

*Note:* Фаннел uz-only (см. комментарий в первой строке `copy.ts`), RU вариант здесь не нужен — единообразно с существующими ключами.

- [ ] **Step 6.2: Добавить опциональный проп `ctaLabel` в `YouTubeLesson`**

В `components/funnel/YouTubeLesson.tsx`, строки 49–59:

```typescript
export default function YouTubeLesson({
  videoId,
  preCompleted,
  onReadyToProceed,
  onProceedClick,
  ctaLabel,
}: {
  videoId: string;
  preCompleted: boolean;
  onReadyToProceed?: () => void;
  onProceedClick: () => void;
  ctaLabel?: string;
}) {
```

И в render (строка ~131):

```tsx
<FunnelCtaButton text={ctaLabel ?? copy.lesson.nextCta} onClick={onProceedClick} />
```

Дефолт = текущее значение. Уроки 1–3 не передают `ctaLabel` → поведение неизменно.

- [ ] **Step 6.3: Прокинуть `finalStepCta` только для урока 4**

В `app/start/dars/[n]/page.tsx`, строка 122 (вызов `<YouTubeLesson ... />`):

```tsx
<YouTubeLesson
  key={`${lessonNumber}-${preCompleted ? 'done' : 'live'}`}
  videoId={lesson.youtubeId}
  preCompleted={preCompleted}
  onProceedClick={handleProceed}
  ctaLabel={lessonNumber === TOTAL_LESSONS ? copy.lesson.finalStepCta : undefined}
/>
```

*Важно:* для уроков 1–3 передаём `undefined` → `YouTubeLesson` использует дефолт `copy.lesson.nextCta` → полная обратная совместимость.

- [ ] **Step 6.4: Ручная проверка**

Run:
```bash
npm run dev
```

Перейти на `/start/dars/1` → кнопка говорит «Keyingi darsga o'tish» (старый текст).

Пройти до `/start/dars/4` (или подделать state через localStorage для теста) → кнопка после квиза говорит «Keyingi qadamga o'tish».

- [ ] **Step 6.5: Commit**

```bash
git add lib/funnel/copy.ts components/funnel/YouTubeLesson.tsx app/start/dars/[n]/page.tsx
git commit -m "feat(funnel): change CTA label on lesson 4 to 'Keyingi qadamga o'tish'"
```

---

### Задача 7: Компонент `FinalHero`

**Files:**
- Create: `components/final/FinalHero.tsx`

- [ ] **Step 7.1: Создать файл**

```tsx
"use client";

import { useT } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

interface FinalHeroProps {
  onSimulatorClick: () => void;
  onLearnMoreClick: () => void;
}

export default function FinalHero({ onSimulatorClick, onLearnMoreClick }: FinalHeroProps) {
  const { t } = useT();

  return (
    <section className="relative w-full px-5 md:px-8 pt-6 md:pt-12 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
        <FadeUp>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-container/15 px-4 py-1.5 text-sm font-medium text-[color:var(--color-primary)]">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {t("final.hero.badge")}
          </span>
        </FadeUp>

        <FadeUp delay={60}>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold leading-tight text-on-surface">
            {t("final.hero.heading")}
          </h1>
        </FadeUp>

        <FadeUp delay={120}>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            {t("final.hero.subheading")}
          </p>
        </FadeUp>

        <FadeUp delay={180}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-2">
            <button
              type="button"
              onClick={onSimulatorClick}
              className="cta-btn rounded-full px-8 py-4 text-white font-bold tracking-wide text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("final.hero.cta_simulator")}
            </button>
            <button
              type="button"
              onClick={onLearnMoreClick}
              className="rounded-full px-8 py-4 font-bold tracking-wide text-base border-2 border-outline-variant/40 bg-white/60 hover:bg-white text-on-surface transition-all"
            >
              {t("final.hero.cta_learn_more")}
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add components/final/FinalHero.tsx
git commit -m "feat(final): add FinalHero component with 2 CTAs"
```

---

### Задача 8: Компонент `FinalOfferSection` (обёртка для 7 target-блоков)

**Files:**
- Create: `components/final/FinalOfferSection.tsx`

- [ ] **Step 8.1: Создать файл**

```tsx
"use client";

import TrustBar from "@/components/target/TrustBar";
import WhySales from "@/components/target/WhySales";
import ProductBenefits from "@/components/target/ProductBenefits";
import ProgramAccordion from "@/components/target/ProgramAccordion";
import CasesSection from "@/components/target/CasesSection";
import StatsSection from "@/components/target/StatsSection";
import ForWhom from "@/components/target/ForWhom";

export default function FinalOfferSection() {
  return (
    <section id="ko-proq" aria-label="Maktab va dastur haqida" className="scroll-mt-8">
      <TrustBar />
      <WhySales />
      <ProductBenefits />
      <ProgramAccordion />
      <CasesSection />
      <StatsSection />
      <ForWhom />
    </section>
  );
}
```

*Важно:* компоненты импортированы **ровно в том виде, в каком они живут в `/target`**. Никакие пропсы не переопределяем.

- [ ] **Step 8.2: Commit**

```bash
git add components/final/FinalOfferSection.tsx
git commit -m "feat(final): add FinalOfferSection reusing 7 target blocks"
```

---

### Задача 9: Компонент `FinalOfferCta` (нижний блок с формой)

**Files:**
- Create: `components/final/FinalOfferCta.tsx`

- [ ] **Step 9.1: Создать файл**

```tsx
"use client";

import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import FadeUp from "@/components/FadeUp";
import { postFunnelEvent, readIdentity } from "@/lib/funnel/progress-client";

export default function FinalOfferCta() {
  const { t } = useT();
  const { openModal } = useModal();

  const handleClick = () => {
    const id = readIdentity();
    postFunnelEvent('final_consultation_opened', {
      leadId: id?.leadId,
      token: id?.token,
      meta: { location: 'bottom_cta' },
    });
    openModal();
  };

  return (
    <section className="py-20 md:py-28 bg-surface-container">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center flex flex-col items-center gap-6">
        <FadeUp>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-on-surface">
            {t("final.final_cta.heading")}
          </h2>
        </FadeUp>
        <FadeUp delay={60}>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
            {t("final.final_cta.body")}
          </p>
        </FadeUp>
        <FadeUp delay={120}>
          <button
            type="button"
            onClick={handleClick}
            className="cta-btn rounded-full px-10 py-4 text-white font-bold tracking-wide text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t("final.final_cta.button")}
          </button>
        </FadeUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.2: Commit**

```bash
git add components/final/FinalOfferCta.tsx
git commit -m "feat(final): add FinalOfferCta with consultation modal trigger"
```

---

### Задача 10: Компонент `StickyConsultationBar` (mobile sticky CTA)

**Files:**
- Create: `components/final/StickyConsultationBar.tsx`

- [ ] **Step 10.1: Создать файл**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import { postFunnelEvent, readIdentity } from "@/lib/funnel/progress-client";

const SHOW_AFTER_SCROLL_PX = 240;

export default function StickyConsultationBar() {
  const { t } = useT();
  const { openModal } = useModal();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_SCROLL_PX);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const id = readIdentity();
    postFunnelEvent('final_consultation_opened', {
      leadId: id?.leadId,
      token: id?.token,
      meta: { location: 'sticky_mobile' },
    });
    openModal();
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={handleClick}
        className="cta-btn w-full rounded-full px-8 py-4 text-white font-bold tracking-wide text-base shadow-2xl"
      >
        {t("final.sticky.button")}
      </button>
    </div>
  );
}
```

- [ ] **Step 10.2: Commit**

```bash
git add components/final/StickyConsultationBar.tsx
git commit -m "feat(final): add sticky consultation bar for mobile"
```

---

### Задача 11: Роут `/start/final/page.tsx`

**Files:**
- Create: `app/start/final/page.tsx`

- [ ] **Step 11.1: Создать файл**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalProvider } from "@/lib/modal-context";
import RegistrationModal from "@/components/RegistrationModal";
import FinalHero from "@/components/final/FinalHero";
import FinalOfferSection from "@/components/final/FinalOfferSection";
import FinalOfferCta from "@/components/final/FinalOfferCta";
import StickyConsultationBar from "@/components/final/StickyConsultationBar";
import { useT } from "@/lib/i18n";
import { readIdentity, postFunnelEvent } from "@/lib/funnel/progress-client";

function FinalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLocale } = useT();

  useEffect(() => {
    setLocale('uz');
  }, [setLocale]);

  useEffect(() => {
    const id = readIdentity();
    if (!id) {
      router.replace('/start');
      return;
    }
    fetch('/api/funnel/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((state: null | { current_lesson: number; completed_lessons: number[] }) => {
        if (!state) {
          router.replace('/start');
          return;
        }
        if (!(state.completed_lessons ?? []).includes(4)) {
          router.replace(`/start/dars/${state.current_lesson}`);
          return;
        }
        postFunnelEvent('final_page_viewed', {
          leadId: id.leadId,
          token: id.token,
        });
      })
      .catch(() => router.replace('/start'));
  }, [router]);

  const handleSimulator = () => {
    const id = readIdentity();
    const tokenFromQuery = searchParams.get('lead_token');
    const token = tokenFromQuery ?? id?.token ?? '';
    postFunnelEvent('final_cta_simulator_clicked', {
      leadId: id?.leadId,
      token: id?.token,
    });
    window.location.href = `/game?lead_token=${encodeURIComponent(token)}`;
  };

  const handleLearnMore = () => {
    const id = readIdentity();
    postFunnelEvent('final_cta_learn_more_clicked', {
      leadId: id?.leadId,
      token: id?.token,
    });
    const el = document.getElementById('ko-proq');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <FinalHero
        onSimulatorClick={handleSimulator}
        onLearnMoreClick={handleLearnMore}
      />
      <FinalOfferSection />
      <FinalOfferCta />
      <StickyConsultationBar />
    </main>
  );
}

export default function FinalPage() {
  return (
    <ModalProvider>
      <FinalPageInner />
      <RegistrationModal />
    </ModalProvider>
  );
}
```

*Примечания:*
- `setLocale('uz')` принудительно форсит узбекский (по умолчанию I18nProvider уже в uz, но явно — надёжнее, если пользователь ранее переключался на ru).
- `window.location.href` для перехода в `/game` (а не `router.push`) — потому что `/game` находится вне группы `app/start/`, используем hard navigation для надёжного layout-перехода.
- Валидация: у игрока должен быть `4` в `completed_lessons` — иначе редирект назад.

- [ ] **Step 11.2: Ручная проверка страницы**

Run:
```bash
npm run dev
```

Подделать localStorage (в консоли браузера на `/start`):
```js
localStorage.setItem('salesup.funnel.lead_id', '<leadId с dev-БД>');
localStorage.setItem('salesup.funnel.token', '<token>');
```

Или пройти флоу уроков 1–4. Открыть `http://localhost:3000/start/final?lead_token=...`. Expected:
- Hero с двумя CTA.
- Ниже — 7 секций `/target` (TrustBar → ForWhom).
- В самом низу — `FinalOfferCta`.
- Sticky bar появляется на мобильной ширине (dev-tools responsive, <768px) после скролла ~240px.

- [ ] **Step 11.3: Клик на «Simulyatorni boshlash»**

Expected: переход на `/game?lead_token=...`.

- [ ] **Step 11.4: Клик на «Ko'proq bilib olish»**

Expected: плавный скролл к секции с id `ko-proq`.

- [ ] **Step 11.5: Клик на «Konsultatsiya olish» (финальный блок и sticky)**

Expected: открывается `RegistrationModal` с заголовком `modal.final.heading` и кнопкой `modal.final.submit`. Sources уходят с `sourcePage='final'`.

- [ ] **Step 11.6: Проверить события в Network-tab dev-tools**

Фильтр `/api/funnel/event`. Expected:
- `final_page_viewed` — при открытии страницы.
- `final_cta_simulator_clicked` — при клике на первое CTA.
- `final_cta_learn_more_clicked` — при клике на второе CTA.
- `final_consultation_opened` — при открытии модалки (с `meta.location`).

- [ ] **Step 11.7: Commit**

```bash
git add app/start/final/page.tsx
git commit -m "feat(final): add /start/final page with hero + offer + consultation CTA"
```

---

### Задача 12: Проверка `/target` на регрессию

**Files:** ничего не меняем.

- [ ] **Step 12.1: Открыть `/target` и визуально сравнить**

Open: `http://localhost:3000/target`.

Expected:
- Все 17 блоков на месте, в том же порядке.
- CTA в header и mobile nav — «Записаться» открывает модалку с заголовком `modal.target.heading` (не `modal.final.heading`).
- Submit формы шлёт в bitrix `sourcePage='target'`.
- Никаких ошибок в консоли.

- [ ] **Step 12.2: Прогнать весь набор тестов**

Run:
```bash
npm test -- --run
```

Expected: все тесты проходят (включая обновлённый `quiz/__tests__/route.test.ts`).

- [ ] **Step 12.3: Прогнать TypeScript и lint**

Run:
```bash
npx tsc --noEmit
npm run lint
```

Expected: нет ошибок.

- [ ] **Step 12.4: End-to-end smoke: пройти весь фаннел**

1. Открыть `/start` в инкогнито.
2. Кликнуть Play → зарегистрироваться (новый номер).
3. Пройти урок 1 до конца + квиз.
4. Повторить для уроков 2, 3.
5. На уроке 4 — кнопка называется «Keyingi qadamga o'tish».
6. Пройти квиз 4.
7. Ожидаем редирект на `/start/final?lead_token=...`, НЕ на `/game`.
8. Кликнуть «Konsultatsiya olish» → отправить форму → редирект на Telegram.

Expected: все шаги проходят успешно.

- [ ] **Step 12.5: Проверить в dashboard admin**

Open: `/admin/leads` (с админ-паролем). Expected: новый лид виден с `source_page='final'`.
Open: `/admin/funnel`. Expected: события `final_*` попадают в список (или как минимум видны в `event_type` фильтре).

- [ ] **Step 12.6: Проверить запись в Bitrix (если есть доступ)**

Expected: сделка создана/переведена в стадию `UC_GAME_CONS`, в TITLE маркер `/start/final`, SOURCE_ID = `SALESUP_FINAL`.

*Если доступ к Bitrix UI есть — визуальная проверка. Если нет — полагаемся на логи `/api/bitrix/lead` и что ответ 200 OK.*

- [ ] **Step 12.7: Commit smoke-check (no-op если всё ок)**

Если тесты/lint/tsc прошли — коммитить нечего, этот шаг только для фиксации прохождения.

---

## Self-Review

### Spec coverage

| Спек-раздел | Задача |
|---|---|
| §2 — изменение next_url для урока 4 | Задача 2 |
| §3 — валидация lead_token + форс локали | Задача 11 (шаг 11.1) |
| §4.1 — FinalHero | Задача 7 |
| §4.2 — FinalOfferSection (7 блоков) | Задача 8 |
| §4.3 — FinalOfferCta | Задача 9 |
| §4.4 — StickyConsultationBar | Задача 10 |
| §5.1 — getSourcePage → 'final' | Задача 4 (шаг 4.1) |
| §5.2 — keyPrefix в модалке | Задача 4 (шаг 4.2) |
| §5.3 — Bitrix расширение | Задача 5 |
| §5.4 — final_consultation_submitted | Задача 4 (шаг 4.3) |
| §6.1 — новые event_type + whitelist | Задача 1 |
| §6.2 — Dashboard (авто-подхват) | Задача 12 (шаг 12.5) |
| §7 — кнопка урока 4 | Задача 6 |
| §8 — файлы (новые + правки) | Все задачи |
| §9 — риски (smoke-тест /target) | Задача 0, 12 |
| §10 — success criteria | Задача 12 |

Все пункты спека покрыты.

### Placeholder scan
Проверено: TBD/TODO отсутствуют, все code-блоки содержат исполнимый код, тесты содержат явные ассерты.

### Type consistency
- `SourcePage` union расширен согласованно в `app/api/bitrix/lead/route.ts` (type + type-guard + 3 словаря).
- `FunnelEventType` расширен согласованно в `types.ts` + `ALL_TYPES`.
- `ctaLabel?: string` — имя пропа одинаковое в YouTubeLesson, передающем вызове и дефолтной fallback.
- `getSourcePage()` возвращает literal `'final'`, и `keyPrefix` ловит его первым — совпадает с Bitrix `SourcePage`.
- `'final_consultation_opened'.meta.location` — значения `'bottom_cta'` / `'sticky_mobile'` согласованы в двух компонентах.
