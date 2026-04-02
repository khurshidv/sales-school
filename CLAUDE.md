@AGENTS.md

# Sales School — Gamification Module

RPG визуальная новелла для тренировки навыков продаж. Игрок выбирает персонажа (м/ж), выбирает товар (напр. автомобиль в салоне), и проживает рабочий день: к нему приходят клиенты, он выбирает как поступить (подойти/подождать, что сказать, как реагировать на возражения) — каждый выбор ведёт к ветвлениям с разными исходами.

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
│   ├── game/
│   │   ├── page.tsx      # Хаб: выбор персонажа → продукта → игра
│   │   ├── play/page.tsx # Основной экран игры (движок рендерит тут)
│   │   ├── leaderboard/page.tsx
│   │   └── profile/page.tsx
│   └── auth/
│       ├── login/page.tsx
│       └── callback/route.ts
│
├── api/game/
│   ├── progress/route.ts
│   ├── leaderboard/route.ts
│   └── achievements/route.ts
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
│   └── VideoPlayer.tsx       # Катсцены
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
- **cutscene** — видеоролик → nextNodeId
- **condition_branch** — ветвление по условиям → branches + fallback
- **score** — применить эффекты → nextNodeId
- **timer_start** — запустить таймер (expireNodeId если время вышло)
- **end** — конец (success / failure / hidden_ending)

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

### Таблицы
- **players** — профиль (id → auth.users, display_name, avatar_id, level, total_xp, total_score)
- **game_progress** — сохранения (player_id, scenario_id, day_id, session_state JSONB, is_completed)
- **player_achievements** — разблокированные достижения (player_id, achievement_id, unlocked_at)
- **leaderboard** — таблица лидеров (player_id, display_name, level, total_score, scenarios_completed)
- **completed_scenarios** — история прохождений (player_id, scenario_id, day_id, score, time_taken)

### Безопасность
- RLS на ВСЕХ таблицах
- Игрок видит/редактирует только свои данные
- Лидерборд — чтение для всех
- Никогда не использовать service key на клиенте

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
- Все тексты через i18n (uz + ru)
- UI компоненты — landscape 16:9 first

### ЗАПРЕЩЕНО
- Импортировать React в файлы внутри `game/` (кроме `game/store/` где Zustand hooks)
- Использовать `output: "export"` в next.config.ts (нужны API routes)
- Обходить RLS через service key на клиенте
- Импортировать из `components/game/` в `game/`
- Хардкодить тексты — только через i18n

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
