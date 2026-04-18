# Sales School Dashboard 2.0 — Phase 5 (Real-time) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `/admin/realtime` "diagnostic" page — live KPIs, activity chart, real-time feed of player events, and auto-insight surfacing of problem nodes.

**Architecture:** Hybrid approach: Supabase Realtime channel subscribes to INSERTs on `game_events` for the Live Feed (instant updates); periodic re-fetch every 60s for KPI cards, activity chart, and auto-insights (cheaper than realtime aggregation, freshness within 1 min is fine for KPIs). Pure transforms (`detectAutoInsights`, `buildActivitySeries`) are TDD-tested without I/O.

**Tech Stack:** Same as previous phases. New: Supabase Realtime channels for INSERT events on `game_events`.

**Existing infrastructure (do NOT recreate):**
- `lib/supabase/client.ts` — exports `createClient` (browser, used for Realtime)
- `lib/supabase/admin.ts` — server client
- `lib/admin/queries-v2.ts` — Phase 2/3/4 queries
- `lib/admin/types-v2.ts` — extended through Phase 4
- `components/admin/{KpiCard, PageHeader, InsightCard, Sidebar}.tsx`
- `components/admin/charts/TrendLineChart.tsx` (recharts LineChart wrapper)
- `app/(admin)/admin/page.tsx` currently redirects to `/admin/overview` — Phase 5 changes it to `/admin/realtime`
- The Sidebar already has a "Real-time" link with the green live-dot
- `useHeartbeat` (Phase 1) emits `heartbeat` events every 30s while a player is active

**Branch:** `feature/dashboard-2-phase-1`.

**Prod safety:** Migration 010 is ADD-only — adds `game_events` to existing publication. Realtime subscriptions are read-only.

---

## File Structure

### New files (production)

```
supabase/migrations/
└── 010_realtime_publication.sql           # Add game_events to supabase_realtime

lib/admin/
├── queries-v2.ts                           # EXTEND: + getRecentGameEvents,
│                                           #   getRealtimeKpis
├── realtime/
│   ├── detectAutoInsights.ts               # Pure: events → insight cards
│   └── buildActivitySeries.ts              # Pure: events → minute buckets

lib/admin/__tests__/
└── (no new file — extend existing queries-v2.test.ts in Task 2)

lib/admin/realtime/__tests__/
├── detectAutoInsights.test.ts
└── buildActivitySeries.test.ts

components/admin/
├── LiveFeed.tsx                            # Real-time event stream
└── charts/ActivityAreaChart.tsx            # Area chart for last-hour activity

lib/admin/hooks/                            # NEW directory
└── useRealtimeGameEvents.ts                # Subscription + buffered list

app/(admin)/admin/
├── page.tsx                                # MODIFY: redirect → /admin/realtime
└── realtime/
    ├── page.tsx                            # NEW
    └── RealtimeClient.tsx                  # NEW
```

### Why this decomposition
- The pure transforms (`detectAutoInsights`, `buildActivitySeries`) are easy to TDD because they take event arrays and produce structured output, with no I/O.
- `useRealtimeGameEvents` isolates the Supabase Realtime subscription logic (channel lifecycle, cleanup) from React state — single responsibility, reusable later if other pages want a live event feed.
- `LiveFeed` is just JSX over already-buffered events, so it has no business logic.
- `ActivityAreaChart` is a thin recharts wrapper, similar to existing chart components.
- The `/admin/realtime` page composes existing primitives (KpiCard, InsightCard, PageHeader) plus the three new pieces.

---

## Task 1: Migration 010 — add `game_events` to realtime publication

**File:** Create `supabase/migrations/010_realtime_publication.sql`

- [ ] **Step 1: Write SQL**

```sql
-- Phase 5: enable Supabase Realtime on game_events so the dashboard can
-- receive live INSERTs.
-- Idempotent: ALTER PUBLICATION ADD TABLE fails if already added, so we
-- guard with a DO block that checks pg_publication_tables first.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_events'
  ) then
    execute 'alter publication supabase_realtime add table public.game_events';
  end if;
end
$$;
```

- [ ] **Step 2: Apply via MCP (orchestrator does this)**

Stop here and report. The orchestrator applies via `mcp__plugin_supabase_supabase__apply_migration` (project_id `njbcybjdzjahpdmcjtqe`). Do NOT run `supabase` CLI.

- [ ] **Step 3: Commit the SQL file**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
git add supabase/migrations/010_realtime_publication.sql
git commit -m "$(cat <<'EOF'
feat(db): enable realtime on game_events (migration 010)

Required by /admin/realtime live feed. Idempotent — guards via
pg_publication_tables check.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Extend `queries-v2.ts` — recent events + realtime KPIs

**Files:**
- Modify: `lib/admin/queries-v2.ts`
- Modify: `lib/admin/__tests__/queries-v2.test.ts`

- [ ] **Step 1: Append failing tests inside the existing `describe('queries-v2', ...)` block**

Add to imports at the top of the test file:

```typescript
import {
  getUtmFunnel,
  getDailyTrends,
  getOfferFunnelData,
  getOfferBreakdownByRating,
  getOfferBreakdownByUtm,
  getPlayerJourneyData,
  getRecentGameEvents,
  getRealtimeKpis,
} from '@/lib/admin/queries-v2';
```

Append before the closing `});` of the describe block:

```typescript
  // -- Phase 5 realtime queries --------------------------------------------

  it('getRecentGameEvents queries last hour by default', async () => {
    const fromMock = vi.fn().mockReturnThis();
    const selectMock = vi.fn().mockReturnThis();
    const gteMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: [{ event_type: 'choice_made', event_data: {}, scenario_id: 's', day_id: 'd1', player_id: 'p1', created_at: '2026-04-18T11:30:00Z' }],
      error: null,
    });
    const supabase = {
      from: fromMock,
      rpc: mockRpc,
    };
    fromMock.mockReturnValue({ select: selectMock });
    selectMock.mockReturnValue({ gte: gteMock });
    gteMock.mockReturnValue({ order: orderMock });

    // Patch admin client just for this test
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const orig = (createAdminClient as unknown as { mock?: unknown }).mock;
    (createAdminClient as unknown as () => typeof supabase) = (() => supabase) as never;

    const events = await getRecentGameEvents();
    expect(events).toEqual([{ event_type: 'choice_made', event_data: {}, scenario_id: 's', day_id: 'd1', player_id: 'p1', created_at: '2026-04-18T11:30:00Z' }]);

    // restore
    if (orig !== undefined) (createAdminClient as unknown as { mock?: unknown }).mock = orig;
  });

  it('getRealtimeKpis returns shape with active/today/completed counts', async () => {
    mockRpc.mockResolvedValueOnce({ data: { active: 5, today: 50, completed_today: 12 }, error: null });
    const k = await getRealtimeKpis();
    expect(k.active).toBe(5);
    expect(k.today).toBe(50);
    expect(k.completed_today).toBe(12);
  });
```

Wait — the mock pattern for `from()` chains is awkward in the existing test file. Replace the first new test with a simpler smoke test that just checks the RPC call shape, and keep `getRealtimeKpis` as the second one (uses `mockRpc` cleanly):

```typescript
  // -- Phase 5 realtime queries --------------------------------------------

  it('getRealtimeKpis returns shape with active/today/completed counts', async () => {
    mockRpc.mockResolvedValueOnce({ data: { active: 5, today: 50, completed_today: 12 }, error: null });
    const k = await getRealtimeKpis();
    expect(mockRpc).toHaveBeenCalledWith('get_realtime_kpis');
    expect(k).toEqual({ active: 5, today: 50, completed_today: 12 });
  });

  it('getRealtimeKpis returns zeros on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    const k = await getRealtimeKpis();
    expect(k).toEqual({ active: 0, today: 0, completed_today: 0 });
  });
```

(Skip the test for `getRecentGameEvents` because it uses `from(...)` chains which the existing mock structure doesn't support; instead exercise it through the dev server smoke test in Task 9.)

- [ ] **Step 2: Run — expect FAIL**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 3: Append to `lib/admin/queries-v2.ts`**

Note: this also requires a new SQL function `get_realtime_kpis()` — included in this same migration block to keep things atomic. Add to migration 010's SQL FIRST. Update Task 1's migration content to include this function:

Update `supabase/migrations/010_realtime_publication.sql` (REPLACE content):

```sql
-- Phase 5: enable Supabase Realtime on game_events + new RPC for live KPIs.
-- ADD-only.

-- 1. Enable realtime publication on game_events (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_events'
  ) then
    execute 'alter publication supabase_realtime add table public.game_events';
  end if;
end
$$;

-- 2. Live KPI RPC: active (heartbeat in last 90s), today (game_started today),
--    completed_today (game_completed today).
create or replace function public.get_realtime_kpis()
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'active', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'heartbeat'
        and created_at >= now() - interval '90 seconds'
    ),
    'today', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_started'
        and created_at >= date_trunc('day', now())
    ),
    'completed_today', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_completed'
        and created_at >= date_trunc('day', now())
    )
  );
$$;
```

Then in `lib/admin/queries-v2.ts`, append:

```typescript
import type { PlayerJourneyEvent } from './types-v2';

// -- Realtime --------------------------------------------------------------

export interface RealtimeKpis {
  active: number;
  today: number;
  completed_today: number;
}

const ZERO_KPIS: RealtimeKpis = { active: 0, today: 0, completed_today: 0 };

export async function getRealtimeKpis(): Promise<RealtimeKpis> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_realtime_kpis');
  if (error || !data) {
    if (error) console.warn('[queries-v2] get_realtime_kpis', error.message);
    return ZERO_KPIS;
  }
  const d = data as RealtimeKpis;
  return {
    active: Number(d.active) || 0,
    today: Number(d.today) || 0,
    completed_today: Number(d.completed_today) || 0,
  };
}

export interface RecentGameEvent extends PlayerJourneyEvent {
  player_id: string;
  display_name: string | null;     // joined from players
}

export async function getRecentGameEvents(minutes = 60): Promise<RecentGameEvent[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { data, error } = await admin
    .from('game_events')
    .select('event_type, event_data, scenario_id, day_id, player_id, created_at, players(display_name)')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !data) {
    if (error) console.warn('[queries-v2] getRecentGameEvents', error.message);
    return [];
  }
  return data.map((r: {
    event_type: string;
    event_data: Record<string, unknown> | null;
    scenario_id: string | null;
    day_id: string | null;
    player_id: string;
    created_at: string;
    players: { display_name: string } | { display_name: string }[] | null;
  }) => {
    const playerObj = Array.isArray(r.players) ? r.players[0] : r.players;
    return {
      event_type: r.event_type,
      event_data: r.event_data ?? {},
      scenario_id: r.scenario_id,
      day_id: r.day_id,
      player_id: r.player_id,
      created_at: r.created_at,
      display_name: playerObj?.display_name ?? null,
    };
  });
}
```

- [ ] **Step 4: Run tests — expect 2 new PASS**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 5: Commit (file + tests, will commit with migration update in next step)**

Don't commit yet — Task 1 needs to be re-committed with the updated migration. Do that now:

```bash
git add supabase/migrations/010_realtime_publication.sql lib/admin/queries-v2.ts lib/admin/__tests__/queries-v2.test.ts
# If 010 was already committed, amend; otherwise new commit:
git status
git commit -m "$(cat <<'EOF'
feat(admin): realtime KPIs + recent events query (migration 010 + queries-v2)

Migration 010 enables Supabase Realtime on game_events and adds
get_realtime_kpis() RPC (active/today/completed_today). queries-v2 gets
typed wrappers + getRecentGameEvents joining player display_name.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(If 010 was committed in Task 1 separately, Task 2 commit only adds the queries-v2 changes; Task 1 will be re-applied to remote with the updated SQL containing the new RPC.)

---

## Task 3: `detectAutoInsights` transform (TDD)

**Files:**
- Create: `lib/admin/realtime/detectAutoInsights.ts`
- Create: `lib/admin/realtime/__tests__/detectAutoInsights.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { detectAutoInsights } from '@/lib/admin/realtime/detectAutoInsights';
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

const ev = (
  event_type: string,
  player_id: string,
  day_id: string | null,
  node_id: string | null = null,
  minutes_ago = 5,
): RecentGameEvent => ({
  event_type,
  event_data: node_id ? { node_id } : {},
  scenario_id: 's',
  day_id,
  player_id,
  display_name: player_id,
  created_at: new Date(Date.now() - minutes_ago * 60_000).toISOString(),
});

describe('detectAutoInsights', () => {
  it('returns empty when no events', () => {
    expect(detectAutoInsights([])).toEqual([]);
  });

  it('flags concentration of dropoffs on a single node', () => {
    // 5 different players ended their journey on node X (last node_entered, no completion)
    const events: RecentGameEvent[] = [];
    for (let i = 0; i < 5; i++) {
      events.push(ev('node_entered', `p${i}`, 'day1', 'problem_node', 10));
    }
    const insights = detectAutoInsights(events);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.tone === 'danger' && /problem_node/.test(String(i.body)))).toBe(true);
  });

  it('flags slow nodes — avg thinking >20s on choice_made', () => {
    const events: RecentGameEvent[] = [
      { ...ev('choice_made', 'p1', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 25_000 } },
      { ...ev('choice_made', 'p2', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 22_000 } },
      { ...ev('choice_made', 'p3', 'day1', 'slow_node'), event_data: { node_id: 'slow_node', thinking_time_ms: 28_000 } },
    ];
    const insights = detectAutoInsights(events);
    expect(insights.some((i) => i.tone === 'warning' && /slow_node/.test(String(i.body)))).toBe(true);
  });

  it('reports good news when many completions, no anomalies', () => {
    const events: RecentGameEvent[] = [];
    for (let i = 0; i < 6; i++) {
      events.push(ev('day_completed', `p${i}`, 'day1'));
    }
    const insights = detectAutoInsights(events);
    expect(insights.some((i) => i.tone === 'success')).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/realtime/__tests__/detectAutoInsights.test.ts
```

- [ ] **Step 3: Implement `lib/admin/realtime/detectAutoInsights.ts`**

```typescript
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export type InsightTone = 'info' | 'success' | 'warning' | 'danger';

export interface AutoInsight {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
}

const SLOW_THRESHOLD_MS = 20_000;
const DROPOFF_PLAYERS_THRESHOLD = 4;
const COMPLETION_GOOD_NEWS_THRESHOLD = 5;

/**
 * Scans a window of recent events (typically last 30-60 min) and surfaces
 * actionable observations:
 *   - danger : ≥4 distinct players ended on the same node without completing
 *   - warning : avg thinking time on a node ≥20s across ≥3 players
 *   - success : ≥5 day completions without any of the above
 */
export function detectAutoInsights(events: RecentGameEvent[]): AutoInsight[] {
  const insights: AutoInsight[] = [];

  // 1. Drop-off concentration: per-player last node_entered without later completion
  const lastNodeByPlayer = new Map<string, string>();
  const completedPlayers = new Set<string>();
  for (const e of events) {
    if (e.event_type === 'node_entered') {
      const nodeId = (e.event_data as { node_id?: string }).node_id;
      if (nodeId) lastNodeByPlayer.set(e.player_id, nodeId);
    }
    if (e.event_type === 'day_completed' || e.event_type === 'game_completed') {
      completedPlayers.add(e.player_id);
    }
  }
  const dropoffByNode = new Map<string, number>();
  for (const [playerId, nodeId] of lastNodeByPlayer) {
    if (!completedPlayers.has(playerId)) {
      dropoffByNode.set(nodeId, (dropoffByNode.get(nodeId) ?? 0) + 1);
    }
  }
  for (const [nodeId, count] of dropoffByNode) {
    if (count >= DROPOFF_PLAYERS_THRESHOLD) {
      insights.push({
        id: `dropoff-${nodeId}`,
        title: 'Концентрация drop-off',
        body: `${count} игроков ушли с узла ${nodeId} в последний час без завершения дня`,
        tone: 'danger',
      });
    }
  }

  // 2. Slow nodes
  const thinkingByNode = new Map<string, number[]>();
  for (const e of events) {
    if (e.event_type !== 'choice_made') continue;
    const data = e.event_data as { node_id?: string; thinking_time_ms?: number };
    if (!data.node_id || typeof data.thinking_time_ms !== 'number') continue;
    if (!thinkingByNode.has(data.node_id)) thinkingByNode.set(data.node_id, []);
    thinkingByNode.get(data.node_id)!.push(data.thinking_time_ms);
  }
  for (const [nodeId, times] of thinkingByNode) {
    if (times.length < 3) continue;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (avg >= SLOW_THRESHOLD_MS) {
      insights.push({
        id: `slow-${nodeId}`,
        title: 'Медленный узел',
        body: `Игроки задумываются на ${nodeId} в среднем ${(avg / 1000).toFixed(1)}с — стоит упростить формулировку`,
        tone: 'warning',
      });
    }
  }

  // 3. Good news
  const completionsCount = events.filter(
    (e) => e.event_type === 'day_completed' || e.event_type === 'game_completed',
  ).length;
  if (insights.length === 0 && completionsCount >= COMPLETION_GOOD_NEWS_THRESHOLD) {
    insights.push({
      id: 'good-news',
      title: 'Игра идёт ровно',
      body: `${completionsCount} завершений за период, проблемных зон не обнаружено`,
      tone: 'success',
    });
  }

  return insights;
}
```

- [ ] **Step 4: Run — expect PASS (4 tests)**

```bash
npx vitest run lib/admin/realtime/__tests__/detectAutoInsights.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/realtime/detectAutoInsights.ts lib/admin/realtime/__tests__/detectAutoInsights.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): detectAutoInsights — surfaces drop-off concentration, slow nodes, healthy state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `buildActivitySeries` transform (TDD)

**Files:**
- Create: `lib/admin/realtime/buildActivitySeries.ts`
- Create: `lib/admin/realtime/__tests__/buildActivitySeries.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildActivitySeries } from '@/lib/admin/realtime/buildActivitySeries';
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

const ev = (player_id: string, minutes_ago: number): RecentGameEvent => ({
  event_type: 'choice_made',
  event_data: {},
  scenario_id: 's',
  day_id: 'd1',
  player_id,
  display_name: player_id,
  created_at: new Date(Date.now() - minutes_ago * 60_000).toISOString(),
});

describe('buildActivitySeries', () => {
  it('returns 60 buckets for the last hour, all zero on empty input', () => {
    const series = buildActivitySeries([], 60);
    expect(series).toHaveLength(60);
    expect(series.every((b) => b.count === 0)).toBe(true);
  });

  it('bucketizes events by minute and counts unique players per bucket', () => {
    const events: RecentGameEvent[] = [
      ev('p1', 5),  // 5 min ago
      ev('p2', 5),
      ev('p2', 5),  // duplicate player → still 1 unique in that bucket
      ev('p3', 30),
    ];
    const series = buildActivitySeries(events, 60);
    // bucket 60 - 5 = 55 → 2 unique players
    expect(series[55].count).toBe(2);
    // bucket 60 - 30 = 30 → 1 unique player
    expect(series[30].count).toBe(1);
    // other buckets → 0
    expect(series[0].count).toBe(0);
  });

  it('each bucket has an iso label suitable for X axis', () => {
    const series = buildActivitySeries([], 5);
    expect(series).toHaveLength(5);
    for (const b of series) {
      expect(b.bucket).toMatch(/^\d{2}:\d{2}$/);  // HH:mm
    }
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/realtime/__tests__/buildActivitySeries.test.ts
```

- [ ] **Step 3: Implement `lib/admin/realtime/buildActivitySeries.ts`**

```typescript
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export interface ActivityBucket {
  bucket: string;     // 'HH:mm' label for X axis
  count: number;      // distinct players active in this minute
}

/**
 * Builds a 1-minute-bucket time series for the last `minutes` minutes,
 * ending at "now". Each bucket reports unique active players.
 *
 * Bucket index 0 = oldest (now - minutes), index minutes-1 = most recent.
 */
export function buildActivitySeries(events: RecentGameEvent[], minutes: number): ActivityBucket[] {
  const now = Date.now();
  const buckets: { time: number; players: Set<string> }[] = [];
  for (let i = 0; i < minutes; i++) {
    const time = now - (minutes - 1 - i) * 60_000;
    buckets.push({ time, players: new Set() });
  }

  for (const e of events) {
    const eventTime = new Date(e.created_at).getTime();
    const minutesAgo = (now - eventTime) / 60_000;
    if (minutesAgo < 0 || minutesAgo >= minutes) continue;
    const idx = minutes - 1 - Math.floor(minutesAgo);
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx].players.add(e.player_id);
  }

  return buckets.map((b) => ({
    bucket: new Date(b.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    count: b.players.size,
  }));
}
```

- [ ] **Step 4: Run — expect PASS (3 tests)**

```bash
npx vitest run lib/admin/realtime/__tests__/buildActivitySeries.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/realtime/buildActivitySeries.ts lib/admin/realtime/__tests__/buildActivitySeries.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buildActivitySeries — 1-minute buckets of unique active players

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `useRealtimeGameEvents` hook

**Files:**
- Create: `lib/admin/hooks/useRealtimeGameEvents.ts`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export interface UseRealtimeGameEventsArgs {
  enabled?: boolean;
  bufferSize?: number;          // max events to keep in memory (default 200)
}

/**
 * Subscribes to INSERTs on `game_events` via Supabase Realtime.
 * Returns a buffered list of recent live events (newest first).
 *
 * The buffer is capped to prevent unbounded memory growth on a busy day.
 * `display_name` is null for live events because the realtime payload
 * doesn't join — UI should show player_id when display_name is null.
 */
export function useRealtimeGameEvents(args: UseRealtimeGameEventsArgs = {}): RecentGameEvent[] {
  const { enabled = true, bufferSize = 200 } = args;
  const [events, setEvents] = useState<RecentGameEvent[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel('admin_realtime_game_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_events' },
        (payload) => {
          const row = payload.new as {
            event_type: string;
            event_data: Record<string, unknown> | null;
            scenario_id: string | null;
            day_id: string | null;
            player_id: string;
            created_at: string;
          };
          const incoming: RecentGameEvent = {
            event_type: row.event_type,
            event_data: row.event_data ?? {},
            scenario_id: row.scenario_id,
            day_id: row.day_id,
            player_id: row.player_id,
            display_name: null,
            created_at: row.created_at,
          };
          setEvents((prev) => [incoming, ...prev].slice(0, bufferSize));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, bufferSize]);

  return events;
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add lib/admin/hooks/useRealtimeGameEvents.ts
git commit -m "$(cat <<'EOF'
feat(admin): useRealtimeGameEvents — Supabase Realtime channel + buffered list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `LiveFeed` component

**Files:**
- Create: `components/admin/LiveFeed.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export interface LiveFeedProps {
  events: RecentGameEvent[];
  maxItems?: number;
}

const DOT_COLOR: Record<string, string> = {
  game_started: '#22c55e',
  day_started: '#3b82f6',
  day_completed: '#10b981',
  day_failed: '#ef4444',
  choice_made: '#8b5cf6',
  back_navigation: '#f59e0b',
  heartbeat: '#94a3b8',
  game_completed: '#10b981',
  achievement_unlocked: '#f59e0b',
};

const EVENT_TEXT: Record<string, string> = {
  game_started: 'начал игру',
  day_started: 'начал день',
  day_completed: 'завершил день',
  day_failed: 'провалил день',
  choice_made: 'сделал выбор',
  back_navigation: 'шаг назад',
  heartbeat: 'активен',
  game_completed: 'завершил игру',
  achievement_unlocked: 'получил достижение',
  node_entered: 'на узле',
  node_exited: 'покинул узел',
  dropped_off: 'покинул игру',
  idle_detected: 'неактивен',
};

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function shortPlayerLabel(e: RecentGameEvent): string {
  return e.display_name ?? e.player_id.slice(0, 8);
}

export default function LiveFeed({ events, maxItems = 30 }: LiveFeedProps) {
  if (events.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 12, padding: 16, textAlign: 'center' }}>
        Жду событий…
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {events.slice(0, maxItems).map((e, i) => {
        const color = DOT_COLOR[e.event_type] ?? '#cbd5e1';
        const label = EVENT_TEXT[e.event_type] ?? e.event_type;
        const dayHint = e.day_id ? ` · ${e.day_id}` : '';
        return (
          <div
            key={`${e.created_at}-${e.player_id}-${i}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 6px', fontSize: 11,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong>{shortPlayerLabel(e)}</strong> {label}{dayHint}
            </span>
            <span style={{ color: 'var(--admin-text-dim)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>{fmt(e.created_at)}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/LiveFeed.tsx
git commit -m "$(cat <<'EOF'
feat(admin): LiveFeed — colored dot stream of recent player events

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `ActivityAreaChart` component

**Files:**
- Create: `components/admin/charts/ActivityAreaChart.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ActivityBucket } from '@/lib/admin/realtime/buildActivitySeries';

export interface ActivityAreaChartProps {
  buckets: ActivityBucket[];
  height?: number;
}

export default function ActivityAreaChart({ buckets, height = 220 }: ActivityAreaChartProps) {
  if (buckets.length === 0 || buckets.every((b) => b.count === 0)) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет активности за последний час
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={buckets} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <defs>
            <linearGradient id="activityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bucket" tick={{ fontSize: 9 }} interval={9} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [`${v} игроков`, 'Активность']} />
          <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#activityGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/ActivityAreaChart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): ActivityAreaChart — area chart for last-hour player activity

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `/admin/realtime` page (NEW)

**Files:**
- Create: `app/(admin)/admin/realtime/page.tsx`
- Create: `app/(admin)/admin/realtime/RealtimeClient.tsx`

- [ ] **Step 1: Server `page.tsx`**

```typescript
import { Suspense } from 'react';
import RealtimeClient from './RealtimeClient';

// No revalidate — this page fetches everything client-side and refreshes itself
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Real-time — Sales School' };

export default function RealtimePage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <RealtimeClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client component**

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import LiveFeed from '@/components/admin/LiveFeed';
import ActivityAreaChart from '@/components/admin/charts/ActivityAreaChart';
import { getRealtimeKpis, getRecentGameEvents, type RealtimeKpis, type RecentGameEvent } from '@/lib/admin/queries-v2';
import { useRealtimeGameEvents } from '@/lib/admin/hooks/useRealtimeGameEvents';
import { detectAutoInsights } from '@/lib/admin/realtime/detectAutoInsights';
import { buildActivitySeries } from '@/lib/admin/realtime/buildActivitySeries';

const REFRESH_MS = 30_000;

export default function RealtimeClient() {
  const [kpis, setKpis] = useState<RealtimeKpis>({ active: 0, today: 0, completed_today: 0 });
  const [snapshot, setSnapshot] = useState<RecentGameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const live = useRealtimeGameEvents({ enabled: true, bufferSize: 100 });

  // Fetch snapshot + KPIs every REFRESH_MS
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      const [k, ev] = await Promise.all([getRealtimeKpis(), getRecentGameEvents(60)]);
      if (cancelled) return;
      setKpis(k); setSnapshot(ev); setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Merge realtime events with snapshot for the LiveFeed (live takes precedence)
  const merged = useMemo(() => {
    // Live events are newest first; snapshot includes them after refresh.
    // Dedupe by created_at + player_id + event_type
    const seen = new Set<string>();
    const result: RecentGameEvent[] = [];
    for (const e of [...live, ...snapshot]) {
      const key = `${e.created_at}-${e.player_id}-${e.event_type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(e);
    }
    return result;
  }, [live, snapshot]);

  const insights = useMemo(() => detectAutoInsights(snapshot), [snapshot]);
  const activity = useMemo(() => buildActivitySeries(snapshot, 60), [snapshot]);

  // Find the "current problem zone" — top drop-off node from insights
  const problemNode = insights.find((i) => i.tone === 'danger');

  return (
    <div>
      <PageHeader
        title="Real-time"
        subtitle="Что происходит прямо сейчас. Обновляется каждые 30 секунд."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard
          label="Сейчас играют"
          value={kpis.active}
          accent="green"
          hint="heartbeat за 90 сек"
        />
        <KpiCard label="За сегодня" value={kpis.today} accent="violet" />
        <KpiCard label="Завершили" value={kpis.completed_today} accent="pink" />
        <KpiCard
          label="Проблемная зона"
          value={problemNode ? '⚠ Есть' : '✓ Норма'}
          accent={problemNode ? 'orange' : 'green'}
          hint={problemNode ? problemNode.body.slice(0, 60) + '…' : undefined}
        />
      </div>

      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {insights.map((i) => (
            <InsightCard key={i.id} tone={i.tone} title={i.title} body={i.body} />
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              Активность за час
            </div>
            <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>
              {loading ? 'загружаем…' : 'минутные бакеты'}
            </div>
          </div>
          <ActivityAreaChart buckets={activity} />
        </div>

        <div className="admin-card" style={{ padding: 16, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              Live-feed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--admin-text-dim)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              real-time
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <LiveFeed events={merged} maxItems={50} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/realtime/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/realtime — live KPIs + activity chart + feed + auto-insights

Realtime channel for the Live-feed (instant). Periodic 30s refresh for KPIs,
activity bucket chart, and auto-insights. detectAutoInsights surfaces
drop-off concentration, slow nodes, or healthy state.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Update `/admin` redirect

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Replace contents**

```typescript
import { redirect } from 'next/navigation';

export default function AdminIndex() {
  redirect('/admin/realtime');
}
```

- [ ] **Step 2: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/page.tsx"
git commit -m "$(cat <<'EOF'
chore(admin): default landing now /admin/realtime (was /admin/overview)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Final verification

- [ ] **Step 1: Tests + build**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit && npm test && npm run build
```

Expected: ~383 tests (376 + 4 + 3 = 383), build green.

- [ ] **Step 2: Manual smoke**

```bash
npm run dev
```

- http://localhost:3000/admin → redirects to `/admin/realtime`
- KPI cards show 0/0/0/Норма if no recent activity, or live numbers if game has been played
- ActivityAreaChart renders empty placeholder OR area curve
- LiveFeed shows "Жду событий…" until you play through `/game`
- After playing → events appear instantly in LiveFeed; KPIs update on next 30s refresh

- [ ] **Step 3: No commit needed** — fix any issues in a follow-up commit.

---

## Verification Summary (end of Phase 5)

1. `npm test` — all tests pass.
2. `npm run build` — production build succeeds with new `/admin/realtime` route.
3. Migration 010 applied: `game_events` is in `supabase_realtime` publication AND `get_realtime_kpis()` RPC works.
4. `/admin` redirects to `/admin/realtime`.
5. `/admin/realtime` shows live KPIs, area chart, real-time feed, auto-insights.
6. Phase 1-4 routes still functional.

## Out of scope (deferred to Phase 6)

- Custom date range on Real-time (only "now" view).
- Push notifications when a critical insight fires.
- Filter Live-feed by event type or player.
- Export of recent events.
