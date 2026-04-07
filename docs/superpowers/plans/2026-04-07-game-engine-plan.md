# Phase 2: Core Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete game engine (pure TypeScript) with 200+ tests guaranteeing 0 bugs

**Architecture:** TDD in game/ directory — types first, then pure functions (ConditionEvaluator, ScenarioEngine), then systems (Scoring, Lives, Timer, Level, Achievement, Coins), then stores (Zustand), then data (73 nodes as TypeScript), then ScenarioValidator + integration tests

**Tech Stack:** TypeScript strict, Vitest, Zustand + Immer, Supabase (DB only, no auth)

**Spec:** `docs/superpowers/specs/2026-04-07-game-engine-design.md`

---

## Pre-implementation fixes

### Task 0: Setup & doc fixes

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Modify: `CLAUDE.md` (resilience→opportunity, add partial outcome)
- Modify: Supabase `players` table (add coins column)

- [ ] **Step 1: Install Vitest**
```bash
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Create vitest.config.ts**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['game/**/*.test.ts'],
    coverage: {
      include: ['game/engine/**', 'game/systems/**'],
      thresholds: { branches: 100, functions: 100, lines: 100 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 3: Add scripts to package.json**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Run `npm test` — verify Vitest works (0 tests found)**

- [ ] **Step 5: Fix CLAUDE.md — replace `resilience` with `opportunity`, add `partial` outcome**

- [ ] **Step 6: Add coins to Supabase players table**
```sql
ALTER TABLE public.players ADD COLUMN coins integer NOT NULL DEFAULT 0;
```

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "chore: setup vitest, fix doc discrepancies, add coins"
```

---

## Engine Core

### Task 1: types.ts — All types (0 runtime code)

**Files:**
- Create: `game/engine/types.ts`
- Create: `game/engine/__tests__/types.test.ts`

- [ ] **Step 1: Write type compilation tests**
```typescript
// game/engine/__tests__/types.test.ts
import { describe, it, expectTypeOf } from 'vitest';
import type {
  ScenarioNode, Condition, Effect, GameEvent,
  GameSessionState, PlayerState, ScoreDimension,
  Rating, DayOutcome, LocalizedText, Day, Scenario,
} from '../types';

describe('types', () => {
  it('ScoreDimension has exactly 7 values', () => {
    const dims: ScoreDimension[] = [
      'empathy','rapport','timing','expertise','persuasion','discovery','opportunity'
    ];
    expectTypeOf(dims).toMatchTypeOf<ScoreDimension[]>();
  });

  it('Rating has 6 values', () => {
    const ratings: Rating[] = ['S','A','B','C','D','F'];
    expectTypeOf(ratings).toMatchTypeOf<Rating[]>();
  });

  it('DayOutcome includes partial', () => {
    const outcome: DayOutcome = 'partial';
    expectTypeOf(outcome).toMatchTypeOf<DayOutcome>();
  });

  it('dialogue node narrows correctly', () => {
    const node: ScenarioNode = {
      id: 'test', type: 'dialogue',
      speaker: 'rustam', emotion: 'friendly',
      text: { uz: 'test', ru: 'тест' },
      nextNodeId: 'next',
    };
    if (node.type === 'dialogue') {
      expectTypeOf(node.speaker).toBeString();
      expectTypeOf(node.nextNodeId).toBeString();
    }
  });

  it('choice node with multiSelect compiles', () => {
    const node: ScenarioNode = {
      id: 'test', type: 'choice',
      prompt: { uz: '', ru: '' },
      choices: [],
      multiSelect: { count: 2 },
    };
    if (node.type === 'choice') {
      expectTypeOf(node.multiSelect).toMatchTypeOf<{ count: number } | undefined>();
    }
  });

  it('add_score effect requires valid dimension', () => {
    const effect: Effect = {
      type: 'add_score',
      dimension: 'empathy',
      amount: 10,
    };
    expectTypeOf(effect).toMatchTypeOf<Effect>();
  });

  it('nested AND/OR/NOT condition compiles', () => {
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'flag', flag: 'test' },
        { type: 'or', conditions: [
          { type: 'score_gte', value: 50 },
          { type: 'not', condition: { type: 'flag', flag: 'bad' } },
        ]},
      ],
    };
    expectTypeOf(cond).toMatchTypeOf<Condition>();
  });
});
```

- [ ] **Step 2: Run test — fails (types don't exist)**
```bash
npx vitest run game/engine/__tests__/types.test.ts
```

- [ ] **Step 3: Implement types.ts**
Full implementation per spec sections 3.1–3.7. All types as discriminated unions. Export everything. 0 runtime code.

- [ ] **Step 4: Run test — passes**

- [ ] **Step 5: Commit**
```bash
git add game/engine/ && git commit -m "feat(engine): add all game types"
```

---

### Task 2: EventBus.ts

**Files:**
- Create: `game/engine/EventBus.ts`
- Create: `game/engine/__tests__/EventBus.test.ts`

- [ ] **Step 1: Write tests** (6 tests: emit/on, multiple listeners, off, typed events, clear, emit without listeners)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — typed generic class, Map<type, Set<callback>>
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 3: ConditionEvaluator.ts

**Files:**
- Create: `game/engine/ConditionEvaluator.ts`
- Create: `game/engine/__tests__/ConditionEvaluator.test.ts`

- [ ] **Step 1: Write tests** (31 tests per spec: 16 basic conditions × 2, 7 combinator tests, 4 nesting, 4 edge cases including Day 5 grandmaster condition)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — single pure function `evaluateCondition(condition, state, playerState?)` with switch on condition.type, recursive for and/or/not
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 4: ScoringSystem.ts

**Files:**
- Create: `game/systems/ScoringSystem.ts`
- Create: `game/systems/__tests__/ScoringSystem.test.ts`

- [ ] **Step 1: Write tests** (35 tests: 15 rating boundaries, 8 combo, 4 modifiers, 4 near miss, 4 shuffle)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `calculateRating`, `getComboMultiplier`, `updateCombo`, `applyModifiers`, `getNearMiss`, `shuffleChoices`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 5: LivesSystem.ts

**Files:**
- Create: `game/systems/LivesSystem.ts`
- Create: `game/systems/__tests__/LivesSystem.test.ts`

- [ ] **Step 1: Write tests** (14 tests per spec section 5)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `loseLife`, `gainLife`, `isGameOver`, `handleGameOver`, `shouldLoseLife`, `shouldGainLife`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 6: TimerSystem.ts

**Files:**
- Create: `game/systems/TimerSystem.ts`
- Create: `game/systems/__tests__/TimerSystem.test.ts`

- [ ] **Step 1: Write tests** (12 tests per spec section 6)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — pure functions, no setInterval
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 7: LevelSystem.ts

**Files:**
- Create: `game/systems/LevelSystem.ts`
- Create: `game/systems/__tests__/LevelSystem.test.ts`

- [ ] **Step 1: Write tests** (13 tests per spec section 7)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `xpForLevel`, `calculateLevel`, `addXp`, `xpToNextLevel`, `getProgress`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 8: AchievementSystem.ts

**Files:**
- Create: `game/systems/AchievementSystem.ts`
- Create: `game/systems/__tests__/AchievementSystem.test.ts`

- [ ] **Step 1: Write tests** (15 tests — one per achievement + dedup + isUnlocked)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `checkAchievements`, `isUnlocked`, `getProgress`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 9: CoinSystem.ts

**Files:**
- Create: `game/systems/CoinSystem.ts`
- Create: `game/systems/__tests__/CoinSystem.test.ts`

- [ ] **Step 1: Write tests** (8 tests: add coins per source type, deduct for replay, insufficient coins, game over replay free)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `addCoins`, `spendCoin`, `canReplay`, `getCoinsForOutcome`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 10: ScenarioEngine.ts

**Files:**
- Create: `game/engine/ScenarioEngine.ts`
- Create: `game/engine/__tests__/ScenarioEngine.test.ts`

**Depends on:** Tasks 1-3 (types, EventBus, ConditionEvaluator)

- [ ] **Step 1: Write tests** (42 tests per spec: node resolution, effect application, auto-advance, choices, multiSelect, Day 1 full simulation, Day 5 grandmaster path)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `resolveNode`, `processNode`, `applyEffects`, `makeChoice`, `getAvailableChoices`, `initDaySession`
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 11: ScenarioValidator.ts

**Files:**
- Create: `game/engine/ScenarioValidator.ts`
- Create: `game/engine/__tests__/ScenarioValidator.test.ts`

- [ ] **Step 1: Write tests** (10 tests: valid scenario passes, dead-end fails, unreachable warns, infinite loop fails, missing root fails, S-rating check, flag check, full car-dealership = 0 errors)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — `validateScenario(scenario)` → `{ valid, errors[], warnings[] }`. Graph traversal (BFS from root), cycle detection, path enumeration for score analysis
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

## Scenario Data

### Task 12: Characters, Products, Achievements data

**Files:**
- Create: `game/data/characters/index.ts`
- Create: `game/data/products/index.ts`
- Create: `game/data/achievements/index.ts`

- [ ] **Step 1: Implement characters** — 9 characters with emotions and asset paths
- [ ] **Step 2: Implement products** — 5 Chevrolet models with specs
- [ ] **Step 3: Implement achievements** — 15 achievements with conditions and XP per spec section 9
- [ ] **Step 4: Commit**

---

### Task 13: Scenario Day 1

**Files:**
- Create: `game/data/scenarios/car-dealership/day1.ts`
- Create: `game/data/scenarios/car-dealership/__tests__/day1.test.ts`

- [ ] **Step 1: Convert car-dealership.md Day 1 nodes to TypeScript** (14 nodes)
- [ ] **Step 2: Write test — ScenarioValidator passes on day1**
- [ ] **Step 3: Run — pass**
- [ ] **Step 4: Commit**

### Task 14-17: Days 2-5 (same pattern as Task 13)
- Day 2: 14 nodes
- Day 3: 14 nodes
- Day 4: 12 nodes (with multiSelect on d4_preparation)
- Day 5: 19 nodes (grandmaster condition)

Each day: convert → validate → commit.

---

### Task 18: Scenario assembly + full validation

**Files:**
- Create: `game/data/scenarios/car-dealership/scenario.ts`
- Create: `game/data/scenarios/car-dealership/index.ts`
- Create: `game/data/scenarios/index.ts`
- Create: `game/data/scenarios/car-dealership/__tests__/fullScenario.test.ts`

- [ ] **Step 1: Assemble scenario** — import all days, create Scenario object
- [ ] **Step 2: Write test — full scenario passes ScenarioValidator with 0 errors, 0 warnings**
- [ ] **Step 3: Write test — all uz/ru texts non-empty**
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

## Stores

### Task 19: gameStore.ts (Zustand + Immer)

**Files:**
- Create: `game/store/gameStore.ts`
- Create: `game/store/__tests__/gameStore.test.ts`

- [ ] **Step 1: Write tests** (10 tests: startDay, advanceDialogue, selectChoice, selectMultiChoices, timerExpired, resetDay, state immutability)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — Zustand store with Immer middleware, uses ScenarioEngine internally
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

### Task 20: playerStore.ts (Zustand + localStorage)

**Files:**
- Create: `game/store/playerStore.ts`
- Create: `game/store/__tests__/playerStore.test.ts`

- [ ] **Step 1: Write tests** (10 tests: createPlayer, findByPhone, addXp, addAchievement, addCoins, spendCoin, addCompletedScenario, localStorage persistence, hydrate)
- [ ] **Step 2: Run — fail**
- [ ] **Step 3: Implement** — Zustand with persist middleware (localStorage)
- [ ] **Step 4: Run — pass**
- [ ] **Step 5: Commit**

---

## Integration Tests

### Task 21: Full playthrough tests — ALL ~20 paths

**Files:**
- Create: `game/__tests__/integration/fullPlaythrough.test.ts`
- Create: `game/__tests__/integration/allPaths.test.ts`

- [ ] **Step 1: Path 1 — Grandmaster** (optimal 5-day, all hidden endings, all achievements)
- [ ] **Step 2: Path 2 — Minimal** (all B choices, partial endings)
- [ ] **Step 3: Path 3 — Game Over** (3 fails → restart with 1 life)
- [ ] **Step 4: Path 4 — Comeback Kid** (fail → replay → A)
- [ ] **Step 5: All ~20 paths per day** — enumerate every combination of choices per day, run engine, verify: each path reaches an end node, score is in valid range, correct outcome assigned
- [ ] **Step 6: Cross-day flag propagation** — d1_success→d2 callback, d1+d2→d5 grandmaster, each hidden ending flag
- [ ] **Step 7: Edge cases** — timer expire on every timed choice, multiSelect all combinations in Day 4, combo build to x2.0 and reset
- [ ] **Step 8: Run all — pass**
- [ ] **Step 9: Commit**

---

## Final Verification

### Task 22: Coverage + build check

- [ ] **Step 1: Run full test suite**
```bash
npm test
```
Expected: 200+ tests, 100% pass

- [ ] **Step 2: Run coverage**
```bash
npm run test:coverage
```
Expected: 100% branches on game/engine/ and game/systems/

- [ ] **Step 3: TypeScript check**
```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 4: Build**
```bash
npx next build
```
Expected: success

- [ ] **Step 5: Final commit**
```bash
git commit -m "feat: Phase 2 complete — game engine with 200+ tests, 0 bugs"
```
