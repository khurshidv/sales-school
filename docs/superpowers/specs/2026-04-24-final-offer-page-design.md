# Final Offer Page — Design Spec

**Дата:** 2026-04-24
**Автор:** Claude (в паре с пользователем)
**Статус:** утверждено

## 1. Цель

Вставить промежуточную страницу между завершением урока 4 на `/start/dars/4` и переходом в игру-симулятор (`/game`). Страница должна:

1. Дать пользователю выбор: сразу пойти в симулятор **или** узнать больше о школе и обучении.
2. Собрать заявки на консультацию с отфильтрованным набором «самых продающих» блоков существующего лендинга `/target` (без цены).
3. Быть только на узбекском (`uz`).
4. Обеспечить корректный трекинг в Dashboard и Bitrix24 как отдельный этап воронки (`source_page = final_offer`).

**Не цель:** менять существующий `/target` лендинг. Любые правки компонентов должны быть строго обратно совместимыми (новые опциональные пропсы с дефолтами).

## 2. Текущая воронка и точка вставки

```
/start (identify) → /start/dars/1 → /start/dars/2 → /start/dars/3 → /start/dars/4
                                                                         ↓ quiz passed (lesson=4)
                                                                    [СЕЙЧАС: /game?lead_token=...]
                                                                    [СТАНЕТ: /start/final?lead_token=...]
                                                                         ↓
                                                                  /start/final
                                                                  ├─ CTA 1: Simulyatorni boshlash  → /game?lead_token=...
                                                                  └─ CTA 2: Ko'proq bilib olish     → scroll to offer blocks → Konsultatsiya olish (RegistrationModal)
```

**Ключевое изменение API:** [app/api/funnel/quiz/route.ts](../../app/api/funnel/quiz/route.ts), строки 106–109. Когда `body.lesson === 4` и квиз пройден, `next_url` меняется:

```diff
-   next_url: `/game?lead_token=${encodeURIComponent(player.token)}`,
+   next_url: `/start/final?lead_token=${encodeURIComponent(player.token)}`,
```

Существующий backfill `lead → player` на этом шаге сохраняется (нужен, чтобы игрок и лид были связаны при входе в `/game`).

## 3. Маршрут и авторизация страницы

### Роут
- `app/start/final/page.tsx` (client component) — новый маршрут под существующей группой `app/start/` (рядом с `dars/[n]/page.tsx`).
- Layout наследуется от [app/start/layout.tsx](../../app/start/layout.tsx).

### Валидация lead_token
1. Читаем `lead_token` из query string.
2. Читаем `readIdentity()` из `lib/funnel/progress-client.ts` (localStorage: `leadId` + `token`).
3. POST `/api/funnel/state` с `{ lead_id, token }` — как в `/start/dars/[n]`.
4. Если ответ не `ok` или `current_lesson < 4` (воронка ещё не пройдена) → `router.replace('/start')`.
5. Если `lead_token` в query отсутствует, но есть в localStorage — используем localStorage.
6. Если нет ни того, ни другого → `router.replace('/start')`.

### Локаль
- Страница форсирует локаль `uz` через `<LocaleProvider initial="uz">` (обёртка над существующим `lib/i18n.tsx`).
- Переключатель языка на странице не показываем — это узбекская целевая страница.

## 4. Структура страницы

### 4.1 Hero секция (новый компонент `FinalHero`)

```
┌──────────────────────────────────────────────────────┐
│  4/4 dars bajarildi — tabriklaymiz!                  │  ← small badge
│                                                      │
│  Endi amaliyot vaqti.                                │  ← h1
│  Simulyatorda birinchi mijozingizni xizmat qiling.   │  ← h2 / subhead
│                                                      │
│  [ Simulyatorni boshlash ]  [ Ko'proq bilib olish ]  │  ← 2 CTA
│                                                      │
│  (mini-info: nima o'rganasiz / nima yangilik)        │  ← 3 bullets, optional
└──────────────────────────────────────────────────────┘
```

**CTA 1 (primary):** `Simulyatorni boshlash` → `router.push('/game?lead_token=' + token)` + `postFunnelEvent('final_cta_simulator_clicked')`.

**CTA 2 (secondary):** `Ko'proq bilib olish` → плавный скролл к `#ko-proq` + `postFunnelEvent('final_cta_learn_more_clicked')`.

### 4.2 Offer секция (отфильтрованный `/target`)

Секция с id `ko-proq`. Рендерит 7 одобренных блоков из `/target` **в следующем порядке**:

1. `TrustBar` — доверие (цифры/логотипы)
2. `WhySales` — почему продажи как профессия
3. `ProductBenefits` — преимущества обучения
4. `ProgramAccordion` — программа курса
5. `CasesSection` — кейсы выпускников
6. `StatsSection` — статистика школы
7. `ForWhom` — для кого

**Исключены (не рендерим):** `TargetHeader`, `TargetHero`, `ContrastBar`, `PainPoints`, `MythReframe`, `LossAversion`, `PricingSection`, `TargetFAQ`, `FinalCTA`, `TargetFooter`, `TargetMobileNav`.

**Правило переиспользования:** импортируем компоненты как есть из `@/components/target/*`. Если у какого-то из них внутри окажется CTA с действием, отличным от «открыть RegistrationModal» (например, «Записаться на курс», ссылка на оплату, переход на /target), — **вариант A:** добавить опциональный пропс `ctaLabelKey?: TranslationKey` и `onCtaClick?: () => void` в исходный компонент (дефолт = текущее поведение, чтобы не сломать `/target`); **вариант B (fallback):** форкнуть компонент в `components/final/` с нужным поведением.

### 4.3 Finalizing CTA секция (новый компонент `FinalOfferCta`)

```
┌──────────────────────────────────────────────────────┐
│            Savollaringiz bormi?                      │
│  Menejerimiz bepul konsultatsiya berib, sizga mos    │
│  kursni tanlashga yordam beradi.                     │
│                                                      │
│          [ Konsultatsiya olish ]                     │  ← opens RegistrationModal
└──────────────────────────────────────────────────────┘
```

Клик → `openModal()` из `useModal()` + `postFunnelEvent('final_consultation_opened', { location: 'bottom_cta' })`.

### 4.4 Sticky mobile CTA (новый компонент `StickyConsultationBar`)

- Показывается только на мобильных (`md:hidden`).
- Появляется после скролла ниже hero (~200px).
- Фиксирована внизу экрана.
- Кнопка: `Konsultatsiya olish` → `openModal()` + `postFunnelEvent('final_consultation_opened', { location: 'sticky_mobile' })`.

## 5. RegistrationModal — интеграция

Модалка переиспользуется **без изменения UX**. Правки точечные:

### 5.1 `getSourcePage()` в [components/RegistrationModal.tsx](../../components/RegistrationModal.tsx), строки 12–18

```diff
 function getSourcePage(): string {
   if (typeof window === 'undefined') return 'home';
   const path = window.location.pathname;
   if (path.startsWith('/target')) return 'target';
+  if (path.startsWith('/start/final')) return 'final_offer';
   if (path.startsWith('/game')) return 'game';
   return 'home';
 }
```

### 5.2 Заголовок/подзаголовок/CTA модалки

Текущий код использует `modal.target.*` когда `source_page !== 'home'` и `modal.*` когда `home`. Чтобы не менять поведение модалки на `/target`, **добавляем отдельные ключи** `modal.final.heading`, `modal.final.subtitle`, `modal.final.submit` и новую ветку:

```tsx
const source = getSourcePage();
const keyPrefix = source === 'final_offer' ? 'modal.final' : source !== 'home' ? 'modal.target' : 'modal';
```

### 5.3 Bitrix интеграция

`/api/bitrix/lead` получает `sourcePage: 'final_offer'`. Правки в [app/api/bitrix/lead/route.ts](../../app/api/bitrix/lead/route.ts):
- Существующая логика для `sourcePage === 'game'` сохраняется.
- Добавить ветку для `'final_offer'`:
  - `TITLE` сделки содержит маркер «Final Offer (dars 4 dan keyin)».
  - `SOURCE_ID` — тот же что и для остальных (или отдельный, если в Bitrix настроен — уточнить по коду).

Если в процессе реализации выяснится, что в `/api/bitrix/lead` нужна дополнительная карта `sourcePage → stageId`, добавляем её туда (это не меняет `/target` и `/game` поведение).

### 5.4 После отправки формы

- Existing `supabase.from('leads').insert(...)` — сохраняет с `source_page='final_offer'`, фильтр работает сразу.
- Новое: `postFunnelEvent('final_consultation_submitted', { leadId, token })` — добавляется перед `window.open('https://t.me/...')`.

## 6. Трекинг событий

### 6.1 Новые `event_type` в таблице `funnel_events`

| event_type | Когда | payload |
|---|---|---|
| `final_page_viewed` | `useEffect` страницы `/start/final` | — |
| `final_cta_simulator_clicked` | Клик по «Simulyatorni boshlash» | — |
| `final_cta_learn_more_clicked` | Клик по «Ko'proq bilib olish» | — |
| `final_consultation_opened` | Клик по любой кнопке «Konsultatsiya olish» | `{ location: 'bottom_cta' \| 'sticky_mobile' \| 'block_X' }` |
| `final_consultation_submitted` | Успешный submit RegistrationModal при source=final_offer | — |

Все события пишутся через существующий `postFunnelEvent(...)` из [lib/funnel/progress-client.ts](../../lib/funnel/progress-client.ts) и уходят на существующий роут `/api/funnel/event`. Миграции БД **не требуются** — `event_type` это `text`.

### 6.2 Dashboard

Новые события автоматически попадают в существующие админ-разделы:
- **Funnel** — появятся новые этапы в фильтре по event_type.
- **Leads** — фильтр `source_page = final_offer` работает сразу.
- **Realtime / Overview** — считают `leads.count`, `source_page` уже поддерживается.

**Отдельный раздел «Final Offer»** в админку не делаем в этой итерации. Если позже понадобится детальный срез воронки (просмотр → CTA → конверсия в заявку), добавим отдельно.

## 7. Изменение кнопки на уроке 4

Текущее поведение: на уроке 4 после прохождения квиза кнопка «Смотреть следующий урок» выглядит странно — следующего урока нет, идёт редирект в игру.

### 7.1 Новая пара i18n ключей

```ts
"funnel.lesson.proceed_final": {
  ru: "Перейти к следующему шагу",
  uz: "Keyingi qadamga o'tish",
},
```

### 7.2 Правка в `YouTubeLesson` / `copy.ts`

Найти компонент, который рендерит кнопку `onProceedClick` (скорее всего [components/funnel/YouTubeLesson.tsx](../../components/funnel/YouTubeLesson.tsx) или `lib/funnel/copy.ts`). Если текст кнопки приходит пропсом — добавить условие в `page.tsx`:

```tsx
const proceedLabel = lessonNumber === TOTAL_LESSONS
  ? t('funnel.lesson.proceed_final')
  : t('funnel.lesson.proceed_next');
```

Если хардкод — добавить пропс `proceedLabel?: string` с дефолтом текущего значения (обратно совместимо).

## 8. Файлы и изменения

### Новые файлы
- `app/start/final/page.tsx` — страница
- `components/final/FinalHero.tsx` — hero с 2 CTA
- `components/final/FinalOfferSection.tsx` — обёртка для 7 target-блоков + `<section id="ko-proq">`
- `components/final/FinalOfferCta.tsx` — финальный блок с «Konsultatsiya olish»
- `components/final/StickyConsultationBar.tsx` — sticky CTA для mobile
- `components/final/FinalLocaleGate.tsx` (или inline в page) — форсит `uz`

### Правки существующих файлов (только обратно совместимые)
- `app/api/funnel/quiz/route.ts` — меняем `next_url` для lesson=4 на `/start/final?lead_token=...`
- `components/RegistrationModal.tsx` — добавляем ветку `/start/final → final_offer` в `getSourcePage()` и новые ключи `modal.final.*`
- `app/api/bitrix/lead/route.ts` — добавляем ветку `sourcePage === 'final_offer'` (маркер в TITLE)
- `lib/i18n.tsx` — новые ключи: `final.*` (для hero/CTA страницы), `modal.final.*` (для модалки), `funnel.lesson.proceed_final`
- `components/funnel/YouTubeLesson.tsx` или `lib/funnel/copy.ts` — условный label для кнопки урока 4
- **Возможно:** пропс `ctaLabelKey?` / `onCtaClick?` в одном из target-блоков, если его внутренняя CTA не совместима. С дефолтами — без эффекта на `/target`.

### Тесты
- `app/api/funnel/quiz/__tests__/route.test.ts` — обновить assertion про `next_url` для lesson=4.
- Новые e2e тесты страницы `/start/final` — **не** в этой итерации (нет e2e-framework в проекте).

### Миграции БД
- **Нет.** `funnel_events.event_type` и `leads.source_page` — текстовые колонки.

## 9. Риски и крайние случаи

| Риск | Митигация |
|---|---|
| У какого-то target-блока внутри жёсткий CTA с «Записаться на курс» или ссылкой на цену | Добавляем опциональный пропс в этот блок (обратно совместимо). Если невозможно — форк в `components/final/`. |
| Пользователь возвращается на `/start/final` после игры | Страница открывается нормально (токен валидный, lesson=4 уже пройден). Показываем как есть. |
| Нет `lead_token` в query, но в localStorage есть identity | Используем localStorage. |
| Нет identity вообще | `router.replace('/start')`. |
| Pre-existing leads с source_page=game до релиза | Не затрагиваем. Новые заявки с `/start/final` получают `final_offer`; старые остаются как есть. |
| `/target` регрессия | Все правки target-компонентов — только через опциональные пропсы с дефолтами. Визуальный smoke-тест `/target` после реализации. |

## 10. Success criteria

- [ ] После квиза урока 4 пользователь попадает на `/start/final`, а не сразу в `/game`.
- [ ] Страница открывается только на узбекском.
- [ ] Две кнопки: «Simulyatorni boshlash» (→ `/game`) и «Ko'proq bilib olish» (→ скролл).
- [ ] Ниже рендерятся 7 согласованных блоков из `/target` без изменений визуала.
- [ ] Нет цены нигде на странице.
- [ ] Каждая CTA-кнопка внутри лендинг-части и sticky mobile CTA — «Konsultatsiya olish», открывает RegistrationModal.
- [ ] В Supabase `leads` приходят с `source_page='final_offer'`, в Bitrix — с маркером «Final Offer».
- [ ] В `funnel_events` логируются 5 новых event_type.
- [ ] `/target` выглядит и работает идентично до и после.
- [ ] На уроке 4 кнопка после квиза теперь «Keyingi qadamga o'tish» (uz) / «Перейти к следующему шагу» (ru).
