# Language segment tracking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Трекать выбранный язык игры (`uz | ru`) на уровне `players`, подключить фильтр по языку в Funnel + Engagement RPC + UI, закрыть scope reduction Phase 3/4.

**Архитектура:** ADD-only колонка `players.game_language`; на клиенте сохраняем язык при `syncCreatePlayer` (user уже выбирает на экране онбординга через `Language`). Admin RPC получают `p_language text default null`, фильтруют JOIN на `players` (без изменения схемы `game_events`). UI добавляет `LanguageTabs` («Все · UZ · RU») в Funnel и Engagement с URL-persist.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Supabase RPC, миграции через Supabase MCP (project `njbcybjdzjahpdmcjtqe`).

---

## Scope

| Блок | Описание | Задач |
|---|---|---|
| A | БД-колонка + game-клиент пишет язык | 3 |
| B | Admin RPC + query helpers + routes принимают `p_language` | 3 |
| C | Admin UI: `LanguageTabs` + Funnel + Engagement | 3 |
| **Σ** | | **9** |

---

## Блок A. Player language capture

### Задача A.1: Миграция `032_players_game_language.sql`

- [ ] **Шаг 1: SQL**

```sql
-- 032_players_game_language.sql
-- ADD-only: stores the UI language the player chose at onboarding.

alter table public.players
  add column if not exists game_language text
    check (game_language in ('uz', 'ru') or game_language is null);

create index if not exists players_game_language_idx
  on public.players(game_language)
  where game_language is not null;
```

- [ ] **Шаг 2: Apply через Supabase MCP**
- [ ] **Шаг 3: Sanity** — `select game_language, count(*) from players group by 1;`
- [ ] **Шаг 4: Commit**

```bash
git add supabase/migrations/032_players_game_language.sql
git commit -m "feat(db): players.game_language column + partial index"
```

---

### Задача A.2: `/api/game/players` — принимать `language` в POST

**Files:**
- Modify: `app/api/game/players/route.ts`

**Зачем:** сейчас insert делает `.insert({ phone, display_name, avatar_id, device_fingerprint, utm_*, referrer })`. Добавить `game_language`.

- [ ] **Шаг 1: POST body** — извлечь `language`:

```ts
const body = await request.json();
const { phone, displayName, avatarId, deviceFingerprint, utmSource, utmMedium, utmCampaign, referrer, language } = body;
```

- [ ] **Шаг 2: Validate** — `language` опционален, но если задан — должен быть `'uz'` или `'ru'`:

```ts
const validLang = language === 'uz' || language === 'ru' ? language : null;
```

- [ ] **Шаг 3: Insert** — добавить `game_language: validLang` в payload.

- [ ] **Шаг 4: Update on re-find** — когда player уже существует (path через `.select('id').eq('phone', phone).single()` или аналог), дополнить PATCH-логику: если `validLang && validLang !== existing.game_language`, обновить:

```ts
// После поиска существующего:
if (existing && validLang && existing.game_language !== validLang) {
  await supabase.from('players').update({ game_language: validLang }).eq('id', existing.id);
}
```

  **ВАЖНО:** прочитать текущий POST handler — возможно он не ищет существующего, а сразу insert. В таком случае `ON CONFLICT` в SQL или проверка на duplicate phone обрабатывается по-другому; адаптировать в зависимости от реальной логики.

- [ ] **Шаг 5: Commit** `feat(api/players): accept game_language in POST`

---

### Задача A.3: Game hub + syncCreatePlayer — передать язык

**Files:**
- Modify: `game/store/middleware/supabaseSync.ts` (функция `syncCreatePlayer`)
- Modify: `app/(game)/game/page.tsx` (колл-сайт `syncCreatePlayer`)

**Зачем:** язык уже есть в `handleFormSubmit` как `selectedLang: Language` — просто прокидываем до API.

- [ ] **Шаг 1: `supabaseSync.ts`** — расширить сигнатуру `syncCreatePlayer`:

```ts
export async function syncCreatePlayer(
  phone: string,
  displayName: string,
  deviceFingerprint: string | null,
  language: 'uz' | 'ru' | null = null,
): Promise<string | null> {
  const res = await fetch('/api/game/players', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      phone,
      displayName,
      deviceFingerprint,
      language,   // NEW
      // ... existing utm fields
    }),
  });
  // ... existing response handling
}
```

  **NB:** прочитать текущую реализацию — сохранить существующую логику ошибок/ретраев.

- [ ] **Шаг 2: `game/page.tsx`** — `handleFormSubmit` уже знает `selectedLang`. Передать:

```ts
const serverId = await syncCreatePlayer(phone, name, deviceFingerprint, selectedLang);
```

- [ ] **Шаг 3: Commit** `feat(game): pass selected language to player creation`

---

## Блок B. Admin RPC + queries + routes

### Задача B.1: Миграция `033_language_in_rpcs.sql`

**Files:**
- Create: `supabase/migrations/033_language_in_rpcs.sql`

**Зачем:** добавляем `p_language text default null` в 4 RPC: `get_utm_funnel_v2`, `get_thinking_percentiles`, `get_engagement_trend`, `get_retention`. `CREATE OR REPLACE FUNCTION` — ADD-only-совместимо.

- [ ] **Шаг 1: SQL — `get_utm_funnel_v2` с фильтром по языку (JOIN на players)**

```sql
create or replace function public.get_utm_funnel_v2(
  p_dimension text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
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
        and (%4$L::text is null or p.game_language = %4$L::text)
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
  $q$, p_dimension, p_from, p_to, p_language);
end;
$$;
```

- [ ] **Шаг 2: `get_thinking_percentiles`**

```sql
create or replace function public.get_thinking_percentiles(
  p_scenario_id text,
  p_day_id text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
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
    percentile_cont(0.5)  within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p50_ms,
    percentile_cont(0.9)  within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p90_ms,
    percentile_cont(0.95) within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p95_ms,
    count(*)::bigint as sample_size
  from public.game_events e
  left join public.players p on p.id = e.player_id
  where e.event_type = 'choice_made'
    and e.scenario_id = p_scenario_id
    and (p_day_id is null or e.day_id = p_day_id)
    and (p_from is null or e.created_at >= p_from)
    and (p_to is null or e.created_at <= p_to)
    and (e.event_data->>'thinking_time_ms') is not null
    and (p_language is null or p.game_language = p_language);
$$;
```

- [ ] **Шаг 3: `get_engagement_trend`**

```sql
create or replace function public.get_engagement_trend(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
)
returns table (
  bucket_date date,
  started bigint,
  completed bigint,
  avg_thinking_ms numeric,
  completion_rate numeric
)
language sql stable security definer
as $$
  select
    e.created_at::date as bucket_date,
    count(distinct e.player_id) filter (where e.event_type = 'day_started')::bigint as started,
    count(distinct e.player_id) filter (where e.event_type = 'day_completed')::bigint as completed,
    avg((e.event_data->>'thinking_time_ms')::numeric) filter (where e.event_type = 'choice_made') as avg_thinking_ms,
    case
      when count(distinct e.player_id) filter (where e.event_type = 'day_started') > 0
      then count(distinct e.player_id) filter (where e.event_type = 'day_completed')::numeric
         / count(distinct e.player_id) filter (where e.event_type = 'day_started')
      else 0
    end as completion_rate
  from public.game_events e
  left join public.players p on p.id = e.player_id
  where e.scenario_id = p_scenario_id
    and (p_from is null or e.created_at >= p_from)
    and (p_to is null or e.created_at <= p_to)
    and (p_language is null or p.game_language = p_language)
  group by 1
  order by 1;
$$;
```

- [ ] **Шаг 4: `get_retention` с языком**

```sql
create or replace function public.get_retention(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
)
returns table (
  cohort_date date,
  cohort_size bigint,
  d1_returned bigint,
  d7_returned bigint
)
language sql stable security definer
as $$
  with cohort_players as (
    select p.id as player_id, p.game_language
    from public.players p
    where (p_language is null or p.game_language = p_language)
  ),
  first_start as (
    select e.player_id, min(e.created_at)::date as start_date, min(e.created_at) as start_at
    from public.game_events e
    join cohort_players cp on cp.player_id = e.player_id
    where e.event_type = 'game_started'
      and (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
    group by e.player_id
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

- [ ] **Шаг 5: Apply + sanity** — вызвать с `p_language => 'uz'` и без. Убедиться что без возвращает то же, что было раньше.
- [ ] **Шаг 6: Commit** `feat(db): p_language param on funnel/thinking/engagement-trend/retention RPCs`

---

### Задача B.2: Server-only query helpers принимают `language`

**Files:**
- Modify: `lib/admin/funnel-queries.ts`
- Modify: `lib/admin/engagement-queries.ts`

- [ ] **Шаг 1: `funnel-queries.ts`:**

```ts
export type GameLanguage = 'uz' | 'ru';

export async function getUtmFunnelV2(
  dimension: UtmDimension,
  from: string | null,
  to: string | null,
  language: GameLanguage | null = null,
): Promise<UtmFunnelV2Row[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('get_utm_funnel_v2', {
    p_dimension: dimension, p_from: from, p_to: to, p_language: language,
  });
  // ... existing map + error handling
}
```

- [ ] **Шаг 2: `engagement-queries.ts`** — добавить `language: GameLanguage | null = null` параметр в `getThinkingPercentiles`, `getEngagementTrend`, `getRetentionSummary`. Пробросить `p_language`.

- [ ] **Шаг 3: tsc**
- [ ] **Шаг 4: Commit** `feat(admin): language param in funnel/engagement query helpers`

---

### Задача B.3: Routes принимают `?language=` и пробрасывают

**Files:**
- Modify: `app/api/admin/funnel/route.ts`
- Modify: `app/api/admin/engagement/route.ts`
- Modify: `app/api/admin/engagement/trend/route.ts`
- Modify: `app/api/admin/funnel/export/route.ts` (чтобы CSV тоже уважал язык)

Валидация: `language ∈ ('uz', 'ru') | null`.

- [ ] **Шаг 1: Parsing helper** (inline в каждом route):

```ts
const langRaw = sp.get('language');
const language = langRaw === 'uz' || langRaw === 'ru' ? langRaw : null;
```

- [ ] **Шаг 2: Передать в query** для каждого route.

- [ ] **Шаг 3: Обновить `lib/admin/api.ts`** — `fetchFunnel` / `fetchEngagement` / `fetchEngagementTrend` принимают опциональный `language`:

```ts
export function fetchFunnel(arg: { period: ...; dimension?: UtmDimension; language?: GameLanguage | null }): Promise<FunnelPayload> { /* ... */ }
```

- [ ] **Шаг 4: tsc + smoke** — `curl '/api/admin/funnel?language=uz'`
- [ ] **Шаг 5: Commit** `feat(admin): routes accept ?language= param`

---

## Блок C. Admin UI

### Задача C.1: Shared `LanguageTabs` компонент

**Files:**
- Create: `components/admin/shared/LanguageTabs.tsx`

- [ ] **Шаг 1: Компонент**

```tsx
export type LanguageFilter = 'all' | 'uz' | 'ru';

const LABEL: Record<LanguageFilter, string> = { all: 'Все', uz: 'UZ', ru: 'RU' };
const ORDER: LanguageFilter[] = ['all', 'uz', 'ru'];

export function LanguageTabs({ value, onChange }: { value: LanguageFilter; onChange: (v: LanguageFilter) => void }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--admin-bg-2)',
      border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2,
    }}>
      {ORDER.map(v => {
        const active = v === value;
        return (
          <button key={v} type="button" onClick={() => onChange(v)} style={{
            padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer',
            background: active ? 'var(--admin-bg)' : 'transparent',
            color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
          }}>{LABEL[v]}</button>
        );
      })}
    </div>
  );
}
```

- [ ] **Шаг 2: Commit** `feat(admin): shared LanguageTabs primitive`

---

### Задача C.2: Funnel — добавить LanguageTabs

**Files:**
- Modify: `app/(admin)/admin/funnel/FunnelClient.tsx`

- [ ] **Шаг 1: Добавить state `language`, persist в URL `?lang=uz`.** Паттерн как для `dimension` (URL-replace через `useRouter` + `useSearchParams`).

- [ ] **Шаг 2: `useEffect` — добавить `language` в deps и в `fetchFunnel`:**

```ts
fetchFunnel({ period: periodState, dimension, language: language === 'all' ? null : language });
```

- [ ] **Шаг 3: Render `<LanguageTabs value={language} onChange={setLanguage} />` рядом с DimensionSelector** в PageHeader actions.

- [ ] **Шаг 4: Export href (`CSV`)** — добавить `language` param.

- [ ] **Шаг 5: Commit** `feat(admin/funnel): language segment tabs`

---

### Задача C.3: Engagement — добавить LanguageTabs

**Files:**
- Modify: `app/(admin)/admin/engagement/EngagementClient.tsx`

- [ ] **Шаг 1: State `language` + URL persist.** Effects (`fetchEngagement`, `fetchEngagementTrend`, `fetchRatingCorrelation` — если корреляция тоже должна фильтроваться по языку, опционально; если нет — оставить без) обновить.

- [ ] **Шаг 2: Пробросить в API-вызовы** (нужно сначала убедиться, что `fetchEngagement` и `fetchEngagementTrend` в `lib/admin/api.ts` принимают language — см. B.3).

- [ ] **Шаг 3: Render `<LanguageTabs />`** в actions PageHeader.

- [ ] **Шаг 4: Commit** `feat(admin/engagement): language segment tabs`

---

## Финал

- [ ] **Шаг F.1: `npm run build`**
- [ ] **Шаг F.2: Manual check:**
  - Новый игрок при регистрации → `players.game_language` заполнено
  - `/admin/funnel?language=uz` — фильтрует
  - `/admin/engagement?language=ru` — фильтрует
- [ ] **Шаг F.3: PR + merge**

---

## Риски

| Риск | Смягчение |
|---|---|
| Существующие 13 игроков имеют `game_language = null` — фильтр `= 'uz'` их исключит | Backfill heuristic не делаем (нет источника). UI показывает «Все» по умолчанию — null-игроки видны |
| JOIN на `players` в `get_thinking_percentiles` добавляет латентность | Индекс `players_game_language_idx` + LEFT JOIN не блокирует. При любом объёме дёшево |
| Re-onboarding (24h) не пересохраняет язык | A.2 шаг 4 добавляет UPDATE если язык сменился |
