# Phase 4 — Геймдизайн-группа + Pages Analytics

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переработать оставшиеся 4 страницы админки по аудиту 2026-04-22 (Priority 3 — геймдизайн + маркетинг): `/admin/branch` (карта сценария), `/admin/leaderboard`, `/admin/realtime`, `/admin/pages` + `/admin/pages/[slug]` (legacy → client).

**Архитектура:** Всё под `app/(admin)/admin/*/` с client-компонентами, server-only query helpers в `lib/admin/*-queries.ts`, RPC только там где нужно (retention-style). Переиспользуем shared primitives из Phase 3 (`DeltaBadge`, `Sparkline`, `FormulaPopover`, `KpiCard` с delta/sparkline). Единственная миграция — `031_pages_registry_annotations.sql` для аннотаций лендинг-страниц.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Supabase (Postgres RPC + service_role) · Tailwind 4 + CSS vars `--admin-*` · lucide-react · Миграции через Supabase MCP (project `njbcybjdzjahpdmcjtqe`).

---

## Scope

| Блок | Страница | Переработка | Задач |
|---|---|---|---|
| A | Foundation (миграция 031, shared UI) | — | 2 |
| B | Branch | ~30% | 4 |
| C | Leaderboard | ~40% | 6 |
| D | Realtime | ~30% | 5 |
| E | Pages + `[slug]` migration | ~50% | 7 |
| **Σ** | | | **24** |

### Scope reductions (обоснование)

- **Language-сегменты** (Leaderboard, Pages) — убраны. `game_language` не трекается нигде (подтверждено в Phase 3).
- **Page comparison** (Pages MUST #8) — убрано. В `pages_registry` только 2 slug'а (`home`, `target`) — сравнение бессмысленно.
- **A/B-test mode / Version history** (Pages SHOULD) — убраны. Инфраструктуры нет, отложено.
- **Realtime → Supabase subscription** — убрано. Подписка была сознательно снята (anon-клиент не имеет SELECT на `game_events`; polling через service_role — текущая правильная архитектура). Вместо этого улучшаем UX polling.
- **Leaderboard "Rising stars"** (MUST #6) — отложено. Требует хранить исторические ранки (новая таблица + джоба) — отдельный проект.

---

## Блок A. Foundation

### Задача A.1: Миграция `031_pages_registry_annotations.sql` — аннотации скролл-воронки

**Files:**
- Create: `supabase/migrations/031_pages_registry_annotations.sql`

**Зачем:** Pages SHOULD #9 — аннотации на scroll funnel («где оффер», «где CTA»). Аннотации пер-страница, редактируются админом. Храним в `pages_registry.annotations JSONB`.

- [ ] **Шаг 1: SQL**

```sql
-- 031_pages_registry_annotations.sql
-- ADD-only: annotations on landing pages for scroll-funnel chart labels.

alter table public.pages_registry
  add column if not exists annotations jsonb not null default '[]'::jsonb;

comment on column public.pages_registry.annotations is
  'JSON array of { scroll_depth: 0..100, label: string, tone?: "offer"|"cta"|"info" }.';
```

- [ ] **Шаг 2: Apply через Supabase MCP** (`mcp__plugin_supabase_supabase__apply_migration`)
- [ ] **Шаг 3: Sanity** — `select slug, annotations from pages_registry`
- [ ] **Шаг 4: Commit**

```bash
git add supabase/migrations/031_pages_registry_annotations.sql
git commit -m "feat(db): pages_registry.annotations jsonb for scroll-funnel labels"
```

---

### Задача A.2: Shared `AdminModal` компонент

**Files:**
- Create: `components/admin/shared/AdminModal.tsx`

**Зачем:** Blocks B (drill-down по узлу), E (drill-down по UTM) требуют модалок. Сейчас паттерн копируется из `DayReplayModal` и `SpendDialog` / `SourceTrendModal`. Выделяем переиспользуемый примитив.

- [ ] **Шаг 1: Компонент**

```tsx
// components/admin/shared/AdminModal.tsx
'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface AdminModalProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export function AdminModal({ open, title, onClose, width = 640, children }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--admin-bg)', borderRadius: 12, padding: 24,
          width, maxWidth: '90vw', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)' }}
            aria-label="Закрыть"
          ><X size={16} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 2: tsc**
- [ ] **Шаг 3: Commit** `feat(admin): shared AdminModal primitive`

---

## Блок B. Branch — карта сценария (~30%)

### Задача B.1: API `/api/admin/branch` — добавить coverage-метрику

**Files:**
- Modify: `app/api/admin/branch/route.ts`
- Modify: `lib/admin/api.ts` (BranchPayload)

**Зачем:** audit #5 — «нет % покрытия явно». Coverage = entered_nodes / total_nodes.

- [ ] **Шаг 1: Читаем current `route.ts`** — он сейчас возвращает `{ flows, stats, dropoffs }`. `stats` содержит `entered_count` per node.
- [ ] **Шаг 2: Считаем coverage** через импорт сценария на сервере:

```ts
import { scenarios } from '@/game/data/scenarios';

// после fetching stats:
const day = scenarios[scenarioId]?.days.find(d => d.id === dayId);
const totalNodes = day ? Object.keys(day.nodes).length : 0;
const visitedNodes = new Set(stats.filter(s => s.entered_count > 0).map(s => s.node_id)).size;
const coverage = totalNodes > 0 ? visitedNodes / totalNodes : 0;

return NextResponse.json({ flows, stats, dropoffs, coverage: { visited: visitedNodes, total: totalNodes, rate: coverage } });
```

- [ ] **Шаг 3: Обновить `BranchPayload` в `lib/admin/api.ts`:**

```ts
export interface BranchCoverage {
  visited: number;
  total: number;
  rate: number;   // 0..1
}

export interface BranchPayload {
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  coverage: BranchCoverage;
}
```

- [ ] **Шаг 4: tsc + smoke** (`curl /api/admin/branch?scenarioId=car-dealership&dayId=car-day1`)
- [ ] **Шаг 5: Commit** `feat(admin/branch): coverage metric in API payload`

---

### Задача B.2: Coverage KPI + Heatmap-overlay на `ScenarioFlowMap`

**Files:**
- Modify: `components/admin/charts/ScenarioFlowMap.tsx`
- Modify: `app/(admin)/admin/branch/BranchClient.tsx`

**Зачем:** audit #3 (heatmap-overlay — главная сила не реализована), #5 (coverage KPI).

**Как работает heatmap:** каждый узел в `ScenarioFlowMap` получает bg-color по одному из двух режимов:
- `traffic` — цвет по `entered_count / maxEntered` (от bg-2 к violet)
- `dropoff` — цвет по `dropoff_count / entered_count` (от success к danger)

- [ ] **Шаг 1: Прочитать current `ScenarioFlowMap.tsx`**, понять как рендерятся узлы.
- [ ] **Шаг 2: Добавить props:**

```ts
export interface ScenarioFlowMapProps {
  day: Day;
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  heatmapMode?: 'none' | 'traffic' | 'dropoff';
  onNodeClick?: (nodeId: string) => void;
}
```

- [ ] **Шаг 3: Цвет узла:** на основании `heatmapMode`:

```ts
function nodeBg(nodeId: string): string {
  if (heatmapMode === 'none') return 'var(--admin-bg-2)';
  const stat = stats.find(s => s.node_id === nodeId);
  const entered = stat?.entered_count ?? 0;
  if (heatmapMode === 'traffic') {
    const maxEntered = Math.max(1, ...stats.map(s => s.entered_count));
    const intensity = entered / maxEntered;   // 0..1
    // from transparent to #6366f1
    const alpha = Math.round(intensity * 200).toString(16).padStart(2, '0');
    return `#6366f1${alpha}`;
  }
  // dropoff
  const drop = dropoffs.find(d => d.node_id === nodeId)?.dropoff_count ?? 0;
  const rate = entered > 0 ? drop / entered : 0;
  if (rate >= 0.30) return 'rgba(239, 68, 68, 0.6)';    // danger
  if (rate >= 0.10) return 'rgba(245, 158, 11, 0.5)';   // warn
  return 'rgba(16, 185, 129, 0.3)';                      // success
}
```

- [ ] **Шаг 4: `onNodeClick` wiring** — добавить обработчик на каждом узле.
- [ ] **Шаг 5: `BranchClient.tsx` state + UI:**

```tsx
const [heatmapMode, setHeatmapMode] = useState<'none' | 'traffic' | 'dropoff'>('traffic');

// новый KPI card "Покрытие":
<KpiCard
  label="Покрытие сценария"
  value={`${(coverage.rate * 100).toFixed(0)}%`}
  hint={`${coverage.visited} из ${coverage.total} узлов`}
  accent={coverage.rate >= 0.6 ? 'green' : coverage.rate >= 0.3 ? 'orange' : 'pink'}
/>

// над ScenarioFlowMap — сегментированный переключатель:
<div style={{ display: 'inline-flex', background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2, marginBottom: 8 }}>
  {(['none', 'traffic', 'dropoff'] as const).map(m => (
    <button key={m} onClick={() => setHeatmapMode(m)} style={{
      padding: '4px 10px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer',
      background: heatmapMode === m ? 'var(--admin-bg)' : 'transparent',
      color: heatmapMode === m ? 'var(--admin-text)' : 'var(--admin-text-muted)',
    }}>
      {m === 'none' ? 'Без heatmap' : m === 'traffic' ? 'Трафик' : 'Drop-off'}
    </button>
  ))}
</div>
```

- [ ] **Шаг 6: Заменить footer-строку «Топ узел по посещаемости»** новым KPI Coverage в основном `admin-kpi-row`. Audit #4 говорил, что топ узел в footer — неправильное место; coverage — сильнее.
- [ ] **Шаг 7: tsc + visual check**
- [ ] **Шаг 8: Commit** `feat(admin/branch): coverage KPI + heatmap overlay (traffic/dropoff)`

---

### Задача B.3: Drill-down модалка на клик по узлу

**Files:**
- Create: `components/admin/branch/NodeDrilldownModal.tsx`
- Modify: `app/(admin)/admin/branch/BranchClient.tsx`

**Зачем:** audit #6. Клик по узлу → модалка с метриками + ссылка на `/admin/dropoff`.

- [ ] **Шаг 1: Компонент**

```tsx
// components/admin/branch/NodeDrilldownModal.tsx
'use client';
import Link from 'next/link';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import type { NodeStat, DropoffRow } from '@/lib/admin/types-v2';

export interface NodeDrilldownModalProps {
  open: boolean;
  nodeId: string | null;
  scenarioId: string;
  dayId: string;
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  nodeTitle?: string;
  nodeType?: string;
  nodePreview?: string | null;
  onClose: () => void;
}

export function NodeDrilldownModal({
  open, nodeId, scenarioId, dayId, stats, dropoffs, nodeTitle, nodeType, nodePreview, onClose,
}: NodeDrilldownModalProps) {
  if (!nodeId) return null;
  const stat = stats.find(s => s.node_id === nodeId);
  const drop = dropoffs.find(d => d.node_id === nodeId);
  const entered = stat?.entered_count ?? 0;
  const exits = stat?.exit_count ?? 0;
  const drops = drop?.dropoff_count ?? 0;
  const dropRate = entered > 0 ? (drops / entered) * 100 : 0;
  const avgT = stat?.avg_thinking_time_ms ?? 0;

  return (
    <AdminModal open={open} title={<>
      <span style={{ fontSize: 10, color: 'var(--admin-text-muted)', fontWeight: 500, marginRight: 8 }}>
        {nodeType ?? 'node'} · {dayId}
      </span>
      {nodeTitle ?? nodeId}
    </>} onClose={onClose} width={560}>
      {nodePreview && (
        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontStyle: 'italic', marginBottom: 12, padding: 12, background: 'var(--admin-bg-2)', borderRadius: 6 }}>
          «{nodePreview}»
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 12 }}>
        <Stat label="Входов" value={entered} />
        <Stat label="Выходов" value={exits} />
        <Stat label="Drop-off" value={drops} hint={`${dropRate.toFixed(1)}%`} tone={dropRate >= 30 ? 'danger' : dropRate >= 10 ? 'warn' : 'success'} />
        <Stat label="Среднее время" value={`${(avgT / 1000).toFixed(1)}с`} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Link
          href={`/admin/dropoff?scenarioId=${encodeURIComponent(scenarioId)}&day=${encodeURIComponent(dayId)}`}
          className="admin-btn admin-btn--primary"
        >
          Открыть в Drop-off
        </Link>
      </div>
    </AdminModal>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'success' | 'warn' | 'danger' }) {
  const color =
    tone === 'danger' ? 'var(--admin-accent-danger)' :
    tone === 'warn' ? 'var(--admin-accent-warn)' :
    tone === 'success' ? 'var(--admin-accent-success)' :
    'var(--admin-text)';
  return (
    <div style={{ padding: 10, background: 'var(--admin-bg-2)', borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
      {hint && <div style={{ fontSize: 10, color, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}
```

- [ ] **Шаг 2: В `BranchClient.tsx`** — state `const [drillNode, setDrillNode] = useState<string | null>(null)`. Passing `onNodeClick={setDrillNode}` to ScenarioFlowMap.
- [ ] **Шаг 3: Загрузить label для выбранного узла** — через `fetchNodeLabels(scenarioId, [drillNode])` когда `drillNode` меняется.
- [ ] **Шаг 4: Render** `<NodeDrilldownModal open={!!drillNode} ... />` в конце JSX.
- [ ] **Шаг 5: tsc + manual check**
- [ ] **Шаг 6: Commit** `feat(admin/branch): node click drilldown modal`

---

### Задача B.4: Mobile overlay «Открыть на десктопе»

**Files:**
- Create: `components/admin/shared/DesktopOnlyOverlay.tsx`
- Modify: `app/(admin)/admin/branch/BranchClient.tsx`

**Зачем:** audit #7 — `ScenarioFlowMap` непригоден на мобилке. Минимум: явный overlay.

- [ ] **Шаг 1: Компонент**

```tsx
// components/admin/shared/DesktopOnlyOverlay.tsx
import { Monitor } from 'lucide-react';

export function DesktopOnlyOverlay({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="admin-desktop-only">{children}</div>
      <div
        className="admin-mobile-only"
        style={{
          padding: 24, textAlign: 'center',
          background: 'var(--admin-bg-2)', borderRadius: 12,
          color: 'var(--admin-text-muted)',
        }}
      >
        <Monitor size={32} style={{ marginBottom: 12, color: 'var(--admin-text-dim)' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 6 }}>
          Карта сценария доступна на десктопе
        </div>
        <div style={{ fontSize: 12 }}>
          Откройте дашборд на большом экране — граф сценария не оптимизирован для телефона.
        </div>
      </div>
    </>
  );
}
```

- [ ] **Шаг 2: Добавить CSS-хелперы в `app/globals.css` или `app/(admin)/admin.css`** (уточнить где admin-стили лежат):

```css
.admin-desktop-only { display: block; }
.admin-mobile-only  { display: none; }
@media (max-width: 768px) {
  .admin-desktop-only { display: none; }
  .admin-mobile-only  { display: block; }
}
```

- [ ] **Шаг 3: Обернуть `ScenarioFlowMap` в `BranchClient.tsx`:**

```tsx
<DesktopOnlyOverlay>
  <ScenarioFlowMap ... />
</DesktopOnlyOverlay>
```

- [ ] **Шаг 4: tsc + mobile viewport test (resize browser to 400px)**
- [ ] **Шаг 5: Commit** `feat(admin/branch): desktop-only overlay for scenario map on mobile`

---

## Блок C. Leaderboard (~40%)

### Задача C.1: API `/api/admin/leaderboard` — период + сценарий + сортировка + пагинация

**Files:**
- Modify: `app/api/admin/leaderboard/route.ts`
- Create: `lib/admin/leaderboard-queries.ts`
- Modify: `lib/admin/api.ts`

**Зачем:** audit #2 (убрать «Игроков в топе»), #4 (нет фильтров), #5 (нет альтернативных сортировок), #8 (нет пагинации).

**⚠️ Важно:** текущая таблица `leaderboard` — это денормализованный view (один ряд per player с `total_score`, `scenarios_completed`, `level`). Для period-фильтра нам нужны `completed_scenarios` (per scenario × player). Делаем две разные query-функции: `getLeaderboardAllTime()` (текущий) и `getLeaderboardByPeriod(from, to)` (новый через `completed_scenarios`).

- [ ] **Шаг 1: Query helper**

```ts
// lib/admin/leaderboard-queries.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type LeaderboardSort = 'total_score' | 'completion_time' | 's_rating_count';
export type LeaderboardPeriod = 'week' | 'month' | 'all';

export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  avatar_id: string;
  level: number;
  total_score: number;
  scenarios_completed: number;
  best_rating: 'S' | 'A' | 'B' | 'C' | 'F' | null;
  s_rating_count: number;
  avg_completion_seconds: number | null;
}

interface Opts {
  period: LeaderboardPeriod;
  scenarioId?: string | null;
  sort: LeaderboardSort;
  limit: number;
  offset: number;
}

export async function getLeaderboard(opts: Opts): Promise<{ items: LeaderboardItem[]; total: number }> {
  const sb = createAdminClient();
  const now = Date.now();
  const fromIso =
    opts.period === 'week'  ? new Date(now - 7  * 24 * 3600 * 1000).toISOString() :
    opts.period === 'month' ? new Date(now - 30 * 24 * 3600 * 1000).toISOString() :
    null;

  // Query completed_scenarios aggregated per player
  let q = sb
    .from('completed_scenarios')
    .select('player_id, score, rating, time_taken, scenario_id, completed_at');
  if (fromIso) q = q.gte('completed_at', fromIso);
  if (opts.scenarioId) q = q.eq('scenario_id', opts.scenarioId);
  const { data: rows, error } = await q;
  if (error) { console.warn('[leaderboard] query', error); return { items: [], total: 0 }; }

  // Aggregate
  const agg = new Map<string, {
    score: number; completions: number; sRatings: number; timeSum: number; bestRating: string | null;
  }>();
  const ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, F: 4 };
  for (const r of (rows ?? []) as Array<{ player_id: string; score: number; rating: string; time_taken: number | null; scenario_id: string }>) {
    const key = r.player_id;
    const prev = agg.get(key) ?? { score: 0, completions: 0, sRatings: 0, timeSum: 0, bestRating: null as string | null };
    prev.score += Number(r.score ?? 0);
    prev.completions += 1;
    prev.sRatings += r.rating === 'S' ? 1 : 0;
    prev.timeSum += Number(r.time_taken ?? 0);
    if (prev.bestRating === null || (ORDER[r.rating] ?? 99) < (ORDER[prev.bestRating] ?? 99)) {
      prev.bestRating = r.rating;
    }
    agg.set(key, prev);
  }
  const playerIds = Array.from(agg.keys());
  const total = playerIds.length;

  if (playerIds.length === 0) return { items: [], total: 0 };

  // Fetch player names in batch
  const { data: players } = await sb.from('players')
    .select('id, display_name, avatar_id, level')
    .in('id', playerIds);
  const pmap = new Map((players ?? []).map(p => [p.id, p]));

  // Build items + sort
  const items: LeaderboardItem[] = playerIds.map(id => {
    const p = pmap.get(id);
    const a = agg.get(id)!;
    return {
      player_id: id,
      display_name: p?.display_name ?? 'игрок',
      avatar_id: p?.avatar_id ?? 'male',
      level: p?.level ?? 1,
      total_score: a.score,
      scenarios_completed: a.completions,
      s_rating_count: a.sRatings,
      best_rating: a.bestRating as LeaderboardItem['best_rating'],
      avg_completion_seconds: a.completions > 0 ? a.timeSum / a.completions : null,
    };
  });

  const sortBy =
    opts.sort === 'total_score'     ? (x: LeaderboardItem) => -x.total_score :
    opts.sort === 's_rating_count'  ? (x: LeaderboardItem) => -x.s_rating_count :
                                      (x: LeaderboardItem) => x.avg_completion_seconds ?? Number.MAX_SAFE_INTEGER;
  items.sort((a, b) => sortBy(a) - sortBy(b));

  const page = items.slice(opts.offset, opts.offset + opts.limit);
  return { items: page, total };
}
```

- [ ] **Шаг 2: Route** — whitelist для period + sort, defaults, передача в query:

```ts
// app/api/admin/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardSort } from '@/lib/admin/leaderboard-queries';

export const dynamic = 'force-dynamic';

const PERIODS: LeaderboardPeriod[] = ['week', 'month', 'all'];
const SORTS: LeaderboardSort[] = ['total_score', 'completion_time', 's_rating_count'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? 'all') as LeaderboardPeriod;
  if (!PERIODS.includes(period)) return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  const sort = (sp.get('sort') ?? 'total_score') as LeaderboardSort;
  if (!SORTS.includes(sort)) return NextResponse.json({ error: 'invalid sort' }, { status: 400 });
  const limit = Math.min(100, Math.max(10, Number(sp.get('limit') ?? 50)));
  const offset = Math.max(0, Number(sp.get('offset') ?? 0));
  const scenarioId = sp.get('scenarioId');

  const { items, total } = await getLeaderboard({
    period, sort, limit, offset, scenarioId: scenarioId || null,
  });
  return NextResponse.json({ items, total, period, sort, limit, offset });
}
```

- [ ] **Шаг 3: Обновить `lib/admin/api.ts`**:

```ts
export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  avatar_id: string;
  level: number;
  total_score: number;
  scenarios_completed: number;
  best_rating: 'S' | 'A' | 'B' | 'C' | 'F' | null;
  s_rating_count: number;
  avg_completion_seconds: number | null;
}

export type LeaderboardPeriod = 'week' | 'month' | 'all';
export type LeaderboardSort = 'total_score' | 'completion_time' | 's_rating_count';

export interface LeaderboardPayload {
  items: LeaderboardItem[];
  total: number;
  period: LeaderboardPeriod;
  sort: LeaderboardSort;
  limit: number;
  offset: number;
}

export function fetchLeaderboard(params: {
  period?: LeaderboardPeriod;
  sort?: LeaderboardSort;
  limit?: number;
  offset?: number;
  scenarioId?: string | null;
}): Promise<LeaderboardPayload> {
  return adminGet<LeaderboardPayload>('/api/admin/leaderboard', {
    period: params.period ?? null,
    sort: params.sort ?? null,
    limit: params.limit ?? null,
    offset: params.offset ?? null,
    scenarioId: params.scenarioId ?? null,
  });
}
```

**Back-compat note:** текущий `fetchLeaderboard(limit: number)` — нужно переписать `LeaderboardClient` (C.2). Старый тип `LeaderboardItem` может остаться с другими полями — замени его.

- [ ] **Шаг 4: tsc** — будут ошибки в `LeaderboardClient.tsx` (рефакторится в C.2), в остальных местах чисто
- [ ] **Шаг 5: Smoke test** (`curl /api/admin/leaderboard?period=week&sort=s_rating_count`)
- [ ] **Шаг 6: Commit** `feat(admin/leaderboard): period/sort/pagination API + query helper`

---

### Задача C.2: UI — русификация + период-табы + сортировка-селектор + подиум + пагинация

**Files:**
- Modify: `app/(admin)/admin/leaderboard/LeaderboardClient.tsx`
- Create: `components/admin/leaderboard/LeaderboardTabs.tsx`
- Create: `components/admin/leaderboard/SortSelector.tsx`

**Зачем:** audit #1 (русификация), #2 (убрать мусорный KPI), #4 (период/сценарий-фильтры), #5 (альт. сортировки), #8 (пагинация).

- [ ] **Шаг 1: `LeaderboardTabs.tsx`** — 3-value сегментированный переключатель «Неделя / Месяц / Всё время», URL `?period=week`.

```tsx
import type { LeaderboardPeriod } from '@/lib/admin/api';
const LABEL: Record<LeaderboardPeriod, string> = { week: 'Неделя', month: 'Месяц', all: 'Всё время' };
const ORDER: LeaderboardPeriod[] = ['week', 'month', 'all'];

export function LeaderboardTabs({ value, onChange }: { value: LeaderboardPeriod; onChange: (p: LeaderboardPeriod) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2 }}>
      {ORDER.map(p => {
        const active = p === value;
        return (
          <button key={p} type="button" onClick={() => onChange(p)} style={{
            padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer',
            background: active ? 'var(--admin-bg)' : 'transparent',
            color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
          }}>{LABEL[p]}</button>
        );
      })}
    </div>
  );
}
```

- [ ] **Шаг 2: `SortSelector.tsx`** — dropdown 3 значений:

```tsx
import type { LeaderboardSort } from '@/lib/admin/api';
const LABEL: Record<LeaderboardSort, string> = {
  total_score: 'По очкам',
  completion_time: 'По скорости',
  s_rating_count: 'По S-рейтингам',
};

export function SortSelector({ value, onChange }: { value: LeaderboardSort; onChange: (s: LeaderboardSort) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as LeaderboardSort)} style={{
      padding: '6px 10px', fontSize: 11, fontWeight: 600,
      border: '1px solid var(--admin-border)', borderRadius: 8, background: 'var(--admin-bg-2)',
      color: 'var(--admin-text)', cursor: 'pointer',
    }}>
      {(Object.keys(LABEL) as LeaderboardSort[]).map(s => (
        <option key={s} value={s}>{LABEL[s]}</option>
      ))}
    </select>
  );
}
```

- [ ] **Шаг 3: Перезаписать `LeaderboardClient.tsx`:**

Основные изменения:
- Title: `"Таблица лидеров"` (было `"Leaderboard"`).
- 3 KPI: убрать «Игроков в топе», добавить «S-рейтингов всего» + оставить «Лидер» + «Всего прохождений». KPI считаются от `items` (текущая страница).
- State: `period`, `sort`, `limit`, `offset` — все persisted в URL (pattern как в Funnel C.2: `useRouter` + `useSearchParams` + replace).
- Actions row: `<LeaderboardTabs />` + `<SortSelector />` + `<ExportCsvButton type="leaderboard" />`.
- Pagination controls под таблицей: `« 1 2 3 »`, size selector `10 / 25 / 50 / 100`.
- Auto-refresh: оставить 30s polling (как сейчас).

```tsx
// skeleton:
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import ExportCsvButton from '@/components/admin/ExportCsvButton';
import RatingBadge from '@/components/admin/RatingBadge';
import { fetchLeaderboard, type LeaderboardItem, type LeaderboardPeriod, type LeaderboardSort } from '@/lib/admin/api';
import { LeaderboardTabs } from '@/components/admin/leaderboard/LeaderboardTabs';
import { SortSelector } from '@/components/admin/leaderboard/SortSelector';

const PERIODS: LeaderboardPeriod[] = ['week', 'month', 'all'];
const SORTS: LeaderboardSort[] = ['total_score', 'completion_time', 's_rating_count'];
const SIZES = [10, 25, 50, 100] as const;
const REFRESH_MS = 30_000;

function toPeriod(raw: string | null): LeaderboardPeriod {
  return PERIODS.includes(raw as LeaderboardPeriod) ? (raw as LeaderboardPeriod) : 'all';
}
function toSort(raw: string | null): LeaderboardSort {
  return SORTS.includes(raw as LeaderboardSort) ? (raw as LeaderboardSort) : 'total_score';
}

export default function LeaderboardClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const [period, setPeriodState] = useState<LeaderboardPeriod>(() => toPeriod(sp.get('period')));
  const [sort, setSortState] = useState<LeaderboardSort>(() => toSort(sp.get('sort')));
  const [limit, setLimit] = useState<number>(() => Number(sp.get('limit')) || 50);
  const [offset, setOffset] = useState<number>(() => Number(sp.get('offset')) || 0);
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function updateUrl(next: { period?: LeaderboardPeriod; sort?: LeaderboardSort; limit?: number; offset?: number }) {
    const u = new URLSearchParams(sp.toString());
    if (next.period)    u.set('period', next.period);
    if (next.sort)      u.set('sort', next.sort);
    if (next.limit !== undefined) u.set('limit', String(next.limit));
    if (next.offset !== undefined) u.set('offset', String(next.offset));
    router.replace(`?${u.toString()}`, { scroll: false });
  }

  function setPeriod(p: LeaderboardPeriod)  { setPeriodState(p); setOffset(0); updateUrl({ period: p, offset: 0 }); }
  function setSort(s: LeaderboardSort)      { setSortState(s); setOffset(0); updateUrl({ sort: s, offset: 0 }); }
  function setSize(n: number)               { setLimit(n); setOffset(0); updateUrl({ limit: n, offset: 0 }); }
  function goPage(newOffset: number)        { setOffset(newOffset); updateUrl({ offset: newOffset }); }

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchLeaderboard({ period, sort, limit, offset })
        .then(res => { if (!cancelled) { setRows(res.items); setTotal(res.total); setLoading(false); } })
        .catch(err => { if (!cancelled) { console.error('[Leaderboard] fetch', err); setLoading(false); } });
    }
    setLoading(true);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [period, sort, limit, offset]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);
  const leader = rows[0];
  const totalCompletions = rows.reduce((a, r) => a + r.scenarios_completed, 0);
  const totalSRatings = rows.reduce((a, r) => a + r.s_rating_count, 0);

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <PageHeader
        title="Таблица лидеров"
        subtitle={`Топ игроков · обновляется каждые ${REFRESH_MS / 1000} сек · всего ${total.toLocaleString('ru-RU')}`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <LeaderboardTabs value={period} onChange={setPeriod} />
            <SortSelector value={sort} onChange={setSort} />
            <ExportCsvButton type="leaderboard" />
          </div>
        }
      />

      <div className="admin-kpi-row">
        <KpiCard label="Лидер" value={leader ? leader.display_name : '—'} hint={leader ? `${leader.total_score.toLocaleString('ru-RU')} очков` : undefined} accent="orange" />
        <KpiCard label="Всего прохождений" value={totalCompletions.toLocaleString('ru-RU')} accent="green" hint={`на этой странице`} />
        <KpiCard label="S-рейтингов" value={totalSRatings.toLocaleString('ru-RU')} accent="violet" hint="лучших прохождений" />
      </div>

      {/* podium */}
      {/* ... top3 rendering (reuse existing CSS) ... */}

      {/* rest table */}
      <div className="admin-card" style={{ padding: 16, marginTop: 16 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ textAlign: 'left',  padding: '8px 6px', color: 'var(--admin-text-muted)' }}>#</th>
              <th style={{ textAlign: 'left',  padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Игрок</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Очки</th>
              <th style={{ textAlign: 'center',padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Лучший</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>S</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Прох-я</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((r, i) => (
              <tr key={r.player_id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '6px', color: 'var(--admin-text-muted)' }}>{offset + i + 4}</td>
                <td style={{ padding: '6px' }}>
                  <Link href={`/admin/player/${r.player_id}`} style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                    {r.display_name}
                  </Link>
                </td>
                <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>{r.total_score.toLocaleString('ru-RU')}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{r.best_rating ? <RatingBadge rating={r.best_rating} /> : '—'}</td>
                <td style={{ padding: '6px', textAlign: 'right' }}>{r.s_rating_count}</td>
                <td style={{ padding: '6px', textAlign: 'right' }}>{r.scenarios_completed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--admin-text-muted)' }}>Показывать</span>
            <select value={limit} onChange={e => setSize(Number(e.target.value))} style={{ margin: '0 8px' }}>
              {SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button disabled={offset === 0} onClick={() => goPage(Math.max(0, offset - limit))} className="admin-btn">«</button>
            <span style={{ padding: '6px 10px' }}>{currentPage} / {pageCount}</span>
            <button disabled={offset + limit >= total} onClick={() => goPage(offset + limit)} className="admin-btn">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 4: tsc + manual check** (проверить URL-persist, пагинацию, refresh-таймер)
- [ ] **Шаг 5: Commit** `feat(admin/leaderboard): Russian title + period tabs + sort + pagination`

---

### Задача C.3: ExportCsvButton — поддержка параметров period/sort

**Files:**
- Modify: `components/admin/ExportCsvButton.tsx` (если экспортирует leaderboard — добавить передачу параметров)
- Modify: `app/api/admin/export/route.ts` (или где собственно экспорт) — принимать query-параметры для leaderboard

**Зачем:** экспорт должен соответствовать текущему view (период+сортировка), а не всегда all-time топ-50.

- [ ] **Шаг 1: Прочитать `ExportCsvButton`** и соответствующий API-роут. Если параметры не поддерживаются — добавить.
- [ ] **Шаг 2: В `LeaderboardClient.tsx`** — передать актуальные `period` + `sort` + `limit` + `offset` в кнопку.
- [ ] **Шаг 3: Commit** `feat(admin/leaderboard): CSV export honors period/sort filters`

---

## Блок D. Realtime (~30%)

### Задача D.1: LiveFeed — читаемые имена игроков вместо `player_id.slice(0,8)`

**Files:**
- Modify: `components/admin/LiveFeed.tsx`
- Modify: `app/(admin)/admin/realtime/RealtimeClient.tsx`
- Create: `app/api/admin/realtime/player-names/route.ts` (или расширить существующий endpoint)
- Modify: `lib/admin/api.ts` (добавить `fetchPlayerNames(ids)`)

**Зачем:** audit #2 — `player_id.slice(0,8)` как имя — UX-провал.

- [ ] **Шаг 1: Batch endpoint** — POST `/api/admin/realtime/player-names` принимает `{ ids: string[] }`, возвращает `{ names: Record<id, { display_name, avatar_id }> }`. Cap 200 IDs.

```ts
// app/api/admin/realtime/player-names/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null) as { ids?: string[] } | null;
  if (!body?.ids || !Array.isArray(body.ids)) {
    return NextResponse.json({ error: 'ids[] required' }, { status: 400 });
  }
  const ids = body.ids.slice(0, 200);
  if (ids.length === 0) return NextResponse.json({ names: {} });
  const sb = createAdminClient();
  const { data, error } = await sb.from('players').select('id, display_name, avatar_id').in('id', ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const names: Record<string, { display_name: string; avatar_id: string }> = {};
  for (const r of (data ?? []) as Array<{ id: string; display_name: string; avatar_id: string }>) {
    names[r.id] = { display_name: r.display_name, avatar_id: r.avatar_id };
  }
  return NextResponse.json({ names });
}
```

- [ ] **Шаг 2: Client helper в `lib/admin/api.ts`:**

```ts
export async function fetchPlayerNames(ids: string[]): Promise<Record<string, { display_name: string; avatar_id: string }>> {
  if (ids.length === 0) return {};
  const res = await fetch('/api/admin/realtime/player-names', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
    cache: 'no-store',
  });
  if (!res.ok) return {};
  const data = await res.json() as { names: Record<string, { display_name: string; avatar_id: string }> };
  return data.names;
}
```

- [ ] **Шаг 3: `RealtimeClient.tsx` — поддержать кэш имён:**

```tsx
const [names, setNames] = useState<Record<string, { display_name: string; avatar_id: string }>>({});

// после setSnapshot(events):
const uniqueIds = Array.from(new Set(events.map(e => e.player_id))).filter(id => !names[id]);
if (uniqueIds.length > 0) {
  fetchPlayerNames(uniqueIds).then(n => setNames(prev => ({ ...prev, ...n })));
}
```

- [ ] **Шаг 4: `LiveFeed` — принимать `names` и рендерить `display_name` вместо `slice(0,8)`:**

```tsx
export interface LiveFeedProps {
  events: RecentGameEvent[];
  names?: Record<string, { display_name: string; avatar_id: string }>;
  onRowClick?: (playerId: string) => void;
  maxItems?: number;
}

// inside map:
const name = names?.[e.player_id]?.display_name ?? e.player_id.slice(0, 8);
```

- [ ] **Шаг 5: tsc**
- [ ] **Шаг 6: Commit** `feat(admin/realtime): resolve player names in LiveFeed (batch)`

---

### Задача D.2: Клик по строке → `/admin/player/{id}`

**Files:**
- Modify: `components/admin/LiveFeed.tsx`
- Modify: `app/(admin)/admin/realtime/RealtimeClient.tsx`

**Зачем:** audit #3.

- [ ] **Шаг 1: В `LiveFeed`** — `onRowClick(playerId)` проброшен в onClick на каждой строке, `cursor: 'pointer'`.
- [ ] **Шаг 2: В `RealtimeClient`:**

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
<LiveFeed events={snapshot} names={names} onRowClick={(id) => router.push(`/admin/player/${id}`)} />
```

- [ ] **Шаг 3: Commit** `feat(admin/realtime): click row → player journey`

---

### Задача D.3: Event-type filter (chip tabs) + пауза

**Files:**
- Create: `components/admin/realtime/EventFilter.tsx`
- Modify: `app/(admin)/admin/realtime/RealtimeClient.tsx`

**Зачем:** audit #4 (heartbeat засоряет feed), #5 (нет фильтра), #6 (нет pause).

- [ ] **Шаг 1: `EventFilter.tsx`:**

```tsx
'use client';

const EVENT_GROUPS: Array<{ id: string; label: string; types: string[] }> = [
  { id: 'all',       label: 'Всё',                types: [] },
  { id: 'progress',  label: 'Прогресс',           types: ['day_started', 'day_completed', 'day_failed', 'game_started', 'game_completed'] },
  { id: 'choices',   label: 'Выборы',             types: ['choice_made', 'back_navigation'] },
  { id: 'drops',     label: 'Уходы',              types: ['dropped_off', 'idle_detected'] },
  { id: 'system',    label: 'Служебные',          types: ['heartbeat', 'node_entered', 'node_exited'] },
];

export function EventFilter({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {EVENT_GROUPS.map(g => {
        const isActive = active === g.id;
        return (
          <button key={g.id} onClick={() => onChange(g.id)} style={{
            padding: '4px 10px', fontSize: 10, fontWeight: 600, border: '1px solid var(--admin-border)', borderRadius: 12, cursor: 'pointer',
            background: isActive ? 'var(--admin-accent-violet)' : 'var(--admin-bg-2)',
            color: isActive ? 'white' : 'var(--admin-text-muted)',
          }}>{g.label}</button>
        );
      })}
    </div>
  );
}

export const EVENT_GROUP_TYPES: Record<string, string[]> = Object.fromEntries(EVENT_GROUPS.map(g => [g.id, g.types]));
```

- [ ] **Шаг 2: `RealtimeClient.tsx`:**

```tsx
import { EventFilter, EVENT_GROUP_TYPES } from '@/components/admin/realtime/EventFilter';
import { Pause, Play } from 'lucide-react';

const [filter, setFilter] = useState<string>('all');
const [paused, setPaused] = useState(false);

// in the polling effect:
useEffect(() => {
  if (paused) return;
  // ... existing polling
}, [paused]);

// filtered events:
const visibleEvents = useMemo(() => {
  const allowed = EVENT_GROUP_TYPES[filter] ?? [];
  return filter === 'all' ? snapshot : snapshot.filter(e => allowed.includes(e.event_type));
}, [snapshot, filter]);
```

- [ ] **Шаг 3: UI row над `LiveFeed`:**

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
  <EventFilter active={filter} onChange={setFilter} />
  <button onClick={() => setPaused(!paused)} className="admin-btn">
    {paused ? <><Play size={12} /> Продолжить</> : <><Pause size={12} /> Пауза</>}
  </button>
</div>
<LiveFeed events={visibleEvents} names={names} ... />
```

- [ ] **Шаг 4: Commit** `feat(admin/realtime): event-type filter + pause control`

---

### Задача D.4: Browser-notification toggle для критических событий

**Files:**
- Create: `components/admin/realtime/NotificationToggle.tsx`
- Create: `lib/admin/realtime/notify.ts`
- Modify: `app/(admin)/admin/realtime/RealtimeClient.tsx`

**Зачем:** audit #7.

**Что нотифицируем:**
- `game_completed` — игрок прошёл всю игру.
- `dropped_off` — игрок ушёл.
- (new lead можно добавить позже — потребует polling `/api/admin/leads?since=...`, выходит за scope D.4).

- [ ] **Шаг 1: `lib/admin/realtime/notify.ts`:**

```ts
const KEY = 'admin.notifications.enabled';

export function notificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === '1';
}

export function setNotificationsEnabled(on: boolean) {
  localStorage.setItem(KEY, on ? '1' : '0');
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

export function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.ico' });
}
```

- [ ] **Шаг 2: `NotificationToggle.tsx`:**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationsEnabled, setNotificationsEnabled, requestPermission } from '@/lib/admin/realtime/notify';

export function NotificationToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(notificationsEnabled()); }, []);
  async function toggle() {
    if (!on) {
      const perm = await requestPermission();
      if (perm !== 'granted') return;
      setNotificationsEnabled(true);
      setOn(true);
    } else {
      setNotificationsEnabled(false);
      setOn(false);
    }
  }
  return (
    <button onClick={toggle} className="admin-btn" title={on ? 'Отключить уведомления' : 'Включить уведомления'}>
      {on ? <Bell size={12} /> : <BellOff size={12} />}
      {on ? 'Уведомления' : 'Включить уведомления'}
    </button>
  );
}
```

- [ ] **Шаг 3: В `RealtimeClient.tsx`** — трекать новые события и вызывать `notify`:

```tsx
import { notificationsEnabled, notify } from '@/lib/admin/realtime/notify';

const [lastSeenId, setLastSeenId] = useState<string | null>(null);

useEffect(() => {
  if (snapshot.length === 0) return;
  const head = snapshot[0];
  if (lastSeenId === head.id) return;
  // Find the slice of new events since lastSeenId
  const newIdx = snapshot.findIndex(e => e.id === lastSeenId);
  const fresh = newIdx === -1 ? [head] : snapshot.slice(0, newIdx);
  if (notificationsEnabled()) {
    fresh.forEach(e => {
      if (e.event_type === 'game_completed') {
        notify('🏆 Игрок завершил игру', names[e.player_id]?.display_name ?? 'игрок');
      } else if (e.event_type === 'dropped_off') {
        notify('⚠ Игрок ушёл', names[e.player_id]?.display_name ?? 'игрок');
      }
    });
  }
  setLastSeenId(head.id);
}, [snapshot, names, lastSeenId]);
```

- [ ] **Шаг 4: Добавить `<NotificationToggle />` в PageHeader actions**
- [ ] **Шаг 5: Commit** `feat(admin/realtime): browser notifications for game_completed + dropped_off`

---

### Задача D.5: Прозрачный «Heartbeat за 90 сек» + метки KPI

**Files:**
- Modify: `app/(admin)/admin/realtime/RealtimeClient.tsx`

**Зачем:** audit #8 («Проблемная зона» — бинарный, обрезан), #9 («За сегодня» — что это?), #10 (magic 90с).

- [ ] **Шаг 1: Переформулировать KPI:**
  - «Сейчас играют» → «Онлайн сейчас» с hint ``heartbeat за последние ${THRESHOLDS.heartbeat.liveWindowSeconds}с``
  - «За сегодня» → «Сыграли сегодня» с hint `уникальных игроков с 00:00`
  - «Прошли игру» → «Прошли сегодня» с hint `полностью завершили сценарий`
  - «Проблемная зона» → убрать из KPI-ряда, перенести как InsightCard выше (если есть `detectAutoInsights` результат — показать полный текст без обрезки).

- [ ] **Шаг 2: Прочитать `detectAutoInsights`** и понять, что вообще считает «проблемной зоной». Если это словесный инсайт — показать его как `<InsightCard tone="warning" ... />` вверху, убрав 60-char clip.
- [ ] **Шаг 3: Commit** `feat(admin/realtime): clearer KPI labels + full-text insight card`

---

## Блок E. Pages Analytics (~50%)

### Задача E.1: Revive `/api/admin/pages/[slug]` endpoint

**Files:**
- Create: `app/api/admin/pages/[slug]/route.ts`
- Modify: `lib/admin/api.ts`

**Зачем:** audit #2 (мёртвый endpoint), архитектурная консистентность.

- [ ] **Шаг 1: Route**

```ts
// app/api/admin/pages/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPageAnalytics, getPageTitleFromRegistry } from '@/lib/admin/page-queries';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { slug } = await params;
  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);

  const [analytics, registry] = await Promise.all([
    getPageAnalytics(slug, range.from ? new Date(range.from) : new Date(Date.now() - 30 * 86400_000), range.to ? new Date(range.to) : new Date()),
    getPageTitleFromRegistry(slug),
  ]);

  return NextResponse.json({
    slug,
    title: registry.title,
    annotations: registry.annotations,
    summary: analytics.summary,
    breakdowns: analytics.breakdowns,
  });
}
```

- [ ] **Шаг 2: Добавить `getPageTitleFromRegistry` в `lib/admin/page-queries.ts`** — читает из `pages_registry` (`title_ru` как дефолт, `annotations` — jsonb). Старый `getPageTitle(slug)` из hardcoded `PAGE_TITLES` → пометить deprecated, но не удалять (использует legacy detail-page до миграции в E.4).

```ts
// lib/admin/page-queries.ts — добавить:
export interface PageRegistryInfo {
  title: string;
  annotations: Array<{ scroll_depth: number; label: string; tone?: 'offer' | 'cta' | 'info' }>;
}

export async function getPageTitleFromRegistry(slug: string): Promise<PageRegistryInfo> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('pages_registry')
    .select('title_ru, annotations')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return { title: slug, annotations: [] };
  return { title: data.title_ru ?? slug, annotations: (data.annotations ?? []) as PageRegistryInfo['annotations'] };
}
```

- [ ] **Шаг 3: Client helper**

```ts
// lib/admin/api.ts — добавить:
export interface PageDetailPayload {
  slug: string;
  title: string;
  annotations: Array<{ scroll_depth: number; label: string; tone?: 'offer' | 'cta' | 'info' }>;
  summary: PageSummary;
  breakdowns: PageBreakdowns;
}

export function fetchPageDetail(params: {
  slug: string;
  period: Period | PeriodParamState;
}): Promise<PageDetailPayload> {
  const { slug, period } = params;
  return adminGet<PageDetailPayload>(`/api/admin/pages/${encodeURIComponent(slug)}`, periodParams(period));
}
```

**NB:** `PageSummary` и `PageBreakdowns` уже типизированы в `lib/admin/types.ts`. Импортировать их в `api.ts`.

- [ ] **Шаг 4: tsc + smoke** (`curl /api/admin/pages/home?period=7d`)
- [ ] **Шаг 5: Commit** `feat(admin/pages): typed /api/admin/pages/[slug] endpoint`

---

### Задача E.2: Rewrite `/admin/pages/[slug]` as client-component

**Files:**
- Modify: `app/(admin)/admin/pages/[slug]/page.tsx` (тонкий server → `<PageDetailClient slug={slug} />`)
- Create: `app/(admin)/admin/pages/[slug]/PageDetailClient.tsx`
- Create: `components/admin/pages/PageKpiRow.tsx`
- Create: `components/admin/pages/DailyChart.tsx`
- Create: `components/admin/pages/ScrollFunnel.tsx`
- Create: `components/admin/pages/DeviceBars.tsx`
- Create: `components/admin/pages/ReferrerTable.tsx`
- Create: `components/admin/pages/UtmTable.tsx`

**Зачем:** audit архитектурные #1-3, UX #4-5.

**Strategy:** минимум перевод из legacy inline-JSX в `admin-card` + CSS-vars + `PageHeader + PeriodFilter`. Компоненты раскладываем по отдельным файлам (пер-responsibility).

- [ ] **Шаг 1: Тонкий server page**

```tsx
// app/(admin)/admin/pages/[slug]/page.tsx
import PageDetailClient from './PageDetailClient';

export default async function PageDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PageDetailClient slug={slug} />;
}
```

- [ ] **Шаг 2: `PageDetailClient.tsx`** — reуses `PageHeader`, `Breadcrumbs`, `PeriodFilter`, `KpiCard` (shared!), `InsightCard`. Fetch через `fetchPageDetail`. Период через `usePeriodParam`.

```tsx
'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Breadcrumbs } from '@/components/admin/shared/Breadcrumbs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import { fetchPageDetail, type PageDetailPayload } from '@/lib/admin/api';
import { PageKpiRow } from '@/components/admin/pages/PageKpiRow';
import { DailyChart } from '@/components/admin/pages/DailyChart';
import { ScrollFunnel } from '@/components/admin/pages/ScrollFunnel';
import { DeviceBars } from '@/components/admin/pages/DeviceBars';
import { ReferrerTable } from '@/components/admin/pages/ReferrerTable';
import { UtmTable } from '@/components/admin/pages/UtmTable';

export default function PageDetailClient({ slug }: { slug: string }) {
  const [periodState, setPeriod] = usePeriodParam();
  const [data, setData] = useState<PageDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPageDetail({ slug, period: periodState })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(err => { if (!cancelled) { console.error('[pages/detail]', err); setLoading(false); } });
    return () => { cancelled = true; };
  }, [slug, periodState.period, periodState.from, periodState.to]);

  const title = data?.title ?? slug;

  return (
    <div>
      <Breadcrumbs items={[{ href: '/admin/pages', label: 'Аналитика лендингов' }, { label: title }]} />
      <PageHeader
        title={title}
        subtitle={`Slug: ${slug}`}
        actions={<PeriodFilter value={periodState} onChange={setPeriod} />}
      />

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
      ) : !data ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Нет данных</div>
      ) : (
        <>
          <PageKpiRow summary={data.summary} />

          <div className="admin-two-col admin-two-col--equal" style={{ marginTop: 16 }}>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Просмотры по дням</div>
              <DailyChart data={data.breakdowns.daily_views} />
            </div>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Глубина скролла</div>
              <ScrollFunnel data={data.breakdowns.scroll_depth} totalViews={data.summary.total_views} annotations={data.annotations} />
            </div>
          </div>

          <div className="admin-two-col admin-two-col--equal" style={{ marginTop: 16 }}>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Устройства</div>
              <DeviceBars data={data.breakdowns.device_breakdown} />
            </div>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Топ рефереры</div>
              <ReferrerTable data={data.breakdowns.referrer_breakdown} />
            </div>
          </div>

          <div className="admin-card" style={{ padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Источники трафика (UTM)</div>
            <UtmTable data={data.breakdowns.utm_breakdown} />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Шаг 3: Каждый child-компонент** — взять код из legacy `page.tsx`, заменить raw colors на CSS-vars, убрать inline shadows (использовать `admin-card`). ScrollFunnel принимает `annotations` prop и рисует их как метки на шкале.

**Шаблон для `ScrollFunnel.tsx`** (ключевая часть — аннотации):

```tsx
export interface ScrollFunnelProps {
  data: ScrollDepthEntry[];
  totalViews: number;
  annotations: Array<{ scroll_depth: number; label: string; tone?: 'offer' | 'cta' | 'info' }>;
}

// рядом с каждым bar или над шкалой — маркер: "🏷️ Оффер — 60%"
const annotMap = new Map<number, Array<{ label: string; tone?: string }>>();
for (const a of annotations) {
  const bucket = Math.round(a.scroll_depth / 25) * 25;   // привязка к 25/50/75/100
  const arr = annotMap.get(bucket) ?? [];
  arr.push({ label: a.label, tone: a.tone });
  annotMap.set(bucket, arr);
}

// в рендере:
{thresholds.map(t => (
  <div key={t}>
    {/* ... bar ... */}
    {(annotMap.get(t) ?? []).map((a, i) => (
      <div key={i} style={{
        fontSize: 10, color: a.tone === 'offer' ? 'var(--admin-accent-violet)' : a.tone === 'cta' ? 'var(--admin-accent-success)' : 'var(--admin-text-muted)',
        marginTop: 2, fontWeight: 600,
      }}>🏷️ {a.label}</div>
    ))}
  </div>
))}
```

- [ ] **Шаг 4: tsc + manual check** (`/admin/pages/home?period=7d` загружается, период переключается, период в URL)
- [ ] **Шаг 5: Commit** `feat(admin/pages): migrate [slug] detail to client + PeriodFilter + admin-card`

---

### Задача E.3: `PagesClient` — передача периода в detail через URL

**Files:**
- Modify: `app/(admin)/admin/pages/PagesClient.tsx`
- Modify: `components/admin/PageCard.tsx` (или где ссылка)

**Зачем:** audit #5 — «period не передаётся через URL».

- [ ] **Шаг 1: Прочитать `PagesClient.tsx` + `PageCard.tsx`.** Понять где собирается href для detail.
- [ ] **Шаг 2: Изменить href** — прокинуть `periodState` в query:

```tsx
const detailHref = (slug: string) => {
  const u = new URLSearchParams();
  u.set('period', periodState.period);
  if (periodState.from) u.set('from', periodState.from);
  if (periodState.to) u.set('to', periodState.to);
  return `/admin/pages/${slug}?${u.toString()}`;
};
```

- [ ] **Шаг 3: Commit** `feat(admin/pages): pass period from listing to detail via URL`

---

### Задача E.4: Conversion rate на detail + CR per device

**Files:**
- Modify: `lib/admin/page-queries.ts` (расширить `getPageAnalytics` или добавить helper)
- Modify: `app/api/admin/pages/[slug]/route.ts` (пробросить cr_per_device)
- Modify: `lib/admin/api.ts` (extend PageDetailPayload)
- Modify: `components/admin/pages/DeviceBars.tsx` (показать CR рядом с bars)
- Modify: `components/admin/pages/PageKpiRow.tsx` (добавить CR KPI если его нет)

**Зачем:** audit #7 (нет CR per device), #15 (нет CR на detail).

**Math:** CR per device = `leads_from_device / page_views_from_device`. Leads — `public.leads.source_page = slug + device_type`.

- [ ] **Шаг 1: Добавить `getConversionPerDevice(slug, from, to)`:**

```ts
// lib/admin/page-queries.ts — добавить:
export interface DeviceConversion {
  device_type: string;
  views: number;
  leads: number;
  cr: number;   // 0..100
}

export async function getConversionPerDevice(slug: string, from: Date, to: Date): Promise<DeviceConversion[]> {
  const sb = createAdminClient();
  const [{ data: views }, { data: leads }] = await Promise.all([
    sb.from('page_events').select('device_type').eq('event_type', 'page_view').eq('page_slug', slug).gte('created_at', from.toISOString()).lte('created_at', to.toISOString()),
    sb.from('leads').select('device_type').eq('source_page', slug).gte('created_at', from.toISOString()).lte('created_at', to.toISOString()),
  ]);
  const vmap = new Map<string, number>();
  for (const v of (views ?? [])) {
    const d = (v.device_type ?? 'unknown') as string;
    vmap.set(d, (vmap.get(d) ?? 0) + 1);
  }
  const lmap = new Map<string, number>();
  for (const l of (leads ?? [])) {
    const d = (l.device_type ?? 'unknown') as string;
    lmap.set(d, (lmap.get(d) ?? 0) + 1);
  }
  const all = new Set([...vmap.keys(), ...lmap.keys()]);
  return Array.from(all).map(d => {
    const v = vmap.get(d) ?? 0;
    const l = lmap.get(d) ?? 0;
    return { device_type: d, views: v, leads: l, cr: v > 0 ? (l / v) * 100 : 0 };
  }).sort((a, b) => b.views - a.views);
}
```

- [ ] **Шаг 2: Route** пробрасывает `device_conversion` в response (параллельно с `getPageAnalytics`).
- [ ] **Шаг 3: Extend `PageDetailPayload`:**

```ts
device_conversion: Array<{ device_type: string; views: number; leads: number; cr: number }>;
```

- [ ] **Шаг 4: `DeviceBars`** — показать CR рядом с каждой полосой:

```tsx
// in the row:
<div>
  {label} — <span style={{ fontWeight: 700 }}>{fmt(d.count)}</span>
  {cr && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--admin-accent-success)' }}>CR {cr.toFixed(1)}%</span>}
</div>
```

- [ ] **Шаг 5: `PageKpiRow`** — summary уже есть `conversion_rate`, убедиться что рендерится отдельным KPI card (не только в device bars).
- [ ] **Шаг 6: Commit** `feat(admin/pages): CR KPI + per-device conversion`

---

### Задача E.5: UTM row drill-down modal

**Files:**
- Create: `components/admin/pages/UtmDrilldownModal.tsx`
- Modify: `components/admin/pages/UtmTable.tsx`

**Зачем:** audit #8.

- [ ] **Шаг 1: Модалка показывает** для выбранного (source+medium+campaign) на выбранной странице: views timeline, top referrers с этим UTM, device split, leads count. Reuse `AdminModal`.

Данные для модалки берём client-side — фильтруем `breakdowns.utm_breakdown` по соответствию, подтягиваем таймлайн отдельным endpoint или упрощаем (MVP: просто показать counts из breakdown).

**MVP scope:** модалка показывает statistical summary (views, unique, leads from source) + кнопку «Открыть в Funnel» ведущую на `/admin/funnel?dim=utm_source` с прокинутым периодом.

- [ ] **Шаг 2: `UtmTable.tsx`** — строки кликабельны, `onClick={() => setSelected(row)}` → модалка.
- [ ] **Шаг 3: Commit** `feat(admin/pages): UTM row drilldown modal`

---

### Задача E.6: Referrer группировка по домену

**Files:**
- Modify: `lib/admin/page-queries.ts` (`getPageAnalytics` — преобразовать full URL в домен в ReferrerBreakdown)
- Или в `components/admin/pages/ReferrerTable.tsx` (client-side group)

**Зачем:** audit #13.

**Strategy:** делаем группировку client-side в `ReferrerTable` — не ломаем API, легче откатить:

```tsx
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '(direct)';
  }
}

// in the component:
const grouped = useMemo(() => {
  const m = new Map<string, number>();
  for (const r of data) {
    const d = extractDomain(r.referrer);
    m.set(d, (m.get(d) ?? 0) + r.count);
  }
  return Array.from(m.entries()).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count);
}, [data]);
```

- [ ] **Шаг 1: Изменить `ReferrerTable`** — использовать `grouped` вместо `data`.
- [ ] **Шаг 2: Commit** `feat(admin/pages): group referrers by domain`

---

### Задача E.7: Аннотации UI — CRUD-модалка для pages_registry.annotations

**Files:**
- Create: `app/api/admin/pages/[slug]/annotations/route.ts` (GET/PUT)
- Create: `components/admin/pages/AnnotationsDialog.tsx`
- Modify: `app/(admin)/admin/pages/[slug]/PageDetailClient.tsx`

**Зачем:** audit #9 — аннотации на scroll funnel. Миграция 031 добавила колонку; теперь нужен UI для редактирования.

- [ ] **Шаг 1: GET+PUT route:**

```ts
// app/api/admin/pages/[slug]/annotations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface Annotation { scroll_depth: number; label: string; tone?: 'offer' | 'cta' | 'info' }

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = requireAdmin(req); if (guard) return guard;
  const { slug } = await params;
  const sb = createAdminClient();
  const { data, error } = await sb.from('pages_registry').select('annotations').eq('slug', slug).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ annotations: (data?.annotations ?? []) as Annotation[] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = requireAdmin(req); if (guard) return guard;
  const { slug } = await params;
  const body = await req.json().catch(() => null) as { annotations?: Annotation[] } | null;
  if (!body?.annotations || !Array.isArray(body.annotations)) {
    return NextResponse.json({ error: 'annotations[] required' }, { status: 400 });
  }
  // Validate each item
  for (const a of body.annotations) {
    if (typeof a.scroll_depth !== 'number' || a.scroll_depth < 0 || a.scroll_depth > 100) {
      return NextResponse.json({ error: 'scroll_depth must be 0..100' }, { status: 400 });
    }
    if (typeof a.label !== 'string' || a.label.length === 0) {
      return NextResponse.json({ error: 'label required' }, { status: 400 });
    }
  }
  const sb = createAdminClient();
  const { error } = await sb.from('pages_registry').update({ annotations: body.annotations }).eq('slug', slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Шаг 2: Client helpers:**

```ts
export interface PageAnnotation { scroll_depth: number; label: string; tone?: 'offer' | 'cta' | 'info' }

export function fetchPageAnnotations(slug: string): Promise<{ annotations: PageAnnotation[] }> {
  return adminGet<{ annotations: PageAnnotation[] }>(`/api/admin/pages/${encodeURIComponent(slug)}/annotations`);
}

export async function updatePageAnnotations(slug: string, annotations: PageAnnotation[]): Promise<void> {
  const res = await fetch(`/api/admin/pages/${encodeURIComponent(slug)}/annotations`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ annotations }),
    cache: 'no-store',
  });
  if (!res.ok) throw new AdminApiError(res.status, (await res.json().catch(() => ({}))).error ?? res.statusText);
}
```

- [ ] **Шаг 3: `AnnotationsDialog.tsx`** — модалка с таблицей `[ scroll_depth | label | tone | × ]` + кнопка «Добавить». Submit → `updatePageAnnotations` → `onChange` (родитель перезагружает detail).
- [ ] **Шаг 4: В `PageDetailClient`** — кнопка «Аннотации…» рядом с PeriodFilter, открывает модалку.
- [ ] **Шаг 5: Commit** `feat(admin/pages): annotations editor for scroll funnel`

---

## Финальный чек перед merge

- [ ] **Шаг F.1: `npm run build`** — без ошибок TS
- [ ] **Шаг F.2: Прогнать вручную каждую страницу** (браузер):
  - `/admin/branch` — heatmap traffic/dropoff, coverage KPI, клик по узлу → модалка, на мобилке overlay
  - `/admin/leaderboard` — табы «Неделя/Месяц/Всё время», сортировки, пагинация, русский title
  - `/admin/realtime` — имена игроков, клик → player journey, event-filter, пауза, toggle уведомлений
  - `/admin/pages` — период в URL уходит в detail
  - `/admin/pages/home` — PageHeader + PeriodFilter + admin-card, CR per device, UTM drill-down, аннотации editor
- [ ] **Шаг F.3: PR**

```bash
git checkout -b feat/dashboard-gamedesign-polish
git push -u origin feat/dashboard-gamedesign-polish
gh pr create --base main --head feat/dashboard-gamedesign-polish \
  --title "feat(admin): Phase 4 — gamedesign + pages analytics polish" \
  --body-file docs/superpowers/plans/2026-04-25-dashboard-gamedesign-polish.md
```

---

## Риски

| Риск | Смягчение |
|---|---|
| `ScenarioFlowMap` рендерит через `react-force-graph-2d` — сложно покрасить узлы | Проверить props компонента первым шагом B.2. Если не даёт кастомный node-color — добавить wrapper-оверлей поверх; если не получится — скоп heatmap перенести |
| Leaderboard period-query тяжёлый (JOIN players) при большом completed_scenarios | Добавить индекс `completed_scenarios(completed_at desc)` если slow; пока в прод 25 строк — запас есть |
| Browser notifications блокируются в prod HTTPS-строгом окружении | Проверить в live-проде; iOS Safari не поддерживает — задокументировать |
| `pages_registry.annotations` нагрузит бандл client | Мини: массив до 10 элементов per page — ~500 байт |
| `UtmTable` drill-down с текущими данными (без отдельного endpoint) будет бедной | MVP-scope — только counts + ссылка на Funnel. Полноценный drill — отдельная задача |

## Timeline

- Блок A: 0.5 дня
- Блок B: 1 день (Branch — самый сложный из-за ScenarioFlowMap)
- Блок C: 1 день (Leaderboard — много UI)
- Блок D: 1 день (Realtime — polling-tweaks + notifications)
- Блок E: 1.5 дня (Pages migration + annotations CRUD)
- **Итого:** 5 дней субагент-экзекьюшена

---

## 🏁 Execution Handoff

План сохранён: `docs/superpowers/plans/2026-04-25-dashboard-gamedesign-polish.md`.

**Варианты:**
1. **Subagent-Driven** (как Phase 2/3) — фреш-субагент на задачу, two-stage review
2. **Inline** — пачками в этой сессии

Какой?
