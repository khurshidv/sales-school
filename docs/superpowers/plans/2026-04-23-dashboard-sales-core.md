# Phase 2: Sales Core (Leads/Offer/Participants/Player Journey) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans`. Шаги используют `- [ ]` для трекинга.

**Parent plan:** [2026-04-22-dashboard-audit-remediation.md](./2026-04-22-dashboard-audit-remediation.md) (Phase 2 — Приоритет 1)
**Audit reference:** [dashboard-audit-2026-04-22.md](../dashboard-audit-2026-04-22.md) Audits #5 (Participants+Player) и #6 (Leads+Offer)

**Goal:** Превратить 4 страницы «Деньги/Продажи» (Leads / Offer / Participants / Player Journey) из витрин-снапшотов в рабочий HR-CRM инструмент со связью с Bitrix24, bulk actions, outreach-кнопками и revenue-метрикой.

**Архитектура:** Разбиваем на 5 логических блоков (A: Foundation → B: Leads → C: Offer → D: Participants → E: Player). Foundation (миграции БД + Bitrix helpers + dedup/linkage queries) — критический путь, делается первым. Остальные блоки независимы и могут выполняться параллельно после Foundation. Всё через новые `/api/admin/*` endpoints; client-компоненты не импортят Supabase напрямую.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase RPC/SQL, lucide-react, существующий `lib/bitrix/client.ts` (webhook auth), Tailwind.

---

## 🎯 Метрики успеха Фазы 2

| Критерий | До | После |
|---|---|---|
| Leads: PeriodFilter | ✅ (Phase 0) | ✅ (остаётся) |
| Leads: связь с Bitrix (deal status) | 0 | ✅ видна в таблице |
| Leads: связь «Лид ↔ Игрок» | 0 | ✅ кнопка «Открыть игрока» |
| Leads: CSV export | нет | есть |
| Leads: bulk actions | нет | 3 action'а (assign, status, copy) |
| Leads: статусы (new/in_progress/done) | нет | есть + history |
| Offer: «Конверсия» explained | нет | модалка с формулой |
| Offer: revenue метрика | нет | ₽ за период из Bitrix |
| Offer: тренд CTR/CR по дням | нет | line chart |
| Participants: расширенные фильтры | 1 (search) | 7+ (UTM/date/lang/device/has-lead/Bitrix/rating) |
| Participants: pagination | limit 100 | infinite scroll |
| Participants: статусы + bulk | нет | есть |
| Player Journey: uuid subtitle | показан | убран |
| Player Journey: Bitrix deep-link | нет | есть |
| Player Journey: Replay любого дня | только last | dropdown |
| Player Journey: шаблоны WA/TG с именем | generic | `Здравствуйте, {name}!` |
| Player Journey: raw node_id в Replay | показан | `resolveNodeLabel` везде |

---

## 📁 File Structure (создаётся в ходе Фазы 2)

**Миграции (ADD-only):**
- `supabase/migrations/020_lead_crm_link.sql` — `leads.bitrix_deal_id`, `leads.bitrix_contact_id`, `leads.status`, `leads.assigned_to` + `lead_state_history` table
- `supabase/migrations/021_participant_states.sql` — `player_admin_states` table (status, assigned_to) + history
- `supabase/migrations/022_offer_revenue_cache.sql` — `offer_revenue_daily` materialized cache (optional, если live Bitrix медленный)

**Bitrix (server-only):**
- `lib/bitrix/deals.ts` — `getDealById()`, `listDealsByContactIds()`, `sumRevenueForPeriod()`
- `lib/bitrix/stages.ts` — stage label map (из `/api/bitrix/lead/route.ts` — переиспользуем существующие константы)

**API routes:**
- `app/api/admin/leads/[id]/status/route.ts` (PATCH) — обновить status + history
- `app/api/admin/leads/bulk/route.ts` (POST) — bulk assign/mark
- `app/api/admin/leads/export/route.ts` (GET) — CSV export
- `app/api/admin/participants/[id]/status/route.ts` (PATCH)
- `app/api/admin/participants/bulk/route.ts` (POST)
- `app/api/admin/participants/export/route.ts` (GET)
- `app/api/admin/bitrix/deal/[id]/route.ts` (GET) — прокси для `crm.deal.get`
- `app/api/admin/bitrix/revenue/route.ts` (GET) — summed WON deals for period
- `app/api/admin/leads/dedup/route.ts` (GET) — phone→count map
- `app/api/admin/source-tabs/route.ts` (GET) — dynamic source list

**Lib (server-only):**
- `lib/admin/leads-queries.ts` — `getLeadStatesForIds()`, `getLeadDedup()`, `getLinkedPlayerIdByPhone()`, `updateLeadStatus()`
- `lib/admin/participant-queries.ts` — аналогично
- `lib/admin/offer-queries.ts` — `getOfferTrend()`, `getOfferSegmentBreakdown()`

**Lib (client):**
- `lib/admin/outreach.ts` — `buildWhatsAppUrl(phone, name)`, `buildTelegramUrl(phone, name)`, `renderTemplate(tpl, {name})`
- `lib/admin/api.ts` — новые `fetchX()` wrappers

**Components:**
- `components/admin/leads/LeadStatusBadge.tsx`
- `components/admin/leads/LeadActionBar.tsx` — bulk bar (sticky bottom)
- `components/admin/leads/ConversionHint.tsx` — modal explaining «Конверсия»
- `components/admin/leads/OutreachButtons.tsx` — WhatsApp + Telegram + Phone tel:
- `components/admin/leads/BitrixDealBadge.tsx` — pill с stage_id
- `components/admin/participants/ParticipantFilters.tsx` — filter drawer
- `components/admin/participants/ParticipantStatusBadge.tsx`
- `components/admin/offer/RevenueKpiCard.tsx`
- `components/admin/offer/SegmentTabs.tsx` — lang/device/region tabs
- `components/admin/offer/OfferTrendChart.tsx`
- `components/admin/offer/VariantHistoryPanel.tsx`

**Модифицируются:**
- `app/(admin)/admin/leads/LeadsClient.tsx` — массивная переработка
- `app/(admin)/admin/offer/OfferClient.tsx`
- `app/(admin)/admin/participants/ParticipantsClient.tsx`
- `app/(admin)/admin/player/[playerId]/PlayerClient.tsx`
- `components/admin/DayReplayModal.tsx` — использовать `resolveNodeLabel`
- `components/admin/Timeline.tsx` — добавить filter toggle
- `app/api/bitrix/lead/route.ts` — записать `dealId/contactId` обратно в `leads`

---

## 🔐 Соглашения безопасности

- Все новые `/api/admin/*` endpoint'ы ОБЯЗАТЕЛЬНО вызывают `requireAdmin(req)` первой строкой.
- Bitrix deep-links строить через `process.env.BITRIX_PORTAL_URL` (новая env var; если не установлена, кнопка отключена). Добавить в `.env.example`.
- Bitrix revenue fetch — server-only, НЕ через client.
- RLS на новых таблицах — строгий (`service_role only`).

---

# БЛОК A. Foundation — миграции и Bitrix helpers

## Задача 2.A.1: Migration 020 — leads CRM link + status

**Files:**
- Create: `supabase/migrations/020_lead_crm_link.sql`

- [ ] **Шаг 1: Написать миграцию**

```sql
-- 020: Leads CRM linkage + processing status
-- ADD-only. Extends public.leads with Bitrix references and processing state.

-- 1. Add columns to leads (nullable — existing rows stay valid)
alter table public.leads add column if not exists bitrix_deal_id bigint;
alter table public.leads add column if not exists bitrix_contact_id bigint;
alter table public.leads add column if not exists status text not null default 'new'
  check (status in ('new', 'in_progress', 'done', 'invalid'));
alter table public.leads add column if not exists assigned_to text;
alter table public.leads add column if not exists status_changed_at timestamptz;

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_bitrix_deal on public.leads(bitrix_deal_id) where bitrix_deal_id is not null;

-- 2. Audit history for status changes
create table if not exists public.lead_state_history (
  id bigserial primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  changed_at timestamptz not null default now(),
  note text
);
create index if not exists idx_lead_state_history_lead on public.lead_state_history(lead_id, changed_at desc);

alter table public.lead_state_history enable row level security;
grant all on public.lead_state_history to service_role;

-- 3. Trigger to auto-append history on status change
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_state_history (lead_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, new.assigned_to, null);
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_leads_status_change on public.leads;
create trigger trg_leads_status_change
  before update on public.leads
  for each row
  execute function public.log_lead_status_change();

comment on column public.leads.status is 'Admin workflow state: new | in_progress | done | invalid';
comment on column public.leads.bitrix_deal_id is 'FK into Bitrix crm.deal (assigned by /api/bitrix/lead after deal creation)';
```

- [ ] **Шаг 2: Применить миграцию через Supabase MCP**

```
mcp__plugin_supabase_supabase__apply_migration
  project_id: njbcybjdzjahpdmcjtqe
  name: 020_lead_crm_link
  query: <content above>
```

- [ ] **Шаг 3: Verify**

```
mcp__plugin_supabase_supabase__execute_sql
  query: "select column_name, data_type from information_schema.columns where table_name = 'leads' and column_name in ('bitrix_deal_id','bitrix_contact_id','status','assigned_to','status_changed_at') order by column_name"
```

Ожидание: 5 строк, все колонки присутствуют.

- [ ] **Шаг 4: Commit**

```bash
git add supabase/migrations/020_lead_crm_link.sql
git commit -m "$(cat <<'EOF'
feat(db): migration 020 — leads CRM link + status workflow

Adds bitrix_deal_id, bitrix_contact_id, status, assigned_to to leads
plus lead_state_history audit table with auto-populating trigger.
Enables Phase 2 sales-core workflow (status transitions, Bitrix deep-links).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Задача 2.A.2: Migration 021 — participant (player) admin states

**Files:**
- Create: `supabase/migrations/021_participant_states.sql`

- [ ] **Шаг 1: Написать миграцию**

```sql
-- 021: Player admin-side processing state
-- ADD-only. Separate table (not on players) because players is user-facing
-- and we want admin metadata isolated from game state.

create table if not exists public.player_admin_states (
  player_id uuid primary key references public.players(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'done', 'hire', 'skip')),
  assigned_to text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_player_admin_states_status on public.player_admin_states(status);

alter table public.player_admin_states enable row level security;
grant all on public.player_admin_states to service_role;

-- History table
create table if not exists public.player_admin_state_history (
  id bigserial primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);
create index if not exists idx_player_admin_history_player on public.player_admin_state_history(player_id, changed_at desc);

alter table public.player_admin_state_history enable row level security;
grant all on public.player_admin_state_history to service_role;

create or replace function public.log_player_admin_state_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.player_admin_state_history (player_id, from_status, to_status, changed_by)
    values (new.player_id, old.status, new.status, new.assigned_to);
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_player_admin_states_change on public.player_admin_states;
create trigger trg_player_admin_states_change
  before update on public.player_admin_states
  for each row
  execute function public.log_player_admin_state_change();

comment on table public.player_admin_states is 'Admin-owned workflow state for each player — separate from game state';
```

- [ ] **Шаг 2: Применить + verify + commit** (аналогично 2.A.1).

---

## Задача 2.A.3: Write-back Bitrix deal+contact IDs to leads

**Files:**
- Modify: `app/api/bitrix/lead/route.ts` — после `crm.deal.add` / `crm.deal.update` записать IDs в таблицу `leads` по phone
- Test: `app/api/bitrix/lead/__tests__/writeback.test.ts` (integration-lite)

Проблема: `/api/bitrix/lead/route.ts` принимает `{name, phone, sourcePage, ...}` но не знает `leads.id` (строка в leads создаётся отдельным insert'ом из формы). Нужно связать по телефону.

- [ ] **Шаг 1: Найти место где создаётся lead row**

```
Grep pattern: "from\\('leads'\\)\\.insert|\\.insert\\([^)]*\\{.*phone"
glob: "app/**/*.ts"
```

Запомни file/line.

- [ ] **Шаг 2: В `app/api/bitrix/lead/route.ts` после успешного `crm.deal.add` / deal update написать**

Где-то рядом с `return NextResponse.json({ ok: true, contactId, dealId, ... })`:

```ts
// Write back to leads — associate most recent matching lead (by phone, last 5 min).
try {
  const sb = getAdminSupabase(); // или createAdminClient — use project's convention
  await sb
    .from('leads')
    .update({ bitrix_deal_id: dealId, bitrix_contact_id: contactId })
    .eq('phone', body.phone)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .is('bitrix_deal_id', null);
} catch (e) {
  console.warn('[bitrix/lead] writeback failed', e);
  // non-fatal; Bitrix side already done
}
```

⚠️ Импорт supabase admin client — проверь актуальное имя (`createAdminClient` из `@/lib/supabase/admin` или похожее). Используй ту же функцию что и другие API routes в `app/api/admin/`.

- [ ] **Шаг 3: Ручной тест** — сделать form submission на прод-подобной env, убедиться `leads.bitrix_deal_id` заполнен.

Если локальной БД с leads нет — пропустить; надеемся на integration-review.

- [ ] **Шаг 4: Commit**

```
feat(bitrix): write dealId/contactId back to leads row

Links Supabase leads row to Bitrix contact+deal after successful create/
update so admin UI can show deal status without repeated lookups.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Задача 2.A.4: Bitrix deals helpers + /api/admin/bitrix/deal/[id]

**Files:**
- Create: `lib/bitrix/deals.ts`
- Create: `lib/bitrix/stages.ts` — export `STAGE_LABELS`
- Create: `app/api/admin/bitrix/deal/[id]/route.ts`

- [ ] **Шаг 1: `lib/bitrix/stages.ts`**

```ts
// lib/bitrix/stages.ts
import 'server-only';

const CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);
const C = (id: string) => `C${CATEGORY_ID}:${id}`;

export const STAGE_LABELS: Record<string, { label: string; tone: 'default' | 'progress' | 'won' | 'lost' }> = {
  [C('NEW')]: { label: 'Новый', tone: 'default' },
  [C('UC_GAME_ONB')]: { label: 'Игра: онбординг', tone: 'progress' },
  [C('UC_GAME_CONS')]: { label: 'Игра: консультация', tone: 'progress' },
  [C('UC_CALLED')]: { label: 'Дозвонились', tone: 'progress' },
  [C('UC_INTERESTED')]: { label: 'Заинтересован', tone: 'progress' },
  [C('UC_CLOSING')]: { label: 'Дожим', tone: 'progress' },
  [C('WON')]: { label: 'Закрыто: купил', tone: 'won' },
  [C('LOSE')]: { label: 'Закрыто: отказ', tone: 'lost' },
  [C('APOLOGY')]: { label: 'Не подошёл', tone: 'lost' },
};

export function stageLabel(stageId: string | null | undefined): { label: string; tone: 'default' | 'progress' | 'won' | 'lost' } {
  if (!stageId) return { label: 'Без сделки', tone: 'default' };
  return STAGE_LABELS[stageId] ?? { label: stageId, tone: 'default' };
}

export function stageIsWon(stageId: string | null | undefined): boolean {
  return !!stageId && STAGE_LABELS[stageId]?.tone === 'won';
}
```

⚠️ Если список stages отличается — расширь. Check существующий `/api/bitrix/lead/route.ts:16-27` (`STAGE_NEW`, `STAGE_GAME_ONB`, `STAGE_GAME_CONS`, `TERMINAL_STAGES`, `EARLY_STAGES`) — adapt labels под реальные стадии.

- [ ] **Шаг 2: `lib/bitrix/deals.ts`**

```ts
import 'server-only';
import { bitrixCall } from './client';

export interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  CLOSED: 'Y' | 'N';
  DATE_CREATE: string;
  DATE_MODIFY: string;
  CONTACT_ID: string | null;
  CATEGORY_ID: string;
  UTM_SOURCE?: string | null;
}

export async function getDealById(id: number): Promise<BitrixDeal | null> {
  try {
    const result = await bitrixCall<BitrixDeal>('crm.deal.get', { id });
    return result ?? null;
  } catch (e) {
    console.warn('[bitrix.deals] getDealById failed', id, e);
    return null;
  }
}

export async function listDealsByContactIds(contactIds: number[]): Promise<BitrixDeal[]> {
  if (contactIds.length === 0) return [];
  const result = await bitrixCall<BitrixDeal[]>('crm.deal.list', {
    filter: { CONTACT_ID: contactIds },
    select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CLOSED', 'DATE_CREATE', 'CONTACT_ID', 'CATEGORY_ID'],
  });
  return result ?? [];
}

export async function sumRevenueForPeriod(from: Date, to: Date, categoryId: number): Promise<{ total: number; currency: string; deals: number }> {
  const result = await bitrixCall<BitrixDeal[]>('crm.deal.list', {
    filter: {
      CATEGORY_ID: categoryId,
      STAGE_SEMANTIC_ID: 'S', // won
      '>=CLOSEDATE': from.toISOString().slice(0, 10),
      '<=CLOSEDATE': to.toISOString().slice(0, 10),
    },
    select: ['ID', 'OPPORTUNITY', 'CURRENCY_ID'],
  });
  const deals = result ?? [];
  const total = deals.reduce((acc, d) => acc + Number(d.OPPORTUNITY ?? 0), 0);
  const currency = deals[0]?.CURRENCY_ID ?? 'UZS';
  return { total, currency, deals: deals.length };
}
```

- [ ] **Шаг 3: API route — `app/api/admin/bitrix/deal/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDealById } from '@/lib/bitrix/deals';
import { stageLabel } from '@/lib/bitrix/stages';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await ctx.params;
  const dealId = Number(id);
  if (!Number.isFinite(dealId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const deal = await getDealById(dealId);
  if (!deal) return NextResponse.json({ deal: null });
  return NextResponse.json({
    deal,
    stage: stageLabel(deal.STAGE_ID),
    portalUrl: buildBitrixDealUrl(dealId),
  });
}

function buildBitrixDealUrl(id: number): string | null {
  const base = process.env.BITRIX_PORTAL_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/crm/deal/details/${id}/`;
}
```

- [ ] **Шаг 4: Env var**

Добавить в `.env.example` (создай если нет):
```
BITRIX_PORTAL_URL=https://truckingmba.bitrix24.kz
```

Не добавлять секреты. `.env.local` обновляется юзером.

- [ ] **Шаг 5: Commit**

```
feat(admin): add Bitrix deals helpers + /api/admin/bitrix/deal/[id]

Server-only helpers (getDealById, listDealsByContactIds, sumRevenueForPeriod)
and stage label map. Proxies crm.deal.get behind admin auth, returns deal
with human-readable stage + portal deep-link URL.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Задача 2.A.5: Bitrix revenue endpoint

**Files:**
- Create: `app/api/admin/bitrix/revenue/route.ts`
- Modify: `lib/admin/api.ts` — добавить `fetchRevenue(period, from, to)`

- [ ] **Шаг 1: API route**

```ts
// app/api/admin/bitrix/revenue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { sumRevenueForPeriod } from '@/lib/bitrix/deals';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);
const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);
  const fromDate = range.from ? new Date(range.from) : new Date(0);
  const toDate = range.to ? new Date(range.to) : new Date();
  try {
    const revenue = await sumRevenueForPeriod(fromDate, toDate, CATEGORY_ID);
    return NextResponse.json(revenue);
  } catch (e) {
    console.warn('[admin/bitrix/revenue]', e);
    return NextResponse.json({ total: 0, currency: 'UZS', deals: 0, error: 'bitrix_unavailable' }, { status: 200 });
  }
}
```

⚠️ Важно: если Bitrix недоступен, возвращаем 200 + `error: 'bitrix_unavailable'` (не 500) — чтобы UI grace-fallback'ился.

- [ ] **Шаг 2: Client helper**

```ts
// lib/admin/api.ts — append
export interface RevenueData {
  total: number;
  currency: string;
  deals: number;
  error?: string;
}
export async function fetchRevenue(options: { period: Period; from?: string | null; to?: string | null }): Promise<RevenueData> {
  const qs = new URLSearchParams({ period: options.period });
  if (options.from) qs.set('from', options.from);
  if (options.to) qs.set('to', options.to);
  const res = await fetch(`/api/admin/bitrix/revenue?${qs}`);
  if (!res.ok) throw new Error('revenue fetch failed');
  return res.json();
}
```

- [ ] **Шаг 3: Commit**

---

## Задача 2.A.6: Lead dedup + player-linkage queries + endpoint

**Files:**
- Create: `lib/admin/leads-queries.ts` — server-only
- Create: `app/api/admin/leads/dedup/route.ts`

- [ ] **Шаг 1: `lib/admin/leads-queries.ts`**

```ts
// lib/admin/leads-queries.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getLeadDedupCounts(phones: string[]): Promise<Record<string, number>> {
  if (phones.length === 0) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('phone')
    .in('phone', phones);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.phone] = (counts[row.phone] ?? 0) + 1;
  }
  return counts;
}

export async function getLinkedPlayerByPhone(phones: string[]): Promise<Record<string, { id: string; display_name: string | null }>> {
  if (phones.length === 0) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from('players')
    .select('id, phone, display_name')
    .in('phone', phones);
  const map: Record<string, { id: string; display_name: string | null }> = {};
  for (const row of data ?? []) {
    map[row.phone] = { id: row.id, display_name: row.display_name };
  }
  return map;
}

export async function updateLeadStatus(leadId: string, status: 'new' | 'in_progress' | 'done' | 'invalid', assignedTo: string | null): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('leads')
    .update({ status, assigned_to: assignedTo })
    .eq('id', leadId);
  if (error) throw error;
}

export async function bulkUpdateLeads(ids: string[], patch: { status?: string; assigned_to?: string }): Promise<number> {
  if (ids.length === 0) return 0;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .update(patch)
    .in('id', ids)
    .select('id');
  if (error) throw error;
  return (data ?? []).length;
}
```

- [ ] **Шаг 2: Dedup API**

```ts
// app/api/admin/leads/dedup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeadDedupCounts, getLinkedPlayerByPhone } from '@/lib/admin/leads-queries';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = (await req.json()) as { phones: string[] };
  const phones = (body.phones ?? []).filter(Boolean);
  const [dedup, players] = await Promise.all([
    getLeadDedupCounts(phones),
    getLinkedPlayerByPhone(phones),
  ]);
  return NextResponse.json({ dedup, players });
}
```

POST (а не GET) — потому что список phones может быть длинным для URL.

- [ ] **Шаг 3: Client helper**

```ts
// lib/admin/api.ts — append
export interface DedupInfo {
  dedup: Record<string, number>;
  players: Record<string, { id: string; display_name: string | null }>;
}
export async function fetchLeadDedupAndPlayers(phones: string[]): Promise<DedupInfo> {
  const res = await fetch(`/api/admin/leads/dedup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phones }),
  });
  if (!res.ok) throw new Error('dedup fetch failed');
  return res.json();
}
```

- [ ] **Шаг 4: Commit**

```
feat(admin): add lead dedup + player-linkage queries and endpoint

Provides phone→count and phone→player map for Leads page to render
duplicate badges and "Open player" deep-links.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

# БЛОК B. Leads rework (~11 задач)

## Задача 2.B.1: Dynamic source tabs

**Files:**
- Create: `app/api/admin/source-tabs/route.ts`
- Modify: `app/(admin)/admin/leads/LeadsClient.tsx` — убрать hardcode `SOURCE_TABS`

- [ ] **Шаг 1: API**

```ts
// app/api/admin/source-tabs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const admin = createAdminClient();
  // Distinct source_page values from leads (past 90 days; 'game' excluded)
  const { data } = await admin
    .from('leads')
    .select('source_page')
    .neq('source_page', 'game')
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .limit(1000);

  const set = new Set<string>();
  for (const r of data ?? []) set.add(r.source_page);

  // Join with pages_registry for human labels
  const slugs = Array.from(set);
  const { data: regs } = await admin
    .from('pages_registry')
    .select('slug, title_ru')
    .in('slug', slugs);
  const labelMap = new Map<string, string>();
  for (const r of regs ?? []) labelMap.set(r.slug, r.title_ru);

  const tabs = slugs.map(slug => ({ slug, label: labelMap.get(slug) ?? slug }));
  return NextResponse.json({ tabs });
}
```

- [ ] **Шаг 2: Client — заменить hardcode**

В `LeadsClient.tsx` заменить:
```tsx
const SOURCE_TABS: Array<{ slug: string | null; label: string }> = [
  { slug: null, label: 'Все' },
  { slug: 'home', label: 'Home' },
  { slug: 'target', label: 'Target' },
];
```

На:
```tsx
const [sourceTabs, setSourceTabs] = useState<Array<{ slug: string | null; label: string }>>([
  { slug: null, label: 'Все' },
]);
useEffect(() => {
  fetch('/api/admin/source-tabs')
    .then(r => r.json())
    .then(d => {
      setSourceTabs([{ slug: null, label: 'Все' }, ...d.tabs]);
    })
    .catch(() => {});
}, []);
```

- [ ] **Шаг 3: Build + commit**

```
feat(admin/leads): dynamic source tabs from DB
```

---

## Задача 2.B.2: Lead status column + filter + PATCH endpoint

**Files:**
- Create: `app/api/admin/leads/[id]/status/route.ts`
- Create: `components/admin/leads/LeadStatusBadge.tsx`
- Modify: `app/(admin)/admin/leads/LeadsClient.tsx`

- [ ] **Шаг 1: API**

```ts
// app/api/admin/leads/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { updateLeadStatus } from '@/lib/admin/leads-queries';

export const dynamic = 'force-dynamic';

const VALID = ['new', 'in_progress', 'done', 'invalid'] as const;
type Status = typeof VALID[number];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await ctx.params;
  const body = (await req.json()) as { status: Status; assigned_to?: string | null };
  if (!VALID.includes(body.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  try {
    await updateLeadStatus(id, body.status, body.assigned_to ?? null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Шаг 2: Badge компонент**

```tsx
// components/admin/leads/LeadStatusBadge.tsx
'use client';

const CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'Новый', bg: '#dbeafe', color: '#1e40af' },
  in_progress: { label: 'В работе', bg: '#fef3c7', color: '#92400e' },
  done: { label: 'Готово', bg: '#dcfce7', color: '#166534' },
  invalid: { label: 'Негодный', bg: '#fee2e2', color: '#991b1b' },
};

export function LeadStatusBadge({ status }: { status: string }) {
  const c = CONFIG[status] ?? CONFIG.new;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

export { CONFIG as LEAD_STATUS_CONFIG };
```

- [ ] **Шаг 3: Client — добавить колонку + filter**

В `LeadsClient.tsx`:
- Добавить `statusFilter: string | 'all'` в state, default `'all'`.
- Прокинуть в `fetchLeads({status: statusFilter === 'all' ? undefined : statusFilter, ...})`.
- Добавить dropdown с 5 опциями (`Все`, `Новые`, `В работе`, `Готово`, `Негодные`) рядом с sourceFilter tabs.
- В таблице добавить колонку «Статус» с `<LeadStatusBadge status={lead.status} />` + клик по статусу открывает inline select для смены.

⚠️ Нужно обновить `getLeads` в `lib/admin/page-queries.ts:95` чтобы принимал `status?: string` и фильтровал `.eq('status', status)`.

Также нужно обновить API `/api/admin/leads/route.ts` для прокидки `status` search param.

- [ ] **Шаг 4: Build + commit**

```
feat(admin/leads): status column + filter + PATCH endpoint
```

---

## Задача 2.B.3: UTM multi-select filter

**Files:**
- Create: `components/admin/leads/UtmFilter.tsx` — multi-select popover
- Modify: `lib/admin/page-queries.ts` `getLeads` — `utmSource?: string[]`, `utmCampaign?: string[]`
- Modify: `app/api/admin/leads/route.ts` + `lib/admin/api.ts` `fetchLeads` + `LeadsClient.tsx`

- [ ] **Шаг 1: Получить distinct UTM values**

Дополнить `/api/admin/source-tabs/route.ts` чтобы ещё возвращало distinct UTM sources/campaigns за период:
- ИЛИ создать отдельный `/api/admin/leads/filters/route.ts`

Проще: `GET /api/admin/leads/filters?period=30d` → `{sources: string[], mediums: string[], campaigns: string[]}`.

Создай `app/api/admin/leads/filters/route.ts`:
```ts
// bullet-list of distinct values from leads.utm_source/medium/campaign
```

Подход: SQL `select distinct utm_source from leads where utm_source is not null and created_at > now() - interval '90 days' limit 50`. Повтор для каждой колонки.

Использовать Supabase client через `createAdminClient`. Detailed SQL не пишу — простой `.select('utm_source').not('utm_source','is',null).limit(500)` и client-side dedup.

- [ ] **Шаг 2: UtmFilter multi-select popover компонент**

Простейший dropdown с checkbox'ами и кнопкой «Применить». Состояние — массив выбранных строк.

Скелет:
```tsx
// components/admin/leads/UtmFilter.tsx
'use client';
import { useState } from 'react';
import { Filter } from 'lucide-react';

interface Props {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function UtmFilter({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }
  return (
    <div style={{ position: 'relative' }}>
      <button className="admin-btn" onClick={() => setOpen(!open)}>
        <Filter size={12} /> {label}{value.length ? ` (${value.length})` : ''}
      </button>
      {open && (
        <div className="admin-card" style={{ position: 'absolute', top: 36, right: 0, minWidth: 200, maxHeight: 280, overflowY: 'auto', padding: 8, zIndex: 20 }}>
          {options.length === 0 && <div style={{ color: 'var(--admin-text-dim)', padding: 6, fontSize: 12 }}>Нет значений</div>}
          {options.map(o => (
            <label key={o} style={{ display: 'flex', gap: 8, padding: 4, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} /> {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Шаг 3: Query + API — принять массивы**

В `getLeads` добавить `utm_source?: string[]` и ilike in:
```ts
if (utmSources?.length) query = query.in('utm_source', utmSources);
if (utmCampaigns?.length) query = query.in('utm_campaign', utmCampaigns);
```

В API route — читать `?utm_source=a,b,c` и split.

- [ ] **Шаг 4: Client — подключить в `LeadsClient`**

Показывать кнопки UtmFilter рядом с sourceFilter. При изменении — re-fetch.

- [ ] **Шаг 5: Build + commit**

---

## Задача 2.B.4: Sort columns

**Files:**
- Modify: `app/(admin)/admin/leads/LeadsClient.tsx` — использовать существующий `SortableHeader` для колонок

Проект имеет `components/admin/SortableHeader.tsx`. Использовать на колонках `Дата`, `Имя`, `Телефон`, `Статус`.

- [ ] **Шаг 1: Read `SortableHeader.tsx`** — понять API.
- [ ] **Шаг 2: Заменить `<th>` на `<SortableHeader>` для 4 колонок.**
- [ ] **Шаг 3: State `sortBy/sortAsc` уже прокидывается в `fetchLeads` — проверь.**
- [ ] **Шаг 4: Build + commit.**

---

## Задача 2.B.5: Export CSV

**Files:**
- Create: `app/api/admin/leads/export/route.ts` — GET, возвращает `text/csv`
- Modify: `LeadsClient.tsx` — добавить кнопку в `PageHeader actions`

- [ ] **Шаг 1: API**

```ts
// app/api/admin/leads/export/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeads } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  // Reuse same filter params as /api/admin/leads (period, slug, search, status, etc.)
  // Fetch everything (no pagination)
  const { leads } = await getLeads({
    slug: sp.get('slug') ?? undefined,
    search: sp.get('search') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
    limit: 10_000,
  });

  const header = ['Дата', 'Имя', 'Телефон', 'Страница', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Устройство', 'Статус', 'Bitrix Deal ID'];
  const rows = leads.map(l => [
    new Date(l.created_at).toISOString(),
    l.name,
    l.phone,
    l.source_page,
    l.utm_source ?? '',
    l.utm_medium ?? '',
    l.utm_campaign ?? '',
    l.device_type ?? '',
    (l as { status?: string }).status ?? 'new',
    (l as { bitrix_deal_id?: number | null }).bitrix_deal_id ?? '',
  ]);

  const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');

  return new Response('\uFEFF' + csv, { // BOM for Excel UTF-8 detection
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
```

- [ ] **Шаг 2: Client — кнопка**

Добавить в `PageHeader actions`:
```tsx
<a href={`/api/admin/leads/export?${qs}`} className="admin-btn" download>
  <Download size={12} /> CSV
</a>
```

Построить `qs` из текущих фильтров (slug, search, from, to, status и т.д.).

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.B.6: Bulk actions (checkboxes + action bar)

**Files:**
- Create: `components/admin/leads/LeadActionBar.tsx`
- Create: `app/api/admin/leads/bulk/route.ts` — POST
- Modify: `LeadsClient.tsx`

- [ ] **Шаг 1: Bulk API**

```ts
// app/api/admin/leads/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { bulkUpdateLeads } from '@/lib/admin/leads-queries';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['new', 'in_progress', 'done', 'invalid'];

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = (await req.json()) as { ids: string[]; action: 'status' | 'assign'; value: string };
  if (!body.ids?.length) return NextResponse.json({ error: 'no ids' }, { status: 400 });

  if (body.action === 'status') {
    if (!VALID_STATUSES.includes(body.value)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    const updated = await bulkUpdateLeads(body.ids, { status: body.value });
    return NextResponse.json({ updated });
  }
  if (body.action === 'assign') {
    const updated = await bulkUpdateLeads(body.ids, { assigned_to: body.value });
    return NextResponse.json({ updated });
  }
  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}
```

- [ ] **Шаг 2: LeadActionBar component**

```tsx
// components/admin/leads/LeadActionBar.tsx
'use client';
import { Copy, UserCheck, X } from 'lucide-react';
import { useToast } from '../shared/ToastProvider';

interface Props {
  selectedIds: string[];
  selectedPhones: string[];
  onClear: () => void;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
}

const STATUS_ACTIONS = [
  { value: 'in_progress', label: 'В работу' },
  { value: 'done', label: 'Готово' },
  { value: 'invalid', label: 'Негодный' },
];

export function LeadActionBar({ selectedIds, selectedPhones, onClear, onStatusChange, onRefresh }: Props) {
  const toast = useToast();
  if (selectedIds.length === 0) return null;

  function copyPhones() {
    navigator.clipboard.writeText(selectedPhones.join('\n'));
    toast.push({ tone: 'success', title: `${selectedPhones.length} номеров скопировано` });
  }

  async function bulkStatus(status: string) {
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'status', value: status }),
      });
      if (!res.ok) throw new Error('failed');
      const { updated } = await res.json();
      toast.push({ tone: 'success', title: `Обновлено ${updated}` });
      onStatusChange(status);
      onRefresh();
    } catch (e) {
      toast.push({ tone: 'danger', title: 'Не удалось', description: String(e) });
    }
  }

  return (
    <div className="admin-action-bar">
      <span>Выбрано: {selectedIds.length}</span>
      <button className="admin-btn" onClick={copyPhones}><Copy size={12} /> Скопировать номера</button>
      {STATUS_ACTIONS.map(a => (
        <button key={a.value} className="admin-btn" onClick={() => bulkStatus(a.value)}>
          <UserCheck size={12} /> {a.label}
        </button>
      ))}
      <button className="admin-btn" onClick={onClear}><X size={12} /> Отменить</button>
    </div>
  );
}
```

CSS (в `admin.css`):
```css
.admin-action-bar {
  position: sticky;
  bottom: 16px;
  z-index: 50;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
  margin: 16px auto 0;
  width: fit-content;
  font-size: 12px;
}
```

- [ ] **Шаг 3: Checkboxes в LeadsClient**

- Добавить колонку `<input type="checkbox">` в начале таблицы.
- State: `selectedIds: Set<string>`.
- Shift-click для range selection — optional, пропускаем в MVP.
- Header checkbox — toggle all.

- [ ] **Шаг 4: Build + commit.**

---

## Задача 2.B.7: Dedup badge

**Files:**
- Modify: `LeadsClient.tsx` — вызвать `fetchLeadDedupAndPlayers` после загрузки leads, показать badge где count>1

- [ ] **Шаг 1: После загрузки `leads`** вызвать `fetchLeadDedupAndPlayers(leads.map(l => l.phone))` и сохранить `dedup` map в state.

- [ ] **Шаг 2: В строке таблицы** показать badge рядом с phone:

```tsx
{dedup[lead.phone] > 1 && (
  <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 4, fontSize: 10, marginLeft: 4 }}>
    дубль ×{dedup[lead.phone]}
  </span>
)}
```

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.B.8: Bitrix deal status column + "Open in Bitrix"

**Files:**
- Create: `components/admin/leads/BitrixDealBadge.tsx`
- Modify: `LeadsClient.tsx`

- [ ] **Шаг 1: Badge component**

```tsx
// components/admin/leads/BitrixDealBadge.tsx
'use client';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface DealInfo {
  stage: { label: string; tone: 'default' | 'progress' | 'won' | 'lost' };
  portalUrl: string | null;
}

const TONE: Record<string, { bg: string; color: string }> = {
  default: { bg: '#f1f5f9', color: '#475569' },
  progress: { bg: '#dbeafe', color: '#1e40af' },
  won: { bg: '#dcfce7', color: '#166534' },
  lost: { bg: '#fee2e2', color: '#991b1b' },
};

export function BitrixDealBadge({ dealId }: { dealId: number | null }) {
  const [info, setInfo] = useState<DealInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dealId) return;
    setLoading(true);
    fetch(`/api/admin/bitrix/deal/${dealId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.stage) setInfo(d); })
      .finally(() => setLoading(false));
  }, [dealId]);

  if (!dealId) return <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }}>—</span>;
  if (loading || !info) return <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }}>…</span>;

  const t = TONE[info.stage.tone];
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{ background: t.bg, color: t.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
        {info.stage.label}
      </span>
      {info.portalUrl && (
        <a href={info.portalUrl} target="_blank" rel="noopener noreferrer" aria-label="Открыть в Bitrix" style={{ color: 'var(--admin-text-dim)' }}>
          <ExternalLink size={12} />
        </a>
      )}
    </span>
  );
}
```

⚠️ Перф: каждая строка делает отдельный fetch. При 100 лидах это 100 запросов. Для MVP — OK, если не лагает. Для оптимизации (SHOULD): собрать уникальные dealIds из `leads`, сделать 1 batch-запрос `POST /api/admin/bitrix/deals/batch` — вынести в separate task если MVP медленный.

- [ ] **Шаг 2: Колонка в таблице**

В `LeadsClient.tsx` добавить `<th>Сделка</th>` и `<td><BitrixDealBadge dealId={lead.bitrix_deal_id} /></td>`.

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.B.9: Player linkage — «Открыть игрока»

**Files:**
- Modify: `LeadsClient.tsx`

- [ ] **Шаг 1: После `fetchLeadDedupAndPlayers`** в state сохраняется `players` map (phone → `{id, display_name}`).

- [ ] **Шаг 2: В каждой строке leads** — если `players[lead.phone]` есть, показать кнопку:

```tsx
{players[lead.phone] && (
  <Link href={`/admin/player/${players[lead.phone].id}`} className="admin-btn" style={{ padding: '2px 8px', fontSize: 11 }}>
    <User size={10} /> Игрок
  </Link>
)}
```

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.B.10: WhatsApp / Telegram outreach buttons

**Files:**
- Create: `lib/admin/outreach.ts`
- Create: `components/admin/leads/OutreachButtons.tsx`
- Modify: `LeadsClient.tsx`

- [ ] **Шаг 1: `lib/admin/outreach.ts`**

```ts
// lib/admin/outreach.ts — isomorphic

export interface OutreachTemplates {
  whatsapp: string;
  telegram: string;
}

export const DEFAULT_TEMPLATES: OutreachTemplates = {
  whatsapp: 'Здравствуйте, {name}! Это Sales School — вы оставили заявку на наш курс. Удобно обсудить программу и стоимость?',
  telegram: 'Здравствуйте, {name}! Это Sales School. Удобно обсудить ваш запрос?',
};

export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export function buildWhatsAppUrl(phone: string, name: string, tpl = DEFAULT_TEMPLATES.whatsapp): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  const text = encodeURIComponent(renderTemplate(tpl, { name }));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export function buildTelegramUrl(phone: string, _name: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  // Telegram doesn't support prefilled text via phone-link. Falls back to opening chat.
  return `https://t.me/+${cleanPhone}`;
}
```

- [ ] **Шаг 2: Component**

```tsx
// components/admin/leads/OutreachButtons.tsx
'use client';
import { MessageCircle, Send, Phone } from 'lucide-react';
import { buildWhatsAppUrl, buildTelegramUrl } from '@/lib/admin/outreach';

export function OutreachButtons({ phone, name }: { phone: string; name: string }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      <a href={`tel:${phone}`} title="Позвонить" className="admin-icon-btn">
        <Phone size={12} />
      </a>
      <a href={buildWhatsAppUrl(phone, name)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="admin-icon-btn">
        <MessageCircle size={12} />
      </a>
      <a href={buildTelegramUrl(phone, name)} target="_blank" rel="noopener noreferrer" title="Telegram" className="admin-icon-btn">
        <Send size={12} />
      </a>
    </div>
  );
}
```

- [ ] **Шаг 3: Колонка «Действия» в таблице**

```tsx
<td><OutreachButtons phone={lead.phone} name={lead.name} /></td>
```

- [ ] **Шаг 4: Build + commit.**

---

## Задача 2.B.11: Cleanup — убрать KPI «На странице», subtitle

**Files:**
- Modify: `LeadsClient.tsx`

- [ ] **Шаг 1: Убрать KPI «На странице»** (найти в KPI-ряду) — вместо неё новый KPI «Новые сегодня» или «В работе».
- [ ] **Шаг 2: Убрать/заменить subtitle** «Отдельно от участников игры» на нейтральное «Заявки с регистрационных форм».
- [ ] **Шаг 3: Убедиться что хардкод `SOURCE_TABS` уже удалён** (из 2.B.1).
- [ ] **Шаг 4: Build + commit.**

---

# БЛОК C. Offer rework (~8 задач)

## Задача 2.C.1: «Конверсия» — модалка с формулой

**Files:**
- Create: `components/admin/offer/ConversionHint.tsx`
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: Modal**

```tsx
// components/admin/offer/ConversionHint.tsx
'use client';
import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function ConversionHint() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-label="Что это?" className="admin-icon-btn" style={{ width: 18, height: 18 }} onClick={() => setOpen(true)}>
        <HelpCircle size={12} />
      </button>
      {open && (
        <div className="admin-search-overlay" onClick={() => setOpen(false)}>
          <div className="admin-search-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Что такое «Конверсия»</h3>
                <button className="admin-icon-btn" onClick={() => setOpen(false)}><X size={14} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', lineHeight: 1.6 }}>
                Конверсия оффера — доля посетителей оффер-страницы, оставивших заявку на покупку.
              </p>
              <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, fontSize: 12, fontFamily: 'monospace', marginTop: 8 }}>
                CR = заявки / просмотры_оффера × 100%
              </div>
              <p style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 8 }}>
                Отличается от CTR (клики / просмотры) — конверсия учитывает только тех, кто реально оформил заявку, а не просто кликнул на CTA.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Шаг 2: В `OfferClient.tsx`** — рядом с KPI «Конверсия» добавить `<ConversionHint />`.

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.C.2: CR отдельный KPI

**Files:**
- Modify: `OfferClient.tsx` — добавить KPI card

- [ ] **Шаг 1: Вычислить CR** = `conversion / offerViews * 100` (данные уже есть в `funnel`).
- [ ] **Шаг 2: Добавить KPI-карточку «CR (конверсия / просмотр)»** в KPI ряд.
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.C.3: Revenue KPI

**Files:**
- Create: `components/admin/offer/RevenueKpiCard.tsx`
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: Компонент**

```tsx
// components/admin/offer/RevenueKpiCard.tsx
'use client';
import { useEffect, useState } from 'react';
import { fetchRevenue } from '@/lib/admin/api';
import KpiCard from '@/components/admin/KpiCard';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

export function RevenueKpiCard({ periodState }: { periodState: PeriodParamState }) {
  const [data, setData] = useState<{ total: number; currency: string; deals: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRevenue({ period: periodState.period, from: periodState.from, to: periodState.to })
      .then(d => {
        if (d.error) { setError(true); return; }
        setData({ total: d.total, currency: d.currency, deals: d.deals });
      })
      .catch(() => setError(true));
  }, [periodState]);

  if (error) return <KpiCard label="Выручка" value="—" hint="Bitrix недоступен" />;
  if (!data) return <KpiCard label="Выручка" value="…" />;
  return <KpiCard label="Выручка" value={data.total.toLocaleString('ru-RU')} suffix={' ' + data.currency} hint={`${data.deals} сделок WON`} />;
}
```

⚠️ `KpiCard` уже есть — проверь его API в `components/admin/KpiCard.tsx`.

- [ ] **Шаг 2: Подключить в `OfferClient.tsx`** в KPI ряд как 5-ю карточку.

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.C.4: Тренд CTR/CR по дням

**Files:**
- Create: `components/admin/offer/OfferTrendChart.tsx`
- Create: миграция `022_offer_trend_rpc.sql` OR SQL через direct select
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: Получить daily aggregated offer_events**

```ts
// lib/admin/offer-queries.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DateRange } from '@/lib/admin/types-v2';

export interface OfferTrendRow {
  day: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cr: number;
}

export async function getOfferTrend(range: DateRange): Promise<OfferTrendRow[]> {
  const admin = createAdminClient();
  const { data } = await admin.rpc('get_offer_trend', { p_from: range.from, p_to: range.to });
  if (!data) return [];
  return data.map((r: { day_id: string; views: number; clicks: number; conversions: number }) => {
    const views = Number(r.views);
    const clicks = Number(r.clicks);
    const conv = Number(r.conversions);
    return {
      day: r.day_id,
      views,
      clicks,
      conversions: conv,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
      cr: views > 0 ? (conv / views) * 100 : 0,
    };
  });
}
```

- [ ] **Шаг 2: Миграция 022 — RPC `get_offer_trend`**

```sql
-- 022: daily aggregated offer funnel
create or replace function public.get_offer_trend(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (day_id date, views bigint, clicks bigint, conversions bigint)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day_id,
    count(*) filter (where event_type = 'offer_view') as views,
    count(*) filter (where event_type = 'offer_cta_click') as clicks,
    count(*) filter (where event_type = 'offer_conversion') as conversions
  from public.offer_events
  where (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
  group by day_id
  order by day_id;
$$;

grant execute on function public.get_offer_trend(timestamptz, timestamptz) to service_role;
```

⚠️ Проверь реальный набор `event_type` в `offer_events` — если другие имена, адаптируй. Read `supabase/migrations/007_offer_events.sql`.

- [ ] **Шаг 3: API endpoint + client fetch + chart component**

Chart — использовать existing `TrendLineChart` if available (компонент есть где-то в `components/admin/charts/`). Иначе простой SVG/inline.

- [ ] **Шаг 4: Build + commit.**

---

## Задача 2.C.5: Segment tabs (lang / device / region)

**Files:**
- Create: `components/admin/offer/SegmentTabs.tsx`
- Modify: `lib/admin/offer-queries.ts` — добавить `getOfferSegmentBreakdown(segment: 'language'|'device'|'region', range)`
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: Segment RPC или SQL** в `offer-queries.ts` — агрегирует `offer_events` по `lang_code` / `device_type` / `region`. Требует что эти поля есть в `offer_events` или через join с `players`.

⚠️ Проверь `offer_events` schema в `supabase/migrations/007_offer_events.sql` — если нет `lang_code/device_type/region` — их надо извлечь из `players` через `player_id`. Если `player_id` тоже нет — эта задача блокирована; пометь BLOCKED и переходи к следующей.

- [ ] **Шаг 2: Tabs UI + breakdown table under tabs.**
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.C.6: Version history panel (variant_id)

**Files:**
- Create: `components/admin/offer/VariantHistoryPanel.tsx`
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: Query** — list distinct `variant_id` from `offer_events` + aggregate CTR/CR per variant.
- [ ] **Шаг 2: UI** — collapsible panel with rows per variant, sortable by CR.
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.C.7: Retarget segment CSV (видел — не кликнул)

**Files:**
- Create: `app/api/admin/offer/retarget/route.ts` — GET, returns CSV

- [ ] **Шаг 1: SQL** — find `players` which triggered `offer_view` but no `offer_cta_click` within same session (or ever). Simplify: `players` with at least one `offer_view` event and zero `offer_cta_click`/`offer_conversion`.
- [ ] **Шаг 2: CSV export** — phone + name + last_view_at + utm.
- [ ] **Шаг 3: Кнопка в `OfferClient.tsx`** actions.
- [ ] **Шаг 4: Build + commit.**

---

## Задача 2.C.8: Min-sample guard на «Лучший rating»

**Files:**
- Modify: `OfferClient.tsx`

- [ ] **Шаг 1: В секции «Лучший rating»** показывать только если views >= `THRESHOLDS.offer.minViewsForStat` (50). Иначе — дисклеймер «недостаточно данных».
- [ ] **Шаг 2: Build + commit.**

---

# БЛОК D. Participants rework (~5 задач)

## Задача 2.D.1: Extended filters

**Files:**
- Create: `components/admin/participants/ParticipantFilters.tsx`
- Modify: `app/api/admin/participants/route.ts` — принять новые query params
- Modify: `lib/admin/page-queries.ts` `getPlayers` (или аналог) — SQL filters
- Modify: `ParticipantsClient.tsx`

Фильтры (8 шт):
1. UTM source (multi-select) — через `UtmFilter` (переиспользуется из Task 2.B.3)
2. Period (already present as PeriodFilter)
3. Language (single select: all/ru/uz) — колонка `players.language_preference` (check schema)
4. Device (single select: all/mobile/desktop) — из `player_device_events` or похожее
5. Has-lead (toggle) — join с `leads` по phone
6. Bitrix status (multi-select) — через `player_admin_states` или через Bitrix deals
7. Rating range (number inputs: min/max S-rating) — existing `completed_scenarios.rating`
8. Days idle (slider: 0-30+) — computed via `last_event_at`

- [ ] **Шаг 1: Build ParticipantFilters компонент** — drawer/popover с 8 секциями.
- [ ] **Шаг 2: Extend `getPlayers` query** с новыми params.
- [ ] **Шаг 3: Extend API route.**
- [ ] **Шаг 4: Подключить в `ParticipantsClient`.**
- [ ] **Шаг 5: Build + commit.**

---

## Задача 2.D.2: Pagination / infinite scroll

**Files:**
- Modify: `ParticipantsClient.tsx`

- [ ] **Шаг 1: State**: `offset: 0, hasMore: true, loading: false`. Увеличивать offset на 50 при scroll до конца / клике «Ещё».
- [ ] **Шаг 2: IntersectionObserver** на последнюю строку (или кнопка «Загрузить ещё» для простоты).
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.D.3: New columns — progress / days idle / Bitrix status

**Files:**
- Modify: `lib/admin/page-queries.ts` `getPlayers` — SELECT + join
- Modify: `ParticipantsClient.tsx`

- [ ] **Шаг 1: Extended SELECT** — подтянуть `completed_scenarios.day_count`, last_event_at (MAX over game_events), `player_admin_states.status`, `bitrix_deal_id` через leads join by phone.
- [ ] **Шаг 2: Новые колонки** в таблице: «День X/3», «Дней без активности», «Статус», «Bitrix».
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.D.4: Status column + bulk actions + assigned-to

**Files:**
- Create: `components/admin/participants/ParticipantStatusBadge.tsx`
- Create: `components/admin/participants/ParticipantActionBar.tsx`
- Create: `app/api/admin/participants/[id]/status/route.ts` (PATCH)
- Create: `app/api/admin/participants/bulk/route.ts` (POST)
- Create: `lib/admin/participant-queries.ts`
- Modify: `ParticipantsClient.tsx`

Те же паттерны что в Leads — `updatePlayerStatus`, `bulkUpdatePlayers`. Статусы: `new | in_progress | done | hire | skip`.

- [ ] **Шаг 1: participant-queries.ts** — mirror leads-queries.
- [ ] **Шаг 2: API routes** — PATCH + bulk POST.
- [ ] **Шаг 3: Badge + ActionBar components.**
- [ ] **Шаг 4: Checkboxes в таблицу + state.**
- [ ] **Шаг 5: Build + commit.**

---

## Задача 2.D.5: Dedup detector

**Files:**
- Modify: `ParticipantsClient.tsx`

Тот же паттерн что в 2.B.7 — но для участников дубли = одинаковый `phone` в `players`. `players.phone` уникальный, значит дублей быть не должно, но... может быть дубли между `leads` и `players`: игрок с тем же phone что у lead — это «двойной лид» (и зарегался, и форму заполнил). Показать badge «+ лид» если есть связанный lead.

- [ ] **Шаг 1: Fetch linked leads** для players batch через `fetchLinkedLeadsByPhone` (новый endpoint).
- [ ] **Шаг 2: Badge «+ лид»** в колонке.
- [ ] **Шаг 3: Build + commit.**

---

# БЛОК E. Player Journey polish (~6 задач)

## Задача 2.E.1: Убрать UUID subtitle + расширенные поля профиля

**Files:**
- Modify: `app/(admin)/admin/player/[playerId]/PlayerClient.tsx`
- Modify: `components/admin/PlayerProfile.tsx`

- [ ] **Шаг 1:** В `PlayerClient.tsx` заменить subtitle `'ID: {player.id}'` на что-то полезное:
   - Если есть `player.last_seen` — показать «Последняя активность: X дней назад»
   - Иначе — `{player.phone}` или nothing

- [ ] **Шаг 2: PlayerProfile расширить полями:**
   - Язык игры (`language_preference`)
   - Устройство (из game_events.event_data.device если есть, либо из `player_device_events`)
   - Текущий день (из `game_progress.day_id` or последний started day)
   - Дней без активности (`now() - last_event_at`)
   - Общее время в игре (sum session durations — если трекаем)
   - Полные UTM: source, medium, campaign, content, term

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.E.2: WhatsApp/Telegram templates с именем

**Files:**
- Modify: `components/admin/PlayerProfile.tsx` — использовать `buildWhatsAppUrl` + `buildTelegramUrl` с player.display_name

- [ ] **Шаг 1:** Заменить hardcoded `'Здравствуйте! Заметил вас в Sales School.'` на `buildWhatsAppUrl(player.phone, player.display_name)` (переиспользуется из `lib/admin/outreach.ts` созданного в 2.B.10).

- [ ] **Шаг 2: Build + commit.**

---

## Задача 2.E.3: Replay dropdown — любой день

**Files:**
- Modify: `app/(admin)/admin/player/[playerId]/PlayerClient.tsx`
- Modify: `components/admin/DayReplayModal.tsx`

- [ ] **Шаг 1: В PlayerClient** — показать dropdown «Replay: [Day 1 / Day 2 / Day 3]» (только дни которые игрок прошёл).
- [ ] **Шаг 2: DayReplayModal** принимает `dayNumber` prop.
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.E.4: Timeline filter (скрыть служебные events)

**Files:**
- Modify: `components/admin/Timeline.tsx` — добавить filter toggle

- [ ] **Шаг 1: Props** `Timeline` — добавить `defaultHideSystem?: boolean` (default `true`). Скрывать events с type `heartbeat`, `node_entered`, `node_exited`.

- [ ] **Шаг 2: Toggle button** «Показать служебные» — при активации показывать всё.

- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.E.5: «Открыть в Bitrix» link

**Files:**
- Modify: `PlayerClient.tsx` — если у player есть linked lead с `bitrix_deal_id`, показать кнопку

- [ ] **Шаг 1: Fetch linked lead** по `player.phone` через `/api/admin/leads?search={phone}&limit=1`.
- [ ] **Шаг 2:** Если `lead.bitrix_deal_id` есть, показать кнопку с deep-link на Bitrix (переиспользовать buildBitrixDealUrl через /api/admin/bitrix/deal/[id] — portalUrl возвращается в response).
- [ ] **Шаг 3: Build + commit.**

---

## Задача 2.E.6: DayReplayModal — readable node names

**Files:**
- Modify: `components/admin/DayReplayModal.tsx`

- [ ] **Шаг 1: В modal при рендеринге nodes** — собрать все `nodeIds` (из passed-in events) → `fetchNodeLabels(scenarioId, ids)` (уже готово с Task 0.8).
- [ ] **Шаг 2: Показывать `label.title` вместо raw `node_id`** + tooltip с preview текстом.
- [ ] **Шаг 3: Build + commit.**

---

# 🗓️ Timeline (Phase 2)

| Блок | Задач | Длительность | Зависимости |
|---|---|---|---|
| A. Foundation | 6 | 1.5–2 дня | — (критический путь) |
| B. Leads rework | 11 | 2.5–3 дня | A.1, A.4, A.6 |
| C. Offer rework | 8 | 1.5–2 дня | A.4, A.5 |
| D. Participants | 5 | 1.5–2 дня | A.2, A.6 |
| E. Player Journey | 6 | 1 день | A.4, Task 0.8 (готова) |

**Total: 5–7 рабочих дней.** Блоки B/C/D/E могут выполняться параллельно после завершения A (два-три разработчика) или последовательно (один разработчик).

---

# 🚦 Риски

| Риск | Митигация |
|---|---|
| Bitrix rate-limit при batch fetch 100 deals для Leads page | `BitrixDealBadge` делает fetch per-row lazy; если лагает — ввести batch-endpoint в последующем фиксе |
| `BITRIX_PORTAL_URL` не в проде | Кнопка «ExternalLink» отключается, не ломается UI |
| Миграция 020 trigger на leads — попадает в прод | ADD-only, триггер только при UPDATE status — не влияет на INSERT |
| `offer_events` schema может отличаться от предположений | Задача 2.C.5 может BLOCKED — пропустить если нет полей language/device |
| Bitrix credentials в subagent-dispatched test-run | Никогда не логируй `.env` — cautions в prompts |

---

# ✅ Definition of Done для Phase 2

- [ ] Миграции 020, 021, (опц. 022) применены в проде
- [ ] `bitrix_deal_id` заполняется автоматически при form submission
- [ ] Все 8 фильтров работают в Participants
- [ ] Leads имеет: status, CSV, bulk, dedup badge, Bitrix status, Player link, outreach
- [ ] Offer имеет: Revenue KPI, CR KPI, trend chart, конверсия-hint modal, segment tabs, retarget CSV, min-sample guard
- [ ] Player Journey: uuid subtitle убран, 5 UTM показаны, Replay любого дня, Timeline filter, Bitrix deep-link, `resolveNodeLabel` в Replay
- [ ] `npm run build` зелёный
- [ ] Никаких новых TypeScript `any`

---

# 📋 Pre-check перед стартом

- [ ] `BITRIX_PORTAL_URL` добавлен в `.env.local` (админ сам настраивает)
- [ ] Phase 0+1 смёржены в working branch (мы на `feat/dashboard-audit-remediation`)
- [ ] Supabase MCP доступ (для миграций)
- [ ] Для offer_events — убедиться что в event_type есть `offer_view`, `offer_cta_click`, `offer_conversion` (проверить migration 007 или актуальный state)

---

# 🏁 Execution Handoff

План сохранён: `docs/superpowers/plans/2026-04-23-dashboard-sales-core.md`.

**Рекомендация:** сначала пройти Блок A целиком (Foundation, 6 задач). Потом Блоки B/C/D/E последовательно, одним субагентом на задачу, с review между задачами.

Критический путь: A.1 → A.3 → A.4 → B.*/D.* → E.5.
