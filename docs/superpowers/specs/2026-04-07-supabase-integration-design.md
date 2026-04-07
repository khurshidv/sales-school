# Phase 5: Supabase Integration — Design Spec

> Sales School RPG — Supabase backend: player persistence, progress, leaderboard, analytics.
> Approved: 2026-04-07

## Architecture: Hybrid

- **API Routes** (Next.js, server-side): Player CRUD, progress save, results, achievements — uses service key
- **Direct Supabase Client** (browser): Analytics (game_events), leaderboard reads, Realtime subscription
- **RLS**: Enabled on all tables

## Database (already exists)

Project: `njbcybjdzjahpdmcjtqe` ("Sales school")

| Table | Purpose | RLS |
|-------|---------|-----|
| players | Lead data (phone, name, avatar, level, xp, score, coins, utm) | ✅ |
| game_progress | Save/resume (player_id, scenario_id, day_id, session_state JSONB) | ✅ |
| completed_scenarios | Day results history (score, rating, time, choices JSONB) | ✅ |
| player_achievements | Unlocked achievements | ✅ |
| leaderboard | Denormalized for fast reads (player_id, display_name, level, total_score) | ✅ |
| game_events | Funnel analytics (event_type, event_data JSONB) | ✅ |

---

## 1. API Routes

### POST /api/game/players

Create or find player by phone.

```ts
// Request
{ phone: string, displayName: string, avatarId: 'male' | 'female',
  utmSource?: string, utmMedium?: string, utmCampaign?: string, referrer?: string }

// Response
{ player: { id: string, phone: string, displayName: string, avatarId: string,
            level: number, totalXp: number, totalScore: number, coins: number } }
```

Logic:
- Upsert by phone (unique constraint)
- If exists → return existing player (don't overwrite name/avatar)
- If new → insert and return
- Server-side: validate phone format (+998, 9 digits)

### POST /api/game/results

Record completed day + update player totals + upsert leaderboard.

```ts
// Request
{ playerId: string, scenarioId: string, dayId: string,
  score: number, rating: string, timeTaken: number, choices: object[] }

// Response
{ success: boolean }
```

Logic (single transaction):
1. Insert into `completed_scenarios`
2. Update `players`: increment total_score, total_xp
3. Upsert `leaderboard`: update total_score, scenarios_completed

### POST /api/game/progress

Save game progress (auto-save).

```ts
// Request
{ playerId: string, scenarioId: string, dayId: string,
  sessionState: object, isCompleted: boolean }

// Response
{ success: boolean }
```

Logic: Upsert by (player_id, scenario_id, day_id).

### POST /api/game/achievements

Record achievement unlock.

```ts
// Request
{ playerId: string, achievementId: string }

// Response
{ success: boolean }
```

Logic: Insert with ON CONFLICT (player_id, achievement_id) DO NOTHING.

---

## 2. Supabase Sync Middleware

**File:** `game/store/middleware/supabaseSync.ts`

Zustand middleware that wraps playerStore actions and syncs to Supabase in background.

**Sync points:**
- `createPlayer()` → POST /api/game/players → store server-side UUID as player.id
- `addCompletedScenario()` → POST /api/game/results
- `addAchievement()` → POST /api/game/achievements

**Behavior:**
- Non-blocking: UI continues immediately, sync happens async
- Error handling: console.warn, don't break the game
- Retry: no retries for MVP (localStorage is fallback)
- On mount: if player exists in localStorage but not confirmed from server, re-sync

**Integration:** Wrap the existing `usePlayerStore` creation with this middleware.

---

## 3. Analytics Client

**File:** `lib/game/analytics.ts`

Direct Supabase client (browser-side, anon key) for fire-and-forget event tracking.

```ts
function trackEvent(
  playerId: string,
  eventType: string,
  eventData?: object,
  scenarioId?: string,
  dayId?: string,
): void
```

**Event types:**
| Event | When |
|-------|------|
| `game_started` | Player starts first scenario |
| `day_started` | Day begins (after intro) |
| `day_completed` | Day finished successfully |
| `day_failed` | Day finished with F rating |
| `choice_made` | Each player choice (stores nodeId, choiceIndex) |
| `achievement_unlocked` | Achievement earned |
| `game_completed` | All 5 days done |
| `dropped_off` | beforeunload event |

**Integration:** Call `trackEvent()` from `useGameEngine` at appropriate moments.

---

## 4. Leaderboard

**File:** `lib/game/hooks/useLeaderboard.ts`

```ts
interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  avatarId: string;
  level: number;
  totalScore: number;
  scenariosCompleted: number;
}

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  playerRank: number | null;
  isLoading: boolean;
}
```

**Implementation:**
- Initial fetch: `supabase.from('leaderboard').select('*').order('total_score', { ascending: false }).limit(50)`
- Realtime: `supabase.channel('leaderboard').on('postgres_changes', ...)` for live updates
- `playerRank`: find current player's position
- Cleanup: unsubscribe on unmount

**Page:** Update `/game/leaderboard` from stub to real leaderboard using this hook.

---

## 5. beforeunload Tracking

**File:** Add to `useGameEngine` or play page.

```ts
useEffect(() => {
  const handler = () => {
    if (player && engine.flowState === 'playing') {
      trackEvent(player.id, 'dropped_off', { dayIndex: currentDayIndex }, scenarioId);
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [player, engine.flowState]);
```

---

## 6. Player Flow Update

Current: PhoneForm → localStorage only
New: PhoneForm → POST /api/game/players → get server UUID → store in localStorage + playerStore

**Returning player:** On mount, if localStorage has player, verify against server (optional — can skip for MVP).

---

## Files to Create/Modify

**Create:**
- `app/api/game/players/route.ts`
- `app/api/game/results/route.ts`
- `app/api/game/progress/route.ts`
- `app/api/game/achievements/route.ts`
- `lib/game/analytics.ts`
- `lib/game/hooks/useLeaderboard.ts`
- `game/store/middleware/supabaseSync.ts`

**Modify:**
- `app/(game)/game/page.tsx` — PhoneForm submit → API call
- `app/(game)/game/play/page.tsx` — add analytics tracking + beforeunload
- `app/(game)/game/leaderboard/page.tsx` — replace stub with real leaderboard
- `lib/game/hooks/useGameEngine.ts` — add analytics calls
- `game/store/playerStore.ts` — integrate sync middleware

**Existing (no changes):**
- `lib/supabase/client.ts` — browser client (already exists)
- `lib/supabase/server.ts` — server client (already exists)
