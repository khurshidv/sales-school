# Dashboard 2.0 — API Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken data-loading on all Dashboard 2.0 admin pages by moving every direct-from-client Supabase RPC call behind server-side API routes. Today every client imports `lib/admin/queries-v2.ts` (and `lib/admin/page-queries.ts`), which internally calls `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY` — a variable that is `undefined` in the browser, so every RPC silently fails and pages render zeros.

**Architecture:**
- Server: add one Next.js App Router handler per admin page under `app/api/admin/<page>/route.ts`. Each handler validates admin auth via the existing `admin_session` cookie, invokes the existing typed query helpers, and returns JSON.
- Client: introduce `lib/admin/api.ts` — thin typed `fetchX()` wrappers around `/api/admin/*`. Every `*Client.tsx` component replaces its direct `queries-v2`/`page-queries` imports with these wrappers.
- Hardening: add `import 'server-only'` to `lib/admin/queries-v2.ts`, `lib/admin/page-queries.ts`, and `lib/supabase/admin.ts` so any future accidental client-side import fails the build.
- Pure functions (`periodToRange`, transforms) stay importable on the client — they live in modules without the `server-only` marker.

**Tech Stack:** Next.js 16 App Router route handlers, TypeScript, Vitest 4 for route unit tests (direct handler invocation with mocked queries), existing Supabase service-role client (server-side only). No new dependencies.

**Prod safety rule:** No DB changes. Only code moves between client/server boundaries. Existing RPCs in Postgres are untouched.

---

## File Structure

### New files
- `lib/admin/authGuard.ts` — `requireAdmin(req)` helper returning `NextResponse` (401) or `null`.
- `lib/admin/api.ts` — typed client-side fetchers (`fetchOverview`, `fetchBranch`, `fetchDropoff`, `fetchEngagement`, `fetchFunnel`, `fetchOffer`, `fetchParticipants`, `fetchLeaderboard`, `fetchPlayer`, `fetchRealtimeKpis`, `fetchRecentEvents`, `fetchPages`, `fetchPageAnalytics`, `fetchLeads`, `fetchLeadCounts`).
- `app/api/admin/overview/route.ts`
- `app/api/admin/branch/route.ts`
- `app/api/admin/dropoff/route.ts`
- `app/api/admin/engagement/route.ts`
- `app/api/admin/funnel/route.ts`
- `app/api/admin/offer/route.ts`
- `app/api/admin/participants/route.ts`
- `app/api/admin/leaderboard/route.ts`
- `app/api/admin/player/[playerId]/route.ts`
- `app/api/admin/realtime/kpis/route.ts`
- `app/api/admin/realtime/events/route.ts`
- `app/api/admin/pages/route.ts`
- `app/api/admin/pages/[slug]/route.ts`
- `app/api/admin/leads/route.ts`
- `lib/admin/__tests__/authGuard.test.ts`
- `app/api/admin/overview/__tests__/route.test.ts` — one route test as the template

### Modified files
- `lib/admin/queries-v2.ts:1` — add `import 'server-only';` at top.
- `lib/admin/page-queries.ts:1` — add `import 'server-only';` at top.
- `lib/supabase/admin.ts:1` — add `import 'server-only';` at top.
- `app/(admin)/admin/overview/OverviewClient.tsx` — replace `queries-v2` imports with `fetchOverview`.
- `app/(admin)/admin/branch/BranchClient.tsx` — replace with `fetchBranch`.
- `app/(admin)/admin/dropoff/DropoffClient.tsx` — replace with `fetchDropoff`.
- `app/(admin)/admin/engagement/EngagementClient.tsx` — replace with `fetchEngagement`.
- `app/(admin)/admin/funnel/FunnelClient.tsx` — replace with `fetchFunnel`.
- `app/(admin)/admin/offer/OfferClient.tsx` — replace with `fetchOffer`.
- `app/(admin)/admin/participants/ParticipantsClient.tsx` — replace with `fetchParticipants`.
- `app/(admin)/admin/leaderboard/LeaderboardClient.tsx` — replace with `fetchLeaderboard`.
- `app/(admin)/admin/player/[playerId]/PlayerClient.tsx` — replace with `fetchPlayer`.
- `app/(admin)/admin/realtime/RealtimeClient.tsx` — replace with `fetchRealtimeKpis` + `fetchRecentEvents`.
- `app/(admin)/admin/pages/PagesClient.tsx` — replace with `fetchPages`.
- `app/(admin)/admin/pages/[slug]/page.tsx` — if it imports `getPageAnalytics`, move to server component pattern or API call (see Task 13).
- `app/(admin)/admin/leads/LeadsClient.tsx` — replace with `fetchLeads` + `fetchLeadCounts`.
- `components/admin/LiveFeed.tsx` — keep only the type import from `queries-v2`; types re-export via `api.ts` if needed.
- `lib/admin/queries-v2.ts` — extract `periodToRange` to a new pure module `lib/admin/period.ts` so clients can still import it without pulling in `server-only` queries. All pure transform test suites continue to work.

### Why this decomposition
- One route per page keeps payloads small, keeps caching/CDN behaviour per-URL, and matches existing mental model (1 page ↔ 1 data endpoint).
- Realtime splits into `/kpis` and `/events` because they are called on different cadences: KPIs refresh every 30s, events stream via Supabase Realtime and only need an initial snapshot.
- The `api.ts` wrapper centralizes error handling and query string construction; no `fetch('/api/admin/...')` calls leak into UI components.
- `import 'server-only'` is a build-time guarantee. Without it the same class of bug can recur silently.

---

## Task 1: Extract `periodToRange` to a pure module

**Context:** `periodToRange` is a pure function but lives in `queries-v2.ts`. Once we add `import 'server-only'` to `queries-v2.ts`, clients that need `periodToRange` would fail to build. Move it first so later tasks can mark `queries-v2.ts` as server-only without breaking clients.

**Files:**
- Create: `sales-school/lib/admin/period.ts`
- Modify: `sales-school/lib/admin/queries-v2.ts` (remove the function, re-export for back-compat via one line)
- Update imports: every client that imports `periodToRange` from `queries-v2` — switch to `period.ts`.

- [ ] **Step 1: Create the module**

```ts
// sales-school/lib/admin/period.ts
import type { Period, DateRange } from './types-v2';

export function periodToRange(period: Period, now: Date = new Date()): DateRange {
  if (period === 'all') return { from: null, to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}
```

- [ ] **Step 2: Replace the definition inside `queries-v2.ts` with a re-export**

Find the current `export function periodToRange(...)` block in `sales-school/lib/admin/queries-v2.ts` and replace it with:

```ts
export { periodToRange } from './period';
```

- [ ] **Step 3: Run existing tests to verify nothing broke**

```bash
cd sales-school && npm run test -- lib/admin
```

Expected: all admin tests still pass.

- [ ] **Step 4: Commit**

```bash
git add sales-school/lib/admin/period.ts sales-school/lib/admin/queries-v2.ts
git commit -m "refactor(admin): extract periodToRange into pure module"
```

---

## Task 2: Auth guard helper + unit test

**Files:**
- Create: `sales-school/lib/admin/authGuard.ts`
- Create: `sales-school/lib/admin/__tests__/authGuard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// sales-school/lib/admin/__tests__/authGuard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { requireAdmin } from '../authGuard';

describe('requireAdmin', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'secret';
  });

  it('returns 401 when cookie is missing', () => {
    const req = new NextRequest('http://localhost/api/admin/overview');
    const res = requireAdmin(req);
    expect(res?.status).toBe(401);
  });

  it('returns 401 when cookie value does not match ADMIN_PASSWORD', () => {
    const req = new NextRequest('http://localhost/api/admin/overview', {
      headers: { cookie: 'admin_session=wrong' },
    });
    const res = requireAdmin(req);
    expect(res?.status).toBe(401);
  });

  it('returns null when cookie matches', () => {
    const req = new NextRequest('http://localhost/api/admin/overview', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = requireAdmin(req);
    expect(res).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd sales-school && npm run test -- lib/admin/__tests__/authGuard.test.ts
```

Expected: FAIL (module does not exist).

- [ ] **Step 3: Write the implementation**

```ts
// sales-school/lib/admin/authGuard.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 });
  }
  const cookie = req.cookies.get('admin_session')?.value;
  if (!cookie || cookie !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd sales-school && npm run test -- lib/admin/__tests__/authGuard.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add sales-school/lib/admin/authGuard.ts sales-school/lib/admin/__tests__/authGuard.test.ts
git commit -m "feat(admin): requireAdmin helper for API route auth"
```

---

## Task 2b: Simplify admin auth — remove Basic Auth popup

**Context:** Chrome shows a native HTTP Basic Auth prompt when opening any `/admin/*` URL before the password form, because `proxy.ts` (Next.js 16 middleware) both honors an `Authorization: Basic` header **and** returns `WWW-Authenticate: Basic realm="Sales Up Admin"` on 401. Goal: keep the cookie/password-form flow, drop Basic Auth entirely.

**Files:**
- Modify: `sales-school/proxy.ts`
- Modify: `sales-school/.env.local.example` (remove `ADMIN_USERNAME`)

- [ ] **Step 1: Remove Basic Auth branch and `WWW-Authenticate` header from `proxy.ts`**

Replace the entire contents of `sales-school/proxy.ts` with:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const expectedPass = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedPass) {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (session === expectedPass) {
    return NextResponse.next();
  }

  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/html')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

Changes vs. current: deleted the `Authorization: Basic` parsing block, changed the non-HTML 401 path to a plain JSON response (no `WWW-Authenticate` header). The HTML redirect to `/admin/login` is unchanged.

- [ ] **Step 2: Remove `ADMIN_USERNAME` from example env**

Edit `sales-school/.env.local.example` to drop the `ADMIN_USERNAME=...` line if it exists. (The local `.env.local` can stay; the variable is simply unused now and won't hurt anything.)

- [ ] **Step 3: Manual smoke test**

```bash
cd sales-school && npm run dev
```

1. Open incognito window → `http://localhost:3000/admin/overview`
2. **Expected:** browser redirects to `/admin/login`. **No Chrome Basic Auth popup appears.**
3. Enter password in the form, submit → lands on `/admin/overview`.
4. Open DevTools → Network → Doc, reload any admin page. First response should be a 307 redirect to `/admin/login`, **no `WWW-Authenticate` response header** anywhere.

- [ ] **Step 4: Commit**

```bash
git add sales-school/proxy.ts sales-school/.env.local.example
git commit -m "feat(admin): drop Basic Auth popup, use password-form only"
```

---

## Task 3: Client-side API helper scaffold

**Goal:** Build the shared fetcher utility. Each later task adds one typed `fetchX()` function on top of it. Starting with the base keeps later tasks short.

**Files:**
- Create: `sales-school/lib/admin/api.ts`

- [ ] **Step 1: Write the base fetcher**

```ts
// sales-school/lib/admin/api.ts
// Client-safe helpers. DO NOT import from queries-v2 or page-queries here —
// those are server-only.

export class AdminApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function adminGet<T>(path: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
  const qs = params
    ? '?' + Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const res = await fetch(`${path}${qs}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
```

- [ ] **Step 2: Commit**

```bash
git add sales-school/lib/admin/api.ts
git commit -m "feat(admin): client-side adminGet fetcher helper"
```

---

## Task 4: `/api/admin/overview` route + wire `OverviewClient`

**Endpoint contract:** `GET /api/admin/overview?period=7d|30d|90d|all` → `{ trends, utm, offer }`.

**Files:**
- Create: `sales-school/app/api/admin/overview/route.ts`
- Create: `sales-school/app/api/admin/overview/__tests__/route.test.ts`
- Modify: `sales-school/lib/admin/api.ts` — add `fetchOverview`.
- Modify: `sales-school/app/(admin)/admin/overview/OverviewClient.tsx` — drop `queries-v2` imports, call `fetchOverview`.

- [ ] **Step 1: Write the route handler**

```ts
// sales-school/app/api/admin/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDailyTrends, getUtmFunnel, getOfferFunnelData } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const period = (req.nextUrl.searchParams.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const range = periodToRange(period);

  const [trends, utm, offer] = await Promise.all([
    getDailyTrends(range),
    getUtmFunnel(range),
    getOfferFunnelData(range),
  ]);

  return NextResponse.json({ trends, utm, offer });
}
```

- [ ] **Step 2: Write a route smoke test as template**

```ts
// sales-school/app/api/admin/overview/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin/queries-v2', () => ({
  getDailyTrends: vi.fn().mockResolvedValue([]),
  getUtmFunnel: vi.fn().mockResolvedValue([]),
  getOfferFunnelData: vi.fn().mockResolvedValue({ game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0 }),
}));

import { GET } from '../route';

describe('GET /api/admin/overview', () => {
  beforeEach(() => { process.env.ADMIN_PASSWORD = 'secret'; });

  it('401 without cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=30d');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('400 for invalid period', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=bogus', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('200 with trends, utm, offer on valid request', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=30d', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('trends');
    expect(body).toHaveProperty('utm');
    expect(body).toHaveProperty('offer');
  });
});
```

- [ ] **Step 3: Run the route test**

```bash
cd sales-school && npm run test -- app/api/admin/overview
```

Expected: 3 passing.

- [ ] **Step 4: Add `fetchOverview` to `api.ts`**

Append to `sales-school/lib/admin/api.ts`:

```ts
import type { DailyTrendRow, UtmFunnelRow, OfferFunnel, Period } from './types-v2';

export interface OverviewPayload {
  trends: DailyTrendRow[];
  utm: UtmFunnelRow[];
  offer: OfferFunnel;
}

export function fetchOverview(period: Period): Promise<OverviewPayload> {
  return adminGet<OverviewPayload>('/api/admin/overview', { period });
}
```

- [ ] **Step 5: Rewrite `OverviewClient.tsx` data loading**

In `sales-school/app/(admin)/admin/overview/OverviewClient.tsx`:

- Replace the import line `import { getDailyTrends, getUtmFunnel, getOfferFunnelData, periodToRange } from '@/lib/admin/queries-v2';` with `import { fetchOverview } from '@/lib/admin/api';`
- Replace the `useEffect` body so it calls `fetchOverview(period)` once and destructures `{ trends, utm, offer }`:

```tsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchOverview(period).then((res) => {
    if (cancelled) return;
    setTrends(res.trends);
    setUtm(res.utm);
    setOffer(res.offer);
    setLoading(false);
  }).catch((err) => {
    if (cancelled) return;
    console.error('[overview] fetch failed', err);
    setLoading(false);
  });
  return () => { cancelled = true; };
}, [period]);
```

- [ ] **Step 6: Manual smoke test**

```bash
cd sales-school && npm run dev
```

Open `http://localhost:3000/admin/overview` in a logged-in browser. Confirm KPI cards show non-zero numbers (assuming DB has data for the last 30d). Check DevTools → Network: request to `/api/admin/overview?period=30d` returns 200 with `trends/utm/offer`.

- [ ] **Step 7: Commit**

```bash
git add sales-school/app/api/admin/overview sales-school/lib/admin/api.ts sales-school/app/\(admin\)/admin/overview/OverviewClient.tsx
git commit -m "feat(admin): /api/admin/overview + wire OverviewClient"
```

---

## Task 5: `/api/admin/branch` route + wire `BranchClient`

**Endpoint contract:** `GET /api/admin/branch?scenarioId=...&dayId=...&period=...` → `{ flows, stats, dropoffs }`.

**Files:**
- Create: `sales-school/app/api/admin/branch/route.ts`
- Modify: `sales-school/lib/admin/api.ts` — add `fetchBranch`.
- Modify: `sales-school/app/(admin)/admin/branch/BranchClient.tsx`.

- [ ] **Step 1: Write the route handler**

```ts
// sales-school/app/api/admin/branch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getBranchFlow, getNodeStats, getDropoffZones } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  const dayId = sp.get('dayId');
  const period = (sp.get('period') ?? '30d') as Period;
  if (!scenarioId || !dayId) {
    return NextResponse.json({ error: 'scenarioId and dayId required' }, { status: 400 });
  }
  const range = periodToRange(period);

  const [flows, stats, dropoffs] = await Promise.all([
    getBranchFlow({ scenarioId, dayId, ...range }),
    getNodeStats({ scenarioId, dayId, ...range }),
    getDropoffZones({ scenarioId, ...range }),
  ]);

  return NextResponse.json({ flows, stats, dropoffs });
}
```

- [ ] **Step 2: Add `fetchBranch` to `api.ts`**

```ts
import type { BranchFlowRow, NodeStat, DropoffRow } from './types-v2';

export interface BranchPayload {
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
}

export function fetchBranch(params: {
  scenarioId: string; dayId: string; period: Period;
}): Promise<BranchPayload> {
  return adminGet<BranchPayload>('/api/admin/branch', params);
}
```

- [ ] **Step 3: Rewrite `BranchClient.tsx` data loading**

Replace `import { getBranchFlow, getNodeStats, getDropoffZones, periodToRange } from '@/lib/admin/queries-v2';` with `import { fetchBranch } from '@/lib/admin/api';`. Replace the `useEffect` Promise.all with a single `fetchBranch({ scenarioId, dayId, period })` call, assigning `setFlows(res.flows); setStats(res.stats); setDropoffs(res.dropoffs)`.

- [ ] **Step 4: Manual smoke test**

Visit `/admin/branch`, switch scenario/day/period, verify Sankey, Tree, Map charts populate.

- [ ] **Step 5: Commit**

```bash
git add sales-school/app/api/admin/branch sales-school/lib/admin/api.ts sales-school/app/\(admin\)/admin/branch/BranchClient.tsx
git commit -m "feat(admin): /api/admin/branch + wire BranchClient"
```

---

## Task 6: `/api/admin/dropoff` route + wire `DropoffClient`

**Endpoint contract:** `GET /api/admin/dropoff?scenarioId=...&period=...` → `{ dropoffs }`.

**Files:**
- Create: `sales-school/app/api/admin/dropoff/route.ts`
- Modify: `sales-school/lib/admin/api.ts`
- Modify: `sales-school/app/(admin)/admin/dropoff/DropoffClient.tsx`

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/dropoff/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDropoffZones } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  if (!scenarioId) return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
  const period = (sp.get('period') ?? '30d') as Period;
  const range = periodToRange(period);

  const dropoffs = await getDropoffZones({ scenarioId, ...range });
  return NextResponse.json({ dropoffs });
}
```

- [ ] **Step 2: Add `fetchDropoff`**

```ts
export interface DropoffPayload { dropoffs: DropoffRow[] }
export function fetchDropoff(params: { scenarioId: string; period: Period }): Promise<DropoffPayload> {
  return adminGet<DropoffPayload>('/api/admin/dropoff', params);
}
```

- [ ] **Step 3: Wire client**

Replace queries-v2 import with `fetchDropoff`, call it from `useEffect`.

- [ ] **Step 4: Smoke test & commit**

Visit `/admin/dropoff`, confirm bars render.

```bash
git add sales-school/app/api/admin/dropoff sales-school/lib/admin/api.ts sales-school/app/\(admin\)/admin/dropoff/DropoffClient.tsx
git commit -m "feat(admin): /api/admin/dropoff + wire DropoffClient"
```

---

## Task 7: `/api/admin/engagement` route + wire `EngagementClient`

**Endpoint contract:** `GET /api/admin/engagement?scenarioId=...&dayId=...&period=...` → `{ engagement, stats }`.

**Files:**
- Create: `sales-school/app/api/admin/engagement/route.ts`
- Modify: `sales-school/lib/admin/api.ts`
- Modify: `sales-school/app/(admin)/admin/engagement/EngagementClient.tsx`

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/engagement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getEngagementIndexRaw, getNodeStats } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  const dayId = sp.get('dayId');
  if (!scenarioId || !dayId) return NextResponse.json({ error: 'scenarioId and dayId required' }, { status: 400 });
  const period = (sp.get('period') ?? '30d') as Period;
  const range = periodToRange(period);

  const [engagement, stats] = await Promise.all([
    getEngagementIndexRaw({ scenarioId, ...range }),
    getNodeStats({ scenarioId, dayId, ...range }),
  ]);

  return NextResponse.json({ engagement, stats });
}
```

- [ ] **Step 2: `fetchEngagement`, wire client, smoke test, commit.** Same pattern as Task 5.

```bash
git add ... && git commit -m "feat(admin): /api/admin/engagement + wire EngagementClient"
```

---

## Task 8: `/api/admin/funnel` route + wire `FunnelClient`

**Endpoint contract:** `GET /api/admin/funnel?period=...` → `{ utm }`.

**Files:**
- Create: `sales-school/app/api/admin/funnel/route.ts`
- Modify: `sales-school/lib/admin/api.ts`
- Modify: `sales-school/app/(admin)/admin/funnel/FunnelClient.tsx`

- [ ] **Step 1: Route handler (follow pattern from overview)**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getUtmFunnel } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const period = (req.nextUrl.searchParams.get('period') ?? '30d') as Period;
  const utm = await getUtmFunnel(periodToRange(period));
  return NextResponse.json({ utm });
}
```

- [ ] **Step 2: `fetchFunnel`, wire `FunnelClient`, smoke test, commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/funnel + wire FunnelClient"
```

---

## Task 9: `/api/admin/offer` route + wire `OfferClient`

**Endpoint contract:** `GET /api/admin/offer?period=...` → `{ funnel, byRating, byUtm }`.

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/offer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getOfferFunnelData, getOfferBreakdownByRating, getOfferBreakdownByUtm } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const period = (req.nextUrl.searchParams.get('period') ?? '30d') as Period;
  const range = periodToRange(period);
  const [funnel, byRating, byUtm] = await Promise.all([
    getOfferFunnelData(range),
    getOfferBreakdownByRating(range),
    getOfferBreakdownByUtm(range),
  ]);
  return NextResponse.json({ funnel, byRating, byUtm });
}
```

- [ ] **Step 2: `fetchOffer`, wire `OfferClient`, smoke test, commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/offer + wire OfferClient"
```

---

## Task 10: `/api/admin/participants` route + wire `ParticipantsClient`

**Endpoint contract:** `GET /api/admin/participants?search=&ratingFilter=&limit=` → `{ players, total }`.

**Existing `getPlayersEnriched` signature check:** Before writing the route, open `sales-school/lib/admin/queries-v2.ts` and read the `getPlayersEnriched` signature. Use its exact parameter names.

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/participants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPlayersEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const search = sp.get('search') || undefined;
  const ratingFilter = sp.get('ratingFilter') || null;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 10_000) : 100;

  const result = await getPlayersEnriched({ search, ratingFilter, limit });
  return NextResponse.json(result);
}
```

- [ ] **Step 2: `fetchParticipants`, wire `ParticipantsClient`, smoke test, commit.**

Keep the existing `ExportCsvButton` — it already hits `/api/admin/csv` which is server-side and unaffected.

```bash
git add ... && git commit -m "feat(admin): /api/admin/participants + wire ParticipantsClient"
```

---

## Task 11: `/api/admin/leaderboard` route + wire `LeaderboardClient`

**Endpoint contract:** `GET /api/admin/leaderboard?limit=` → `{ items }`.

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeaderboardEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 1000) : 100;
  const items = await getLeaderboardEnriched(limit);
  return NextResponse.json({ items });
}
```

- [ ] **Step 2: `fetchLeaderboard`, wire `LeaderboardClient`, smoke test, commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/leaderboard + wire LeaderboardClient"
```

---

## Task 12: `/api/admin/player/[playerId]` route + wire `PlayerClient`

**Endpoint contract:** `GET /api/admin/player/[playerId]` → `{ summary, journey, completedDays }`.

- [ ] **Step 1: Route handler**

```ts
// sales-school/app/api/admin/player/[playerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPlayerSummary, getPlayerJourneyData, getCompletedDaysForPlayer } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { playerId } = await params;
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  const [summary, journey, completedDays] = await Promise.all([
    getPlayerSummary(playerId),
    getPlayerJourneyData(playerId),
    getCompletedDaysForPlayer(playerId),
  ]);

  return NextResponse.json({ summary, journey, completedDays });
}
```

- [ ] **Step 2: `fetchPlayer(playerId)`, wire `PlayerClient`, smoke test, commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/player/[id] + wire PlayerClient"
```

---

## Task 13: Realtime routes (`kpis` + `events`) + wire `RealtimeClient`

**Endpoint contracts:**
- `GET /api/admin/realtime/kpis` → `RealtimeKpis`
- `GET /api/admin/realtime/events?limit=` → `{ events: RecentGameEvent[] }`

Keep `useRealtimeGameEvents` hook untouched — it subscribes to Supabase Realtime over the anon channel and works fine; only the initial snapshot is via REST.

- [ ] **Step 1: kpis route**

```ts
// sales-school/app/api/admin/realtime/kpis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getRealtimeKpis } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const kpis = await getRealtimeKpis();
  return NextResponse.json(kpis);
}
```

- [ ] **Step 2: events route**

```ts
// sales-school/app/api/admin/realtime/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getRecentGameEvents } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 500) : 100;
  const events = await getRecentGameEvents(limit);
  return NextResponse.json({ events });
}
```

- [ ] **Step 3: `fetchRealtimeKpis`, `fetchRecentEvents`, wire `RealtimeClient`, smoke test, commit.**

In `RealtimeClient.tsx` replace the queries-v2 imports. The polling loop (`setInterval(REFRESH_MS)`) calls both fetchers; the Supabase realtime subscription continues to live in `useRealtimeGameEvents`.

```bash
git add ... && git commit -m "feat(admin): /api/admin/realtime/{kpis,events} + wire RealtimeClient"
```

---

## Task 14: Pages + pages/[slug] routes + wire clients

**Context:** `PagesClient` imports `getPagesSummary` from `lib/admin/page-queries.ts`. `pages/[slug]/page.tsx` likely imports `getPageAnalytics`. Both suffer the same server-key-on-client bug.

**Endpoint contracts:**
- `GET /api/admin/pages?from=ISO&to=ISO` → `{ pages: PageSummary[] }`
- `GET /api/admin/pages/[slug]?from=ISO&to=ISO` → `{ summary, breakdowns }`

- [ ] **Step 1: List route `/api/admin/pages/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPagesSummary } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const fromRaw = sp.get('from');
  const toRaw = sp.get('to');
  const from = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 30 * 86_400_000);
  const to = toRaw ? new Date(toRaw) : new Date();
  const pages = await getPagesSummary(from, to);
  return NextResponse.json({ pages });
}
```

- [ ] **Step 2: Detail route `/api/admin/pages/[slug]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPageAnalytics } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { slug } = await params;
  const sp = req.nextUrl.searchParams;
  const fromRaw = sp.get('from');
  const toRaw = sp.get('to');
  const from = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 30 * 86_400_000);
  const to = toRaw ? new Date(toRaw) : new Date();
  const data = await getPageAnalytics(slug, from, to);
  return NextResponse.json(data);
}
```

- [ ] **Step 3: `fetchPages`, `fetchPageAnalytics`, wire clients.**

If `app/(admin)/admin/pages/[slug]/page.tsx` is a **server component** (no `'use client'`), it can keep calling `page-queries` directly — server components run on the server and have access to `SUPABASE_SERVICE_ROLE_KEY`. Only convert to API-fetch if the page is marked `'use client'`. Verify by reading the file header.

- [ ] **Step 4: Smoke test & commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/pages + wire PagesClient"
```

---

## Task 15: Leads route + wire `LeadsClient`

**Context:** `getLeads` and `getLeadCounts` live in `page-queries.ts` and take structured options. Expose as a single route.

**Endpoint contracts:**
- `GET /api/admin/leads?slug=&limit=&offset=&search=&sortBy=&sortAsc=&from=&to=` → `{ leads, total }`
- `GET /api/admin/leads/counts` → `Record<string, number>`

- [ ] **Step 1: List route**

```ts
// sales-school/app/api/admin/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeads } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const result = await getLeads({
    slug: sp.get('slug') ?? undefined,
    limit: sp.get('limit') ? Number(sp.get('limit')) : 25,
    offset: sp.get('offset') ? Number(sp.get('offset')) : 0,
    search: sp.get('search') ?? undefined,
    sortBy: sp.get('sortBy') ?? 'created_at',
    sortAsc: sp.get('sortAsc') === 'true',
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
  });
  return NextResponse.json(result);
}
```

- [ ] **Step 2: Counts route `/api/admin/leads/counts/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeadCounts } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  return NextResponse.json(await getLeadCounts());
}
```

- [ ] **Step 3: `fetchLeads`, `fetchLeadCounts`, wire `LeadsClient`, smoke test, commit.**

```bash
git add ... && git commit -m "feat(admin): /api/admin/leads(+counts) + wire LeadsClient"
```

---

## Task 16: Lock server-only files

**Goal:** Prevent this class of bug from recurring. After this task, any client import of `queries-v2.ts`, `page-queries.ts`, or `lib/supabase/admin.ts` fails the Next.js build.

- [ ] **Step 1: Install `server-only` (if not already present)**

```bash
cd sales-school && npm ls server-only 2>/dev/null || npm install server-only
```

- [ ] **Step 2: Add the marker at top of each server-only file**

Insert as the first line of:
- `sales-school/lib/admin/queries-v2.ts`
- `sales-school/lib/admin/page-queries.ts`
- `sales-school/lib/supabase/admin.ts`

```ts
import 'server-only';
```

- [ ] **Step 3: Run a full build**

```bash
cd sales-school && npm run build
```

Expected: build succeeds. If it fails with "You're importing a component that imports server-only", a client import was missed — grep for the offending module and route it through `api.ts`.

- [ ] **Step 4: Run the test suite**

```bash
cd sales-school && npm run test
```

Expected: all 385+ tests plus new auth/route tests pass.

- [ ] **Step 5: Commit**

```bash
git add sales-school/lib/admin/queries-v2.ts sales-school/lib/admin/page-queries.ts sales-school/lib/supabase/admin.ts sales-school/package.json sales-school/package-lock.json
git commit -m "chore(admin): mark queries-v2/page-queries/admin supabase as server-only"
```

---

## Task 17: End-to-end smoke checklist

**Goal:** Verify every admin page now shows data in dev. No code changes — manual QA.

- [ ] **Step 1: Start dev server and log in**

```bash
cd sales-school && npm run dev
```

Visit `http://localhost:3000/admin/login`, enter the admin password, submit.

- [ ] **Step 2: Walk through every page and record result**

For each URL below, open in browser and confirm: (a) data renders, (b) DevTools Network shows the corresponding `/api/admin/...` request returning 200, (c) no 401/500.

- [ ] `/admin/realtime` → KPI tiles non-zero (if active players), Live-feed updates
- [ ] `/admin/overview` → Trends chart populated
- [ ] `/admin/branch` → Sankey renders; change scenario/day/period and re-check
- [ ] `/admin/engagement` → Interest index displayed
- [ ] `/admin/dropoff` → Bars render
- [ ] `/admin/funnel` → UTM rows
- [ ] `/admin/pages` → Page cards (home, target)
- [ ] `/admin/pages/home` → Page analytics (if this route exists and was converted)
- [ ] `/admin/offer` → Offer funnel + breakdowns
- [ ] `/admin/participants` → Player list, search/filter responds
- [ ] `/admin/leaderboard` → Ranked list
- [ ] `/admin/player/<any-real-id>` → Journey timeline
- [ ] `/admin/leads` → Leads table

- [ ] **Step 3: Log out, confirm 401s**

In DevTools → Application → Cookies, delete `admin_session`. Refresh any admin page that issued an API request. The network call should now return 401. This proves `requireAdmin` works.

- [ ] **Step 4: Deploy to Vercel preview and re-run the checklist**

Push the branch, open the preview URL, repeat Step 2 to confirm env vars and auth work in the Vercel environment too.

- [ ] **Step 5: Update memory**

Update `memory/project_dashboard2.md` to note: "Phase 7 (API wiring) completed on YYYY-MM-DD. Dashboard data loading verified end-to-end." Remove the "ready to merge" line since this fix must ship with the Phase 1-6 work.

---

## Self-Review Notes

- **Spec coverage:** Every client that imports from `queries-v2` or `page-queries` (found via grep in root-cause analysis) has a dedicated task wiring it through an API route.
- **Auth:** Every new route starts with `requireAdmin(req)`. No auth bypass path.
- **Types:** All `fetchX()` wrappers return the same types the old direct calls did, so no client type drift.
- **Back-compat:** `periodToRange` is re-exported from `queries-v2` to keep any forgotten import working even before `server-only` is added. The re-export disappears only if we decide to harden that too — leave it for now.
- **Out of scope (deferred):** adding a Next.js `middleware.ts` that auto-guards all `/admin/*` pages (right now pages themselves have no auth check — only the API layer does after this plan). Worth a follow-up plan.
