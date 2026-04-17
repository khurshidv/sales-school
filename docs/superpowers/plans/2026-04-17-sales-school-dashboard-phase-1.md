# Sales School Dashboard 2.0 — Phase 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the foundation for the new admin dashboard: extended tracking, DB migrations (ADD-only, prod-safe), new admin layout in Premium style, base UI primitives, and wiring into the existing game engine. No visible pages yet — those come in Phase 2+.

**Architecture:** Project uses Next.js 16 App Router with files at repo root (not `src/`). Game uses Zustand (`game/store/gameStore.ts`) + pure-TS engine (`game/engine/`). Existing analytics at `lib/game/analytics.ts` queues and batch-flushes to `game_events`. Admin is at `app/(admin)/admin/*` with layout at `app/(admin)/layout.tsx`. Spec: `/Users/xurshid/.claude/plans/structured-launching-gray.md`.

**Tech Stack:** TypeScript, Next.js 16.2, React 19, Tailwind 4, Zustand 5, Supabase (Postgres + Realtime), Vitest 4. Adding in Phase 1: `lucide-react` (icons), `date-fns` (dates). Chart libs deferred to Phase 2.

**Prod safety rule:** Migrations are ADD-only. No `DROP`, no `ALTER ... DROP COLUMN`, no `RENAME` on existing tables/columns. Game is live.

---

## File Structure

### New files
- `lib/game/eventTypes.ts` — central constants for all `event_type` strings
- `lib/game/hooks/useHeartbeat.ts` — 30s heartbeat + idle detection
- `lib/game/hooks/useChoiceTimer.ts` — thinking-time measurement
- `lib/game/__tests__/eventTypes.test.ts` — constants shape test
- `lib/game/hooks/__tests__/useHeartbeat.test.ts` — hook logic test
- `lib/game/hooks/__tests__/useChoiceTimer.test.ts` — hook logic test
- `supabase/migrations/006_game_events_indexes.sql` — perf indexes
- `supabase/migrations/007_offer_events.sql` — offer-page table
- `supabase/migrations/008_admin_aggregates.sql` — RPCs for new dashboard queries
- `components/admin/KpiCard.tsx` — premium KPI card
- `components/admin/TopBar.tsx` — period filter + export bar
- `components/admin/InsightCard.tsx` — auto-insight colored block
- `components/admin/PageHeader.tsx` — page title + subtitle
- `components/admin/Sidebar.new.tsx` — new sidebar (then swapped in)

### Modified files
- `package.json` — add `lucide-react`, `date-fns`
- `vitest.config.ts` — expand `include` glob to `lib/**/*.test.ts`
- `lib/game/analytics.ts` — add typed helpers for new event types (keep existing `trackEvent`)
- `game/store/gameStore.ts` — emit `node_entered`, `node_exited`, `back_navigation` events on transitions
- `components/game/ChoicePanel.tsx` — hook up `useChoiceTimer`, pass `thinking_time_ms` into `onSelect`
- `lib/game/hooks/useGameEngine.ts` — forward `thinking_time_ms` into `selectChoice()` call
- `components/admin/Sidebar.tsx` — replaced with new IA (11 items, 4 groups)
- `app/(admin)/layout.tsx` — new layout wrapper (keeps same shape, adds TopBar slot)
- `app/(admin)/admin.css` — Premium / Stripe-style theme
- `app/(admin)/admin/page.tsx` — redirect to `/admin/realtime` (new default)

### Why this decomposition
Event-type constants get their own file so both analytics helpers and SQL migrations quote the same source of truth. Hooks are split per-concern (`useHeartbeat` is session-level; `useChoiceTimer` is choice-level) so they can be tested and reused independently. Admin UI primitives are each a single file — Sidebar, TopBar, KpiCard, InsightCard, PageHeader — so later phases can compose them without touching foundations.

---

## Task 1: Install Phase 1 dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install lucide-react and date-fns**

Run:
```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npm install lucide-react@^0.462.0 date-fns@^3.6.0
```

Expected: success, both entries added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify build still passes**

Run:
```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react and date-fns for dashboard 2.0"
```

---

## Task 2: Expand Vitest config to cover `lib/` tests

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: Update vitest include glob**

Replace the current file contents with:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['game/**/*.test.ts', 'lib/**/*.test.ts'],
    environment: 'jsdom',
    coverage: {
      include: ['game/engine/**', 'game/systems/**', 'lib/game/**'],
      exclude: ['**/__tests__/**', '**/*.test.ts'],
      thresholds: { branches: 100, functions: 100, lines: 100 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

Note: `jsdom` is needed for hook tests. If `jsdom` is not installed, run:
```bash
npm install -D jsdom@^25
```

- [ ] **Step 2: Run existing tests to confirm no regression**

Run:
```bash
npm test
```

Expected: all existing tests (277 tests per memory) pass. Coverage thresholds still enforced on engine/systems.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "test: include lib/** in vitest, add jsdom env"
```

---

## Task 3: Define event type constants

**Files:**
- Create: `lib/game/eventTypes.ts`
- Create: `lib/game/__tests__/eventTypes.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/game/__tests__/eventTypes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { GameEventType, ALL_GAME_EVENT_TYPES } from '@/lib/game/eventTypes';

describe('GameEventType', () => {
  it('includes all legacy types', () => {
    expect(GameEventType.GAME_STARTED).toBe('game_started');
    expect(GameEventType.DAY_STARTED).toBe('day_started');
    expect(GameEventType.DAY_COMPLETED).toBe('day_completed');
    expect(GameEventType.DAY_FAILED).toBe('day_failed');
    expect(GameEventType.CHOICE_MADE).toBe('choice_made');
    expect(GameEventType.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
    expect(GameEventType.GAME_COMPLETED).toBe('game_completed');
    expect(GameEventType.DROPPED_OFF).toBe('dropped_off');
  });

  it('includes all Phase 1 new types', () => {
    expect(GameEventType.NODE_ENTERED).toBe('node_entered');
    expect(GameEventType.NODE_EXITED).toBe('node_exited');
    expect(GameEventType.BACK_NAVIGATION).toBe('back_navigation');
    expect(GameEventType.DIALOGUE_REREAD).toBe('dialogue_reread');
    expect(GameEventType.HEARTBEAT).toBe('heartbeat');
    expect(GameEventType.IDLE_DETECTED).toBe('idle_detected');
    expect(GameEventType.OFFER_VIEW).toBe('offer_view');
    expect(GameEventType.OFFER_CTA_CLICK).toBe('offer_cta_click');
    expect(GameEventType.OFFER_CONVERSION).toBe('offer_conversion');
  });

  it('ALL_GAME_EVENT_TYPES enumerates every value', () => {
    expect(ALL_GAME_EVENT_TYPES).toHaveLength(17);
    expect(new Set(ALL_GAME_EVENT_TYPES).size).toBe(17);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run lib/game/__tests__/eventTypes.test.ts
```

Expected: FAIL with "cannot find module '@/lib/game/eventTypes'".

- [ ] **Step 3: Create `lib/game/eventTypes.ts`**

```typescript
// Central source of truth for all game event_type strings.
// Mirrored in supabase/migrations/008_admin_aggregates.sql — keep in sync.
export const GameEventType = {
  // Legacy (already logged by current game)
  GAME_STARTED: 'game_started',
  DAY_STARTED: 'day_started',
  DAY_COMPLETED: 'day_completed',
  DAY_FAILED: 'day_failed',
  CHOICE_MADE: 'choice_made',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  GAME_COMPLETED: 'game_completed',
  DROPPED_OFF: 'dropped_off',

  // Phase 1 — dashboard 2.0
  NODE_ENTERED: 'node_entered',
  NODE_EXITED: 'node_exited',
  BACK_NAVIGATION: 'back_navigation',
  DIALOGUE_REREAD: 'dialogue_reread',
  HEARTBEAT: 'heartbeat',
  IDLE_DETECTED: 'idle_detected',
  OFFER_VIEW: 'offer_view',
  OFFER_CTA_CLICK: 'offer_cta_click',
  OFFER_CONVERSION: 'offer_conversion',
} as const;

export type GameEventTypeValue = typeof GameEventType[keyof typeof GameEventType];

export const ALL_GAME_EVENT_TYPES: GameEventTypeValue[] = Object.values(GameEventType);
```

- [ ] **Step 4: Run test — expect PASS**

Run:
```bash
npx vitest run lib/game/__tests__/eventTypes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/game/eventTypes.ts lib/game/__tests__/eventTypes.test.ts
git commit -m "feat(analytics): add GameEventType constants for dashboard 2.0"
```

---

## Task 4: Extend analytics.ts with typed helpers

**Files:**
- Modify: `lib/game/analytics.ts`
- Create: `lib/game/__tests__/analytics.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/game/__tests__/analytics.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { trackNodeEntered, trackNodeExited, trackBackNavigation, trackHeartbeat, trackDialogueReread, flushAnalyticsForTest } from '@/lib/game/analytics';

describe('analytics helpers', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  it('trackNodeEntered queues a node_entered event with node_id', async () => {
    trackNodeEntered('p1', 'car-dealership', 'day1', 'greeting_node');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const batch = mockInsert.mock.calls[0][0];
    expect(batch[0]).toMatchObject({
      player_id: 'p1',
      event_type: 'node_entered',
      scenario_id: 'car-dealership',
      day_id: 'day1',
      event_data: { node_id: 'greeting_node' },
    });
  });

  it('trackNodeExited includes time_spent_ms', async () => {
    trackNodeExited('p1', 'car-dealership', 'day1', 'greeting_node', 4200);
    flushAnalyticsForTest();
    await Promise.resolve();
    const batch = mockInsert.mock.calls[0][0];
    expect(batch[0].event_data).toEqual({ node_id: 'greeting_node', time_spent_ms: 4200 });
  });

  it('trackBackNavigation includes from/to node ids', async () => {
    trackBackNavigation('p1', 'car-dealership', 'day1', 'node_c', 'node_b');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'back_navigation',
      event_data: { from_node_id: 'node_c', to_node_id: 'node_b' },
    });
  });

  it('trackHeartbeat records session_id and node_id', async () => {
    trackHeartbeat('p1', 'car-dealership', 'day1', 'sess_1', 'node_x');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'heartbeat',
      event_data: { session_id: 'sess_1', node_id: 'node_x' },
    });
  });

  it('trackDialogueReread logs reread count', async () => {
    trackDialogueReread('p1', 'car-dealership', 'day1', 'dialogue_5', 2);
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'dialogue_reread',
      event_data: { node_id: 'dialogue_5', reread_count: 2 },
    });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run:
```bash
npx vitest run lib/game/__tests__/analytics.test.ts
```

Expected: FAIL — exports not found.

- [ ] **Step 3: Extend `lib/game/analytics.ts`**

Append to the END of the existing `lib/game/analytics.ts`:

```typescript
import { GameEventType } from './eventTypes';

// -----------------------------------------------------------------------------
// Typed helpers — dashboard 2.0
// Each helper wraps trackEvent() with a fixed event_type and shaped event_data.
// Keeps call sites clean and prevents typos in event_type strings.
// -----------------------------------------------------------------------------

export function trackNodeEntered(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
): void {
  trackEvent(playerId, GameEventType.NODE_ENTERED, { node_id: nodeId }, scenarioId, dayId);
}

export function trackNodeExited(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  timeSpentMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.NODE_EXITED,
    { node_id: nodeId, time_spent_ms: timeSpentMs },
    scenarioId,
    dayId,
  );
}

export function trackBackNavigation(
  playerId: string,
  scenarioId: string,
  dayId: string,
  fromNodeId: string,
  toNodeId: string,
): void {
  trackEvent(
    playerId,
    GameEventType.BACK_NAVIGATION,
    { from_node_id: fromNodeId, to_node_id: toNodeId },
    scenarioId,
    dayId,
  );
}

export function trackDialogueReread(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  rereadCount: number,
): void {
  trackEvent(
    playerId,
    GameEventType.DIALOGUE_REREAD,
    { node_id: nodeId, reread_count: rereadCount },
    scenarioId,
    dayId,
  );
}

export function trackHeartbeat(
  playerId: string,
  scenarioId: string,
  dayId: string,
  sessionId: string,
  nodeId: string | null,
): void {
  trackEvent(
    playerId,
    GameEventType.HEARTBEAT,
    { session_id: sessionId, node_id: nodeId },
    scenarioId,
    dayId,
  );
}

export function trackIdleDetected(
  playerId: string,
  scenarioId: string,
  dayId: string,
  sessionId: string,
  idleMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.IDLE_DETECTED,
    { session_id: sessionId, idle_ms: idleMs },
    scenarioId,
    dayId,
  );
}

export function trackChoiceMadeWithTiming(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  choiceIndex: number,
  choiceId: string,
  thinkingTimeMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.CHOICE_MADE,
    {
      node_id: nodeId,
      choice_index: choiceIndex,
      choice_id: choiceId,
      thinking_time_ms: thinkingTimeMs,
    },
    scenarioId,
    dayId,
  );
}

// Test-only: flush queue synchronously. Not called in production paths.
export function flushAnalyticsForTest(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__flushAnalyticsQueue?.();
}
```

Also, at the top of the existing file (near `let queue: QueuedEvent[] = [];`), expose the flush for tests. Modify the existing `flush` function declaration to also set a global handle — add this line immediately after `let listenersAttached = false;`:

```typescript
// Expose synchronous flush for tests (noop in production; ref-equals flush).
if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__flushAnalyticsQueue = () => flush();
}
```

- [ ] **Step 4: Run test — expect PASS**

Run:
```bash
npx vitest run lib/game/__tests__/analytics.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/game/analytics.ts lib/game/__tests__/analytics.test.ts
git commit -m "feat(analytics): add typed helpers for node/back/heartbeat/reread events"
```

---

## Task 5: `useHeartbeat` hook

**Files:**
- Create: `lib/game/hooks/useHeartbeat.ts`
- Create: `lib/game/hooks/__tests__/useHeartbeat.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/game/hooks/__tests__/useHeartbeat.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHeartbeat } from '@/lib/game/hooks/useHeartbeat';

vi.mock('@/lib/game/analytics', () => ({
  trackHeartbeat: vi.fn(),
  trackIdleDetected: vi.fn(),
}));

import { trackHeartbeat, trackIdleDetected } from '@/lib/game/analytics';

describe('useHeartbeat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a heartbeat every 30 seconds while mounted', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 'car-dealership',
        dayId: 'day1',
        sessionId: 'sess_1',
        currentNodeId: 'node_a',
      }),
    );

    expect(trackHeartbeat).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(30_000);
    expect(trackHeartbeat).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(trackHeartbeat).toHaveBeenCalledTimes(3);
  });

  it('does nothing when enabled=false', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: false,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(120_000);
    expect(trackHeartbeat).not.toHaveBeenCalled();
  });

  it('fires idle_detected after 60s of no activity', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(60_000);
    expect(trackIdleDetected).toHaveBeenCalledTimes(1);
  });

  it('resets idle on user activity', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(40_000);
    document.dispatchEvent(new Event('mousemove'));
    vi.advanceTimersByTime(40_000);
    // 40 + 40 = 80 total, but reset at 40 → only 40s of idle → no idle event
    expect(trackIdleDetected).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(trackIdleDetected).toHaveBeenCalledTimes(1);
  });
});
```

Install `@testing-library/react` if not yet installed:

```bash
npm install -D @testing-library/react@^16
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/game/hooks/__tests__/useHeartbeat.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/game/hooks/useHeartbeat.ts`**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { trackHeartbeat, trackIdleDetected } from '@/lib/game/analytics';

const HEARTBEAT_MS = 30_000;
const IDLE_THRESHOLD_MS = 60_000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export interface UseHeartbeatArgs {
  enabled: boolean;
  playerId: string;
  scenarioId: string;
  dayId: string;
  sessionId: string;
  currentNodeId: string | null;
}

/**
 * Periodically emits heartbeat events so the dashboard can show live players
 * and compute accurate session durations (tab-hidden + bfcache safe).
 * Also fires idle_detected once per idle window when the user doesn't
 * interact for IDLE_THRESHOLD_MS.
 */
export function useHeartbeat({
  enabled,
  playerId,
  scenarioId,
  dayId,
  sessionId,
  currentNodeId,
}: UseHeartbeatArgs): void {
  // Stash latest node id so setInterval closure always reads fresh value
  // without re-creating the timer on every node change.
  const nodeRef = useRef(currentNodeId);
  nodeRef.current = currentNodeId;
  const lastActivityRef = useRef(Date.now());
  const idleFiredRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      idleFiredRef.current = false;
    };
    for (const evt of ACTIVITY_EVENTS) {
      document.addEventListener(evt, onActivity, { passive: true });
    }

    const heartbeatTimer = setInterval(() => {
      trackHeartbeat(playerId, scenarioId, dayId, sessionId, nodeRef.current);
    }, HEARTBEAT_MS);

    const idleTimer = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_THRESHOLD_MS && !idleFiredRef.current) {
        trackIdleDetected(playerId, scenarioId, dayId, sessionId, idleMs);
        idleFiredRef.current = true;
      }
    }, 5_000);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        document.removeEventListener(evt, onActivity);
      }
      clearInterval(heartbeatTimer);
      clearInterval(idleTimer);
    };
  }, [enabled, playerId, scenarioId, dayId, sessionId]);
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run lib/game/hooks/__tests__/useHeartbeat.test.ts
```

Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/game/hooks/useHeartbeat.ts lib/game/hooks/__tests__/useHeartbeat.test.ts package.json package-lock.json
git commit -m "feat(game): useHeartbeat — 30s heartbeat + 60s idle detection"
```

---

## Task 6: `useChoiceTimer` hook

**Files:**
- Create: `lib/game/hooks/useChoiceTimer.ts`
- Create: `lib/game/hooks/__tests__/useChoiceTimer.test.ts`

- [ ] **Step 1: Write failing test**

Create `lib/game/hooks/__tests__/useChoiceTimer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChoiceTimer } from '@/lib/game/hooks/useChoiceTimer';

describe('useChoiceTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns 0ms when read immediately', () => {
    const { result } = renderHook(() => useChoiceTimer('node_a'));
    expect(result.current.elapsedMs()).toBe(0);
  });

  it('returns elapsed ms since mount', () => {
    const { result } = renderHook(() => useChoiceTimer('node_a'));
    act(() => { vi.advanceTimersByTime(4200); });
    expect(result.current.elapsedMs()).toBe(4200);
  });

  it('resets when nodeId changes', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useChoiceTimer(id),
      { initialProps: { id: 'node_a' } },
    );
    act(() => { vi.advanceTimersByTime(3000); });
    rerender({ id: 'node_b' });
    expect(result.current.elapsedMs()).toBe(0);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(result.current.elapsedMs()).toBe(1500);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/game/hooks/__tests__/useChoiceTimer.test.ts
```

- [ ] **Step 3: Implement `lib/game/hooks/useChoiceTimer.ts`**

```typescript
'use client';

import { useEffect, useRef } from 'react';

export interface ChoiceTimerHandle {
  /** Milliseconds since the current choice node was mounted / changed. */
  elapsedMs: () => number;
}

/**
 * Tracks how long a player has been staring at a choice node before
 * committing. Resets whenever the `nodeId` changes. Read `elapsedMs()`
 * inside the onSelect handler to get the thinking time.
 */
export function useChoiceTimer(nodeId: string | null): ChoiceTimerHandle {
  const startRef = useRef<number>(Date.now());
  const nodeRef = useRef<string | null>(nodeId);

  useEffect(() => {
    if (nodeRef.current !== nodeId) {
      nodeRef.current = nodeId;
      startRef.current = Date.now();
    }
  }, [nodeId]);

  // Ensure first mount sets start time (useRef initializer runs on every render
  // guard — acceptable for cheap Date.now()).
  return {
    elapsedMs: () => Date.now() - startRef.current,
  };
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/game/hooks/__tests__/useChoiceTimer.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/game/hooks/useChoiceTimer.ts lib/game/hooks/__tests__/useChoiceTimer.test.ts
git commit -m "feat(game): useChoiceTimer — measure thinking time per choice node"
```

---

## Task 7: Wire choice timer into ChoicePanel

**Files:**
- Modify: `components/game/ChoicePanel.tsx`

- [ ] **Step 1: Read current file**

The `onSelect` signature today is `onSelect: (index: number) => void`. We need to pass thinking time through. Change it to `onSelect: (index: number, thinkingTimeMs: number) => void`.

- [ ] **Step 2: Add choice timer + update handlers**

Modify `components/game/ChoicePanel.tsx`:

1. Add import near the other imports:
   ```typescript
   import { useChoiceTimer } from '@/lib/game/hooks/useChoiceTimer';
   ```

2. Update the props interface:
   ```typescript
   interface ChoicePanelProps {
     choices: Choice[];
     nodeId: string;
     onSelect: (index: number, thinkingTimeMs: number) => void;
     multiSelect?: { count: number };
     onMultiSelect?: (indices: number[], thinkingTimeMs: number) => void;
     timerRemaining: number | null;
     timeLimit: number | undefined;
     timerBarRef?: RefObject<HTMLDivElement | null>;
     lang?: 'uz' | 'ru';
   }
   ```

3. Inside the component body, right after `const [selectedIndices, setSelectedIndices] = useState<number[]>([]);`, add:
   ```typescript
   const timer = useChoiceTimer(nodeId);
   ```

4. Replace the button's `onClick`:
   ```typescript
   onClick={() =>
     multiSelect ? handleToggle(index) : onSelect(index, timer.elapsedMs())
   }
   ```

5. Replace `handleConfirm`:
   ```typescript
   const handleConfirm = () => {
     if (multiSelect && onMultiSelect && selectedIndices.length === multiSelect.count) {
       onMultiSelect(selectedIndices, timer.elapsedMs());
     }
   };
   ```

- [ ] **Step 3: Update call site in `useGameEngine.ts`**

Find the place that passes `onSelect` → `selectChoice`. In `lib/game/hooks/useGameEngine.ts` update the `selectChoice` action wrapper to accept and forward `thinkingTimeMs`:

```typescript
const selectChoice = useCallback(
  (choiceIndex: number, thinkingTimeMs: number) => {
    // ... existing logic ...
    gsSelectChoice(choiceIndex, thinkingTimeMs, player ?? undefined);
  },
  [gsSelectChoice, player /* etc */],
);

const selectMultiChoices = useCallback(
  (indices: number[], thinkingTimeMs: number) => {
    gsSelectMultiChoices(indices, thinkingTimeMs, player ?? undefined);
  },
  [gsSelectMultiChoices, player],
);
```

(Exact wrapper shape depends on existing code — keep existing guards, only thread the new param.)

- [ ] **Step 4: Also pass `nodeId` prop where `ChoicePanel` is rendered**

Find the usage of `<ChoicePanel` in the game UI (likely `components/game/GameScreen.tsx` or similar — grep for `<ChoicePanel`). Add `nodeId={currentNode.id}` to the JSX.

- [ ] **Step 5: Run type check**

```bash
npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 6: Run existing game tests**

```bash
npm test
```

Expected: all engine/systems/integration tests still pass — we haven't changed engine logic.

- [ ] **Step 7: Commit**

```bash
git add components/game/ChoicePanel.tsx lib/game/hooks/useGameEngine.ts
# plus whatever file renders <ChoicePanel>
git commit -m "feat(game): thread thinking_time_ms from ChoicePanel to selectChoice"
```

---

## Task 8: Emit node_entered / node_exited from gameStore

**Files:**
- Modify: `game/store/gameStore.ts`

- [ ] **Step 1: Add analytics import at top**

```typescript
import {
  trackNodeEntered,
  trackNodeExited,
  trackBackNavigation,
  trackChoiceMadeWithTiming,
} from '@/lib/game/analytics';
```

- [ ] **Step 2: Add a wrapper that fires analytics around `enterNode`**

`enterNode` is called from `startDay`, `restoreSession`, `advanceDialogue`, `selectChoice`, `selectMultiChoices`, `timerExpired`, `resetDay`. We want:
- On transition out of current node → `node_exited` with time spent
- On transition into next node → `node_entered`

Add after the existing `enterNode` definition (top of file, outside the store):

```typescript
/**
 * Fires node_exited for the node we're leaving (if we have timing), then
 * node_entered for the node we landed on. Called after every store-level
 * transition — keeps analytics out of the pure engine code.
 *
 * Requires playerId + scenarioId on the session; if either is missing we
 * silently skip (e.g. during SSR or before player is hydrated).
 */
function emitNodeTransitionAnalytics(args: {
  playerId: string | null;
  scenarioId: string;
  dayId: string;
  previousNodeId: string | null;
  previousNodeEnteredAt: number | null;
  newNodeId: string;
}): void {
  const { playerId, scenarioId, dayId, previousNodeId, previousNodeEnteredAt, newNodeId } = args;
  if (!playerId) return;
  if (previousNodeId && previousNodeEnteredAt != null) {
    trackNodeExited(playerId, scenarioId, dayId, previousNodeId, Date.now() - previousNodeEnteredAt);
  }
  trackNodeEntered(playerId, scenarioId, dayId, newNodeId);
}
```

- [ ] **Step 3: Track current node's enter timestamp on the session**

Add a field `currentNodeEnteredAt: number | null` to `GameSessionState` in `game/engine/types.ts`:

```typescript
// In GameSessionState interface, next to currentNodeId:
currentNodeEnteredAt: number | null;
```

Also update `createInitialGameSession` in the same file to set `currentNodeEnteredAt: null`.

Update `enterNode` in `gameStore.ts` to set `currentNodeEnteredAt = now` on the returned session:

```typescript
// At the end of enterNode, before return:
currentSession = { ...currentSession, currentNodeEnteredAt: now };
```

- [ ] **Step 4: Fire analytics in `startDay`**

At the end of `startDay` action (after `set(...)`), add — but only if we have a `playerId`. `gameStore` doesn't know the player directly, so pass `playerId` through. Extend the action signature:

```typescript
startDay: (
  scenarioId: string,
  day: Day,
  previousState?: { lives: number; flags: Record<string, boolean> },
  analyticsCtx?: { playerId: string | null },
) => void;
```

Inside the action:
```typescript
if (analyticsCtx?.playerId) {
  emitNodeTransitionAnalytics({
    playerId: analyticsCtx.playerId,
    scenarioId,
    dayId: day.id,
    previousNodeId: null,
    previousNodeEnteredAt: null,
    newNodeId: entered.node.id,
  });
}
```

- [ ] **Step 5: Fire analytics in `advanceDialogue`**

Similarly extend signature to accept `analyticsCtx`:
```typescript
advanceDialogue: (analyticsCtx?: { playerId: string | null; scenarioId: string; dayId: string }) => void;
```

At the end (before `set`), compute the exit using the session's `currentNodeEnteredAt`:
```typescript
if (analyticsCtx?.playerId) {
  emitNodeTransitionAnalytics({
    playerId: analyticsCtx.playerId,
    scenarioId: analyticsCtx.scenarioId,
    dayId: analyticsCtx.dayId,
    previousNodeId: currentNode.id,
    previousNodeEnteredAt: session.currentNodeEnteredAt,
    newNodeId: entered.node.id,
  });
}
```

- [ ] **Step 6: Fire analytics in `selectChoice`**

Extend signature:
```typescript
selectChoice: (
  choiceIndex: number,
  thinkingTimeMs: number,
  playerState?: PlayerState,
  analyticsCtx?: { playerId: string | null; scenarioId: string; dayId: string },
) => void;
```

Before `set` at end:
```typescript
if (analyticsCtx?.playerId) {
  const choiceNode = currentNode as ChoiceNode;
  const choice = choiceNode.choices[choiceIndex];
  trackChoiceMadeWithTiming(
    analyticsCtx.playerId,
    analyticsCtx.scenarioId,
    analyticsCtx.dayId,
    currentNode.id,
    choiceIndex,
    choice.id,
    thinkingTimeMs,
  );
  emitNodeTransitionAnalytics({
    playerId: analyticsCtx.playerId,
    scenarioId: analyticsCtx.scenarioId,
    dayId: analyticsCtx.dayId,
    previousNodeId: currentNode.id,
    previousNodeEnteredAt: session.currentNodeEnteredAt,
    newNodeId: entered.node.id,
  });
}
```

- [ ] **Step 6b: Fire analytics in `selectMultiChoices`**

Mirror the change to `selectMultiChoices` — extend its signature with the same `thinkingTimeMs` and `analyticsCtx` params, and emit one `choice_made` event per selected index plus a single `node_exited`/`node_entered` pair around the transition:

```typescript
selectMultiChoices: (
  indices: number[],
  thinkingTimeMs: number,
  playerState?: PlayerState,
  analyticsCtx?: { playerId: string | null; scenarioId: string; dayId: string },
) => void;
```

Inside the action body, after computing `entered`:
```typescript
if (analyticsCtx?.playerId) {
  const choiceNode = currentNode as ChoiceNode;
  for (const idx of indices) {
    const choice = choiceNode.choices[idx];
    trackChoiceMadeWithTiming(
      analyticsCtx.playerId,
      analyticsCtx.scenarioId,
      analyticsCtx.dayId,
      currentNode.id,
      idx,
      choice.id,
      thinkingTimeMs,
    );
  }
  emitNodeTransitionAnalytics({
    playerId: analyticsCtx.playerId,
    scenarioId: analyticsCtx.scenarioId,
    dayId: analyticsCtx.dayId,
    previousNodeId: currentNode.id,
    previousNodeEnteredAt: session.currentNodeEnteredAt,
    newNodeId: entered.node.id,
  });
}
```

- [ ] **Step 7: Fire analytics in `goBack`**

Extend signature:
```typescript
goBack: (analyticsCtx?: { playerId: string | null; scenarioId: string; dayId: string }) => void;
```

Before `set`:
```typescript
if (analyticsCtx?.playerId && currentNode) {
  trackBackNavigation(
    analyticsCtx.playerId,
    analyticsCtx.scenarioId,
    analyticsCtx.dayId,
    currentNode.id,
    previous.nodeId,
  );
}
```

- [ ] **Step 8: Thread analyticsCtx from `useGameEngine.ts`**

In `lib/game/hooks/useGameEngine.ts`, build an `analyticsCtx` memo and pass it to every store action wrapper:

```typescript
const analyticsCtx = useMemo(
  () => ({ playerId: player?.id ?? null, scenarioId, dayId: currentDay?.id ?? '' }),
  [player?.id, scenarioId, currentDay?.id],
);
```

Update the `startDay`, `advanceDialogue`, `selectChoice`, `selectMultiChoices`, `goBack` wrappers to pass `analyticsCtx` to the store actions.

- [ ] **Step 9: Run type check + tests**

```bash
npx tsc --noEmit && npm test
```

Expected: all engine tests still pass (we only added optional params).

- [ ] **Step 10: Commit**

```bash
git add game/store/gameStore.ts game/engine/types.ts lib/game/hooks/useGameEngine.ts
git commit -m "feat(game): emit node_entered/exited + choice timing analytics from gameStore"
```

---

## Task 9: Heartbeat integration at game play page

**Files:**
- Modify: `app/(game)/game/play/page.tsx` (or wherever the main play screen lives)
- Create: `lib/game/sessionId.ts`

- [ ] **Step 1: Create session id util**

Create `lib/game/sessionId.ts`:

```typescript
const KEY = 'ss_game_sid';

export function getOrCreateGameSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
```

- [ ] **Step 2: Use `useHeartbeat` in the play page**

In the top-level client component for `/game/play` (find it — likely `app/(game)/game/play/GamePlayClient.tsx` or `page.tsx` with `'use client'`):

```typescript
import { useHeartbeat } from '@/lib/game/hooks/useHeartbeat';
import { getOrCreateGameSessionId } from '@/lib/game/sessionId';

// inside component:
const sessionId = useMemo(() => getOrCreateGameSessionId(), []);

useHeartbeat({
  enabled: Boolean(player?.id && scenarioId && currentDay?.id),
  playerId: player?.id ?? '',
  scenarioId,
  dayId: currentDay?.id ?? '',
  sessionId,
  currentNodeId: currentNode?.id ?? null,
});
```

- [ ] **Step 3: Verify no regressions**

```bash
npx tsc --noEmit && npm run build
```

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add lib/game/sessionId.ts app/(game)/game/play/*.tsx
git commit -m "feat(game): enable useHeartbeat on play page"
```

---

## Task 10: Migration 006 — game_events indexes

**Files:**
- Create: `supabase/migrations/006_game_events_indexes.sql`

- [ ] **Step 1: Write migration**

```sql
-- Phase 1 of dashboard 2.0: perf indexes for new analytical queries.
-- ADD-only. Every index uses IF NOT EXISTS so replays are safe.
-- No table/column is altered; game is in production.

create index if not exists idx_game_events_player_created
  on public.game_events(player_id, created_at desc);

create index if not exists idx_game_events_scenario_day_type
  on public.game_events(scenario_id, day_id, event_type);

-- Expression index for common filter by node_id inside event_data
create index if not exists idx_game_events_data_node
  on public.game_events((event_data->>'node_id'))
  where event_data ? 'node_id';

-- Expression index for choice_made events filtering by choice_id
create index if not exists idx_game_events_data_choice
  on public.game_events((event_data->>'choice_id'))
  where event_type = 'choice_made';

-- GIN index for flexible JSONB filters (dashboards slice event_data ad-hoc)
create index if not exists idx_game_events_data_gin
  on public.game_events using gin (event_data jsonb_path_ops);
```

- [ ] **Step 2: Apply against a local Supabase branch or staging**

Coordinate with the user before applying to production. For local dev:

```bash
# If supabase CLI is set up:
supabase db push --include-all
# OR apply via dashboard: copy-paste the SQL.
```

Expected: indexes are created, no errors.

- [ ] **Step 3: Sanity-check index creation**

Connect to Supabase SQL editor and run:
```sql
select indexname from pg_indexes where tablename = 'game_events';
```

Expected: all 5 new indexes present alongside existing ones.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_game_events_indexes.sql
git commit -m "feat(db): add game_events analytical indexes (migration 006)"
```

---

## Task 11: Migration 007 — offer_events table

**Files:**
- Create: `supabase/migrations/007_offer_events.sql`

- [ ] **Step 1: Write migration**

```sql
-- Phase 1: dedicated event store for the post-game offer landing page.
-- Keeps offer analytics separate from game_events (different retention,
-- different access patterns — offer events are conversion-critical).
-- ADD-only.

create table if not exists public.offer_events (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete set null,
  visitor_id text,               -- for pre-registration visits
  session_id text not null,
  event_type text not null,      -- offer_view | offer_cta_click | offer_conversion
  variant_id text,               -- A/B variant (nullable; 'default' if not testing)
  time_on_page_ms integer,
  scroll_depth integer,          -- 0-100
  cta_id text,                   -- which CTA was clicked
  event_data jsonb not null default '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  created_at timestamptz not null default now()
);

create index if not exists idx_offer_events_player on public.offer_events(player_id);
create index if not exists idx_offer_events_type_created on public.offer_events(event_type, created_at desc);
create index if not exists idx_offer_events_variant on public.offer_events(variant_id) where variant_id is not null;
create index if not exists idx_offer_events_session on public.offer_events(session_id);

-- RLS — anonymous writes (same pattern as page_events / game_events from
-- earlier migrations). Reads are admin-only via service role.
alter table public.offer_events enable row level security;

create policy "anon can insert offer_events"
  on public.offer_events for insert to anon
  with check (true);

create policy "authenticated can read offer_events"
  on public.offer_events for select to authenticated
  using (true);
```

- [ ] **Step 2: Apply + verify**

Same as Task 10: apply migration, verify via `select * from offer_events limit 0;`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_offer_events.sql
git commit -m "feat(db): offer_events table + RLS (migration 007)"
```

---

## Task 12: Migration 008 — admin aggregates (RPCs)

**Files:**
- Create: `supabase/migrations/008_admin_aggregates.sql`

- [ ] **Step 1: Write migration**

Creates the RPC functions that Phase 2 pages will call. All are `STABLE` + `SECURITY DEFINER` so the admin (service role) can execute them via Supabase client.

```sql
-- Phase 1: RPC functions for dashboard 2.0 aggregates.
-- These are created now (Phase 1) so Phase 2 UI tasks don't block on DB work.
-- All functions are STABLE (no writes) and SECURITY DEFINER (run as owner).

-- -----------------------------------------------------------------------------
-- get_branch_flow: Sankey-shaped data for a (scenario, day, date range).
-- Returns rows of (from_node, to_node, count) computed from consecutive
-- node_entered events within each player's session.
-- -----------------------------------------------------------------------------
create or replace function public.get_branch_flow(
  p_scenario_id text,
  p_day_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (from_node text, to_node text, flow_count bigint)
language sql
stable
security definer
as $$
  with entries as (
    select
      player_id,
      (event_data->>'node_id') as node_id,
      created_at,
      lead(event_data->>'node_id') over (partition by player_id order by created_at) as next_node
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  )
  select node_id as from_node, next_node as to_node, count(*)::bigint as flow_count
  from entries
  where next_node is not null
  group by node_id, next_node
  order by flow_count desc;
$$;

-- -----------------------------------------------------------------------------
-- get_node_stats: per-node stats — visits, avg thinking time, exits.
-- -----------------------------------------------------------------------------
create or replace function public.get_node_stats(
  p_scenario_id text,
  p_day_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  node_id text,
  entered_count bigint,
  avg_thinking_time_ms numeric,
  exit_count bigint
)
language sql
stable
security definer
as $$
  with entered as (
    select (event_data->>'node_id') as node_id, count(*)::bigint as c
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  thinking as (
    select
      (event_data->>'node_id') as node_id,
      avg((event_data->>'thinking_time_ms')::numeric) as avg_t
    from public.game_events
    where event_type = 'choice_made'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  exited as (
    select (event_data->>'node_id') as node_id, count(*)::bigint as c
    from public.game_events
    where event_type = 'node_exited'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select
    coalesce(e.node_id, t.node_id, x.node_id) as node_id,
    coalesce(e.c, 0) as entered_count,
    coalesce(t.avg_t, 0) as avg_thinking_time_ms,
    coalesce(x.c, 0) as exit_count
  from entered e
  full outer join thinking t on t.node_id = e.node_id
  full outer join exited x on x.node_id = coalesce(e.node_id, t.node_id)
  order by entered_count desc;
$$;

-- -----------------------------------------------------------------------------
-- get_dropoff_zones: nodes where players close the tab most often.
-- Drop-off = player's LAST node_entered in the session with no subsequent
-- node_exited or day_completed within the session.
-- -----------------------------------------------------------------------------
create or replace function public.get_dropoff_zones(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (node_id text, day_id text, dropoff_count bigint)
language sql
stable
security definer
as $$
  with last_node as (
    select distinct on (player_id, day_id)
      player_id,
      day_id,
      (event_data->>'node_id') as node_id,
      created_at
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    order by player_id, day_id, created_at desc
  ),
  completed as (
    select distinct player_id, day_id
    from public.game_events
    where event_type in ('day_completed', 'day_failed')
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  )
  select l.node_id, l.day_id, count(*)::bigint as dropoff_count
  from last_node l
  left join completed c on c.player_id = l.player_id and c.day_id = l.day_id
  where c.player_id is null
  group by l.node_id, l.day_id
  order by dropoff_count desc
  limit 50;
$$;

-- -----------------------------------------------------------------------------
-- get_engagement_index: composite interest score for a scenario.
-- Returns a json blob with sub-metrics; Phase 2 UI computes the 0-10 index.
-- -----------------------------------------------------------------------------
create or replace function public.get_engagement_index(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'completion_rate', (
      select
        case when count(distinct case when event_type = 'day_started' then player_id end) = 0 then 0
        else count(distinct case when event_type = 'day_completed' then player_id end)::numeric
             / count(distinct case when event_type = 'day_started' then player_id end)::numeric
        end
      from public.game_events
      where scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'avg_thinking_time_ms', (
      select avg((event_data->>'thinking_time_ms')::numeric)
      from public.game_events
      where event_type = 'choice_made'
        and scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'replay_rate', (
      select
        case when count(distinct player_id) = 0 then 0
        else (count(*)::numeric - count(distinct (player_id, day_id))::numeric)
             / count(distinct player_id)::numeric
        end
      from public.completed_scenarios
      where scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- get_player_journey: full timeline for a single player.
-- -----------------------------------------------------------------------------
create or replace function public.get_player_journey(p_player_id uuid)
returns table (
  event_type text,
  event_data jsonb,
  scenario_id text,
  day_id text,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  select event_type, event_data, scenario_id, day_id, created_at
  from public.game_events
  where player_id = p_player_id
  order by created_at asc
  limit 5000;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_funnel: conversion funnel for the post-game offer page.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_funnel(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'game_completed', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_completed'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_view', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_view'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_cta_click', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_cta_click'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_conversion', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_conversion'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    )
  );
$$;
```

- [ ] **Step 2: Apply + sanity-check**

Apply to staging first:
```bash
supabase db push --include-all
```

Then quick smoke test via SQL editor:
```sql
select public.get_engagement_index('car-dealership'::text);
select * from public.get_branch_flow('car-dealership', 'day1') limit 5;
select public.get_offer_funnel();
```

Each should return JSON/rows without error (empty until events accumulate).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/008_admin_aggregates.sql
git commit -m "feat(db): admin dashboard RPC aggregates (migration 008)"
```

---

## Task 13: Premium-style admin theme CSS

**Files:**
- Modify: `app/(admin)/admin.css`

- [ ] **Step 1: Rewrite theme**

Replace contents of `app/(admin)/admin.css` with:

```css
/* Sales School Admin — Dashboard 2.0 (Premium / Stripe-style) */

:root {
  --admin-bg: linear-gradient(135deg, #fafaff 0%, #eef2ff 100%);
  --admin-card: #ffffff;
  --admin-card-shadow: 0 4px 12px rgba(99, 102, 241, 0.06);
  --admin-card-shadow-hover: 0 8px 20px rgba(99, 102, 241, 0.10);
  --admin-border: rgba(229, 231, 235, 0.6);
  --admin-text: #1e1b4b;
  --admin-text-muted: #64748b;
  --admin-text-dim: #94a3b8;
  --admin-accent: #8b5cf6;
  --admin-accent-2: #ec4899;
  --admin-accent-success: #10b981;
  --admin-accent-warn: #f59e0b;
  --admin-accent-danger: #ef4444;
  --admin-sidebar-bg: rgba(255, 255, 255, 0.92);
  --admin-sidebar-active: linear-gradient(90deg, #ede9fe, #fce7f3);
  --admin-sidebar-active-text: #6d28d9;
  --admin-topbar-bg: rgba(255, 255, 255, 0.75);
  --admin-radius-lg: 12px;
  --admin-radius-md: 10px;
  --admin-radius-sm: 8px;
}

.admin-root {
  display: flex;
  min-height: 100vh;
  font-family: system-ui, -apple-system, 'SF Pro Text', sans-serif;
  background: var(--admin-bg);
  color: var(--admin-text);
}

.admin-sidebar {
  width: 240px;
  background: var(--admin-sidebar-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-right: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 20px 10px;
}

.admin-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 20px;
}

.admin-sidebar-brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent-2));
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.admin-sidebar-brand-text {
  font-weight: 700;
  color: var(--admin-text);
  font-size: 15px;
}

.admin-sidebar-group-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: var(--admin-text-dim);
  text-transform: uppercase;
  padding: 12px 10px 6px;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  font-size: 13px;
  color: var(--admin-text-muted);
  text-decoration: none;
  border-radius: var(--admin-radius-sm);
  transition: background 0.15s, color 0.15s;
}

.admin-nav-link:hover {
  background: #f1f5f9;
  color: var(--admin-text);
}

.admin-nav-link--active {
  background: var(--admin-sidebar-active);
  color: var(--admin-sidebar-active-text);
  font-weight: 600;
}

.admin-nav-link .admin-nav-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  margin-left: auto;
}

.admin-sidebar-footer {
  padding: 16px 12px;
  margin-top: auto;
  font-size: 11px;
  color: var(--admin-text-dim);
  border-top: 1px solid var(--admin-border);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: var(--admin-topbar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--admin-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-topbar-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--admin-text);
}

.admin-topbar-subtitle {
  font-size: 12px;
  color: var(--admin-text-muted);
}

.admin-topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.admin-content {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.admin-card {
  background: var(--admin-card);
  border-radius: var(--admin-radius-lg);
  box-shadow: var(--admin-card-shadow);
  padding: 16px;
  transition: box-shadow 0.2s;
}

.admin-card:hover {
  box-shadow: var(--admin-card-shadow-hover);
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--admin-radius-sm);
  font-size: 12px;
  font-weight: 600;
  background: var(--admin-card);
  color: var(--admin-text);
  border: 1px solid var(--admin-border);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.15s;
}

.admin-btn:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.admin-btn-primary {
  background: linear-gradient(135deg, var(--admin-accent), #7c3aed);
  color: #fff;
  border-color: transparent;
}

.admin-burger {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1001;
  background: var(--admin-card);
  color: var(--admin-text);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  box-shadow: var(--admin-card-shadow);
}

.admin-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: left 0.25s ease;
    width: 260px;
  }
  .admin-sidebar.open { left: 0; }
  .admin-overlay.open { display: block; }
  .admin-burger { display: inline-flex; }
  .admin-topbar { padding: 16px 16px 16px 60px; }
  .admin-content { padding: 16px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/admin.css"
git commit -m "style(admin): Premium/Stripe-inspired theme for dashboard 2.0"
```

---

## Task 14: New Sidebar with 11 nav items in 4 groups

**Files:**
- Modify: `components/admin/Sidebar.tsx`

- [ ] **Step 1: Rewrite file**

Replace contents of `components/admin/Sidebar.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radio, LayoutDashboard, GitBranch, Sparkles, AlertTriangle,
  TrendingUp, Globe, Target, Users, User, Trophy, Menu,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Radio;
  live?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: 'Мониторинг',
    items: [
      { href: '/admin/realtime', label: 'Real-time', Icon: Radio, live: true },
      { href: '/admin/overview', label: 'Overview', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Игра',
    items: [
      { href: '/admin/branch', label: 'Branch Analytics', Icon: GitBranch },
      { href: '/admin/engagement', label: 'Engagement', Icon: Sparkles },
      { href: '/admin/dropoff', label: 'Drop-off Zones', Icon: AlertTriangle },
    ],
  },
  {
    label: 'Маркетинг',
    items: [
      { href: '/admin/funnel', label: 'Funnel & UTM', Icon: TrendingUp },
      { href: '/admin/pages', label: 'Pages', Icon: Globe },
      { href: '/admin/offer', label: 'Offer Conversion', Icon: Target },
    ],
  },
  {
    label: 'Игроки',
    items: [
      { href: '/admin/participants', label: 'Participants', Icon: Users },
      { href: '/admin/player', label: 'Player Journey', Icon: User },
      { href: '/admin/leaderboard', label: 'Leaderboard', Icon: Trophy },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="admin-burger"
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        <Menu size={20} />
      </button>
      <div
        className={`admin-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-mark" aria-hidden />
          <div className="admin-sidebar-brand-text">Sales School</div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {GROUPS.map((group) => (
            <div key={group.label}>
              <div className="admin-sidebar-group-label">{group.label}</div>
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link${active ? ' admin-nav-link--active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <item.Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                    {item.live && active && (
                      <span className="admin-nav-live-dot" aria-label="live" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          Sales School · © 2026
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: success, no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/Sidebar.tsx
git commit -m "feat(admin): new Sidebar with 11 items across 4 groups + lucide icons"
```

---

## Task 15: Update admin layout to use TopBar

**Files:**
- Modify: `app/(admin)/layout.tsx`

- [ ] **Step 1: Replace contents**

```typescript
import type { Metadata } from 'next';
import Sidebar from '@/components/admin/Sidebar';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — Sales School',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <Sidebar />
      <div className="admin-main">
        {/* TopBar is rendered per-page via <TopBar /> so each page can set its
            title, subtitle, and actions; kept out of the layout to avoid
            prop drilling. */}
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/layout.tsx"
git commit -m "refactor(admin): layout wrapper; TopBar moved to per-page composition"
```

---

## Task 16: `KpiCard` component

**Files:**
- Create: `components/admin/KpiCard.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactNode } from 'react';

type KpiAccent = 'violet' | 'pink' | 'green' | 'orange' | 'blue';

const ACCENTS: Record<KpiAccent, { label: string; shadow: string }> = {
  violet: { label: '#6366f1', shadow: 'rgba(99, 102, 241, 0.06)' },
  pink:   { label: '#ec4899', shadow: 'rgba(236, 72, 153, 0.06)' },
  green:  { label: '#10b981', shadow: 'rgba(16, 185, 129, 0.06)' },
  orange: { label: '#fb923c', shadow: 'rgba(251, 146, 60, 0.06)' },
  blue:   { label: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.06)' },
};

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  accent?: KpiAccent;
}

export default function KpiCard({ label, value, delta, hint, accent = 'violet' }: KpiCardProps) {
  const { label: labelColor, shadow } = ACCENTS[accent];
  return (
    <div
      className="admin-card"
      style={{ boxShadow: `0 4px 12px ${shadow}` }}
    >
      <div style={{ fontSize: 9, color: labelColor, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--admin-text)', marginTop: 4 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 10, color: delta.positive ? 'var(--admin-accent-success)' : 'var(--admin-accent-danger)', marginTop: 2 }}>
          {delta.positive ? '↑' : '↓'} {delta.value}
        </div>
      )}
      {hint && (
        <div style={{ fontSize: 9, color: 'var(--admin-text-dim)', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/KpiCard.tsx
git commit -m "feat(admin): KpiCard primitive"
```

---

## Task 17: `TopBar` component

**Files:**
- Create: `components/admin/TopBar.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import type { ReactNode } from 'react';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="admin-topbar">
      <div>
        <div className="admin-topbar-title">{title}</div>
        {subtitle && <div className="admin-topbar-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="admin-topbar-actions">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/TopBar.tsx
git commit -m "feat(admin): TopBar primitive with title/subtitle/actions"
```

---

## Task 18: `InsightCard` component

**Files:**
- Create: `components/admin/InsightCard.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

type InsightTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<InsightTone, { bg: string; border: string; color: string; Icon: typeof Info }> = {
  info:    { bg: 'linear-gradient(90deg,#dbeafe,#bfdbfe)', border: '#3b82f6', color: '#1e3a8a', Icon: Info },
  success: { bg: 'linear-gradient(90deg,#dcfce7,#bbf7d0)', border: '#10b981', color: '#065f46', Icon: CheckCircle2 },
  warning: { bg: 'linear-gradient(90deg,#fef3c7,#fde68a)', border: '#f59e0b', color: '#92400e', Icon: AlertTriangle },
  danger:  { bg: 'linear-gradient(90deg,#fee2e2,#fecaca)', border: '#ef4444', color: '#991b1b', Icon: XCircle },
};

export interface InsightCardProps {
  title: string;
  body: ReactNode;
  tone?: InsightTone;
}

export default function InsightCard({ title, body, tone = 'info' }: InsightCardProps) {
  const { bg, border, color, Icon } = TONES[tone];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 12, background: bg,
      borderRadius: 'var(--admin-radius-sm)', borderLeft: `3px solid ${border}`,
    }}>
      <Icon size={18} color={border} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 12, color, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color, opacity: 0.85, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/InsightCard.tsx
git commit -m "feat(admin): InsightCard primitive with 4 tones"
```

---

## Task 19: `PageHeader` component

**Files:**
- Create: `components/admin/PageHeader.tsx`

- [ ] **Step 1: Implement**

```typescript
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 20,
    }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/PageHeader.tsx
git commit -m "feat(admin): PageHeader primitive"
```

---

## Task 20: Default /admin redirect to /admin/realtime

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Replace contents**

```typescript
import { redirect } from 'next/navigation';

export default function AdminIndex() {
  redirect('/admin/realtime');
}
```

Note: This will 404 until Phase 2 creates `/admin/realtime`. To keep Phase 1 working in the meantime, redirect to `/admin/overview`:

```typescript
import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // TODO Phase 2: switch to /admin/realtime once the page exists.
  redirect('/admin/overview');
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(admin)/admin/page.tsx"
git commit -m "chore(admin): redirect /admin to /admin/overview (Phase 1)"
```

---

## Task 21: Verify game + admin still function

**Files:** none (manual verification).

- [ ] **Step 1: Type check, test, build**

```bash
npx tsc --noEmit
npm test
npm run build
```

Expected: all three succeed.

- [ ] **Step 2: Dev server + smoke game**

```bash
npm run dev
```

- Open http://localhost:3000/game → play through Day 1 end-to-end.
- Verify in Supabase SQL editor that NEW event types appear:
  ```sql
  select event_type, count(*) from game_events
  where created_at > now() - interval '10 minutes'
  group by event_type;
  ```
  Expected rows include: `game_started`, `day_started`, `node_entered`, `node_exited`, `choice_made` (with `thinking_time_ms` in event_data), `heartbeat`, and `day_completed` or `day_failed`.

- [ ] **Step 3: Smoke admin UI**

- Visit http://localhost:3000/admin → should redirect to `/admin/overview`.
- Inspect sidebar: Premium style, 11 items in 4 groups, lucide icons.
- Click each nav link — existing pages (overview, participants, leaderboard, pages, leads, game-metrics) still render. New routes (`/admin/realtime`, `/admin/branch`, `/admin/engagement`, `/admin/dropoff`, `/admin/funnel`, `/admin/offer`, `/admin/player`) will 404 — expected until Phase 2.

- [ ] **Step 4: RPC smoke test**

From the project root, run:

```bash
npx tsx -e "
import { createAdminClient } from './lib/supabase/admin';
const admin = createAdminClient();
(async () => {
  const [flow, eng, funnel] = await Promise.all([
    admin.rpc('get_branch_flow', { p_scenario_id: 'car-dealership', p_day_id: 'day1' }),
    admin.rpc('get_engagement_index', { p_scenario_id: 'car-dealership' }),
    admin.rpc('get_offer_funnel', {}),
  ]);
  console.log('flow', flow.data?.length, flow.error?.message);
  console.log('eng', eng.data, eng.error?.message);
  console.log('funnel', funnel.data, funnel.error?.message);
})();
"
```

Expected: no errors; data may be empty while events accumulate.

- [ ] **Step 5: Final commit**

No code changes in this task — just verification. If any regressions are found, fix in a follow-up commit before closing Phase 1.

---

## Verification Summary (end of Phase 1)

At the end of Phase 1, the following should be true:

1. `npm test` — all tests pass (277 legacy + ~13 new = ~290 total).
2. `npm run build` — production build succeeds.
3. Playing the game emits new event types (`node_entered`, `node_exited`, `choice_made` with `thinking_time_ms`, `heartbeat`) to `game_events`.
4. The admin sidebar renders in the Premium style with 11 items across 4 groups.
5. Migrations 006–008 are applied; RPC functions return well-shaped data (empty or not).
6. Existing admin pages still work (no regression on overview/participants/leaderboard/etc.).
7. No breaking changes to the production game — only additive instrumentation.

## Out of scope for Phase 1 (reserved for Phase 2+)

- Building any of the new admin pages (`/admin/realtime`, `/admin/branch`, etc.) — Phase 2 wires them up to the RPCs from Task 12.
- Installing chart libraries (`recharts`, `@nivo/sankey`, `react-force-graph-2d`) — Phase 2.
- Offer-page tracking instrumentation on the actual offer landing page — Phase 3 (alongside that page's redesign).
- `dialogue_reread` emission logic (we have the helper but need to instrument the dialogue box's scroll/re-read detection) — Phase 2 with engagement page work.
