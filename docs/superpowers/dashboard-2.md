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

## Admin pages (Premium-styled)

- `/admin/realtime` — diagnostic view (default landing)
- `/admin/overview` — top-level funnel + trends
- `/admin/branch` — Branch Analytics (Sankey + Tree + Map tabs)
- `/admin/engagement` — Interest Index + thinking-time chart
- `/admin/dropoff` — Drop-off Zones
- `/admin/funnel` — UTM funnel + donut
- `/admin/pages` — marketing-page analytics
- `/admin/offer` — Offer Conversion + CTR by rating/UTM
- `/admin/participants` — players table + CSV export
- `/admin/player/[playerId]` — individual journey + HR notes + Day Replay
- `/admin/leaderboard` — top players + CSV export

## Reusable components

- `components/admin/{KpiCard, TopBar, InsightCard, PageHeader, Sidebar}.tsx`
- `components/admin/{ScenarioSelector, DayTabs, PeriodFilter}.tsx`
- `components/admin/{RatingBadge, Timeline, PlayerProfile, LiveFeed}.tsx`
- `components/admin/{ExportCsvButton, PlayerNotes, DayReplayModal}.tsx`
- `components/admin/charts/*.tsx` — Sankey, BranchTree, ScenarioMap, ThinkingBarChart, DropoffBars, FunnelBars, TrendLineChart, DonutChart, ActivityAreaChart, PerDayBars, MedalBadge

## Pure transforms (TDD-tested)

- `lib/admin/branch/{buildSankeyData, buildTreeData, buildGraphData}.ts`
- `lib/admin/engagement/computeIndex.ts`
- `lib/admin/marketing/{computeFunnelDeltas, computeUtmRollup}.ts`
- `lib/admin/player/{parseJourney, deriveStrengthsWeaknesses}.ts`
- `lib/admin/realtime/{detectAutoInsights, buildActivitySeries}.ts`

## DB migrations (all ADD-only, applied to remote)

- `006_game_events_indexes.sql` — analytical indexes
- `007_offer_events.sql` — new table for offer-page tracking
- `008_admin_aggregates.sql` — RPCs for branch/engagement/dropoff/journey/offer-funnel
- `009_marketing_aggregates.sql` — RPCs for UTM funnel, daily trends, offer breakdowns
- `010_realtime_publication.sql` — game_events in supabase_realtime + get_realtime_kpis
- `011_player_admin_notes.sql` — HR notes column

## Game-side instrumentation

- `lib/game/eventTypes.ts` — central event-type constants (17 types)
- `lib/game/analytics.ts` — typed event helpers (node_entered/exited, choice timing, etc.)
- `lib/game/offerEvents.ts` — offer screen tracking (offer_view, offer_cta_click)
- `lib/game/hooks/{useHeartbeat, useChoiceTimer}.ts`
- `game/store/gameStore.ts` — emits node_entered/exited, choice timing, back navigation
- `components/game/screens/SchoolPitch.tsx` — instrumented offer-view + CTA-click

## API endpoints

- `GET /api/admin/csv?type=participants|leaderboard` — typed CSV download (UTF-8 BOM)
- `PATCH /api/admin/player-notes` — body `{ playerId, notes }` (10k char cap)

## Out-of-scope (deferred to future cycles)

- AI-generated insights via LLM API on top of `detectAutoInsights`
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
- Filters live as client state, not URL params (deferred polish)

## Quality gates

- 385+ vitest tests, 100% coverage on `game/engine/**` and `game/systems/**`
- TypeScript strict mode
- `npm run build` must succeed before commits
- Each commit on `feature/dashboard-2-phase-1` is independently buildable
