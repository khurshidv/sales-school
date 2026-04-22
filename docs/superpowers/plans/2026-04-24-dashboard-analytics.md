# Phase 3 — Аналитика (Overview + Funnel + Dropoff + Engagement)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переработать 4 аналитические страницы дашборда (`/admin/overview`, `/admin/funnel`, `/admin/dropoff`, `/admin/engagement`) по результатам аудита 2026-04-22 (Priority 2) — вернуть маркетологу CR/CPL/ROAS, заменить абсолюты rate-based метриками, подключить `resolveNodeLabel` там где до сих пор показывается raw `node_id`, добавить retention/breakdown-метрики для вовлечённости.

**Архитектура:** Клиент — `*Client.tsx` под `app/(admin)/admin/{page}/`. Все API за `requireAdmin` в `app/api/admin/{page}/route.ts`. Тяжёлые агрегации — SQL RPC (ADD-only миграции 025–029). Общие компоненты — `components/admin/{shared|analytics}/`. Конфиг `THRESHOLDS` расширяется. Shareable период уже есть через `usePeriodParam`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript (strict) · Supabase (Postgres RPC + service_role) · Tailwind 4 + inline styles (`--admin-*` vars) · lucide-react · ADD-only миграции через Supabase MCP (project `njbcybjdzjahpdmcjtqe`).

**Scope:**

| Блок | Страница | Переработка | Задач |
|---|---|---|---|
| A | Foundation (миграции, thresholds, shared UI) | новое | 6 |
| B | Overview | ~60% | 6 |
| C | Funnel & UTM | ~70% | 7 |
| D | Dropoff | ~70% | 6 |
| E | Engagement | ~55% | 6 |
| **Σ** | | | **31** |

---

## Блок A. Foundation (shared migrations + UI)

### Задача A.1: Миграция `025_utm_spend.sql` — расходы по UTM для CPL/ROAS

**Files:**
- Create: `supabase/migrations/025_utm_spend.sql`

**Зачем:** Funnel без CPL/ROAS — аудит пункт #4 (Funnel). Нужна ручная таблица расходов по UTM-источнику на дневной bucket — админ сможет вбивать месячные данные из Bitrix/рекламных кабинетов.

- [ ] **Шаг 1: SQL-миграция (ADD-only, без RLS — админ-сервис хостится)**

```sql
-- 025_utm_spend.sql
-- ADD-only: stores manual UTM spend input for CPL/ROAS calculations.
-- Admin posts daily/weekly spend aggregates via /api/admin/utm-spend.

create table if not exists public.utm_spend (
  id uuid primary key default gen_random_uuid(),
  bucket_date date not null,
  utm_source text not null,
  utm_medium text,
  utm_campaign text,
  amount_kzt numeric(14,2) not null check (amount_kzt >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_date, utm_source, utm_medium, utm_campaign)
);

create index if not exists utm_spend_date_idx on public.utm_spend(bucket_date desc);
create index if not exists utm_spend_source_idx on public.utm_spend(utm_source);

-- trigger for updated_at
create or replace function public.tg_utm_spend_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_utm_spend_updated on public.utm_spend;
create trigger trg_utm_spend_updated
  before update on public.utm_spend
  for each row execute function public.tg_utm_spend_updated();

-- RPC: sum spend for a period, grouped by utm_source
create or replace function public.get_utm_spend_rollup(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  total_kzt numeric,
  days bigint
)
language sql stable security definer
as $$
  select utm_source, sum(amount_kzt)::numeric as total_kzt, count(distinct bucket_date)::bigint as days
  from public.utm_spend
  where (p_from is null or bucket_date >= p_from::date)
    and (p_to is null or bucket_date <= p_to::date)
  group by utm_source
  order by total_kzt desc;
$$;
```

- [ ] **Шаг 2: Применить через Supabase MCP** `mcp__plugin_supabase_supabase__apply_migration`
- [ ] **Шаг 3: Sanity check** — `execute_sql("select * from utm_spend limit 1")` (пустая ok)
- [ ] **Шаг 4: Commit**

```bash
git add supabase/migrations/025_utm_spend.sql
git commit -m "feat(db): utm_spend table + rollup RPC for CPL/ROAS"
```

---

### Задача A.2: Миграция `026_retention_rpc.sql` — D1/D7 retention

**Files:**
- Create: `supabase/migrations/026_retention_rpc.sql`

**Зачем:** Engagement аудит: «нет retention D1/D7». Считаем процент игроков, вернувшихся в игру через 1 и 7 дней после `game_started`.

- [ ] **Шаг 1: SQL**

```sql
-- 026_retention_rpc.sql
-- D1 / D7 retention: players who returned to the game N days after first game_started.
-- A "return" = any event_type in ('game_started','day_started','heartbeat','choice_made')
-- with created_at >= first_start + N days, < first_start + N+1 days.

create or replace function public.get_retention(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  cohort_date date,
  cohort_size bigint,
  d1_returned bigint,
  d7_returned bigint
)
language sql stable security definer
as $$
  with first_start as (
    select player_id, min(created_at)::date as start_date, min(created_at) as start_at
    from public.game_events
    where event_type = 'game_started'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by player_id
  ),
  d1 as (
    select distinct f.player_id
    from first_start f
    join public.game_events e
      on e.player_id = f.player_id
     and e.created_at >= f.start_at + interval '1 day'
     and e.created_at <  f.start_at + interval '2 day'
  ),
  d7 as (
    select distinct f.player_id
    from first_start f
    join public.game_events e
      on e.player_id = f.player_id
     and e.created_at >= f.start_at + interval '7 day'
     and e.created_at <  f.start_at + interval '8 day'
  )
  select
    f.start_date as cohort_date,
    count(*)::bigint as cohort_size,
    count(d1.player_id)::bigint as d1_returned,
    count(d7.player_id)::bigint as d7_returned
  from first_start f
  left join d1 on d1.player_id = f.player_id
  left join d7 on d7.player_id = f.player_id
  group by f.start_date
  order by f.start_date desc;
$$;
```

- [ ] **Шаг 2: Apply migration**
- [ ] **Шаг 3: Sanity check** — `execute_sql("select * from get_retention() limit 5")`
- [ ] **Шаг 4: Commit**

---

### Задача A.3: Миграция `027_dropoff_rate_rpc.sql` — drop-off с знаменателем

**Files:**
- Create: `supabase/migrations/027_dropoff_rate_rpc.sql`

**Зачем:** Dropoff аудит пункт #1 (CRITICAL): сейчас только абсолюты. Нужен rate = dropoff_count / entered_count.

- [ ] **Шаг 1: SQL**

```sql
-- 027_dropoff_rate_rpc.sql
-- Returns drop-off with the denominator (node visits) so the UI can show rate, not just count.
-- drop-off = game_events.event_type = 'dropped_off' (or last heartbeat per session older than 15 min)
-- For MVP: use explicit 'dropped_off' event.

create or replace function public.get_dropoff_rate(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_min_visits int default 20
)
returns table (
  node_id text,
  day_id text,
  dropoff_count bigint,
  entered_count bigint,
  dropoff_rate numeric,
  avg_time_on_node_ms numeric
)
language sql stable security definer
as $$
  with visits as (
    select (event_data->>'node_id') as node_id, day_id, count(*)::bigint as entered
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1, 2
  ),
  drops as (
    select
      coalesce(event_data->>'node_id', event_data->>'last_node_id') as node_id,
      day_id,
      count(*)::bigint as drops,
      avg(nullif((event_data->>'time_on_node_ms')::numeric, 0)) as avg_t
    from public.game_events
    where event_type = 'dropped_off'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1, 2
  )
  select
    v.node_id,
    v.day_id,
    coalesce(d.drops, 0) as dropoff_count,
    v.entered as entered_count,
    case when v.entered > 0 then coalesce(d.drops, 0)::numeric / v.entered else 0 end as dropoff_rate,
    d.avg_t as avg_time_on_node_ms
  from visits v
  left join drops d on d.node_id = v.node_id and d.day_id = v.day_id
  where v.entered >= p_min_visits
  order by dropoff_rate desc, dropoff_count desc
  limit 100;
$$;
```

- [ ] **Шаг 2: Apply + sanity check** (`select * from get_dropoff_rate('car-dealership') limit 5`)
- [ ] **Шаг 3: Commit**

---

### Задача A.4: Миграция `028_engagement_breakdown_rpc.sql` — thinking percentiles + сегменты

**Files:**
- Create: `supabase/migrations/028_engagement_breakdown_rpc.sql`

**Зачем:** Engagement аудит #5 — только avg, нужны median/p90/p95. Плюс сегментация по языку (`event_data->>'language'`).

- [ ] **Шаг 1: SQL**

```sql
-- 028_engagement_breakdown_rpc.sql
-- Thinking-time percentiles (p50/p90/p95) per (day_id, language).
-- Interest Index trend: daily completion_rate / avg_thinking / replay_rate.

-- NOTE: language is not tracked on game_events right now (field is null for all 2023 rows),
-- so no language filter here. Add later via ALTER TABLE players + backfill when tracking lands.

create or replace function public.get_thinking_percentiles(
  p_scenario_id text,
  p_day_id text default null,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  p50_ms numeric,
  p90_ms numeric,
  p95_ms numeric,
  sample_size bigint
)
language sql stable security definer
as $$
  select
    percentile_cont(0.5)  within group (order by (event_data->>'thinking_time_ms')::numeric) as p50_ms,
    percentile_cont(0.9)  within group (order by (event_data->>'thinking_time_ms')::numeric) as p90_ms,
    percentile_cont(0.95) within group (order by (event_data->>'thinking_time_ms')::numeric) as p95_ms,
    count(*)::bigint as sample_size
  from public.game_events
  where event_type = 'choice_made'
    and scenario_id = p_scenario_id
    and (p_day_id is null or day_id = p_day_id)
    and (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
    and (event_data->>'thinking_time_ms') is not null;
$$;

-- Interest Index trend: per-day composite inputs.
create or replace function public.get_engagement_trend(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  started bigint,
  completed bigint,
  avg_thinking_ms numeric,
  replays bigint,
  completion_rate numeric,
  replay_rate numeric
)
language sql stable security definer
as $$
  with daily as (
    select
      date_trunc('day', created_at)::date as bucket_date,
      event_type,
      player_id,
      (event_data->>'thinking_time_ms')::numeric as t_ms,
      day_id
    from public.game_events
    where scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  ),
  agg as (
    select
      bucket_date,
      count(distinct case when event_type = 'day_started' then player_id end) as started,
      count(distinct case when event_type = 'day_completed' then player_id end) as completed,
      avg(case when event_type = 'choice_made' then t_ms end) as avg_thinking_ms,
      count(case when event_type = 'day_started'
        and exists (select 1 from daily d2
          where d2.player_id = daily.player_id
            and d2.day_id = daily.day_id
            and d2.bucket_date = daily.bucket_date
            and d2.event_type = 'day_started') then 1 end) as replays
    from daily
    group by bucket_date
  )
  select
    bucket_date,
    started,
    completed,
    avg_thinking_ms,
    replays,
    case when started > 0 then completed::numeric / started else 0 end as completion_rate,
    case when started > 0 then replays::numeric / started else 0 end as replay_rate
  from agg
  order by bucket_date;
$$;
```

- [ ] **Шаг 2: Apply + sanity (`select * from get_thinking_percentiles('car-dealership', 'car-day1')`)**
- [ ] **Шаг 3: Commit**

---

### Задача A.5: Миграция `029_funnel_v2_rpc.sql` — UTM агрегация + тренды

**Files:**
- Create: `supabase/migrations/029_funnel_v2_rpc.sql`

**Зачем:** Funnel аудит #2 — только `utm_source`, остальные поля выброшены. RPC группирует по выбранному измерению.

**⚠️ Реальная схема БД (проверено):**
- `players.utm_source / utm_medium / utm_campaign` — есть. **`utm_term / utm_content` — НЕТ**
- `page_events(visitor_id, created_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content, event_type)` — visitors берём отсюда, `event_type = 'page_view'`, все 5 UTM доступны
- `leads.utm_source / utm_medium / utm_campaign` — есть. Term/content нет.
- **Поле языка не трекается нигде** (`game_events.event_data->>'language'` → 0 из 2023) — параметр `p_language` убираем из всего плана Фазы 3, добавляется позже миграцией отдельной задачи

**Scope:** поддерживаем dimensions `utm_source` / `utm_medium` / `utm_campaign`. Для `utm_term` / `utm_content` UI скрывает пункты (тянуть visitors из page_events можно, но без регистраций — бесполезно).

- [ ] **Шаг 1: SQL с whitelist (3 dimension)**

```sql
-- 029_funnel_v2_rpc.sql
-- Generalized UTM funnel over players/page_events/leads.
-- Dimensions restricted to columns that exist on all three tables.

create or replace function public.get_utm_funnel_v2(
  p_dimension text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  segment text,
  visitors bigint,
  registered bigint,
  started bigint,
  completed bigint,
  consultations bigint
)
language plpgsql stable security definer
as $$
begin
  if p_dimension not in ('utm_source','utm_medium','utm_campaign') then
    raise exception 'invalid dimension: %', p_dimension;
  end if;

  return query execute format($q$
    with
    reg as (
      select coalesce(nullif(p.%1$I, ''), 'direct') as segment, p.id
      from public.players p
      where (%2$L::timestamptz is null or p.created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or p.created_at <= %3$L::timestamptz)
    ),
    visits as (
      select coalesce(nullif(%1$I, ''), 'direct') as segment,
             count(distinct visitor_id)::bigint as v
      from public.page_events
      where event_type = 'page_view'
        and (%2$L::timestamptz is null or created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or created_at <= %3$L::timestamptz)
      group by 1
    ),
    starts as (
      select segment, count(distinct id)::bigint as n
      from reg
      where exists (select 1 from public.game_events e where e.player_id = reg.id and e.event_type = 'game_started')
      group by 1
    ),
    completes as (
      select segment, count(distinct id)::bigint as n
      from reg
      where exists (select 1 from public.game_events e where e.player_id = reg.id and e.event_type = 'game_completed')
      group by 1
    ),
    cons as (
      select coalesce(nullif(l.%1$I, ''), 'direct') as segment, count(*)::bigint as n
      from public.leads l
      where (%2$L::timestamptz is null or l.created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or l.created_at <= %3$L::timestamptz)
      group by 1
    ),
    reg_roll as (select segment, count(*)::bigint as n from reg group by 1),
    segments as (
      select segment from reg_roll
      union select segment from visits
      union select segment from cons
    )
    select
      s.segment,
      coalesce(v.v,     0) as visitors,
      coalesce(r.n,     0) as registered,
      coalesce(st.n,    0) as started,
      coalesce(co.n,    0) as completed,
      coalesce(cn.n,    0) as consultations
    from segments s
    left join visits     v  on v.segment  = s.segment
    left join reg_roll   r  on r.segment  = s.segment
    left join starts     st on st.segment = s.segment
    left join completes  co on co.segment = s.segment
    left join cons       cn on cn.segment = s.segment
    order by visitors desc nulls last
  $q$, p_dimension, p_from, p_to);
end;
$$;

-- Daily trend per single UTM source (for drill-down).
create or replace function public.get_utm_trend(
  p_utm_source text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  registered bigint,
  completed bigint,
  consultations bigint
)
language sql stable security definer
as $$
  with d as (
    select generate_series(
      coalesce(p_from::date, (now() - interval '30 days')::date),
      coalesce(p_to::date, now()::date),
      interval '1 day'
    )::date as bucket_date
  ),
  reg as (
    select created_at::date as d, count(*)::bigint as c
    from public.players
    where coalesce(nullif(utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  comp as (
    select e.created_at::date as d, count(distinct e.player_id)::bigint as c
    from public.game_events e
    join public.players p on p.id = e.player_id
    where e.event_type = 'game_completed'
      and coalesce(nullif(p.utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
    group by 1
  ),
  ld as (
    select created_at::date as d, count(*)::bigint as c
    from public.leads
    where coalesce(nullif(utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select d.bucket_date, coalesce(reg.c, 0), coalesce(comp.c, 0), coalesce(ld.c, 0)
  from d
  left join reg  on reg.d  = d.bucket_date
  left join comp on comp.d = d.bucket_date
  left join ld   on ld.d   = d.bucket_date
  order by d.bucket_date;
$$;
```

- [ ] **Шаг 2: Apply + sanity** — `select * from get_utm_funnel_v2('utm_source') limit 5`
- [ ] **Шаг 3: Commit**

---

### Задача A.6: Shared UI компоненты — `DeltaBadge`, `Sparkline`, `FormulaPopover`

**Files:**
- Create: `components/admin/shared/DeltaBadge.tsx`
- Create: `components/admin/shared/Sparkline.tsx`
- Create: `components/admin/shared/FormulaPopover.tsx`
- Modify: `components/admin/KpiCard.tsx` (добавить `delta?`, `sparkline?` props)

**Зачем:** Overview + Funnel требуют дельт/спарклайнов в KPI. Engagement требует «формулу» при клике на Interest Index.

- [ ] **Шаг 1: `DeltaBadge.tsx`** — пилюля +12.3% / −4.1% с цветом tone

```tsx
// components/admin/shared/DeltaBadge.tsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DeltaBadgeProps {
  value: number | null;       // % change, e.g., +12.3 or -4.1
  invert?: boolean;            // true if "lower is better" (e.g., drop-off %)
  size?: 'sm' | 'md';
}

export function DeltaBadge({ value, invert, size = 'md' }: DeltaBadgeProps) {
  if (value === null || !Number.isFinite(value)) {
    return <span style={{ fontSize: size === 'sm' ? 10 : 11, color: 'var(--admin-text-dim)' }}>—</span>;
  }
  const isPositive = invert ? value < 0 : value > 0;
  const isZero = Math.abs(value) < 0.05;
  const color = isZero ? 'var(--admin-text-muted)' :
    isPositive ? 'var(--admin-accent-success)' : 'var(--admin-accent-danger)';
  const Icon = isZero ? Minus : (isPositive ? TrendingUp : TrendingDown);
  const px = size === 'sm' ? 4 : 6;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: size === 'sm' ? 10 : 11, fontWeight: 600, color,
      padding: `${px / 2}px ${px}px`, borderRadius: 6,
      background: isZero ? 'transparent' : `${color}14`,
    }}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}
```

- [ ] **Шаг 2: `Sparkline.tsx`** — простой SVG-полилайн (без зависимостей)

```tsx
// components/admin/shared/Sparkline.tsx
export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ values, width = 80, height = 24, color = 'currentColor' }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Шаг 3: `FormulaPopover.tsx`** — ⓘ-кнопка с поповером

```tsx
// components/admin/shared/FormulaPopover.tsx
'use client';
import { useState } from 'react';
import { Info } from 'lucide-react';

export interface FormulaPopoverProps {
  title: string;
  body: React.ReactNode;
}

export function FormulaPopover({ title, body }: FormulaPopoverProps) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'var(--admin-text-dim)' }}
        aria-label="formula"
      ><Info size={12} /></button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'absolute', top: '100%', right: 0, zIndex: 100,
            background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)',
            padding: 12, borderRadius: 8, minWidth: 260, fontSize: 11,
            color: 'var(--admin-text)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
          <div style={{ lineHeight: 1.5 }}>{body}</div>
        </div>
      )}
    </span>
  );
}
```

- [ ] **Шаг 4: Расширить `KpiCard`** — опциональные `delta` и `sparkline` внутри карточки

```tsx
// components/admin/KpiCard.tsx — добавить props + рендер:
//   delta?: { value: number | null; invert?: boolean };
//   sparkline?: number[];
// Рендерить delta справа от value, sparkline под hint (когда sparkline есть — hint может быть скрыт).
```

- [ ] **Шаг 5: Extend `thresholds.ts`**

```ts
// lib/admin/thresholds.ts — добавить в конец THRESHOLDS:
  funnel: {
    minVisitorsForBest: 100,  // min sample size for "best source" KPI
  },
  retention: {
    healthyD1: 0.30,
    healthyD7: 0.15,
  },
  analytics: {
    minSampleForPercentile: 30,
  },
```

- [ ] **Шаг 6: Commit**

```bash
git add components/admin/shared/DeltaBadge.tsx components/admin/shared/Sparkline.tsx components/admin/shared/FormulaPopover.tsx components/admin/KpiCard.tsx lib/admin/thresholds.ts
git commit -m "feat(admin): shared analytics primitives (delta badge, sparkline, formula popover)"
```

---

## Блок B. Overview rework

### Задача B.1: API `/api/admin/overview` — вернуть предыдущий период + тренд

**Files:**
- Modify: `app/api/admin/overview/route.ts`
- Modify: `lib/admin/api.ts` (fetchOverview payload)
- Modify: `lib/admin/types-v2.ts` (extend OverviewPayload)

**Зачем:** B.2–B.6 нужны prev-period totals и daily trends.

- [ ] **Шаг 1: Расширить response**

API теперь возвращает:
```ts
{
  current: { visitors, registered, started, completed, consultations },
  prev:    { visitors, registered, started, completed, consultations } | null,
  trend:   DailyTrendRow[],            // уже возвращается
  utm:     UtmFunnelRow[],             // уже возвращается
  offer:   OfferFunnel,                 // уже возвращается
  sparks:  { visitors: number[]; registered: number[]; started: number[]; completed: number[]; consultations: number[] }
}
```

- [ ] **Шаг 2: Расчёт prev-period** — вычислить `prev_from / prev_to` той же длины периода, сдвинутые назад. Повторный вызов `get_admin_funnel_stats(prev_from, prev_to)`. Если `period === 'all'` — `prev = null`.
- [ ] **Шаг 3: Sparks** — из `trend` составить 5 массивов одинаковой длины
- [ ] **Шаг 4: Обновить `OverviewPayload` в `lib/admin/api.ts` + типы в `types-v2.ts`**
- [ ] **Шаг 5: Smoke-test** — `curl -b admin_session=... /api/admin/overview?period=7d | jq '.prev,.sparks | length'`
- [ ] **Шаг 6: Commit**

---

### Задача B.2: Overview — KPI ряд с визитёрами + 3 CR + дельты + спарклайны

**Files:**
- Modify: `app/(admin)/admin/overview/OverviewClient.tsx`

**Зачем:** Audit MUST 1–5 для Overview.

- [ ] **Шаг 1: Считать CR**

```tsx
const crVisitorToReg    = totals.visitors > 0 ? (totals.registered / totals.visitors) * 100 : 0;
const crRegToCompleted  = totals.registered > 0 ? (totals.completed / totals.registered) * 100 : 0;
const crCompletedToLead = totals.completed > 0 ? (totals.consultations / totals.completed) * 100 : 0;
```

- [ ] **Шаг 2: Считать дельты** через хелпер

```tsx
// lib/admin/overview/computeDeltas.ts
export function pctDelta(curr: number, prev: number | null | undefined): number | null {
  if (prev == null || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}
```

- [ ] **Шаг 3: Обновить KPI-row — 6 карточек**

```
[Визитёров]  [Регистрации + CR%]  [Начали + CR%]  [Прошли + CR%]  [Заявок + CR%]  [Оффер CTR]
```

Каждая `KpiCard` получает `delta={{ value: pctDelta(curr, prev), invert: false }}` и `sparkline={sparks.xxx}`.

- [ ] **Шаг 4: Commit**

```bash
git commit -m "feat(admin/overview): add visitors KPI, 3 CRs, deltas, sparklines"
```

---

### Задача B.3: Overview — двойной тренд-чарт (2 линии: Completion + Registrations)

**Files:**
- Create: `components/admin/overview/DualTrendChart.tsx`
- Modify: `app/(admin)/admin/overview/OverviewClient.tsx`

**Зачем:** аудит #5 — один TrendLineChart непонятно что показывает. Разделяем: регистрации (первая ось), завершения (вторая ось). Legend и hover-tooltip обязательны.

- [ ] **Шаг 1: Написать `DualTrendChart.tsx`** — SVG-чарт с двумя полилиниями разных цветов, tooltip при hover (индекс ближайшей точки)

- [ ] **Шаг 2: Заменить `<TrendLineChart rows={trends} />` на `<DualTrendChart rows={trends} />`**

- [ ] **Шаг 3: Добавить заголовок-легенду** — «Регистрации vs Прохождения (по дням)»

- [ ] **Шаг 4: Commit**

---

### Задача B.4: Overview — блок «Топ-5 источников»

**Files:**
- Create: `components/admin/overview/TopSourcesCard.tsx`
- Modify: `app/(admin)/admin/overview/OverviewClient.tsx`

**Зачем:** Audit MUST #4 (SHOULD #6) — отсутствует секция UTM на overview. Показываем top-5 по completionRate с min sample filter.

- [ ] **Шаг 1: Компонент (читает `utm` из props) — sort по completionRate, min-visitors guard, click-through на `/admin/funnel`**

```tsx
// components/admin/overview/TopSourcesCard.tsx
import type { UtmFunnelRow } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

export function TopSourcesCard({ utm }: { utm: UtmFunnelRow[] }) {
  const rows = [...utm]
    .filter(r => r.visitors >= THRESHOLDS.funnel.minVisitorsForBest)
    .map(r => ({
      source: r.utm_source || 'direct',
      visitors: r.visitors,
      cr: r.visitors > 0 ? (r.completed / r.visitors) * 100 : 0,
    }))
    .sort((a, b) => b.cr - a.cr)
    .slice(0, 5);

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>
        Топ-5 источников по CR
      </div>
      {rows.length === 0 ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>
          Нет источников с ≥{THRESHOLDS.funnel.minVisitorsForBest} визитов
        </div>
      ) : (
        <table style={{ width: '100%', fontSize: 12 }}>
          {/* ... source | visitors | CR% */}
        </table>
      )}
      <a href="/admin/funnel" style={{ fontSize: 11, color: 'var(--admin-accent-violet)', marginTop: 8, display: 'inline-block' }}>
        Подробнее в Воронке →
      </a>
    </div>
  );
}
```

- [ ] **Шаг 2: Встроить в правую колонку `admin-two-col`**
- [ ] **Шаг 3: Commit**

---

### Задача B.5: Overview — блок «Лучший/худший день» (movers)

**Files:**
- Create: `components/admin/overview/MoversCard.tsx`
- Modify: `app/(admin)/admin/overview/OverviewClient.tsx`

**Зачем:** Audit #9 — movers отсутствуют. Показывает 1 лучший + 1 худший день периода по прохождению.

- [ ] **Шаг 1: Компонент считает best/worst по `completed / registered` на каждом DailyTrendRow, игнорируя дни с `registered < 5`**
- [ ] **Шаг 2: Встроить под MoversCard**
- [ ] **Шаг 3: Commit**

---

### Задача B.6: Overview — Realtime мини-виджет

**Files:**
- Create: `components/admin/overview/RealtimeMiniCard.tsx`
- Modify: `app/(admin)/admin/overview/OverviewClient.tsx`

**Зачем:** Audit #8 — realtime на overview отсутствует. Показываем live-players и события за 60 мин со ссылкой на `/admin/realtime`.

- [ ] **Шаг 1: Компонент** — `fetchRealtimeKpis` (уже есть в `lib/admin/api.ts`), polling раз в 30s

- [ ] **Шаг 2: Render «⚫ N игроков онлайн», «M событий за час», кнопка «Открыть Realtime»**

- [ ] **Шаг 3: Встроить в шапку Overview (над KPI-ряд) или в sidebar правой колонки**

- [ ] **Шаг 4: Commit**

```bash
git commit -m "feat(admin/overview): live realtime mini widget with auto-poll"
```

---

## Блок C. Funnel & UTM rework

### Задача C.1: API `/api/admin/funnel` — поддержка dimension и language

**Files:**
- Modify: `app/api/admin/funnel/route.ts`
- Create: `lib/admin/funnel-queries.ts`
- Modify: `lib/admin/api.ts`
- Modify: `lib/admin/types-v2.ts`

- [ ] **Шаг 1: Query helpers**

```ts
// lib/admin/funnel-queries.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type UtmDimension = 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content';

export interface UtmFunnelV2Row {
  segment: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  consultations: number;
}

export async function getUtmFunnelV2(
  dimension: UtmDimension,
  from: string | null,
  to: string | null,
  language: 'uz' | 'ru' | null,
): Promise<UtmFunnelV2Row[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_utm_funnel_v2', {
    p_dimension: dimension,
    p_from: from, p_to: to, p_language: language,
  });
  if (error) throw error;
  return (data ?? []) as UtmFunnelV2Row[];
}

export async function getUtmSpendRollup(from: string | null, to: string | null) {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_utm_spend_rollup', { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as Array<{ utm_source: string; total_kzt: number; days: number }>;
}
```

- [ ] **Шаг 2: Расширить route** — читать `dimension`, `language` из query. Default: `utm_source`, `null`. Возвращает `{ rows, spend }`.
- [ ] **Шаг 3: `lib/admin/api.ts`** — `fetchFunnel({ period, dimension, language })`
- [ ] **Шаг 4: Commit**

---

### Задача C.2: Funnel UI — dimension selector + CR to lead column

**Files:**
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`
- Create: `components/admin/funnel/DimensionSelector.tsx`

**Scope:** dimensions `utm_source` / `utm_medium` / `utm_campaign` (term/content отсутствуют в players/leads — см. A.5). Language tabs **убраны** (не трекается — см. A.4).

- [ ] **Шаг 1: `DimensionSelector`** — dropdown из 3 значений, controlled state persisted в URL (`?dim=utm_medium`)

- [ ] **Шаг 2: Extend table** — колонки: `Segment | Visitors | Registered | Completed | Leads | CR (visitor→lead)%`. Add sort by any numeric column.

- [ ] **Шаг 3: Commit**

---

### Задача C.3: Funnel — CPL / ROAS KPI + страница ввода spend

**Files:**
- Create: `app/api/admin/utm-spend/route.ts` (GET list, POST upsert, DELETE)
- Create: `components/admin/funnel/SpendDialog.tsx`
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`

- [ ] **Шаг 1: POST /api/admin/utm-spend** — валидирует `bucket_date` + `utm_source` + `amount_kzt`, UPSERT в `utm_spend`

- [ ] **Шаг 2: `SpendDialog`** — модалка, табличный ввод (bucket_date + source + amount + note), кнопка «Сохранить»

- [ ] **Шаг 3: KPI-ряд Funnel обновить** — добавить карточку **CPL** (total spend / leads) и **ROAS** (revenue / spend; revenue из `fetchRevenue`, аналог offer page)

- [ ] **Шаг 4: Commit**

```bash
git commit -m "feat(admin/funnel): manual UTM spend input + CPL/ROAS KPIs"
```

---

### Задача C.4: Funnel — min-sample guard + direct/organic row

**Files:**
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`

- [ ] **Шаг 1: Min-sample guard** — KPI «Лучший источник» использует `THRESHOLDS.funnel.minVisitorsForBest` (как в Offer.bestRating из Phase 2). Если нет источника с нужным sample — «—» + hint.

- [ ] **Шаг 2: Direct row explicit** — SQL уже заворачивает `null → 'direct'`. UI добавляет пояснение: «direct = нет UTM». Добавить tooltip.

- [ ] **Шаг 3: Commit**

---

### Задача C.5: Funnel — тренд по одному источнику (drill-down)

**Files:**
- Create: `components/admin/funnel/SourceTrendModal.tsx`
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`
- Create: `app/api/admin/funnel/trend/route.ts`
- Modify: `lib/admin/api.ts` (`fetchFunnelTrend`)

- [ ] **Шаг 1: Route** обёртка над `get_utm_trend(p_utm_source, p_from, p_to)`

- [ ] **Шаг 2: Client**

```tsx
// components/admin/funnel/SourceTrendModal.tsx — модалка-затемнение
// На вход source, period. Fetch trend, render DualTrendChart (registrations + leads).
// Close by ESC / bg click.
```

- [ ] **Шаг 3: В таблице funnel** — кликабельные строки → открывают модалку

- [ ] **Шаг 4: Commit**

---

### Задача C.6: Funnel — замена DonutChart на stacked bars + новый KPI

**Files:**
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`
- Delete usage of `components/admin/charts/DonutChart.tsx`

- [ ] **Шаг 1: Audit #6** — DonutChart по visitors почти бесполезен. Меняем на «Stacked bars по конверсии» (visitors / completed / leads per источник)
- [ ] **Шаг 2: KPI «Источников» заменить** (audit #14) — на «CPL средний» или «Best CR %». `Source count` переводим в hint под KPI visitors
- [ ] **Шаг 3: Commit**

---

### Задача C.7: Funnel — CSV-экспорт

**Files:**
- Create: `app/api/admin/funnel/export/route.ts`
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx` (кнопка Download)

- [ ] **Шаг 1: Route возвращает BOM-CSV** с колонками текущего dimension + visitors/registered/started/completed/consultations/CR/spend/CPL
- [ ] **Шаг 2: В PageHeader actions — кнопка `<Download /> Экспорт CSV`** (по образцу offer/retarget)
- [ ] **Шаг 3: Commit**

---

## Блок D. Dropoff rework

### Задача D.1: API `/api/admin/dropoff` — rate-based payload

**Files:**
- Modify: `app/api/admin/dropoff/route.ts`
- Modify: `lib/admin/api.ts`
- Modify: `lib/admin/types-v2.ts`

- [ ] **Шаг 1: Вызывать `get_dropoff_rate` вместо `get_dropoff_zones`** (старая осталась как legacy для Branch)

```ts
export interface DropoffRateRow {
  node_id: string;
  day_id: string;
  dropoff_count: number;
  entered_count: number;
  dropoff_rate: number;         // 0..1
  avg_time_on_node_ms: number | null;
}

export interface DropoffPayload {
  rows: DropoffRateRow[];
  totals: { entered: number; dropped: number; rate: number };
}
```

- [ ] **Шаг 2: Смoke-test**
- [ ] **Шаг 3: Commit**

---

### Задача D.2: DropoffBars — rate-ось 0..100% + resolveNodeLabel

**Files:**
- Modify: `components/admin/charts/DropoffBars.tsx`
- Modify: `app/(admin)/admin/dropoff/DropoffClient.tsx`

**Зачем:** Audit #9 (фиксированная шкала), #2 (имена узлов), #5 (превью).

- [ ] **Шаг 1: Изменить `DropoffBars`** — шкала ВСЕГДА 0..100% (fixed), подпись каждого бара берёт title из `fetchNodeLabels`. При hover — tooltip с `entered/dropped/rate/preview`.
- [ ] **Шаг 2: В `DropoffClient` вызвать `fetchNodeLabels(scenarioId, rows.map(r => r.node_id))` после загрузки данных**
- [ ] **Шаг 3: Проверить цвета бара по rate-бакету**: rate < 0.1 — success, 0.1-0.3 — warn, >= 0.3 — danger
- [ ] **Шаг 4: Commit**

---

### Задача D.3: Dropoff — KPI redesign

**Files:**
- Modify: `app/(admin)/admin/dropoff/DropoffClient.tsx`

**Зачем:** Audit #6 (мусорная «Дней с проблемами»), #7 (топ узел в raw id).

- [ ] **Шаг 1: Новый KPI-ряд:**
  1. Общий drop-off rate (`totals.dropped / totals.entered`)
  2. Узлов выше порога (`rows.filter(r => r.dropoff_rate >= THRESHOLDS.dropoff.insightRateMin).length`)
  3. Худший узел — `resolveNodeLabel.title` c % hint
  4. Среднее время до выхода (`rows.map(avg_time_on_node_ms).avg / 1000` секунд)

- [ ] **Шаг 2: Удалить старые KPI** «Всего drop-off», «Уникальных узлов», «Дней с проблемами»

- [ ] **Шаг 3: Commit**

---

### Задача D.4: Dropoff — фильтры: день / тип узла

**Files:**
- Create: `components/admin/dropoff/DropoffFilters.tsx`
- Modify: `app/api/admin/dropoff/route.ts` (accept `day`, `nodeType`)
- Modify: `app/(admin)/admin/dropoff/DropoffClient.tsx`
- Modify: `supabase/migrations/027_dropoff_rate_rpc.sql` — добавить опциональный `p_day_id`

**Scope:** language-фильтр убран (не трекается — см. A.4).

- [ ] **Шаг 1: `DropoffFilters`** — сегментированный multi-select: `Все · День 1 · День 2 · День 3` + `Все типы · Диалог · Выбор`

- [ ] **Шаг 2: Серверная фильтрация** — `day` через `p_day_id` (добавить опциональный параметр в `get_dropoff_rate`). `nodeType` фильтруется в route после `resolveNodeLabel(scenario, node_id).type`.

- [ ] **Шаг 3: Commit**

---

### Задача D.5: Dropoff — тренд drop-off + Retry-metric

**Files:**
- Create: `components/admin/dropoff/DropoffTrendChart.tsx`
- Modify: `app/(admin)/admin/dropoff/DropoffClient.tsx`
- Create: `supabase/migrations/030_dropoff_trend_rpc.sql`

**Зачем:** Audit #16 (нет тренда), #13 (нет retry).

- [ ] **Шаг 1: `030_dropoff_trend_rpc.sql`** — daily `dropoff_count / entered_count` по сценарию.

```sql
create or replace function public.get_dropoff_trend(
  p_scenario_id text, p_from timestamptz default null, p_to timestamptz default null
) returns table (bucket_date date, entered bigint, dropped bigint, rate numeric)
language sql stable security definer as $$
  with e as (
    select created_at::date as d, count(*)::bigint as n
    from public.game_events
    where scenario_id = p_scenario_id and event_type = 'node_entered'
      and (p_from is null or created_at >= p_from) and (p_to is null or created_at <= p_to)
    group by 1
  ),
  dr as (
    select created_at::date as d, count(*)::bigint as n
    from public.game_events
    where scenario_id = p_scenario_id and event_type = 'dropped_off'
      and (p_from is null or created_at >= p_from) and (p_to is null or created_at <= p_to)
    group by 1
  )
  select e.d, e.n, coalesce(dr.n, 0),
    case when e.n > 0 then coalesce(dr.n, 0)::numeric / e.n else 0 end
  from e left join dr on dr.d = e.d order by e.d;
$$;
```

- [ ] **Шаг 2: Apply + новый endpoint `/api/admin/dropoff/trend`**
- [ ] **Шаг 3: `DropoffTrendChart`** — single-line chart. Placed above DropoffBars.
- [ ] **Шаг 4: Commit**

---

### Задача D.6: Dropoff — CSV-экспорт + связь с Branch

**Files:**
- Create: `app/api/admin/dropoff/export/route.ts`
- Modify: `app/(admin)/admin/dropoff/DropoffClient.tsx`

- [ ] **Шаг 1: Export route** — BOM-CSV: node_id, node_title, day_id, entered, dropped, rate, avg_time_s
- [ ] **Шаг 2: Под каждым баром** — ссылка «Открыть в Карте сценария» (`/admin/branch?node=...`)
- [ ] **Шаг 3: Commit**

---

## Блок E. Engagement rework

### Задача E.1: Engagement — breakdown Interest Index на 3 KPI + формулы

**Files:**
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

**Зачем:** Audit #1 (чёрный ящик). Делаем 3 отдельных KPI с FormulaPopover.

- [ ] **Шаг 1: KPI-ряд**

```
[Interest Index (all) + ⓘ formula]
[Completion component + ⓘ]
[Thinking component + ⓘ]
[Replay component + ⓘ]
```

- [ ] **Шаг 2: FormulaPopover контент** — копипастой из `computeInterestIndex` комментария

- [ ] **Шаг 3: Commit**

---

### Задача E.2: Engagement — median/p90/p95 thinking time

**Files:**
- Modify: `app/api/admin/engagement/route.ts`
- Modify: `lib/admin/api.ts` (EngagementPayload)
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

- [ ] **Шаг 1: Route** вызывает `get_thinking_percentiles` + возвращает `{ p50, p90, p95, sample }`
- [ ] **Шаг 2: KPI `Thinking time`** — значение = p50, hint = `p90={p90}ms, p95={p95}ms`, disabled если `sample < THRESHOLDS.analytics.minSampleForPercentile`
- [ ] **Шаг 3: Commit**

---

### Задача E.3: Engagement — retention D1/D7 блок

**Files:**
- Create: `components/admin/engagement/RetentionCard.tsx`
- Modify: `app/api/admin/engagement/route.ts` (добавить `retention` в payload)
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

**Зачем:** Audit MUST #1.

- [ ] **Шаг 1: Route вызывает `get_retention(from, to)`** → агрегирует по cohort → возвращает `{ d1_rate, d7_rate, cohort_size }`
- [ ] **Шаг 2: `RetentionCard`** — 2 прогресс-бара (D1 = X%, D7 = Y%), сравнение с `THRESHOLDS.retention.healthy*`
- [ ] **Шаг 3: Вставить как второй KPI-row под первым**
- [ ] **Шаг 4: Commit**

---

### Задача E.4: Engagement — heat curve + ThinkingBarChart с читаемыми именами

**Files:**
- Modify: `components/admin/charts/ThinkingBarChart.tsx`
- Create: `components/admin/engagement/HeatCurveChart.tsx`
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

- [ ] **Шаг 1: `ThinkingBarChart`** — подписи берутся из `fetchNodeLabels`. Добавить цвет бара по THRESHOLDS.engagement.slowNodeMs.
- [ ] **Шаг 2: `HeatCurveChart`** — area chart для сцен в дне (visits per node position). Данные — `stats` отсортированные по появлению в `scenarios[scenarioId].days[dayId].nodes`.
- [ ] **Шаг 3: Commit**

---

### Задача E.5: Engagement — корреляция с S-рейтингом

**Files:**
- Create: `components/admin/engagement/RatingCorrelationChart.tsx`
- Create: `app/api/admin/engagement/correlation/route.ts`
- Modify: `lib/admin/api.ts`

**Scope:** language segment убран из Фазы 3 (не трекается — см. A.4). Источник корреляции — таблица `completed_scenarios` (есть `rating`, `time_taken`, `score`, `day_id`).

- [ ] **Шаг 1: Query helper (server-only)** — агрегирует `completed_scenarios` в грид `day_id × rating → count, avg_time_taken`.

```ts
// lib/admin/engagement-queries.ts (new)
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface RatingCorrelationCell {
  day_id: string;
  rating: 'S' | 'A' | 'B' | 'C' | 'F';
  count: number;
  avg_time_seconds: number;
}

export async function getRatingCorrelation(
  scenarioId: string,
  from: string | null,
  to: string | null,
): Promise<RatingCorrelationCell[]> {
  const sb = createAdminClient();
  let q = sb
    .from('completed_scenarios')
    .select('day_id, rating, time_taken')
    .eq('scenario_id', scenarioId);
  if (from) q = q.gte('completed_at', from);
  if (to) q = q.lte('completed_at', to);
  const { data, error } = await q;
  if (error) throw error;
  const buckets = new Map<string, { count: number; sum: number }>();
  (data ?? []).forEach((r: { day_id: string; rating: string; time_taken: number | null }) => {
    const key = `${r.day_id}::${r.rating}`;
    const b = buckets.get(key) ?? { count: 0, sum: 0 };
    b.count += 1;
    b.sum += r.time_taken ?? 0;
    buckets.set(key, b);
  });
  return Array.from(buckets.entries()).map(([key, b]) => {
    const [day_id, rating] = key.split('::');
    return {
      day_id,
      rating: rating as RatingCorrelationCell['rating'],
      count: b.count,
      avg_time_seconds: b.count > 0 ? b.sum / b.count : 0,
    };
  });
}
```

- [ ] **Шаг 2: Route** `/api/admin/engagement/correlation` — `?scenario_id=&period=&from=&to=` → `{ cells: RatingCorrelationCell[] }`, за `requireAdmin`.

- [ ] **Шаг 3: `RatingCorrelationChart`** — heatmap-grid `day × rating` с размером ячейки по count, цветом по avg_time.

- [ ] **Шаг 4: Встроить под Interest Index KPI** в `EngagementClient`.

- [ ] **Шаг 5: Commit**

---

### Задача E.6: Engagement — Interest Index тренд

**Files:**
- Create: `app/api/admin/engagement/trend/route.ts`
- Create: `components/admin/engagement/InterestTrendChart.tsx`
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

**Зачем:** Audit #9.

- [ ] **Шаг 1: Route** вызывает `get_engagement_trend` → для каждой точки считаем локальный `computeInterestIndex` из (completion_rate, avg_thinking_ms, replay_rate)
- [ ] **Шаг 2: `InterestTrendChart`** — single line, Y 0..10
- [ ] **Шаг 3: Разместить** под DayTabs, над ThinkingBarChart
- [ ] **Шаг 4: Commit**

---

## Финальный чек перед merge в main

- [ ] **Шаг F.1: Build green** — `npm run build` без ошибок TS

- [ ] **Шаг F.2: Прогнать вручную каждую страницу** (browser):
  - `/admin/overview` — 6 KPI, дельты, спарклайны, движки, top sources, realtime виджет
  - `/admin/funnel` — dimension selector, language tabs, CR, CPL, ROAS, источник-drill-down модалка, CSV
  - `/admin/dropoff` — rate-based KPI, читаемые имена, фильтры, тренд, CSV
  - `/admin/engagement` — 3 компонента Interest, p50/p90/p95, retention D1/D7, heat curve, scatter, тренд

- [ ] **Шаг F.3: PR**

```bash
git checkout -b feat/dashboard-analytics
git push -u origin feat/dashboard-analytics
gh pr create --base main --head feat/dashboard-analytics \
  --title "feat(admin): Phase 3 — analytics rework (overview/funnel/dropoff/engagement)" \
  --body-file docs/superpowers/plans/2026-04-24-dashboard-analytics.md
```

---

## Риски

| Риск | Смягчение |
|---|---|
| `get_utm_funnel_v2` — dynamic SQL, risk of injection | Whitelist на `p_dimension` (3 значения), параметры через `format(%L, %I)` |
| Language-трекинга нет в БД | **Scope-reduction применён**: language-сегменты убраны из Funnel C.2 + Engagement E.5. Добавятся когда game начнёт писать `game_language` в players (отдельная задача позже) |
| `utm_term / utm_content` отсутствуют в players/leads | Dimension ограничен source/medium/campaign. Page-events имеет term/content, но без регистраций они бесполезны |
| Retention RPC — тяжёлый при большом кол-ве players | Добавить index `game_events_player_type_idx` если slow; период по умолчанию ≤ 90 дней |
| SourceTrendModal fetch-на-клик, медленный | Кэш на 60s через useMemo |
| Heatcurve порядок узлов зависит от scenario graph | Читать из `scenarios[scenarioId].days[dayId].nodes` keys; fallback — просто по entered_count desc |
| `completed_scenarios` содержит `time_taken` в секундах (int), не ms | В E.5 не делить на 1000, рендерить как секунды напрямую |

## Timeline

- Блок A (foundation): 1 день
- Блок B (overview): 1 день
- Блок C (funnel): 2 дня (наиболее тяжёлый — CPL/ROAS + UI)
- Блок D (dropoff): 1.5 дня
- Блок E (engagement): 1.5 дня
- **Итого:** 6–7 дней субагент-экзекьюшена

---

## 🏁 Execution Handoff

План сохранён: `docs/superpowers/plans/2026-04-24-dashboard-analytics.md`.

**Варианты запуска:**
1. **Subagent-Driven (рекомендую)** — диспатчу фреш-субагент на каждую задачу, two-stage review между
2. **Inline** — задачи в этой сессии пачками с чекпоинтами

Какой?
