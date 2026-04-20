# Dashboard Metrics Inventory

> Чек-лист для систематического аудита метрик админ-панели.
> Для каждой метрики: ✅ = проверена и работает, ❌ = баг, ⏳ = не проверяли.

**Всего метрик: 144**

---

## 1. Overview (`/admin/overview`)

UI: `app/(admin)/admin/overview/OverviewClient.tsx`
API: `/api/admin/overview` → `getDailyTrends`, `getUtmFunnel`, `getOfferFunnelData`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 1.1 | Игроков | OverviewClient.tsx:71 | /api/admin/overview | get_utm_funnel (sum registered) | number | Кол-во зарегистрированных игроков за период | ⏳ |
| 1.2 | Начали игру | OverviewClient.tsx:72 | /api/admin/overview | get_utm_funnel (sum started) | number | Кол-во игроков, начавших игру (`game_started` event) | ⏳ |
| 1.3 | Завершили | OverviewClient.tsx:73 | /api/admin/overview | get_utm_funnel (sum completed) | number | Кол-во игроков, завершивших игру (`game_completed`) | ⏳ |
| 1.4 | Конверсия в CTA | OverviewClient.tsx:74-79 | /api/admin/overview | get_offer_funnel + get_utm_funnel | percent | `offer_cta_click / registered * 100` | ⏳ |
| 1.5 | Динамика по дням | OverviewClient.tsx:84-92 | /api/admin/overview | get_daily_trends | chart-line | Линейный график: X=дата, Y=кол-во регистраций/начал/завершений | ⏳ |
| 1.6 | Воронка (FunnelBars) | OverviewClient.tsx:93-102 | /api/admin/overview | get_utm_funnel + get_offer_funnel | chart-bar | Воронка: Зарегистрированы → Начали → Завершили → Оффер → CTA с дельтами | ⏳ |
| 1.7 | Insight: Низкое прохождение | OverviewClient.tsx:105-117 | /api/admin/overview | derived | badge | Предупреждение если `completed/registered < 10%` | ⏳ |

## 2. Realtime (`/admin/realtime`)

UI: `app/(admin)/admin/realtime/RealtimeClient.tsx`
API: `/api/admin/realtime/kpis`, `/api/admin/realtime/events`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 2.1 | Сейчас играют | RealtimeClient.tsx:66-71 | /api/admin/realtime/kpis | get_realtime_kpis (active) | number | Игроки с heartbeat за последние 90 сек | ⏳ |
| 2.2 | За сегодня | RealtimeClient.tsx:72 | /api/admin/realtime/kpis | get_realtime_kpis (today) | number | Уникальных игроков начали игру сегодня | ⏳ |
| 2.3 | Завершили | RealtimeClient.tsx:73 | /api/admin/realtime/kpis | get_realtime_kpis (completed_today) | number | Завершили игру сегодня (`game_completed` сегодня) | ⏳ |
| 2.4 | Проблемная зона | RealtimeClient.tsx:74-79 | /api/admin/realtime/events | getRecentGameEvents + detectAutoInsights | badge | Бейдж "⚠ Есть" / "✓ Норма" — есть ли danger-инсайт | ⏳ |
| 2.5 | Auto-insights | RealtimeClient.tsx:82-88 | /api/admin/realtime/events | detectAutoInsights(snapshot) | list | Список карточек с проблемами в последних событиях | ⏳ |
| 2.6 | Активность за час | RealtimeClient.tsx:91-101 | /api/admin/realtime/events | buildActivitySeries(snapshot, 60) | chart-bar | Area-chart: X=минуты последнего часа, Y=кол-во событий | ⏳ |
| 2.7 | Live-feed (real-time) | RealtimeClient.tsx:103-115 | /api/admin/realtime/events + Supabase realtime | getRecentGameEvents | list | Лента последних 50 событий игры real-time | ⏳ |

## 3. Leads (`/admin/leads`)

UI: `app/(admin)/admin/leads/LeadsClient.tsx`
API: `/api/admin/leads`, `/api/admin/leads/counts` → `getLeads`, `getLeadCounts`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 3.1 | Всего заявок | LeadsClient.tsx:69 | /api/admin/leads/counts | getLeadCounts (all) | number | Сумма всех лидов с маркетинговых форм | ⏳ |
| 3.2 | С Home | LeadsClient.tsx:70 | /api/admin/leads/counts | getLeadCounts (home) | number | Кол-во лидов со страницы `/` (вебинар) | ⏳ |
| 3.3 | С Target | LeadsClient.tsx:71 | /api/admin/leads/counts | getLeadCounts (target) | number | Кол-во лидов со страницы `/target` (курс) | ⏳ |
| 3.4 | На странице | LeadsClient.tsx:72 | /api/admin/leads | getLeads (length) | number | Кол-во строк отображённых (с hint «N за сегодня») | ⏳ |
| 3.5 | Filter tab: Все (count) | LeadsClient.tsx:83-94 | /api/admin/leads/counts | getLeadCounts | badge | Фильтр «Все» (без счётчика) | ⏳ |
| 3.6 | Filter tab: Home (N) | LeadsClient.tsx:83-94 | /api/admin/leads/counts | getLeadCounts.home | badge | Фильтр по слагу home с счётчиком | ⏳ |
| 3.7 | Filter tab: Target (N) | LeadsClient.tsx:83-94 | /api/admin/leads/counts | getLeadCounts.target | badge | Фильтр по слагу target с счётчиком | ⏳ |
| 3.8 | Таблица: Дата | LeadsClient.tsx:108,119 | /api/admin/leads | getLeads.created_at | table-column | Дата/время создания лида | ⏳ |
| 3.9 | Таблица: Имя | LeadsClient.tsx:109,120 | /api/admin/leads | getLeads.name | table-column | Имя из формы | ⏳ |
| 3.10 | Таблица: Телефон | LeadsClient.tsx:110,121-125 | /api/admin/leads | getLeads.phone | table-column | Маскированный телефон (WhatsApp ссылка) | ⏳ |
| 3.11 | Таблица: Страница | LeadsClient.tsx:111,126-135 | /api/admin/leads | getLeads.source_page | table-column | `home` или `target` (badge) | ⏳ |
| 3.12 | Таблица: UTM | LeadsClient.tsx:112,136-139 | /api/admin/leads | getLeads.utm_source + utm_campaign | table-column | UTM source / campaign или «(прямой)» | ⏳ |
| 3.13 | Таблица: Устройство | LeadsClient.tsx:113,140-142 | /api/admin/leads | getLeads.device_type | table-column | mobile / desktop / tablet | ⏳ |
| 3.14 | Показано N из total | LeadsClient.tsx:150-154 | /api/admin/leads | getLeads (total) | number | Подпись «Показано X из Y (топ-100)» | ⏳ |

## 4. Participants (`/admin/participants`)

UI: `app/(admin)/admin/participants/ParticipantsClient.tsx`
API: `/api/admin/participants` → `getPlayersEnriched` + `get_participant_stats` RPC

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 4.1 | Всего игроков | ParticipantsClient.tsx:69 | /api/admin/participants | getPlayersEnriched (count) | number | Всего игроков в БД (с учётом фильтра) | ⏳ |
| 4.2 | С оценкой S/A | ParticipantsClient.tsx:70-75 | /api/admin/participants | get_participant_stats.total_sa | number | Кол-во игроков с best_rating ∈ {S,A} во всей БД | ⏳ |
| 4.3 | Завершили ≥1 дня | ParticipantsClient.tsx:76-81 | /api/admin/participants | get_participant_stats.total_any_day | number | Кол-во игроков завершивших хотя бы 1 день | ⏳ |
| 4.4 | На странице | ParticipantsClient.tsx:82 | /api/admin/participants | getPlayersEnriched (length) | number | Кол-во отображённых строк (после фильтров) | ⏳ |
| 4.5 | Filter: Все | ParticipantsClient.tsx:93-98 | — | — | badge | Сброс рейтинг-фильтра | ⏳ |
| 4.6 | Filter: S / A / B / C / F | ParticipantsClient.tsx:99-107 | /api/admin/participants | getPlayersEnriched (ratingFilter) | badge | Фильтр по best_rating | ⏳ |
| 4.7 | Таблица: Имя | ParticipantsClient.tsx:121,133-137 | /api/admin/participants | getPlayersEnriched.display_name | table-column | Имя игрока (ссылка на Player Journey) | ⏳ |
| 4.8 | Таблица: Телефон | ParticipantsClient.tsx:122,138 | /api/admin/participants | getPlayersEnriched.phone | table-column | Маскированный телефон | ⏳ |
| 4.9 | Таблица: Rating | ParticipantsClient.tsx:123,139 | /api/admin/participants | getPlayersEnriched.best_rating | table-column | Лучший рейтинг игрока (S/A/B/C/F) | ⏳ |
| 4.10 | Таблица: Очки | ParticipantsClient.tsx:124,140 | /api/admin/participants | getPlayersEnriched.total_score | table-column | Общий счёт игрока | ⏳ |
| 4.11 | Таблица: Дней | ParticipantsClient.tsx:125,141 | /api/admin/participants | getPlayersEnriched.days_completed | table-column | Сколько дней из 3 завершил | ⏳ |
| 4.12 | Таблица: UTM | ParticipantsClient.tsx:126,142-144 | /api/admin/participants | getPlayersEnriched.utm_source | table-column | UTM source игрока или «(прямой)» | ⏳ |
| 4.13 | Таблица: Активность | ParticipantsClient.tsx:127,145 | /api/admin/participants | getPlayersEnriched.last_activity | table-column | Относительное время последней активности | ⏳ |

## 5. Leaderboard (`/admin/leaderboard`)

UI: `app/(admin)/admin/leaderboard/LeaderboardClient.tsx`
API: `/api/admin/leaderboard` → `getLeaderboardEnriched`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 5.1 | Игроков в топе | LeaderboardClient.tsx:46 | /api/admin/leaderboard | getLeaderboardEnriched (length) | number | Кол-во игроков в таблице лидеров (макс 50) | ⏳ |
| 5.2 | Лидер | LeaderboardClient.tsx:47 | /api/admin/leaderboard | getLeaderboardEnriched[0].total_score | number | Очки лидера (1-е место) | ⏳ |
| 5.3 | Всего прохождений | LeaderboardClient.tsx:48 | /api/admin/leaderboard | sum(scenarios_completed) | number | Сумма всех прохождений по топу | ⏳ |
| 5.4 | Топ-3 карточки (имя, очки, уровень, прохождений, rating) | LeaderboardClient.tsx:51-75 | /api/admin/leaderboard | getLeaderboardEnriched[0..2] | list | Медальный подиум первых 3-х | ⏳ |
| 5.5 | Таблица: # (ранг) | LeaderboardClient.tsx:88,99-101 | /api/admin/leaderboard | index | table-column | Медаль/ранг (#4+) | ⏳ |
| 5.6 | Таблица: Игрок | LeaderboardClient.tsx:89,102-106 | /api/admin/leaderboard | getLeaderboardEnriched.display_name | table-column | Имя игрока (ссылка на журнал) | ⏳ |
| 5.7 | Таблица: Rating | LeaderboardClient.tsx:90,107-109 | /api/admin/leaderboard | getLeaderboardEnriched.best_rating | table-column | Лучший рейтинг (S/A/B/C/F) | ⏳ |
| 5.8 | Таблица: Очки | LeaderboardClient.tsx:91,110 | /api/admin/leaderboard | getLeaderboardEnriched.total_score | table-column | Общий счёт | ⏳ |
| 5.9 | Таблица: Уровень | LeaderboardClient.tsx:92,111 | /api/admin/leaderboard | getLeaderboardEnriched.level | table-column | Текущий уровень XP | ⏳ |
| 5.10 | Таблица: Прохожд. | LeaderboardClient.tsx:93,112 | /api/admin/leaderboard | getLeaderboardEnriched.scenarios_completed | table-column | Кол-во завершённых сценариев | ⏳ |

## 6. Branch Analytics (`/admin/branch`)

UI: `app/(admin)/admin/branch/BranchClient.tsx`
API: `/api/admin/branch` → `getBranchFlow`, `getNodeStats`, `getDropoffZones`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 6.1 | Всего переходов | BranchClient.tsx:94 | /api/admin/branch | get_branch_flow (sum flow_count) | number | Суммарное кол-во переходов between nodes | ⏳ |
| 6.2 | Узлов задействовано | BranchClient.tsx:95 | /api/admin/branch | get_node_stats (length) | number | Уникальных нод, посещённых игроками | ⏳ |
| 6.3 | Drop-off узлов | BranchClient.tsx:96 | /api/admin/branch | get_dropoff_zones (length) | number | Нод, где хотя бы один игрок закрыл вкладку | ⏳ |
| 6.4 | Insight: Медленный узел | BranchClient.tsx:99-112 | /api/admin/branch | get_node_stats (avg_thinking_time_ms > 15000) | badge | Предупреждение если есть узел со средним временем думы >15с | ⏳ |
| 6.5 | Sankey Flow | BranchClient.tsx:119-120 | /api/admin/branch | get_branch_flow | chart-sankey | Потоки между нодами: from_node → to_node по весу flow_count | ⏳ |
| 6.6 | Tree (BranchTree) | BranchClient.tsx:121-122 | /api/admin/branch | get_branch_flow (rooted tree) | chart-bar | Дерево ветвлений от корневой ноды с процентами | ⏳ |
| 6.7 | ScenarioMap (graph) | BranchClient.tsx:123-124 | /api/admin/branch | buildGraphData(flows, stats, dropoffs) | chart-line | Карта графа сценария со всеми узлами и связями | ⏳ |
| 6.8 | Топ узел по посещаемости | BranchClient.tsx:128-131 | /api/admin/branch | get_node_stats[0] | badge | Подпись под картой: самый посещаемый узел | ⏳ |

## 7. Drop-off Zones (`/admin/dropoff`)

UI: `app/(admin)/admin/dropoff/DropoffClient.tsx`
API: `/api/admin/dropoff` → `getDropoffZones`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 7.1 | Всего drop-off | DropoffClient.tsx:56 | /api/admin/dropoff | get_dropoff_zones (sum) | number | Суммарное кол-во событий `dropped_off` | ⏳ |
| 7.2 | Уникальных узлов | DropoffClient.tsx:57 | /api/admin/dropoff | get_dropoff_zones (length) | number | Количество разных нод с drop-off | ⏳ |
| 7.3 | Топ узел | DropoffClient.tsx:58-63 | /api/admin/dropoff | get_dropoff_zones[0].node_id | badge | ID самого «убойного» узла с hint кол-ва выпадений | ⏳ |
| 7.4 | Дней с проблемами | DropoffClient.tsx:64-69 | /api/admin/dropoff | Object.keys(byDay) | number | Сколько day_id встречается в списке | ⏳ |
| 7.5 | Insight: Критический drop-off | DropoffClient.tsx:72-85 | /api/admin/dropoff | derived (top.dropoff_count >= 5) | badge | Предупреждение если топ-узел ≥5 выпадений | ⏳ |
| 7.6 | Топ-50 узлов по drop-off | DropoffClient.tsx:87-96 | /api/admin/dropoff | get_dropoff_zones | chart-bar | Горизонтальный бар-чарт: X=dropoff_count, Y=node_id | ⏳ |

## 8. Engagement (`/admin/engagement`)

UI: `app/(admin)/admin/engagement/EngagementClient.tsx`
API: `/api/admin/engagement` → `getEngagementIndexRaw`, `getNodeStats`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 8.1 | Interest Index | EngagementClient.tsx:60-65 | /api/admin/engagement | get_engagement_index + computeInterestIndex | number | Composite 0-10: completion + thinking + replay | ⏳ |
| 8.2 | Completion rate | EngagementClient.tsx:66-71 | /api/admin/engagement | get_engagement_index.completion_rate | percent | Доля начавших, кто завершил день | ⏳ |
| 8.3 | Avg thinking time | EngagementClient.tsx:72-77 | /api/admin/engagement | get_engagement_index.avg_thinking_time_ms | time(ms) | Среднее время на выбор (оптимально 5-15с) | ⏳ |
| 8.4 | Replay rate | EngagementClient.tsx:78-83 | /api/admin/engagement | get_engagement_index.replay_rate | percent | Доля игроков, переигрывающих день (0.1-0.3 здорово) | ⏳ |
| 8.5 | Среднее время на выбор по узлам | EngagementClient.tsx:91-102 | /api/admin/engagement | get_node_stats | chart-bar | Бар-чарт: X=node_id, Y=avg_thinking_time_ms | ⏳ |
| 8.6 | Insight: медленные узлы | EngagementClient.tsx:104-114 | /api/admin/engagement | get_node_stats (filter >15s) | badge | Предупреждение: N узлов с временем думы >15с | ⏳ |

## 9. Funnel & UTM (`/admin/funnel`)

UI: `app/(admin)/admin/funnel/FunnelClient.tsx`
API: `/api/admin/funnel` → `getUtmFunnel`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 9.1 | Источников | FunnelClient.tsx:43 | /api/admin/funnel | computeUtmRollup.rows.length | number | Количество уникальных UTM источников | ⏳ |
| 9.2 | Всего игроков | FunnelClient.tsx:44 | /api/admin/funnel | computeUtmRollup.totals.visitors | number | Сумма visitors по всем источникам | ⏳ |
| 9.3 | Завершили | FunnelClient.tsx:45 | /api/admin/funnel | computeUtmRollup.totals.completed | number | Сумма completed по всем источникам | ⏳ |
| 9.4 | Лучший источник | FunnelClient.tsx:46-51 | /api/admin/funnel | computeUtmRollup.rows[0] | badge | Источник с наибольшим completion rate | ⏳ |
| 9.5 | Таблица: Источник | FunnelClient.tsx:67,77 | /api/admin/funnel | get_utm_funnel.source | table-column | UTM source (или «direct») | ⏳ |
| 9.6 | Таблица: Игроков | FunnelClient.tsx:68,78 | /api/admin/funnel | get_utm_funnel.visitors | table-column | Кол-во зарегистрированных из этого источника | ⏳ |
| 9.7 | Таблица: Начали | FunnelClient.tsx:69,79 | /api/admin/funnel | get_utm_funnel.started | table-column | Начали игру из этого источника | ⏳ |
| 9.8 | Таблица: Завершили | FunnelClient.tsx:70,80 | /api/admin/funnel | get_utm_funnel.completed | table-column | Завершили игру из этого источника | ⏳ |
| 9.9 | Таблица: Конверсия | FunnelClient.tsx:71,81-88 | /api/admin/funnel | computeUtmRollup.rows.completionRate | percent | completed/visitors * 100 с цветовой индикацией | ⏳ |
| 9.10 | Доли источников (Donut) | FunnelClient.tsx:95-99 | /api/admin/funnel | rollup.rows (source, visitors) | chart-sankey | Donut chart: доли трафика по источникам | ⏳ |

## 10. Offer Conversion (`/admin/offer`)

UI: `app/(admin)/admin/offer/OfferClient.tsx`
API: `/api/admin/offer` → `getOfferFunnelData`, `getOfferBreakdownByRating`, `getOfferBreakdownByUtm`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 10.1 | Просмотров оффера | OfferClient.tsx:62 | /api/admin/offer | get_offer_funnel.offer_view | number | Кол-во `offer_view` событий | ⏳ |
| 10.2 | Кликов CTA | OfferClient.tsx:63 | /api/admin/offer | get_offer_funnel.offer_cta_click | number | Кол-во `offer_cta_click` событий | ⏳ |
| 10.3 | CTR | OfferClient.tsx:64-69 | /api/admin/offer | derived (clicks/views) | percent | offer_cta_click / offer_view * 100 | ⏳ |
| 10.4 | Лучший rating | OfferClient.tsx:70-75 | /api/admin/offer | get_offer_breakdown_by_rating (max CTR) | badge | Рейтинг с лучшим CTR и hint значения | ⏳ |
| 10.5 | Insight: Низкий CTR | OfferClient.tsx:78-86 | /api/admin/offer | derived (ctr<5 && views>10) | badge | Danger: CTR < 5% при views > 10 | ⏳ |
| 10.6 | Воронка оффера (FunnelBars) | OfferClient.tsx:88-97 | /api/admin/offer | get_offer_funnel | chart-bar | Воронка: Завершили → Увидели → Кликнули → Конверсия | ⏳ |
| 10.7 | CTR по рейтингу: Rating | OfferClient.tsx:112,123 | /api/admin/offer | get_offer_breakdown_by_rating.segment | table-column | Рейтинг игрока (S/A/B/C/F) | ⏳ |
| 10.8 | CTR по рейтингу: Views | OfferClient.tsx:113,124 | /api/admin/offer | get_offer_breakdown_by_rating.views | table-column | Кол-во просмотров оффера сегментом | ⏳ |
| 10.9 | CTR по рейтингу: Clicks | OfferClient.tsx:114,125 | /api/admin/offer | get_offer_breakdown_by_rating.clicks | table-column | Кол-во кликов CTA сегментом | ⏳ |
| 10.10 | CTR по рейтингу: CTR | OfferClient.tsx:115,126 | /api/admin/offer | derived (clicks/views) | percent | CTR по сегменту | ⏳ |
| 10.11 | CTR по UTM: Источник | OfferClient.tsx:147,158 | /api/admin/offer | get_offer_breakdown_by_utm.segment | table-column | UTM источник | ⏳ |
| 10.12 | CTR по UTM: Views | OfferClient.tsx:148,159 | /api/admin/offer | get_offer_breakdown_by_utm.views | table-column | Просмотры оффера из источника | ⏳ |
| 10.13 | CTR по UTM: Clicks | OfferClient.tsx:149,160 | /api/admin/offer | get_offer_breakdown_by_utm.clicks | table-column | Клики CTA из источника | ⏳ |
| 10.14 | CTR по UTM: CTR | OfferClient.tsx:150,161 | /api/admin/offer | derived (clicks/views) | percent | CTR по UTM | ⏳ |

## 11. Pages (`/admin/pages`) — Overview

UI: `app/(admin)/admin/pages/PagesClient.tsx`
API: `/api/admin/pages` → `getPagesSummary` → RPC `get_page_summary`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 11.1 | Всего просмотров | PagesClient.tsx:101 | /api/admin/pages | sum(get_page_summary.total_views) | number | Суммарные views по всем страницам | ⏳ |
| 11.2 | Уник. визиторов | PagesClient.tsx:102 | /api/admin/pages | sum(get_page_summary.unique_visitors) | number | Сумма уникальных визиторов по страницам | ⏳ |
| 11.3 | Средний bounce | PagesClient.tsx:103 | /api/admin/pages | avg(get_page_summary.bounce_rate) | percent | Средний bounce_rate по всем страницам | ⏳ |
| 11.4 | PageCard: slug | PagesClient.tsx:30-32 | /api/admin/pages | get_page_summary.page_slug | badge | Название страницы | ⏳ |
| 11.5 | PageCard: просмотры | PagesClient.tsx:33-36 | /api/admin/pages | get_page_summary.total_views | number | Всего просмотров страницы | ⏳ |
| 11.6 | PageCard: уник. визиторов | PagesClient.tsx:42-44 | /api/admin/pages | get_page_summary.unique_visitors | number | Уникальные визиторы страницы | ⏳ |
| 11.7 | PageCard: среднее время | PagesClient.tsx:45-48 | /api/admin/pages | get_page_summary.avg_duration_ms | time(ms) | Среднее время на странице | ⏳ |
| 11.8 | PageCard: bounce | PagesClient.tsx:49-55 | /api/admin/pages | get_page_summary.bounce_rate | percent | Bounce rate страницы | ⏳ |
| 11.9 | PageCard: конверсия в заявку | PagesClient.tsx:56-59 | /api/admin/pages | get_page_summary.conversion_rate | percent | Конверсия страницы в лид | ⏳ |

## 12. Page Detail (`/admin/pages/[slug]`)

UI: `app/(admin)/admin/pages/[slug]/page.tsx`
API: прямой вызов `getPageAnalytics` → RPC `get_page_summary` + `get_page_breakdowns`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 12.1 | Просмотры | [slug]/page.tsx:276 | direct | get_page_summary.total_views | number | Всего просмотров страницы | ⏳ |
| 12.2 | Уникальные | [slug]/page.tsx:277 | direct | get_page_summary.unique_visitors | number | Уникальные визиторы | ⏳ |
| 12.3 | Отказы | [slug]/page.tsx:278 | direct | get_page_summary.bounce_rate | percent | Bounce rate | ⏳ |
| 12.4 | Ср. время | [slug]/page.tsx:279 | direct | get_page_summary.avg_duration_ms | time(ms) | Среднее время на странице | ⏳ |
| 12.5 | Конверсия | [slug]/page.tsx:280 | direct | get_page_summary.conversion_rate | percent | Конверсия в заявку | ⏳ |
| 12.6 | Просмотры по дням (chart) | [slug]/page.tsx:285-287 | direct | get_page_breakdowns.daily_views | chart-bar | Бары: X=дата, Y=просмотры за день | ⏳ |
| 12.7 | Глубина скролла — 25% | [slug]/page.tsx:181-196 | direct | get_page_breakdowns.scroll_depth[25] | percent | Доля, прокрутивших до 25% | ⏳ |
| 12.8 | Глубина скролла — 50% | [slug]/page.tsx:181-196 | direct | get_page_breakdowns.scroll_depth[50] | percent | Доля, прокрутивших до 50% | ⏳ |
| 12.9 | Глубина скролла — 75% | [slug]/page.tsx:181-196 | direct | get_page_breakdowns.scroll_depth[75] | percent | Доля, прокрутивших до 75% | ⏳ |
| 12.10 | Глубина скролла — 100% | [slug]/page.tsx:181-196 | direct | get_page_breakdowns.scroll_depth[100] | percent | Доля, прокрутивших до 100% | ⏳ |
| 12.11 | Устройства (bars) | [slug]/page.tsx:154-170 | direct | get_page_breakdowns.device_breakdown | chart-bar | Распределение по типам устройств | ⏳ |
| 12.12 | Топ рефереры: Реферер | [slug]/page.tsx:133,140-142 | direct | get_page_breakdowns.referrer_breakdown.referrer | table-column | URL или домен реферера | ⏳ |
| 12.13 | Топ рефереры: Визиты | [slug]/page.tsx:134,143 | direct | get_page_breakdowns.referrer_breakdown.count | table-column | Кол-во визитов с реферера | ⏳ |
| 12.14 | UTM: Источник | [slug]/page.tsx:101,109 | direct | get_page_breakdowns.utm_breakdown.source | table-column | UTM source | ⏳ |
| 12.15 | UTM: Medium | [slug]/page.tsx:101,110 | direct | get_page_breakdowns.utm_breakdown.medium | table-column | UTM medium | ⏳ |
| 12.16 | UTM: Кампания | [slug]/page.tsx:101,111 | direct | get_page_breakdowns.utm_breakdown.campaign | table-column | UTM campaign | ⏳ |
| 12.17 | UTM: Просмотры | [slug]/page.tsx:101,112 | direct | get_page_breakdowns.utm_breakdown.views | table-column | Просмотры по UTM | ⏳ |
| 12.18 | UTM: Уникальные | [slug]/page.tsx:101,113 | direct | get_page_breakdowns.utm_breakdown.unique_visitors | table-column | Уникальные по UTM | ⏳ |

## 13. Game Metrics (`/admin/game-metrics`) — legacy

UI: `app/(admin)/admin/game-metrics/page.tsx`
API: прямой вызов `getGameMetrics` → RPC `get_admin_funnel_stats` (legacy `lib/admin/queries.ts`)

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 13.1 | Ср. очки | game-metrics/page.tsx:77-78 | direct | getGameMetrics.avg_score | number | Средний счёт по завершённым прохождениям | ⏳ |
| 13.2 | Всего завершений | game-metrics/page.tsx:91-94 | direct | getGameMetrics.total_completions | number | Кол-во записей в completed_scenarios за период | ⏳ |
| 13.3 | Распределение рейтингов (bars) | game-metrics/page.tsx:112-137 | direct | getGameMetrics.ratings | chart-bar | Бар на каждый рейтинг S/A/B/C/F с абс. значениями | ⏳ |
| 13.4 | Отвал по дням (bars) | game-metrics/page.tsx:167-220 | direct | getGameMetrics.dayDropoff | chart-bar | По дню: start vs completed + % отвала | ⏳ |
| 13.5 | Таблица сценариев: Сценарий | game-metrics/page.tsx:277,286 | direct | getGameMetrics.scenarios.scenario_id | table-column | ID сценария | ⏳ |
| 13.6 | Таблица сценариев: Прохождений | game-metrics/page.tsx:278,287 | direct | getGameMetrics.scenarios.play_count | table-column | Кол-во прохождений | ⏳ |
| 13.7 | Таблица сценариев: Ср. очки | game-metrics/page.tsx:279,288 | direct | getGameMetrics.scenarios.avg_score | table-column | Средний счёт по сценарию | ⏳ |
| 13.8 | Таблица сценариев: Ср. время | game-metrics/page.tsx:280,289 | direct | getGameMetrics.scenarios.avg_time_seconds | time(ms) | Среднее время прохождения | ⏳ |

## 14. Player Journey (`/admin/player/[playerId]`)

UI: `app/(admin)/admin/player/[playerId]/PlayerClient.tsx` + `components/admin/PlayerProfile.tsx`
API: `/api/admin/player/[playerId]` → `getPlayerSummary`, `getPlayerJourneyData`, `getCompletedDaysForPlayer`

| # | Метрика (UI название) | UI файл:строка | API endpoint | SQL функция | Тип | Что должна показывать | Статус |
|---|---|---|---|---|---|---|---|
| 14.1 | Profile: Имя + rating | PlayerProfile.tsx | /api/admin/player/[id] | getPlayerSummary.display_name + bestRating | badge | Заголовок профиля с бейджем рейтинга | ⏳ |
| 14.2 | Profile: Телефон + UTM | PlayerProfile.tsx | /api/admin/player/[id] | getPlayerSummary.phone, utm_source, utm_campaign | badge | Маскированный телефон, источник | ⏳ |
| 14.3 | Profile: Сессий | PlayerProfile.tsx | /api/admin/player/[id] | parseJourney.totalSessions | number | Кол-во игровых сессий | ⏳ |
| 14.4 | Profile: Дней пройдено | PlayerProfile.tsx | /api/admin/player/[id] | completedDays.length | number | Сколько дней завершено из 3 | ⏳ |
| 14.5 | Profile: Очков | PlayerProfile.tsx | /api/admin/player/[id] | getPlayerSummary.total_score | number | Общий счёт игрока | ⏳ |
| 14.6 | Profile: Монет | PlayerProfile.tsx | /api/admin/player/[id] | getPlayerSummary.coins | number | Кол-во монет (для replay) | ⏳ |
| 14.7 | Profile: WhatsApp link | PlayerProfile.tsx | — | derived | badge | Кнопка «WhatsApp» со ссылкой wa.me | ⏳ |
| 14.8 | Profile: Telegram link | PlayerProfile.tsx | — | derived | badge | Кнопка «Telegram» со ссылкой | ⏳ |
| 14.9 | Полный таймлайн | PlayerClient.tsx:162-168 | /api/admin/player/[id] | get_player_journey | list | Все события игрока с временем + totalEvents count | ⏳ |
| 14.10 | Прогресс по дням (PerDayBars) | PlayerClient.tsx:171-176 | /api/admin/player/[id] | getCompletedDaysForPlayer | chart-bar | Столбцы: day_id → score + rating | ⏳ |
| 14.11 | Сильные стороны | PlayerClient.tsx:178-186 | /api/admin/player/[id] | deriveStrengthsWeaknesses.strengths | list | Список сильных сторон игрока | ⏳ |
| 14.12 | Слабые стороны | PlayerClient.tsx:187-192 | /api/admin/player/[id] | deriveStrengthsWeaknesses.weaknesses | list | Список слабостей игрока | ⏳ |
| 14.13 | Recommendation | PlayerClient.tsx:196-202 | /api/admin/player/[id] | deriveStrengthsWeaknesses.recommendation | badge | Hire / Train / Skip — рекомендация HR | ⏳ |
| 14.14 | Admin Notes | PlayerClient.tsx:204-206 | /api/admin/player-notes | getPlayerSummary.admin_notes | list | Заметки админа о игроке (free text) | ⏳ |

---

## Источники данных (для аудита)

- **UI файлы**: `app/(admin)/admin/<page>/*.tsx`
- **API routes**: `app/api/admin/*/route.ts`
- **SQL слой**: `lib/admin/queries-v2.ts`, `lib/admin/page-queries.ts`, `lib/admin/queries.ts` (legacy)
- **RPC определения**: `supabase/migrations/*.sql`
- **API wrappers**: `lib/admin/api.ts`
- **Helpers**: `lib/admin/marketing/computeFunnelDeltas.ts`, `lib/admin/marketing/computeUtmRollup.ts`, `lib/admin/engagement/computeIndex.ts`, `lib/admin/branch/buildSankeyData.ts` / `buildTreeData.ts` / `buildGraphData.ts`, `lib/admin/realtime/buildActivitySeries.ts` / `detectAutoInsights.ts`, `lib/admin/player/parseJourney.ts` / `deriveStrengthsWeaknesses.ts`

## Распределение метрик по страницам

| Страница | Метрик |
|---|---|
| 1. Overview | 7 |
| 2. Realtime | 7 |
| 3. Leads | 14 |
| 4. Participants | 13 |
| 5. Leaderboard | 10 |
| 6. Branch | 8 |
| 7. Dropoff | 6 |
| 8. Engagement | 6 |
| 9. Funnel | 10 |
| 10. Offer | 14 |
| 11. Pages | 9 |
| 12. Page Detail | 18 |
| 13. Game Metrics | 8 |
| 14. Player Journey | 14 |
| **Итого** | **144** |
