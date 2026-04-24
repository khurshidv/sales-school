# Sales Funnel — 4 YouTube lessons before the simulator

**Status:** Draft, awaiting user review
**Date:** 2026-04-24
**Owner:** Xurshid
**Language:** UI is Uzbek only (`uz`). Internal code/comments in English.

---

## 1. Goal

Build a public onboarding funnel that takes a visitor from an Instagram/Target ad through four short video lessons with quiz gates, then hands them off to the existing sales simulator at `/game` — **without** forcing a second registration form.

Business goal: warm leads with content, qualify them with quizzes, and deliver them to the simulator already identified (one registration, not two).

---

## 2. User journey

1. Visitor arrives at `/start` (from Instagram bio, ad click, referral link).
2. Sees hero with Uzbek headline, a progress stepper (four circles, all locked), a YouTube preview of Lesson 1, and a bullet list of what they'll get (4 lessons + simulator).
3. Clicks Play on the preview → a non-fullscreen modal opens over the dimmed page; the preview remains visible behind it.
4. Modal shows a registration form (`name`, `phone`) and, **below the submit button**, a distinct block: icon + heading *"Barcha darslarni tamomlasangiz"* + two lines about the sales simulator they unlock.
5. User submits → lead is created in Supabase + Bitrix → `funnel_progress` row is created → LS gets `{ lead_id, token }` → client redirects to `/start/dars/1`.
6. On `/start/dars/1`: full YouTube embed autoplays, stepper shows Lesson 1 as active. When `currentTime / duration ≥ 0.88`, a `"Keyingi darsga o'tish"` CTA fades in.
7. Click CTA → **fullscreen** quiz modal with question + 4 options → user selects + submits:
   - **Correct** → modal closes → navigate to `/start/dars/2`, lesson marked complete in DB. On lesson 4 correct answer: server creates `players` row linked to this `lead_id` and returns a redirect to `/game/play?lead_token=...`.
   - **Wrong** → modal stays open, shows *"Qayta urinib ko'ring"* inline, resets selection. No attempt limit.
8. Repeat for lessons 2, 3, 4.
9. After lesson 4 quiz passes: hard redirect to `/game/play?lead_token=...`. The `/game` app reads the token, fetches the linked `players` row, and skips its onboarding form.
10. Reload on any lesson: LS provides `lead_id + token` → client fetches `/api/funnel/state` → renders current lesson with correct stepper state and completed-lessons navigation.
11. Returning to a completed lesson: stepper circle is clickable, video plays from 0, "Keyingi darsga" CTA is **visible from the start** (already passed), quiz is not shown again.

---

## 3. Scope

### In scope

- Public `/start` landing with hero, stepper, YouTube preview.
- Registration modal (not full-screen) with game teaser block under submit.
- Lesson pages `/start/dars/[n]` for n in 1..4, YouTube embed, gated CTA at 88% playback.
- Fullscreen quiz modal (4 options, 1 correct, unlimited retries, no hints).
- Supabase schema: new `funnel_progress`, `funnel_events` tables; `leads` gets `funnel_token` + `player_id`; `players` gets `lead_id`.
- Bitrix lead creation with new `SOURCE_ID = SALESUP_FUNNEL`, category `334`.
- Progress persistence across reloads (LS + server).
- Navigation back to completed lessons (stepper).
- Passing identity into `/game` so the simulator onboarding is skipped for funnel visitors.
- Basic funnel metrics as `funnel_events` rows (see §8).
- Uzbek copy only, stored flat in `lib/funnel/copy.ts`.

### Out of scope (explicitly)

- Admin UI to edit quizzes (quizzes live in `lib/funnel/quizzes.ts`; move to DB later if editorial need emerges).
- Cross-device progress sync (LS-only; changing browser = restart from Lesson 1 but the original lead stays in Bitrix).
- Video watch-time / retention / heatmap analytics.
- Russian translation of the funnel (game stays bilingual; funnel is Uzbek-only per product decision).
- Changes to the `/game` onboarding UX beyond accepting `?lead_token=...` and skipping the form when valid.
- Dashboard UI for the new metrics (data is captured; rendering is a follow-up).

---

## 4. Architecture

### 4.1 Stack alignment

- Next.js 16 App Router, TS strict, Tailwind 4 (`@theme inline` in `app/globals.css`), Vitest, Framer Motion.
- No new dependencies. YouTube IFrame API is loaded via a plain `<script>` injection (no `react-youtube` package).

### 4.2 Route map

| Route | Type | Purpose |
|---|---|---|
| `/start` | public page | Landing with hero + YouTube preview + CTA |
| `/start/dars/[n]` | public page, dynamic (n=1..4) | Lesson player + quiz gate |
| `/api/funnel/lead` | POST | Create lead + Bitrix + progress row |
| `/api/funnel/state` | POST | Load progress for `{lead_id, token}` |
| `/api/funnel/quiz` | POST | Submit answer; on lesson 4 correct, create player |
| `/api/funnel/event` | POST | Append to `funnel_events` |
| `/game` and `/game/play` | existing, modified | Accept `?lead_token=...`, skip onboarding if valid |

### 4.3 Data flow

```
[Instagram ad] → /start → click Play → RegistrationGateModal
                                       ↓ POST /api/funnel/lead
                                  (lead + bitrix + funnel_progress + token)
                                       ↓ LS set {lead_id, token}
                                       ↓ router.push('/start/dars/1')
/start/dars/1 → YouTubeLesson → watched to 88% → QuizModal
                                       ↓ POST /api/funnel/quiz (lesson=1)
                                 correct → router.push('/start/dars/2')
...lesson 4 correct → server creates players row → returns next_url
                                       ↓ router.replace('/game/play?lead_token=...')
/game/play: reads lead_token → finds players row → skips onboarding
```

### 4.4 Files to add

```
app/start/
├── layout.tsx                     # Forces Uzbek, sets metadata
├── page.tsx                       # Landing
└── dars/[n]/page.tsx              # Lesson page

app/api/funnel/
├── lead/route.ts
├── state/route.ts
├── quiz/route.ts
└── event/route.ts

components/funnel/
├── FunnelStepper.tsx              # 4 circles with lock/check/current states
├── YouTubeLesson.tsx              # IFrame API wrapper + playback tick + CTA gate
├── RegistrationGateModal.tsx      # Uses PhoneInput, wraps RegistrationModal logic
├── GameTeaserBlock.tsx            # Block under submit, sells the simulator bonus
├── QuizModal.tsx                  # Fullscreen quiz w/ retry loop
└── FunnelHero.tsx                 # Landing hero composition

lib/funnel/
├── copy.ts                        # All Uzbek strings
├── quizzes.ts                     # Questions + options + correctIndex (typed)
├── lessons.ts                     # Lesson metadata: youtubeId, duration (hint only), title
├── progress-client.ts             # LS helpers, typed
└── progress-server.ts             # Supabase progress read/write, token validation

supabase/migrations/
├── 033_funnel_schema.sql          # funnel_progress, funnel_events, leads.funnel_token, leads.player_id, players.lead_id
└── 034_funnel_rls.sql             # RLS: anon no access; service role full
```

### 4.5 Files to modify

- `app/(game)/game/page.tsx` — read `?lead_token=...`, call `/api/funnel/link-player` (or equivalent inline logic), skip registration when the token resolves to an existing player.
- `components/RegistrationModal.tsx` — **no changes** (we compose a new `RegistrationGateModal` that reuses `PhoneInput` and the same insert logic through a shared helper).
- `lib/bitrix/client.ts` or `app/api/bitrix/lead/route.ts` — extend the `sourcePage` union with `'funnel'` and add `SALESUP_FUNNEL` SOURCE_ID constant.

---

## 5. Database schema

### Migration `033_funnel_schema.sql`

```sql
alter table public.leads
  add column if not exists funnel_token uuid,
  add column if not exists player_id uuid references public.players(id) on delete set null;

create index if not exists idx_leads_funnel_token on public.leads(funnel_token);

alter table public.players
  add column if not exists lead_id uuid references public.leads(id) on delete set null;

create index if not exists idx_players_lead_id on public.players(lead_id);

-- Enforce phone as de-facto unique player identifier.
-- Precondition: no duplicate phones currently exist; verify with a dry-run query
-- before applying this migration. If duplicates exist, clean them up first.
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
begin new.updated_at = now(); return new; end; $$;

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

### Migration `034_funnel_rls.sql`

RLS: all funnel tables are server-only. `anon` has no access; `service_role` has full access. All reads/writes from the browser go through Next.js API routes that validate `{ lead_id, token }`.

### Token model

- `leads.funnel_token = gen_random_uuid()` set once, on lead creation.
- Client stores `{ lead_id, token }` in LS (keys `salesup.funnel.lead_id` and `salesup.funnel.token`).
- Every funnel API call validates the pair server-side; mismatch = 401.

---

## 6. Components

### 6.1 FunnelStepper

- Four circles `1 2 3 4`, horizontal row, centered.
- States: `locked` (grey, lock icon), `active` (primary-container `#e8790a`, pulse-glow animation), `done` (green `#22c55e`, check icon, clickable link).
- Mobile: circles ~40 px, 12 px gap. Desktop: ~48 px, 20 px gap.
- Above: caption "Dars 2 / 4" in small heading font.
- Uses existing `motion` animations (`scale-in` on mount, `pulse-glow` for active).

### 6.2 YouTubeLesson

- Loads YouTube IFrame API on mount (shared script loader, idempotent).
- Embed URL: `https://www.youtube-nocookie.com/embed/{id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`.
- Tick via `setInterval(500ms)`: read `player.getCurrentTime()` / `player.getDuration()`. When ratio ≥ 0.88 **OR** `onStateChange === ENDED` → expose `canProceed = true`.
- Renders a CTA button (shared `CTAButton` component) that fades in via `FadeUp` when `canProceed`.
- On completed lessons (`lessonStatus === 'done'`): `canProceed = true` from mount; **CTA click navigates directly to the next lesson (or to the simulator on lesson 4) without opening QuizModal** — the quiz is considered already passed and is not re-shown per the "pure shortcut" rule in §2.11.
- Emits `lesson_opened` event on mount and `quiz_shown` on CTA click **only when `lessonStatus !== 'done'`**.

### 6.3 RegistrationGateModal

- Non-fullscreen: centered card, max-width ~420 px, background uses `--color-surface` with shadow and `rounded-3xl`, page content dimmed with `bg-black/40` overlay behind.
- Locked scroll while open.
- Fields: `name` (required, min 2 chars), `phone` (reuse `PhoneInput`, Uzbek format validation).
- Submit: POST to `/api/funnel/lead`. On success, LS store → `router.push('/start/dars/1')`.
- On failure: inline error text below submit button, keep the modal open, allow retry.
- **Below submit button:** `GameTeaserBlock` (see §6.4).

### 6.4 GameTeaserBlock

- Rounded card with `--color-primary-container` background (low opacity variant, ~15%), accent border.
- Icon (controller/game icon from Material Symbols Outlined: `sports_esports`).
- Heading (Uzbek): *"Barcha darslarni tamomlasangiz"*.
- Two-line description: explains that the user unlocks an interactive sales simulator game.
- No screenshot yet (Uzbek copy references the game; visual can be added later).

### 6.5 QuizModal

- Fullscreen (`fixed inset-0`), solid surface background, no page visible behind.
- Vertical stack: question (heading typography), four option buttons, submit button at the bottom.
- Option buttons: full-width, rounded-2xl, outline style, hover/selected state uses `--color-primary`.
- Wrong state: shake animation on option list + inline message *"Qayta urinib ko'ring"*. Selection cleared, submit disabled until re-selected.
- No attempt counter shown to user (unlimited, but each wrong attempt logs a `quiz_wrong` event).
- Accessible: `role="dialog"`, `aria-modal="true"`, focus-trapped, Esc disabled (user must either answer correctly or close via explicit "Orqaga" button that returns to lesson page without losing progress).

---

## 7. API contracts

### POST `/api/funnel/lead`

Request:
```ts
{
  name: string,
  phone: string,
  utm: { source?, medium?, campaign?, content?, term? },
  referrer?: string,
  landingUrl: string
}
```

Response (201):
```ts
{
  lead_id: string,       // uuid
  token: string,         // uuid, store in LS
  next_url: '/start/dars/1'
}
```

Server actions: insert `leads` row (with `funnel_token = gen_random_uuid()`), call `bitrixCall('crm.lead.add', ...)` with `SOURCE_ID: 'SALESUP_FUNNEL'`, insert `funnel_progress` row (`current_lesson = 1`), insert `funnel_events` row (`lead_created`). **Bitrix failure policy:** if Bitrix returns an error or times out, the lead stays in Supabase, the API still returns 201 with `lead_id + token + next_url`, and the Bitrix error is logged server-side only (user sees no error, continues into the funnel). This matches the fail-open behavior of the existing `RegistrationModal`.

### POST `/api/funnel/state`

Request: `{ lead_id, token }`
Response: `{ current_lesson, completed_lessons, finished_at }` or 401 on mismatch.

### POST `/api/funnel/quiz`

Request: `{ lead_id, token, lesson: 1|2|3|4, answer_index: 0|1|2|3 }`
Response:
- Correct, lessons 1-3: `{ ok: true, next_url: '/start/dars/{n+1}' }`
- Correct, lesson 4: `{ ok: true, next_url: '/game/play?lead_token={token}' }` — server has created a `players` row with `players.lead_id = lead_id`, set `funnel_progress.finished_at = now()`, inserted `funnel_completed` event.
- Wrong: `{ ok: false }` — insert `quiz_wrong` event.

### POST `/api/funnel/event`

Fire-and-forget telemetry for client-side events (`landing_view`, `play_clicked`, `quiz_shown`). Request: `{ lead_id?, token?, event_type, lesson_index?, meta? }`. Response 204.

### POST `/api/funnel/link-player`

Request: `{ lead_token }`
Response: `{ player_id, name, phone }` on success, 401 on invalid token.

Server actions: look up `leads` by `funnel_token`; if lead has `player_id`, return that player; otherwise no-op return 404 (funnel wasn't completed). Used by `/game` to bootstrap session without re-registering.

### `/game` entry (modified)

On `/game` page mount: if `?lead_token=...` present, call `/api/funnel/link-player`. On 200: populate the existing onboarding state with `name` and `phone`, skip the registration form, go straight into character/level selection with the linked `player_id`. On 401/404: render current onboarding flow unchanged.

---

## 8. Metrics captured in `funnel_events`

| Event | When | Used for dashboard metric |
|---|---|---|
| `landing_view` | On `/start` mount | Visitors to funnel |
| `play_clicked` | Preview Play button clicked | Intent rate |
| `lead_created` | POST `/api/funnel/lead` success | Form conversion |
| `lesson_opened` | Each `/start/dars/[n]` mount | Lesson reach rate (N watched) |
| `quiz_shown` | CTA clicked on lesson page | Lesson completion intent |
| `quiz_wrong` | Wrong answer submitted | Quiz difficulty signal |
| `quiz_passed` | Correct answer submitted | Lesson completion rate (N finished) |
| `funnel_completed` | Lesson 4 correct | End-to-end conversion |
| `simulator_redirected` | `/game/play` mount with valid token | Handoff confirmation |

UTM and referrer are stored on the `leads` row (existing columns); no need to re-denormalize on events. Dashboard rendering is a follow-up outside this spec.

---

## 9. Uzbek copy (stored in `lib/funnel/copy.ts`)

Draft keys (final wording to be finalized during implementation, but structure is fixed):

```ts
export const copy = {
  landing: {
    eyebrow: 'Sotuv maktabi',
    heading: '4 ta bepul dars — va sotuv simulyatori',
    subheading: 'Har bir darsdan keyin — kichik topshiriq. Barchasini tamomlasangiz — o\'yin ko\'rinishidagi simulyator sizniki.',
    bullets: ['4 ta qisqa video dars', 'Har darsga 1 ta savol', 'Yakunda — sotuv simulyatori'],
    playHint: 'Birinchi darsni ko\'rish',
  },
  gate: {
    title: 'Darsni ko\'rish uchun ma\'lumotlaringizni qoldiring',
    nameLabel: 'Ismingiz',
    phoneLabel: 'Telefon raqamingiz',
    submit: 'Darsni boshlash',
    teaser: {
      heading: 'Barcha darslarni tamomlasangiz',
      body: 'Sotuv simulyatori — interaktiv o\'yin — sizga sovg\'a sifatida beriladi.',
    },
    errorGeneric: 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
  },
  lesson: {
    stepCaption: (n: number, total: number) => `Dars ${n} / ${total}`,
    nextCta: 'Keyingi darsga o\'tish',
  },
  quiz: {
    title: 'Keyingi darsga o\'tish uchun to\'g\'ri javobni tanlang',
    submit: 'Javobni yuborish',
    wrong: 'Qayta urinib ko\'ring',
    back: 'Orqaga',
  },
};
```

---

## 10. Design tokens and reuse

All visual choices map to existing tokens in `app/globals.css` — **no new colors, no new fonts**.

- Backgrounds: `--color-surface` (#fbf9f5) for cards, `--color-background` for page.
- Accent: `--color-primary` (#944a00) for CTAs, `--color-primary-container` (#e8790a) for teaser block.
- Success: existing badge green `#22c55e` for completed stepper circles.
- Text: `--color-on-surface` (#1b1c1a) everywhere.
- Typography: `Space Grotesk` for headings (via `--font-heading`), `Plus Jakarta Sans` for body (`--font-body`). Both already loaded in `app/layout.tsx`.
- Motion: `FadeUp` on section mount, `pulse-glow` on the active stepper circle, `scale-in` on modal entry, shake animation (new, 10 lines of CSS) on quiz wrong.
- Buttons: extend `CTAButton` for the primary CTAs; for the quiz options we create a new `QuizOption` component that uses the same radius and padding rules but outline style.
- Phone input: reuse existing `PhoneInput` component as-is.

---

## 11. Edge cases

- **User refreshes on quiz modal** → modal state is not persisted; user lands back on lesson page, quiz is re-triggered when CTA is clicked again. No progress lost because quiz state was never saved; only `quiz_passed` commits progress.
- **LS cleared mid-funnel** → user returning to `/start` sees the landing again; when they submit the form, a **new** lead is created (no deduplication by phone for simplicity). They restart from Lesson 1. We accept this — duplicate leads are cheap; we optimize cleanliness later if it becomes noisy.
- **Direct URL to `/start/dars/3` without a lead** → middleware (in the lesson page server component) detects missing LS-passed identity via a client guard: a small client wrapper reads LS on mount; if no `lead_id`, it replaces the route with `/start`. Server-side we don't attempt to hide content; lesson pages render the YouTube frame regardless, but the stepper and progress logic stay empty.
- **Same phone registering through funnel twice** → two `leads` rows, one `players` row (phone-unique in `players` per the unique index). Each lead has its own `funnel_progress`. Acceptable.
- **YouTube video unavailable / region-blocked** → error state visible through YouTube's own UI; we don't custom-handle it. CTA remains hidden because `currentTime` never advances. User is stuck — acceptable for MVP; monitor via `lesson_opened` without following `quiz_passed`.
- **Quiz answer submitted with network failure** → button disabled during request, error toast on failure, retry manually. Log a `quiz_wrong` only on server-confirmed wrong; client-only network errors don't pollute.
- **User closes the registration modal** — the modal is dismissable via an explicit close button (top-right X) **and** via clicking the dim overlay behind it. On close, page returns to the `/start` landing with the preview visible, no lead is created, and no extra events are logged beyond `play_clicked` (already fired when Play was pressed).
- **User's phone already exists in `players` when lesson 4 quiz is submitted correctly** — server runs `select id from players where phone = $1` before inserting. If a row exists, the server sets `players.lead_id = lead_id` on that existing row and uses its id as the linked player. No duplicate `players` row is created (phone is treated as the de-facto unique identifier for a player even if the column has no DB-level unique constraint yet; we add one in migration `033` to enforce: `create unique index if not exists idx_players_phone_unique on public.players(phone)` **only if the table has no pre-existing duplicates** — check before applying).

---

## 12. Testing

### Automated (Vitest)

- `lib/funnel/quizzes.test.ts` — validates that exactly four lessons exist, each has 4 options and a `correctIndex in 0..3`.
- `app/api/funnel/lead/route.test.ts` — happy path, Bitrix failure still persists lead, invalid phone rejected.
- `app/api/funnel/quiz/route.test.ts` — correct answer advances, wrong does not, lesson 4 correct creates player, token mismatch returns 401.
- `app/api/funnel/state/route.test.ts` — returns progress, 401 on bad token.
- `components/funnel/QuizModal.test.tsx` — renders options, wrong → shake + message, correct → `onPass` called.

### Manual checklist

1. `/start` loads in Chrome + Safari mobile; YouTube preview visible.
2. Click Play → modal; click outside → modal closes, no lead created.
3. Submit form with bad phone → inline validation error.
4. Submit form with valid data → redirect to `/start/dars/1`; check `leads`, `funnel_progress`, `funnel_events` in Supabase; check Bitrix has a new lead with source `SALESUP_FUNNEL`.
5. Reload on `/start/dars/2` → lands back on `/start/dars/2`, stepper shows Lesson 1 as done.
6. Click Lesson 1 circle on stepper → navigates back, CTA visible immediately (no quiz).
7. Wait for 88% of video → CTA appears; click → quiz modal.
8. Submit wrong → shake + message; submit correct → advance.
9. Complete lesson 4 → redirect to `/game/play?lead_token=...`; game opens directly without asking name/phone.
10. Open incognito → `/game` directly → onboarding form still appears (regression check).

---

## 13. Open items

- **Final Uzbek copy.** Draft in §9 is functional but will be polished once real lesson titles are known.
- **YouTube IDs for the four lessons.** Not yet provided. Stubbed in `lib/funnel/lessons.ts` with `PLACEHOLDER_ID_{1..4}`. Replaced on real delivery.
- **Quiz content.** User will provide. Placeholder in `lib/funnel/quizzes.ts`.
- **Game teaser visual.** Icon-only for now; if a small hero image becomes available, add as an image in `GameTeaserBlock`.
- **Dashboard rendering of funnel metrics.** Data is captured via `funnel_events`; dashboard UI is a follow-up outside this spec (will plug into the existing Dashboard 2.0 phases).

---

## 14. Risks

- **YouTube IFrame API blocked in some corporate networks or ad-blockers.** Mitigation: `youtube-nocookie.com` domain, graceful empty state; CTA only appears after playback progress, so blocked video = user can't advance (acceptable; user can retry).
- **Quiz bypass by opening DevTools and POSTing directly.** Not a security concern — funnel is a lead-warming tool, not a credentialed experience; cheating just lets the user skip to the game, which is fine (they're still a lead).
- **Duplicate leads from cleared LS.** Accepted trade-off. If volume becomes large, add phone-based dedup in `/api/funnel/lead`.

---

## 15. Implementation order (for the plan phase)

1. DB migration + types + `lib/funnel/progress-server.ts`.
2. `lib/funnel/copy.ts`, `lessons.ts`, `quizzes.ts` with placeholders.
3. API routes: `lead`, `state`, `quiz`, `event`.
4. Components: `FunnelStepper`, `YouTubeLesson`, `QuizModal`, `GameTeaserBlock`, `RegistrationGateModal`, `FunnelHero`.
5. Pages: `/start/page.tsx`, `/start/dars/[n]/page.tsx`, `/start/layout.tsx`.
6. `/game` onboarding-skip integration.
7. Vitest suites.
8. Manual QA against the checklist.
