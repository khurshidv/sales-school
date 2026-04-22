# План доработки админ-дашборда по аудиту 2026-04-22

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans` для пошаговой реализации. Шаги используют `- [ ]` для трекинга.

**Источник:** [dashboard-audit-2026-04-22.md](../dashboard-audit-2026-04-22.md)

**Goal:** Устранить ключевые находки аудита — вывести дашборд из состояния «витрина-заглушка» в боевой аналитический инструмент с связью с продажами (Bitrix), правильной сегментацией и готовностью к работе команды.

**Архитектура:** Работаем по приоритетам аудита: чистим → фундамент (каркас/общие компоненты) → деньги/продажи → аналитика → геймдизайн. Каждая крупная фаза (2–4) выносится в собственный под-план после ревью этого мастер-плана. Здесь детально расписаны только Фазы 0 и 1 (фундамент), остальные — как структурированный перечень задач.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + RPC), Tailwind 4, lucide-react, Framer Motion. Правила проекта (из `CLAUDE.md`): ADD-only migrations, client → `/api/admin/*` → `queries-v2`, админка только на русском.

---

## 🎯 Цели и метрики успеха

| Цель | Метрика до | Метрика после |
|---|---|---|
| Средний балл дашборда | 5/10 | 8/10 |
| Страниц с PeriodFilter | 10/11 | 11/11 |
| Страниц с CSV export | 2/11 | ≥8/11 |
| Связь с Bitrix в UI | 0 страниц | ≥3 страницы |
| Сегментация uz/ru | 0 страниц | ≥6 страниц |
| Русификация sidebar | 2/11 | 11/11 |
| Legacy orphan-страницы | 2 (game-metrics, pages/[slug]) | 0 |

---

## 📚 Глоссарий и соглашения

- **`queries-v2.ts`** — единственный слой чтения Supabase для новой админки. Не импортировать напрямую из client-компонентов (server-only).
- **`lib/admin/api.ts`** — типизированные `fetchX()` для client-компонентов, идут через `/api/admin/*`.
- **Admin UI язык** — только русский (deliberate product decision, см. `CLAUDE.md`).
- **Миграции** — ADD-only, новые нумеруются по порядку. Текущий максимум — `018_backfill_game_events.sql`, следующий — `019`.
- **Period filter URL-param** — `usePeriodParam()` из `lib/admin/usePeriodParam.ts`, значения: `7d|30d|90d|all` (расширяем до `today|yesterday|custom`).

---

# ФАЗА 0. Cleanup & фундамент (2–3 дня)

Удалить мёртвый код и подготовить общие примитивы для последующих фаз. Без этого каждая следующая фаза будет тащить legacy-слой.

## 📁 Файловая структура после Фазы 0

**Создать:**
- `components/admin/shared/LoadingSkeleton.tsx` — унифицированный skeleton
- `components/admin/shared/EmptyState.tsx` — унифицированный empty state
- `components/admin/shared/ErrorBoundary.tsx` — client error boundary с retry
- `components/admin/shared/Toast.tsx` + `components/admin/shared/ToastProvider.tsx`
- `components/admin/shared/Breadcrumbs.tsx`
- `lib/admin/nodeLabels.ts` — `resolveNodeLabel(scenarioId, nodeId): { title, type, preview }` из `game/data/scenarios/*`
- `lib/admin/thresholds.ts` — все magic-numbers (5%, 15s, 90s, 50 limit) в одном месте как конфиг
- `supabase/migrations/019_pages_registry.sql` — таблица `pages_registry` для замены хардкода `PAGE_TITLES`

**Модифицировать:**
- `components/admin/Sidebar.tsx` — русификация всех лейблов, удалить пункт «Player Journey», удалить «Pages» (переименовать в «Аналитика лендингов»)
- `components/admin/PeriodFilter.tsx` — добавить `today|yesterday|custom` + date-range popover
- `lib/admin/usePeriodParam.ts` — поддержать новые значения + `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `lib/admin/queries-v2.ts` — адаптеры под новые period-значения
- `app/(admin)/admin/leads/page.tsx` — добавить PeriodFilter (единственная страница-дыра)

**Удалить:**
- `app/(admin)/admin/game-metrics/` (вся папка)
- `components/admin/TopBar.tsx` (заменим в Фазе 1)
- `components/admin/RefreshButton.tsx` и `components/admin/TableFilters.tsx` (если остались orphan после удаления game-metrics)
- `components/admin/DateRangePicker.tsx` — заменим встроенным popover в новом PeriodFilter
- `lib/admin/queries.ts` (старый) — все коллайты мигрировать в `queries-v2.ts`
- `app/api/admin/pages/[slug]/route.ts` — мёртвый endpoint (оживим в Фазе 4, если решим, иначе — удалить)

---

## Задача 0.1: Удалить orphan-страницу game-metrics

**Files:**
- Delete: `app/(admin)/admin/game-metrics/` (папка целиком)
- Modify: `lib/admin/queries.ts` — удалить `getGameMetrics()` и всё, что ей принадлежит
- Grep-проверка: `components/admin/TableFilters.tsx`, `components/admin/RefreshButton.tsx`, `components/admin/DateRangePicker.tsx` — если больше не используются, удалить

- [ ] **Шаг 1: Убедиться, что game-metrics не сайдбарится и не ссылается никуда**

Команда:
```bash
rg -l "game-metrics|TableFilters|getGameMetrics" --glob '!**/docs/**'
```
Ожидание: ссылки только внутри удаляемой папки + `lib/admin/queries.ts`.

- [ ] **Шаг 2: Удалить страницу**

```bash
rm -rf "app/(admin)/admin/game-metrics"
```

- [ ] **Шаг 3: Удалить `getGameMetrics` из `queries.ts`**

Открыть `lib/admin/queries.ts` и удалить функцию `getGameMetrics` и связанные типы/импорты. Если файл становится пустым — удалить файл и убрать его импорты (grep `from '@/lib/admin/queries'` — должны быть только orphan-случаи).

- [ ] **Шаг 4: Удалить orphan-компоненты**

```bash
# Проверяем, остались ли зависимости
rg "TableFilters|RefreshButton|DateRangePicker" components/ app/
# Если чисто — удаляем
rm components/admin/TableFilters.tsx components/admin/RefreshButton.tsx components/admin/DateRangePicker.tsx
```

- [ ] **Шаг 5: Запустить билд**

```bash
npm run build
```
Ожидание: успешно, без ошибок «Cannot find module».

- [ ] **Шаг 6: Commit**

```bash
git add -A
git commit -m "chore(admin): remove orphan game-metrics page and legacy components"
```

---

## Задача 0.2: Удалить мёртвый TopBar компонент

**Files:**
- Delete: `components/admin/TopBar.tsx`

- [ ] **Шаг 1: Grep на использование**

```bash
rg "TopBar" components/ app/
```
Ожидание: никаких ссылок (комментарий «TopBar is rendered per-page» в layout не считается).

- [ ] **Шаг 2: Удалить файл и обновить комментарий в layout**

```bash
rm components/admin/TopBar.tsx
```
Edit `app/(admin)/layout.tsx`: удалить строку-комментарий про TopBar.

- [ ] **Шаг 3: Commit**

```bash
git add -A
git commit -m "chore(admin): remove dead TopBar component (replaced in Phase 1)"
```

---

## Задача 0.3: Удалить мёртвый API `/api/admin/pages/[slug]`

**Files:**
- Delete: `app/api/admin/pages/[slug]/route.ts`

- [ ] **Шаг 1: Grep на использование**

```bash
rg "/api/admin/pages/" app/ components/ lib/
```
Ожидание: только listing-endpoint `/api/admin/pages` без `[slug]`.

- [ ] **Шаг 2: Удалить**

```bash
rm -rf "app/api/admin/pages/[slug]"
```

- [ ] **Шаг 3: Commit**

```bash
git add -A
git commit -m "chore(admin): remove dead /api/admin/pages/[slug] endpoint"
```

Примечание: endpoint будет восстановлен в Фазе 4 (Pages Analytics migration) с правильной сигнатурой — на этом этапе чистим мёртвый.

---

## Задача 0.4: Русификация Sidebar + удаление дубликата Player Journey

**Files:**
- Modify: `components/admin/Sidebar.tsx`

Мапа замен (из аудита):

| Current | Proposed |
|---|---|
| Real-time | Мониторинг live |
| Overview | Обзор |
| Branch Analytics | Карта сценария |
| Engagement | Вовлечённость |
| Drop-off Zones | Точки выхода |
| Funnel & UTM | Воронка и источники |
| Pages | Аналитика лендингов |
| Offer Conversion | Конверсия оффера |
| Participants | Участники |
| **Player Journey** | **удалить** |
| Leaderboard | Таблица лидеров |
| Заявки (формы) | Заявки |

- [ ] **Шаг 1: Обновить `GROUPS` в Sidebar**

В `components/admin/Sidebar.tsx:23` заменить массив `GROUPS` согласно мапе. Пункт `Player Journey` (`/admin/player`) удалить целиком.

- [ ] **Шаг 2: Убедиться, что redirect `/admin/player` → `/admin/participants` живой**

Проверить `app/(admin)/admin/player/page.tsx` — там должен быть `redirect('/admin/participants')`. Если нет — добавить.

- [ ] **Шаг 3: Визуальная проверка**

```bash
npm run dev
```
Открыть `/admin/overview`, убедиться что 10 пунктов на русском + нет «Player Journey».

- [ ] **Шаг 4: Commit**

```bash
git add components/admin/Sidebar.tsx app/\(admin\)/admin/player/page.tsx
git commit -m "feat(admin): russify sidebar labels and drop Player Journey duplicate"
```

---

## Задача 0.5: Создать unified Loading / Empty / Error компоненты

**Files:**
- Create: `components/admin/shared/LoadingSkeleton.tsx`
- Create: `components/admin/shared/EmptyState.tsx`
- Create: `components/admin/shared/ErrorBoundary.tsx`

- [ ] **Шаг 1: LoadingSkeleton**

```tsx
// components/admin/shared/LoadingSkeleton.tsx
'use client';
type Variant = 'kpi-row' | 'table' | 'chart' | 'card';
interface Props { variant: Variant; rows?: number; }
export function LoadingSkeleton({ variant, rows = 5 }: Props) {
  if (variant === 'kpi-row') {
    return (
      <div className="admin-kpi-row">
        {[0,1,2,3].map(i => (
          <div key={i} className="admin-card admin-skeleton" style={{ height: 104 }} />
        ))}
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className="admin-card">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="admin-skeleton" style={{ height: 40, marginBottom: 8 }} />
        ))}
      </div>
    );
  }
  if (variant === 'chart') {
    return <div className="admin-card admin-skeleton" style={{ height: 280 }} />;
  }
  return <div className="admin-card admin-skeleton" style={{ height: 160 }} />;
}
```

Добавить CSS `.admin-skeleton` в `app/(admin)/admin.css`:
```css
.admin-skeleton {
  background: linear-gradient(90deg, var(--admin-bg-2) 0%, var(--admin-bg-3) 50%, var(--admin-bg-2) 100%);
  background-size: 200% 100%;
  animation: admin-shimmer 1.5s infinite linear;
  border-radius: 12px;
}
@keyframes admin-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
```

- [ ] **Шаг 2: EmptyState**

```tsx
// components/admin/shared/EmptyState.tsx
'use client';
import type { ReactNode } from 'react';
interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
}
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>{icon}</div>}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
      {description && <p style={{ color: 'var(--admin-text-2)', fontSize: 13 }}>{description}</p>}
      {action && (
        <div style={{ marginTop: 16 }}>
          {typeof action === 'object' && 'label' in action && 'onClick' in action
            ? <button className="admin-btn admin-btn--primary" onClick={action.onClick}>{action.label}</button>
            : action}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Шаг 3: ErrorBoundary**

```tsx
// components/admin/shared/ErrorBoundary.tsx
'use client';
import { Component, type ReactNode } from 'react';
interface Props { children: ReactNode; fallback?: (err: Error, retry: () => void) => ReactNode; }
interface State { err: Error | null; }
export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { err: null };
  static getDerivedStateFromError(err: Error): State { return { err }; }
  componentDidCatch(err: Error) { console.error('[admin] error boundary', err); }
  retry = () => this.setState({ err: null });
  render() {
    if (this.state.err) {
      if (this.props.fallback) return this.props.fallback(this.state.err, this.retry);
      return (
        <div className="admin-card" style={{ padding: 24 }}>
          <h3>Ошибка загрузки</h3>
          <p style={{ color: 'var(--admin-text-2)', fontSize: 13 }}>{this.state.err.message}</p>
          <button className="admin-btn" onClick={this.retry}>Повторить</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Шаг 4: Commit**

```bash
git add components/admin/shared/ app/\(admin\)/admin.css
git commit -m "feat(admin): add unified LoadingSkeleton/EmptyState/ErrorBoundary primitives"
```

---

## Задача 0.6: Toast-система для ошибок

**Files:**
- Create: `components/admin/shared/ToastProvider.tsx`
- Modify: `app/(admin)/layout.tsx` — обернуть в provider

- [ ] **Шаг 1: Context + hook**

```tsx
// components/admin/shared/ToastProvider.tsx
'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
type Tone = 'info' | 'success' | 'warning' | 'danger';
interface Toast { id: string; tone: Tone; title: string; description?: string; }
interface Ctx { push: (t: Omit<Toast, 'id'>) => void; }
const ToastCtx = createContext<Ctx | null>(null);
export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) throw new Error('useToast outside ToastProvider');
  return c;
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setList(prev => [...prev, { ...t, id }]);
    setTimeout(() => setList(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="admin-toast-stack">
        {list.map(t => (
          <div key={t.id} className={`admin-toast admin-toast--${t.tone}`}>
            <div className="admin-toast-title">{t.title}</div>
            {t.description && <div className="admin-toast-desc">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
```

- [ ] **Шаг 2: CSS в `admin.css`**

```css
.admin-toast-stack { position: fixed; right: 20px; bottom: 20px; display: flex; flex-direction: column; gap: 8px; z-index: 9999; }
.admin-toast { background: var(--admin-bg-2); border: 1px solid var(--admin-border); border-radius: 10px; padding: 12px 16px; min-width: 260px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.admin-toast--danger { border-color: var(--admin-danger); }
.admin-toast--warning { border-color: var(--admin-warning); }
.admin-toast--success { border-color: var(--admin-success); }
.admin-toast-title { font-weight: 600; font-size: 13px; }
.admin-toast-desc { font-size: 12px; color: var(--admin-text-2); margin-top: 4px; }
```

- [ ] **Шаг 3: Подключить в layout**

Edit `app/(admin)/layout.tsx`: обернуть children в `<ToastProvider>`.

- [ ] **Шаг 4: Commit**

```bash
git add components/admin/shared/ToastProvider.tsx app/\(admin\)/layout.tsx app/\(admin\)/admin.css
git commit -m "feat(admin): add Toast system for error feedback"
```

---

## Задача 0.7: Thresholds config (убрать magic numbers)

**Files:**
- Create: `lib/admin/thresholds.ts`

- [ ] **Шаг 1: Создать конфиг**

```ts
// lib/admin/thresholds.ts
export const THRESHOLDS = {
  heartbeat: {
    liveWindowSeconds: 90,
  },
  engagement: {
    thinkTimeMinSeconds: 5,
    thinkTimeMaxSeconds: 15,
    slowNodeMs: 15_000,
    replayHealthyMin: 0.10,
    replayHealthyMax: 0.30,
  },
  dropoff: {
    minVisitsForRate: 20,
    shortExitSeconds: 5,
    insightRateMin: 0.20, // 20% — показывать warning
  },
  offer: {
    lowCtrThreshold: 0.05,
    minViewsForStat: 50,
  },
  overview: {
    lowCompletionRate: 0.10,
  },
  leaderboard: {
    podiumSize: 3,
    topLimit: 50,
  },
} as const;

export type Thresholds = typeof THRESHOLDS;
```

- [ ] **Шаг 2: Grep-замены**

Заменить хардкоды `15_000`, `0.05`, `0.10`, `90`, `50` в:
- `lib/admin/realtime/*`
- `app/(admin)/admin/engagement/*`
- `app/(admin)/admin/offer/*`
- `app/(admin)/admin/overview/*`
- `app/(admin)/admin/dropoff/*`

- [ ] **Шаг 3: Commit**

```bash
git add -A
git commit -m "refactor(admin): centralize thresholds into lib/admin/thresholds.ts"
```

---

## Задача 0.8: `resolveNodeLabel` — человекочитаемые имена узлов

**Files:**
- Create: `lib/admin/nodeLabels.ts`

**Контекст проблемы:** в 6 местах показываются raw `node_id` типа `node_07c_choice_azizdialog`. Нужен единый мапер.

- [ ] **Шаг 1: Построить хелпер**

```ts
// lib/admin/nodeLabels.ts
import 'server-only';
import { scenarios } from '@/game/data/scenarios';
import type { ScenarioNode } from '@/game/engine/types';

export interface NodeLabel {
  title: string;
  type: ScenarioNode['type'];
  preview: string | null;
  dayId: string | null;
}

const cache = new Map<string, NodeLabel>();

export function resolveNodeLabel(scenarioId: string, nodeId: string): NodeLabel {
  const key = `${scenarioId}::${nodeId}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const scenario = scenarios[scenarioId];
  const fallback: NodeLabel = { title: nodeId, type: 'dialogue', preview: null, dayId: null };
  if (!scenario) return fallback;

  for (const day of scenario.days) {
    const node = day.nodes[nodeId];
    if (!node) continue;
    const title = deriveTitle(node);
    const preview = derivePreview(node);
    const label: NodeLabel = { title, type: node.type, preview, dayId: day.id };
    cache.set(key, label);
    return label;
  }
  return fallback;
}

function deriveTitle(n: ScenarioNode): string {
  if (n.type === 'dialogue') return truncate(n.text, 60);
  if (n.type === 'choice') return truncate(n.prompt, 60);
  if (n.type === 'day_intro') return `Интро: ${truncate((n as any).title ?? '', 40)}`;
  return `[${n.type}] ${n.id}`;
}

function derivePreview(n: ScenarioNode): string | null {
  if (n.type === 'dialogue') return n.text.ru ?? null;
  if (n.type === 'choice') return n.prompt.ru ?? null;
  return null;
}

function truncate(str: any, max: number): string {
  const s = typeof str === 'string' ? str : (str?.ru ?? str?.uz ?? JSON.stringify(str));
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
```

⚠️ Проверить реальные типы `ScenarioNode` в `game/engine/types.ts` — функции `deriveTitle/derivePreview` должны соответствовать (i18n поля могут быть `{uz, ru}`).

- [ ] **Шаг 2: Тонкий client-safe экспорт через API**

Создать `app/api/admin/node-label/route.ts` для клиентских страниц, которые не могут импортить server-only.

```ts
// app/api/admin/node-label/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { resolveNodeLabel } from '@/lib/admin/nodeLabels';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const url = new URL(req.url);
  const scenarioId = url.searchParams.get('scenario');
  const ids = url.searchParams.get('ids')?.split(',') ?? [];
  if (!scenarioId) return NextResponse.json({ error: 'scenario required' }, { status: 400 });
  const result = Object.fromEntries(ids.map(id => [id, resolveNodeLabel(scenarioId, id)]));
  return NextResponse.json({ labels: result });
}
```

- [ ] **Шаг 3: Добавить `fetchNodeLabels` в `lib/admin/api.ts`**

```ts
// lib/admin/api.ts — добавить в конец
export async function fetchNodeLabels(scenarioId: string, ids: string[]) {
  const qs = new URLSearchParams({ scenario: scenarioId, ids: ids.join(',') });
  const res = await fetch(`/api/admin/node-label?${qs}`);
  if (!res.ok) throw new Error('node-labels fetch failed');
  return res.json() as Promise<{ labels: Record<string, { title: string; type: string; preview: string | null; dayId: string | null }> }>;
}
```

- [ ] **Шаг 4: Commit**

```bash
git add lib/admin/nodeLabels.ts lib/admin/api.ts app/api/admin/node-label/
git commit -m "feat(admin): add resolveNodeLabel helper + /api/admin/node-label endpoint"
```

---

## Задача 0.9: Расширить PeriodFilter (today / yesterday / custom)

**Files:**
- Modify: `components/admin/PeriodFilter.tsx`
- Modify: `lib/admin/usePeriodParam.ts`
- Modify: `lib/admin/period.ts` — добавить resolver `resolvePeriod(period, from?, to?) → { from: Date, to: Date }`
- Modify: все `getX(period)` в `lib/admin/queries-v2.ts` — должны принимать `{period, from?, to?}`

- [ ] **Шаг 1: Расширить тип Period**

В `lib/admin/period.ts`:
```ts
export type Period = '7d' | '30d' | '90d' | 'all' | 'today' | 'yesterday' | 'custom';

export interface ResolvedRange { from: Date; to: Date; }

export function resolvePeriod(p: Period, customFrom?: string, customTo?: string): ResolvedRange {
  const now = new Date();
  const to = new Date(now); to.setHours(23, 59, 59, 999);
  const from = new Date(now); from.setHours(0, 0, 0, 0);
  switch (p) {
    case 'today': return { from, to };
    case 'yesterday': {
      const y = new Date(from); y.setDate(y.getDate() - 1);
      const yTo = new Date(to); yTo.setDate(yTo.getDate() - 1);
      return { from: y, to: yTo };
    }
    case '7d': { const f = new Date(from); f.setDate(f.getDate() - 6); return { from: f, to }; }
    case '30d': { const f = new Date(from); f.setDate(f.getDate() - 29); return { from: f, to }; }
    case '90d': { const f = new Date(from); f.setDate(f.getDate() - 89); return { from: f, to }; }
    case 'all': return { from: new Date('2020-01-01'), to };
    case 'custom': {
      if (!customFrom || !customTo) throw new Error('custom period requires from/to');
      return { from: new Date(customFrom), to: new Date(customTo) };
    }
  }
}
```

- [ ] **Шаг 2: Обновить `usePeriodParam`**

Поддержать дополнительные search-params `?from=YYYY-MM-DD&to=YYYY-MM-DD` когда `period=custom`.

- [ ] **Шаг 3: Обновить PeriodFilter UI**

Добавить опции «Сегодня», «Вчера» + кнопку «⋯» открывающую date-range popover (shadcn-like inline calendar, без внешних зависимостей — использовать `<input type="date">` × 2 для MVP).

- [ ] **Шаг 4: Мигрировать все `getX(period)` в queries-v2**

В каждой функции сделать:
```ts
export async function getOverview(period: Period, range?: Partial<ResolvedRange>) {
  const { from, to } = range?.from && range?.to ? range as ResolvedRange : resolvePeriod(period);
  // ... использовать from/to в SQL
}
```

⚠️ Все RPC `admin_get_*` могут принимать период как строку — нужно либо добавить новые миграционные варианты (ADD-only) либо считать диапазоны на JS стороне. **Решение:** считаем `from/to` на JS и передаём их в RPC как параметры (миграция 019 добавит overloads с `p_from timestamptz, p_to timestamptz`).

- [ ] **Шаг 5: Commit (серия)**

```bash
git add lib/admin/period.ts lib/admin/usePeriodParam.ts components/admin/PeriodFilter.tsx
git commit -m "feat(admin): extend PeriodFilter with today/yesterday/custom"

git add supabase/migrations/019_admin_rpc_custom_range.sql lib/admin/queries-v2.ts
git commit -m "feat(admin): add custom-range overloads to admin RPCs"
```

---

## Задача 0.10: Добавить PeriodFilter на Leads

**Files:**
- Modify: `app/(admin)/admin/leads/page.tsx`
- Modify: `app/api/admin/leads/route.ts` — принимать period
- Modify: `lib/admin/queries-v2.ts` `getLeads()` — учитывать period

- [ ] **Шаг 1: Добавить `<PeriodFilter/>` в actions шапки**
- [ ] **Шаг 2: Прокинуть `?period=...` в fetch**
- [ ] **Шаг 3: SQL-фильтр по `created_at BETWEEN from AND to`**
- [ ] **Шаг 4: Commit**

```bash
git add -A
git commit -m "feat(admin/leads): add PeriodFilter (fix audit gap #1)"
```

---

## Задача 0.11: `pages_registry` миграция

**Files:**
- Create: `supabase/migrations/019_pages_registry.sql`
- Modify: `app/(admin)/admin/pages/[slug]/page.tsx` — убрать хардкод `PAGE_TITLES`

⚠️ Если номер 019 занят предыдущей задачей (custom-range), использовать 020.

- [ ] **Шаг 1: Миграция**

```sql
-- ADD-only
create table if not exists pages_registry (
  slug text primary key,
  title_ru text not null,
  title_uz text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into pages_registry (slug, title_ru, title_uz) values
  ('home', 'Вебинар', 'Vebinar'),
  ('target', 'Курс', 'Kurs')
on conflict (slug) do nothing;

grant select on pages_registry to anon, authenticated, service_role;
```

- [ ] **Шаг 2: Применить миграцию через Supabase MCP**

Используем `mcp__plugin_supabase_supabase__apply_migration`.

- [ ] **Шаг 3: Добавить query в `queries-v2`**

```ts
export async function getPageTitle(slug: string): Promise<string> {
  const sb = getAdminSupabase();
  const { data } = await sb.from('pages_registry').select('title_ru').eq('slug', slug).maybeSingle();
  return data?.title_ru ?? slug;
}
```

- [ ] **Шаг 4: Commit**

```bash
git add supabase/migrations/020_pages_registry.sql lib/admin/queries-v2.ts app/\(admin\)/admin/pages/\[slug\]/page.tsx
git commit -m "feat(admin): replace hardcoded PAGE_TITLES with pages_registry table"
```

---

## ✅ Definition of Done для Фазы 0

- [ ] `npm run build` зелёный
- [ ] `/admin/game-metrics` — 404
- [ ] Sidebar — 10 пунктов, все на русском, без «Player Journey»
- [ ] PeriodFilter имеет «Сегодня», «Вчера», «Свой диапазон»
- [ ] Leads имеет PeriodFilter
- [ ] Нет импортов из `queries.ts` (старый файл удалён)
- [ ] Нет раш `node_id` в dropoff/engagement/replay (используется `resolveNodeLabel`)

---

# ФАЗА 1. Каркас (TopBar + global UX) (2–3 дня)

Довести каркас до стандарта production-админки.

## 📁 Файловая структура

**Создать:**
- `components/admin/shell/TopBar.tsx` — новая шапка с user-info, logout, notifications
- `components/admin/shell/GlobalSearch.tsx` — Cmd+K overlay
- `components/admin/shared/Breadcrumbs.tsx`
- `app/api/admin/logout/route.ts`
- `app/api/admin/notifications/route.ts` — источник alerts из `detectAutoInsights`

**Модифицировать:**
- `app/(admin)/layout.tsx` — отрендерить TopBar глобально (не per-page)
- Все `PageHeader` на detail-страницах — добавить Breadcrumbs

---

## Задача 1.1: TopBar с user-info + logout

**Files:**
- Create: `components/admin/shell/TopBar.tsx`
- Create: `app/api/admin/logout/route.ts`
- Modify: `app/(admin)/layout.tsx`

- [ ] **Шаг 1: Logout endpoint**

```ts
// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
  return res;
}
```

- [ ] **Шаг 2: TopBar component**

```tsx
// components/admin/shell/TopBar.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Search } from 'lucide-react';
import { useToast } from '../shared/ToastProvider';

export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('logout failed');
      router.replace('/admin/login');
    } catch (e) {
      toast.push({ tone: 'danger', title: 'Не удалось выйти', description: String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-topbar">
      <button className="admin-topbar-search" onClick={onOpenSearch}>
        <Search size={14} /> <span>Найти… <kbd>⌘K</kbd></span>
      </button>
      <div className="admin-topbar-right">
        <button className="admin-icon-btn" aria-label="Уведомления"><Bell size={16} /></button>
        <button className="admin-icon-btn" aria-label="Выйти" disabled={busy} onClick={logout}><LogOut size={16} /></button>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 3: Подключить в layout**

Edit `app/(admin)/layout.tsx`: над `admin-content` рендерить `<TopBar onOpenSearch={...} />`. Открытие global-search — в Задаче 1.3.

- [ ] **Шаг 4: CSS**

Добавить `.admin-topbar`, `.admin-topbar-search`, `.admin-icon-btn` в `admin.css`.

- [ ] **Шаг 5: Commit**

```bash
git add -A
git commit -m "feat(admin): add persistent TopBar with logout"
```

---

## Задача 1.2: Breadcrumbs

**Files:**
- Create: `components/admin/shared/Breadcrumbs.tsx`
- Modify: `app/(admin)/admin/player/[id]/page.tsx`, `app/(admin)/admin/pages/[slug]/page.tsx`

- [ ] **Шаг 1: Компонент**

```tsx
'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
interface Crumb { href?: string; label: string; }
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="admin-crumbs">
      {items.map((c, i) => (
        <span key={i} className="admin-crumb">
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          {i < items.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Шаг 2: Встроить в detail-страницы**

Player: `Участники › {playerName}`
Pages: `Аналитика лендингов › {pageTitle}`

- [ ] **Шаг 3: Commit**

```bash
git add -A
git commit -m "feat(admin): add breadcrumbs on detail pages"
```

---

## Задача 1.3: Global Search (Cmd+K) — базовая

**Files:**
- Create: `components/admin/shell/GlobalSearch.tsx`

Scope MVP: поиск по sidebar-пунктам + игрокам по имени/телефону (через `/api/admin/participants?search=`).

- [ ] **Шаг 1: Overlay + keyboard shortcut (`⌘K` / `Ctrl+K`)**
- [ ] **Шаг 2: Fuse.js-лёгкий поиск по статичному списку страниц**
- [ ] **Шаг 3: Async поиск игроков + лидов (debounced 200ms)**
- [ ] **Шаг 4: Commit**

---

## Задача 1.4: Mobile-responsive KPI grids

**Files:**
- Modify: `app/(admin)/admin.css` — `.admin-kpi-row` переделать на `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`

- [ ] **Шаг 1: Перевёрстка**
- [ ] **Шаг 2: Проверить все 11 страниц в DevTools на 375×667 (landscape phone)**
- [ ] **Шаг 3: Commit**

---

## ✅ Definition of Done для Фазы 1

- [ ] TopBar виден на всех admin-страницах с кнопкой logout
- [ ] Logout очищает `admin_session` cookie и редиректит на `/admin/login`
- [ ] Breadcrumbs на player/[id] и pages/[slug]
- [ ] Cmd+K открывает поиск, находит страницы и игроков
- [ ] KPI-ряд не ломается на 375px

---

# ФАЗА 2. Приоритет 1: Деньги и продажи (5–7 дней)

**Дать ядру продаж полный функциональный набор.** Под-план: `2026-04-23-dashboard-sales-core.md` (писать после ревью этого мастер-плана).

## Структурный перечень задач

### 2.1. Leads rework (~70% переработка)
- Связь с Bitrix: колонка статуса сделки, кнопка «Открыть сделку» (deep-link). Миграция добавляет `leads.bitrix_deal_id`, fill по webhook (уже есть интеграция).
- **Связка «Лид ↔ Игрок»** по `phone` — кнопка «Открыть карточку игрока» в строке.
- WhatsApp / Telegram кнопки с подставленным именем (шаблон из config).
- UTM-фильтр (multi-select по source/campaign/medium/content/term).
- Сортировка всех колонок (использовать `SortableHeader.tsx` — уже есть).
- **Export CSV**.
- Bulk actions (чекбокс колонка + `actions bar` снизу: «Отметить обработанным», «Скопировать номера»).
- Статусы «новый / в работе / обработан» — новая таблица `lead_states` (ADD-only).
- Dedup-индикатор (phone встречается в leads >1 раза — бейдж «дубль N»).
- Убрать: KPI «На странице», хардкод SOURCE_TABS, subtitle «Отдельно от участников игры».

### 2.2. Offer rework (~50% переработка)
- Hint «Что такое Конверсия» — модалка с формулой.
- CR = `conversion / view` как отдельный KPI.
- Revenue-метрика: подключить из Bitrix (сумма закрытых сделок в период).
- Тренд CTR/CR по дням (line chart).
- Сегменты: language / device / region (mobile-responsive tabs).
- Version history + annotations (UI для `variant_id` из `offer_events`).
- Сегмент «видел — не кликнул» с экспортом CSV (retargeting).
- Min-sample threshold на «Лучший rating» (из `thresholds.offer.minViewsForStat`).

### 2.3. Participants rework (~50% переработка)
- Фильтры: UTM, дата регистрации, язык, устройство, «есть заявка», статус Bitrix, диапазон рейтинга.
- Pagination / infinite scroll (replace limit 100).
- Колонки: прогресс игры (День X/3), дней без активности, статус Bitrix.
- Статус «обработан / не обработан» + assigned-to — новая таблица `participant_states`.
- Bulk actions.
- Детектор дубликатов (phone).

### 2.4. Player Journey polish (~35% переработка)
- Убрать subtitle «ID: {uuid}».
- Добавить в профиль: язык игры, устройство, текущий день, дней без активности, общее время, полные UTM (5 параметров).
- Шаблоны WhatsApp/Telegram с `{{playerName}}`.
- Replay dropdown — выбор любого дня.
- Фильтр Timeline (скрыть heartbeat/node_entered по умолчанию, toggle «Показать служебные»).
- Ссылка «Открыть в Bitrix».
- Push/email уведомление при новой «hire»-рекомендации (не обязательно в этой фазе — вынести в SHOULD).
- DayReplayModal: заменить raw `node_id` через `fetchNodeLabels`.

**Миграции Фазы 2 (ADD-only):**
- `021_lead_states.sql` — таблица статусов и истории.
- `022_participant_states.sql`
- `023_leads_bitrix_link.sql` — `leads.bitrix_deal_id`.

**API роуты Фазы 2:**
- `app/api/admin/leads/[id]/status` (PATCH)
- `app/api/admin/leads/bulk` (POST)
- `app/api/admin/participants/[id]/status` (PATCH)
- `app/api/admin/bitrix/deal/[id]` (GET) — прокси для Bitrix

---

# ФАЗА 3. Приоритет 2: Аналитика (5–7 дней)

Под-план: `2026-04-24-dashboard-analytics-depth.md`.

## Структурный перечень задач

### 3.1. Overview (~60%)
- KPI-ряд → добавить `ΔvsPrev`, sparkline, CR (3 процентные KPI).
- Убрать декоративные `accent` на `KpiCard`.
- Добавить KPI «Визитёры».
- Воронку перестроить: шаг «Визит» сверху. Все 6 шагов — из одного источника (`game_events` + `offer_events`, но единая методология).
- Переключатель серий на `TrendLineChart` (визиты / регистрации / старты / прохождения / заявки).
- Сравнение с прошлым периодом (pale line).
- Секция «Топ-5 UTM-источников».
- Realtime-микровиджет в шапке («🔴 N играют сейчас»).
- «Лучший / худший день».
- Сегмент uz/ru.

### 3.2. Funnel & UTM (~70%)
- Настоящая `FunnelBars` визуализация сверху.
- Все 5 UTM-колонок с drill-down (source → medium → campaign → content → term).
- CR в заявку как главный KPI.
- Spend + CPL + ROAS — новая таблица `utm_spend` (manual upload CSV + API), отображение.
- Фильтр по UTM.
- Тренд по источнику.
- Сегмент uz/ru.
- Статус сделки из Bitrix (связать с Фазой 2).
- Export CSV.
- Min-threshold на «Лучший источник».

### 3.3. Dropoff (~70%)
- drop-off rate (%) с знаменателем = visits узла.
- Min visits ≥ `thresholds.dropoff.minVisitsForRate`.
- `resolveNodeLabel` везде (уже есть из Фазы 0).
- Разделение «добровольный выход» vs «Game Over» (флаг в `game_events.event_data`).
- Timing: time-to-exit + % коротких выходов (<5s).
- Тепловая карта поверх Branch flow map (интеграция с 3.1 Branch).
- Фильтры: день, тип узла, язык, устройство.
- Export CSV.
- Убрать KPI «Дней с проблемами», «Топ узел raw id».

### 3.4. Engagement (~55%)
- Retention D1 / D7 — новая RPC `admin_get_retention`.
- Breakdown Interest Index: 3 компонента (completion_rate, thinking_quality, replay_rate) каждый как KPI + формула видна при клике.
- Median / p90 / p95 для thinking time.
- Heat curve (интерес по сценам в дне).
- Корреляция engagement с S-рейтингом (scatter).
- Сегмент uz/ru.
- `resolveNodeLabel` в ThinkingBarChart.
- Тренд Interest Index (line chart).
- Пороги времени per тип узла (из `thresholds.engagement`).
- Подключить `ActivityAreaChart` и `PerDayBars` (сейчас не используются).

**Миграции Фазы 3 (ADD-only):**
- `024_utm_spend.sql`
- `025_admin_retention_rpc.sql`
- `026_dropoff_with_denominator_rpc.sql`

---

# ФАЗА 4. Приоритет 3: Геймдизайн + Pages Analytics (3–4 дня)

Под-план: `2026-04-25-dashboard-gamedesign-polish.md`.

## Структурный перечень задач

### 4.1. Branch (~30%)
- Heatmap-overlay поверх `ScenarioFlowMap` — цветом узлов показывать traffic и drop-off rate (после Фазы 3).
- Coverage % как явный KPI.
- Drill-down по клику на узел → модалка с node metrics + link на `/admin/dropoff?node=...`.
- Mobile-адаптация (минимум «Открыть на десктопе» overlay).

### 4.2. Leaderboard (~40%)
- Title «Таблица лидеров» (русификация).
- Табы: «Неделя / Месяц / Всё время».
- Сегмент по сценарию, языку.
- Альтернативные сортировки: total_score / completion_time / S-rating count.
- Pagination (10 / 25 / 50 / 100).
- «Rising stars» секция (поднялись в топе за период).
- Убрать KPI «Игроков в топе» (всегда = 50).

### 4.3. Realtime (~30%)
- `LiveFeed`: `player_id.slice(0,8)` → `playerName` (fetch names batch).
- Click на строку → `/admin/player/{id}`.
- Event-type filter (multi-select: chip-tabs).
- Pause button.
- Browser notification / sound toggle при `dropped_off` / `game_completed` / новый лид.
- Перенести polling 5s → Supabase Realtime subscription на `game_events` (уже есть publication).

### 4.4. Pages Analytics detail migration (~50%)
- Переписать `app/(admin)/admin/pages/[slug]/page.tsx` как client-component с `PageHeader + admin-card + PeriodFilter`.
- Воскресить `/api/admin/pages/[slug]` endpoint (типизированный, через `page-queries`).
- CR per device на detail.
- Drill-down на UTM row.
- Conversion rate на detail.
- Сравнение страниц (если страниц станет >2).
- Аннотации на scroll funnel («где оффер», «где CTA») — из `pages_registry.annotations JSONB`.

---

# 🗓️ Timeline

| Фаза | Длительность | Блокирующие зависимости |
|---|---|---|
| Фаза 0 | 2–3 дня | — |
| Фаза 1 | 2–3 дня | Фаза 0 (ToastProvider, shared components) |
| Фаза 2 | 5–7 дней | Фаза 0 + 1, Bitrix webhook (уже в проде) |
| Фаза 3 | 5–7 дней | Фаза 0 (thresholds, nodeLabels) |
| Фаза 4 | 3–4 дня | Фазы 2 и 3 (Bitrix данные + retention RPC) |

**Общий оценочный срок: 17–24 рабочих дня.**

---

# 🚦 Риски

| Риск | Митигация |
|---|---|
| Bitrix webhook может не покрывать все изменения статуса сделки | Построить polling-sync раз в 15 мин как fallback (`app/api/cron/bitrix-sync`). |
| Миграции с переименованием RPC могут сломать прод | ADD-only: новые RPC = новые имена (`admin_get_overview_v3`), старые помечаем deprecated, переводим клиентов постепенно. |
| Heatmap в Branch — производительность при 500+ узлах | Кэш агрегатов на стороне БД (`admin_branch_heatmap_mv` materialized view, refresh раз в час). |
| Русификация может сломать deep-links из закладок | Sidebar — только labels, href не меняются. |

---

# 📋 Пре-чек перед стартом Фазы 0

- [ ] Работаем в отдельной ветке `feat/dashboard-audit-remediation` (создать после апрува плана).
- [ ] Создан worktree для параллельной работы (optional).
- [ ] Supabase MCP доступен (для `apply_migration`).
- [ ] `.env.local` содержит `ADMIN_PASSWORD`, `BITRIX_WEBHOOK_URL`.
- [ ] `npm run build` зелёный на main.

---

# 🏁 Execution Handoff

План сохранён: `docs/superpowers/plans/2026-04-22-dashboard-audit-remediation.md`.

**Рекомендация:** сначала пройти Фазы 0 + 1 целиком (детальные TDD-steps в этом файле). После DoD Фазы 1 — писать под-планы для Фаз 2/3/4 (`2026-04-23-dashboard-sales-core.md` и т. д.) с таким же уровнем детализации, запускать исполнение через `superpowers:subagent-driven-development`.

**Следующий шаг (жду решения):**

1. **Subagent-Driven** — диспатчу фреш-субагент на каждую задачу Фазы 0, ревью между задачами.
2. **Inline Execution** — выполняю задачи Фазы 0 прямо в этой сессии с чекпоинтами.
3. **Split into sub-plans first** — сначала пишу детальные под-планы для Фаз 2/3/4, только потом стартуем.

Какой вариант?
