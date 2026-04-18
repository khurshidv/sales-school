# Sales School Dashboard 2.0 — Phase 2 (Game Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three "Game" admin pages (Branch Analytics, Engagement, Drop-off Zones) — the priority A surface that lets the owner improve the game by seeing player paths, interest signals, and abandonment hotspots.

**Architecture:** Server Components fetch RPC data via `createAdminClient`, hand off to Client Components for interactive bits (tabs, filters). Pure transforms (`buildSankeyData`, `buildTreeData`, `buildGraphData`, `computeInterestIndex`) live in `lib/admin/<page>/` so they're TDD-tested independently from chart libraries. Visual chart components are thin wrappers over Nivo / recharts / react-force-graph-2d that take prepared data shapes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind 4 + `app/(admin)/admin.css`, Vitest 4 + jsdom + @testing-library/react. New libs: `@nivo/sankey` + `@nivo/core` (Sankey diagram), `recharts` (bar charts), `react-force-graph-2d` (force-directed map).

**Existing infrastructure (Phase 1, do NOT recreate):**
- RPCs deployed: `get_branch_flow`, `get_node_stats`, `get_dropoff_zones`, `get_engagement_index`, `get_player_journey`, `get_offer_funnel`
- `lib/supabase/admin.ts` exports `createAdminClient()`
- `lib/admin/types.ts` (legacy types), `lib/admin/queries.ts` (legacy queries), `lib/admin/formatters.ts`
- `components/admin/Sidebar.tsx` (nav links to `/admin/branch`, `/admin/engagement`, `/admin/dropoff`)
- `components/admin/{KpiCard,TopBar,InsightCard,PageHeader}.tsx`
- `app/(admin)/admin.css` — Premium-style theme with CSS variables (`--admin-text`, `--admin-card`, etc.)

**Branch:** `feature/dashboard-2-phase-1` (continuing — final Phase 2 commit will close out this branch; PR opens after merge).

**Prod safety:** Read-only RPC calls; no DB writes. The game itself isn't touched.

---

## File Structure

### New files (production)

```
lib/admin/
├── types-v2.ts                          # Phase 2 types (BranchFlowRow, NodeStat, etc.)
├── queries-v2.ts                        # Phase 2 RPC wrappers
├── branch/
│   ├── buildSankeyData.ts               # rows → @nivo/sankey shape
│   ├── buildTreeData.ts                 # rows → recursive tree
│   └── buildGraphData.ts                # rows → force-graph nodes/links
└── engagement/
    └── computeIndex.ts                  # RPC blob → 0-10 composite score

components/admin/
├── ScenarioSelector.tsx                 # shared filter
├── DayTabs.tsx                          # shared filter
├── PeriodFilter.tsx                     # shared filter (7d / 30d / 90d / all)
└── charts/
    ├── SankeyChart.tsx                  # @nivo/sankey wrapper
    ├── BranchTree.tsx                   # custom recursive tree
    ├── ScenarioMap.tsx                  # react-force-graph-2d wrapper (dynamic)
    ├── ThinkingBarChart.tsx             # recharts bar chart
    └── DropoffBars.tsx                  # custom CSS bars (no library)

app/(admin)/admin/
├── branch/
│   ├── page.tsx                         # Server: fetches data
│   └── BranchClient.tsx                 # Client: tabs Sankey/Tree/Map
├── engagement/
│   ├── page.tsx
│   └── EngagementClient.tsx
└── dropoff/
    ├── page.tsx
    └── DropoffClient.tsx
```

### New tests

```
lib/admin/__tests__/queries-v2.test.ts
lib/admin/branch/__tests__/buildSankeyData.test.ts
lib/admin/branch/__tests__/buildTreeData.test.ts
lib/admin/branch/__tests__/buildGraphData.test.ts
lib/admin/engagement/__tests__/computeIndex.test.ts
```

### Why this decomposition
- Pure transforms (`build*`, `computeIndex`) are easy to TDD because they're inputs-to-outputs with no I/O. They'd be impossible to test inside chart components.
- Chart components take already-shaped data — they're just JSX + library wiring, easy to verify visually.
- One server file + one client file per page keeps SSR data fetch cleanly separated from interactive state.
- Shared filters (Scenario / Day / Period) are factored to `components/admin/` because all three pages use them.

---

## Task 1: Install Phase 2 chart dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install libraries**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npm install @nivo/sankey@^0.99.0 @nivo/core@^0.99.0 recharts@^2.15.0 react-force-graph-2d@^1.27.0
```

Expected: success.

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: success, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore: add chart libs (@nivo/sankey, recharts, react-force-graph-2d) for Phase 2

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Define Phase 2 types

**Files:**
- Create: `lib/admin/types-v2.ts`

- [ ] **Step 1: Create the file**

```typescript
// Types for Phase 2 admin pages (Branch / Engagement / Drop-off).
// Mirrored on Postgres RPC return shapes from migration 008.

// ---- Branch Analytics ----

export interface BranchFlowRow {
  from_node: string;
  to_node: string;
  flow_count: number;
}

export interface NodeStat {
  node_id: string;
  entered_count: number;
  avg_thinking_time_ms: number;
  exit_count: number;
}

// Shape consumed by @nivo/sankey
export interface SankeyData {
  nodes: Array<{ id: string }>;
  links: Array<{ source: string; target: string; value: number }>;
}

export interface TreeNode {
  id: string;
  count: number;
  children: TreeNode[];
}

// Shape consumed by react-force-graph-2d
export interface GraphData {
  nodes: Array<{ id: string; size: number; group: 'success' | 'warn' | 'fail' | 'neutral' }>;
  links: Array<{ source: string; target: string; value: number }>;
}

// ---- Drop-off Zones ----

export interface DropoffRow {
  node_id: string;
  day_id: string;
  dropoff_count: number;
}

// ---- Engagement ----

export interface EngagementBlob {
  completion_rate: number;     // 0..1
  avg_thinking_time_ms: number | null;
  replay_rate: number;         // 0..N (extra completions per player)
}

export interface EngagementIndex {
  score: number;               // 0..10
  components: {
    completion: number;        // 0..10 (sub-score)
    thinking: number;          // 0..10
    replay: number;            // 0..10
  };
  raw: EngagementBlob;
}

// ---- Filters ----

export type Period = '7d' | '30d' | '90d' | 'all';
export interface DateRange { from: string | null; to: string | null }

export const SCENARIOS = [
  { id: 'car-dealership', label: 'Автодилер' },
] as const;

export const DAYS = [
  { id: 'day1', label: 'День 1' },
  { id: 'day2', label: 'День 2' },
  { id: 'day3', label: 'День 3' },
] as const;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/types-v2.ts
git commit -m "$(cat <<'EOF'
feat(admin): types for Phase 2 (branch/engagement/dropoff)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Phase 2 RPC wrappers

**Files:**
- Create: `lib/admin/queries-v2.ts`
- Create: `lib/admin/__tests__/queries-v2.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// lib/admin/__tests__/queries-v2.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mockRpc }),
}));

import {
  getBranchFlow,
  getNodeStats,
  getDropoffZones,
  getEngagementIndexRaw,
  periodToRange,
} from '@/lib/admin/queries-v2';

describe('queries-v2', () => {
  beforeEach(() => { mockRpc.mockReset(); });

  it('getBranchFlow forwards args and returns rows', async () => {
    mockRpc.mockResolvedValue({ data: [{ from_node: 'a', to_node: 'b', flow_count: 5 }], error: null });
    const rows = await getBranchFlow({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(mockRpc).toHaveBeenCalledWith('get_branch_flow', {
      p_scenario_id: 's', p_day_id: 'd1', p_from: null, p_to: null,
    });
    expect(rows).toEqual([{ from_node: 'a', to_node: 'b', flow_count: 5 }]);
  });

  it('getNodeStats coerces avg_thinking_time_ms numeric to number', async () => {
    mockRpc.mockResolvedValue({
      data: [{ node_id: 'n', entered_count: '3', avg_thinking_time_ms: '4200.5', exit_count: '2' }],
      error: null,
    });
    const rows = await getNodeStats({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(rows[0].entered_count).toBe(3);
    expect(rows[0].avg_thinking_time_ms).toBeCloseTo(4200.5);
    expect(rows[0].exit_count).toBe(2);
  });

  it('getDropoffZones returns empty array when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const rows = await getDropoffZones({ scenarioId: 's', from: null, to: null });
    expect(rows).toEqual([]);
  });

  it('getEngagementIndexRaw normalizes nullable numerics', async () => {
    mockRpc.mockResolvedValue({
      data: { completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 },
      error: null,
    });
    const blob = await getEngagementIndexRaw({ scenarioId: 's', from: null, to: null });
    expect(blob).toEqual({ completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 });
  });

  it('periodToRange("7d") returns from = now - 7d, to = null', () => {
    const now = new Date('2026-04-17T12:00:00Z');
    const r = periodToRange('7d', now);
    expect(r.from).toBe('2026-04-10T12:00:00.000Z');
    expect(r.to).toBeNull();
  });

  it('periodToRange("all") returns nulls', () => {
    expect(periodToRange('all', new Date())).toEqual({ from: null, to: null });
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

- [ ] **Step 3: Implement `lib/admin/queries-v2.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import type { BranchFlowRow, NodeStat, DropoffRow, EngagementBlob, Period, DateRange } from './types-v2';

interface ScenarioRange {
  scenarioId: string;
  from: string | null;
  to: string | null;
}
interface ScenarioDayRange extends ScenarioRange {
  dayId: string;
}

// -- branch / nodes -----------------------------------------------------------

export async function getBranchFlow(args: ScenarioDayRange): Promise<BranchFlowRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_branch_flow', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_branch_flow', error.message);
    return [];
  }
  return (data ?? []).map((r: { from_node: string; to_node: string; flow_count: string | number }) => ({
    from_node: r.from_node,
    to_node: r.to_node,
    flow_count: Number(r.flow_count),
  }));
}

export async function getNodeStats(args: ScenarioDayRange): Promise<NodeStat[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_node_stats', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_node_stats', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    node_id: string;
    entered_count: string | number;
    avg_thinking_time_ms: string | number | null;
    exit_count: string | number;
  }) => ({
    node_id: r.node_id,
    entered_count: Number(r.entered_count),
    avg_thinking_time_ms: r.avg_thinking_time_ms != null ? Number(r.avg_thinking_time_ms) : 0,
    exit_count: Number(r.exit_count),
  }));
}

// -- drop-off -----------------------------------------------------------------

export async function getDropoffZones(args: ScenarioRange): Promise<DropoffRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_dropoff_zones', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_dropoff_zones', error.message);
    return [];
  }
  return (data ?? []).map((r: { node_id: string; day_id: string; dropoff_count: string | number }) => ({
    node_id: r.node_id,
    day_id: r.day_id,
    dropoff_count: Number(r.dropoff_count),
  }));
}

// -- engagement ---------------------------------------------------------------

export async function getEngagementIndexRaw(args: ScenarioRange): Promise<EngagementBlob> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_engagement_index', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_engagement_index', error.message);
    return { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
  }
  // RPC returns json — Supabase auto-parses to object
  const blob = data as EngagementBlob | null;
  return blob ?? { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
}

// -- filters ------------------------------------------------------------------

export function periodToRange(period: Period, now: Date = new Date()): DateRange {
  if (period === 'all') return { from: null, to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run lib/admin/__tests__/queries-v2.test.ts
```

Expected: 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/queries-v2.ts lib/admin/__tests__/queries-v2.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): Phase 2 RPC wrappers (branch/nodes/dropoff/engagement) + period util

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `buildSankeyData` transform

**Files:**
- Create: `lib/admin/branch/buildSankeyData.ts`
- Create: `lib/admin/branch/__tests__/buildSankeyData.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildSankeyData } from '@/lib/admin/branch/buildSankeyData';

describe('buildSankeyData', () => {
  it('returns empty data for empty input', () => {
    expect(buildSankeyData([])).toEqual({ nodes: [], links: [] });
  });

  it('produces unique nodes and one link per row', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'b', flow_count: 5 },
      { from_node: 'a', to_node: 'c', flow_count: 3 },
      { from_node: 'b', to_node: 'd', flow_count: 5 },
    ]);
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(data.links).toEqual([
      { source: 'a', target: 'b', value: 5 },
      { source: 'a', target: 'c', value: 3 },
      { source: 'b', target: 'd', value: 5 },
    ]);
  });

  it('drops self-loops to prevent Sankey crashes', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'a', flow_count: 1 },
      { from_node: 'a', to_node: 'b', flow_count: 2 },
    ]);
    expect(data.links).toEqual([{ source: 'a', target: 'b', value: 2 }]);
    expect(data.nodes).toEqual([{ id: 'a' }, { id: 'b' }]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/branch/__tests__/buildSankeyData.test.ts
```

- [ ] **Step 3: Implement `lib/admin/branch/buildSankeyData.ts`**

```typescript
import type { BranchFlowRow, SankeyData } from '@/lib/admin/types-v2';

/**
 * Convert RPC rows into the shape @nivo/sankey expects.
 * Self-loops are dropped because Sankey diagrams can't visualize them
 * (they would crash the layout solver).
 */
export function buildSankeyData(rows: BranchFlowRow[]): SankeyData {
  const nodeIds = new Set<string>();
  const links: SankeyData['links'] = [];

  for (const row of rows) {
    if (row.from_node === row.to_node) continue;
    nodeIds.add(row.from_node);
    nodeIds.add(row.to_node);
    links.push({ source: row.from_node, target: row.to_node, value: row.flow_count });
  }

  return {
    nodes: Array.from(nodeIds).map((id) => ({ id })),
    links,
  };
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/branch/__tests__/buildSankeyData.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/branch/buildSankeyData.ts lib/admin/branch/__tests__/buildSankeyData.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buildSankeyData — RPC rows → @nivo/sankey shape

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `buildTreeData` transform

**Files:**
- Create: `lib/admin/branch/buildTreeData.ts`
- Create: `lib/admin/branch/__tests__/buildTreeData.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildTreeData } from '@/lib/admin/branch/buildTreeData';

describe('buildTreeData', () => {
  it('returns empty array for empty input', () => {
    expect(buildTreeData([], 'root')).toEqual([]);
  });

  it('builds a 2-level tree from a single root', () => {
    const tree = buildTreeData(
      [
        { from_node: 'root', to_node: 'a', flow_count: 10 },
        { from_node: 'root', to_node: 'b', flow_count: 5 },
        { from_node: 'a', to_node: 'leaf', flow_count: 7 },
      ],
      'root',
    );
    expect(tree).toEqual([
      {
        id: 'a', count: 10, children: [
          { id: 'leaf', count: 7, children: [] },
        ],
      },
      { id: 'b', count: 5, children: [] },
    ]);
  });

  it('caps recursion at maxDepth to avoid cycles', () => {
    const tree = buildTreeData(
      [
        { from_node: 'a', to_node: 'b', flow_count: 1 },
        { from_node: 'b', to_node: 'a', flow_count: 1 }, // cycle
      ],
      'a',
      2,
    );
    // a → b → a → (depth cap reached, no further children)
    expect(tree).toEqual([
      { id: 'b', count: 1, children: [{ id: 'a', count: 1, children: [] }] },
    ]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/branch/__tests__/buildTreeData.test.ts
```

- [ ] **Step 3: Implement `lib/admin/branch/buildTreeData.ts`**

```typescript
import type { BranchFlowRow, TreeNode } from '@/lib/admin/types-v2';

/**
 * Build a children-tree starting from `rootId`. Depth-bounded so that
 * any cycles in the flow graph (e.g. back-navigation) cannot blow up.
 */
export function buildTreeData(
  rows: BranchFlowRow[],
  rootId: string,
  maxDepth = 8,
): TreeNode[] {
  // Group by from_node for O(1) child lookups
  const childrenByParent = new Map<string, BranchFlowRow[]>();
  for (const r of rows) {
    if (!childrenByParent.has(r.from_node)) childrenByParent.set(r.from_node, []);
    childrenByParent.get(r.from_node)!.push(r);
  }

  function expand(parentId: string, depth: number): TreeNode[] {
    if (depth >= maxDepth) return [];
    const direct = childrenByParent.get(parentId) ?? [];
    return direct.map((edge) => ({
      id: edge.to_node,
      count: edge.flow_count,
      children: expand(edge.to_node, depth + 1),
    }));
  }

  return expand(rootId, 0);
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/branch/__tests__/buildTreeData.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/branch/buildTreeData.ts lib/admin/branch/__tests__/buildTreeData.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buildTreeData — depth-bounded tree from branch rows

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `buildGraphData` transform

**Files:**
- Create: `lib/admin/branch/buildGraphData.ts`
- Create: `lib/admin/branch/__tests__/buildGraphData.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildGraphData } from '@/lib/admin/branch/buildGraphData';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';

describe('buildGraphData', () => {
  it('produces a node per stat and a link per flow', () => {
    const flows: BranchFlowRow[] = [
      { from_node: 'a', to_node: 'b', flow_count: 5 },
    ];
    const stats: NodeStat[] = [
      { node_id: 'a', entered_count: 10, avg_thinking_time_ms: 4000, exit_count: 8 },
      { node_id: 'b', entered_count: 5, avg_thinking_time_ms: 6000, exit_count: 5 },
    ];
    const dropoffs: DropoffRow[] = [];
    const g = buildGraphData(flows, stats, dropoffs);
    expect(g.nodes).toEqual([
      { id: 'a', size: 10, group: 'success' },
      { id: 'b', size: 5, group: 'success' },
    ]);
    expect(g.links).toEqual([{ source: 'a', target: 'b', value: 5 }]);
  });

  it('marks nodes appearing in dropoffs as "fail"', () => {
    const g = buildGraphData(
      [],
      [{ node_id: 'a', entered_count: 10, avg_thinking_time_ms: 0, exit_count: 0 }],
      [{ node_id: 'a', day_id: 'd1', dropoff_count: 6 }],
    );
    expect(g.nodes).toEqual([{ id: 'a', size: 10, group: 'fail' }]);
  });

  it('marks nodes with high thinking time as "warn"', () => {
    const g = buildGraphData(
      [],
      [{ node_id: 'a', entered_count: 10, avg_thinking_time_ms: 20_000, exit_count: 9 }],
      [],
    );
    expect(g.nodes[0].group).toBe('warn');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/branch/__tests__/buildGraphData.test.ts
```

- [ ] **Step 3: Implement `lib/admin/branch/buildGraphData.ts`**

```typescript
import type { BranchFlowRow, NodeStat, DropoffRow, GraphData } from '@/lib/admin/types-v2';

const HIGH_THINKING_MS = 15_000;

/**
 * Build force-graph data with semantic node groups:
 *   - fail    : node appears in drop-off zones list
 *   - warn    : avg thinking time above HIGH_THINKING_MS (likely confusing)
 *   - success : visited and most players moved on
 *   - neutral : no entries at all (orphan node — usually data gap)
 */
export function buildGraphData(
  flows: BranchFlowRow[],
  stats: NodeStat[],
  dropoffs: DropoffRow[],
): GraphData {
  const dropoffIds = new Set(dropoffs.map((d) => d.node_id));

  const nodes: GraphData['nodes'] = stats.map((s) => {
    let group: GraphData['nodes'][number]['group'];
    if (dropoffIds.has(s.node_id)) group = 'fail';
    else if (s.avg_thinking_time_ms > HIGH_THINKING_MS) group = 'warn';
    else if (s.entered_count > 0) group = 'success';
    else group = 'neutral';
    return { id: s.node_id, size: s.entered_count, group };
  });

  const links: GraphData['links'] = flows.map((f) => ({
    source: f.from_node,
    target: f.to_node,
    value: f.flow_count,
  }));

  return { nodes, links };
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/branch/__tests__/buildGraphData.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/branch/buildGraphData.ts lib/admin/branch/__tests__/buildGraphData.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): buildGraphData — typed graph nodes/links with success/warn/fail groups

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `computeInterestIndex` transform

**Files:**
- Create: `lib/admin/engagement/computeIndex.ts`
- Create: `lib/admin/engagement/__tests__/computeIndex.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';

describe('computeInterestIndex', () => {
  it('returns 0 across the board for empty data', () => {
    const idx = computeInterestIndex({ completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 });
    expect(idx.score).toBe(0);
    expect(idx.components).toEqual({ completion: 0, thinking: 0, replay: 0 });
  });

  it('100% completion + ideal thinking + healthy replay → 10/10', () => {
    const idx = computeInterestIndex({
      completion_rate: 1,
      avg_thinking_time_ms: 8_000, // sweet spot 5-15s
      replay_rate: 0.2,            // 20% replay = healthy
    });
    expect(idx.components.completion).toBe(10);
    expect(idx.components.thinking).toBe(10);
    expect(idx.components.replay).toBe(10);
    expect(idx.score).toBe(10);
  });

  it('penalizes thinking time too short (<2s)', () => {
    const idx = computeInterestIndex({
      completion_rate: 1, avg_thinking_time_ms: 1_000, replay_rate: 0.2,
    });
    expect(idx.components.thinking).toBeLessThan(5);
  });

  it('penalizes thinking time too long (>30s)', () => {
    const idx = computeInterestIndex({
      completion_rate: 1, avg_thinking_time_ms: 60_000, replay_rate: 0.2,
    });
    expect(idx.components.thinking).toBeLessThan(5);
  });

  it('weights are 50% completion / 30% thinking / 20% replay', () => {
    const idx = computeInterestIndex({
      completion_rate: 0.6,        // → 6
      avg_thinking_time_ms: 8_000, // → 10
      replay_rate: 0,              // → 0
    });
    // 6*0.5 + 10*0.3 + 0*0.2 = 3 + 3 + 0 = 6
    expect(idx.score).toBeCloseTo(6.0, 1);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run lib/admin/engagement/__tests__/computeIndex.test.ts
```

- [ ] **Step 3: Implement `lib/admin/engagement/computeIndex.ts`**

```typescript
import type { EngagementBlob, EngagementIndex } from '@/lib/admin/types-v2';

/**
 * Composite Interest Index, 0..10, with three weighted components:
 *   - completion (50%) : % of started days that get completed
 *   - thinking   (30%) : how close to the 5-15s sweet spot the avg choice time is
 *   - replay     (20%) : 0.1-0.3 replay rate is healthy; 0 means no engagement,
 *                        >0.5 means players grind and might be stuck
 *
 * The thinking sub-score uses a piecewise function:
 *   <2s         → 0   (clicks too fast, ignores text)
 *   2-5s        → linear ramp 0..10
 *   5-15s       → 10  (sweet spot)
 *   15-30s      → linear decay 10..5
 *   >30s        → 0   (something is broken / players stuck)
 */
export function computeInterestIndex(blob: EngagementBlob): EngagementIndex {
  const completion = clamp(blob.completion_rate * 10, 0, 10);

  const t = blob.avg_thinking_time_ms ?? 0;
  let thinking: number;
  if (t === 0) thinking = 0;
  else if (t < 2_000) thinking = 0;
  else if (t < 5_000) thinking = ((t - 2_000) / 3_000) * 10;
  else if (t <= 15_000) thinking = 10;
  else if (t <= 30_000) thinking = 10 - ((t - 15_000) / 15_000) * 5;
  else thinking = 0;

  const r = blob.replay_rate;
  let replay: number;
  if (r === 0) replay = 0;
  else if (r <= 0.3) replay = (r / 0.3) * 10;
  else if (r <= 1) replay = 10 - ((r - 0.3) / 0.7) * 5;
  else replay = 5; // capped — could indicate stuck players, neutral

  const score = completion * 0.5 + thinking * 0.3 + replay * 0.2;

  return {
    score: round1(score),
    components: { completion: round1(completion), thinking: round1(thinking), replay: round1(replay) },
    raw: blob,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run lib/admin/engagement/__tests__/computeIndex.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/admin/engagement/computeIndex.ts lib/admin/engagement/__tests__/computeIndex.test.ts
git commit -m "$(cat <<'EOF'
feat(admin): composite Interest Index (0-10) with completion/thinking/replay weights

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Shared filter components

**Files:**
- Create: `components/admin/ScenarioSelector.tsx`
- Create: `components/admin/DayTabs.tsx`
- Create: `components/admin/PeriodFilter.tsx`

- [ ] **Step 1: ScenarioSelector**

```typescript
'use client';

import { SCENARIOS } from '@/lib/admin/types-v2';

export interface ScenarioSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export default function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="admin-btn"
      style={{ paddingRight: 28 }}
    >
      {SCENARIOS.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: DayTabs**

```typescript
'use client';

import { DAYS } from '@/lib/admin/types-v2';

export interface DayTabsProps {
  value: string;
  onChange: (id: string) => void;
}

export default function DayTabs({ value, onChange }: DayTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {DAYS.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          className={value === d.id ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: PeriodFilter**

```typescript
'use client';

import type { Period } from '@/lib/admin/types-v2';

const OPTIONS: Array<{ id: Period; label: string }> = [
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: '90d', label: '90 дней' },
  { id: 'all', label: 'Всё время' },
];

export interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Period)}
      className="admin-btn"
      style={{ paddingRight: 28 }}
    >
      {OPTIONS.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/ScenarioSelector.tsx components/admin/DayTabs.tsx components/admin/PeriodFilter.tsx
git commit -m "$(cat <<'EOF'
feat(admin): shared filters — ScenarioSelector, DayTabs, PeriodFilter

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `SankeyChart` wrapper (Nivo)

**Files:**
- Create: `components/admin/charts/SankeyChart.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import type { SankeyData } from '@/lib/admin/types-v2';

export interface SankeyChartProps {
  data: SankeyData;
  height?: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#a78bfa', '#f472b6'];

/**
 * @nivo/sankey wrapper. Empty-data guard renders a friendly placeholder
 * because Nivo throws if you hand it `nodes: []` while rendering.
 */
export default function SankeyChart({ data, height = 480 }: SankeyChartProps) {
  if (data.nodes.length === 0) {
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
      <ResponsiveSankey
        data={data}
        margin={{ top: 16, right: 140, bottom: 16, left: 60 }}
        align="justify"
        colors={COLORS}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={8}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/SankeyChart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): SankeyChart — @nivo/sankey wrapper with empty-state placeholder

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `BranchTree` component

**Files:**
- Create: `components/admin/charts/BranchTree.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { TreeNode } from '@/lib/admin/types-v2';

export interface BranchTreeProps {
  nodes: TreeNode[];
  total: number; // total flow at the root, used to compute % per branch
}

interface RowProps {
  node: TreeNode;
  total: number;
  depth: number;
}

function Row({ node, total, depth }: RowProps) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const pct = total > 0 ? (node.count / total) * 100 : 0;

  const tone = pct > 50 ? 'success' : pct > 20 ? 'warn' : 'fail';
  const bg = tone === 'success' ? '#dcfce7' : tone === 'warn' ? '#fef3c7' : '#fee2e2';
  const border = tone === 'success' ? '#10b981' : tone === 'warn' ? '#f59e0b' : '#ef4444';
  const color = tone === 'success' ? '#065f46' : tone === 'warn' ? '#92400e' : '#991b1b';

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', background: bg, color,
          borderLeft: `3px solid ${border}`, borderRadius: 6,
          fontSize: 12, marginBottom: 3,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
      >
        {hasChildren ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span style={{ width: 12 }} />}
        <span style={{ flex: 1, fontFamily: 'ui-monospace, monospace' }}>{node.id}</span>
        <span style={{ fontWeight: 700 }}>{node.count}</span>
        <span style={{ opacity: 0.7, minWidth: 50, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
      </div>
      {open && node.children.map((c) => (
        <Row key={`${depth}-${c.id}`} node={c} total={node.count} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function BranchTree({ nodes, total }: BranchTreeProps) {
  if (nodes.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div>
      {nodes.map((n) => <Row key={n.id} node={n} total={total} depth={0} />)}
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/BranchTree.tsx
git commit -m "$(cat <<'EOF'
feat(admin): BranchTree — recursive expandable tree with % per branch

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `ScenarioMap` component (force-directed, dynamic import)

**Files:**
- Create: `components/admin/charts/ScenarioMap.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { GraphData } from '@/lib/admin/types-v2';

// react-force-graph-2d uses HTML5 Canvas + window measurements. Import dynamically
// to skip SSR — Next 16's server pass would otherwise crash on `window`.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const GROUP_COLOR: Record<GraphData['nodes'][number]['group'], string> = {
  success: '#10b981',
  warn:    '#f59e0b',
  fail:    '#ef4444',
  neutral: '#94a3b8',
};

export interface ScenarioMapProps {
  data: GraphData;
  height?: number;
}

export default function ScenarioMap({ data, height = 520 }: ScenarioMapProps) {
  // Pre-compute size for visual scaling
  const maxSize = useMemo(
    () => Math.max(1, ...data.nodes.map((n) => n.size)),
    [data.nodes],
  );

  if (data.nodes.length === 0) {
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
    <div style={{ height, background: '#fafaff', borderRadius: 12 }}>
      <ForceGraph2D
        graphData={data}
        nodeRelSize={6}
        nodeVal={(n) => 4 + ((n as { size: number }).size / maxSize) * 14}
        nodeColor={(n) => GROUP_COLOR[(n as { group: GraphData['nodes'][number]['group'] }).group]}
        linkColor={() => 'rgba(99, 102, 241, 0.25)'}
        linkWidth={(l) => Math.max(1, Math.log10(((l as { value: number }).value) + 1))}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        nodeLabel={(n) => `${(n as { id: string }).id} · ${(n as { size: number }).size}`}
        cooldownTicks={120}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/ScenarioMap.tsx
git commit -m "$(cat <<'EOF'
feat(admin): ScenarioMap — react-force-graph-2d wrapper (dynamic import)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `ThinkingBarChart` component (recharts)

**Files:**
- Create: `components/admin/charts/ThinkingBarChart.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { NodeStat } from '@/lib/admin/types-v2';

export interface ThinkingBarChartProps {
  stats: NodeStat[];
  height?: number;
}

const SUSPECT_MS = 15_000;
const ALARMING_MS = 25_000;

export default function ThinkingBarChart({ stats, height = 280 }: ThinkingBarChartProps) {
  if (stats.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  const data = stats
    .filter((s) => s.avg_thinking_time_ms > 0)
    .sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)
    .slice(0, 20)
    .map((s) => ({ node: s.node_id, value: Math.round(s.avg_thinking_time_ms / 1000) }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="node" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10 }} unit="с" />
          <Tooltip formatter={(v: number) => [`${v}с`, 'Среднее время']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => {
              const ms = d.value * 1000;
              const fill = ms >= ALARMING_MS ? '#ef4444' : ms >= SUSPECT_MS ? '#f59e0b' : '#10b981';
              return <Cell key={i} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/charts/ThinkingBarChart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): ThinkingBarChart — top-20 nodes by avg thinking time, color-coded

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: `DropoffBars` component

**Files:**
- Create: `components/admin/charts/DropoffBars.tsx`

- [ ] **Step 1: Implement**

```typescript
'use client';

import type { DropoffRow } from '@/lib/admin/types-v2';

export interface DropoffBarsProps {
  rows: DropoffRow[];
}

const COLORS = ['#ef4444', '#f59e0b', '#fb923c'];

/**
 * Custom CSS bars (no chart library) — list view of top drop-off zones.
 * Bar width = proportional to top row's dropoff_count.
 */
export default function DropoffBars({ rows }: DropoffBarsProps) {
  if (rows.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет drop-off за выбранный период — игроки доходят до конца.
      </div>
    );
  }
  const max = Math.max(...rows.map((r) => r.dropoff_count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => {
        const widthPct = (r.dropoff_count / max) * 100;
        const color = COLORS[Math.min(i, COLORS.length - 1)];
        return (
          <div key={`${r.node_id}-${r.day_id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 4 }}>
                {r.day_id} · <span style={{ fontFamily: 'ui-monospace, monospace' }}>{r.node_id}</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${widthPct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color, minWidth: 40, textAlign: 'right' }}>
              {r.dropoff_count}
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
git add components/admin/charts/DropoffBars.tsx
git commit -m "$(cat <<'EOF'
feat(admin): DropoffBars — CSS-only horizontal bars for top drop-off zones

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: `/admin/branch` page

**Files:**
- Create: `app/(admin)/admin/branch/page.tsx`
- Create: `app/(admin)/admin/branch/BranchClient.tsx`

- [ ] **Step 1: Server page (`page.tsx`)**

```typescript
import { Suspense } from 'react';
import BranchClient from './BranchClient';

export const revalidate = 60;
export const metadata = { title: 'Branch Analytics — Sales School' };

export default function BranchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <BranchClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client (`BranchClient.tsx`)**

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import DayTabs from '@/components/admin/DayTabs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import InsightCard from '@/components/admin/InsightCard';
import KpiCard from '@/components/admin/KpiCard';
import SankeyChart from '@/components/admin/charts/SankeyChart';
import BranchTree from '@/components/admin/charts/BranchTree';
import ScenarioMap from '@/components/admin/charts/ScenarioMap';
import { GitBranch, Network, TreePine } from 'lucide-react';
import { getBranchFlow, getNodeStats, getDropoffZones, periodToRange } from '@/lib/admin/queries-v2';
import { buildSankeyData } from '@/lib/admin/branch/buildSankeyData';
import { buildTreeData } from '@/lib/admin/branch/buildTreeData';
import { buildGraphData } from '@/lib/admin/branch/buildGraphData';
import type { BranchFlowRow, NodeStat, DropoffRow, Period } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';

type Tab = 'sankey' | 'tree' | 'map';

export default function BranchClient() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [period, setPeriod] = useState<Period>('30d');
  const [tab, setTab] = useState<Tab>('sankey');

  const [flows, setFlows] = useState<BranchFlowRow[]>([]);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    Promise.all([
      getBranchFlow({ scenarioId, dayId, ...range }),
      getNodeStats({ scenarioId, dayId, ...range }),
      getDropoffZones({ scenarioId, ...range }),
    ]).then(([f, s, d]) => {
      if (cancelled) return;
      setFlows(f); setStats(s); setDropoffs(d); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period]);

  const sankey = useMemo(() => buildSankeyData(flows), [flows]);
  const graph = useMemo(() => buildGraphData(flows, stats, dropoffs), [flows, stats, dropoffs]);

  const rootId = useMemo(() => {
    // Heuristic: root = node that appears as `from` but never as `to`.
    const targets = new Set(flows.map((f) => f.to_node));
    const sources = flows.map((f) => f.from_node);
    return sources.find((s) => !targets.has(s)) ?? flows[0]?.from_node ?? '';
  }, [flows]);
  const tree = useMemo(() => buildTreeData(flows, rootId), [flows, rootId]);
  const rootCount = useMemo(() => {
    return flows.filter((f) => f.from_node === rootId).reduce((acc, f) => acc + f.flow_count, 0);
  }, [flows, rootId]);

  const totalFlows = flows.reduce((acc, f) => acc + f.flow_count, 0);
  const topNode = stats[0];
  const slowNode = [...stats].sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)[0];

  return (
    <div>
      <PageHeader
        title="Branch Analytics"
        subtitle="Как игроки проходят сценарий — главные пути, проблемные узлы, выпадения."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <DayTabs value={dayId} onChange={setDayId} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setTab('sankey')} className={tab === 'sankey' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <GitBranch size={14} /> Поток
          </button>
          <button onClick={() => setTab('tree')} className={tab === 'tree' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <TreePine size={14} /> Дерево
          </button>
          <button onClick={() => setTab('map')} className={tab === 'map' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <Network size={14} /> Карта
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего переходов" value={totalFlows.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Узлов задействовано" value={stats.length} accent="pink" />
        <KpiCard label="Drop-off узлов" value={dropoffs.length} accent="orange" />
      </div>

      {slowNode && slowNode.avg_thinking_time_ms > 15_000 && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="warning"
            title="Медленный узел"
            body={
              <>
                Узел <code>{slowNode.node_id}</code> — игроки задумываются{' '}
                {(slowNode.avg_thinking_time_ms / 1000).toFixed(1)}с в среднем. Возможно, формулировка непонятна.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        {loading ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем данные…
          </div>
        ) : tab === 'sankey' ? (
          <SankeyChart data={sankey} />
        ) : tab === 'tree' ? (
          <BranchTree nodes={tree} total={rootCount} />
        ) : (
          <ScenarioMap data={graph} />
        )}
      </div>

      {topNode && (
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 12 }}>
          Топ узел по посещаемости: <strong>{topNode.node_id}</strong> ({topNode.entered_count} визитов)
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/branch/page.tsx" "app/(admin)/admin/branch/BranchClient.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/branch — Branch Analytics page with Sankey/Tree/Map tabs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: `/admin/engagement` page

**Files:**
- Create: `app/(admin)/admin/engagement/page.tsx`
- Create: `app/(admin)/admin/engagement/EngagementClient.tsx`

- [ ] **Step 1: Server page**

```typescript
import { Suspense } from 'react';
import EngagementClient from './EngagementClient';

export const revalidate = 60;
export const metadata = { title: 'Engagement — Sales School' };

export default function EngagementPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <EngagementClient />
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
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DayTabs from '@/components/admin/DayTabs';
import ThinkingBarChart from '@/components/admin/charts/ThinkingBarChart';
import { getEngagementIndexRaw, getNodeStats, periodToRange } from '@/lib/admin/queries-v2';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';
import type { EngagementBlob, NodeStat, Period } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';

export default function EngagementClient() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [period, setPeriod] = useState<Period>('30d');

  const [blob, setBlob] = useState<EngagementBlob | null>(null);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    Promise.all([
      getEngagementIndexRaw({ scenarioId, ...range }),
      getNodeStats({ scenarioId, dayId, ...range }),
    ]).then(([b, s]) => {
      if (cancelled) return;
      setBlob(b); setStats(s); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period]);

  const idx = useMemo(() => blob ? computeInterestIndex(blob) : null, [blob]);

  const slowNodes = useMemo(
    () => stats.filter((s) => s.avg_thinking_time_ms > 15_000).slice(0, 3),
    [stats],
  );

  return (
    <div>
      <PageHeader
        title="Engagement"
        subtitle="Насколько игра интересна — composite Interest Index и компоненты вовлечённости."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard
          label="Interest Index"
          value={idx ? `${idx.score.toFixed(1)}/10` : '—'}
          accent="violet"
          hint="composite: completion + thinking + replay"
        />
        <KpiCard
          label="Completion rate"
          value={blob ? `${(blob.completion_rate * 100).toFixed(0)}%` : '—'}
          accent="green"
          hint="доля начавших, кто завершил день"
        />
        <KpiCard
          label="Avg thinking time"
          value={blob?.avg_thinking_time_ms ? `${(blob.avg_thinking_time_ms / 1000).toFixed(1)}с` : '—'}
          accent="pink"
          hint="оптимально 5-15 секунд"
        />
        <KpiCard
          label="Replay rate"
          value={blob ? `${(blob.replay_rate * 100).toFixed(0)}%` : '—'}
          accent="orange"
          hint="0.1-0.3 = здоровая повторяемость"
        />
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>День:</span>
        <DayTabs value={dayId} onChange={setDayId} />
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
          Среднее время на выбор по узлам ({dayId})
        </div>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем…
          </div>
        ) : (
          <ThinkingBarChart stats={stats} />
        )}
      </div>

      {slowNodes.length > 0 && (
        <InsightCard
          tone="warning"
          title={`${slowNodes.length} «медленных» узлов`}
          body={
            <>
              Игроки задумываются &gt;15с на: {slowNodes.map((n) => <code key={n.node_id} style={{ marginRight: 6 }}>{n.node_id}</code>)}
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
git add "app/(admin)/admin/engagement/page.tsx" "app/(admin)/admin/engagement/EngagementClient.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/engagement — Interest Index + thinking-time bar chart

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: `/admin/dropoff` page

**Files:**
- Create: `app/(admin)/admin/dropoff/page.tsx`
- Create: `app/(admin)/admin/dropoff/DropoffClient.tsx`

- [ ] **Step 1: Server page**

```typescript
import { Suspense } from 'react';
import DropoffClient from './DropoffClient';

export const revalidate = 60;
export const metadata = { title: 'Drop-off Zones — Sales School' };

export default function DropoffPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <DropoffClient />
    </Suspense>
  );
}
```

- [ ] **Step 2: Client**

```typescript
'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import DropoffBars from '@/components/admin/charts/DropoffBars';
import { getDropoffZones, periodToRange } from '@/lib/admin/queries-v2';
import type { DropoffRow, Period } from '@/lib/admin/types-v2';
import { SCENARIOS } from '@/lib/admin/types-v2';

export default function DropoffClient() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [period, setPeriod] = useState<Period>('30d');
  const [rows, setRows] = useState<DropoffRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    getDropoffZones({ scenarioId, ...range }).then((r) => {
      if (cancelled) return;
      setRows(r); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, period]);

  const total = rows.reduce((acc, r) => acc + r.dropoff_count, 0);
  const top = rows[0];

  // Group by day for per-day breakdown
  const byDay = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.day_id] = (acc[r.day_id] ?? 0) + r.dropoff_count;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Drop-off Zones"
        subtitle="Где конкретно игроки закрывают вкладку, не закончив день."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего drop-off" value={total} accent="orange" />
        <KpiCard label="Уникальных узлов" value={rows.length} accent="pink" />
        <KpiCard
          label="Топ узел"
          value={top ? top.node_id : '—'}
          hint={top ? `${top.dropoff_count} выпадений` : undefined}
          accent="violet"
        />
        <KpiCard
          label="Дней с проблемами"
          value={Object.keys(byDay).length}
          hint={Object.entries(byDay).map(([d, c]) => `${d}: ${c}`).join(' · ') || undefined}
          accent="blue"
        />
      </div>

      {top && top.dropoff_count >= 5 && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="danger"
            title="Критический drop-off"
            body={
              <>
                Узел <code>{top.node_id}</code> в дне <code>{top.day_id}</code> — {top.dropoff_count} игроков
                ушли отсюда. Стоит пересмотреть формулировку или добавить подсказку.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
          Топ-50 узлов по drop-off
        </div>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
        ) : (
          <DropoffBars rows={rows} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add "app/(admin)/admin/dropoff/page.tsx" "app/(admin)/admin/dropoff/DropoffClient.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): /admin/dropoff — Drop-off Zones with KPIs and CSS bars

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Visual smoke + final verification

**Files:** none (manual verification).

- [ ] **Step 1: Type check + tests + build**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit && npm test && npm run build
```

Expected: all green.

- [ ] **Step 2: Dev server smoke**

```bash
npm run dev
```

Open in a browser:
- http://localhost:3000/admin → redirects to overview, sidebar shows new entries
- http://localhost:3000/admin/branch — Sankey/Tree/Map tabs render (empty data is OK if game hasn't been played yet — placeholder text shows)
- http://localhost:3000/admin/engagement — KPI cards render with `—` for empty data, ThinkingBarChart shows empty placeholder
- http://localhost:3000/admin/dropoff — KPI cards show 0, DropoffBars shows "Нет drop-off"
- Filters change state without errors (scenario selector, period filter, day tabs)

- [ ] **Step 3: Generate test data, then re-verify**

To populate data, play through the game once (http://localhost:3000/game). Then:
- Refresh `/admin/branch` — Sankey should show the path you took
- Refresh `/admin/engagement` — Avg thinking time should be filled
- Verify in Supabase SQL editor:
  ```sql
  select event_type, count(*) from game_events
  where created_at > now() - interval '10 minutes'
  group by event_type order by 2 desc;
  ```
  Should show `node_entered`, `node_exited`, `choice_made` (with `thinking_time_ms` in event_data), `heartbeat`.

- [ ] **Step 4: No commit needed**

If verification finds issues, fix in a follow-up commit.

---

## Verification Summary (end of Phase 2)

At the end of Phase 2, the following should be true:

1. `npm test` — all tests pass (~325 from Phase 1 + ~17 new = ~342 total).
2. `npm run build` — production build succeeds.
3. `/admin/branch`, `/admin/engagement`, `/admin/dropoff` are all functional pages with charts that render real data from the deployed RPCs.
4. Filters (scenario, day, period) work without page reloads.
5. Empty-data states show friendly placeholders, not crashes.
6. The legacy admin pages (`/admin/overview`, etc.) still work — Phase 2 only added pages.

## Out of scope (deferred to Phase 3+)

- URL-state sync for filters (so refresh preserves state) — Phase 6 polish.
- A/B comparing two versions of a scenario in BranchTree — Phase 6.
- Diagnostic mode in ScenarioMap (only show problem nodes) — Phase 6.
- Real-time updates of these pages via Supabase Realtime — Phase 5.
- Per-node label translation (id → human-readable) — needs scenario metadata; Phase 4.
- AI-generated insights on top of the InsightCard placeholders — Phase 6.
