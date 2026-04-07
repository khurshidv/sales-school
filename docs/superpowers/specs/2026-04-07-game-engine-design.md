# Game Engine — Design Specification

## 1. Purpose

Core engine для RPG визуальной новеллы "Sales School". Чистый TypeScript движок без React-зависимостей. Обрабатывает сценарий (73 ноды, 5 дней), подсчитывает очки по 7 измерениям, управляет жизнями/комбо/таймерами/ачивками, и эмитит события для UI.

**Главная цель:** 0 багов. Достигается через TDD (200+ тестов), ScenarioValidator (программная верификация графа), и 100% branch coverage.

---

## 2. Architecture

```
game/                         # Чистый TypeScript, БЕЗ React
├── engine/
│   ├── types.ts              # Все типы (0 рантайм)
│   ├── EventBus.ts           # Typed event emitter
│   ├── ConditionEvaluator.ts # Оценка условий (AND/OR/NOT)
│   ├── ScenarioEngine.ts     # Ядро state machine
│   └── ScenarioValidator.ts  # Верификация графа сценария
│
├── systems/
│   ├── ScoringSystem.ts      # Очки, рейтинг, комбо, модификаторы
│   ├── LivesSystem.ts        # Жизни, game over, recovery
│   ├── TimerSystem.ts        # Таймеры (чистые данные, без setInterval)
│   ├── LevelSystem.ts        # XP, уровни, прогрессия
│   ├── AchievementSystem.ts  # Ачивки, прогресс
│   └── CoinSystem.ts         # Виртуальная валюта для реплея
│
├── store/
│   ├── gameStore.ts          # Zustand + Immer: сессия игры
│   └── playerStore.ts        # Zustand + localStorage: профиль
│
└── data/
    ├── scenarios/
    │   ├── car-dealership/
    │   │   ├── scenario.ts   # Метаданные
    │   │   ├── day1.ts ... day5.ts  # Ноды
    │   │   └── index.ts      # Сборка
    │   └── index.ts          # Реестр
    ├── characters/index.ts
    ├── products/index.ts
    └── achievements/index.ts
```

**Правило импортов:** game/ → components/game/ (однонаправленно). Никогда наоборот.

---

## 3. Type System

### 3.1 Базовые типы

```typescript
type Language = 'uz' | 'ru';
type LocalizedText = Record<Language, string>;
type ScoreDimension = 'empathy' | 'rapport' | 'timing' | 'expertise' | 'persuasion' | 'discovery' | 'opportunity';
type Rating = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
type DayOutcome = 'success' | 'partial' | 'failure' | 'hidden_ending';
```

### 3.2 ScenarioNode (discriminated union, 7 вариантов)

| type | Поля | Auto-advance? |
|------|------|---------------|
| `dialogue` | speaker, emotion, text: LocalizedText, background?, effects?, nextNodeId | Нет (ждёт клик) |
| `choice` | prompt: LocalizedText, choices[], timeLimit?, multiSelect?, expireNodeId? | Нет (ждёт выбор) |
| `day_intro` | background, title: LocalizedText, subtitle?: LocalizedText, nextNodeId | Нет (ждёт клик) |
| `condition_branch` | branches: {condition, nextNodeId}[], fallbackNodeId | Да |
| `score` | effects[], narrator?: LocalizedText, nextNodeId | Да |
| `timer_start` | duration, expireNodeId, nextNodeId | Да |
| `end` | outcome: DayOutcome, effects[], dialogue?, nextDayTeaser?: LocalizedText | Нет (конец) |

**Choice item:**
```typescript
interface ChoiceOption {
  id: string;
  text: LocalizedText;
  nextNodeId: string;
  effects: Effect[];
  condition?: Condition;    // Скрытый выбор — виден только если условие true
  feedbackText?: LocalizedText; // Реакция после выбора
}
```

**multiSelect:** `{ count: number }` — игрок выбирает ровно count вариантов. Все effects применяются. В Day 4 d4_preparation: `multiSelect: { count: 2 }` из 3 вариантов.

### 3.3 Condition (discriminated union, 10 вариантов)

| type | Поля | Логика |
|------|------|--------|
| `score_gte` | value: number | state.score.total >= value |
| `score_lte` | value: number | state.score.total <= value |
| `flag` | flag: string | state.flags[flag] === true |
| `has_achievement` | achievementId: string | playerState.achievements.includes(id) |
| `choice_was` | nodeId: string, choiceIndex: number | choiceHistory match |
| `lives_gte` | value: number | state.lives >= value |
| `level_gte` | value: number | playerState.level >= value |
| `and` | conditions: Condition[] | ALL true (vacuous truth for empty) |
| `or` | conditions: Condition[] | ANY true (false for empty) |
| `not` | condition: Condition | !evaluate(condition) |

### 3.4 Effect (discriminated union, 9 вариантов)

| type | Поля | Действие |
|------|------|----------|
| `add_score` | dimension: ScoreDimension, amount: number | Добавить очки (может быть отрицательным) |
| `lose_life` | — | lives -= 1 (min 0) |
| `gain_life` | — | lives += 1 (max 5) |
| `set_flag` | flag: string | flags[flag] = true |
| `unlock_achievement` | id: string | Добавить ачивку (дедупликация) |
| `add_xp` | amount: number | totalXp += amount |
| `add_coins` | amount: number | coins += amount |
| `add_bonus` | bonusType: string, multiplier: number | Временный множитель |
| `play_sound` | soundId: string | Только эмитит событие, state не меняется |

### 3.5 GameEvent (discriminated union для EventBus)

| type | data | Когда |
|------|------|-------|
| `score_changed` | dimension, amount, newTotal | После add_score |
| `life_lost` | remainingLives | После lose_life |
| `life_gained` | remainingLives | После gain_life |
| `achievement_unlocked` | achievementId, xpReward | После unlock_achievement |
| `combo_activated` | comboCount, multiplier | Когда combo >= 4 |
| `combo_reset` | — | Когда combo сбрасывается |
| `day_completed` | dayIndex, score, rating, isHidden | Достигнут end node |
| `game_over` | dayIndex, totalScore | lives <= 0 |
| `near_miss` | currentRating, nextRating, pointsNeeded | Score в 5% от следующего рейтинга |
| `timer_warning` | remaining | remaining <= 5с |
| `timer_expired` | nodeId | Таймер истёк |
| `coins_changed` | amount, newTotal | После add_coins |
| `sound_requested` | soundId | После play_sound эффекта |

### 3.6 State

```typescript
interface DimensionScores {
  empathy: number;
  rapport: number;
  timing: number;
  expertise: number;
  persuasion: number;
  discovery: number;
  opportunity: number;
}

interface GameSessionState {
  scenarioId: string;
  dayIndex: number;
  currentNodeId: string;
  score: {
    total: number;
    dimensions: DimensionScores;
  };
  lives: number;
  maxLives: number;               // Default 5
  flags: Record<string, boolean>;
  choiceHistory: Array<{
    nodeId: string;
    choiceIndex: number;
    timestamp: number;
  }>;
  comboCount: number;
  timerState: TimerState | null;
  isReplay: boolean;
  isGameOverRestart: boolean;     // true = бесплатный рестарт после game over
  startTime: number;              // Для Speed Bonus
  difficulty: DifficultyModifier;
}

interface TimerState {
  startedAt: number;
  duration: number;               // Секунды
  pausedAt: number | null;
  remaining: number;
}

interface DifficultyModifier {
  timerOffset: number;            // Секунды: -3 для harder, +5 для easier
  showHints: boolean;
  removeWorstChoice: boolean;
}

interface PlayerState {
  id: string;                     // uuid
  phone: string;                  // +998 XX XXX-XX-XX
  displayName: string;
  avatarId: 'male' | 'female';
  level: number;
  totalXp: number;
  totalScore: number;
  coins: number;
  achievements: string[];
  completedScenarios: CompletedScenarioRecord[];
}

interface CompletedScenarioRecord {
  scenarioId: string;
  dayIndex: number;
  score: number;
  rating: Rating;
  timeTaken: number;
  isReplay: boolean;
  completedAt: number;
}
```

### 3.7 Scenario & Day

```typescript
interface Scenario {
  id: string;
  productId: string;
  title: LocalizedText;
  description: LocalizedText;
  days: Day[];
  requiredLevel: number;
}

interface Day {
  id: string;
  dayNumber: number;
  title: LocalizedText;
  rootNodeId: string;
  nodes: Record<string, ScenarioNode>;
  targetScore: number;
  nextDayTeaser?: LocalizedText;  // Cliffhanger для Day Summary
}
```

---

## 4. Scoring System

### 4.1 Rating Formula

```
rating = score.total / day.targetScore

S >= 0.90    (90%+)
A >= 0.75    (75-89%)
B >= 0.60    (60-74%)
C >= 0.40    (40-59%)
D >= 0.20    (20-39%)
F <  0.20    (<20%)
```

### 4.2 Target Scores

| Day | Target | Max Possible | S threshold |
|-----|--------|-------------|-------------|
| 1 | 30 | ~44 | >= 27 |
| 2 | 40 | ~62 | >= 36 |
| 3 | 50 | ~65 | >= 45 |
| 4 | 60 | ~76 | >= 54 |
| 5 | 70 | ~83 | >= 63 |

### 4.3 Combo System

- **Threshold:** choice с суммарным add_score >= 10 баллов = "good"
- **Multiplier:** comboCount 0-3 = x1.0, comboCount 4 = x1.5, comboCount 5+ = x2.0
- **Reset:** choice с суммарным add_score <= 0 = reset combo to 0
- **Application:** multiplier применяется к текущему choice score ДО записи

### 4.4 Score Modifiers (после завершения дня)

| Modifier | Condition | Bonus |
|----------|-----------|-------|
| Speed Bonus | timeTaken < 60 секунд (фикс. для всех дней) | +10% |
| First Try | isReplay === false | +15% |
| No Timer Expire | Ни один таймер не истёк за день | +5% |

Модификаторы суммируются и применяются к итоговому score дня.

### 4.5 Near Miss

Если score в пределах 5% от порога следующего рейтинга → эмитить `near_miss` event.
Пример: score=26 при target=30. 26/30=86.7% (A). До S нужно 27. nearMiss = {currentRating: 'A', nextRating: 'S', pointsNeeded: 1}.

---

## 5. Lives System

- **Start:** 3 жизни на сценарий
- **Max:** 5
- **Lose life:** Rating = F, ИЛИ таймер истёк на choice с expireNodeId ведущим к lose_life эффекту
- **Gain life:** Hidden endings (День 2, 3, 4) + Грандмастер (День 5) — через gain_life эффект в сценарии
- **Game Over:** lives <= 0 → рестарт текущего дня с lives = 1, прогресс прошлых дней сохранён

### handleGameOver logic:
```
if lives <= 0:
  emit(game_over)
  reset current day:
    - currentNodeId = day.rootNodeId
    - score = { total: 0, dimensions: all 0 }
    - flags = {} (clear day flags, keep cross-day flags: d1_success, d2_success, etc.)
    - comboCount = 0
    - lives = 1
    - isReplay = true (counts as replay for scoring)
```

---

## 6. Timer System

Чистые данные — UI отвечает за countdown рендеринг.

- `startTimer(duration)` → TimerState
- `pauseTimer(state)` → TimerState (записывает pausedAt)
- `resumeTimer(state)` → TimerState (пересчитывает remaining)
- `getRemaining(state, now)` → number (секунды, min 0)
- `isExpired(state, now)` → boolean

**Durations в сценарии:**
- Day 1 (d1_approach): 15с
- Day 2 (d2_objection): 10с
- Day 3 (d3_compromise): 10с
- Day 4 (d4_fleet): 10с
- Day 5 (d5_approach, d5_objection, d5_closing): 10с, 10с, 5с

**Adaptive difficulty:** timerOffset добавляется к duration. Default 0. Harder: -3. Easier: +5.

---

## 7. Level System

```typescript
xpForLevel(n: number): number {
  return Math.floor(100 * Math.pow(n, 1.5));
}
```

`xpForLevel(n)` = XP нужные для перехода с уровня n на n+1.

| Level | XP to next | Cumulative |
|-------|-----------|------------|
| 1 → 2 | 100 | 100 |
| 2 → 3 | 282 | 382 |
| 3 → 4 | 519 | 901 |
| 5 → 6 | 1,118 | 2,789 |
| 10 → 11 | 3,162 | 12,389 |

---

## 8. Coin System

### Sources

| Source | Coins |
|--------|-------|
| Hidden ending | +2 |
| S-rating on day | +1 |
| Achievement unlocked | +1 |
| First scenario completion | +3 |

### Costs

| Action | Cost |
|--------|------|
| Replay day | 1 coin |

**Start balance:** 0 coins. Первый прогон бесплатный (isReplay = false).

---

## 9. Achievement System

### Achievements (15 total)

**Progress (5):**

| ID | Condition | XP |
|----|-----------|-----|
| `first_contact` | Day 1 outcome = success | 50 |
| `final_test_passed` | Day 5 outcome = success | 100 |
| `full_week` | All 5 days completed | 200 |
| `car_master` | All 5 days rating >= A | 500 |
| `perfectionist` | All 5 days rating = S in one run | 750 |

**Skill (5):**

| ID | Condition | XP |
|----|-----------|-----|
| `combo_king` | comboCount >= 5 in any day | 200 |
| `speed_demon` | 3+ days completed with Speed Bonus | 150 |
| `all_rounder` | Score >= 80% in each of 7 dimensions at least once | 400 |
| `comeback_kid` | Fail day (F) → replay → rating >= A | 150 |
| `no_pressure` | Complete day with all timed choices answered in first 50% of time | 200 |

**Hidden (5):**

| ID | Condition | XP |
|----|-----------|-----|
| `respect_earns_referrals` | Day 2 hidden ending | 150 |
| `love_sells` | Day 3 hidden ending | 180 |
| `corporate_king` | Day 4 hidden ending | 200 |
| `grandmaster` | Day 5 grandmaster ending | 500 |
| `secret_hunter` | Unlock all 4 hidden achievements | 300 |

---

## 10. Adaptive Difficulty

Рассчитывается между днями на основе предыдущих результатов.

```
Если средний рейтинг за прошлые дни >= A:
  timerOffset = -3  (жёстче)
  showHints = false
  removeWorstChoice = false

Если средний рейтинг за прошлые дни <= D:
  timerOffset = +5  (мягче)
  showHints = true  (нарратор даёт подсказку)
  removeWorstChoice = true (худший выбор скрыт)

Иначе:
  timerOffset = 0
  showHints = false
  removeWorstChoice = false
```

---

## 11. EventBus

Typed emitter. Engine эмитит, UI подписывается.

```typescript
class GameEventBus {
  on<T extends GameEvent['type']>(type: T, callback: (event: Extract<GameEvent, {type: T}>) => void): void;
  off<T extends GameEvent['type']>(type: T, callback: Function): void;
  emit(event: GameEvent): void;
  clear(): void;  // Убрать все подписки
}
```

Singleton — создаётся один раз, используется и engine и UI.

---

## 12. Replay System

- **Первый прогон:** isReplay = false, бесплатный
- **Replay:** isReplay = true, стоит 1 coin
- **Choice shuffle:** при isReplay = true, порядок choices в choice-нодах перемешивается (детерминированный seed = dayId + playerId для воспроизводимости)
- **First Try Bonus:** не начисляется при isReplay = true
- **Score записывается:** берётся лучший из attempts (best score per day)
- **Game Over = forced replay:** isReplay = true, isGameOverRestart = true. НЕ стоит coin (бесплатный рестарт). First Try Bonus не начисляется.

---

## 13. Scenario Data Format

Каждая нода — TypeScript const:

```typescript
// game/data/scenarios/car-dealership/day1.ts
import type { Day } from '@/game/engine/types';

export const day1: Day = {
  id: 'car-day1',
  dayNumber: 1,
  title: { uz: "Birinchi mijoz", ru: "Первый клиент" },
  rootNodeId: 'd1_intro',
  targetScore: 30,
  nextDayTeaser: {
    uz: "Ertaga: bilimdon mijoz keladi — u hamma narsani biladi...",
    ru: "Завтра: придёт знающий клиент — она всё знает..."
  },
  nodes: {
    d1_intro: {
      id: 'd1_intro',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: {
        uz: "Ertalab. Toshkentdagi Chevrolet saloni...",
        ru: "Утро. Двери Chevrolet-салона..."
      },
      background: 'bg_showroom_entrance',
      nextNodeId: 'd1_briefing'
    },
    // ... all nodes
  }
};
```

---

## 14. ScenarioValidator

Программа проверки сценария. Запускается как тест, не в рантайме.

### Проверки:

**Структурные:**
1. Каждый nextNodeId ведёт на существующую ноду в том же дне
2. Каждый fallbackNodeId существует
3. Каждый expireNodeId существует
4. rootNodeId существует
5. Нет сирот (все ноды достижимы от root)
6. Каждый путь завершается end-нодой (нет бесконечных циклов)
7. Нет дубликатов ID

**Типовые:**
8. Все speaker значения — известные персонажи
9. Все emotion значения — валидные эмоции этого персонажа
10. Все dimension в add_score — валидные ScoreDimension
11. Все achievementId — известные ачивки
12. Все text имеют и uz и ru (нет пустых строк)

**Балансные:**
13. S-рейтинг достижим (хотя бы 1 путь с score >= 90% target)
14. Failure возможен (хотя бы 1 путь с score < 20% target)
15. Каждый choice node имеет >= 2 вариантов
16. multiSelect nodes имеют >= count+1 вариантов

**Cross-day:**
17. Флаги в условиях (conditions) устанавливаются (set_flag) хотя бы в одном месте
18. Cross-day флаги (d1_success, d2_success) устанавливаются в соответствующих днях

---

## 15. Integration Test Paths

### Path 1: Grandmaster (оптимальный)
Day 1: A→A→A → score ~44, success, d1_success
Day 2: callback(+5), A→A→A → score ~57, hidden, respect_earns_referrals, +1 life
Day 3: A→A→anniversary → hidden, love_sells, +1 life
Day 4: prep(A+B), A→A→bundled → hidden, corporate_king, +1 life
Day 5: dilnoza_tip, A→A→A→A → grandmaster, +1 life
**Verify:** 5 hidden achievements, coins earned, XP total matches expected

### Path 2: Минимальный (all B choices)
Day 1-5: all B → all partial
**Verify:** no achievements (except full_week), no game over, completed

### Path 3: Game Over
Day 1: expired → F → lose life (2)
Day 2: expired → F → lose life (1)
Day 3: expired → F → lose life (0) → Game Over
**Verify:** restart Day 3 with 1 life, Days 1-2 progress saved

### Path 4: Comeback Kid
Day 2: F → game over → replay → A
**Verify:** comeback_kid achievement unlocked

---

## 16. Phone + Lead Flow

- Формат: +998 XX XXX-XX-XX (только Узбекистан)
- Валидация: regex `/^\+998\d{9}$/`
- **Повторный вход:** тот же номер → найти существующего игрока, восстановить прогресс (Welcome Back)
- **UTM:** сохранять utm_source, utm_medium, utm_campaign, referrer из URL при создании
- **localStorage:** player_id хранится для быстрого входа без повторного ввода

---

## 17. Analytics Events (game_events)

| event_type | event_data | Когда |
|------------|-----------|-------|
| `player_created` | {utm_source, utm_medium, utm_campaign, referrer} | Новый игрок |
| `player_returned` | {daysCompleted} | Повторный вход по номеру |
| `game_started` | {scenarioId, avatarId} | Начало сценария |
| `day_started` | {dayIndex, lives, isReplay} | Начало дня |
| `choice_made` | {nodeId, choiceIndex, score, comboCount} | Каждый выбор |
| `timer_expired` | {nodeId, dayIndex} | Таймер истёк |
| `day_completed` | {dayIndex, score, rating, timeTaken, isHidden} | Конец дня |
| `day_failed` | {dayIndex, score, rating} | F-рейтинг |
| `game_over` | {dayIndex, livesLost} | Потеря всех жизней |
| `achievement_unlocked` | {achievementId} | Ачивка |
| `game_completed` | {totalScore, avgRating, totalTime} | Все 5 дней |
| `cta_clicked` | {source: 'day_summary' | 'final_results'} | Клик на CTA курса |
| `dropped_off` | {lastNodeId, dayIndex, timeSpent} | beforeunload |

---

## 18. Error Handling

- **Supabase недоступен:** localStorage fallback. Sync при восстановлении.
- **Invalid nodeId:** ScenarioEngine.resolveNode throws → catch в store → emit error event → UI показывает "Ошибка сценария"
- **Timer race:** если таймер истёк во время обработки выбора → выбор приоритетнее (grace period 500ms)
- **Duplicate phone:** API route возвращает существующего игрока (upsert)
- **localStorage full:** try/catch, graceful degradation
- **2 вкладки:** последняя запись выигрывает (no lock)

---

## 19. Back Button / Navigation

- `history.pushState` на каждом переходе между днями
- `popstate` listener показывает confirm dialog: "Точно выйти? Прогресс сохранён"
- Если подтверждает → возврат на /game hub
- Auto-save: каждый выбор сохраняется в gameStore → периодический sync с Supabase (debounce 5s)

---

## 20. Audio Strategy

- **First tap:** AudioContext создаётся по первому тапу/клику (браузеры блокируют autoplay)
- **Preload per day:** при начале дня загружаются только звуки этого дня + BGM
- **BGM:** loop, fade in/out при смене (showroom → tension при таймере → summary)
- **SFX:** fire-and-forget, не блокируют UI
- **Mute:** toggle в HUD, сохраняется в localStorage

---

## 21. Image Preloading

- При начале дня: preload background + все персонажи этого дня + машины если упоминаются
- Day 1: bg_showroom_entrance, bg_showroom, bg_manager_office + rustam(4) + bobur(4) + car_equinox, car_tracker, car_cobalt
- Показывать loading bar с прогрессом
- Fallback: если изображение не загрузилось → placeholder с именем персонажа
