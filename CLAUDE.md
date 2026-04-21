@AGENTS.md

# Sales School — Gamification Module

RPG визуальная новелла для тренировки навыков продаж. Игрок выбирает персонажа (м/ж), выбирает товар (напр. автомобиль в салоне), и проживает рабочий день: к нему приходят клиенты, он выбирает как поступить (подойти/подождать, что сказать, как реагировать на возражения) — каждый выбор ведёт к ветвлениям с разными исходами.

---

## Статус (2026-04-21)

- **Фазы 0–3 завершены**: GDD, engine, game UI, контент (Car Dealership, 3 дня), интро-анимация.
- **Фаза 5 (мета)**: Supabase-синк, ачивки, уровни, лидерборд — **в проде**.
- **Dashboard 2.0**: 11 админ-страниц в Premium-стиле + 15 guarded API-роутов, cookie-only auth, real-time KPI, HR-инструменты, CSV-экспорт, auto-insights.
- **Аналитика**: `game_events` пишется через `/api/game/events` (service_role); `offer_events` — через `/api/game/offer-events`. Raw anon-insert убран, RLS закрыт.
- **Бэкфил**: migration `013_backfill_game_events.sql` восстанавливает historical events из `completed_scenarios`.
- **Session persistence**: `lib/game/sessionPersist.ts` + `<GameSessionPersister/>` в `(game)/layout.tsx`; refresh сохраняет текущий день, `useGameEngine` авто-ресторит.
- **Админ-фильтры в URL**: `usePeriodParam` → `?period=7d|30d|90d|all`; shareable links работают.
- **Безопасность**: `proxy.ts` fail-closed (пустой `ADMIN_PASSWORD` = админ недоступен), rate-limit 8 запросов/мин на `/api/admin/login`.
- **Узбекский интерфейс админки НЕ делаем** — только русский (deliberate product decision).

## Следующий scope (если появится запрос)

- A/B-тесты offer-страницы (variant_id уже логируется в `offer_events`, не хватает UI).
- AI-инсайты через LLM поверх `detectAutoInsights`.
- Push / Slack уведомления на критичные авто-инсайты.
- Video-replay с реконструкцией UI игры.
- Новые сценарии (недвижимость, электроника, мебель) — **в паузе по явному решению**.

---

## Аудитория и локализация

- **Основная аудитория**: узбекская (uz)
- **Вторичная**: русскоязычная (ru)
- Весь контент игры (диалоги, UI, достижения) на **двух языках**: uz + ru
- Используется существующая система i18n из `lib/i18n.tsx`

## Платформа

- **Primary**: мобильные устройства в **landscape (горизонтальной) ориентации**
- **Secondary**: desktop
- Все ассеты в формате **16:9 landscape**
- При portrait-ориентации показывать overlay "Поверните телефон"
- Touch-friendly: кнопки минимум 48px, зоны тапа для прокрутки диалога
- CSS: использовать `dvh`/`dvw` для корректных размеров на мобильных

## Стек технологий

| Инструмент | Назначение |
|---|---|
| **TypeScript** | Вся логика игры — чистый TS без React |
| **React 19** | UI компоненты |
| **Next.js 16** | App Router, route groups, API routes |
| **Zustand + Immer** | State management (НЕ XState) |
| **Framer Motion** | Анимации, переходы между сценами |
| **Supabase** | Auth, PostgreSQL, Realtime (лидерборд) |
| **Tailwind CSS 4** | Стили |

**Без Python**. Без Canvas/WebGL/Pixi.js/Phaser. Визуальные ассеты — AI-генерированные изображения и видео, не real-time рендеринг.

---

## Архитектура

### Route Groups
```
app/
├── (marketing)/          # Существующие лендинги
│   ├── layout.tsx        # Светлая тема, header/footer
│   ├── page.tsx          # Вебинар
│   └── target/page.tsx   # Курс
│
├── (game)/               # RPG игра
│   ├── layout.tsx        # Тёмная тема, fullscreen, без header
│   └── game/
│       ├── page.tsx      # Хаб: форма (имя+тел) → выбор персонажа → продукта
│       ├── play/page.tsx # Основной экран игры (движок рендерит тут)
│       ├── leaderboard/page.tsx
│       └── profile/page.tsx
│
├── api/game/
│   ├── players/route.ts  # POST: создать/найти игрока по телефону
│   ├── progress/route.ts
│   ├── leaderboard/route.ts
│   ├── achievements/route.ts
│   └── events/route.ts   # POST: аналитика (game_events)
│
├── layout.tsx            # Root: html, body, шрифты
└── globals.css
```

### Разделение логики

```
game/                     # Чистый TypeScript (БЕЗ React)
├── engine/
│   ├── types.ts          # Все типы игры
│   ├── ScenarioEngine.ts # Резолвит ноды, вычисляет переходы
│   └── ConditionEvaluator.ts
│
├── systems/
│   ├── ScoringSystem.ts  # Очки, множители, бонусы
│   ├── LivesSystem.ts    # Жизни (lose/gain/game over)
│   ├── TimerSystem.ts    # Таймеры (start/pause/expire)
│   ├── AchievementSystem.ts
│   └── LevelSystem.ts    # XP, уровни, прогрессия
│
├── store/
│   ├── gameStore.ts      # Zustand: сессия игры
│   ├── playerStore.ts    # Zustand: профиль игрока
│   └── middleware/
│       └── supabaseSync.ts
│
├── data/
│   ├── scenarios/        # Сценарии как TypeScript объекты
│   │   ├── index.ts      # Реестр всех сценариев
│   │   ├── car-dealership/
│   │   │   ├── scenario.ts
│   │   │   ├── day1.ts, day2.ts, ...
│   │   │   └── assets.ts
│   │   └── _template/scenario.ts
│   ├── characters/index.ts
│   ├── products/index.ts
│   └── achievements/index.ts
│
└── docs/                 # Документация (GDD, сценарии в текстовом виде)
    ├── GDD.md
    ├── scenarios/
    │   └── car-dealership.md
    └── asset-map.md

components/game/          # React UI компоненты
├── engine/               # Рендеринг визуальной новеллы
│   ├── SceneRenderer.tsx     # Фон + персонажи
│   ├── DialogueBox.tsx       # Текст с эффектом печатной машинки
│   ├── ChoicePanel.tsx       # Кнопки выбора (+ таймер)
│   ├── CharacterSprite.tsx   # Портрет с эмоциями
│   ├── TransitionOverlay.tsx # Переходы (Framer Motion)
│   └── DayIntroTransition.tsx # Интро дня (Ken Burns на фоне + текст)
│
├── hud/                  # Heads-Up Display
│   ├── GameHUD.tsx
│   ├── ScoreDisplay.tsx
│   ├── LivesDisplay.tsx
│   ├── TimerBar.tsx
│   ├── BonusIndicator.tsx
│   └── LevelBadge.tsx
│
├── screens/              # Полноэкранные UI
│   ├── CharacterSelect.tsx
│   ├── ProductSelect.tsx
│   ├── DaySummary.tsx
│   ├── GameOver.tsx
│   ├── LevelComplete.tsx
│   ├── AchievementPopup.tsx
│   ├── PauseMenu.tsx
│   └── RotateDevice.tsx  # Overlay при portrait
│
└── leaderboard/
    ├── LeaderboardTable.tsx
    └── PlayerRank.tsx

lib/
├── supabase/
│   ├── client.ts         # Браузерный Supabase клиент
│   ├── server.ts         # Серверный клиент (API routes)
│   └── types.ts          # Сгенерированные типы БД
└── game/hooks/
    ├── useGameEngine.ts  # Связывает ScenarioEngine с React
    ├── useTimer.ts       # Таймер с pause/resume
    ├── useAutoSave.ts    # Авто-сохранение прогресса
    └── useLeaderboard.ts # Realtime подписка на лидерборд
```

---

## Система типов (game/engine/types.ts)

### Граф сценария
- **Scenario** — сценарий (id, productId, title, days[], requiredLevel, unlockCondition?)
- **Day** — один день (rootNodeId, nodes: Record<string, ScenarioNode>, assets, timeLimit?, targetScore)

### Типы нод (ScenarioNode — discriminated union по полю `type`)
- **dialogue** — текст от персонажа/рассказчика → nextNodeId
- **choice** — варианты ответа (с timeLimit?, с hidden choices по условию)
- **day_intro** — интро дня (Ken Burns на фоне + текст, Framer Motion) → nextNodeId
- **condition_branch** — ветвление по условиям → branches + fallback
- **score** — применить эффекты → nextNodeId
- **timer_start** — запустить таймер (expireNodeId если время вышло)
- **end** — конец (success / partial / failure / hidden_ending)

### Условия (Condition — discriminated union)
- `score_gte`, `score_lte`, `has_achievement`, `choice_was`, `lives_gte`, `level_gte`, `flag`
- Комбинаторы: `and`, `or`, `not`

### Эффекты (Effect — discriminated union)
- `add_score`, `lose_life`, `gain_life`, `set_flag`, `unlock_achievement`, `add_bonus`, `add_xp`, `play_sound`

### Состояние
- **PlayerState** — id, displayName, avatarId, level, totalXp, achievements[], completedScenarios[]
- **GameSessionState** — scenarioId, dayId, currentNodeId, score, lives, flags, choiceHistory, activeBonuses, timerState

---

## Supabase схема БД

### Авторизация
- **Без Supabase Auth** — игра как бесплатная воронка / лид-магнит
- Вход: форма (имя + телефон) → создание/поиск игрока по phone
- Сессия: player_id в localStorage
- Никогда не использовать service key на клиенте

### Таблицы
- **players** — лид (id uuid, phone unique, display_name, avatar_id, level, total_xp, total_score, utm_source/medium/campaign, referrer)
- **game_progress** — сохранения (player_id, scenario_id, day_id, session_state JSONB, is_completed)
- **player_achievements** — разблокированные достижения (player_id, achievement_id, unlocked_at)
- **completed_scenarios** — история (player_id, scenario_id, score, rating, time_taken, choices JSONB)
- **leaderboard** — таблица лидеров (auto-sync через триггер on_player_update)
- **game_events** — аналитика воронки (player_id, event_type, event_data JSONB, scenario_id, day_id)

### Аналитика (game_events.event_type)
- `game_started` — начал игру
- `day_started` / `day_completed` / `day_failed` — прогресс по дням
- `choice_made` — каждый выбор (для анализа популярных путей)
- `achievement_unlocked` — разблокировка ачивки
- `game_completed` — прошёл все 5 дней
- `dropped_off` — закрыл/ушёл (отправляется при beforeunload)

### Realtime
- `leaderboard` таблица добавлена в publication `supabase_realtime`
- Триггер `on_player_update` автоматически обновляет leaderboard при изменении players

---

## Порядок реализации (по фазам)

### Фаза 0: Сценарий и геймдизайн (ДО КОДА!)
> **Ничего не кодим пока нет полного сценария в письменном виде.**
1. `game/docs/GDD.md` — Game Design Document (все механики, формулы, достижения)
2. `game/docs/scenarios/car-dealership.md` — полный сценарий на uz+ru (все дни, все ветвления, очки за каждый выбор)
3. `game/docs/asset-map.md` — список всех изображений/видео с размерами
4. Ревью: все пути проходимы, баланс очков, нет тупиков

### Фаза 1: Инфраструктура
- Установить zustand, immer, framer-motion, @supabase/supabase-js, @supabase/ssr
- Удалить `output: "export"` из next.config.ts
- Реструктурировать app/ в route groups: (marketing) и (game)
- Настроить Supabase клиенты (lib/supabase/)
- Запустить миграцию БД

### Фаза 2: Core Engine (чистый TypeScript)
- types.ts, ScenarioEngine.ts, ConditionEvaluator.ts
- ScoringSystem, LivesSystem, TimerSystem, AchievementSystem, LevelSystem
- Zustand stores (gameStore, playerStore, supabaseSync middleware)
- Unit-тесты для engine и systems

### Фаза 3: Game UI
- Layout (game): тёмная тема, fullscreen, landscape-first
- Движок рендеринга: SceneRenderer, DialogueBox, ChoicePanel
- HUD: очки, жизни, таймер, бонусы, уровень
- Экраны: выбор персонажа, выбор продукта, game over, результаты

### Фаза 4: Контент
- Перевести текстовый сценарий в TypeScript объекты (game/data/scenarios/)
- Сгенерировать AI ассеты (фоны, персонажи, эмоции)
- Авто-сохранение + API routes

### Фаза 5: Мета-системы
- Лидерборд (Supabase Realtime)
- Уровни и XP
- Достижения (обычные + скрытые)

---

## Правила разработки

### ОБЯЗАТЕЛЬНО
- Игровая логика (`game/`) — ТОЛЬКО чистый TypeScript, без импортов React
- Сценарии — TypeScript объекты (НЕ JSON, НЕ YAML) для type-safety
- RLS на каждой новой таблице в Supabase
- Зависимости текут в одну сторону: `game/` → `components/game/` (не наоборот)
- Все **игровые** тексты через i18n (uz + ru). **Админка** — только русский.
- UI компоненты — landscape 16:9 first
- Новые клиентские фичи админки → создавать API-роут в `app/api/admin/*`, типизированный `fetchX()` в `lib/admin/api.ts`. Не импортировать `queries-v2` / `page-queries` / `supabase/admin.ts` из client-компонентов (сборка упадёт — там стоит `import 'server-only';`).
- События клиента (`game_events`, `offer_events`) пишутся через API-роуты (`/api/game/events`, `/api/game/offer-events`), НЕ через client supabase insert. RLS на этих таблицах закрыт.
- Миграции Supabase — **ADD-only**: никогда не модифицируем существующие колонки/таблицы. Новые миграции нумеруются по порядку.
- Admin-фильтры периода — через `usePeriodParam()` из `lib/admin/usePeriodParam.ts` (URL-params, shareable). Не городить новые `useState<Period>`.

### ЗАПРЕЩЕНО
- Импортировать React в файлы внутри `game/` (кроме `game/store/` где Zustand hooks)
- Использовать `output: "export"` в next.config.ts (нужны API routes)
- Обходить RLS через service key на клиенте
- Импортировать из `components/game/` в `game/`
- Хардкодить тексты — только через i18n
- Добавлять узбекский в админку — по решению, админка только на русском
- Писать `--no-verify` / `--no-gpg-sign` на коммитах (pre-commit hooks обязательны)

### Формат сценариев
Сценарии определяются как TypeScript const объекты в `game/data/scenarios/`:
```typescript
// game/data/scenarios/car-dealership/day1.ts
export const carDealershipDay1: Day = {
  id: "car-day1",
  dayNumber: 1,
  title: "День 1: Первый клиент",
  rootNodeId: "intro",
  targetScore: 50,
  assets: { ... },
  nodes: {
    intro: {
      id: "intro",
      type: "dialogue",
      speaker: "manager",
      text: "Добро пожаловать! Видишь клиента у витрины?",
      nextNodeId: "approach_choice",
    },
    approach_choice: {
      id: "approach_choice",
      type: "choice",
      prompt: "Как вы подойдёте к клиенту?",
      timeLimit: 15,
      choices: [
        {
          text: "Добрый день! Чем могу помочь?",
          nextNodeId: "good_approach",
          effects: [{ type: "add_score", amount: 20 }],
        },
        // ... другие варианты
      ],
    },
    // ... остальные ноды
  },
};
```

Для добавления нового сценария:
1. Создать папку в `game/data/scenarios/{name}/`
2. Написать `scenario.ts`, `day1.ts`, ..., `assets.ts`
3. Зарегистрировать в `game/data/scenarios/index.ts`
4. Добавить продукт в `game/data/products/index.ts`
5. Использовать `_template/scenario.ts` как отправную точку

---

## Зависимости (установить в Фазе 1)
```
npm install zustand immer framer-motion @supabase/supabase-js @supabase/ssr
```
