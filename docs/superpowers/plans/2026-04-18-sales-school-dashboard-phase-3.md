# Sales School Dashboard 2.0 — Phase 3 (Marketing Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four "Marketing" admin pages (Overview, Funnel & UTM, Pages Analytics, Offer Conversion) and instrument the in-game offer screen so the funnel can actually be measured.

**Architecture:** Same Server Components + Client Components pattern as Phase 2. Add one DB migration (009) with new RPCs for UTM funnel breakdowns and daily trends. Pure transforms (`computeUtmBreakdown`, `computeFunnelDeltas`) stay TDD-able and isolated from chart libraries. Offer-screen tracking goes through new `offer_events` table (created in Phase 1) via a small typed helper module.

**Tech Stack:** Same as Phase 2 — Next.js 16, React 19, Tailwind 4, Supabase, Vitest, jsdom, recharts (LineChart, PieChart), `@nivo/sankey` (already installed; not re-used in Phase 3), CSS variables in `app/(admin)/admin.css`.

**Existing infrastructure (do NOT recreate):**
- Phase 1 RPCs deployed: `get_admin_funnel_stats`, `get_offer_funnel`, `get_engagement_index`, `get_dropoff_zones` (etc.)
- Legacy RPCs: `get_page_summary(p_slug, p_from, p_to)`, `get_page_breakdowns(p_slug, p_from, p_to)`
- `lib/admin/page-queries.ts` — `getPagesSummary`, `getPageAnalytics`, `getLeads`, `getLeadCounts`
- `lib/admin/queries.ts` — legacy `getFunnelStats`
- `lib/admin/queries-v2.ts` — Phase 2 `periodToRange`, branch/engagement/dropoff helpers
- `components/admin/{KpiCard,TopBar,InsightCard,PageHeader,Sidebar,ScenarioSelector,DayTabs,PeriodFilter}.tsx`
- `offer_events` table (migration 007), RLS allows anon insert
- `lib/game/analytics.ts` already has the batch-flush queue + `trackEvent()` primitive
- Game offer screen lives in `components/game/screens/SchoolPitch.tsx` and uses `components/game/screens/CTABlock.tsx` (props `primaryUrl`, `secondaryUrl`, `onPrimaryClick`, `onSecondaryClick`). Triggered when `engine.flowState === 'school_cta'` in `app/(game)/game/play/page.tsx:447`.

**Branch:** `feature/dashboard-2-phase-1` (Phase 3 continues on the same branch — final merge to main happens after Phase 3 ships).

**Prod safety:** ADD-only migration. Reads only on existing tables. Offer-screen tracking is fire-and-forget — does not affect the actual CTA navigation.

---

## File Structure

### New files (production)

```
supabase/migrations/
└── 009_marketing_aggregates.sql        # RPCs: utm funnel, daily trends, offer breakdowns

lib/admin/
├── types-v2.ts                          # EXTEND: + UtmRow, DailyTrendRow, OfferBreakdownRow, OfferFunnel
├── queries-v2.ts                        # EXTEND: + getUtmFunnel, getDailyTrends, getOfferFunnel,
│                                        #   getOfferBreakdownByRating, getOfferBreakdownByUtm
├── marketing/
│   ├── computeUtmRollup.ts              # Pure: rows → grouped + sorted UTM table
│   └── computeFunnelDeltas.ts           # Pure: counts → step deltas + percentages

components/admin/charts/
├── FunnelBars.tsx                       # CSS-only horizontal bars for funnel steps
├── TrendLineChart.tsx                   # recharts LineChart for daily trends
└── DonutChart.tsx                       # recharts PieChart variant for source breakdown

lib/game/
└── offerEvents.ts                       # Typed helpers: trackOfferView, trackOfferCtaClick, trackOfferConversion

app/(admin)/admin/
├── overview/                            # REPLACE legacy file
│   ├── page.tsx
│   └── OverviewClient.tsx
├── funnel/
│   ├── page.tsx
│   └── FunnelClient.tsx
├── pages/                               # REPLACE legacy file
│   ├── page.tsx
│   └── PagesClient.tsx
└── offer/
    ├── page.tsx
    └── OfferClient.tsx
```

### Modified files

- `lib/admin/types-v2.ts` — add marketing types
- `lib/admin/queries-v2.ts` — add marketing query functions
- `components/game/screens/SchoolPitch.tsx` — wire `useEffect` to fire `offer_view` and `onPrimaryClick`/`onSecondaryClick` callbacks to fire `offer_cta_click`
- (no changes to gameStore, useGameEngine, or other game runtime — offer tracking lives in the SchoolPitch client component)

### New tests

```
lib/admin/marketing/__tests__/computeUtmRollup.test.ts
lib/admin/marketing/__tests__/computeFunnelDeltas.test.ts
lib/game/__tests__/offerEvents.test.ts
```

### Why this decomposition
- One migration consolidates all new aggregation RPCs.
- Pure transforms (`computeUtmRollup`, `computeFunnelDeltas`) handle layout-related math (sorting, percentages, deltas) so chart components stay dumb.
- Offer tracking is its own module (`lib/game/offerEvents.ts`) because it writes to a different table (`offer_events`, not `game_events`) and uses a session-based identity rather than `player_id` only.
- Each admin page = one server `page.tsx` + one client `*Client.tsx` (same pattern as Phase 2).

---

## Task 1: Migration 009 — marketing aggregates

**Files:**
- Create: `supabase/migrations/009_marketing_aggregates.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Phase 3: marketing aggregates for /admin/overview, /admin/funnel, /admin/offer.
-- ADD-only. No table/column alterations.
-- All functions STABLE + SECURITY DEFINER (read-only on game_events / players /
-- offer_events / completed_scenarios).

-- -----------------------------------------------------------------------------
-- get_utm_funnel: counts of distinct players at each funnel step, grouped by
-- utm_source (or '(none)' for direct traffic). One row per source per step.
-- -----------------------------------------------------------------------------
create or replace function public.get_utm_funnel(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  visitors bigint,
  registered bigint,
  started bigint,
  completed bigint
)
language sql
stable
security definer
as $$
  with players_in_range as (
    select id, coalesce(utm_source, '(none)') as src
    from public.players
    where (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  ),
  events_in_range as (
    select e.player_id, e.event_type
    from public.game_events e
    where (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
  ),
  starts as (
    select distinct player_id from events_in_range where event_type = 'day_started'
  ),
  completions as (
    select distinct player_id from public.completed_scenarios
    where (p_from is null or completed_at >= p_from)
      and (p_to is null or completed_at <= p_to)
  )
  select
    p.src as utm_source,
    count(distinct p.id)::bigint as visitors,
    count(distinct p.id)::bigint as registered,  -- registered == in players table
    count(distinct s.player_id)::bigint as started,
    count(distinct c.player_id)::bigint as completed
  from players_in_range p
  left join starts s on s.player_id = p.id
  left join completions c on c.player_id = p.id
  group by p.src
  order by visitors desc;
$$;

-- -----------------------------------------------------------------------------
-- get_daily_trends: per-day counts of key events for line charts.
-- Returns one row per day in the requested range.
-- -----------------------------------------------------------------------------
create or replace function public.get_daily_trends(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  registered bigint,
  game_started bigint,
  game_completed bigint
)
language sql
stable
security definer
as $$
  with date_series as (
    select generate_series(
      coalesce(p_from::date, current_date - interval '30 days'),
      coalesce(p_to::date, current_date),
      interval '1 day'
    )::date as d
  ),
  reg as (
    select created_at::date as d, count(*)::bigint as c
    from public.players
    where (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  starts as (
    select created_at::date as d, count(distinct player_id)::bigint as c
    from public.game_events
    where event_type = 'game_started'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  completes as (
    select created_at::date as d, count(distinct player_id)::bigint as c
    from public.game_events
    where event_type = 'game_completed'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select
    ds.d as bucket_date,
    coalesce(reg.c, 0) as registered,
    coalesce(starts.c, 0) as game_started,
    coalesce(completes.c, 0) as game_completed
  from date_series ds
  left join reg on reg.d = ds.d
  left join starts on starts.d = ds.d
  left join completes on completes.d = ds.d
  order by ds.d asc;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_breakdown_by_rating: offer events grouped by player's last rating.
-- Useful to see which player segment converts best.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_breakdown_by_rating(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  rating text,
  views bigint,
  clicks bigint
)
language sql
stable
security definer
as $$
  with player_rating as (
    -- Best rating per player across all completions
    select player_id,
      case
        when bool_or(rating = 'S') then 'S'
        when bool_or(rating = 'A') then 'A'
        when bool_or(rating = 'B') then 'B'
        when bool_or(rating = 'C') then 'C'
        else 'F'
      end as rating
    from public.completed_scenarios
    group by player_id
  ),
  enriched as (
    select oe.event_type, coalesce(pr.rating, 'unknown') as rating
    from public.offer_events oe
    left join player_rating pr on pr.player_id = oe.player_id
    where (p_from is null or oe.created_at >= p_from)
      and (p_to is null or oe.created_at <= p_to)
  )
  select
    rating,
    count(*) filter (where event_type = 'offer_view')::bigint as views,
    count(*) filter (where event_type = 'offer_cta_click')::bigint as clicks
  from enriched
  group by rating
  order by
    case rating when 'S' then 1 when 'A' then 2 when 'B' then 3 when 'C' then 4 when 'F' then 5 else 6 end;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_breakdown_by_utm: offer events grouped by player's utm_source.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_breakdown_by_utm(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  views bigint,
  clicks bigint
)
language sql
stable
security definer
as $$
  with enriched as (
    select oe.event_type, coalesce(p.utm_source, '(none)') as utm_source
    from public.offer_events oe
    left join public.players p on p.id = oe.player_id
    where (p_from is null or oe.created_at >= p_from)
      and (p_to is null or oe.created_at <= p_to)
  )
  select
    utm_source,
    count(*) filter (where event_type = 'offer_view')::bigint as views,
    count(*) filter (where event_type = 'offer_cta_click')::bigint as clicks
  from enriched
  group by utm_source
  order by views desc;
$$;
```

- [ ] **Step 2: Apply via Supabase MCP**

This step requires the controller (orchestrator) to apply the migration to remote Supabase. Stop here and report so the controller can call `mcp__plugin_supabase_supabase__apply_migration` with project_id `njbcybjdzjahpdmcjtqe`. Do NOT attempt to apply via shell yourself.

- [ ] **Step 3: Smoke test the RPCs (after apply)**

After the controller confirms the migration was applied, run a smoke test via SQL editor (the controller will do this):

```sql
select * from public.get_utm_funnel() limit 5;
select * from public.get_daily_trends() limit 5;
select * from public.get_offer_breakdown_by_rating() limit 5;
select * from public.get_offer_breakdown_by_utm() limit 5;
```

All 4 should return without error (likely empty until events accumulate).

- [ ] **Step 4: Commit the SQL file (independently of remote apply)**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
git add supabase/migrations/009_marketing_aggregates.sql
git commit -m "$(cat <<'EOF'
feat(db): marketing aggregates RPCs (migration 009)

get_utm_funnel, get_daily_trends, get_offer_breakdown_by_rating,
get_offer_breakdown_by_utm — feeds /admin/overview, /admin/funnel,
/admin/offer pages.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Extend `types-v2.ts` with marketing types

**Files:**
- Modify: `lib/admin/types-v2.ts`

- [ ] **Step 1: Append to the end of the file**

```typescript
// ---- Marketing (Phase 3) ----

export interface UtmFunnelRow {
  utm_source: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
}

export interface DailyTrendRow {
  bucket_date: string;        // ISO date YYYY-MM-DD
  registered: number;
  game_started: number;
  game_completed: number;
}

export interface OfferFunnel {
  game_completed: number;
  offer_view: number;
  offer_cta_click: number;
  offer_conversion: number;
}

export interface OfferBreakdownRow {
  segment: string;            // rating or utm_source value
  views: number;
  clicks: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  pctOfPrev: number;          // 0..100, NaN-safe (0 when prev is 0)
  pctOfTop: number;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/admin/types-v2.ts
git commit -m "$(cat <<'EOF'
feat(admin): types for Phase 3 (marketing) — UTM funnel, trends, offer breakdowns

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Extend `queries-v2.ts` with marketing queries (TDD)

**Files:**
- Modify: `lib/admin/queries-v2.ts`
- Modify: `lib/admin/__tests__/queries-v2.test.ts`

- [ ] **Step 1: Add failing tests at the END of `queries-v2.test.ts`**

Append these inside the existing top-level `describe('queries-v2', ...)` block, before its closing `});`. (The existing file imports `vi.mock` for `@/lib/supabase/admin` — re-use the same `mockRpc`.)

```typescript
  // -- Phase 3 marketing queries -------------------------------------------

  it('getUtmFunnel coerces all bigint columns to number', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { utm_source: 'instagram', visitors: '50', registered: '50', started: '40', completed: '20' },
      ],
      error: null,
    });
    const rows = await getUtmFunnel({ from: null, to: null });
    expect(mockRpc).toHaveBeenCalledWith('get_utm_funnel', { p_from: null, p_to: null });
    expect(rows[0]).toEqual({
      utm_source: 'instagram', visitors: 50, registered: 50, started: 40, completed: 20,
    });
  });

  it('getDailyTrends preserves date strings and coerces counts', async () => {
    mockRpc.mockResolvedValue({
      data: [{ bucket_date: '2026-04-10', registered: '5', game_started: '3', game_completed: '2' }],
      error: null,
    });
    const rows = await getDailyTrends({ from: null, to: null });
    expect(rows[0]).toEqual({
      bucket_date: '2026-04-10', registered: 5, game_started: 3, game_completed: 2,
    });
  });

  it('getOfferFunnelData coerces all 4 step counts and defaults zeros', async () => {
    mockRpc.mockResolvedValue({
      data: { game_completed: 10, offer_view: 8, offer_cta_click: 3, offer_conversion: 0 },
      error: null,
    });
    const f = await getOfferFunnelData({ from: null, to: null });
    expect(f).toEqual({ game_completed: 10, offer_view: 8, offer_cta_click: 3, offer_conversion: 0 });
  });

  it('getOfferFunnelData returns zeros when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const f = await getOfferFunnelData({ from: null, to: null });
    expect(f).toEqual({ game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0 });
  });

  it('getOfferBreakdownByRating renames rating → segment', async () => {
    mockRpc.mockResolvedValue({
      data: [{ rating: 'S', views: '4', clicks: '2' }, { rating: 'A', views: '6', clicks: '1' }],
      error: null,
    });
    const rows = await getOfferBreakdownByRating({ from: null, to: null });
    expect(rows).toEqual([
      { segment: 'S', views: 4, clicks: 2 },
      { segment: 'A', views: 6, clicks: 1 },
    ]);
  });

  it('getOfferBreakdownByUtm renames utm_source → segment', async () => {
    mockRpc.mockResolvedValue({
      data: [{ utm_source: 'instagram', views: '8', clicks: '3' }],
      error: null,
    });
    const rows = await getOfferBreakdownByUtm({ from: null, to: null });
    expect(rows).toEqual([{ segment: 'instagram', views: 8, clicks: 3 }]);
  });
```

Also add these imports at the TOP of the test file (next to the existing imports):
```typescript
import {
  getUtmFunnel,
  getDailyTrends,
  getOfferFunnelData,
  getOfferBreakdownByRating,
  getOfferBreakdownByUtm,
} from '@/lib/admin/queries-v2';
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 3: Append to `lib/admin/queries-v2.ts`**

```typescript
import type {
  UtmFunnelRow, DailyTrendRow, OfferFunnel, OfferBreakdownRow,
} from './types-v2';

interface DateRangeOnly {
  from: string | null;
  to: string | null;
}

export async function getUtmFunnel(args: DateRangeOnly): Promise<UtmFunnelRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_utm_funnel', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    utm_source: string; visitors: string | number; registered: string | number;
    started: string | number; completed: string | number;
  }) => ({
    utm_source: r.utm_source,
    visitors: Number(r.visitors),
    registered: Number(r.registered),
    started: Number(r.started),
    completed: Number(r.completed),
  }));
}

export async function getDailyTrends(args: DateRangeOnly): Promise<DailyTrendRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_daily_trends', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_daily_trends', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    bucket_date: string; registered: string | number;
    game_started: string | number; game_completed: string | number;
  }) => ({
    bucket_date: r.bucket_date,
    registered: Number(r.registered),
    game_started: Number(r.game_started),
    game_completed: Number(r.game_completed),
  }));
}

const ZERO_OFFER_FUNNEL: OfferFunnel = {
  game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0,
};

export async function getOfferFunnelData(args: DateRangeOnly): Promise<OfferFunnel> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_funnel', error.message);
    return ZERO_OFFER_FUNNEL;
  }
  if (!data) return ZERO_OFFER_FUNNEL;
  return {
    game_completed: Number((data as OfferFunnel).game_completed) || 0,
    offer_view: Number((data as OfferFunnel).offer_view) || 0,
    offer_cta_click: Number((data as OfferFunnel).offer_cta_click) || 0,
    offer_conversion: Number((data as OfferFunnel).offer_conversion) || 0,
  };
}

export async function getOfferBreakdownByRating(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_rating', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_rating', error.message);
    return [];
  }
  return (data ?? []).map((r: { rating: string; views: string | number; clicks: string | number }) => ({
    segment: r.rating,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}

export async function getOfferBreakdownByUtm(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_utm', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_utm', error.message);
    return [];
  }
  return (data ?? []).map((r: { utm_source: string; views: string | number; clicks: string | number }) => ({
    segment: r.utm_source,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

Expected: 12 PASS (6 from Phase 2 + 6 new).

- [ ] **Step 5: Commit**

```bash
git add lib/admin/queries-v2.ts lib/admin/__tests__/queries-v2.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): Phase 3 query wrappers — UTM funnel, daily trends, offer breakdowns

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `computeFunnelDeltas` transform (TDD)

**Files:**
- Create: `lib/admin/marketing/computeFunnelDeltas.ts`
- Create: `lib/admin/marketing/__tests__/computeFunnelDeltas.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';

describe('computeFunnelDeltas', () => {
  it('returns empty array for empty input', () => {
    expect(computeFunnelDeltas([])).toEqual([]);
  });

  it('returns 100% pctOfPrev and pctOfTop for single step', () => {
    expect(computeFunnelDeltas([{ label: 'a', value: 10 }])).toEqual([
      { label: 'a', value: 10, pctOfPrev: 100, pctOfTop: 100 },
    ]);
  });

  it('computes per-step retention and overall retention', () => {
    const steps = computeFunnelDeltas([
      { label: 'visitors', value: 100 },
      { label: 'registered', value: 80 },
      { label: 'started', value: 60 },
      { label: 'completed', value: 30 },
    ]);
    expect(steps).toEqual([
      { label: 'visitors', value: 100, pctOfPrev: 100, pctOfTop: 100 },
      { label: 'registered', value: 80, pctOfPrev: 80, pctOfTop: 80 },
      { label: 'started', value: 60, pctOfPrev: 75, pctOfTop: 60 },
      { label: 'completed', value: 30, pctOfPrev: 50, pctOfTop: 30 },
    ]);
  });

  it('returns 0 (not NaN) when previous step is 0', () => {
    const steps = computeFunnelDeltas([
      { label: 'a', value: 0 },
      { label: 'b', value: 5 },
    ]);
    expect(steps[1].pctOfPrev).toBe(0);
    expect(steps[1].pctOfTop).toBe(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/marketing/__tests__/computeFunnelDeltas.test.ts
```

- [ ] **Step 3: Implement**

```typescript
import type { FunnelStep } from '@/lib/admin/types-v2';

/**
 * Convert a sequence of (label, value) into funnel steps with per-step
 * retention (`pctOfPrev`) and overall retention (`pctOfTop`).
 *
 * NaN-safe: when the divisor is 0 the percentage is reported as 0 instead
 * of NaN/Infinity, so chart components don't render garbage.
 */
export function computeFunnelDeltas(
  steps: Array<{ label: string; value: number }>,
): FunnelStep[] {
  if (steps.length === 0) return [];
  const top = steps[0].value;
  return steps.map((s, i) => {
    const prev = i === 0 ? s.value : steps[i - 1].value;
    const pctOfPrev = prev > 0 ? (s.value / prev) * 100 : 0;
    const pctOfTop = top > 0 ? (s.value / top) * 100 : 0;
    return { label: s.label, value: s.value, pctOfPrev, pctOfTop };
  });
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/marketing/__tests__/computeFunnelDeltas.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/marketing/computeFunnelDeltas.ts lib/admin/marketing/__tests__/computeFunnelDeltas.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): computeFunnelDeltas — per-step + overall retention with NaN guards

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `computeUtmRollup` transform (TDD)

**Files:**
- Create: `lib/admin/marketing/computeUtmRollup.ts`
- Create: `lib/admin/marketing/__tests__/computeUtmRollup.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { computeUtmRollup } from '@/lib/admin/marketing/computeUtmRollup';
import type { UtmFunnelRow } from '@/lib/admin/types-v2';

describe('computeUtmRollup', () => {
  it('returns empty object on empty input', () => {
    expect(computeUtmRollup([])).toEqual({ rows: [], totals: { visitors: 0, registered: 0, started: 0, completed: 0 } });
  });

  it('computes per-source conversion and totals', () => {
    const rows: UtmFunnelRow[] = [
      { utm_source: 'instagram', visitors: 100, registered: 100, started: 60, completed: 30 },
      { utm_source: '(none)',    visitors: 50,  registered: 50,  started: 40, completed: 25 },
    ];
    const out = computeUtmRollup(rows);
    expect(out.totals).toEqual({ visitors: 150, registered: 150, started: 100, completed: 55 });
    expect(out.rows[0].source).toBe('instagram');
    expect(out.rows[0].completionRate).toBeCloseTo(30, 1);
    expect(out.rows[1].completionRate).toBeCloseTo(50, 1);
  });

  it('sorts by completion rate descending', () => {
    const out = computeUtmRollup([
      { utm_source: 'low', visitors: 100, registered: 100, started: 50, completed: 5 },
      { utm_source: 'high', visitors: 20, registered: 20, started: 18, completed: 15 },
      { utm_source: 'mid', visitors: 50, registered: 50, started: 40, completed: 20 },
    ]);
    expect(out.rows.map((r) => r.source)).toEqual(['high', 'mid', 'low']);
  });

  it('treats divisions by zero as 0 not NaN', () => {
    const out = computeUtmRollup([
      { utm_source: 'empty', visitors: 0, registered: 0, started: 0, completed: 0 },
    ]);
    expect(out.rows[0].completionRate).toBe(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/marketing/__tests__/computeUtmRollup.test.ts
```

- [ ] **Step 3: Implement**

```typescript
import type { UtmFunnelRow } from '@/lib/admin/types-v2';

export interface UtmRollupRow {
  source: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  completionRate: number;       // 0..100, % of visitors who completed
}

export interface UtmRollupTotals {
  visitors: number;
  registered: number;
  started: number;
  completed: number;
}

export interface UtmRollup {
  rows: UtmRollupRow[];
  totals: UtmRollupTotals;
}

/**
 * Rolls UTM funnel rows into a sorted list (best converters first) plus
 * column totals. Conversion rate = completed/visitors * 100, clamped to
 * non-NaN (zero-visitor sources show 0%).
 */
export function computeUtmRollup(input: UtmFunnelRow[]): UtmRollup {
  const totals: UtmRollupTotals = { visitors: 0, registered: 0, started: 0, completed: 0 };
  const rows: UtmRollupRow[] = input.map((r) => {
    totals.visitors += r.visitors;
    totals.registered += r.registered;
    totals.started += r.started;
    totals.completed += r.completed;
    const completionRate = r.visitors > 0 ? (r.completed / r.visitors) * 100 : 0;
    return {
      source: r.utm_source,
      visitors: r.visitors,
      registered: r.registered,
      started: r.started,
      completed: r.completed,
      completionRate,
    };
  });
  rows.sort((a, b) => b.completionRate - a.completionRate);
  return { rows, totals };
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/marketing/__tests__/computeUtmRollup.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/marketing/computeUtmRollup.ts lib/admin/marketing/__tests__/computeUtmRollup.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): computeUtmRollup — UTM funnel rows → sorted table + totals

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Offer event helpers + tracking (TDD)

**Files:**
- Create: `lib/game/offerEvents.ts`
- Create: `lib/game/__tests__/offerEvents.test.ts`
- Modify: `components/game/screens/SchoolPitch.tsx`

- [ ] **Step 1: Write failing test for the helpers**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import {
  trackOfferView,
  trackOfferCtaClick,
  trackOfferConversion,
  getOfferSessionId,
} from '@/lib/game/offerEvents';

describe('offerEvents', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    sessionStorage.clear();
  });

  it('getOfferSessionId returns same id on repeat calls', () => {
    const a = getOfferSessionId();
    const b = getOfferSessionId();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('trackOfferView inserts an offer_view row', async () => {
    await trackOfferView({ playerId: 'p1', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_view');
    expect(row.player_id).toBe('p1');
    expect(row.variant_id).toBe('default');
    expect(row.session_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('trackOfferCtaClick records cta_id', async () => {
    await trackOfferCtaClick({ playerId: 'p1', ctaId: 'primary', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_cta_click');
    expect(row.cta_id).toBe('primary');
  });

  it('trackOfferConversion fires offer_conversion', async () => {
    await trackOfferConversion({ playerId: 'p1', variantId: 'default' });
    await new Promise((r) => setTimeout(r, 0));
    const row = mockInsert.mock.calls[0][0];
    expect(row.event_type).toBe('offer_conversion');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/game/__tests__/offerEvents.test.ts
```

- [ ] **Step 3: Implement `lib/game/offerEvents.ts`**

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const SESSION_KEY = 'ss_offer_sid';

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

async function insert(row: Record<string, unknown>): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('offer_events').insert(row);
  } catch (e) {
    console.warn('[offerEvents] insert failed:', e);
  }
}

export async function trackOfferView(args: BaseArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_view',
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferCtaClick(args: CtaClickArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_cta_click',
    cta_id: args.ctaId,
    variant_id: args.variantId ?? 'default',
  });
}

export async function trackOfferConversion(args: BaseArgs): Promise<void> {
  await insert({
    player_id: args.playerId,
    session_id: getOfferSessionId(),
    event_type: 'offer_conversion',
    variant_id: args.variantId ?? 'default',
  });
}
```

- [ ] **Step 4: Run helpers test — expect PASS (4 tests)**

```bash
npx vitest run lib/game/__tests__/offerEvents.test.ts
```

- [ ] **Step 5: Wire tracking into `SchoolPitch.tsx`**

Read the current `components/game/screens/SchoolPitch.tsx`. The relevant part: it renders a `<CTABlock>` with `primaryUrl`, `secondaryUrl` (or `onPrimaryClick` / `onSecondaryClick`). The screen receives a `playerId` somehow (check current props — if not, accept it from the parent in `app/(game)/game/play/page.tsx`). Add:

1. At the top of the component, fire `trackOfferView` once on mount:
   ```typescript
   import { useEffect } from 'react';
   import { trackOfferView, trackOfferCtaClick } from '@/lib/game/offerEvents';

   // inside component:
   useEffect(() => {
     trackOfferView({ playerId: playerId ?? null });
   }, [playerId]);
   ```

2. Wire CTA callbacks. In the JSX where `<CTABlock ... />` is rendered, replace direct URL props with `onPrimaryClick` / `onSecondaryClick` wrappers that fire the tracking THEN open the URL:
   ```typescript
   const handlePrimaryClick = () => {
     trackOfferCtaClick({ playerId: playerId ?? null, ctaId: 'primary' });
     if (primaryUrl) window.open(primaryUrl, '_blank');
   };
   const handleSecondaryClick = () => {
     trackOfferCtaClick({ playerId: playerId ?? null, ctaId: 'secondary' });
     if (secondaryUrl) window.open(secondaryUrl, '_blank');
   };

   // In JSX:
   <CTABlock
     primaryTitle={...}
     primarySubtitle={...}
     onPrimaryClick={handlePrimaryClick}     // not primaryUrl
     secondaryTitle={...}
     onSecondaryClick={handleSecondaryClick}  // not secondaryUrl
   />
   ```

3. Make sure `playerId` is accessible. If it isn't currently a prop, add it: read existing props in SchoolPitch.tsx; if `playerId` is missing, add it as an optional prop and pass it from the place that renders `<SchoolPitch />` (likely `app/(game)/game/play/page.tsx` where you can read `engine.player?.id`).

The implementer must inspect the existing file and adapt accordingly — the contract is: `offer_view` fires once when the screen first mounts; `offer_cta_click` fires for both primary and secondary buttons before navigation.

- [ ] **Step 6: Verify build + tests still green**

```bash
npx tsc --noEmit && npm test && npm run build
```

Expected: type-clean, 4 new tests pass on top of the running total, build OK.

- [ ] **Step 7: Commit**

```bash
git add lib/game/offerEvents.ts lib/game/__tests__/offerEvents.test.ts components/game/screens/SchoolPitch.tsx "app/(game)/game/play/page.tsx"
git commit -m "$(cat <<'EOF'
feat(game): instrument SchoolPitch — offer_view + offer_cta_click → offer_events

session_id from sessionStorage so we can dedupe within a browser session.
playerId may be null for visitors who hit the offer screen without a
registered player_id.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Adjust the `git add` line if SchoolPitch is not actually modified — e.g. only the play page wraps it. Add only files that actually changed.)

---

## Task 7: `FunnelBars` chart component

**Files:**
- Create: `components/admin/charts/FunnelBars.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import type { FunnelStep } from '@/lib/admin/types-v2';

export interface FunnelBarsProps {
  steps: FunnelStep[];
}

const COLORS = ['#8b5cf6', '#a78bfa', '#ec4899', '#f472b6', '#10b981'];

/**
 * CSS-only horizontal bars for a marketing funnel. Each row shows the
 * absolute count, the % retained from the previous step, and the % of
 * top funnel reach. Width is proportional to pctOfTop.
 */
export default function FunnelBars({ steps }: FunnelBarsProps) {
  if (steps.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((s, i) => {
        const color = COLORS[Math.min(i, COLORS.length - 1)];
        return (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                <strong style={{ color: 'var(--admin-text)' }}>
                  {s.value.toLocaleString('ru-RU')}
                </strong>
                {i > 0 && (
                  <> · <span style={{ color: s.pctOfPrev < 50 ? 'var(--admin-accent-warn)' : 'var(--admin-accent-success)' }}>
                    {s.pctOfPrev.toFixed(0)}% от пред.
                  </span></>
                )}
              </div>
            </div>
            <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(2, s.pctOfTop)}%`,
                  height: '100%',
                  background: color,
                  transition: 'width 0.3s',
                }}
              />
            </div>
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
git add components/admin/charts/FunnelBars.tsx
git commit -m "$(cat <<'EOF'
feat(admin): FunnelBars — CSS funnel with per-step retention coloring

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `TrendLineChart` component

**Files:**
- Create: `components/admin/charts/TrendLineChart.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyTrendRow } from '@/lib/admin/types-v2';

export interface TrendLineChartProps {
  rows: DailyTrendRow[];
  height?: number;
}

export default function TrendLineChart({ rows, height = 280 }: TrendLineChartProps) {
  if (rows.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  const data = rows.map((r) => ({
    date: r.bucket_date.slice(5),  // MM-DD
    'Регистраций': r.registered,
    'Начали игру': r.game_started,
    'Завершили': r.game_completed,
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="Регистраций" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Начали игру" stroke="#ec4899" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Завершили" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/TrendLineChart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): TrendLineChart — three-series daily trend recharts wrapper

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `DonutChart` component

**Files:**
- Create: `components/admin/charts/DonutChart.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface DonutSlice {
  label: string;
  value: number;
}

export interface DonutChartProps {
  slices: DonutSlice[];
  height?: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#a78bfa', '#f472b6'];

/**
 * Recharts donut (PieChart with innerRadius). Empty-data guard renders
 * a friendly placeholder.
 */
export default function DonutChart({ slices, height = 240 }: DonutChartProps) {
  if (slices.length === 0 || slices.every((s) => s.value === 0)) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
          >
            {slices.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/DonutChart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): DonutChart — recharts donut wrapper for source breakdowns

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `/admin/overview` page (REWRITE legacy)

**Files:**
- Modify (REPLACE contents): `app/(admin)/admin/overview/page.tsx`
- Create: `app/(admin)/admin/overview/OverviewClient.tsx`

- [ ] **Step 1: Server `page.tsx`**

```typescript
import { Suspense } from 'react';
import OverviewClient from './OverviewClient';

export const revalidate = 60;
export const metadata = { title: 'Overview — Sales School' };

export default function OverviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <OverviewClient />
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
import PeriodFilter from '@/components/admin/PeriodFilter';
import FunnelBars from '@/components/admin/charts/FunnelBars';
import TrendLineChart from '@/components/admin/charts/TrendLineChart';
import { getDailyTrends, getUtmFunnel, getOfferFunnelData, periodToRange } from '@/lib/admin/queries-v2';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';
import type { DailyTrendRow, OfferFunnel, UtmFunnelRow, Period } from '@/lib/admin/types-v2';

export default function OverviewClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [trends, setTrends] = useState<DailyTrendRow[]>([]);
  const [utm, setUtm] = useState<UtmFunnelRow[]>([]);
  const [offer, setOffer] = useState<OfferFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    Promise.all([
      getDailyTrends(range),
      getUtmFunnel(range),
      getOfferFunnelData(range),
    ]).then(([t, u, o]) => {
      if (cancelled) return;
      setTrends(t); setUtm(u); setOffer(o); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  const totals = useMemo(() => {
    return utm.reduce(
      (acc, r) => ({
        visitors: acc.visitors + r.visitors,
        registered: acc.registered + r.registered,
        started: acc.started + r.started,
        completed: acc.completed + r.completed,
      }),
      { visitors: 0, registered: 0, started: 0, completed: 0 },
    );
  }, [utm]);

  const funnelSteps = useMemo(() => computeFunnelDeltas([
    { label: 'Зарегистрированы', value: totals.registered },
    { label: 'Начали игру',      value: totals.started },
    { label: 'Завершили игру',   value: totals.completed },
    { label: 'Дошли до оффера',  value: offer?.offer_view ?? 0 },
    { label: 'Кликнули CTA',     value: offer?.offer_cta_click ?? 0 },
  ]), [totals, offer]);

  const conversionPct = totals.registered > 0 && offer
    ? ((offer.offer_cta_click / totals.registered) * 100).toFixed(1)
    : '—';

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Главные показатели воронки и тренды по дням."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Игроков" value={totals.registered.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Начали игру" value={totals.started.toLocaleString('ru-RU')} accent="pink" />
        <KpiCard label="Завершили" value={totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Конверсия в CTA"
          value={typeof conversionPct === 'string' ? conversionPct + '%' : '—'}
          accent="orange"
          hint="кликнули CTA / зарегистрированы"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Динамика по дням
          </div>
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
          ) : (
            <TrendLineChart rows={trends} />
          )}
        </div>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Воронка
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : (
            <FunnelBars steps={funnelSteps} />
          )}
        </div>
      </div>

      {totals.registered > 0 && totals.completed / totals.registered < 0.1 && (
        <InsightCard
          tone="warning"
          title="Низкое прохождение"
          body={
            <>
              Только {((totals.completed / totals.registered) * 100).toFixed(1)}% игроков завершают игру.
              Посмотри <a href="/admin/dropoff" style={{ textDecoration: 'underline' }}>Drop-off Zones</a>,
              чтобы понять где они отваливаются.
            </>
          }
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/overview/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/overview — funnel + daily trends + auto insight

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `/admin/funnel` page

**Files:**
- Create: `app/(admin)/admin/funnel/page.tsx`
- Create: `app/(admin)/admin/funnel/FunnelClient.tsx`

- [ ] **Step 1: Server**

```typescript
import { Suspense } from 'react';
import FunnelClient from './FunnelClient';

export const revalidate = 60;
export const metadata = { title: 'Funnel & UTM — Sales School' };

export default function FunnelPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <FunnelClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DonutChart from '@/components/admin/charts/DonutChart';
import { getUtmFunnel, periodToRange } from '@/lib/admin/queries-v2';
import { computeUtmRollup } from '@/lib/admin/marketing/computeUtmRollup';
import type { UtmFunnelRow, Period } from '@/lib/admin/types-v2';

export default function FunnelClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [rows, setRows] = useState<UtmFunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUtmFunnel(periodToRange(period)).then((r) => {
      if (cancelled) return;
      setRows(r); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  const rollup = useMemo(() => computeUtmRollup(rows), [rows]);
  const slices = rollup.rows.map((r) => ({ label: r.source, value: r.visitors }));

  return (
    <div>
      <PageHeader
        title="Funnel & UTM"
        subtitle="Воронка по источникам трафика — какие каналы дают качественных игроков."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Источников" value={rollup.rows.length} accent="violet" />
        <KpiCard label="Всего игроков" value={rollup.totals.visitors.toLocaleString('ru-RU')} accent="pink" />
        <KpiCard label="Завершили" value={rollup.totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Лучший источник"
          value={rollup.rows[0]?.source ?? '—'}
          hint={rollup.rows[0] ? `${rollup.rows[0].completionRate.toFixed(1)}% completion` : undefined}
          accent="orange"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="admin-card" style={{ padding: 16, overflowX: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            Источники по конверсии
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : rollup.rows.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных за период</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Источник</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Игроков</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Начали</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Завершили</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Конверсия</th>
                </tr>
              </thead>
              <tbody>
                {rollup.rows.map((r) => (
                  <tr key={r.source} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 6px', fontWeight: 600, color: 'var(--admin-text)' }}>{r.source}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.visitors}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.started}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.completed}</td>
                    <td style={{
                      padding: '8px 6px', textAlign: 'right', fontWeight: 700,
                      color: r.completionRate >= 30 ? 'var(--admin-accent-success)' :
                             r.completionRate >= 15 ? 'var(--admin-accent-warn)' :
                             'var(--admin-accent-danger)',
                    }}>
                      {r.completionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Доли источников
          </div>
          <DonutChart slices={slices} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/funnel/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/funnel — UTM funnel table + donut + KPIs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `/admin/pages` page (REWRITE legacy)

**Files:**
- Modify (REPLACE contents): `app/(admin)/admin/pages/page.tsx`
- Create: `app/(admin)/admin/pages/PagesClient.tsx`

- [ ] **Step 1: Server**

```typescript
import { Suspense } from 'react';
import PagesClient from './PagesClient';

export const revalidate = 60;
export const metadata = { title: 'Pages — Sales School' };

export default function PagesAdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <PagesClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { getPagesSummary } from '@/lib/admin/page-queries';
import { periodToRange } from '@/lib/admin/queries-v2';
import type { PageSummary } from '@/lib/admin/types';
import type { Period } from '@/lib/admin/types-v2';

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

function fmtDuration(ms: number) {
  if (ms < 1000) return '0с';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}с`;
  return `${Math.floor(s / 60)}м ${s % 60}с`;
}

interface PageCardProps {
  data: PageSummary;
}

function PageCard({ data }: PageCardProps) {
  return (
    <div className="admin-card" style={{ padding: 16, minWidth: 240 }}>
      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
        /{data.page_slug}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', margin: '4px 0' }}>
        {fmt(data.total_views)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>просмотров</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12,
        fontSize: 11, color: 'var(--admin-text-muted)',
      }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: 13 }}>{fmt(data.unique_visitors)}</div>
          <div>Уник. визиторов</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: 13 }}>{fmtDuration(data.avg_duration_ms)}</div>
          <div>Среднее время</div>
        </div>
        <div>
          <div style={{
            fontWeight: 700, fontSize: 13,
            color: data.bounce_rate > 60 ? 'var(--admin-accent-warn)' : 'var(--admin-text)',
          }}>{data.bounce_rate.toFixed(0)}%</div>
          <div>Bounce</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-accent-success)', fontSize: 13 }}>{data.conversion_rate.toFixed(1)}%</div>
          <div>В заявку</div>
        </div>
      </div>
    </div>
  );
}

export default function PagesClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    const from = range.from ? new Date(range.from) : new Date(Date.now() - 30 * 86400_000);
    const to = range.to ? new Date(range.to) : new Date();
    getPagesSummary(from, to).then((p) => {
      if (cancelled) return;
      setPages(p); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  const totalViews = pages.reduce((acc, p) => acc + p.total_views, 0);
  const totalUnique = pages.reduce((acc, p) => acc + p.unique_visitors, 0);
  const avgBounce = pages.length > 0 ? pages.reduce((a, p) => a + p.bounce_rate, 0) / pages.length : 0;

  return (
    <div>
      <PageHeader
        title="Pages Analytics"
        subtitle="Поведение на маркетинговых лендингах — просмотры, bounce, конверсия."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего просмотров" value={totalViews.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Уник. визиторов" value={totalUnique.toLocaleString('ru-RU')} accent="pink" />
        <KpiCard label="Средний bounce" value={`${avgBounce.toFixed(0)}%`} accent="orange" />
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
      ) : (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {pages.map((p) => <PageCard key={p.page_slug} data={p} />)}
        </div>
      )}

      {!loading && pages.every((p) => p.total_views === 0) && (
        <div className="admin-card" style={{ padding: 28, textAlign: 'center', marginTop: 16, color: 'var(--admin-text-dim)', fontSize: 13 }}>
          Пока нет данных. Включи трекинг страниц с помощью <code>initPageTracking()</code>.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/pages/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/pages — Premium-style PageCard grid + KPIs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: `/admin/offer` page

**Files:**
- Create: `app/(admin)/admin/offer/page.tsx`
- Create: `app/(admin)/admin/offer/OfferClient.tsx`

- [ ] **Step 1: Server**

```typescript
import { Suspense } from 'react';
import OfferClient from './OfferClient';

export const revalidate = 60;
export const metadata = { title: 'Offer Conversion — Sales School' };

export default function OfferPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <OfferClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import FunnelBars from '@/components/admin/charts/FunnelBars';
import { getOfferFunnelData, getOfferBreakdownByRating, getOfferBreakdownByUtm, periodToRange } from '@/lib/admin/queries-v2';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';
import type { OfferFunnel, OfferBreakdownRow, Period } from '@/lib/admin/types-v2';

export default function OfferClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [funnel, setFunnel] = useState<OfferFunnel | null>(null);
  const [byRating, setByRating] = useState<OfferBreakdownRow[]>([]);
  const [byUtm, setByUtm] = useState<OfferBreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    Promise.all([
      getOfferFunnelData(range),
      getOfferBreakdownByRating(range),
      getOfferBreakdownByUtm(range),
    ]).then(([f, r, u]) => {
      if (cancelled) return;
      setFunnel(f); setByRating(r); setByUtm(u); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  const steps = useMemo(() => computeFunnelDeltas([
    { label: 'Завершили игру', value: funnel?.game_completed ?? 0 },
    { label: 'Увидели оффер',  value: funnel?.offer_view ?? 0 },
    { label: 'Кликнули CTA',   value: funnel?.offer_cta_click ?? 0 },
    { label: 'Конверсия',      value: funnel?.offer_conversion ?? 0 },
  ]), [funnel]);

  const ctr = funnel && funnel.offer_view > 0
    ? (funnel.offer_cta_click / funnel.offer_view) * 100
    : 0;

  const bestRating = useMemo(() => {
    return [...byRating].sort((a, b) => {
      const ra = a.views > 0 ? a.clicks / a.views : 0;
      const rb = b.views > 0 ? b.clicks / b.views : 0;
      return rb - ra;
    })[0];
  }, [byRating]);

  return (
    <div>
      <PageHeader
        title="Offer Conversion"
        subtitle="Финальная оффер-страница — кто видит, кто кликает, кто конвертируется."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Просмотров оффера" value={funnel?.offer_view ?? 0} accent="violet" />
        <KpiCard label="Кликов CTA" value={funnel?.offer_cta_click ?? 0} accent="pink" />
        <KpiCard
          label="CTR"
          value={`${ctr.toFixed(1)}%`}
          accent="green"
          hint="кликов / просмотров"
        />
        <KpiCard
          label="Лучший rating"
          value={bestRating?.segment ?? '—'}
          hint={bestRating && bestRating.views > 0 ? `${((bestRating.clicks / bestRating.views) * 100).toFixed(0)}% CTR` : undefined}
          accent="orange"
        />
      </div>

      {ctr < 5 && funnel && funnel.offer_view > 10 && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="danger"
            title="Низкий CTR"
            body="CTR ниже 5% при значительном трафике. Стоит пересмотреть текст CTA или оффер целиком."
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
          Воронка оффера
        </div>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
        ) : (
          <FunnelBars steps={steps} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            CTR по рейтингу игрока
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : byRating.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Rating</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {byRating.map((r) => {
                  const rate = r.views > 0 ? (r.clicks / r.views) * 100 : 0;
                  return (
                    <tr key={r.segment} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.segment}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            CTR по UTM-источнику
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : byUtm.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Источник</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {byUtm.map((r) => {
                  const rate = r.views > 0 ? (r.clicks / r.views) * 100 : 0;
                  return (
                    <tr key={r.segment} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.segment}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
git add "app/(admin)/admin/offer/"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/offer — funnel + CTR by rating/UTM + low-CTR insight

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Final verification

**Files:** none (manual + automated checks).

- [ ] **Step 1: Type check + tests + build**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit && npm test && npm run build
```

Expected: all green; ~351 tests (345 from Phase 2 + 4 offerEvents + 4 funnelDeltas + 4 utmRollup + 6 queries-v2 = ~363 — count varies slightly).

- [ ] **Step 2: Dev server smoke**

```bash
npm run dev
```

In a browser:
- http://localhost:3000/admin/overview — funnel bars + line chart render (placeholder if no data)
- http://localhost:3000/admin/funnel — UTM table + donut
- http://localhost:3000/admin/pages — 2 page cards (`home`, `target`) with KPIs
- http://localhost:3000/admin/offer — offer funnel + CTR tables
- Filters work; switching period re-fetches.

- [ ] **Step 3: Generate offer events to verify tracking**

Pass through the game once (http://localhost:3000/game) and reach the offer screen. Then in Supabase SQL editor:
```sql
select event_type, count(*) from offer_events
where created_at > now() - interval '5 minutes'
group by event_type;
```
Expected rows: `offer_view` (≥1), and `offer_cta_click` if you clicked.

Refresh `/admin/offer` — KPIs and funnel bars should update.

---

## Verification Summary (end of Phase 3)

1. `npm test` — all tests pass.
2. `npm run build` — production build succeeds, 4 new admin routes.
3. Migration 009 applied to remote Supabase, 4 new RPCs return correct shapes.
4. Game offer screen fires `offer_view` on mount, `offer_cta_click` on each CTA button click.
5. `/admin/{overview,funnel,pages,offer}` all render with real or empty data.
6. Phase 1, 2 routes still functional.

## Out of scope (deferred)

- A/B variant comparison on the offer page — needs a `variant_id` decision in the SchoolPitch (currently always 'default').
- Cohort retention by source on `/admin/funnel`.
- Server-side ROI calc (cost-per-source) — needs CPC input.
- `offer_conversion` event source — currently always 0 because there's no on-page form yet. Will populate once the school-CTA flow lands a registration form.
