# Sales Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public 4-lesson YouTube funnel at `/start` that captures a lead, gates each lesson with a quiz, then hands the identified user off to the existing simulator at `/game` without re-registration.

**Architecture:** Next.js 16 App Router pages + typed server routes in `app/api/funnel/*`. Supabase tables `funnel_progress` / `funnel_events` hold per-lead progress and telemetry. Client-side identity uses `{ lead_id, token }` in localStorage; every server call validates the pair. Bitrix gets a new `SALESUP_FUNNEL` source. The `players` row is created only at the moment of simulator hand-off (lesson 4 quiz passed). `/game` reads `?lead_token=...` and skips onboarding when it resolves to a linked player.

**Tech Stack:** Next.js 16, React 19, TypeScript 5 strict, Tailwind 4 (`@theme inline`), Vitest 4, `@testing-library/react`, `@supabase/ssr`, `@supabase/supabase-js`, Framer Motion, YouTube IFrame API (loaded as a plain script, no NPM wrapper).

**Spec:** [`docs/superpowers/specs/2026-04-24-sales-funnel-design.md`](../specs/2026-04-24-sales-funnel-design.md)

**Commit style:** `feat(funnel): ...` / `docs(funnel): ...` / `test(funnel): ...`. Keep commits small (one task = one commit) so a reviewer can walk the history.

---

## File map

### New files

| Path | Responsibility |
|---|---|
| `supabase/migrations/034_funnel_schema.sql` | Tables, columns, indexes for funnel. |
| `supabase/migrations/035_funnel_rls.sql` | RLS lock-down of funnel tables. |
| `lib/funnel/types.ts` | Shared TS types (`FunnelLesson`, `QuizQuestion`, `FunnelProgress`, `FunnelEventType`). |
| `lib/funnel/lessons.ts` | Lesson metadata array (YouTube IDs placeholders + titles). |
| `lib/funnel/quizzes.ts` | Quiz content (placeholders). Pure data, typed. |
| `lib/funnel/copy.ts` | All Uzbek strings used by the funnel UI. |
| `lib/funnel/quizzes.test.ts` | Validates quiz data shape and correct answer indexes. |
| `lib/funnel/progress-server.ts` | Server helpers: token validation, progress read/write, event append. |
| `lib/funnel/progress-server.test.ts` | Unit tests (with mocked admin client). |
| `lib/funnel/progress-client.ts` | LocalStorage helpers typed. Browser-only. |
| `lib/funnel/lead-payload.ts` | Builds the lead INSERT + Bitrix body; shared by the funnel API and reusable in future. |
| `app/api/funnel/lead/route.ts` | POST: create lead + Bitrix + progress. |
| `app/api/funnel/lead/__tests__/route.test.ts` | Unit tests. |
| `app/api/funnel/state/route.ts` | POST: return progress for `{lead_id, token}`. |
| `app/api/funnel/state/__tests__/route.test.ts` | Unit tests. |
| `app/api/funnel/quiz/route.ts` | POST: validate answer, advance progress, create player on lesson 4. |
| `app/api/funnel/quiz/__tests__/route.test.ts` | Unit tests. |
| `app/api/funnel/event/route.ts` | POST: append telemetry event. |
| `app/api/funnel/event/__tests__/route.test.ts` | Unit tests. |
| `app/api/funnel/link-player/route.ts` | POST: resolve `lead_token` to a linked player for the game. |
| `app/api/funnel/link-player/__tests__/route.test.ts` | Unit tests. |
| `components/funnel/FunnelStepper.tsx` | 4-circle progress stepper with lock / active / done states. |
| `components/funnel/FunnelStepper.test.tsx` | Render tests. |
| `components/funnel/YouTubeLesson.tsx` | YouTube IFrame wrapper with playback tick and CTA gate. |
| `components/funnel/QuizModal.tsx` | Fullscreen quiz modal with retry loop. |
| `components/funnel/QuizModal.test.tsx` | Render tests. |
| `components/funnel/GameTeaserBlock.tsx` | Teaser block placed under the form submit button. |
| `components/funnel/RegistrationGateModal.tsx` | Non-fullscreen modal with form + teaser block. |
| `components/funnel/FunnelHero.tsx` | Landing hero composition. |
| `app/start/layout.tsx` | Locale forced to `uz`. Funnel-specific metadata. |
| `app/start/page.tsx` | Landing page. |
| `app/start/dars/[n]/page.tsx` | Lesson page (dynamic n=1..4). |

### Modified files

| Path | Change |
|---|---|
| `app/api/bitrix/lead/route.ts` | Extend `SourcePage` union with `'funnel'`; add `SALESUP_FUNNEL` to `SOURCE_ID_BY_PAGE`; default stage for `funnel` = `STAGE_NEW`. |
| `app/(game)/game/page.tsx` | On mount, read `?lead_token=...`; if present, POST `/api/funnel/link-player`; on success, populate `usePlayerStore` and skip onboarding screens. |

No changes to `components/RegistrationModal.tsx`, `components/ui/PhoneInput.tsx`, `lib/bitrix/client.ts`, `lib/supabase/*` — all reused as-is.

---

## Phase 0 — Preconditions (verify, not code)

### Task 0.1: Confirm working tree is clean of funnel work

- [ ] **Step 1: Check git status**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
git status --short
```

Expected: pre-existing unrelated changes (`target/page.tsx`, `lib/i18n.tsx`, new `components/target/*.tsx`) visible; no funnel files. If funnel files appear, stop and reconcile.

- [ ] **Step 2: Confirm latest migration number**

```bash
ls supabase/migrations/ | sort | tail -3
```

Expected: `033_language_in_rpcs.sql` is the newest. Our migrations will be `034` and `035`. If a new migration has appeared, renumber accordingly everywhere in this plan.

- [ ] **Step 3: Confirm test & lint commands work**

```bash
npm run lint
npm run test -- --run lib/funnel 2>&1 | head -5
```

Expected: `lint` exits 0 (or reports only pre-existing warnings). `test` with no matching files exits 0 with "No test files found" — fine.

---

## Phase 1 — Database schema (migrations 034, 035)

### Task 1.1: Write migration 034 — funnel schema

**Files:**
- Create: `supabase/migrations/034_funnel_schema.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 034_funnel_schema.sql
-- Adds funnel_progress, funnel_events, and links funnel leads <-> players.
-- ADD-only: no drops. Safe to re-run.

alter table public.leads
  add column if not exists funnel_token uuid,
  add column if not exists player_id uuid references public.players(id) on delete set null;

create index if not exists idx_leads_funnel_token on public.leads(funnel_token);
create index if not exists idx_leads_player_id on public.leads(player_id);

alter table public.players
  add column if not exists lead_id uuid references public.leads(id) on delete set null;

create index if not exists idx_players_lead_id on public.players(lead_id);

-- De-facto phone uniqueness for players. Use CONCURRENTLY if run outside of a transaction
-- block; this migration is applied via Supabase MCP which wraps in a txn, so plain CREATE
-- INDEX is correct. If duplicates exist, this will fail: clean them up first with
--   select phone, count(*) from public.players group by 1 having count(*) > 1;
create unique index if not exists idx_players_phone_unique on public.players(phone);

create table if not exists public.funnel_progress (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  current_lesson smallint not null default 1 check (current_lesson between 1 and 4),
  completed_lessons smallint[] not null default '{}',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_funnel_progress()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_funnel_progress_touch on public.funnel_progress;
create trigger trg_funnel_progress_touch
  before update on public.funnel_progress
  for each row execute function public.touch_funnel_progress();

do $$ begin
  create type funnel_event_type as enum (
    'landing_view',
    'play_clicked',
    'lead_created',
    'lesson_opened',
    'quiz_shown',
    'quiz_wrong',
    'quiz_passed',
    'funnel_completed',
    'simulator_redirected'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  event_type funnel_event_type not null,
  lesson_index smallint,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_funnel_events_lead on public.funnel_events(lead_id);
create index if not exists idx_funnel_events_type_time on public.funnel_events(event_type, created_at desc);
```

- [ ] **Step 2: Dry-run — check for pre-existing duplicate phones**

Use Supabase MCP to run:

```sql
select phone, count(*) from public.players group by 1 having count(*) > 1 limit 5;
```

Expected: 0 rows. If rows appear, STOP and report to user before applying migration — the unique index will fail.

- [ ] **Step 3: Apply migration via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with the contents of `034_funnel_schema.sql`.

Expected: success.

- [ ] **Step 4: Verify tables exist**

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('funnel_progress', 'funnel_events');
```

Expected: both rows present.

### Task 1.2: Write migration 035 — funnel RLS

**Files:**
- Create: `supabase/migrations/035_funnel_rls.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 035_funnel_rls.sql
-- Locks funnel_progress and funnel_events to service-role only.
-- All client access goes through server-side Next.js API routes that validate the funnel token.

alter table public.funnel_progress enable row level security;
alter table public.funnel_events enable row level security;

-- No policies defined for anon / authenticated => no access.
-- Service role bypasses RLS by default.

-- Explicit revokes for clarity:
revoke all on public.funnel_progress from anon, authenticated;
revoke all on public.funnel_events from anon, authenticated;
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with the file contents.

Expected: success.

- [ ] **Step 3: Verify RLS is on**

```sql
select relname, relrowsecurity
from pg_class
where relname in ('funnel_progress', 'funnel_events');
```

Expected: both rows with `relrowsecurity = true`.

### Task 1.3: Commit phase 1

- [ ] **Step 1: Stage and commit**

```bash
cd "/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
git add supabase/migrations/034_funnel_schema.sql supabase/migrations/035_funnel_rls.sql
git commit -m "feat(funnel): add funnel_progress, funnel_events tables and RLS"
```

Expected: 2 files changed, commit hash shown.

---

## Phase 2 — Types, content, copy

### Task 2.1: Shared types

**Files:**
- Create: `lib/funnel/types.ts`

- [ ] **Step 1: Write the file**

```ts
export type LessonIndex = 1 | 2 | 3 | 4;

export interface FunnelLesson {
  index: LessonIndex;
  title: string;
  youtubeId: string;
}

export interface QuizQuestion {
  lesson: LessonIndex;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface FunnelProgress {
  leadId: string;
  currentLesson: LessonIndex;
  completedLessons: LessonIndex[];
  finishedAt: string | null;
}

export type FunnelEventType =
  | 'landing_view'
  | 'play_clicked'
  | 'lead_created'
  | 'lesson_opened'
  | 'quiz_shown'
  | 'quiz_wrong'
  | 'quiz_passed'
  | 'funnel_completed'
  | 'simulator_redirected';

export interface FunnelIdentity {
  leadId: string;
  token: string;
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

### Task 2.2: Lesson placeholder data

**Files:**
- Create: `lib/funnel/lessons.ts`

- [ ] **Step 1: Write the file**

```ts
import type { FunnelLesson } from './types';

// REPLACE these youtubeId values with the final video IDs when provided.
// Keep `index` monotonic 1..4.
export const LESSONS: FunnelLesson[] = [
  { index: 1, title: 'Dars 1', youtubeId: 'PLACEHOLDER_LESSON_1' },
  { index: 2, title: 'Dars 2', youtubeId: 'PLACEHOLDER_LESSON_2' },
  { index: 3, title: 'Dars 3', youtubeId: 'PLACEHOLDER_LESSON_3' },
  { index: 4, title: 'Dars 4', youtubeId: 'PLACEHOLDER_LESSON_4' },
];

export function getLesson(n: number): FunnelLesson | null {
  return LESSONS.find((l) => l.index === n) ?? null;
}

export const TOTAL_LESSONS = 4 as const;
export const WATCH_THRESHOLD = 0.88 as const;
```

### Task 2.3: Quizzes placeholder data

**Files:**
- Create: `lib/funnel/quizzes.ts`

- [ ] **Step 1: Write the file**

```ts
import type { QuizQuestion } from './types';

// REPLACE question/options/correctIndex with real content when provided.
// correctIndex must be 0..3 and options must have exactly 4 items.
export const QUIZZES: QuizQuestion[] = [
  {
    lesson: 1,
    question: 'Dars 1 bo‘yicha savol (joy qoldirgich)',
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 2,
    question: 'Dars 2 bo‘yicha savol (joy qoldirgich)',
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 3,
    question: 'Dars 3 bo‘yicha savol (joy qoldirgich)',
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
  {
    lesson: 4,
    question: 'Dars 4 bo‘yicha savol (joy qoldirgich)',
    options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
    correctIndex: 0,
  },
];

export function getQuiz(lesson: number): QuizQuestion | null {
  return QUIZZES.find((q) => q.lesson === lesson) ?? null;
}
```

### Task 2.4: Quizzes shape test

**Files:**
- Create: `lib/funnel/quizzes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { QUIZZES, getQuiz } from './quizzes';
import { TOTAL_LESSONS } from './lessons';

describe('QUIZZES', () => {
  it('has exactly one quiz per lesson', () => {
    expect(QUIZZES).toHaveLength(TOTAL_LESSONS);
    const lessons = QUIZZES.map((q) => q.lesson).sort();
    expect(lessons).toEqual([1, 2, 3, 4]);
  });

  it('each quiz has exactly 4 options', () => {
    for (const q of QUIZZES) {
      expect(q.options).toHaveLength(4);
    }
  });

  it('correctIndex is within 0..3', () => {
    for (const q of QUIZZES) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    }
  });

  it('getQuiz returns null for unknown lesson', () => {
    expect(getQuiz(0)).toBeNull();
    expect(getQuiz(5)).toBeNull();
  });

  it('getQuiz returns the quiz for valid lesson', () => {
    const q = getQuiz(2);
    expect(q).not.toBeNull();
    expect(q?.lesson).toBe(2);
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npm run test -- --run lib/funnel/quizzes.test.ts
```

Expected: all 5 tests pass (the data file was written in Task 2.3).

### Task 2.5: Uzbek copy

**Files:**
- Create: `lib/funnel/copy.ts`

- [ ] **Step 1: Write the file**

```ts
// All Uzbek strings used by the funnel UI.
// Keep plain object, no i18n hook — the funnel is Uzbek-only.
export const copy = {
  landing: {
    eyebrow: 'Sotuv maktabi',
    heading: '4 ta bepul dars — va sotuv simulyatori',
    subheading:
      "Har bir darsdan keyin — kichik topshiriq. Barchasini tamomlasangiz — o'yin ko'rinishidagi simulyator sizniki.",
    bullets: [
      '4 ta qisqa video dars',
      'Har darsga 1 ta savol',
      'Yakunda — sotuv simulyatori',
    ],
    playHint: "Birinchi darsni ko'rish",
  },
  gate: {
    title: "Darsni ko'rish uchun ma'lumotlaringizni qoldiring",
    nameLabel: 'Ismingiz',
    namePlaceholder: 'Ismingizni kiriting',
    phoneLabel: 'Telefon raqamingiz',
    submit: 'Darsni boshlash',
    submitting: 'Yuborilmoqda...',
    teaser: {
      heading: 'Barcha darslarni tamomlasangiz',
      body: "Sotuv simulyatori — interaktiv o'yin — sizga sovg'a sifatida beriladi.",
    },
    errorGeneric: "Xatolik yuz berdi. Qayta urinib ko'ring.",
    errorName: "Ismingizni to'liq kiriting",
    errorPhone: "Telefon raqamini to'g'ri kiriting",
    close: 'Yopish',
  },
  lesson: {
    stepCaption: (n: number, total: number) => `Dars ${n} / ${total}`,
    nextCta: "Keyingi darsga o'tish",
    loadingVideo: 'Video yuklanmoqda...',
  },
  quiz: {
    title: "Keyingi darsga o'tish uchun to'g'ri javobni tanlang",
    submit: 'Javobni yuborish',
    submitting: 'Tekshirilmoqda...',
    wrong: "Qayta urinib ko'ring",
    back: 'Orqaga',
  },
  stepper: {
    lockedAria: 'Dars hali ochilmagan',
    doneAria: 'Dars tamomlangan',
    currentAria: 'Joriy dars',
  },
} as const;
```

### Task 2.6: Commit phase 2

- [ ] **Step 1: Stage and commit**

```bash
git add lib/funnel/types.ts lib/funnel/lessons.ts lib/funnel/quizzes.ts lib/funnel/quizzes.test.ts lib/funnel/copy.ts
git commit -m "feat(funnel): add types, lesson placeholders, quiz placeholders, copy"
```

Expected: 5 files changed.

---

## Phase 3 — Server helpers

### Task 3.1: Server progress helper

**Files:**
- Create: `lib/funnel/progress-server.ts`

- [ ] **Step 1: Write the file**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  FunnelProgress,
  FunnelEventType,
  LessonIndex,
  FunnelIdentity,
} from './types';

export async function validateToken(
  identity: FunnelIdentity,
): Promise<{ ok: boolean; leadId: string | null }> {
  if (!identity.leadId || !identity.token) return { ok: false, leadId: null };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .select('id, funnel_token')
    .eq('id', identity.leadId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return { ok: false, leadId: null };
  if (data.funnel_token !== identity.token) return { ok: false, leadId: null };
  return { ok: true, leadId: data.id as string };
}

export async function loadProgress(leadId: string): Promise<FunnelProgress | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('funnel_progress')
    .select('lead_id, current_lesson, completed_lessons, finished_at')
    .eq('lead_id', leadId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    leadId: data.lead_id as string,
    currentLesson: data.current_lesson as LessonIndex,
    completedLessons: (data.completed_lessons ?? []) as LessonIndex[],
    finishedAt: (data.finished_at as string) ?? null,
  };
}

export async function advanceProgress(
  leadId: string,
  lessonJustPassed: LessonIndex,
): Promise<FunnelProgress | null> {
  const admin = createAdminClient();
  const current = await loadProgress(leadId);
  if (!current) return null;
  const completed = Array.from(new Set([...current.completedLessons, lessonJustPassed])).sort(
    (a, b) => a - b,
  ) as LessonIndex[];
  const next = (lessonJustPassed === 4 ? 4 : (lessonJustPassed + 1)) as LessonIndex;
  const finishedAt = lessonJustPassed === 4 ? new Date().toISOString() : null;
  const { data, error } = await admin
    .from('funnel_progress')
    .update({
      current_lesson: next,
      completed_lessons: completed,
      finished_at: finishedAt ?? current.finishedAt,
    })
    .eq('lead_id', leadId)
    .select('lead_id, current_lesson, completed_lessons, finished_at')
    .maybeSingle();
  if (error || !data) return null;
  return {
    leadId: data.lead_id as string,
    currentLesson: data.current_lesson as LessonIndex,
    completedLessons: (data.completed_lessons ?? []) as LessonIndex[],
    finishedAt: (data.finished_at as string) ?? null,
  };
}

export async function logEvent(input: {
  leadId: string | null;
  eventType: FunnelEventType;
  lessonIndex?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('funnel_events').insert({
    lead_id: input.leadId,
    event_type: input.eventType,
    lesson_index: input.lessonIndex ?? null,
    meta: input.meta ?? {},
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

### Task 3.2: Server progress helper — tests

**Files:**
- Create: `lib/funnel/progress-server.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import {
  validateToken,
  loadProgress,
  advanceProgress,
  logEvent,
} from './progress-server';

beforeEach(() => {
  mockFrom.mockReset();
});

describe('validateToken', () => {
  it('returns ok=false when identity is missing fields', async () => {
    const r = await validateToken({ leadId: '', token: '' });
    expect(r.ok).toBe(false);
  });

  it('returns ok=false when token does not match', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: { id: 'lead-1', funnel_token: 'server-token' },
              error: null,
            }),
          }),
        }),
      }),
    });
    const r = await validateToken({ leadId: 'lead-1', token: 'wrong' });
    expect(r.ok).toBe(false);
    expect(r.leadId).toBeNull();
  });

  it('returns ok=true when token matches', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: { id: 'lead-1', funnel_token: 'abc' },
              error: null,
            }),
          }),
        }),
      }),
    });
    const r = await validateToken({ leadId: 'lead-1', token: 'abc' });
    expect(r.ok).toBe(true);
    expect(r.leadId).toBe('lead-1');
  });
});

describe('loadProgress', () => {
  it('returns null when row missing', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    });
    expect(await loadProgress('lead-1')).toBeNull();
  });

  it('returns mapped progress', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              lead_id: 'lead-1',
              current_lesson: 2,
              completed_lessons: [1],
              finished_at: null,
            },
            error: null,
          }),
        }),
      }),
    });
    const p = await loadProgress('lead-1');
    expect(p).toEqual({
      leadId: 'lead-1',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
  });
});

describe('advanceProgress', () => {
  it('advances from lesson 2 to 3 and appends completed', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'funnel_progress') {
        // First call: loadProgress. Second call: update.
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { lead_id: 'lead-1', current_lesson: 2, completed_lessons: [1], finished_at: null },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                maybeSingle: async () => ({
                  data: { lead_id: 'lead-1', current_lesson: 3, completed_lessons: [1, 2], finished_at: null },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return { select: () => ({}) };
    });
    const p = await advanceProgress('lead-1', 2);
    expect(p?.currentLesson).toBe(3);
    expect(p?.completedLessons).toEqual([1, 2]);
  });
});

describe('logEvent', () => {
  it('inserts a funnel_events row', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });
    await logEvent({ leadId: 'lead-1', eventType: 'lesson_opened', lessonIndex: 1 });
    expect(insert).toHaveBeenCalledWith({
      lead_id: 'lead-1',
      event_type: 'lesson_opened',
      lesson_index: 1,
      meta: {},
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test -- --run lib/funnel/progress-server.test.ts
```

Expected: 7 tests pass.

### Task 3.3: Extend Bitrix lead route with `funnel` source

**Files:**
- Modify: `app/api/bitrix/lead/route.ts`

- [ ] **Step 1: Read the current SourcePage type and SOURCE_ID constants**

```bash
grep -n "type SourcePage\|SOURCE_ID_BY_PAGE\|gameStage" app/api/bitrix/lead/route.ts
```

Capture the line ranges before editing.

- [ ] **Step 2: Extend the union and map**

Edit `app/api/bitrix/lead/route.ts`:
- Change `type SourcePage = 'home' | 'target' | 'game';` to
  ```ts
  type SourcePage = 'home' | 'target' | 'game' | 'funnel';
  ```
- Add to `SOURCE_ID_BY_PAGE`:
  ```ts
  funnel: 'SALESUP_FUNNEL',
  ```
- In the stage-selection logic, treat `sourcePage === 'funnel'` as `STAGE_NEW` (the existing default); no `UC_GAME_*` handling for funnel. If the current code uses a switch, add a `case 'funnel': return STAGE_NEW;` branch. If it uses an if-chain, add `if (sourcePage === 'funnel') return STAGE_NEW;` before the generic fallback.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run existing bitrix/lead tests (if any)**

```bash
npm run test -- --run app/api/bitrix 2>&1 | tail -10
```

Expected: either no tests (file didn't exist) or all pass. If failing, fix before committing.

### Task 3.4: Lead payload builder

**Files:**
- Create: `lib/funnel/lead-payload.ts`

- [ ] **Step 1: Write the file**

```ts
import 'server-only';

export interface FunnelLeadInput {
  name: string;
  phone: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  landingUrl?: string | null;
}

export function buildLeadDbRow(input: FunnelLeadInput, funnelToken: string) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    source_page: 'funnel' as const,
    funnel_token: funnelToken,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_content: input.utmContent ?? null,
    utm_term: input.utmTerm ?? null,
    referrer: input.referrer ?? null,
    device_type: input.deviceType ?? null,
    browser: input.browser ?? null,
  };
}

export function buildBitrixBody(input: FunnelLeadInput) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    sourcePage: 'funnel' as const,
    gameStage: null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    utmContent: input.utmContent ?? null,
    utmTerm: input.utmTerm ?? null,
    referrer: input.referrer ?? null,
    deviceType: input.deviceType ?? null,
    browser: input.browser ?? null,
    landingUrl: input.landingUrl ?? null,
  };
}

export function isValidFunnelLeadInput(input: unknown): input is FunnelLeadInput {
  if (typeof input !== 'object' || input === null) return false;
  const r = input as Record<string, unknown>;
  if (typeof r.name !== 'string' || r.name.trim().length < 2) return false;
  if (typeof r.phone !== 'string' || r.phone.trim().length < 7) return false;
  return true;
}
```

### Task 3.5: Commit phase 3

- [ ] **Step 1: Stage and commit**

```bash
git add lib/funnel/progress-server.ts lib/funnel/progress-server.test.ts lib/funnel/lead-payload.ts app/api/bitrix/lead/route.ts
git commit -m "feat(funnel): add server helpers and extend bitrix lead route"
```

---

## Phase 4 — API routes

### Task 4.1: `POST /api/funnel/lead`

**Files:**
- Create: `app/api/funnel/lead/route.ts`
- Create: `app/api/funnel/lead/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertLeadSingle = vi.fn();
const insertProgress = vi.fn().mockResolvedValue({ error: null });
const logEventInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'leads') {
        return {
          insert: () => ({
            select: () => ({ single: insertLeadSingle }),
          }),
        };
      }
      if (table === 'funnel_progress') {
        return { insert: insertProgress };
      }
      if (table === 'funnel_events') {
        return { insert: logEventInsert };
      }
      return {};
    },
  }),
}));

vi.mock('@/lib/bitrix/client', () => ({
  bitrixCall: vi.fn().mockResolvedValue(1234),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  insertLeadSingle.mockReset();
  insertProgress.mockClear();
  logEventInsert.mockClear();
});

describe('POST /api/funnel/lead', () => {
  it('returns 400 on invalid payload', async () => {
    const res = await POST(req({ name: '', phone: '' }));
    expect(res.status).toBe(400);
  });

  it('creates lead, progress row, event, and returns token+next_url on 201', async () => {
    insertLeadSingle.mockResolvedValue({
      data: { id: 'lead-uuid', funnel_token: 'tok-uuid' },
      error: null,
    });
    const res = await POST(
      req({ name: 'Ali', phone: '+998901112233', landingUrl: 'http://x' }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.lead_id).toBe('lead-uuid');
    expect(body.token).toBe('tok-uuid');
    expect(body.next_url).toBe('/start/dars/1');
    expect(insertProgress).toHaveBeenCalledWith({ lead_id: 'lead-uuid' });
    expect(logEventInsert).toHaveBeenCalled();
  });

  it('still returns 201 if bitrix call throws (fail-open)', async () => {
    const bitrix = await import('@/lib/bitrix/client');
    (bitrix.bitrixCall as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('bitrix down'),
    );
    insertLeadSingle.mockResolvedValue({
      data: { id: 'lead-uuid', funnel_token: 'tok-uuid' },
      error: null,
    });
    const res = await POST(req({ name: 'Ali', phone: '+998901112233' }));
    expect(res.status).toBe(201);
  });

  it('returns 500 if lead insert fails', async () => {
    insertLeadSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await POST(req({ name: 'Ali', phone: '+998901112233' }));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run app/api/funnel/lead
```

Expected: fails — route file does not exist yet.

- [ ] **Step 3: Write the route**

```ts
// app/api/funnel/lead/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { bitrixCall } from '@/lib/bitrix/client';
import {
  buildLeadDbRow,
  buildBitrixBody,
  isValidFunnelLeadInput,
} from '@/lib/funnel/lead-payload';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidFunnelLeadInput(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const funnelToken = randomUUID();
  const admin = createAdminClient();

  const { data: leadRow, error: insertErr } = await admin
    .from('leads')
    .insert(buildLeadDbRow(body, funnelToken))
    .select('id, funnel_token')
    .single();

  if (insertErr || !leadRow) {
    return NextResponse.json({ error: 'lead_insert_failed' }, { status: 500 });
  }

  const leadId = leadRow.id as string;

  // Best-effort Bitrix. Fail-open: log but don't block the user.
  try {
    await bitrixCall('crm.lead.add', {
      fields: {
        TITLE: `SalesUp Funnel · ${body.name}`,
        NAME: body.name,
        PHONE: [{ VALUE: body.phone, VALUE_TYPE: 'WORK' }],
        SOURCE_ID: 'SALESUP_FUNNEL',
        CATEGORY_ID: Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334),
        COMMENTS: JSON.stringify(buildBitrixBody(body)),
      },
    });
  } catch (err) {
    console.error('[funnel/lead] bitrix failed (non-fatal):', err);
  }

  await admin.from('funnel_progress').insert({ lead_id: leadId });

  await admin.from('funnel_events').insert({
    lead_id: leadId,
    event_type: 'lead_created',
    lesson_index: null,
    meta: {},
  });

  return NextResponse.json(
    {
      lead_id: leadId,
      token: leadRow.funnel_token,
      next_url: '/start/dars/1',
    },
    { status: 201 },
  );
}
```

- [ ] **Step 4: Run tests — they should pass**

```bash
npm run test -- --run app/api/funnel/lead
```

Expected: all 4 tests pass.

### Task 4.2: `POST /api/funnel/state`

**Files:**
- Create: `app/api/funnel/state/route.ts`
- Create: `app/api/funnel/state/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const validateTokenMock = vi.fn();
const loadProgressMock = vi.fn();

vi.mock('@/lib/funnel/progress-server', () => ({
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
  loadProgress: (...a: unknown[]) => loadProgressMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  validateTokenMock.mockReset();
  loadProgressMock.mockReset();
});

describe('POST /api/funnel/state', () => {
  it('returns 401 on invalid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(401);
  });

  it('returns 200 with progress', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    loadProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      current_lesson: 2,
      completed_lessons: [1],
      finished_at: null,
    });
  });

  it('returns 404 when progress row is missing', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    loadProgressMock.mockResolvedValue(null);
    const res = await POST(req({ lead_id: 'l', token: 't' }));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npm run test -- --run app/api/funnel/state
```

Expected: fails — route missing.

- [ ] **Step 3: Write the route**

```ts
// app/api/funnel/state/route.ts
import { NextResponse } from 'next/server';
import { validateToken, loadProgress } from '@/lib/funnel/progress-server';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  let body: { lead_id?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const res = await validateToken({ leadId: body.lead_id ?? '', token: body.token ?? '' });
  if (!res.ok || !res.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const progress = await loadProgress(res.leadId);
  if (!progress) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    current_lesson: progress.currentLesson,
    completed_lessons: progress.completedLessons,
    finished_at: progress.finishedAt,
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run app/api/funnel/state
```

Expected: 3 tests pass.

### Task 4.3: `POST /api/funnel/quiz`

**Files:**
- Create: `app/api/funnel/quiz/route.ts`
- Create: `app/api/funnel/quiz/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const validateTokenMock = vi.fn();
const advanceProgressMock = vi.fn();
const logEventMock = vi.fn().mockResolvedValue(undefined);

const adminFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: adminFrom }),
}));

vi.mock('@/lib/funnel/progress-server', () => ({
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
  advanceProgress: (...a: unknown[]) => advanceProgressMock(...a),
  logEvent: (...a: unknown[]) => logEventMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/quiz', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  validateTokenMock.mockReset();
  advanceProgressMock.mockReset();
  logEventMock.mockClear();
  adminFrom.mockReset();
});

describe('POST /api/funnel/quiz', () => {
  it('401 on invalid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 0 }));
    expect(res.status).toBe(401);
  });

  it('400 on malformed body', async () => {
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 99, answer_index: 0 }));
    expect(res.status).toBe(400);
  });

  it('wrong answer returns ok:false and logs quiz_wrong', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    const res = await POST(
      req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 3 }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'quiz_wrong' }),
    );
  });

  it('correct answer on lesson 1 advances and returns next url', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    advanceProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 2,
      completedLessons: [1],
      finishedAt: null,
    });
    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 1, answer_index: 0 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, next_url: '/start/dars/2' });
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'quiz_passed' }),
    );
  });

  it('correct answer on lesson 4 creates/links player and returns simulator url', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    advanceProgressMock.mockResolvedValue({
      leadId: 'l',
      currentLesson: 4,
      completedLessons: [1, 2, 3, 4],
      finishedAt: new Date().toISOString(),
    });

    // leads lookup for name/phone + token
    const leadsChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { name: 'Ali', phone: '+998901112233', funnel_token: 'tok' },
            error: null,
          }),
        }),
      }),
      update: () => ({ eq: () => ({}) }),
    };
    // players lookup by phone returns null (not yet exists)
    const playersLookupChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'player-1' }, error: null }),
        }),
      }),
    };

    adminFrom.mockImplementation((table: string) => {
      if (table === 'leads') return leadsChain;
      if (table === 'players') return playersLookupChain;
      return {};
    });

    const res = await POST(req({ lead_id: 'l', token: 't', lesson: 4, answer_index: 0 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.next_url).toBe('/game/play?lead_token=tok');
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npm run test -- --run app/api/funnel/quiz
```

Expected: fails — route missing.

- [ ] **Step 3: Write the route**

```ts
// app/api/funnel/quiz/route.ts
import { NextResponse } from 'next/server';
import { getQuiz } from '@/lib/funnel/quizzes';
import {
  validateToken,
  advanceProgress,
  logEvent,
} from '@/lib/funnel/progress-server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LessonIndex } from '@/lib/funnel/types';

export const runtime = 'nodejs';

type Body = { lead_id?: string; token?: string; lesson?: number; answer_index?: number };

function isValid(body: Body): body is Required<Body> {
  if (typeof body.lead_id !== 'string' || typeof body.token !== 'string') return false;
  if (![1, 2, 3, 4].includes(body.lesson ?? -1)) return false;
  if (![0, 1, 2, 3].includes(body.answer_index ?? -1)) return false;
  return true;
}

async function resolvePlayerForLead(leadId: string): Promise<{ playerId: string; token: string } | null> {
  const admin = createAdminClient();

  const { data: lead } = await admin
    .from('leads')
    .select('name, phone, funnel_token')
    .eq('id', leadId)
    .maybeSingle();
  if (!lead) return null;

  const { data: existing } = await admin
    .from('players')
    .select('id')
    .eq('phone', lead.phone as string)
    .maybeSingle();

  let playerId: string;
  if (existing) {
    playerId = existing.id as string;
    await admin.from('players').update({ lead_id: leadId }).eq('id', playerId);
  } else {
    const { data: created, error: createErr } = await admin
      .from('players')
      .insert({ name: lead.name, phone: lead.phone, lead_id: leadId })
      .select('id')
      .single();
    if (createErr || !created) return null;
    playerId = created.id as string;
  }

  await admin.from('leads').update({ player_id: playerId }).eq('id', leadId);

  return { playerId, token: lead.funnel_token as string };
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const v = await validateToken({ leadId: body.lead_id!, token: body.token! });
  if (!v.ok || !v.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const quiz = getQuiz(body.lesson!);
  if (!quiz) return NextResponse.json({ error: 'unknown_lesson' }, { status: 400 });

  const isCorrect = body.answer_index === quiz.correctIndex;

  if (!isCorrect) {
    await logEvent({
      leadId: v.leadId,
      eventType: 'quiz_wrong',
      lessonIndex: body.lesson!,
    });
    return NextResponse.json({ ok: false });
  }

  const advanced = await advanceProgress(v.leadId, body.lesson as LessonIndex);
  if (!advanced) {
    return NextResponse.json({ error: 'progress_update_failed' }, { status: 500 });
  }

  await logEvent({
    leadId: v.leadId,
    eventType: 'quiz_passed',
    lessonIndex: body.lesson!,
  });

  if (body.lesson === 4) {
    const player = await resolvePlayerForLead(v.leadId);
    if (!player) {
      return NextResponse.json({ error: 'player_link_failed' }, { status: 500 });
    }
    await logEvent({ leadId: v.leadId, eventType: 'funnel_completed' });
    return NextResponse.json({
      ok: true,
      next_url: `/game/play?lead_token=${encodeURIComponent(player.token)}`,
    });
  }

  return NextResponse.json({
    ok: true,
    next_url: `/start/dars/${(body.lesson as number) + 1}`,
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run app/api/funnel/quiz
```

Expected: all 5 tests pass. If a test for "400 on malformed body" flakes because mocks aren't set up, note the answer-index value `0` is considered falsy in `||` chains — always use `??` when defaulting numeric fields.

### Task 4.4: `POST /api/funnel/event`

**Files:**
- Create: `app/api/funnel/event/route.ts`
- Create: `app/api/funnel/event/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const logEventMock = vi.fn().mockResolvedValue(undefined);
const validateTokenMock = vi.fn();

vi.mock('@/lib/funnel/progress-server', () => ({
  logEvent: (...a: unknown[]) => logEventMock(...a),
  validateToken: (...a: unknown[]) => validateTokenMock(...a),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  logEventMock.mockClear();
  validateTokenMock.mockReset();
});

describe('POST /api/funnel/event', () => {
  it('accepts anon event without token (landing_view)', async () => {
    const res = await POST(req({ event_type: 'landing_view' }));
    expect(res.status).toBe(204);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: null, eventType: 'landing_view' }),
    );
  });

  it('ignores unknown event type with 400', async () => {
    const res = await POST(req({ event_type: 'not_real' }));
    expect(res.status).toBe(400);
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it('validates identity for authed events', async () => {
    validateTokenMock.mockResolvedValue({ ok: false, leadId: null });
    const res = await POST(
      req({ event_type: 'lesson_opened', lead_id: 'l', token: 't', lesson_index: 1 }),
    );
    expect(res.status).toBe(401);
  });

  it('logs authed event on valid token', async () => {
    validateTokenMock.mockResolvedValue({ ok: true, leadId: 'l' });
    const res = await POST(
      req({ event_type: 'lesson_opened', lead_id: 'l', token: 't', lesson_index: 1 }),
    );
    expect(res.status).toBe(204);
    expect(logEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: 'l', eventType: 'lesson_opened', lessonIndex: 1 }),
    );
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test -- --run app/api/funnel/event
```

Expected: fails.

- [ ] **Step 3: Write the route**

```ts
// app/api/funnel/event/route.ts
import { NextResponse } from 'next/server';
import { logEvent, validateToken } from '@/lib/funnel/progress-server';
import type { FunnelEventType } from '@/lib/funnel/types';

export const runtime = 'nodejs';

const ANON_ALLOWED: ReadonlySet<FunnelEventType> = new Set(['landing_view', 'play_clicked']);
const ALL_TYPES: ReadonlySet<FunnelEventType> = new Set([
  'landing_view',
  'play_clicked',
  'lead_created',
  'lesson_opened',
  'quiz_shown',
  'quiz_wrong',
  'quiz_passed',
  'funnel_completed',
  'simulator_redirected',
]);

interface Body {
  event_type?: string;
  lead_id?: string;
  token?: string;
  lesson_index?: number;
  meta?: Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const evt = body.event_type as FunnelEventType | undefined;
  if (!evt || !ALL_TYPES.has(evt)) {
    return NextResponse.json({ error: 'invalid_event_type' }, { status: 400 });
  }

  if (ANON_ALLOWED.has(evt) && !body.lead_id) {
    await logEvent({ leadId: null, eventType: evt, meta: body.meta });
    return new Response(null, { status: 204 });
  }

  const v = await validateToken({
    leadId: body.lead_id ?? '',
    token: body.token ?? '',
  });
  if (!v.ok || !v.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await logEvent({
    leadId: v.leadId,
    eventType: evt,
    lessonIndex: body.lesson_index,
    meta: body.meta,
  });
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run app/api/funnel/event
```

Expected: 4 tests pass.

### Task 4.5: `POST /api/funnel/link-player`

**Files:**
- Create: `app/api/funnel/link-player/route.ts`
- Create: `app/api/funnel/link-player/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const leadsMaybeSingle = vi.fn();
const playersMaybeSingle = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: leadsMaybeSingle }),
          }),
        };
      }
      if (table === 'players') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: playersMaybeSingle }),
          }),
        };
      }
      return {};
    },
  }),
}));

import { POST } from '../route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/funnel/link-player', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  leadsMaybeSingle.mockReset();
  playersMaybeSingle.mockReset();
});

describe('POST /api/funnel/link-player', () => {
  it('401 when token is missing', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(401);
  });

  it('401 when token does not match any lead', async () => {
    leadsMaybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(req({ lead_token: 'nope' }));
    expect(res.status).toBe(401);
  });

  it('404 when lead has no linked player yet', async () => {
    leadsMaybeSingle.mockResolvedValue({
      data: { id: 'l', name: 'A', phone: '+1', player_id: null },
      error: null,
    });
    const res = await POST(req({ lead_token: 'tok' }));
    expect(res.status).toBe(404);
  });

  it('200 with player info when linked', async () => {
    leadsMaybeSingle.mockResolvedValue({
      data: { id: 'l', name: 'Ali', phone: '+998', player_id: 'p1' },
      error: null,
    });
    playersMaybeSingle.mockResolvedValue({
      data: { id: 'p1', name: 'Ali', phone: '+998' },
      error: null,
    });
    const res = await POST(req({ lead_token: 'tok' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      player_id: 'p1',
      name: 'Ali',
      phone: '+998',
    });
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test -- --run app/api/funnel/link-player
```

Expected: fails.

- [ ] **Step 3: Write the route**

```ts
// app/api/funnel/link-player/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logEvent } from '@/lib/funnel/progress-server';

export const runtime = 'nodejs';

interface Body {
  lead_token?: string;
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const token = body.lead_token;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from('leads')
    .select('id, name, phone, player_id')
    .eq('funnel_token', token)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!lead.player_id) {
    return NextResponse.json({ error: 'not_linked' }, { status: 404 });
  }

  const { data: player } = await admin
    .from('players')
    .select('id, name, phone')
    .eq('id', lead.player_id as string)
    .maybeSingle();

  if (!player) {
    return NextResponse.json({ error: 'not_linked' }, { status: 404 });
  }

  await logEvent({
    leadId: lead.id as string,
    eventType: 'simulator_redirected',
  });

  return NextResponse.json({
    player_id: player.id,
    name: player.name,
    phone: player.phone,
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run app/api/funnel/link-player
```

Expected: 4 tests pass.

### Task 4.6: Commit phase 4

- [ ] **Step 1: Stage & commit**

```bash
git add app/api/funnel
git commit -m "feat(funnel): API routes (lead, state, quiz, event, link-player) with tests"
```

---

## Phase 5 — Client helpers

### Task 5.1: LocalStorage identity helpers

**Files:**
- Create: `lib/funnel/progress-client.ts`

- [ ] **Step 1: Write the file**

```ts
'use client';

import type { FunnelIdentity } from './types';

const LS_LEAD_KEY = 'salesup.funnel.lead_id';
const LS_TOKEN_KEY = 'salesup.funnel.token';

export function readIdentity(): FunnelIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const leadId = window.localStorage.getItem(LS_LEAD_KEY);
    const token = window.localStorage.getItem(LS_TOKEN_KEY);
    if (!leadId || !token) return null;
    return { leadId, token };
  } catch {
    return null;
  }
}

export function writeIdentity(id: FunnelIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_LEAD_KEY, id.leadId);
    window.localStorage.setItem(LS_TOKEN_KEY, id.token);
  } catch {
    /* noop */
  }
}

export function clearIdentity(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LS_LEAD_KEY);
    window.localStorage.removeItem(LS_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export async function postFunnelEvent(
  eventType: string,
  extra: { leadId?: string; token?: string; lessonIndex?: number; meta?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await fetch('/api/funnel/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        lead_id: extra.leadId,
        token: extra.token,
        lesson_index: extra.lessonIndex,
        meta: extra.meta,
      }),
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

### Task 5.2: Commit phase 5

- [ ] **Step 1: Commit**

```bash
git add lib/funnel/progress-client.ts
git commit -m "feat(funnel): client-side identity and event helpers"
```

---

## Phase 6 — Components

All components live in `components/funnel/`. Each follows the existing project pattern (default export, named types inline, Tailwind 4 classes using the `@theme inline` tokens).

### Task 6.1: FunnelStepper

**Files:**
- Create: `components/funnel/FunnelStepper.tsx`
- Create: `components/funnel/FunnelStepper.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FunnelStepper from './FunnelStepper';

describe('FunnelStepper', () => {
  it('renders 4 circles with correct states', () => {
    render(<FunnelStepper currentLesson={2} completedLessons={[1]} />);
    expect(screen.getByLabelText(/Dars 1/i)).toHaveAttribute('aria-current', 'false');
    expect(screen.getByLabelText(/Dars 2/i)).toHaveAttribute('aria-current', 'step');
    expect(screen.getByLabelText(/Dars 3/i)).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText(/Dars 4/i)).toHaveAttribute('aria-disabled', 'true');
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test -- --run components/funnel/FunnelStepper
```

- [ ] **Step 3: Write the component**

```tsx
'use client';

import Link from 'next/link';
import { copy } from '@/lib/funnel/copy';
import { TOTAL_LESSONS } from '@/lib/funnel/lessons';
import type { LessonIndex } from '@/lib/funnel/types';

type CircleState = 'done' | 'active' | 'locked';

function stateFor(n: LessonIndex, current: number, completed: LessonIndex[]): CircleState {
  if (completed.includes(n)) return 'done';
  if (n === current) return 'active';
  return 'locked';
}

export default function FunnelStepper({
  currentLesson,
  completedLessons,
}: {
  currentLesson: number;
  completedLessons: LessonIndex[];
}) {
  const indexes: LessonIndex[] = [1, 2, 3, 4];
  return (
    <nav
      aria-label="Darslar progressi"
      className="flex items-center justify-center gap-3 md:gap-5"
    >
      {indexes.map((n, i) => {
        const state = stateFor(n, currentLesson, completedLessons);
        const isLast = i === indexes.length - 1;
        const base =
          'relative flex items-center justify-center rounded-full text-sm font-bold size-10 md:size-12 transition';
        const variants: Record<CircleState, string> = {
          done: 'bg-[color:var(--color-badge-green)] text-white shadow-md',
          active:
            'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary)] animate-pulse-glow',
          locked:
            'bg-[color:var(--color-surface)] text-[color:var(--color-on-surface-variant)] border border-[color:var(--color-on-surface-variant)]/30',
        };

        const label =
          state === 'done'
            ? copy.stepper.doneAria
            : state === 'active'
            ? copy.stepper.currentAria
            : copy.stepper.lockedAria;

        const ariaProps = {
          'aria-current': state === 'active' ? ('step' as const) : ('false' as const),
          'aria-disabled': state === 'locked' ? ('true' as const) : ('false' as const),
          'aria-label': `Dars ${n} — ${label}`,
        };

        const content =
          state === 'done' ? (
            <span className="material-symbols-outlined text-base">check</span>
          ) : state === 'locked' ? (
            <span className="material-symbols-outlined text-base">lock</span>
          ) : (
            <span>{n}</span>
          );

        const circle =
          state === 'locked' ? (
            <span className={`${base} ${variants[state]}`} {...ariaProps}>
              {content}
            </span>
          ) : (
            <Link
              href={`/start/dars/${n}`}
              className={`${base} ${variants[state]} hover:scale-[1.03]`}
              {...ariaProps}
            >
              {content}
            </Link>
          );

        return (
          <span key={n} className="flex items-center gap-3 md:gap-5">
            {circle}
            {!isLast && (
              <span
                aria-hidden
                className="h-px w-6 md:w-10 bg-[color:var(--color-on-surface-variant)]/30"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run test**

```bash
npm run test -- --run components/funnel/FunnelStepper
```

Expected: passes.

### Task 6.2: YouTubeLesson

**Files:**
- Create: `components/funnel/YouTubeLesson.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/CTAButton';
import FadeUp from '@/components/FadeUp';
import { copy } from '@/lib/funnel/copy';
import { WATCH_THRESHOLD } from '@/lib/funnel/lessons';

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, opts: unknown) => unknown;
      PlayerState: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoaded = false;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoaded) {
    return new Promise<void>((resolve) => {
      const handle = () => {
        if (window.YT?.Player) {
          clearInterval(t);
          resolve();
        }
      };
      const t = setInterval(handle, 50);
    });
  }
  ytApiLoaded = true;
  return new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  });
}

export default function YouTubeLesson({
  videoId,
  preCompleted,
  onReadyToProceed,
  onProceedClick,
}: {
  videoId: string;
  preCompleted: boolean;
  onReadyToProceed?: () => void;
  onProceedClick: () => void;
}) {
  const containerId = useRef(`yt-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<{
    getCurrentTime: () => number;
    getDuration: () => number;
    destroy?: () => void;
  } | null>(null);
  const [canProceed, setCanProceed] = useState(preCompleted);

  useEffect(() => {
    if (preCompleted) setCanProceed(true);
  }, [preCompleted]);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled) return;
      // @ts-expect-error YT is a plain global
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          host: 'https://www.youtube-nocookie.com',
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT?.PlayerState.ENDED) {
              setCanProceed(true);
              onReadyToProceed?.();
            }
          },
        },
      });
      interval = setInterval(() => {
        const p = playerRef.current;
        if (!p) return;
        const d = p.getDuration();
        const t = p.getCurrentTime();
        if (d > 0 && t / d >= WATCH_THRESHOLD) {
          setCanProceed(true);
          onReadyToProceed?.();
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      playerRef.current?.destroy?.();
    };
  }, [videoId, onReadyToProceed]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black/80 shadow-xl">
        <div id={containerId.current} className="w-full h-full" />
      </div>
      {canProceed && (
        <FadeUp>
          <CTAButton text={copy.lesson.nextCta} onClickOverride={onProceedClick} />
        </FadeUp>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Adjust `CTAButton` to accept `onClickOverride`**

Inspect `components/CTAButton.tsx`. The default opens the global registration modal via `openModal()`. Add an optional prop:

```tsx
// additions only — do not remove existing behavior
type CTAButtonProps = {
  // ...existing props...
  onClickOverride?: () => void;
};
```

And in the handler:

```tsx
onClick={() => {
  if (props.onClickOverride) {
    trackCTAClick(trackSlug, trackSection);
    props.onClickOverride();
    return;
  }
  trackCTAClick(trackSlug, trackSection);
  openModal();
}}
```

This keeps backward compatibility (current callers don't pass `onClickOverride`) while letting the funnel use `CTAButton` with a custom action.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

### Task 6.3: QuizModal

**Files:**
- Create: `components/funnel/QuizModal.tsx`
- Create: `components/funnel/QuizModal.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizModal from './QuizModal';

const quiz = {
  lesson: 1 as const,
  question: 'Q?',
  options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
  correctIndex: 1 as const,
};

describe('QuizModal', () => {
  it('renders question and options', () => {
    render(<QuizModal quiz={quiz} onSubmit={vi.fn().mockResolvedValue(true)} onBack={vi.fn()} />);
    expect(screen.getByText('Q?')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('calls onSubmit with selected index when Submit clicked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<QuizModal quiz={quiz} onSubmit={onSubmit} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('B'));
    fireEvent.click(screen.getByRole('button', { name: /Javobni yuborish/i }));
    // wait a tick
    await new Promise((r) => setTimeout(r, 0));
    expect(onSubmit).toHaveBeenCalledWith(1);
  });

  it('shows "wrong" message on failed submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    render(<QuizModal quiz={quiz} onSubmit={onSubmit} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByRole('button', { name: /Javobni yuborish/i }));
    // microtask
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByText(/Qayta urinib/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test -- --run components/funnel/QuizModal
```

- [ ] **Step 3: Write the component**

```tsx
'use client';

import { useState } from 'react';
import { copy } from '@/lib/funnel/copy';
import type { QuizQuestion } from '@/lib/funnel/types';

export default function QuizModal({
  quiz,
  onSubmit,
  onBack,
}: {
  quiz: QuizQuestion;
  onSubmit: (answerIndex: number) => Promise<boolean>;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [wrong, setWrong] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    setWrong(false);
    const ok = await onSubmit(selected);
    setSubmitting(false);
    if (!ok) {
      setWrong(true);
      setSelected(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[color:var(--color-surface)] overflow-y-auto"
    >
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-10 gap-8 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-[color:var(--color-on-surface-variant)] underline"
        >
          {copy.quiz.back}
        </button>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-center text-[color:var(--color-on-surface)]">
          {copy.quiz.title}
        </h1>
        <p className="text-lg text-center text-[color:var(--color-on-surface)]">{quiz.question}</p>
        <ul className="flex flex-col gap-3 w-full">
          {quiz.options.map((opt, i) => {
            const active = selected === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(i);
                    setWrong(false);
                  }}
                  className={`w-full text-left rounded-2xl px-5 py-4 border transition ${
                    active
                      ? 'bg-[color:var(--color-primary-container)] text-white border-transparent'
                      : 'bg-white border-[color:var(--color-on-surface-variant)]/30 hover:border-[color:var(--color-primary)]'
                  }`}
                  aria-pressed={active}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
        {wrong && (
          <p
            role="alert"
            className="text-sm font-medium text-[color:var(--color-primary)]"
          >
            {copy.quiz.wrong}
          </p>
        )}
        <button
          type="button"
          disabled={selected === null || submitting}
          onClick={handleSubmit}
          className="rounded-full bg-[color:var(--color-primary)] text-white px-8 py-4 font-bold disabled:opacity-50"
        >
          {submitting ? copy.quiz.submitting : copy.quiz.submit}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run components/funnel/QuizModal
```

Expected: 3 tests pass.

### Task 6.4: GameTeaserBlock

**Files:**
- Create: `components/funnel/GameTeaserBlock.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { copy } from '@/lib/funnel/copy';

export default function GameTeaserBlock() {
  return (
    <aside
      aria-label={copy.gate.teaser.heading}
      className="rounded-2xl border border-[color:var(--color-primary-container)]/40 bg-[color:var(--color-primary-container)]/10 p-4 flex items-start gap-3"
    >
      <span
        aria-hidden
        className="shrink-0 size-10 rounded-full bg-[color:var(--color-primary-container)] text-white flex items-center justify-center"
      >
        <span className="material-symbols-outlined">sports_esports</span>
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-[color:var(--color-on-surface)] leading-tight">
          {copy.gate.teaser.heading}
        </p>
        <p className="text-sm text-[color:var(--color-on-surface)]/80">
          {copy.gate.teaser.body}
        </p>
      </div>
    </aside>
  );
}
```

### Task 6.5: RegistrationGateModal

**Files:**
- Create: `components/funnel/RegistrationGateModal.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
import GameTeaserBlock from './GameTeaserBlock';
import { copy } from '@/lib/funnel/copy';
import { writeIdentity, postFunnelEvent } from '@/lib/funnel/progress-client';

export default function RegistrationGateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [countryId, setCountryId] = useState<string>('uz');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePhoneChange = useCallback((_: string, cId: string, full: string) => {
    setCountryId(cId);
    setFullPhone(full);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(copy.gate.errorName);
      return;
    }
    if (fullPhone.trim().length < 9) {
      setError(copy.gate.errorPhone);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/funnel/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          landingUrl: window.location.href,
          referrer: document.referrer || null,
        }),
      });
      if (!res.ok) {
        setError(copy.gate.errorGeneric);
        setSubmitting(false);
        return;
      }
      const body = (await res.json()) as { lead_id: string; token: string; next_url: string };
      writeIdentity({ leadId: body.lead_id, token: body.token });
      await postFunnelEvent('lead_created', { leadId: body.lead_id, token: body.token });
      router.push(body.next_url);
    } catch {
      setError(copy.gate.errorGeneric);
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="funnel-gate-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-3xl bg-[color:var(--color-surface)] shadow-2xl p-6 md:p-7 flex flex-col gap-5 animate-[scale-in_300ms_cubic-bezier(0.32,0.72,0,1)_forwards]"
      >
        <div className="flex items-start justify-between">
          <h2
            id="funnel-gate-title"
            className="text-xl md:text-2xl font-[family-name:var(--font-heading)] font-bold text-[color:var(--color-on-surface)] leading-tight"
          >
            {copy.gate.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.gate.close}
            className="shrink-0 size-9 rounded-full hover:bg-black/5 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[color:var(--color-on-surface)]/80">
            {copy.gate.nameLabel}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.gate.namePlaceholder}
            autoComplete="name"
            required
            className="rounded-xl border border-[color:var(--color-on-surface-variant)]/30 px-4 py-3 bg-white focus:outline-none focus:border-[color:var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[color:var(--color-on-surface)]/80">
            {copy.gate.phoneLabel}
          </span>
          <PhoneInput
            value={fullPhone}
            countryId={countryId}
            onChange={handlePhoneChange}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[color:var(--color-primary)] text-white font-bold px-6 py-4 disabled:opacity-60"
        >
          {submitting ? copy.gate.submitting : copy.gate.submit}
        </button>

        <GameTeaserBlock />
      </form>
    </div>
  );
}
```

### Task 6.6: FunnelHero

**Files:**
- Create: `components/funnel/FunnelHero.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { copy } from '@/lib/funnel/copy';

export default function FunnelHero() {
  return (
    <section className="flex flex-col items-center gap-5 text-center px-5 pt-10 md:pt-16 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-primary)] font-bold">
        {copy.landing.eyebrow}
      </span>
      <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-[color:var(--color-on-surface)] leading-tight">
        {copy.landing.heading}
      </h1>
      <p className="text-base md:text-lg text-[color:var(--color-on-surface)]/80 max-w-2xl">
        {copy.landing.subheading}
      </p>
      <ul className="flex flex-wrap justify-center gap-2 mt-2">
        {copy.landing.bullets.map((b) => (
          <li
            key={b}
            className="rounded-full bg-[color:var(--color-primary-container)]/15 px-4 py-1.5 text-sm font-medium text-[color:var(--color-on-surface)]"
          >
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### Task 6.7: Commit phase 6

- [ ] **Step 1: Run lint + typecheck + tests**

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run components/funnel lib/funnel app/api/funnel
```

Expected: all green.

- [ ] **Step 2: Commit**

```bash
git add components/funnel components/CTAButton.tsx
git commit -m "feat(funnel): funnel UI components (stepper, player, quiz, gate, teaser, hero)"
```

---

## Phase 7 — Pages

### Task 7.1: `/start/layout.tsx`

**Files:**
- Create: `app/start/layout.tsx`

- [ ] **Step 1: Write the layout**

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SalesUp — 4 ta bepul dars',
  description:
    "Sotuv bo'yicha 4 ta qisqa dars va yakunda interaktiv simulyator.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="uz" className="min-h-dvh bg-[color:var(--color-background)] text-[color:var(--color-on-surface)]">
      {children}
    </div>
  );
}
```

### Task 7.2: `/start/page.tsx`

**Files:**
- Create: `app/start/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
'use client';

import { useEffect, useState } from 'react';
import FunnelHero from '@/components/funnel/FunnelHero';
import FunnelStepper from '@/components/funnel/FunnelStepper';
import RegistrationGateModal from '@/components/funnel/RegistrationGateModal';
import CTAButton from '@/components/CTAButton';
import { LESSONS } from '@/lib/funnel/lessons';
import { copy } from '@/lib/funnel/copy';
import { postFunnelEvent, readIdentity } from '@/lib/funnel/progress-client';

export default function StartPage() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    postFunnelEvent('landing_view');
    // If user already has identity, fast-forward into the funnel.
    const id = readIdentity();
    if (id) {
      fetch('/api/funnel/state', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
      })
        .then(async (res) => (res.ok ? res.json() : null))
        .then((state: null | { current_lesson: number }) => {
          if (state) {
            window.location.replace(`/start/dars/${state.current_lesson}`);
          }
        })
        .catch(() => {
          /* stay on landing */
        });
    }
  }, []);

  const firstVideoId = LESSONS[0].youtubeId;

  const handlePlay = () => {
    postFunnelEvent('play_clicked');
    setModalOpen(true);
  };

  return (
    <>
      <main className="flex flex-col items-center gap-8 pb-16">
        <FunnelHero />
        <FunnelStepper currentLesson={1} completedLessons={[]} />

        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black/80 shadow-xl mx-5">
          <img
            src={`https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg`}
            alt="Dars 1 preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label={copy.landing.playHint}
          >
            <span className="size-20 md:size-24 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition shadow-2xl">
              <span className="material-symbols-outlined text-4xl text-[color:var(--color-primary)]">
                play_arrow
              </span>
            </span>
          </button>
        </div>

        <CTAButton text={copy.landing.playHint} onClickOverride={handlePlay} />
      </main>
      <RegistrationGateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
```

### Task 7.3: `/start/dars/[n]/page.tsx`

**Files:**
- Create: `app/start/dars/[n]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import FunnelStepper from '@/components/funnel/FunnelStepper';
import YouTubeLesson from '@/components/funnel/YouTubeLesson';
import QuizModal from '@/components/funnel/QuizModal';
import { getLesson, TOTAL_LESSONS } from '@/lib/funnel/lessons';
import { getQuiz } from '@/lib/funnel/quizzes';
import { copy } from '@/lib/funnel/copy';
import { readIdentity, postFunnelEvent } from '@/lib/funnel/progress-client';
import type { LessonIndex } from '@/lib/funnel/types';

export default function LessonPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = use(params);
  const lessonNumber = Number(n);
  const router = useRouter();
  const lesson = getLesson(lessonNumber);
  const quiz = getQuiz(lessonNumber);

  const [currentLesson, setCurrentLesson] = useState<number>(lessonNumber);
  const [completed, setCompleted] = useState<LessonIndex[]>([]);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    const id = readIdentity();
    if (!id) {
      router.replace('/start');
      return;
    }
    postFunnelEvent('lesson_opened', {
      leadId: id.leadId,
      token: id.token,
      lessonIndex: lessonNumber,
    });
    fetch('/api/funnel/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/start');
          return null;
        }
        return res.json() as Promise<{
          current_lesson: number;
          completed_lessons: LessonIndex[];
        }>;
      })
      .then((state) => {
        if (!state) return;
        setCurrentLesson(state.current_lesson);
        setCompleted(state.completed_lessons ?? []);
        setStateLoaded(true);
        // Block future-only navigation.
        if (lessonNumber > state.current_lesson) {
          router.replace(`/start/dars/${state.current_lesson}`);
        }
      })
      .catch(() => router.replace('/start'));
  }, [lessonNumber, router]);

  if (!lesson || !quiz) {
    return (
      <main className="p-10 text-center">
        <p>404</p>
      </main>
    );
  }

  const preCompleted = completed.includes(lessonNumber as LessonIndex);

  const handleProceed = () => {
    if (preCompleted) {
      if (lessonNumber >= TOTAL_LESSONS) {
        router.replace('/');
        return;
      }
      router.push(`/start/dars/${lessonNumber + 1}`);
      return;
    }
    const id = readIdentity();
    postFunnelEvent('quiz_shown', {
      leadId: id?.leadId,
      token: id?.token,
      lessonIndex: lessonNumber,
    });
    setQuizOpen(true);
  };

  const handleQuizSubmit = async (answerIndex: number): Promise<boolean> => {
    const id = readIdentity();
    if (!id) return false;
    const res = await fetch('/api/funnel/quiz', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lead_id: id.leadId,
        token: id.token,
        lesson: lessonNumber,
        answer_index: answerIndex,
      }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok: boolean; next_url?: string };
    if (!body.ok) return false;
    if (body.next_url) {
      window.location.href = body.next_url;
    }
    return true;
  };

  return (
    <main className="flex flex-col items-center gap-6 pt-6 pb-16 px-5">
      <p className="text-sm text-[color:var(--color-on-surface-variant)]">
        {copy.lesson.stepCaption(lessonNumber, TOTAL_LESSONS)}
      </p>
      <FunnelStepper currentLesson={currentLesson} completedLessons={completed} />
      {stateLoaded && (
        <YouTubeLesson
          videoId={lesson.youtubeId}
          preCompleted={preCompleted}
          onProceedClick={handleProceed}
        />
      )}
      {quizOpen && (
        <QuizModal
          quiz={quiz}
          onSubmit={handleQuizSubmit}
          onBack={() => setQuizOpen(false)}
        />
      )}
    </main>
  );
}
```

### Task 7.4: Commit phase 7

- [ ] **Step 1: Lint / typecheck**

```bash
npm run lint
npx tsc --noEmit
```

Expected: green.

- [ ] **Step 2: Commit**

```bash
git add app/start
git commit -m "feat(funnel): /start landing and /start/dars/[n] pages"
```

---

## Phase 8 — Game onboarding skip

### Task 8.1: Modify `/game` to accept `lead_token`

**Files:**
- Modify: `app/(game)/game/page.tsx`

- [ ] **Step 1: Read the current onboarding state machine in `GameHubInner`**

Open `app/(game)/game/page.tsx`. Locate the effect that checks `player` / `hasActiveSession` and the JSX that renders `OnboardingSequence`.

- [ ] **Step 2: Add lead-token bootstrap effect**

At the top of `GameHubInner`, add a new effect (running once after `isInitialized`):

```tsx
useEffect(() => {
  if (!isInitialized) return;
  const leadToken = searchParams.get('lead_token');
  if (!leadToken) return;
  if (player) return; // already loaded
  let cancelled = false;
  (async () => {
    try {
      const res = await fetch('/api/funnel/link-player', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lead_token: leadToken }),
      });
      if (!res.ok || cancelled) return;
      const linked = (await res.json()) as { player_id: string; name: string; phone: string };
      await loadPlayer(linked.player_id);
    } catch {
      /* fall back to normal onboarding */
    }
  })();
  return () => {
    cancelled = true;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isInitialized, searchParams, player]);
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors. If `loadPlayer` has a different signature (e.g., requires `{id}` object), match it.

- [ ] **Step 4: Manual smoke (local dev)**

```bash
npm run dev
```

In browser: open `http://localhost:3000/game/play?lead_token=FAKE` — should silently fall through to current onboarding. Open with a real token after completing a funnel run — should skip registration.

- [ ] **Step 5: Commit**

```bash
git add app/\(game\)/game/page.tsx
git commit -m "feat(funnel): /game reads ?lead_token= and skips onboarding"
```

---

## Phase 9 — Final checks

### Task 9.1: Full lint + typecheck + test run

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Expected: 0 errors (pre-existing warnings allowed but ideally none introduced).

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Full test suite**

```bash
npm run test
```

Expected: all pass.

### Task 9.2: Manual QA checklist (from spec §12)

Run `npm run dev` and walk through each of the spec's manual test steps:

- [ ] 1. `/start` loads in Chrome + Safari mobile; YouTube preview visible.
- [ ] 2. Click Play → modal appears; click outside → modal closes; no lead created (check `leads` in Supabase).
- [ ] 3. Submit form with empty phone → inline error, modal stays open.
- [ ] 4. Submit form with valid data → redirect to `/start/dars/1`; `leads`, `funnel_progress`, `funnel_events` rows appear in Supabase; Bitrix shows a lead with `SOURCE_ID = SALESUP_FUNNEL`.
- [ ] 5. Reload on `/start/dars/2` → returns to `/start/dars/2`; stepper shows Lesson 1 as done.
- [ ] 6. Click Lesson 1 circle on stepper → navigates back; CTA is immediately visible; clicking it skips the quiz and returns to Lesson 2.
- [ ] 7. On an unfinished lesson, reach 88 % of the video → CTA fades in; click → quiz modal appears.
- [ ] 8. Submit wrong answer → `Qayta urinib ko'ring` message shown; submit correct → advance to next lesson.
- [ ] 9. Complete lesson 4 → redirected to `/game/play?lead_token=...`; game opens straight into character/scenario selection without re-entering name/phone.
- [ ] 10. Open `/game` in an incognito window without token → onboarding form appears (regression check passes).

### Task 9.3: Update CLAUDE.md / memory if anything surprised us

- [ ] **Step 1: If any new patterns emerged that future sessions should know, add a short note.** Otherwise skip.

### Task 9.4: Final phase commit / tag (optional)

If all QA passes:

```bash
git log --oneline -15
```

Review the commit chain for clarity. No squash unless the user asks.

---

## Post-implementation follow-ups (out of scope here)

- Replace placeholder YouTube IDs in `lib/funnel/lessons.ts`.
- Replace placeholder quizzes in `lib/funnel/quizzes.ts`.
- Add dashboard tiles for `funnel_events` (new phase of Dashboard 2.0).
- Consider moving quizzes to a DB table if editorial needs emerge.

---

## Self-Review Notes

1. **Spec coverage:**
   - §3 scope "Public `/start` landing" → Task 7.2 ✅
   - §3 "Lesson pages `/start/dars/[n]`" → Task 7.3 ✅
   - §3 "Fullscreen quiz modal" → Task 6.3 ✅
   - §3 "Non-fullscreen registration modal with teaser block" → Tasks 6.4, 6.5 ✅
   - §3 "Supabase schema" → Tasks 1.1, 1.2 ✅
   - §3 "Bitrix with `SALESUP_FUNNEL`" → Task 3.3 ✅
   - §3 "Progress persistence" → Tasks 3.1, 4.2, 5.1 ✅
   - §3 "Navigation to completed lessons" → Task 6.1 (stepper) + Task 7.3 (preCompleted branch) ✅
   - §3 "Passing identity into `/game`" → Tasks 4.5, 8.1 ✅
   - §3 "Basic funnel metrics" → every API route logs events; Task 9 checks capture ✅
   - §3 "Uzbek-only, plain copy module" → Task 2.5 ✅
   - §11 "Phone uniqueness + dedup on lesson 4" → Task 1.1 (unique index) + Task 4.3 (`resolvePlayerForLead` logic) ✅

2. **Placeholder scan:** Only intentional placeholders remain — YouTube IDs and quiz content are explicitly marked "REPLACE" with a comment. No "TBD" / "TODO" / "fill in later" in any task step.

3. **Type consistency:**
   - `FunnelIdentity` used in `progress-server`, `progress-client`, routes — consistent.
   - `LessonIndex` used in `types`, `progress-server`, `quiz` route, pages — consistent.
   - API response shapes (`lead_id`, `token`, `next_url`, `ok`) match across `/api/funnel/lead` / `/api/funnel/quiz` and client consumers in pages.
   - LocalStorage keys `salesup.funnel.lead_id`, `salesup.funnel.token` defined in `progress-client` and referenced nowhere else — single source.
