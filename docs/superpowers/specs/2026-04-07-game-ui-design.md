# Phase 3: Game UI — Design Spec

> Sales School RPG — React UI layer on top of the game engine (Phase 2).
> Approved: 2026-04-07

## Scope & Sub-phases

Phase 3 is split into 3 sub-phases, each independently testable:

| Sub-phase | Scope | Deliverable |
|-----------|-------|-------------|
| **3a: Core Game Loop** | SceneRenderer, DialogueBox, ChoicePanel, CharacterSprite, DayIntroTransition, useGameEngine | Can play through 1 day start-to-finish |
| **3b: HUD + Screens** | GameHUD, LivesDisplay, ScoreDisplay, ComboIndicator, LevelBadge, PhoneForm, ScenarioSelect, DaySummary, GameOver, FinalResults, PauseMenu, RotateDevice | Full game flow from phone entry to final CTA |
| **3c: Polish** | Framer Motion animations, audio integration, image preloading, WebP optimization, leaderboard stub | Production-ready experience |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout | Classic VN (fullscreen bg, character center, dialogue bottom) | Max art space, familiar VN pattern |
| Language | Single language chosen at phone form (UZ/RU), persists for session | Clean UI, no bilingual noise |
| Tap behavior | 1st tap = finish typewriter, 2nd tap = next node | VN standard |
| Choice panel | Prompt stays in dialogue box, choices slide up above it | Player sees question + answers simultaneously |
| Day intro | Ken Burns 5-7s, "Day N" → subtitle → teaser → tap to continue | Atmospheric, no missed text |
| Choice feedback | None during play — results only on DaySummary | Preserves intrigue, adds replay motivation |
| Scenario select | Level carousel with perspective (locked = dark overlay + lock + "Coming Soon") | Clear progression, psychological motivation |
| Final CTA | Dual: primary "Download guide" (Telegram/PDF) + secondary "Talk to expert" | Soft funnel, captures both cold and hot leads |

---

## 1. Game Flow State Machine

`useGameEngine` manages 8 states:

```
IDLE → PHONE_FORM → CHARACTER_SELECT → SCENARIO_SELECT → DAY_INTRO → PLAYING → DAY_SUMMARY → FINAL_RESULTS
```

### Transitions

1. **IDLE** → Player visits `/game` → PHONE_FORM
2. **PHONE_FORM** → name + phone (+998) + language (UZ|RU) + avatar (m/f) → `playerStore.createPlayer()` → CHARACTER_SELECT
3. **CHARACTER_SELECT** → Skip for car-dealership (auto-assigned) → SCENARIO_SELECT
4. **SCENARIO_SELECT** → Level carousel, tap active scenario → preload day 1 assets → DAY_INTRO
5. **DAY_INTRO** → Ken Burns 5-7s + tap to continue → PLAYING
6. **PLAYING** → Engine processes nodes until end node → calculate rating → DAY_SUMMARY
7. **DAY_SUMMARY** → "Next day" → DAY_INTRO (day N+1) OR day 5 done → FINAL_RESULTS
8. **FINAL_RESULTS** → Dual CTA → external link (Telegram/Calendly)

### Special branches

- **Game Over** (lives=0): Modal over PLAYING → "Restart day?" (free first time, 1 coin if replay) → `resetDay()` → DAY_INTRO current day
- **Returning player**: `playerStore.player` exists in localStorage → skip PHONE_FORM → show hub with progress
- **Direct /game/play access**: No scenario param → redirect to `/game`

### Routing

- `/game` — Hub: PHONE_FORM / CHARACTER_SELECT / SCENARIO_SELECT
- `/game/play?scenario=car-dealership` — DAY_INTRO / PLAYING / DAY_SUMMARY / FINAL_RESULTS
- `/game/leaderboard` — Leaderboard page (Phase 3c stub)

---

## 2. Phase 3a Components — Core Game Loop

### useGameEngine (hook — orchestrator)

**Responsibilities:**
- Bridges `gameStore` + `playerStore` + `GameEventBus` with React
- Manages game flow state machine (states above)
- Subscribes to EventBus events, exposes them as callbacks to UI
- Drives timer via `requestAnimationFrame` polling (`getRemaining()` every frame)
- Preloads next day's assets during DAY_SUMMARY
- Handles day transitions: end node → calculate rating → check achievements → award coins/XP → DAY_SUMMARY → startDay(nextDay, previousState)

**API shape:**
```ts
interface UseGameEngine {
  // State
  flowState: GameFlowState; // 'day_intro' | 'playing' | 'day_summary' | 'final_results'
  currentNode: ScenarioNode | null;
  session: GameSessionState | null;
  player: PlayerState | null;

  // Actions
  startScenario: (scenarioId: string) => void;
  advanceDialogue: () => void;
  selectChoice: (index: number) => void;
  selectMultiChoices: (indices: number[]) => void;
  confirmNextDay: () => void;
  restartDay: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;

  // Derived
  timerRemaining: number | null; // seconds, updated via RAF
  availableChoices: ChoiceOption[]; // filtered by conditions
  dayResults: DayResults | null; // calculated after end node
  finalResults: FinalResults | null; // calculated after day 5
}
```

### SceneRenderer

- Container: `position: relative`, full viewport, 16:9 aspect ratio
- Background: `<img>` with `object-fit: cover`, from current node's `background` field or day default
- Renders `CharacterSprite` on top of background
- Tap anywhere (except HUD zone) → `advanceDialogue()` if current node is dialogue/day_intro
- Tap disabled during choice nodes

### CharacterSprite

- Positioned: bottom 30%, horizontally centered
- Source: `CHARACTERS[speaker].assetPath(emotion)` → `/assets/scenarios/car-dealership/characters/chr_{id}_{emotion}.png`
- Animations:
  - New character: fade-in 300ms
  - Emotion change (same character): crossfade 200ms
  - Exit: fade-out 200ms
- Hidden when: `speaker` is narrator, no speaker, or node type is day_intro/end without dialogue
- Size: max-height 60% of viewport, auto width

### DialogueBox

- Position: bottom 0, full width, ~25% viewport height
- Background: `rgba(0, 0, 0, 0.85)`, top border `2px solid #4a90d9`
- Speaker name: `CHARACTERS[speaker].name[lang]`, color `#4a90d9`, bold
- Text: `node.text[lang]`, color `#e0e0e0`, line-height 1.5
- **Typewriter effect:**
  - Speed: 30ms per character
  - 1st tap while typing → show full text instantly
  - 2nd tap (text complete) → `advanceDialogue()`
  - Visual: blinking cursor `▌` at end while typing, removed when complete
- **Narrator text** (score nodes with `narrator` field):
  - No speaker name
  - Italic, color `#ffd700` (gold)
  - Centered in dialogue box
- **End node with dialogue:** Normal style, tap → triggers day completion flow
- **Adaptive difficulty hints** (`difficulty.showHints`): Same narrator style, shown before choice nodes

### ChoicePanel

- Appears ABOVE DialogueBox (prompt text stays in dialogue box below)
- Animation: Framer Motion `slide-up` + stagger (50ms per button)
- 2-4 buttons, vertical stack, full-width minus padding
- Button style: semi-transparent dark bg, light border, white text, rounded
- Tap → `selectChoice(index)` → panel dismisses
- **MultiSelect (day 4, count=2):**
  - Checkboxes instead of buttons
  - Counter: "Выбрано: 1/2"
  - "Подтвердить" button, disabled until exactly `count` selected
  - Tap confirm → `selectMultiChoices(indices)`
- **Timer bar** (when `timeLimit` present):
  - Horizontal bar ABOVE choice buttons
  - Color transition: green → yellow (10s remaining) → red (5s) → pulsing red
  - Width shrinks from 100% to 0%
  - Driven by `useGameEngine.timerRemaining` (RAF polling)
  - On expire → `gameStore.timerExpired()` → auto-advance to `expireNodeId`

### DayIntroTransition

- Fullscreen overlay (z-index above SceneRenderer, below HUD)
- Background: day's intro background image with Ken Burns effect
  - CSS: `transform: scale(1)` → `scale(1.15)` over 6 seconds, `transition: transform 6s ease-out`
- Text sequence (centered, Framer Motion fade-in stagger):
  - "День N" — large, bold, fade-in at 0s
  - Subtitle — medium, fade-in at 1.5s
  - Teaser from previous day's end node `nextDayTeaser` — smaller, fade-in at 3s
- "Нажмите чтобы продолжить" — blinking text at bottom, appears at 5s
- Tap → fade-out overlay (300ms) → first node of day
- **prefers-reduced-motion:** Static background, all text shown immediately, "Начать" button

---

## 3. Phase 3b Components — HUD + Screens

### GameHUD

- Position: top 0, full width, height ~40px
- Background: `rgba(0, 0, 0, 0.5)`
- Layout: `display: flex; justify-content: space-between; align-items: center`
- Left: `LivesDisplay`
- Center: `ComboIndicator` (only when active)
- Right: `ScoreDisplay` + `LevelBadge` + Pause button (||)
- Hidden during: DAY_INTRO, DAY_SUMMARY, FINAL_RESULTS
- z-index above SceneRenderer, tap on HUD does NOT trigger advanceDialogue

### LivesDisplay

- 3 heart icons (SVG), filled = `#ff4757`, empty = `#555`
- Animations:
  - Life lost: heart scale-down (1 → 0 over 300ms) + red flash on screen edges (CSS box-shadow inset)
  - Life gained: bounce-in (scale 0 → 1.2 → 1) green tint
  - Last life: pulse animation (scale 1 → 1.1 → 1, infinite, 1s)

### ScoreDisplay

- Star icon `★` + total score number
- Color: `#ffd700`
- No dimension breakdown (that's DaySummary only)

### ComboIndicator

- Hidden when `comboCount < 4`
- Shows: "×1.5" (comboCount 4) or "×2.0" (comboCount 5+)
- Bounce-in animation on activation
- Fade-out on combo reset
- Color: `#ffd700` with glow effect

### LevelBadge

- Text: "Lv.{level}"
- Color: `#aaa`
- Non-interactive

### PhoneForm (on /game hub)

- Full-screen dark form
- Fields:
  - Name: text input, required
  - Phone: masked input `+998 XX XXX-XX-XX`, validation for Uzbekistan format
  - Language: toggle switch `UZ | RU`, default UZ
  - Avatar: two cards (male/female silhouette), tap to select
- Submit button: "Играть" / "O'ynash" (respects language choice)
- On submit: `playerStore.createPlayer(name, phone, avatarId)` + save language to localStorage
- **Returning player:** If `playerStore.player` exists, skip form, show ScenarioSelect
- **Reset option:** ScenarioSelect top bar has small "Сбросить прогресс" link → confirm dialog → `playerStore.reset()` → back to PhoneForm

### ScenarioSelect (Level Carousel)

- Full-screen dark background
- Top bar: player avatar + name + level + coins
- **Active scenario card** (left, ~38% width, ~78% height):
  - Scenario image (car dealership showroom)
  - "Уровень 1" label
  - Title: "Автосалон Chevrolet"
  - "5 дней · 7-10 мин"
  - Play button overlay (▶ circle, pulsing glow)
  - Progress bar at bottom (0% on first play, shows completion if returning)
  - Badge: "ОТКРЫТ" (green)
  - Blue border + glow shadow
- **Locked scenario cards** (right, decreasing size + opacity):
  - Card 2 (~24% width, 68% height, opacity 0.7): "Недвижимость" + 🔒 + "Скоро"
  - Card 3 (~20% width, 60% height, opacity 0.5): "Электроника" + 🔒 + "Скоро"
  - Card 4 (~12% width, 52% height, opacity 0.35): "Мебель" + 🔒 + "Скоро"
  - Dark overlay `rgba(0,0,0,0.55-0.7)` on each
  - Grayscale filter on icons
- **Bottom motivational text:** "Пройди автосалон → открой недвижимость!" (blue)
- Tap on active → `startScenario(scenarioId)` → preload assets → DAY_INTRO

### DaySummary

- Fullscreen, dark background, scrollable if content overflows
- **Rating reveal:**
  - Letter grade (S/A/B/C/D/F) centered, large, bounce animation (scale 0 → 1.2 → 1)
  - S-rank: gold color + confetti particles (CSS/canvas)
  - A: green, B: blue, C: yellow, D: orange, F: red
- **7 dimension bars:**
  - Horizontal bars, animated width (0 → actual over 800ms, stagger 100ms each)
  - Strongest dimension: green highlight + label "Сильная сторона"
  - Weakest dimension: yellow highlight + label "Зона роста"
  - Labels: empathy→Эмпатия, rapport→Раппорт, timing→Тайминг, expertise→Экспертиза, persuasion→Убеждение, discovery→Выявление потребностей, opportunity→Работа с возможностями
- **Near-miss** (if `getNearMiss()` returns non-null):
  - "Ещё {pointsNeeded} очков до рейтинга {nextRating}!" — yellow highlight
- **XP & Level:**
  - "+{xp} XP" with progress bar to next level
  - If level up → "Уровень {N}!" celebration
- **Achievements** (if any unlocked this day):
  - Achievement card: icon + title + "+1 🪙"
  - Slide-in animation
- **Next day teaser** (from end node `nextDayTeaser[lang]`):
  - Italic text at bottom, builds anticipation
- **Action buttons:**
  - "Переиграть день" — secondary style, shows coin cost if replay (🪙 1)
  - "Следующий день" — primary style, blue
  - Day 5: "Следующий день" → "Показать итоги"

### GameOver (modal overlay)

- Semi-transparent dark overlay over PLAYING state
- Modal card centered:
  - "Все жизни потеряны!" — large, red
  - "День {N} — попробуй ещё раз"
  - "Restart day" button — primary (free first time, shows "🪙 1" if replay and coins > 0)
  - "Exit to menu" button — secondary, muted
- On restart: `restartDay()` → lives reset to 1, score reset, flags preserved → DAY_INTRO current day
- Timer paused while modal is open

### FinalResults

- Fullscreen, dark background, scrollable
- **Overall rating** across all 5 days (weighted average or total score)
- **Radar chart or bar chart** — 7 dimensions aggregated from all days
  - Strongest: green, labeled
  - Weakest: yellow, labeled
- **All achievements** earned during playthrough
- **Stats:** total score, total time, best day rating, combo record
- **CTA Block (CTABlock component):**
  - Primary CTA: "Скачай гайд по {weakestDimension}" → Telegram bot / PDF download
    - Large button, prominent
    - Props: `{ title, subtitle, url, icon }`
  - Secondary CTA: "Поговори с экспертом" → Calendly / phone
    - Smaller link below primary
    - Props: `{ title, url }`
  - CTABlock is a separate reusable component, content/URLs configured via props
- **Share button** (Phase 3c): "Поделиться в Telegram" — stub for now

### PauseMenu (modal overlay)

- Triggered by || button in GameHUD
- Semi-transparent dark overlay
- Modal: "Пауза"
  - "Продолжить" — primary button → `resumeTimer()`, dismiss
  - "Выйти" — secondary → confirm dialog "Прогресс дня будет потерян" → redirect `/game`
- Timer paused while open (`pauseTimer()`)
- Mute toggle (Phase 3c)

### RotateDevice (overlay)

- CSS: `@media (orientation: portrait) and (pointer: coarse)` → show
- Fullscreen overlay, highest z-index
- Rotate phone icon (SVG animation: tilt 0° → 90°)
- Text: "Поверните телефон горизонтально" / "Telefoningizni gorizontal holga o'tkazing"
- Not shown on desktop (no `pointer: coarse`)

---

## 4. Phase 3c Components — Polish

### Animations (Framer Motion)

| Component | Animation | Duration | Trigger |
|-----------|-----------|----------|---------|
| DialogueBox | fade-in | 200ms | New node |
| ChoicePanel | slide-up + stagger | 300ms + 50ms/btn | Choice node |
| CharacterSprite (new) | fade-in | 300ms | Speaker change |
| CharacterSprite (emotion) | crossfade | 200ms | Emotion change |
| DayIntroTransition | Ken Burns zoom | 6s | Day start |
| DayIntro text | fade-in stagger | 1.5s intervals | Day start |
| DaySummary rating | scale bounce | 500ms | Summary shown |
| DaySummary bars | width animate | 800ms + 100ms stagger | Summary shown |
| DaySummary achievements | slide-in | 300ms | After bars |
| GameOver modal | overlay fade + card bounce | 300ms | Lives = 0 |
| Combo badge | bounce-in | 300ms | comboCount ≥ 4 |
| Combo reset | fade-out | 200ms | Combo broken |
| Life lost | scale-down + screen red flash | 300ms | life_lost event |
| Life gained | bounce-in green | 300ms | life_gained event |
| Last life | pulse infinite | 1s loop | Lives = 1 |
| S-rank confetti | particles | 2s | Rating = S |
| ScenarioSelect cards | slide on swipe | 300ms | User swipe |

**prefers-reduced-motion:** All animations → instant (duration: 0). Ken Burns → static. Typewriter → instant text. Confetti → disabled. "Начать" button instead of tap-to-continue.

### Audio (SoundManager)

**AudioContext unlock:** First tap anywhere → `audioContext.resume()`.

**SoundManager class (singleton):**
```ts
class SoundManager {
  private audioContext: AudioContext;
  private buffers: Map<string, AudioBuffer>;
  private bgMusic: AudioBufferSourceNode | null;

  preloadDay(dayIndex: number): Promise<void>; // Load day's sounds
  play(soundId: string): void; // Fire-and-forget
  playBgMusic(trackId: string, volume?: number): void; // Loop, default 0.3
  stopBgMusic(fadeMs?: number): void; // Fade out
  setMuted(muted: boolean): void;
}
```

**EventBus integration:** Subscribe to `sound_requested` event → `soundManager.play(soundId)`.

**15 sounds (from asset-map):**

| ID | Trigger | Type |
|----|---------|------|
| sfx_choice_select | Any choice tapped | SFX |
| sfx_correct | Score > 0 from choice (Phase 3c only, since no visible feedback) | SFX |
| sfx_wrong | Score ≤ 0 from choice | SFX |
| sfx_timer_tick | Timer ≤ 5s, each second | SFX |
| sfx_timer_expire | Timer reaches 0 | SFX |
| sfx_life_lost | life_lost event | SFX |
| sfx_life_gained | life_gained event | SFX |
| sfx_achievement | achievement_unlocked event | SFX |
| sfx_combo | combo_activated event | SFX |
| sfx_day_complete | day_completed event (success) | SFX |
| sfx_day_fail | day_completed event (failure) | SFX |
| sfx_grandmaster | grandmaster achievement | SFX |
| bgm_lofi | During gameplay | Music |
| bgm_tension | During timed choices | Music |
| bgm_summary | During DaySummary | Music |

**Note on sfx_correct/sfx_wrong:** Even though we don't show VISUAL feedback after choices, audio feedback is subtle enough to not reveal exact scores. The player hears a soft "ding" or "thud" but doesn't know the exact impact. This is a separate decision from the visual feedback choice.

**Mute:** Toggle in PauseMenu, persisted to localStorage.

### Image Preloading (useAssetPreloader)

**Strategy:** Preload current day's assets before DAY_INTRO. Preload next day's assets during DAY_SUMMARY.

```ts
interface UseAssetPreloader {
  preloadDay(scenarioId: string, dayIndex: number): Promise<void>;
  progress: number; // 0-1
  isReady: boolean;
}
```

**Load order:** Backgrounds first (largest, seen first) → characters → cars.

**Loading screen:** If assets not ready, show progress bar over DayIntroTransition. Simple dark screen + percentage.

**Asset optimization (62 MB → target ~15-20 MB):**
- Characters: PNG → WebP (1.2 MB → ~200-300 KB each, 43 files × ~1MB savings = ~40 MB saved)
- Backgrounds: Already JPG (~800 KB each), acceptable
- Cars: Check format, convert if needed
- Tool: `sharp` or `cwebp` CLI, run as build script
- Do NOT use Next.js `<Image>` — these are game assets rendered in a canvas-like context, not page content

### Leaderboard (stub — /game/leaderboard)

- LeaderboardTable: Rank, Name, Level, Total Score, Best Rating
- Current player highlighted
- PlayerRank: "Ты на X месте из Y"
- **Phase 3c:** localStorage only, single player
- **Phase 5:** Supabase Realtime, multi-player, weekly/all-time

---

## 5. Shared Infrastructure

### File Structure

```
components/game/
├── engine/
│   ├── SceneRenderer.tsx
│   ├── DialogueBox.tsx
│   ├── ChoicePanel.tsx
│   ├── CharacterSprite.tsx
│   └── DayIntroTransition.tsx
├── hud/
│   ├── GameHUD.tsx
│   ├── ScoreDisplay.tsx
│   ├── LivesDisplay.tsx
│   ├── ComboIndicator.tsx
│   └── LevelBadge.tsx
├── screens/
│   ├── PhoneForm.tsx
│   ├── ScenarioSelect.tsx
│   ├── DaySummary.tsx
│   ├── GameOver.tsx
│   ├── FinalResults.tsx
│   ├── CTABlock.tsx
│   ├── PauseMenu.tsx
│   └── RotateDevice.tsx
└── leaderboard/
    ├── LeaderboardTable.tsx
    └── PlayerRank.tsx

lib/game/
├── hooks/
│   ├── useGameEngine.ts
│   ├── useTimer.ts
│   ├── useAssetPreloader.ts
│   ├── useTypewriter.ts
│   └── useAudioUnlock.ts
├── audio/
│   └── SoundManager.ts
└── utils/
    └── preloader.ts
```

### Language Context

- Language stored in localStorage (chosen at PhoneForm)
- `useLang()` hook returns current language key ('uz' | 'ru')
- All `LocalizedText` rendered as `text[lang]`
- Static UI strings: small i18n object (not full i18n library — only ~50 strings)

### Styling

- Tailwind CSS 4 (already configured)
- Game-specific dark theme: backgrounds `#0f0f1a` to `#1a1a2e`
- Accent blue: `#4a90d9`
- Score gold: `#ffd700`
- Hearts red: `#ff4757`
- Success green: `#22c55e`
- Danger red: `#ef4444`
- Warning yellow: `#fbbf24`
- All animations respect `prefers-reduced-motion`

---

## 6. Open Items (deferred)

| Item | Deferred to | Reason |
|------|-------------|--------|
| Supabase sync | Phase 5 | Not needed for local play |
| API endpoints | Phase 5 | LocalStorage sufficient for MVP |
| Drop-off tracking (beforeunload) | Phase 3c | Polish, not core |
| gameStore persistence | Phase 3c | Refresh = lose current day progress (acceptable for MVP) |
| Share to Telegram | Phase 3c | Polish feature |
| Realtime leaderboard | Phase 5 | Needs Supabase |
| Audio files creation | Before Phase 3c | Need actual sound assets |
| WebP conversion script | Phase 3c start | Optimization task |
