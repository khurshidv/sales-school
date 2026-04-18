# Sales School Dashboard 2.0 — Phase 4 (Player Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three "Players" admin pages — Participants list, individual Player Journey, and a redesigned Leaderboard — so the owner can identify, contact, and recruit promising players.

**Architecture:** Same Server Components + Client Components pattern. Pure transforms (`parseJourney`, `deriveStrengthsWeaknesses`) handle classification and pattern detection — testable without DB. No new DB migration needed for Phase 4: existing `get_player_journey` RPC covers the journey timeline, and player ratings are joined in TypeScript from `completed_scenarios`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind 4 + `app/(admin)/admin.css`, recharts (already installed), lucide-react.

**Existing infrastructure (do NOT recreate):**
- `get_player_journey(p_player_id uuid)` RPC deployed (returns event_type, event_data, scenario_id, day_id, created_at)
- `lib/admin/queries.ts` — legacy `getPlayers(opts)`, `getLeaderboard(opts)`
- `lib/admin/queries-v2.ts` — Phase 2/3 helpers
- `lib/admin/types-v2.ts` — extend with player types
- `lib/supabase/admin.ts` — `createAdminClient()`
- `components/admin/{KpiCard, TopBar, InsightCard, PageHeader, Sidebar, ScenarioSelector, DayTabs, PeriodFilter}.tsx`
- Sidebar already links to `/admin/participants`, `/admin/player`, `/admin/leaderboard`
- `players` table columns: id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_*, referrer, device_fingerprint, last_seen_at, created_at, updated_at
- `completed_scenarios` table columns: id, player_id, scenario_id, day_id, score, rating (S/A/B/C/F), time_taken, choices, completed_at

**Branch:** `feature/dashboard-2-phase-1` (continuing).

**Prod safety:** Read-only; no DB writes; no schema changes.

---

## File Structure

### New files (production)

```
lib/admin/
├── types-v2.ts                            # EXTEND: + PlayerJourneyEvent, PlayerSummary,
│                                          #   ParsedJourneyDay, ParsedJourney,
│                                          #   PlayerStrengthsWeaknesses, EnrichedPlayer
├── queries-v2.ts                          # EXTEND: + getPlayerJourneyData,
│                                          #   getPlayerSummary, getPlayersEnriched,
│                                          #   getLeaderboardEnriched
├── player/
│   ├── parseJourney.ts                    # Pure: events[] → ParsedJourney
│   └── deriveStrengthsWeaknesses.ts       # Pure: ParsedJourney → traits + recommendation

components/admin/
├── RatingBadge.tsx                         # S/A/B/C/F badge with color
├── Timeline.tsx                            # chronological event list
├── PlayerProfile.tsx                       # header card with avatar + KPIs + contact buttons

components/admin/charts/
├── PerDayBars.tsx                          # small per-day score bars (recharts)
└── MedalBadge.tsx                          # gold/silver/bronze for top-3

app/(admin)/admin/
├── participants/                           # REPLACE existing page
│   ├── page.tsx
│   └── ParticipantsClient.tsx
├── player/[playerId]/                      # NEW
│   ├── page.tsx
│   └── PlayerClient.tsx
└── leaderboard/                            # REPLACE existing page
    ├── page.tsx
    └── LeaderboardClient.tsx
```

### New tests

```
lib/admin/__tests__/queries-v2.test.ts          # EXTEND: + 3 new tests for player queries
lib/admin/player/__tests__/parseJourney.test.ts
lib/admin/player/__tests__/deriveStrengthsWeaknesses.test.ts
```

### Why this decomposition
- `parseJourney` and `deriveStrengthsWeaknesses` are independently testable — they take event arrays and produce structured insights without I/O.
- `Timeline` is a generic chronological list — used only on the player page in Phase 4 but could be reused for activity logs later.
- `MedalBadge` is tiny but isolated so leaderboard polish doesn't pollute the page file.
- `PlayerProfile` keeps the contact-button logic (WhatsApp / Telegram URLs) in one place.

---

## Task 1: Extend `types-v2.ts` with player types

**File:** `lib/admin/types-v2.ts`

- [ ] **Step 1: Append at the end of the file**

```typescript
// ---- Player Pages (Phase 4) ----

export interface PlayerJourneyEvent {
  event_type: string;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
  created_at: string;
}

export interface PlayerSummary {
  id: string;
  phone: string;
  display_name: string;
  avatar_id: string | null;
  level: number;
  total_xp: number;
  total_score: number;
  coins: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  device_fingerprint: string | null;
  last_seen_at: string;
  created_at: string;
}

export interface CompletedDay {
  scenario_id: string;
  day_id: string;
  score: number;
  rating: string;        // S | A | B | C | F
  time_taken: number;    // seconds
  completed_at: string;
}

export interface ParsedJourneyDay {
  day_id: string;
  scenario_id: string | null;
  events: PlayerJourneyEvent[];
  started_at: string | null;
  completed_at: string | null;
  outcome: 'completed' | 'failed' | 'in_progress' | 'dropped';
  choices_made: number;
  back_navigations: number;
  total_thinking_time_ms: number;
}

export interface ParsedJourney {
  days: ParsedJourneyDay[];
  totalEvents: number;
  totalSessions: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface PlayerStrengthsWeaknesses {
  strengths: string[];
  weaknesses: string[];
  recommendation: 'hire' | 'train' | 'pass';
  recommendationReason: string;
}

export interface EnrichedPlayer extends PlayerSummary {
  best_rating: string | null;          // best across all completed days, or null
  days_completed: number;
  last_activity: string | null;        // most recent event timestamp
}
```

- [ ] **Step 2: Type-check + commit**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit
git add lib/admin/types-v2.ts
git commit -m "$(cat <<'EOF'
feat(admin): types for Phase 4 (player pages — journey, summary, strengths)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Extend `queries-v2.ts` with player queries (TDD)

**Files:**
- Modify: `lib/admin/queries-v2.ts`
- Modify: `lib/admin/__tests__/queries-v2.test.ts`

- [ ] **Step 1: Write failing tests**

Append to the existing top-level `describe('queries-v2', ...)` in `lib/admin/__tests__/queries-v2.test.ts`, before its closing `});`:

```typescript
  // -- Phase 4 player queries ------------------------------------------------

  it('getPlayerJourneyData forwards player_id and returns events', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { event_type: 'game_started', event_data: {}, scenario_id: 's', day_id: null, created_at: '2026-04-10T10:00:00Z' },
      ],
      error: null,
    });
    const events = await getPlayerJourneyData('p1');
    expect(mockRpc).toHaveBeenCalledWith('get_player_journey', { p_player_id: 'p1' });
    expect(events).toEqual([
      { event_type: 'game_started', event_data: {}, scenario_id: 's', day_id: null, created_at: '2026-04-10T10:00:00Z' },
    ]);
  });

  it('getPlayerJourneyData returns [] on error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await getPlayerJourneyData('p1')).toEqual([]);
  });
```

Update imports at the top of the test file:

```typescript
import {
  getUtmFunnel,
  getDailyTrends,
  getOfferFunnelData,
  getOfferBreakdownByRating,
  getOfferBreakdownByUtm,
  getPlayerJourneyData,
} from '@/lib/admin/queries-v2';
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 3: Append to `lib/admin/queries-v2.ts`**

```typescript
import type {
  PlayerJourneyEvent, PlayerSummary, CompletedDay, EnrichedPlayer,
} from './types-v2';

// -- Player Journey --------------------------------------------------------

export async function getPlayerJourneyData(playerId: string): Promise<PlayerJourneyEvent[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_player_journey', { p_player_id: playerId });
  if (error) {
    console.warn('[queries-v2] get_player_journey', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    event_type: string;
    event_data: Record<string, unknown> | null;
    scenario_id: string | null;
    day_id: string | null;
    created_at: string;
  }) => ({
    event_type: r.event_type,
    event_data: r.event_data ?? {},
    scenario_id: r.scenario_id,
    day_id: r.day_id,
    created_at: r.created_at,
  }));
}

// -- Player Summary --------------------------------------------------------

export async function getPlayerSummary(playerId: string): Promise<PlayerSummary | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('players')
    .select('id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_source, utm_medium, utm_campaign, referrer, device_fingerprint, last_seen_at, created_at')
    .eq('id', playerId)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn('[queries-v2] getPlayerSummary', error.message);
    return null;
  }
  return data as PlayerSummary;
}

export async function getCompletedDaysForPlayer(playerId: string): Promise<CompletedDay[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('completed_scenarios')
    .select('scenario_id, day_id, score, rating, time_taken, completed_at')
    .eq('player_id', playerId)
    .order('completed_at', { ascending: true });
  if (error || !data) {
    if (error) console.warn('[queries-v2] getCompletedDaysForPlayer', error.message);
    return [];
  }
  return data as CompletedDay[];
}

// -- Enriched Players (for Participants table) ----------------------------

const RATING_ORDER: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, F: 5 };
function bestRating(ratings: string[]): string | null {
  if (ratings.length === 0) return null;
  return [...ratings].sort((a, b) => (RATING_ORDER[a] ?? 99) - (RATING_ORDER[b] ?? 99))[0];
}

export interface GetPlayersEnrichedArgs {
  search?: string;
  ratingFilter?: string | null;       // 'S' | 'A' | ... | null = no filter
  limit?: number;
  offset?: number;
  from?: string | null;
  to?: string | null;
}

export async function getPlayersEnriched(
  args: GetPlayersEnrichedArgs = {},
): Promise<{ players: EnrichedPlayer[]; total: number }> {
  const admin = createAdminClient();
  const { search, limit = 50, offset = 0, from, to } = args;

  // 1. Fetch players page
  let q = admin
    .from('players')
    .select(
      'id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_source, utm_medium, utm_campaign, referrer, device_fingerprint, last_seen_at, created_at',
      { count: 'exact' },
    );
  if (search) q = q.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`);
  if (from) q = q.gte('created_at', from);
  if (to) q = q.lte('created_at', to);
  q = q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data: rows, count, error } = await q;
  if (error || !rows) {
    if (error) console.warn('[queries-v2] getPlayersEnriched', error.message);
    return { players: [], total: 0 };
  }

  // 2. Bulk fetch ratings + completion counts for THIS page only
  const playerIds = rows.map((r) => r.id);
  if (playerIds.length === 0) return { players: [], total: count ?? 0 };

  const { data: completions } = await admin
    .from('completed_scenarios')
    .select('player_id, day_id, rating, completed_at')
    .in('player_id', playerIds);

  const byPlayer: Record<string, { ratings: string[]; days: Set<string>; lastAt: string | null }> = {};
  for (const id of playerIds) byPlayer[id] = { ratings: [], days: new Set(), lastAt: null };
  for (const c of completions ?? []) {
    const acc = byPlayer[c.player_id];
    if (!acc) continue;
    acc.ratings.push(c.rating);
    acc.days.add(c.day_id);
    if (!acc.lastAt || c.completed_at > acc.lastAt) acc.lastAt = c.completed_at;
  }

  let players: EnrichedPlayer[] = rows.map((r) => {
    const acc = byPlayer[r.id];
    return {
      ...(r as PlayerSummary),
      best_rating: bestRating(acc.ratings),
      days_completed: acc.days.size,
      last_activity: acc.lastAt ?? r.last_seen_at,
    };
  });

  // 3. Optional client-side rating filter
  if (args.ratingFilter) {
    players = players.filter((p) => p.best_rating === args.ratingFilter);
  }

  return { players, total: count ?? 0 };
}

// -- Enriched Leaderboard --------------------------------------------------

export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  total_score: number;
  scenarios_completed: number;
  level: number;
  best_rating: string | null;
  updated_at: string;
}

export async function getLeaderboardEnriched(limit = 50): Promise<LeaderboardItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leaderboard')
    .select('player_id, display_name, total_score, scenarios_completed, level, updated_at')
    .order('total_score', { ascending: false })
    .limit(limit);
  if (error || !data) {
    if (error) console.warn('[queries-v2] getLeaderboardEnriched', error.message);
    return [];
  }
  const playerIds = data.map((r) => r.player_id);
  if (playerIds.length === 0) return [];
  const { data: completions } = await admin
    .from('completed_scenarios')
    .select('player_id, rating')
    .in('player_id', playerIds);
  const ratingsByPlayer: Record<string, string[]> = {};
  for (const c of completions ?? []) {
    (ratingsByPlayer[c.player_id] ??= []).push(c.rating);
  }
  return data.map((r) => ({
    player_id: r.player_id,
    display_name: r.display_name,
    total_score: r.total_score,
    scenarios_completed: r.scenarios_completed,
    level: r.level,
    best_rating: bestRating(ratingsByPlayer[r.player_id] ?? []),
    updated_at: r.updated_at,
  }));
}
```

- [ ] **Step 4: Run tests — expect PASS (2 new + prior = 365 total)**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/queries-v2.ts lib/admin/__tests__/queries-v2.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): Phase 4 player queries — journey, summary, enriched players, enriched leaderboard

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `parseJourney` transform (TDD)

**Files:**
- Create: `lib/admin/player/parseJourney.ts`
- Create: `lib/admin/player/__tests__/parseJourney.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { parseJourney } from '@/lib/admin/player/parseJourney';
import type { PlayerJourneyEvent } from '@/lib/admin/types-v2';

const ev = (
  event_type: string,
  day_id: string | null,
  created_at: string,
  event_data: Record<string, unknown> = {},
): PlayerJourneyEvent => ({ event_type, event_data, scenario_id: 'car-dealership', day_id, created_at });

describe('parseJourney', () => {
  it('returns empty journey for empty input', () => {
    expect(parseJourney([])).toEqual({
      days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null,
    });
  });

  it('groups events by day_id and detects completed/failed/in_progress', () => {
    const events: PlayerJourneyEvent[] = [
      ev('game_started', null, '2026-04-10T10:00:00Z'),
      ev('day_started', 'day1', '2026-04-10T10:01:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:02:00Z', { thinking_time_ms: 4000 }),
      ev('day_completed', 'day1', '2026-04-10T10:05:00Z'),
      ev('day_started', 'day2', '2026-04-10T10:06:00Z'),
      ev('choice_made', 'day2', '2026-04-10T10:07:00Z', { thinking_time_ms: 8000 }),
      ev('day_failed', 'day2', '2026-04-10T10:09:00Z'),
      ev('day_started', 'day3', '2026-04-10T10:10:00Z'),
      ev('choice_made', 'day3', '2026-04-10T10:11:00Z', { thinking_time_ms: 6000 }),
    ];
    const j = parseJourney(events);
    expect(j.totalEvents).toBe(9);
    expect(j.firstSeenAt).toBe('2026-04-10T10:00:00Z');
    expect(j.lastSeenAt).toBe('2026-04-10T10:11:00Z');
    expect(j.days.map((d) => d.day_id)).toEqual(['day1', 'day2', 'day3']);
    expect(j.days[0].outcome).toBe('completed');
    expect(j.days[1].outcome).toBe('failed');
    expect(j.days[2].outcome).toBe('in_progress');
  });

  it('counts choices, back navigations, and total thinking time', () => {
    const events: PlayerJourneyEvent[] = [
      ev('day_started', 'day1', '2026-04-10T10:00:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:01:00Z', { thinking_time_ms: 3000 }),
      ev('back_navigation', 'day1', '2026-04-10T10:02:00Z'),
      ev('choice_made', 'day1', '2026-04-10T10:03:00Z', { thinking_time_ms: 5000 }),
      ev('day_completed', 'day1', '2026-04-10T10:04:00Z'),
    ];
    const j = parseJourney(events);
    expect(j.days[0].choices_made).toBe(2);
    expect(j.days[0].back_navigations).toBe(1);
    expect(j.days[0].total_thinking_time_ms).toBe(8000);
  });

  it('counts sessions as distinct game_started events', () => {
    const events: PlayerJourneyEvent[] = [
      ev('game_started', null, '2026-04-10T10:00:00Z'),
      ev('game_started', null, '2026-04-11T09:00:00Z'),
      ev('game_started', null, '2026-04-12T15:00:00Z'),
    ];
    expect(parseJourney(events).totalSessions).toBe(3);
  });

  it('marks day with no day_started but events as dropped', () => {
    // edge case: events on day_id without explicit day_started — rare but possible
    const events: PlayerJourneyEvent[] = [
      ev('choice_made', 'day1', '2026-04-10T10:01:00Z'),
    ];
    const j = parseJourney(events);
    expect(j.days[0].outcome).toBe('in_progress');
    expect(j.days[0].started_at).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/player/__tests__/parseJourney.test.ts
```

- [ ] **Step 3: Implement `lib/admin/player/parseJourney.ts`**

```typescript
import type { PlayerJourneyEvent, ParsedJourney, ParsedJourneyDay } from '@/lib/admin/types-v2';

/**
 * Group raw event timeline by day_id and classify each day's outcome.
 * Sessions = distinct `game_started` events.
 *
 * Outcomes:
 *   - completed   : has `day_completed`
 *   - failed      : has `day_failed`
 *   - in_progress : has `day_started` but no resolution
 *   - dropped     : has events but no `day_started` (orphaned activity)
 */
export function parseJourney(events: PlayerJourneyEvent[]): ParsedJourney {
  if (events.length === 0) {
    return { days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null };
  }

  // Sort by time defensively (RPC orders by created_at asc, but be safe)
  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const dayMap = new Map<string, ParsedJourneyDay>();
  let totalSessions = 0;

  for (const e of sorted) {
    if (e.event_type === 'game_started') totalSessions += 1;
    if (e.day_id == null) continue;

    if (!dayMap.has(e.day_id)) {
      dayMap.set(e.day_id, {
        day_id: e.day_id,
        scenario_id: e.scenario_id,
        events: [],
        started_at: null,
        completed_at: null,
        outcome: 'in_progress',
        choices_made: 0,
        back_navigations: 0,
        total_thinking_time_ms: 0,
      });
    }
    const day = dayMap.get(e.day_id)!;
    day.events.push(e);

    switch (e.event_type) {
      case 'day_started':
        day.started_at = e.created_at;
        break;
      case 'day_completed':
        day.completed_at = e.created_at;
        day.outcome = 'completed';
        break;
      case 'day_failed':
        day.completed_at = e.created_at;
        day.outcome = 'failed';
        break;
      case 'choice_made': {
        day.choices_made += 1;
        const tt = (e.event_data as { thinking_time_ms?: number }).thinking_time_ms;
        if (typeof tt === 'number') day.total_thinking_time_ms += tt;
        break;
      }
      case 'back_navigation':
        day.back_navigations += 1;
        break;
    }
  }

  const days = Array.from(dayMap.values()).sort((a, b) => a.day_id.localeCompare(b.day_id));

  return {
    days,
    totalEvents: sorted.length,
    totalSessions,
    firstSeenAt: sorted[0].created_at,
    lastSeenAt: sorted[sorted.length - 1].created_at,
  };
}
```

- [ ] **Step 4: Run — expect PASS (5 tests)**

```bash
npx vitest run lib/admin/player/__tests__/parseJourney.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/player/parseJourney.ts lib/admin/player/__tests__/parseJourney.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): parseJourney — events → grouped days with outcome classification

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `deriveStrengthsWeaknesses` transform (TDD)

**Files:**
- Create: `lib/admin/player/deriveStrengthsWeaknesses.ts`
- Create: `lib/admin/player/__tests__/deriveStrengthsWeaknesses.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { deriveStrengthsWeaknesses } from '@/lib/admin/player/deriveStrengthsWeaknesses';
import type { ParsedJourney, CompletedDay } from '@/lib/admin/types-v2';

function emptyJourney(): ParsedJourney {
  return { days: [], totalEvents: 0, totalSessions: 0, firstSeenAt: null, lastSeenAt: null };
}

describe('deriveStrengthsWeaknesses', () => {
  it('returns "pass" when no completions', () => {
    const out = deriveStrengthsWeaknesses(emptyJourney(), []);
    expect(out.recommendation).toBe('pass');
    expect(out.strengths).toEqual([]);
    expect(out.weaknesses.length).toBeGreaterThan(0);
  });

  it('flags fast clicker (avg thinking < 2s) as weakness', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 3,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'completed', choices_made: 5, back_navigations: 0, total_thinking_time_ms: 6_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 70, rating: 'B', time_taken: 300, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.weaknesses.some((w) => /быстро|спеш|внимат/i.test(w))).toBe(true);
  });

  it('flags many back navigations as weakness', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 4,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: null,
        outcome: 'in_progress', choices_made: 5, back_navigations: 4, total_thinking_time_ms: 30_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, []);
    expect(out.weaknesses.some((w) => /назад|сомнев/i.test(w))).toBe(true);
  });

  it('hire when at least one S or A across days completed', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 10,
      days: [
        { day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z', outcome: 'completed', choices_made: 5, back_navigations: 0, total_thinking_time_ms: 40_000 },
        { day_id: 'day2', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:15:00Z', outcome: 'completed', choices_made: 6, back_navigations: 0, total_thinking_time_ms: 60_000 },
      ],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 90, rating: 'A', time_taken: 400, completed_at: '2026-04-10T10:05:00Z' },
      { scenario_id: 's', day_id: 'day2', score: 95, rating: 'S', time_taken: 500, completed_at: '2026-04-10T10:15:00Z' },
    ]);
    expect(out.recommendation).toBe('hire');
    expect(out.strengths.length).toBeGreaterThan(0);
  });

  it('train when at least one B completion + no failures', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 6,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'completed', choices_made: 4, back_navigations: 1, total_thinking_time_ms: 30_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 60, rating: 'B', time_taken: 300, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.recommendation).toBe('train');
  });

  it('pass when only F or all failed', () => {
    const journey: ParsedJourney = {
      ...emptyJourney(),
      totalEvents: 3,
      days: [{
        day_id: 'day1', scenario_id: 's', events: [], started_at: null, completed_at: '2026-04-10T10:05:00Z',
        outcome: 'failed', choices_made: 3, back_navigations: 0, total_thinking_time_ms: 10_000,
      }],
    };
    const out = deriveStrengthsWeaknesses(journey, [
      { scenario_id: 's', day_id: 'day1', score: 20, rating: 'F', time_taken: 200, completed_at: '2026-04-10T10:05:00Z' },
    ]);
    expect(out.recommendation).toBe('pass');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/player/__tests__/deriveStrengthsWeaknesses.test.ts
```

- [ ] **Step 3: Implement `lib/admin/player/deriveStrengthsWeaknesses.ts`**

```typescript
import type { ParsedJourney, CompletedDay, PlayerStrengthsWeaknesses } from '@/lib/admin/types-v2';

const FAST_CLICKER_MS = 2_000;
const SLOW_THINKER_MS = 25_000;

/**
 * Derives qualitative strengths/weaknesses from a parsed journey + completion
 * history. Recommendation tiers:
 *   - hire  : at least one S or A across completed days
 *   - train : at least one B completion AND no failures
 *   - pass  : only F or all-failed (default for empty/no-completion data)
 */
export function deriveStrengthsWeaknesses(
  journey: ParsedJourney,
  completions: CompletedDay[],
): PlayerStrengthsWeaknesses {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (completions.length === 0 && journey.days.length === 0) {
    weaknesses.push('Нет завершённых дней — недостаточно данных для оценки');
    return { strengths, weaknesses, recommendation: 'pass', recommendationReason: 'Нет данных' };
  }

  // Aggregate metrics across all played days
  let totalChoices = 0;
  let totalThinking = 0;
  let totalBack = 0;
  for (const d of journey.days) {
    totalChoices += d.choices_made;
    totalThinking += d.total_thinking_time_ms;
    totalBack += d.back_navigations;
  }
  const avgThinking = totalChoices > 0 ? totalThinking / totalChoices : 0;

  // Pattern detection
  if (avgThinking > 0 && avgThinking < FAST_CLICKER_MS) {
    weaknesses.push('Слишком быстро принимает решения — не вчитывается в детали');
  }
  if (avgThinking > SLOW_THINKER_MS) {
    weaknesses.push('Долго сомневается на каждом выборе — может быть неуверенным');
  }
  if (totalBack >= 3) {
    weaknesses.push('Часто возвращается назад — сомневается в выборах');
  }
  if (avgThinking >= 5_000 && avgThinking <= 15_000) {
    strengths.push('Принимает решения вдумчиво и в темпе диалога');
  }
  if (journey.totalSessions > 1) {
    strengths.push(`Возвращается в игру (${journey.totalSessions} сессий) — высокая мотивация`);
  }

  // Rating-based signals
  const ratings = completions.map((c) => c.rating);
  const hasTopRating = ratings.includes('S') || ratings.includes('A');
  const hasMidRating = ratings.includes('B');
  const onlyFails = ratings.length > 0 && ratings.every((r) => r === 'F');
  const anyFailure = journey.days.some((d) => d.outcome === 'failed');

  if (hasTopRating) {
    strengths.push(`Получил высокую оценку (${ratings.includes('S') ? 'S' : 'A'}) — отличный продавец`);
  }
  if (completions.every((c) => c.score >= 80) && completions.length > 0) {
    strengths.push('Стабильно высокий счёт во всех днях');
  }
  if (anyFailure) {
    weaknesses.push('Провалил минимум один день — нужна работа над ошибками');
  }

  // Recommendation tier
  let recommendation: 'hire' | 'train' | 'pass';
  let recommendationReason: string;
  if (hasTopRating) {
    recommendation = 'hire';
    recommendationReason = 'Высокая оценка показывает готового продавца — связаться в течение 24 часов';
  } else if (hasMidRating && !onlyFails) {
    recommendation = 'train';
    recommendationReason = 'Базовые навыки есть, но требуется обучение — пригласить на собеседование';
  } else {
    recommendation = 'pass';
    recommendationReason = onlyFails
      ? 'Низкие оценки во всех днях'
      : 'Недостаточно завершённых дней или слабые показатели';
  }

  return { strengths, weaknesses, recommendation, recommendationReason };
}
```

- [ ] **Step 4: Run — expect PASS (6 tests)**

```bash
npx vitest run lib/admin/player/__tests__/deriveStrengthsWeaknesses.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/player/deriveStrengthsWeaknesses.ts lib/admin/player/__tests__/deriveStrengthsWeaknesses.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): deriveStrengthsWeaknesses — pattern-based hire/train/pass tier

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `RatingBadge` component

**Files:**
- Create: `components/admin/RatingBadge.tsx`

```typescript
'use client';

const COLORS: Record<string, { bg: string; color: string }> = {
  S: { bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', color: '#92400e' },
  A: { bg: '#dcfce7', color: '#065f46' },
  B: { bg: '#dbeafe', color: '#1e40af' },
  C: { bg: '#fee2e2', color: '#991b1b' },
  F: { bg: '#f3f4f6', color: '#6b7280' },
};

export interface RatingBadgeProps {
  rating: string | null;
  size?: 'sm' | 'md';
}

export default function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  if (!rating) {
    return (
      <span style={{
        display: 'inline-block', padding: size === 'sm' ? '2px 8px' : '4px 10px',
        background: '#f1f5f9', color: '#94a3b8',
        borderRadius: 999, fontSize: size === 'sm' ? 10 : 12, fontWeight: 700,
      }}>
        —
      </span>
    );
  }
  const { bg, color } = COLORS[rating] ?? COLORS.F;
  return (
    <span style={{
      display: 'inline-block', padding: size === 'sm' ? '2px 8px' : '4px 10px',
      background: bg, color,
      borderRadius: 999, fontSize: size === 'sm' ? 10 : 12, fontWeight: 800,
      letterSpacing: 0.5,
    }}>
      {rating}
    </span>
  );
}
```

- [ ] **Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/RatingBadge.tsx
git commit -m "$(cat <<'EOF'
feat(admin): RatingBadge — colored S/A/B/C/F pill

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `Timeline` component

**Files:**
- Create: `components/admin/Timeline.tsx`

```typescript
'use client';

import type { ReactNode } from 'react';

export type TimelineTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<TimelineTone, { dotBg: string; dotRing: string }> = {
  info:    { dotBg: '#3b82f6', dotRing: '#dbeafe' },
  success: { dotBg: '#22c55e', dotRing: '#dcfce7' },
  warning: { dotBg: '#f59e0b', dotRing: '#fef3c7' },
  danger:  { dotBg: '#ef4444', dotRing: '#fee2e2' },
  neutral: { dotBg: '#94a3b8', dotRing: '#f1f5f9' },
};

export interface TimelineItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;       // small subtitle (e.g. "+10 очков · 4с")
  timestamp: string;      // pre-formatted (e.g. "14:33:51")
  tone?: TimelineTone;
}

export interface TimelineProps {
  items: TimelineItem[];
  emptyText?: string;
}

export default function Timeline({ items, emptyText = 'Нет событий' }: TimelineProps) {
  if (items.length === 0) {
    return <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>{emptyText}</div>;
  }
  return (
    <div style={{ position: 'relative', paddingLeft: 20 }}>
      <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
      {items.map((item) => {
        const tone = TONES[item.tone ?? 'neutral'];
        return (
          <div key={item.id} style={{ position: 'relative', padding: '8px 0' }}>
            <div
              style={{
                position: 'absolute', left: -19, top: 11,
                width: 14, height: 14, borderRadius: '50%',
                background: tone.dotBg,
                border: `3px solid ${tone.dotRing}`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>
                  {item.title}
                </div>
                {item.meta && (
                  <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                    {item.meta}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 9, color: 'var(--admin-text-dim)', whiteSpace: 'nowrap' }}>
                {item.timestamp}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/Timeline.tsx
git commit -m "$(cat <<'EOF'
feat(admin): Timeline — chronological event list with tone-coded dots

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `PlayerProfile` component

**Files:**
- Create: `components/admin/PlayerProfile.tsx`

```typescript
'use client';

import { Phone, MessageCircle, PlayCircle } from 'lucide-react';
import RatingBadge from './RatingBadge';
import type { PlayerSummary } from '@/lib/admin/types-v2';

export interface PlayerProfileProps {
  player: PlayerSummary;
  bestRating: string | null;
  daysCompleted: number;
  totalSessions: number;
  onReplay?: () => void;
}

function maskPhone(phone: string): string {
  // +998 90 *** ** 67 style — keep last 2 digits
  if (phone.length < 6) return phone;
  return `${phone.slice(0, phone.length - 6)} *** ** ${phone.slice(-2)}`;
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent('Здравствуйте! Заметил вас в Sales School.')}`;
}

function telegramLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://t.me/+${digits}`;
}

export default function PlayerProfile({
  player, bestRating, daysCompleted, totalSessions, onReplay,
}: PlayerProfileProps) {
  return (
    <div className="admin-card" style={{ padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, color: '#fff',
        }}>
          {player.display_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)' }}>
              {player.display_name}
            </div>
            <RatingBadge rating={bestRating} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>
            {maskPhone(player.phone)} · UTM: {player.utm_source ?? '(прямой)'}
            {player.utm_campaign && ` / ${player.utm_campaign}`}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--admin-text)' }}>
            <span>⏱️ Сессий: <strong>{totalSessions}</strong></span>
            <span>🎮 Дней пройдено: <strong>{daysCompleted}</strong></span>
            <span>⭐ Очков: <strong>{player.total_score.toLocaleString('ru-RU')}</strong></span>
            <span>🪙 Монет: <strong>{player.coins}</strong></span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a
            href={whatsappLink(player.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#25d366', color: '#fff', borderColor: 'transparent' }}
          >
            <Phone size={14} /> WhatsApp
          </a>
          <a
            href={telegramLink(player.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#0088cc', color: '#fff', borderColor: 'transparent' }}
          >
            <MessageCircle size={14} /> Telegram
          </a>
          {onReplay && (
            <button onClick={onReplay} className="admin-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              <PlayCircle size={14} /> Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/PlayerProfile.tsx
git commit -m "$(cat <<'EOF'
feat(admin): PlayerProfile — header card with avatar, rating, contact buttons

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `PerDayBars` component

**Files:**
- Create: `components/admin/charts/PerDayBars.tsx`

```typescript
'use client';

import RatingBadge from '@/components/admin/RatingBadge';
import type { CompletedDay } from '@/lib/admin/types-v2';

export interface PerDayBarsProps {
  days: CompletedDay[];
  maxDays?: number;
}

const TARGET_SCORE = 100;

export default function PerDayBars({ days, maxDays = 5 }: PerDayBarsProps) {
  const slots = Array.from({ length: maxDays }, (_, i) => `day${i + 1}`);
  const byDay = new Map(days.map((d) => [d.day_id, d]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {slots.map((dayId) => {
        const d = byDay.get(dayId);
        const widthPct = d ? Math.min(100, (d.score / TARGET_SCORE) * 100) : 0;
        const color = d
          ? d.rating === 'S' ? '#f59e0b'
          : d.rating === 'A' ? '#10b981'
          : d.rating === 'B' ? '#3b82f6'
          : d.rating === 'C' ? '#fb923c'
          : '#ef4444'
          : '#94a3b8';
        return (
          <div key={dayId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 60, fontSize: 11, color: 'var(--admin-text-muted)' }}>
              {dayId.replace('day', 'День ')}
            </div>
            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${widthPct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
            </div>
            <div style={{ width: 90, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
              {d ? (
                <>
                  <span style={{ fontSize: 11, color: 'var(--admin-text)', fontWeight: 600 }}>{d.score}</span>
                  <RatingBadge rating={d.rating} size="sm" />
                </>
              ) : (
                <span style={{ fontSize: 10, color: 'var(--admin-text-dim)' }}>не начат</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/PerDayBars.tsx
git commit -m "$(cat <<'EOF'
feat(admin): PerDayBars — per-day score bar with rating badge

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `MedalBadge` component

**Files:**
- Create: `components/admin/charts/MedalBadge.tsx`

```typescript
'use client';

const MEDAL: Record<number, { bg: string; ring: string; emoji: string }> = {
  1: { bg: 'linear-gradient(135deg,#fde047,#facc15)', ring: '#ca8a04', emoji: '🥇' },
  2: { bg: 'linear-gradient(135deg,#e5e7eb,#d1d5db)', ring: '#9ca3af', emoji: '🥈' },
  3: { bg: 'linear-gradient(135deg,#fed7aa,#fdba74)', ring: '#c2410c', emoji: '🥉' },
};

export interface MedalBadgeProps {
  rank: number;
}

export default function MedalBadge({ rank }: MedalBadgeProps) {
  if (rank > 3) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '50%',
        background: '#f1f5f9', color: 'var(--admin-text-muted)',
        fontSize: 12, fontWeight: 700,
      }}>
        {rank}
      </span>
    );
  }
  const { bg, ring, emoji } = MEDAL[rank];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%',
      background: bg, border: `2px solid ${ring}`,
      fontSize: 16,
    }}>
      {emoji}
    </span>
  );
}
```

- [ ] **Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/MedalBadge.tsx
git commit -m "$(cat <<'EOF'
feat(admin): MedalBadge — gold/silver/bronze + rank number for leaderboard

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `/admin/participants` (REWRITE)

**Files:**
- Modify (REPLACE): `app/(admin)/admin/participants/page.tsx`
- Create: `app/(admin)/admin/participants/ParticipantsClient.tsx`

- [ ] **Step 1: Server `page.tsx`**

```typescript
import { Suspense } from 'react';
import ParticipantsClient from './ParticipantsClient';

export const revalidate = 60;
export const metadata = { title: 'Participants — Sales School' };

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <ParticipantsClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import RatingBadge from '@/components/admin/RatingBadge';
import { getPlayersEnriched } from '@/lib/admin/queries-v2';
import type { EnrichedPlayer } from '@/lib/admin/types-v2';

const RATINGS = ['S', 'A', 'B', 'C', 'F'] as const;

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, phone.length - 6)} *** ** ${phone.slice(-2)}`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} д назад`;
}

export default function ParticipantsClient() {
  const [players, setPlayers] = useState<EnrichedPlayer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPlayersEnriched({ search: search || undefined, ratingFilter, limit: 100 }).then((res) => {
      if (cancelled) return;
      setPlayers(res.players); setTotal(res.total); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [search, ratingFilter]);

  return (
    <div>
      <PageHeader
        title="Participants"
        subtitle="Все игроки с фильтрами и быстрым переходом к индивидуальному пути."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего игроков" value={total.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard
          label="С оценкой S/A"
          value={players.filter((p) => p.best_rating === 'S' || p.best_rating === 'A').length}
          accent="green"
        />
        <KpiCard label="Завершили день 1" value={players.filter((p) => p.days_completed >= 1).length} accent="pink" />
        <KpiCard label="На странице" value={players.length} accent="orange" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону…"
          className="admin-btn"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px' }}
        />
        <button
          onClick={() => setRatingFilter(null)}
          className={ratingFilter === null ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        >
          Все
        </button>
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() => setRatingFilter(r)}
            className={ratingFilter === r ? 'admin-btn admin-btn-primary' : 'admin-btn'}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
        ) : players.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Игроки не найдены.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: '#fafaff' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Имя</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Телефон</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Очки</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Дней</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>UTM</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Активность</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <Link href={`/admin/player/${p.id}`} style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {p.display_name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace' }}>{maskPhone(p.phone)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><RatingBadge rating={p.best_rating} size="sm" /></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{p.total_score.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{p.days_completed}/3</td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>
                    {p.utm_source ?? '(прямой)'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>{formatRelative(p.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/participants/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/participants — Premium rewrite + rating filter + click→Player Journey

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `/admin/player/[playerId]` (NEW)

**Files:**
- Create: `app/(admin)/admin/player/[playerId]/page.tsx`
- Create: `app/(admin)/admin/player/[playerId]/PlayerClient.tsx`

- [ ] **Step 1: Server `page.tsx`**

Note: In Next.js 16 App Router, dynamic route params are passed as a Promise. Use `await params` (or React's `use()` in a client component).

```typescript
import { Suspense } from 'react';
import PlayerClient from './PlayerClient';

export const revalidate = 30;
export const metadata = { title: 'Player Journey — Sales School' };

interface Props {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerJourneyPage({ params }: Props) {
  const { playerId } = await params;
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <PlayerClient playerId={playerId} />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import PlayerProfile from '@/components/admin/PlayerProfile';
import Timeline, { type TimelineItem, type TimelineTone } from '@/components/admin/Timeline';
import PerDayBars from '@/components/admin/charts/PerDayBars';
import InsightCard from '@/components/admin/InsightCard';
import { getPlayerSummary, getPlayerJourneyData, getCompletedDaysForPlayer } from '@/lib/admin/queries-v2';
import { parseJourney } from '@/lib/admin/player/parseJourney';
import { deriveStrengthsWeaknesses } from '@/lib/admin/player/deriveStrengthsWeaknesses';
import type { PlayerSummary, PlayerJourneyEvent, CompletedDay } from '@/lib/admin/types-v2';

export interface PlayerClientProps {
  playerId: string;
}

const EVENT_TONE: Record<string, TimelineTone> = {
  game_started: 'success',
  day_started: 'info',
  day_completed: 'success',
  day_failed: 'danger',
  choice_made: 'success',
  back_navigation: 'warning',
  dialogue_reread: 'warning',
  dropped_off: 'danger',
  game_completed: 'success',
  achievement_unlocked: 'success',
  node_entered: 'neutral',
  node_exited: 'neutral',
  heartbeat: 'neutral',
  idle_detected: 'warning',
};

const EVENT_LABEL: Record<string, string> = {
  game_started: 'Игра запущена',
  day_started: 'День начат',
  day_completed: 'День завершён',
  day_failed: 'День провален',
  choice_made: 'Выбор',
  back_navigation: 'Шаг назад',
  dialogue_reread: 'Перечитал диалог',
  dropped_off: 'Покинул игру',
  game_completed: 'Игра завершена',
  achievement_unlocked: 'Получил достижение',
  node_entered: 'Перешёл на узел',
  node_exited: 'Покинул узел',
  heartbeat: 'Активен',
  idle_detected: 'Бездействие',
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function eventToTimelineItem(e: PlayerJourneyEvent, idx: number): TimelineItem {
  const data = e.event_data;
  let title: string = EVENT_LABEL[e.event_type] ?? e.event_type;
  let meta: string | null = null;
  if (e.event_type === 'choice_made') {
    const nodeId = (data as { node_id?: string }).node_id;
    const tt = (data as { thinking_time_ms?: number }).thinking_time_ms;
    title = `Выбор на узле ${nodeId ?? '?'}`;
    if (tt) meta = `Время на размышление: ${(tt / 1000).toFixed(1)}с`;
  } else if (e.event_type === 'day_completed' || e.event_type === 'day_failed') {
    title = `${EVENT_LABEL[e.event_type]} (${e.day_id ?? ''})`;
  } else if (e.event_type === 'back_navigation') {
    const from = (data as { from_node_id?: string }).from_node_id;
    const to = (data as { to_node_id?: string }).to_node_id;
    title = `Шаг назад: ${from ?? '?'} → ${to ?? '?'}`;
  } else if (e.day_id) {
    meta = `день ${e.day_id}`;
  }
  return {
    id: `${idx}-${e.event_type}-${e.created_at}`,
    title,
    meta,
    timestamp: fmtTime(e.created_at),
    tone: EVENT_TONE[e.event_type] ?? 'neutral',
  };
}

export default function PlayerClient({ playerId }: PlayerClientProps) {
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [events, setEvents] = useState<PlayerJourneyEvent[]>([]);
  const [completed, setCompleted] = useState<CompletedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setNotFound(false);
    Promise.all([
      getPlayerSummary(playerId),
      getPlayerJourneyData(playerId),
      getCompletedDaysForPlayer(playerId),
    ]).then(([p, e, c]) => {
      if (cancelled) return;
      if (!p) setNotFound(true);
      setPlayer(p); setEvents(e); setCompleted(c); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [playerId]);

  const journey = useMemo(() => parseJourney(events), [events]);
  const insight = useMemo(
    () => player ? deriveStrengthsWeaknesses(journey, completed) : null,
    [journey, completed, player],
  );
  const bestRating = useMemo(() => {
    if (completed.length === 0) return null;
    const order: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, F: 5 };
    return [...completed].map((c) => c.rating).sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))[0];
  }, [completed]);

  const items = useMemo(
    () => events.map((e, i) => eventToTimelineItem(e, i)),
    [events],
  );

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>;
  }
  if (notFound || !player) {
    return (
      <div>
        <PageHeader title="Игрок не найден" subtitle={`ID: ${playerId}`} />
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
          Этот игрок не существует или был удалён.
        </div>
      </div>
    );
  }

  const recommendationTone = insight?.recommendation === 'hire'
    ? 'success' : insight?.recommendation === 'train' ? 'warning' : 'danger';
  const recommendationTitle = insight?.recommendation === 'hire'
    ? 'Связаться в течение 24 часов'
    : insight?.recommendation === 'train' ? 'Пригласить на обучение' : 'Пропустить';

  return (
    <div>
      <PageHeader
        title="Player Journey"
        subtitle={`ID: ${player.id}`}
      />

      <PlayerProfile
        player={player}
        bestRating={bestRating}
        daysCompleted={completed.length}
        totalSessions={journey.totalSessions}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
        <div className="admin-card" style={{ padding: 16, maxHeight: 600, overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            Полный таймлайн ({journey.totalEvents} событий)
          </div>
          <Timeline items={items} emptyText="Нет событий — игрок не начинал игру." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
              Прогресс по дням
            </div>
            <PerDayBars days={completed} />
          </div>

          {insight && (insight.strengths.length > 0 || insight.weaknesses.length > 0) && (
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
                Сильные / слабые стороны
              </div>
              {insight.strengths.map((s, i) => (
                <div key={`s-${i}`} style={{ fontSize: 11, color: 'var(--admin-accent-success)', margin: '4px 0' }}>
                  ✓ {s}
                </div>
              ))}
              {insight.weaknesses.map((w, i) => (
                <div key={`w-${i}`} style={{ fontSize: 11, color: 'var(--admin-accent-warn)', margin: '4px 0' }}>
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}

          {insight && (
            <InsightCard
              tone={recommendationTone}
              title={`🎯 ${recommendationTitle}`}
              body={insight.recommendationReason}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/player/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/player/[playerId] — full journey + analysis + HR recommendation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `/admin/leaderboard` (REWRITE)

**Files:**
- Modify (REPLACE): `app/(admin)/admin/leaderboard/page.tsx`
- Create: `app/(admin)/admin/leaderboard/LeaderboardClient.tsx`

- [ ] **Step 1: Server**

```typescript
import { Suspense } from 'react';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 30;
export const metadata = { title: 'Leaderboard — Sales School' };

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <LeaderboardClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import RatingBadge from '@/components/admin/RatingBadge';
import MedalBadge from '@/components/admin/charts/MedalBadge';
import { getLeaderboardEnriched, type LeaderboardItem } from '@/lib/admin/queries-v2';

export default function LeaderboardClient() {
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLeaderboardEnriched(50).then((r) => {
      if (cancelled) return;
      setRows(r); setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const topScore = rows[0]?.total_score ?? 0;
  const totalCompletions = rows.reduce((acc, r) => acc + r.scenarios_completed, 0);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Топ игроков по очкам — обновляется в реальном времени."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Игроков в топе" value={rows.length} accent="violet" />
        <KpiCard label="Лидер" value={topScore.toLocaleString('ru-RU') + ' очков'} accent="orange" />
        <KpiCard label="Всего прохождений" value={totalCompletions.toLocaleString('ru-RU')} accent="green" />
      </div>

      {top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {top3.map((r, i) => (
            <div key={r.player_id} className="admin-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <MedalBadge rank={i + 1} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>
                <Link href={`/admin/player/${r.player_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {r.display_name}
                </Link>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-accent)', marginBottom: 4 }}>
                {r.total_score.toLocaleString('ru-RU')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                Уровень {r.level} · {r.scenarios_completed} прохождений
              </div>
              <div style={{ marginTop: 8 }}>
                <RatingBadge rating={r.best_rating} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
        ) : rest.length === 0 && top3.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Лидерборд пуст — пока никто не играл.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: '#fafaff' }}>
                <th style={{ width: 60, textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Игрок</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Очки</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Уровень</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Прохожд.</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((r, i) => (
                <tr key={r.player_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <MedalBadge rank={i + 4} />
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <Link href={`/admin/player/${r.player_id}`} style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {r.display_name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <RatingBadge rating={r.best_rating} size="sm" />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{r.total_score.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.level}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.scenarios_completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/leaderboard/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/leaderboard — Premium rewrite with top-3 podium + medals

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final verification

- [ ] **Step 1: Type check + tests + build**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit && npm test && npm run build
```

Expected: TS clean, ~376 tests passing (363 + 2 queries + 5 parseJourney + 6 deriveStrengths = 376), build succeeds.

- [ ] **Step 2: Dev server smoke**

```bash
npm run dev
```

In a browser:
- http://localhost:3000/admin/participants — table with rating filter; click a row → goes to Player Journey
- http://localhost:3000/admin/player/{some-uuid} — full timeline + per-day bars + recommendation
- http://localhost:3000/admin/leaderboard — top-3 podium + ranked table with medals
- WhatsApp/Telegram contact buttons open external apps

- [ ] **Step 3: No code commit needed for verification**

If issues found, fix in follow-up commit before closing Phase 4.

---

## Verification Summary (end of Phase 4)

1. `npm test` — all tests pass (~376).
2. `npm run build` — production build succeeds; new dynamic route `/admin/player/[playerId]` listed.
3. `/admin/participants`, `/admin/player/[id]`, `/admin/leaderboard` are all functional.
4. Click flow: Participants row → Player Journey → contact buttons fire external links.
5. Phase 1-3 routes still functional.
6. Empty-data states show friendly placeholders, not crashes.

## Out of scope (deferred)

- Replay (animated playthrough) — Phase 6.
- Bulk operations (select multiple players → mark "to contact") — Phase 6.
- CSV export from Participants — already exists in legacy `/api/admin/export`, can be wired up later.
- Real-time leaderboard via Supabase Realtime — Phase 5.
- Profile page edits / notes / HR custom tags — Phase 6.
