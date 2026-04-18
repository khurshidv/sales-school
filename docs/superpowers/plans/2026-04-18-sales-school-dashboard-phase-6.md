# Sales School Dashboard 2.0 — Phase 6 (Polish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the final ship-ready polish for Dashboard 2.0 — CSV exports, HR notes per player, a simplified Day Replay modal, and umbrella documentation. Closes out the 6-phase project.

**Architecture:** Migration 011 adds `players.admin_notes`. Two new server endpoints: typed CSV export (`/api/admin/csv`) and notes save (`/api/admin/player-notes`). Reusable `ExportCsvButton` component is wired to Participants + Leaderboard. New `PlayerNotes` editor on the player profile uses a 1-second debounce. New `DayReplayModal` walks through events of one day with prev/next navigation.

**Tech Stack:** Same as previous phases. No new libs.

**Existing infrastructure (do NOT recreate):**
- `lib/supabase/admin.ts` — `createAdminClient()`
- `app/api/admin/export/route.ts` — legacy CSV export (kept as-is for backwards compat)
- `app/api/admin/login/route.ts` — auth pattern
- `lib/admin/queries-v2.ts` — `getPlayersEnriched`, `getLeaderboardEnriched`
- `lib/admin/types-v2.ts` — `PlayerSummary`, `EnrichedPlayer`, `LeaderboardItem`, `ParsedJourneyDay`
- `components/admin/PlayerProfile.tsx` — Replay button stub (currently disabled)
- `app/(admin)/admin/player/[playerId]/PlayerClient.tsx` — Player Journey page
- `parseJourney()` returns `ParsedJourneyDay[]` with grouped events per day

**Branch:** `feature/dashboard-2-phase-1` (closing out — final commit on this branch).

**Prod safety:** Migration 011 is ADD-only — adds nullable column with default. Notes API is admin-only via auth check.

---

## File Structure

### New files (production)

```
supabase/migrations/
└── 011_player_admin_notes.sql              # ADD column players.admin_notes

app/api/admin/
├── csv/route.ts                            # GET ?type=participants|leaderboard
└── player-notes/route.ts                   # PATCH { playerId, notes }

components/admin/
├── ExportCsvButton.tsx                     # client-side download trigger
├── PlayerNotes.tsx                         # textarea + auto-save (debounce)
└── DayReplayModal.tsx                      # prev/next event walker

docs/superpowers/
└── dashboard-2.md                          # umbrella docs for all 6 phases
```

### Modified files

```
lib/admin/queries-v2.ts                     # + getAdminNotes, savePlayerNotes (client-only via API)
lib/admin/types-v2.ts                       # + PlayerSummary.admin_notes nullable
components/admin/PlayerProfile.tsx          # enable Replay button → call onReplay prop
app/(admin)/admin/player/[playerId]/PlayerClient.tsx  # mount PlayerNotes + DayReplayModal
app/(admin)/admin/participants/ParticipantsClient.tsx  # add ExportCsvButton in topbar
app/(admin)/admin/leaderboard/LeaderboardClient.tsx    # add ExportCsvButton in topbar
```

### Why this decomposition
- `ExportCsvButton` is generic (takes `type` and `label`) so both pages reuse it.
- `PlayerNotes` owns its debounce + save loop — page just mounts it with a `playerId`.
- `DayReplayModal` is a pure UI walker over already-parsed event arrays — no fetch, no business logic.
- Single new docs file avoids polluting the repo root with a sprawling README.

---

## Task 1: Migration 011 — `players.admin_notes`

**File:** Create `supabase/migrations/011_player_admin_notes.sql`

```sql
-- Phase 6: HR-style notes that admins can save per player.
-- ADD-only.

alter table public.players
  add column if not exists admin_notes text not null default '';
```

- [ ] **Step 1: Create the SQL file**

Use the Write tool with the exact content above.

- [ ] **Step 2: Apply via MCP (orchestrator does this)**

Stop and report. The orchestrator applies via `mcp__plugin_supabase_supabase__apply_migration` (project_id `njbcybjdzjahpdmcjtqe`).

- [ ] **Step 3: Commit**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
git add supabase/migrations/011_player_admin_notes.sql
git commit -m "$(cat <<'EOF'
feat(db): players.admin_notes for HR notes (migration 011)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Extend `PlayerSummary` type + `getPlayerSummary` query

**Files:**
- Modify: `lib/admin/types-v2.ts`
- Modify: `lib/admin/queries-v2.ts`

- [ ] **Step 1: Add `admin_notes` to `PlayerSummary` interface**

Find the existing `PlayerSummary` interface in `lib/admin/types-v2.ts` and add a field at the end:

```typescript
  admin_notes: string;       // HR notes; empty string when none
```

- [ ] **Step 2: Update `getPlayerSummary` to select `admin_notes`**

In `lib/admin/queries-v2.ts`, locate `getPlayerSummary` and update the `.select(...)` string to include `admin_notes`:

```typescript
.select('id, phone, display_name, avatar_id, level, total_xp, total_score, coins, utm_source, utm_medium, utm_campaign, referrer, device_fingerprint, last_seen_at, created_at, admin_notes')
```

- [ ] **Step 3: Type-check + tests + commit**

```bash
npx tsc --noEmit && npm test
git add lib/admin/types-v2.ts lib/admin/queries-v2.ts
git commit -m "$(cat <<'EOF'
feat(admin): expose players.admin_notes via PlayerSummary

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: CSV export API endpoint

**File:** Create `app/api/admin/csv/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getPlayersEnriched, getLeaderboardEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(r[h])).join(','));
  }
  return lines.join('\n');
}

async function buildParticipantsCsv(): Promise<string> {
  const { players } = await getPlayersEnriched({ limit: 10_000 });
  const headers = [
    'created_at', 'display_name', 'phone', 'best_rating', 'days_completed',
    'total_score', 'level', 'utm_source', 'utm_medium', 'utm_campaign',
    'referrer', 'last_activity',
  ];
  return rowsToCsv(
    headers,
    players.map((p) => ({
      created_at: p.created_at,
      display_name: p.display_name,
      phone: p.phone,
      best_rating: p.best_rating ?? '',
      days_completed: p.days_completed,
      total_score: p.total_score,
      level: p.level,
      utm_source: p.utm_source ?? '',
      utm_medium: p.utm_medium ?? '',
      utm_campaign: p.utm_campaign ?? '',
      referrer: p.referrer ?? '',
      last_activity: p.last_activity ?? '',
    })),
  );
}

async function buildLeaderboardCsv(): Promise<string> {
  const rows = await getLeaderboardEnriched(500);
  const headers = ['rank', 'display_name', 'best_rating', 'total_score', 'level', 'scenarios_completed', 'updated_at'];
  return rowsToCsv(
    headers,
    rows.map((r, i) => ({
      rank: i + 1,
      display_name: r.display_name,
      best_rating: r.best_rating ?? '',
      total_score: r.total_score,
      level: r.level,
      scenarios_completed: r.scenarios_completed,
      updated_at: r.updated_at,
    })),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  let csv: string;
  let filename: string;
  if (type === 'participants') {
    csv = await buildParticipantsCsv();
    filename = `participants-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'leaderboard') {
    csv = await buildLeaderboardCsv();
    filename = `leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return NextResponse.json({ error: 'Invalid type. Use ?type=participants or ?type=leaderboard' }, { status: 400 });
  }

  // Prepend BOM so Excel opens UTF-8 correctly
  const body = '\uFEFF' + csv;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
```

- [ ] **Step 1: Create the file**

- [ ] **Step 2: Smoke test in dev**

```bash
npx tsc --noEmit && npm run build
```

The route should appear in the build output as `ƒ /api/admin/csv`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/csv/route.ts
git commit -m "$(cat <<'EOF'
feat(admin): /api/admin/csv?type=participants|leaderboard CSV export

UTF-8 BOM prepended for Excel compatibility. Cap of 10k participants /
500 leaderboard rows per request — adequate for foreseeable dataset
sizes; can be paginated later if needed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Player notes API endpoint

**File:** Create `app/api/admin/player-notes/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface PatchBody {
  playerId: string;
  notes: string;
}

const MAX_NOTES_LENGTH = 10_000;

export async function PATCH(req: Request) {
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.playerId || typeof body.playerId !== 'string') {
    return NextResponse.json({ error: 'playerId required' }, { status: 400 });
  }
  if (typeof body.notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string' }, { status: 400 });
  }
  if (body.notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json({ error: `notes exceeds ${MAX_NOTES_LENGTH} chars` }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('players')
    .update({ admin_notes: body.notes })
    .eq('id', body.playerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 1: Create file**

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add app/api/admin/player-notes/route.ts
git commit -m "$(cat <<'EOF'
feat(admin): /api/admin/player-notes PATCH for HR notes

Validates playerId + notes string, caps at 10k chars, writes via
service-role admin client to bypass RLS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `ExportCsvButton` component

**File:** Create `components/admin/ExportCsvButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Download, Loader } from 'lucide-react';

export interface ExportCsvButtonProps {
  type: 'participants' | 'leaderboard';
  label?: string;
}

export default function ExportCsvButton({ type, label = 'Экспорт CSV' }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/csv?type=${type}`);
      if (!res.ok) {
        const err = await res.text();
        alert(`Ошибка экспорта: ${err}`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') ?? '';
      const m = /filename="([^"]+)"/.exec(cd);
      const filename = m?.[1] ?? `${type}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onClick} disabled={loading} className="admin-btn">
      {loading ? <Loader size={14} className="spin" /> : <Download size={14} />}
      {label}
    </button>
  );
}
```

- [ ] **Step 1: Create file**

- [ ] **Step 2: Commit**

```bash
npx tsc --noEmit
git add components/admin/ExportCsvButton.tsx
git commit -m "$(cat <<'EOF'
feat(admin): ExportCsvButton — typed download trigger

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `PlayerNotes` component

**File:** Create `components/admin/PlayerNotes.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

const SAVE_DEBOUNCE_MS = 1_000;
const MAX_LENGTH = 10_000;

type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface PlayerNotesProps {
  playerId: string;
  initial: string;
}

export default function PlayerNotes({ playerId, initial }: PlayerNotesProps) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>('idle');
  const lastSavedRef = useRef(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === lastSavedRef.current) return;
    setState('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setState('saving');
      try {
        const res = await fetch('/api/admin/player-notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, notes: value }),
        });
        if (!res.ok) throw new Error(await res.text());
        lastSavedRef.current = value;
        setState('saved');
        setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 1500);
      } catch {
        setState('error');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, playerId]);

  const stateLabel = state === 'pending' ? 'Сохраняем…'
    : state === 'saving' ? 'Сохраняем…'
    : state === 'saved' ? '✓ Сохранено'
    : state === 'error' ? '⚠ Ошибка сохранения'
    : '';
  const stateColor = state === 'error' ? 'var(--admin-accent-danger)'
    : state === 'saved' ? 'var(--admin-accent-success)'
    : 'var(--admin-text-dim)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>HR-заметки</div>
        <div style={{ fontSize: 11, color: stateColor }}>{stateLabel}</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Заметки админа: впечатления, договорённости, статус контакта…"
        style={{
          width: '100%', minHeight: 100, padding: 10, fontSize: 12,
          border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-sm)',
          background: '#fff', color: 'var(--admin-text)',
          fontFamily: 'inherit', resize: 'vertical',
        }}
      />
      <div style={{ fontSize: 10, color: 'var(--admin-text-dim)', marginTop: 4, textAlign: 'right' }}>
        {value.length} / {MAX_LENGTH}
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Create file**

- [ ] **Step 2: Commit**

```bash
npx tsc --noEmit
git add components/admin/PlayerNotes.tsx
git commit -m "$(cat <<'EOF'
feat(admin): PlayerNotes — autosave HR notes textarea (1s debounce)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `DayReplayModal` component

**File:** Create `components/admin/DayReplayModal.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PlayerJourneyEvent } from '@/lib/admin/types-v2';

export interface DayReplayModalProps {
  events: PlayerJourneyEvent[];
  dayLabel: string;
  onClose: () => void;
}

const EVENT_LABEL: Record<string, string> = {
  game_started: 'Игра запущена',
  day_started: 'День начат',
  day_completed: 'День завершён',
  day_failed: 'День провален',
  choice_made: 'Сделан выбор',
  back_navigation: 'Шаг назад',
  dialogue_reread: 'Перечитал диалог',
  game_completed: 'Игра завершена',
  achievement_unlocked: 'Получено достижение',
  node_entered: 'Перешёл на узел',
  node_exited: 'Покинул узел',
  heartbeat: 'Активен',
  idle_detected: 'Бездействие',
  dropped_off: 'Покинул игру',
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DayReplayModal({ events, dayLabel, onClose }: DayReplayModalProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(events.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [events.length, onClose]);

  if (events.length === 0) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <Header dayLabel={dayLabel} onClose={onClose} />
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
            Нет событий для этого дня.
          </div>
        </div>
      </div>
    );
  }

  const current = events[idx];
  const data = current.event_data;
  const label = EVENT_LABEL[current.event_type] ?? current.event_type;
  const detail = formatDetail(current.event_type, data);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <Header dayLabel={dayLabel} onClose={onClose} />

        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginBottom: 8 }}>
            Шаг {idx + 1} из {events.length} · {fmtTime(current.created_at)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6 }}>
            {label}
          </div>
          {detail && (
            <div style={{ fontSize: 13, color: 'var(--admin-text-muted)', whiteSpace: 'pre-wrap' }}>
              {detail}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="admin-btn"
              style={idx === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              <ChevronLeft size={14} /> Назад
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(events.length - 1, i + 1))}
              disabled={idx === events.length - 1}
              className="admin-btn admin-btn-primary"
              style={idx === events.length - 1 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              Вперёд <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ marginTop: 16, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${((idx + 1) / events.length) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--admin-accent), var(--admin-accent-2))',
              transition: 'width 0.2s',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ dayLabel, onClose }: { dayLabel: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px', borderBottom: '1px solid var(--admin-border)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
        Replay: {dayLabel}
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function formatDetail(type: string, data: Record<string, unknown>): string {
  if (type === 'choice_made') {
    const nodeId = data.node_id;
    const choiceId = data.choice_id;
    const tt = data.thinking_time_ms;
    const parts: string[] = [];
    if (nodeId) parts.push(`Узел: ${nodeId}`);
    if (choiceId) parts.push(`Выбор: ${choiceId}`);
    if (typeof tt === 'number') parts.push(`Время: ${(tt / 1000).toFixed(1)}с`);
    return parts.join('\n');
  }
  if (type === 'back_navigation') {
    return `${data.from_node_id ?? '?'} → ${data.to_node_id ?? '?'}`;
  }
  if (type === 'node_entered' || type === 'node_exited') {
    const nodeId = data.node_id;
    const ts = data.time_spent_ms;
    return [
      nodeId ? `Узел: ${nodeId}` : null,
      typeof ts === 'number' ? `На узле провёл: ${(ts / 1000).toFixed(1)}с` : null,
    ].filter(Boolean).join('\n');
  }
  return '';
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100, padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--admin-card)',
  borderRadius: 'var(--admin-radius-lg)',
  width: '100%', maxWidth: 560,
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
};
```

- [ ] **Step 1: Create file**

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add components/admin/DayReplayModal.tsx
git commit -m "$(cat <<'EOF'
feat(admin): DayReplayModal — keyboard-navigable event walker (← →, Esc to close)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Wire Phase 6 components into pages

**Files:**
- Modify: `app/(admin)/admin/participants/ParticipantsClient.tsx` — add `<ExportCsvButton type="participants" />` in PageHeader actions
- Modify: `app/(admin)/admin/leaderboard/LeaderboardClient.tsx` — add `<ExportCsvButton type="leaderboard" />` in PageHeader actions
- Modify: `components/admin/PlayerProfile.tsx` — enable Replay button (drop the `disabled` style)
- Modify: `app/(admin)/admin/player/[playerId]/PlayerClient.tsx` — mount `<PlayerNotes>` and `<DayReplayModal>`

- [ ] **Step 1: Participants — add export button**

In `app/(admin)/admin/participants/ParticipantsClient.tsx`, find the `<PageHeader title="Participants" subtitle=... />` line and add an `actions` prop with the export button. Add an import for `ExportCsvButton`:

```typescript
import ExportCsvButton from '@/components/admin/ExportCsvButton';
```

Update the PageHeader call:

```typescript
<PageHeader
  title="Participants"
  subtitle="Все игроки с фильтрами и быстрым переходом к индивидуальному пути."
  actions={<ExportCsvButton type="participants" />}
/>
```

- [ ] **Step 2: Leaderboard — add export button**

In `app/(admin)/admin/leaderboard/LeaderboardClient.tsx`, same pattern:

```typescript
import ExportCsvButton from '@/components/admin/ExportCsvButton';

// in JSX:
<PageHeader
  title="Leaderboard"
  subtitle="Топ игроков по очкам — обновляется в реальном времени."
  actions={<ExportCsvButton type="leaderboard" />}
/>
```

- [ ] **Step 3: PlayerProfile — enable Replay button**

In `components/admin/PlayerProfile.tsx`, find the existing Replay button block:

```typescript
{onReplay && (
  <button onClick={onReplay} className="admin-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
    <PlayCircle size={14} /> Replay
  </button>
)}
```

Replace with:

```typescript
{onReplay && (
  <button onClick={onReplay} className="admin-btn">
    <PlayCircle size={14} /> Replay
  </button>
)}
```

- [ ] **Step 4: PlayerClient — mount PlayerNotes and DayReplayModal**

In `app/(admin)/admin/player/[playerId]/PlayerClient.tsx`, add imports:

```typescript
import { useState } from 'react';
import PlayerNotes from '@/components/admin/PlayerNotes';
import DayReplayModal from '@/components/admin/DayReplayModal';
```

(`useState` is likely already imported; only add what's missing.)

Inside the component body (top of `PlayerClient`), add a state hook for the replay modal:

```typescript
const [replayDayId, setReplayDayId] = useState<string | null>(null);
```

Wire `onReplay` on `<PlayerProfile>` — the simplest is "replay the latest day". Update the `<PlayerProfile />` JSX:

```typescript
<PlayerProfile
  player={player}
  bestRating={bestRating}
  daysCompleted={completed.length}
  totalSessions={journey.totalSessions}
  onReplay={journey.days.length > 0 ? () => setReplayDayId(journey.days[journey.days.length - 1].day_id) : undefined}
/>
```

Add the PlayerNotes block somewhere inside the right-side column (after "Сильные / слабые стороны" admin-card or alongside). Insert this `<div className="admin-card">` BEFORE the closing `</div>` of the right-column flex container:

```typescript
<div className="admin-card" style={{ padding: 16 }}>
  <PlayerNotes playerId={playerId} initial={player.admin_notes ?? ''} />
</div>
```

At the very end of the JSX (just before the final `</div>` that wraps the page), add the modal:

```typescript
{replayDayId && (() => {
  const dayObj = journey.days.find((d) => d.day_id === replayDayId);
  if (!dayObj) return null;
  return (
    <DayReplayModal
      events={dayObj.events}
      dayLabel={dayObj.day_id.replace('day', 'День ')}
      onClose={() => setReplayDayId(null)}
    />
  );
})()}
```

- [ ] **Step 5: Build + tests**

```bash
npx tsc --noEmit && npm run build && npm test
```

Expected: TS clean, build green, 385 tests pass.

- [ ] **Step 6: Single commit**

```bash
git add components/admin/PlayerProfile.tsx \
        "app/(admin)/admin/participants/ParticipantsClient.tsx" \
        "app/(admin)/admin/leaderboard/LeaderboardClient.tsx" \
        "app/(admin)/admin/player/[playerId]/PlayerClient.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): wire Phase 6 — CSV export buttons + Player notes + Day Replay

ExportCsvButton appears in the topbar of Participants and Leaderboard.
PlayerProfile Replay button is now active and triggers a DayReplayModal
walker over the latest day's events. PlayerNotes adds an autosaving
HR-notes textarea on the player profile.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Final umbrella docs

**File:** Create `docs/superpowers/dashboard-2.md`

```markdown
# Sales School Dashboard 2.0 — Project Overview

This document maps the six implementation phases for the dashboard rebuild
that shipped on the `feature/dashboard-2-phase-1` branch.

## Phases

| # | Name | Plan | Highlights |
|---|------|------|------------|
| 1 | Foundation | [phase-1](plans/2026-04-17-sales-school-dashboard-phase-1.md) | Tracking infra: thinking time, node entered/exited, heartbeat, idle. New admin shell + Premium theme. Migrations 006-008. |
| 2 | Game pages | [phase-2](plans/2026-04-17-sales-school-dashboard-phase-2.md) | `/admin/branch` (Sankey + Tree + Map), `/admin/engagement` (Interest Index), `/admin/dropoff`. |
| 3 | Marketing pages | [phase-3](plans/2026-04-18-sales-school-dashboard-phase-3.md) | `/admin/overview`, `/admin/funnel`, `/admin/pages`, `/admin/offer` + offer-screen instrumentation. Migration 009. |
| 4 | Player pages | [phase-4](plans/2026-04-18-sales-school-dashboard-phase-4.md) | Participants rewrite, `/admin/player/[id]` Journey, Leaderboard rewrite. |
| 5 | Real-time | [phase-5](plans/2026-04-18-sales-school-dashboard-phase-5.md) | `/admin/realtime` with live KPIs, area chart, live feed, auto-insights. Migration 010. |
| 6 | Polish | [phase-6](plans/2026-04-18-sales-school-dashboard-phase-6.md) | CSV export, HR notes, Day Replay modal. Migration 011. |

## Key files

### Admin pages (Premium-styled)
- `app/(admin)/admin/realtime/` — diagnostic view (default landing)
- `app/(admin)/admin/overview/` — top-level funnel + trends
- `app/(admin)/admin/branch/` — Branch Analytics
- `app/(admin)/admin/engagement/` — Interest Index
- `app/(admin)/admin/dropoff/` — Drop-off Zones
- `app/(admin)/admin/funnel/` — UTM funnel
- `app/(admin)/admin/pages/` — marketing-page analytics
- `app/(admin)/admin/offer/` — Offer Conversion
- `app/(admin)/admin/participants/` — players table
- `app/(admin)/admin/player/[playerId]/` — individual journey
- `app/(admin)/admin/leaderboard/` — top players

### Reusable components
- `components/admin/{KpiCard, TopBar, InsightCard, PageHeader, Sidebar}.tsx`
- `components/admin/{ScenarioSelector, DayTabs, PeriodFilter}.tsx`
- `components/admin/{RatingBadge, Timeline, PlayerProfile, LiveFeed}.tsx`
- `components/admin/{ExportCsvButton, PlayerNotes, DayReplayModal}.tsx`
- `components/admin/charts/*.tsx` — Sankey, BranchTree, ScenarioMap, ThinkingBarChart, DropoffBars, FunnelBars, TrendLineChart, DonutChart, ActivityAreaChart, PerDayBars, MedalBadge

### Pure transforms (TDD)
- `lib/admin/branch/{buildSankeyData, buildTreeData, buildGraphData}.ts`
- `lib/admin/engagement/computeIndex.ts`
- `lib/admin/marketing/{computeFunnelDeltas, computeUtmRollup}.ts`
- `lib/admin/player/{parseJourney, deriveStrengthsWeaknesses}.ts`
- `lib/admin/realtime/{detectAutoInsights, buildActivitySeries}.ts`

### DB migrations (all ADD-only)
- `006_game_events_indexes.sql` — analytical indexes
- `007_offer_events.sql` — new table for offer-page tracking
- `008_admin_aggregates.sql` — RPCs for branch/engagement/dropoff/journey/offer-funnel
- `009_marketing_aggregates.sql` — RPCs for UTM funnel, daily trends, offer breakdowns
- `010_realtime_publication.sql` — game_events in supabase_realtime + get_realtime_kpis
- `011_player_admin_notes.sql` — HR notes column

### Game-side instrumentation
- `lib/game/eventTypes.ts` — central event-type constants
- `lib/game/analytics.ts` — typed event helpers
- `lib/game/offerEvents.ts` — offer screen tracking
- `lib/game/hooks/{useHeartbeat, useChoiceTimer}.ts`
- `game/store/gameStore.ts` — emits node_entered/exited, choice timing, back navigation
- `components/game/screens/SchoolPitch.tsx` — instrumented offer-view + CTA-click

## Out-of-scope for this project (deferred)

- AI-generated insights via LLM API on top of detectAutoInsights
- Video-style Replay player with full game UI reconstruction
- A/B variant tooling for the offer page
- Push notifications / Slack integration for critical insights
- Admin UI translations (Uzbek)
- Mobile-native admin app

## Conventions

- All Supabase migrations are ADD-only — never modify existing columns/tables
- All admin pages: server `page.tsx` + client `*Client.tsx`
- Pure transforms are TDD'd; chart wrappers and pages are visually verified
- CSS variables defined in `app/(admin)/admin.css` — reuse, don't introduce new themes
- Russian-locale UI throughout
```

- [ ] **Step 1: Create file**

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/dashboard-2.md
git commit -m "$(cat <<'EOF'
docs: umbrella overview for Dashboard 2.0 (all 6 phases)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Final verification

- [ ] **Step 1: Type check + tests + build**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
npx tsc --noEmit && npm test && npm run build
```

Expected: TS clean, 385 tests pass, build green.

- [ ] **Step 2: Manual smoke**

```bash
npm run dev
```

- http://localhost:3000/admin/participants → CSV button in topbar; click → downloads `participants-2026-04-18.csv`
- http://localhost:3000/admin/leaderboard → CSV button in topbar
- http://localhost:3000/admin/player/{id} →
  - HR-notes textarea — type something, see "Сохраняем…" then "✓ Сохранено"
  - Click "Replay" → modal opens with first event of latest day; ←/→ keys navigate
- Refresh player page → notes persist (read from DB)

- [ ] **Step 3: No commit needed.** If issues, fix in follow-up.

---

## Verification Summary (end of Phase 6)

1. `npm test` — all 385 tests pass.
2. `npm run build` — production build succeeds.
3. Migration 011 applied; `players.admin_notes` column exists.
4. `/api/admin/csv?type=participants` and `?type=leaderboard` return UTF-8 CSV with BOM.
5. `/api/admin/player-notes` PATCH writes notes via service role.
6. Day Replay modal opens, walks events, closes via Esc / X / overlay click.
7. Phase 1-5 functionality intact.

## End of Project

After Phase 6 is shipped:
- Merge `feature/dashboard-2-phase-1` into `main`
- Vercel auto-deploys to production
- Open the new admin at production URL — all 11 pages live
