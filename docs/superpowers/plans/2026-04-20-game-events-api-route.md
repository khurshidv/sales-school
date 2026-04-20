# Game Events API Route — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the missing-analytics pipeline. Move client-side `game_events` and `offer_events` inserts from direct anon-key Supabase writes to validated server-side API routes using `service_role`. Keep RLS on both tables fail-closed.

**Architecture:** Two new Next.js App Router POST endpoints (`/api/game/events` and `/api/game/offer-events`) accept batched events, validate shape + enum membership + size limits, then insert via `createAdminClient()` (bypasses RLS). Browser helpers (`lib/game/analytics.ts`, `lib/game/offerEvents.ts`) swap `.insert()` calls for `fetch()` — and `navigator.sendBeacon()` on `pagehide`/`visibilitychange=hidden` so events survive unload on mobile Safari.

**Tech Stack:** Next.js 16 App Router, Supabase JS (`service_role`), Vitest 4, manual payload validation (no new deps).

---

## Context for the engineer

**Why this plan exists.** During the dashboard metrics audit on 2026-04-20 we confirmed `game_events` table is empty (0 rows) despite 40 completed scenarios and 11 players. Root cause: `game_events` has RLS enabled since migration `001_initial_schema.sql` but **no INSERT policy for anon**. Every client-side `.insert()` call has silently failed since launch. `offer_events` has a policy but reads all anon input unvalidated — same class of risk.

**Why not just add an anon INSERT policy.** User explicitly chose the best-practice path (Supabase docs + OWASP A07: validate on server boundary). Matches the codebase's own Phase 7 precedent where admin client-side queries were refactored to go through `/api/admin/*` API routes for the same reason (RLS + validation at boundary).

**Out of scope** (separate decisions):
- Historical backfill of `game_events` from `completed_scenarios` (FIX 4 — not decided yet).
- Rate limiting via Redis/Upstash (distributed; add as followup once we have noise).
- Admin realtime `SELECT` policy for `game_events` live-feed (separate concern — admin session needs elevated role).
- UI label tweaks / Russian translations (done on per-page basis during the ongoing audit).

**Assumptions the engineer needs.**
- `createAdminClient()` in `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, `import 'server-only';`). It bypasses RLS. The file is already marked `server-only` so importing it into a client file breaks the build — that is the guard.
- `GameEventType` enum in `lib/game/eventTypes.ts` is the source of truth for valid `event_type` values. Mirror it in the route.
- The existing analytics queue + debounce logic in `lib/game/analytics.ts` stays — only the flush transport changes.
- Existing tests live in `lib/game/__tests__/analytics.test.ts` and `lib/game/__tests__/offerEvents.test.ts`. They mock `createClient` from `@/lib/supabase/client`. We'll switch to mocking `fetch`.

---

## File structure

**Create:**
- `app/api/game/events/route.ts` — POST handler, zod-free manual validator, service-role insert
- `app/api/game/events/__tests__/route.test.ts` — unit test of POST handler
- `app/api/game/offer-events/route.ts` — same pattern for `offer_events`
- `app/api/game/offer-events/__tests__/route.test.ts` — unit test

**Modify:**
- `lib/game/analytics.ts:48-71` — replace `supabase.from('game_events').insert(batch)` with fetch/sendBeacon
- `lib/game/offerEvents.ts:26-33` — replace `.insert(row)` with fetch
- `lib/game/__tests__/analytics.test.ts` — re-mock target (`fetch`/`navigator.sendBeacon` instead of supabase client)
- `lib/game/__tests__/offerEvents.test.ts` — same

**Do not modify:**
- Supabase migrations (no new policy; RLS stays closed)
- `lib/supabase/admin.ts`, `lib/supabase/client.ts`
- Any admin page or query
- `lib/game/eventTypes.ts` (already correct)

---

## Task 1: Manual validator module for game events

**Files:**
- Create: `app/api/game/events/validate.ts`
- Test: `app/api/game/events/__tests__/validate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/game/events/__tests__/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validateEventsPayload } from '../validate';

describe('validateEventsPayload', () => {
  const valid = {
    events: [
      {
        player_id: '00000000-0000-0000-0000-000000000001',
        event_type: 'game_started',
        event_data: {},
        scenario_id: 'car-dealership',
        day_id: 'day1',
      },
    ],
  };

  it('accepts a valid batch', () => {
    const res = validateEventsPayload(valid);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.events).toHaveLength(1);
  });

  it('rejects non-object payload', () => {
    expect(validateEventsPayload(null).ok).toBe(false);
    expect(validateEventsPayload('nope' as unknown).ok).toBe(false);
  });

  it('rejects missing events array', () => {
    expect(validateEventsPayload({}).ok).toBe(false);
  });

  it('rejects empty events array', () => {
    expect(validateEventsPayload({ events: [] }).ok).toBe(false);
  });

  it('rejects batches larger than 100', () => {
    const big = { events: Array.from({ length: 101 }, () => valid.events[0]) };
    expect(validateEventsPayload(big).ok).toBe(false);
  });

  it('rejects invalid event_type', () => {
    const bad = { events: [{ ...valid.events[0], event_type: 'drop_tables' }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('rejects non-uuid player_id', () => {
    const bad = { events: [{ ...valid.events[0], player_id: 'abc' }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('allows null scenario_id and day_id', () => {
    const e = { ...valid.events[0], scenario_id: null, day_id: null };
    expect(validateEventsPayload({ events: [e] }).ok).toBe(true);
  });

  it('rejects event_data that is not a plain object', () => {
    const bad = { events: [{ ...valid.events[0], event_data: ['arr'] }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });

  it('clamps event_data to 8KB JSON', () => {
    const huge = { big: 'x'.repeat(10_000) };
    const bad = { events: [{ ...valid.events[0], event_data: huge }] };
    expect(validateEventsPayload(bad).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```
cd sales-school && npm run test -- app/api/game/events/__tests__/validate.test.ts
```
Expected: FAIL with "Cannot find module '../validate'"

- [ ] **Step 3: Implement the validator**

```ts
// app/api/game/events/validate.ts
import { ALL_GAME_EVENT_TYPES, type GameEventTypeValue } from '@/lib/game/eventTypes';

export interface ValidGameEvent {
  player_id: string;
  event_type: GameEventTypeValue;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
}

export type ValidationResult =
  | { ok: true; events: ValidGameEvent[] }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH = 100;
const MAX_EVENT_DATA_BYTES = 8 * 1024;
const EVENT_TYPES = new Set<string>(ALL_GAME_EVENT_TYPES);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateEventsPayload(body: unknown): ValidationResult {
  if (!isPlainObject(body)) return { ok: false, error: 'payload must be object' };
  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) return { ok: false, error: 'events must be array' };
  if (events.length === 0) return { ok: false, error: 'events empty' };
  if (events.length > MAX_BATCH) return { ok: false, error: `events > ${MAX_BATCH}` };

  const valid: ValidGameEvent[] = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!isPlainObject(e)) return { ok: false, error: `events[${i}] not object` };

    const player_id = e.player_id;
    if (typeof player_id !== 'string' || !UUID_RE.test(player_id)) {
      return { ok: false, error: `events[${i}].player_id invalid` };
    }
    const event_type = e.event_type;
    if (typeof event_type !== 'string' || !EVENT_TYPES.has(event_type)) {
      return { ok: false, error: `events[${i}].event_type invalid` };
    }
    const event_data = e.event_data ?? {};
    if (!isPlainObject(event_data)) {
      return { ok: false, error: `events[${i}].event_data invalid` };
    }
    if (JSON.stringify(event_data).length > MAX_EVENT_DATA_BYTES) {
      return { ok: false, error: `events[${i}].event_data too large` };
    }
    const scenario_id = e.scenario_id ?? null;
    if (scenario_id !== null && typeof scenario_id !== 'string') {
      return { ok: false, error: `events[${i}].scenario_id invalid` };
    }
    const day_id = e.day_id ?? null;
    if (day_id !== null && typeof day_id !== 'string') {
      return { ok: false, error: `events[${i}].day_id invalid` };
    }

    valid.push({
      player_id,
      event_type: event_type as GameEventTypeValue,
      event_data,
      scenario_id,
      day_id,
    });
  }
  return { ok: true, events: valid };
}
```

- [ ] **Step 4: Run test to verify it passes**

```
cd sales-school && npm run test -- app/api/game/events/__tests__/validate.test.ts
```
Expected: PASS (10/10 tests green)

- [ ] **Step 5: Commit**

```bash
git add sales-school/app/api/game/events/validate.ts sales-school/app/api/game/events/__tests__/validate.test.ts
git commit -m "feat(api): add game events payload validator"
```

---

## Task 2: POST /api/game/events route

**Files:**
- Create: `app/api/game/events/route.ts`
- Test: `app/api/game/events/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/game/events/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/game/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validEvent = {
  player_id: '00000000-0000-0000-0000-000000000001',
  event_type: 'game_started',
  event_data: {},
  scenario_id: 'car-dealership',
  day_id: 'day1',
};

describe('POST /api/game/events', () => {
  beforeEach(() => mockInsert.mockClear());

  it('inserts validated events with service role', async () => {
    const res = await POST(req({ events: [validEvent] }));
    expect(res.status).toBe(202);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert.mock.calls[0][0]).toEqual([validEvent]);
  });

  it('returns 400 on invalid payload', async () => {
    const res = await POST(req({ events: [{ ...validEvent, event_type: 'bogus' }] }));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns 400 on malformed JSON', async () => {
    const bad = new Request('http://localhost/api/game/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(bad);
    expect(res.status).toBe(400);
  });

  it('returns 500 when supabase insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'db down' } });
    const res = await POST(req({ events: [validEvent] }));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```
cd sales-school && npm run test -- app/api/game/events/__tests__/route.test.ts
```
Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement the route**

```ts
// app/api/game/events/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateEventsPayload } from './validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const v = validateEventsPayload(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('game_events').insert(v.events);
  if (error) {
    console.warn('[api/game/events] insert failed', error.message);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: v.events.length }, { status: 202 });
}
```

- [ ] **Step 4: Run test to verify it passes**

```
cd sales-school && npm run test -- app/api/game/events/__tests__/route.test.ts
```
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add sales-school/app/api/game/events/route.ts sales-school/app/api/game/events/__tests__/route.test.ts
git commit -m "feat(api): POST /api/game/events with validation"
```

---

## Task 3: Refactor analytics.ts flush → fetch + sendBeacon

**Files:**
- Modify: `lib/game/analytics.ts:48-71` (flush function)
- Modify: `lib/game/__tests__/analytics.test.ts` (mock target)

- [ ] **Step 1: Update the existing test to mock fetch + sendBeacon**

Replace `lib/game/__tests__/analytics.test.ts` in full:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
const mockSendBeacon = vi.fn().mockReturnValue(true);

vi.stubGlobal('fetch', mockFetch);
// navigator is provided by jsdom; patch sendBeacon onto it
Object.defineProperty(globalThis.navigator, 'sendBeacon', {
  configurable: true,
  value: mockSendBeacon,
});

import {
  trackNodeEntered, trackNodeExited, trackBackNavigation,
  trackHeartbeat, trackDialogueReread, flushAnalyticsForTest,
} from '@/lib/game/analytics';

function lastFetchBody(): unknown {
  const [, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse((init as RequestInit).body as string);
}

describe('analytics helpers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockSendBeacon.mockClear();
  });

  it('trackNodeEntered POSTs a node_entered event to /api/game/events', async () => {
    trackNodeEntered('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'greeting_node');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/game/events');
    expect((init as RequestInit).method).toBe('POST');
    expect(lastFetchBody()).toEqual({
      events: [{
        player_id: '00000000-0000-0000-0000-000000000001',
        event_type: 'node_entered',
        event_data: { node_id: 'greeting_node' },
        scenario_id: 'car-dealership',
        day_id: 'day1',
      }],
    });
  });

  it('trackNodeExited includes time_spent_ms', async () => {
    trackNodeExited('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'greeting_node', 4200);
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_data: unknown }> };
    expect(body.events[0].event_data).toEqual({ node_id: 'greeting_node', time_spent_ms: 4200 });
  });

  it('trackBackNavigation includes from/to node ids', async () => {
    trackBackNavigation('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'node_c', 'node_b');
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_type: string; event_data: unknown }> };
    expect(body.events[0].event_type).toBe('back_navigation');
    expect(body.events[0].event_data).toEqual({ from_node_id: 'node_c', to_node_id: 'node_b' });
  });

  it('trackHeartbeat records session_id and node_id', async () => {
    trackHeartbeat('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'sess_1', 'node_x');
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_type: string; event_data: unknown }> };
    expect(body.events[0].event_type).toBe('heartbeat');
    expect(body.events[0].event_data).toEqual({ session_id: 'sess_1', node_id: 'node_x' });
  });

  it('trackDialogueReread logs reread count', async () => {
    trackDialogueReread('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'dialogue_5', 2);
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_data: unknown }> };
    expect(body.events[0].event_data).toEqual({ node_id: 'dialogue_5', reread_count: 2 });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```
cd sales-school && npm run test -- lib/game/__tests__/analytics.test.ts
```
Expected: FAIL — current `flush()` still calls supabase client, never hits mockFetch.

- [ ] **Step 3: Replace flush in lib/game/analytics.ts**

Change lines 48-71 of `lib/game/analytics.ts`. Replace:

```ts
function flush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  // Snapshot & reset queue so any concurrent trackEvent calls don't
  // resurrect already-sent events.
  const batch = queue;
  queue = [];

  try {
    const supabase = createClient();
    supabase
      .from('game_events')
      .insert(batch)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[analytics] batch flush', error.message);
      });
  } catch (e) {
    console.warn('[analytics] failed to flush:', e);
  }
}
```

With:

```ts
const EVENTS_ENDPOINT = '/api/game/events';

function flush(useBeacon: boolean = false): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  const batch = queue;
  queue = [];
  const body = JSON.stringify({ events: batch });

  try {
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(EVENTS_ENDPOINT, blob);
      return;
    }
    fetch(EVENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).then((res) => {
      if (!res.ok) console.warn('[analytics] flush status', res.status);
    }).catch((e) => {
      console.warn('[analytics] flush failed', e);
    });
  } catch (e) {
    console.warn('[analytics] failed to flush:', e);
  }
}
```

Also remove the now-unused `createClient` import at the top of the file:

```ts
// DELETE this line:
import { createClient } from '@/lib/supabase/client';
```

- [ ] **Step 4: Update the listener + dropped_off flush to use beacon path**

In the same file, find `attachFlushListeners()` and the `dropped_off` branch in `trackEvent`. Replace with:

```ts
function attachFlushListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  const onHidden = () => {
    if (document.visibilityState === 'hidden') flush(true);
  };
  document.addEventListener('visibilitychange', onHidden);
  // iOS Safari: beforeunload is unreliable; pagehide fires on bfcache put.
  window.addEventListener('pagehide', () => flush(true));
}
```

And in `trackEvent`:

```ts
    if (eventType === 'dropped_off') {
      flush(true);  // beacon — we're on the way out
    } else {
      scheduleFlush();
    }
```

- [ ] **Step 5: Run all analytics tests**

```
cd sales-school && npm run test -- lib/game/__tests__/analytics.test.ts
```
Expected: PASS (5/5) and no reference to supabase client in calls.

- [ ] **Step 6: Commit**

```bash
git add sales-school/lib/game/analytics.ts sales-school/lib/game/__tests__/analytics.test.ts
git commit -m "refactor(game): route analytics through /api/game/events"
```

---

## Task 4: Offer events validator

**Files:**
- Create: `app/api/game/offer-events/validate.ts`
- Test: `app/api/game/offer-events/__tests__/validate.test.ts`

- [ ] **Step 1: Check the current offer_events schema**

Inspect `supabase/migrations/007_offer_events.sql` to confirm columns. Expected columns: `player_id uuid null`, `session_id text`, `event_type text`, `cta_id text null`, `variant_id text`, `created_at`.

- [ ] **Step 2: Write the failing test**

```ts
// app/api/game/offer-events/__tests__/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validateOfferEventPayload } from '../validate';

const base = {
  player_id: '00000000-0000-0000-0000-000000000001',
  session_id: '11111111-1111-1111-1111-111111111111',
  event_type: 'offer_view',
  variant_id: 'default',
};

describe('validateOfferEventPayload', () => {
  it('accepts offer_view', () => {
    expect(validateOfferEventPayload(base).ok).toBe(true);
  });
  it('accepts null player_id', () => {
    expect(validateOfferEventPayload({ ...base, player_id: null }).ok).toBe(true);
  });
  it('rejects unknown event_type', () => {
    expect(validateOfferEventPayload({ ...base, event_type: 'buy_now' }).ok).toBe(false);
  });
  it('requires cta_id when event_type=offer_cta_click', () => {
    expect(validateOfferEventPayload({ ...base, event_type: 'offer_cta_click' }).ok).toBe(false);
    expect(validateOfferEventPayload({ ...base, event_type: 'offer_cta_click', cta_id: 'primary' }).ok).toBe(true);
  });
  it('rejects non-uuid player_id', () => {
    expect(validateOfferEventPayload({ ...base, player_id: 'abc' }).ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```
cd sales-school && npm run test -- app/api/game/offer-events/__tests__/validate.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the validator**

```ts
// app/api/game/offer-events/validate.ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OFFER_EVENT_TYPES = new Set(['offer_view', 'offer_cta_click', 'offer_conversion']);

export interface ValidOfferEvent {
  player_id: string | null;
  session_id: string;
  event_type: 'offer_view' | 'offer_cta_click' | 'offer_conversion';
  cta_id: string | null;
  variant_id: string;
}

export type ValidationResult =
  | { ok: true; event: ValidOfferEvent }
  | { ok: false; error: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateOfferEventPayload(body: unknown): ValidationResult {
  if (!isPlainObject(body)) return { ok: false, error: 'payload must be object' };

  const player_id = body.player_id;
  if (player_id !== null && (typeof player_id !== 'string' || !UUID_RE.test(player_id))) {
    return { ok: false, error: 'player_id invalid' };
  }

  const session_id = body.session_id;
  if (typeof session_id !== 'string' || session_id.length === 0 || session_id.length > 64) {
    return { ok: false, error: 'session_id invalid' };
  }

  const event_type = body.event_type;
  if (typeof event_type !== 'string' || !OFFER_EVENT_TYPES.has(event_type)) {
    return { ok: false, error: 'event_type invalid' };
  }

  const cta_id = (body.cta_id ?? null) as unknown;
  if (cta_id !== null && typeof cta_id !== 'string') {
    return { ok: false, error: 'cta_id invalid' };
  }
  if (event_type === 'offer_cta_click' && cta_id === null) {
    return { ok: false, error: 'cta_id required for offer_cta_click' };
  }

  const variant_id = body.variant_id ?? 'default';
  if (typeof variant_id !== 'string' || variant_id.length === 0) {
    return { ok: false, error: 'variant_id invalid' };
  }

  return {
    ok: true,
    event: {
      player_id: (player_id as string | null) ?? null,
      session_id,
      event_type: event_type as ValidOfferEvent['event_type'],
      cta_id: (cta_id as string | null) ?? null,
      variant_id,
    },
  };
}
```

- [ ] **Step 5: Run test**

```
cd sales-school && npm run test -- app/api/game/offer-events/__tests__/validate.test.ts
```
Expected: PASS (5/5)

- [ ] **Step 6: Commit**

```bash
git add sales-school/app/api/game/offer-events/validate.ts sales-school/app/api/game/offer-events/__tests__/validate.test.ts
git commit -m "feat(api): add offer events validator"
```

---

## Task 5: POST /api/game/offer-events route

**Files:**
- Create: `app/api/game/offer-events/route.ts`
- Test: `app/api/game/offer-events/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/game/offer-events/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/game/offer-events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const base = {
  player_id: '00000000-0000-0000-0000-000000000001',
  session_id: 'sess_1',
  event_type: 'offer_view',
  variant_id: 'default',
};

describe('POST /api/game/offer-events', () => {
  beforeEach(() => mockInsert.mockClear());

  it('inserts a valid offer_view', async () => {
    const res = await POST(req(base));
    expect(res.status).toBe(202);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert.mock.calls[0][0]).toMatchObject({ event_type: 'offer_view' });
  });

  it('rejects unknown event_type', async () => {
    const res = await POST(req({ ...base, event_type: 'bad' }));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns 500 on db error', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'down' } });
    const res = await POST(req(base));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run to confirm fail**

```
cd sales-school && npm run test -- app/api/game/offer-events/__tests__/route.test.ts
```

- [ ] **Step 3: Implement the route**

```ts
// app/api/game/offer-events/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateOfferEventPayload } from './validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const v = validateOfferEventPayload(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('offer_events').insert(v.event);
  if (error) {
    console.warn('[api/game/offer-events] insert failed', error.message);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
```

- [ ] **Step 4: Run tests**

```
cd sales-school && npm run test -- app/api/game/offer-events/__tests__/route.test.ts
```
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add sales-school/app/api/game/offer-events/route.ts sales-school/app/api/game/offer-events/__tests__/route.test.ts
git commit -m "feat(api): POST /api/game/offer-events with validation"
```

---

## Task 6: Refactor offerEvents.ts helpers to POST

**Files:**
- Modify: `lib/game/offerEvents.ts:26-33` (insert function)
- Modify: `lib/game/__tests__/offerEvents.test.ts` (mock fetch)

- [ ] **Step 1: Replace the test file**

```ts
// lib/game/__tests__/offerEvents.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

import {
  getOfferSessionId,
  trackOfferView,
  trackOfferCtaClick,
  trackOfferConversion,
} from '@/lib/game/offerEvents';

function lastBody(): Record<string, unknown> {
  const [, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse((init as RequestInit).body as string) as Record<string, unknown>;
}

describe('offerEvents', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    sessionStorage.clear();
  });

  it('getOfferSessionId returns a stable uuid per session', () => {
    const a = getOfferSessionId();
    const b = getOfferSessionId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toBe(b);
  });

  it('trackOfferView POSTs offer_view to /api/game/offer-events', async () => {
    await trackOfferView({ playerId: '00000000-0000-0000-0000-000000000001' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/game/offer-events');
    expect((init as RequestInit).method).toBe('POST');
    const body = lastBody();
    expect(body).toMatchObject({
      player_id: '00000000-0000-0000-0000-000000000001',
      event_type: 'offer_view',
      variant_id: 'default',
    });
  });

  it('trackOfferCtaClick records cta_id', async () => {
    await trackOfferCtaClick({ playerId: '00000000-0000-0000-0000-000000000001', ctaId: 'primary' });
    const body = lastBody();
    expect(body).toMatchObject({ event_type: 'offer_cta_click', cta_id: 'primary' });
  });

  it('trackOfferConversion fires offer_conversion', async () => {
    await trackOfferConversion({ playerId: '00000000-0000-0000-0000-000000000001' });
    expect(lastBody()).toMatchObject({ event_type: 'offer_conversion' });
  });

  it('swallows fetch errors without throwing', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    await expect(trackOfferView({ playerId: '00000000-0000-0000-0000-000000000001' })).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
cd sales-school && npm run test -- lib/game/__tests__/offerEvents.test.ts
```
Expected: FAIL — current code calls supabase client, not fetch.

- [ ] **Step 3: Replace insert() in lib/game/offerEvents.ts**

Replace the file `lib/game/offerEvents.ts` top-to-bottom with:

```ts
'use client';

const SESSION_KEY = 'ss_offer_sid';
const ENDPOINT = '/api/game/offer-events';

export function getOfferSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface BaseArgs {
  playerId: string | null;
  variantId?: string | null;
}

interface CtaClickArgs extends BaseArgs {
  ctaId: string;
}

async function post(row: Record<string, unknown>): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(row),
      keepalive: true,
    });
  } catch (e) {
    console.warn('[offerEvents] post failed:', e);
  }
}

export async function trackOfferView(args: BaseArgs): Promise<void> {
  await post({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_view',
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferCtaClick(args: CtaClickArgs): Promise<void> {
  await post({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_cta_click',
    cta_id: args.ctaId,
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferConversion(args: BaseArgs): Promise<void> {
  await post({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_conversion',
    variant_id: args.variantId ?? 'default',
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
cd sales-school && npm run test -- lib/game/__tests__/offerEvents.test.ts
```
Expected: PASS (5/5)

- [ ] **Step 5: Commit**

```bash
git add sales-school/lib/game/offerEvents.ts sales-school/lib/game/__tests__/offerEvents.test.ts
git commit -m "refactor(game): route offer events through /api/game/offer-events"
```

---

## Task 7: Full test suite + typecheck + build

**Files:** none — verification only.

- [ ] **Step 1: Run full Vitest suite**

```
cd sales-school && npm run test
```
Expected: all tests pass (count before + 10 new route/validator tests + 5 rewritten).

- [ ] **Step 2: Typecheck**

```
cd sales-school && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Production build**

```
cd sales-school && npm run build
```
Expected: build succeeds (Phase 7's `import 'server-only'` guards still hold — no client file may import `createAdminClient`).

- [ ] **Step 4: Commit any lockfile tweaks**

If `package-lock.json` changed, commit it:

```bash
git status
git add sales-school/package-lock.json || true
git diff --cached --quiet || git commit -m "chore: lockfile after game events api route"
```

---

## Task 8: Live smoke test (local)

**Files:** none.

- [ ] **Step 1: Start dev server**

```
cd sales-school && npm run dev
```

- [ ] **Step 2: Open a game session**

1. In browser open `http://localhost:3000/game`
2. Enter name + phone, start the scenario, make a couple choices.

- [ ] **Step 3: Verify rows landed in Supabase**

Via Supabase MCP `execute_sql` on project `njbcybjdzjahpdmcjtqe`:

```sql
SELECT event_type, count(*)
FROM public.game_events
WHERE created_at > now() - interval '10 minutes'
GROUP BY 1
ORDER BY 2 DESC;
```

Expected: at least `game_started`, `day_started`, `node_entered`, `choice_made` rows. If zero rows, inspect the browser Network tab for `/api/game/events` POSTs — should be `202` status.

- [ ] **Step 4: Verify Overview metrics refresh**

1. Open `http://localhost:3000/admin/overview` with cookie auth.
2. "Игроков" and "Начали игру" should both be > 0 now (with the new session). "Динамика по дням" line should show a bump on today's bucket.

- [ ] **Step 5: Rollback drill (sanity)**

Confirm what happens if the route goes down: browser keeps trying, events stay queued up to `FLUSH_DEBOUNCE_MS`, and on pagehide `navigator.sendBeacon` has a retry slot. Check `console.warn('[analytics] flush status', …)` appears on 4xx/5xx — no user-facing failure.

---

## Spec coverage check

- [x] Validation at server boundary — Task 1, 4
- [x] Service-role insert (RLS fail-closed) — Task 2, 5
- [x] Fetch replaces direct Supabase insert — Task 3
- [x] sendBeacon on unload — Task 3
- [x] Offer events parity — Task 4, 5, 6
- [x] Tests updated for new transport — Task 3, 6
- [x] Full regression + build green — Task 7
- [x] Live verification — Task 8

## Out-of-scope followups (separate plans)

1. **Historical backfill** — synthesize `game_started` / `game_completed` events from `completed_scenarios` rows so pre-fix analytics aren't all zero.
2. **Realtime admin live-feed** — needs SELECT pathway for admin session (service-role SSE stream or short-lived elevated JWT).
3. **Distributed rate limiting** — Redis/Upstash on `/api/game/events` + `/api/game/offer-events` once we see abuse.
4. **Clean up `anon can insert offer_events` RLS policy** — now redundant, safer to drop once route is live for a week.
