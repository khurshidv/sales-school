# 🔍 Полный аудит админ-дашборда Sales School

**Дата:** 2026-04-22
**Масштаб:** 11 страниц + общий каркас
**Методология:** построчный разбор кода каждой страницы + оценка с позиций: дашборд-мейкер, маркетолог, стратег, геймдизайнер
**Главная задача дашборда:** аналитика (не операционная работа)

---

## 📍 Карта текущей админки

### Основные аналитические экраны
| # | Страница | Назначение |
|---|---|---|
| 1 | `/admin/overview` | Главная — KPI сводка, тренды, быстрые инсайты |
| 2 | `/admin/funnel` | Воронка конверсии: визит → регистрация → День1/2/3 → оффер |
| 3 | `/admin/engagement` | Вовлечённость: session duration, возвраты, retention |
| 4 | `/admin/dropoff` | Где отваливаются игроки (сцены/шаги) |
| 5 | `/admin/branch` | Анализ веток сценария |
| 6 | `/admin/leaderboard` | Топ игроков по S-рейтингу |
| 7 | `/admin/realtime` | Live-KPI + live-feed событий |
| 8 | `/admin/game-metrics` | **Legacy orphan** (не в sidebar) |

### Работа с людьми и продажей
| # | Страница | Назначение |
|---|---|---|
| 9 | `/admin/participants` | Список участников |
| 10 | `/admin/player/[id]` | Карточка одного игрока + заметки |
| 11 | `/admin/leads` | Лиды (Bitrix-интеграция) |
| 12 | `/admin/offer` | Конверсия в оффер/продажу |

### Контент и доступ
| # | Страница | Назначение |
|---|---|---|
| 13 | `/admin/pages` + `/admin/pages/[slug]` | Аналитика лендингов (НЕ редактор) |
| 14 | `/admin/login` | Авторизация |
| 15 | `/admin/` (index) | Редирект |

### Каркас
16. `Sidebar`, `TopBar`, `PeriodFilter`, `DateRangePicker`, `RefreshButton` — слой навигации/фильтров

---

# 🔍 АУДИТ #1: `/admin/overview` — Обзор

## 📐 Что сейчас на странице

### Блок 1. Шапка
- Заголовок «Обзор» + подзаголовок «Главные показатели воронки и тренды по дням»
- Справа — `PeriodFilter` (7d / 30d / 90d / all)

### Блок 2. KPI-ряд (4 карточки)
| # | Label | Value | Accent | Доп. |
|---|---|---|---|---|
| 1 | Игроков | `totals.registered` | violet | — |
| 2 | Начали игру | `totals.started` | pink | — |
| 3 | Прошли всю игру | `totals.completed` | green | — |
| 4 | Оставили заявку | `totals.consultations` | orange | hint: «попап после игры» |

### Блок 3. Два графика (grid 2fr / 1fr)
- **«Динамика по дням»** — `TrendLineChart`
- **«Воронка»** — `FunnelBars` из 6 шагов: Зарегистрированы → Начали → Прошли → Увидели оффер → Кликнули CTA → Оставили заявку

### Блок 4. Условный инсайт
- `InsightCard` tone=warning, показывается если `completed / registered < 10%`

---

## ✅ Что хорошо
1. Правильная ментальная модель — страница построена вокруг воронки.
2. Inсайт-карта с условием — классный паттерн.
3. Период как URL-параметр (`usePeriodParam`) — shareable.
4. `revalidate = 60` + `force-dynamic` на API — адекватно.

## ❌ Что НЕ работает

### 1. KPI-ряд не даёт главного: контекста и тренда
Сейчас это просто «4 числа». Профессиональный KPI должен показывать:
- абсолют **+ дельту** к предыдущему периоду,
- **sparkline**,
- цвет дельты (не декоративный accent).

Сейчас «violet/pink/green/orange» — это **декор без смысла**.

### 2. Нет главного KPI — Conversion Rate
На странице есть абсолюты, но **нет ни одного процента**. Для маркетолога дашборд без CR бесполезен. Нужны 2–3 процентных KPI:
- CR визит → регистрация
- CR регистрация → прохождение
- CR прохождение → заявка

### 3. Метрика «Визитёры» пропущена в KPI-ряду
`totals.visitors` считается, но **не показывается**. Это самая верхняя точка воронки.

### 4. Воронка неправильная логически
- **Нет шага «Визит»**.
- **«Оставили заявку»** берётся из UTM, а предыдущие шаги из offer-events — **методологическая ошибка**.

### 5. `TrendLineChart` — один график, непонятно что на нём
- Нет переключателя серий.
- Нет сравнения с прошлым периодом.
- Нет аннотаций событий.

### 6. Отсутствует секция «источники трафика» (UTM)
UTM-данные загружаются, но не показываются. Нужен виджет «Top 5 UTM-источников».

### 7. Порог 10% на инсайт — хардкод
Магическое число в компоненте.

### 8. Нет Realtime-виджета на Overview
Нет компактного «10 активных игроков сейчас».

### 9. Отсутствуют "movers" — лучший/худший день
Ни слова про «лучший день периода».

### 10. Нет сегментации
Все числа агрегированы. Нельзя отфильтровать по источнику, устройству, языку игры (uz/ru).

## 🗑️ Что убрать
- Декоративные accent-цвета на KpiCard.
- Подпись «попап после игры» — вынести в tooltip.

## ➕ Что добавить

### MUST
1. Conversion Rates (3 процента).
2. Дельты vs предыдущий период.
3. Sparkline в KPI-карточках.
4. Топ источников трафика.
5. KPI «Визитёры».

### SHOULD
6. Переключатель серий на TrendLineChart.
7. Сравнение с прошлым периодом.
8. Микро-виджет Realtime в углу шапки.
9. Сегмент по языку игры (uz/ru).
10. «Лучший/худший день».

### NICE
11. Аннотации на графике.
12. Экспорт PNG/CSV.

## 📊 Итоговая оценка Overview

| Критерий | Оценка | Комментарий |
|---|---|---|
| Информативность для маркетолога | **4/10** | Нет CR, нет дельт, нет UTM-разреза |
| Информативность для стратега | **3/10** | Один период, нет сравнений, нет сегментов |
| Скорость чтения | **5/10** | 4 числа — быстро, но без контекста |
| Actionability | **3/10** | Только 1 инсайт-ссылка |
| Визуальная плотность | **4/10** | Слишком пусто для главного экрана |
| Техническая корректность | **6/10** | Методологический баг в воронке |

**Вердикт:** Overview сейчас — **витрина-заглушка**, а не боевой дашборд. Требует переработки **~60%**.

---

# 🔍 АУДИТ #2: `/admin/funnel` — Funnel & UTM

## 📐 Inventory

### Блок 1. Шапка
- Title «Funnel & UTM», subtitle «Воронка по источникам трафика — какие каналы дают качественных игроков»
- `PeriodFilter`

### Блок 2. KPI-ряд (4 карточки)
| # | Label | Value | Hint |
|---|---|---|---|
| 1 | Источников | `rollup.rows.length` | — |
| 2 | Посетителей | `totals.visitors` | «уникальные просмотры лендингов» |
| 3 | Прошли всю игру | `totals.completed` | — |
| 4 | Лучший источник | `rows[0].source` | «X.X% завершаемость» |

### Блок 3. Таблица «Источники по конверсии»
Колонки: **Источник · Посетителей · Начали · Прошли · Заявки · Конверсия**
Цветовые пороги на «Конверсии»: ≥30% зелёный, ≥15% жёлтый, <15% красный.

### Блок 4. DonutChart «Доли источников» по `visitors`

### API
`GET /api/admin/funnel?period=X` → только `utm`

## ❌ Критичные проблемы

### 1. Страница обещает воронку — но воронки на ней нет
Название «Funnel & UTM», но `FunnelBars` не импортируется, `computeFunnelDeltas` не используется. Только таблица.

### 2. Только `source` — остальные 4 UTM-параметра выброшены
Rollup группирует только по source. `facebook + campaign=spring2026` и `facebook + campaign=retarget` сливаются. **Это главный функциональный провал**.

### 3. Нет CR в заявку — только в прохождение игры
Главная метрика для продаж — «стоимость/источник лида» — отсутствует.

### 4. Нет денег — ни расхода, ни CPL, ни ROI/ROAS
Marketing-дашборд без расходов — это полудашборд.

### 5. «Лучший источник» без порога значимости
Источник с 2 посетителями и 100% CTR — «лучший». Шум.

### 6. DonutChart по visitors — почти бесполезен
Дублирует колонку «Посетителей» + доля в трафике не так важна как доля в заявках.

### 7. Нет трендов по источникам
Все данные — статичная сумма за период. **Это не аналитика, это snapshot**.

### 8. Нет сегмента по языку игры (uz/ru)
Критично для UZ-рынка.

### 9. Нет связи с Bitrix (статус сделки)
Источник с 40 заявками и 0 сделок — хуже источника с 10 заявками и 5 сделок.

### 10. Нет фильтра по UTM / сортировки таблицы

### 11. Нет экспорта CSV
`/api/admin/csv` endpoint существует, но кнопки нет.

### 12. Нет "direct" / organic / null-source

### 13. Нет «новых» vs «старых» источников

### 14. KPI «Источников» — не action-метрика

### 15. Методологический вопрос: что такое visitor?

## 🗑️ Что убрать
- DonutChart «Доли источников» по visitors.
- Accent-цвета на KPI.

## ➕ Что добавить

### MUST
1. Настоящая FunnelBars-визуализация.
2. Все 5 UTM-колонок с drill-down.
3. CR в заявку как главный KPI.
4. Spend + CPL + ROAS.
5. Фильтр и drill-down по UTM.
6. Тренд по источнику.
7. Сегмент uz/ru.
8. Статус сделки из Bitrix.
9. Экспорт CSV.

### SHOULD
10. Сортировка всех колонок + min threshold.
11. Дельта vs prev period.
12. «Новые источники».
13. Top-5 кампаний.
14. «Худшие источники».

## 📊 Итоговая оценка Funnel

| Критерий | Оценка |
|---|---|
| Информативность для маркетолога | **3/10** |
| Операционная полезность | **3/10** |
| Методологическая чистота | **5/10** |
| Глубина данных | **2/10** |
| Связь с продажами | **0/10** |
| Actionability | **2/10** |

**Вердикт:** Даёт только агрегированный список source-ов. Требует **капитальной переработки ~70%**.

---

# 🔍 АУДИТ #3: `/admin/dropoff` — Drop-off Zones

## 📐 Inventory

### Блок 1. Шапка
- Title «Drop-off Zones», subtitle «Где конкретно игроки закрывают вкладку»
- Actions: `ScenarioSelector` + `PeriodFilter`

### Блок 2. KPI-ряд (4 карточки)
| # | Label | Value |
|---|---|---|
| 1 | Всего drop-off | `total` |
| 2 | Уникальных узлов | `rows.length` |
| 3 | Топ узел | `top.node_id` (raw string) |
| 4 | Дней с проблемами | `Object.keys(byDay).length` |

### Блок 3. Условный InsightCard (danger) если `dropoff_count >= 5`

### Блок 4. «Топ-50 узлов по drop-off» — `DropoffBars`

### API
`{ node_id, day_id, dropoff_count }` — и всё.

## ❌ Критичные проблемы

### 1. КРИТИЧЕСКИЙ: Нет знаменателя — только абсолюты
«25 выпало из узла X» — это 25 из 30 (катастрофа) или 25 из 1000 (шум)? Список сейчас — список **самых трафичных узлов**, а не самых проблемных.

### 2. `node_id` показывается как raw string
`node_07c_choice_azizdialog` — нечитаемо.

### 3. Не отделён «добровольный выход» от «Game Over»
Принудительные выходы (0 жизней, fail-ветка) смешаны с настоящим drop-off.

### 4. Нет timing: сколько времени провёл до выхода
5 сек vs 90 сек — разные проблемы.

### 5. Нет контекста сцены (превью текста)

### 6. KPI «Дней с проблемами» — мусорная метрика
`Object.keys(byDay).length` = 3 всегда.

### 7. KPI «Топ узел» — показывает node_id
Бесполезен без переводчика.

### 8. Insight threshold в count — должен быть в %

### 9. DropoffBars: ширина по max count — искажает

### 10. 3 цвета циклом — декор

### 11. Нет фильтров по дню / типу узла / языку / устройству

### 12. Нет связи с сценарным графом (Branch)

### 13. Нет ретраев / возвратов

### 14. Нет экспорта CSV / шэра

### 15. Лимит 50 без пояснения

### 16. Нет «тренда drop-off»

### 17. ScenarioSelector — начинается с `SCENARIOS[0]`

## ✅ Что хорошо
- Отличный empty-state.
- Есть InsightCard с ссылкой на действие.
- Отдельный RPC `get_dropoff_zones`.

## 🗑️ Что убрать
- KPI «Дней с проблемами» в текущем виде.
- KPI «Топ узел» с raw node_id.
- Цветовой цикл в DropoffBars.

## ➕ Что добавить

### MUST
1. drop-off rate (%).
2. Минимум visits (≥20).
3. Человекочитаемое название узла + тип + hover-превью.
4. Разделение «добровольный выход» vs «Game Over».
5. Timing + % коротких выходов.
6. Тепловая карта поверх Branch flow map.
7. Фильтры: день, тип узла, язык, устройство.
8. Экспорт CSV.

## 📊 Итоговая оценка Dropoff

| Критерий | Оценка |
|---|---|
| Методологическая корректность | **2/10** |
| Читаемость (узлы/сцены) | **2/10** |
| Actionability | **3/10** |
| Глубина данных | **2/10** |
| Связь с другими страницами | **1/10** |
| Empty state и UX-мелочи | **7/10** |

**Вердикт:** Дебаг-лист для разработчика, не аналитика. Переработка **~70%**.

---

# 🔍 АУДИТ #4: `/admin/engagement` — Engagement

## 📐 Inventory

### Шапка
- Title «Engagement», subtitle «Насколько игра интересна — composite Interest Index и компоненты вовлечённости»
- Actions: `ScenarioSelector` + `PeriodFilter`

### KPI-ряд (4 карточки)
| # | Label | Value | Hint |
|---|---|---|---|
| 1 | Interest Index | `idx.score`/10 | «завершаемость + обдумывание + переигровки» |
| 2 | % завершивших день | `completion_rate × 100%` | «доля начавших, кто завершил день» |
| 3 | Среднее время выбора | `avg_thinking_time_ms / 1000` | «оптимально 5–15 секунд» ✅ |
| 4 | % переигровок | `replay_rate × 100%` | «10–30% — здоровая повторяемость» ✅ |

### DayTabs (Day1/2/3) — влияет только на нижний график
### «Среднее время на выбор по узлам» — ThinkingBarChart (top-20, raw node_id на X)
### Условный InsightCard — slow nodes (>15с)

## ❌ Критичные проблемы

### 1. Interest Index — «чёрный ящик без расшифровки»
Одно число без breakdown. **Главная проблема**, composite без прозрачности — **анти-паттерн BI**.

### 2. Engagement — слишком узкое понимание
Нет: retention D1/D7, session duration, количество сессий, heat curve, активности по часам.

### 3. Avg thinking time — не различает типы узла
Диалог/выбор/тест требуют разных порогов. Сейчас один.

### 4. ThinkingBarChart — опять raw `node_id`

### 5. Только `avg`, нет `median / p90 / p95`
Среднее манипулируется выбросами.

### 6. Нет корреляции с S-рейтингом / результатом

### 7. `DayTabs` — работают только для нижнего графика

### 8. % завершивших день — знаменатель неясен

### 9. Interest Index без тренда

### 10. Slow-nodes insight — хардкод 15_000 и raw node_id

### 11. Нет сегментации (язык, устройство, источник, первый/повтор)

### 12. Неиспользуемые компоненты: ActivityAreaChart, PerDayBars

### 13. «Оптимально 5–15 секунд» — откуда?

### 14. Subtitle «composite Interest Index» — жаргон

### 15. Нет таймлайн-аннотаций

## ✅ Что хорошо
- Пороги нормы в hint'ах — редкость и большой плюс.
- Композитный Interest Index как идея.
- Цветовая кодировка в ThinkingBarChart.
- Действенный InsightCard со slow nodes.

## ➕ Что добавить

### MUST
1. Retention D1 / D7.
2. Breakdown Interest Index.
3. Median / p90 / p95.
4. Heat curve (интерес по сценам).
5. Корреляция с S-рейтингом.
6. Сегмент uz/ru.
7. Читаемые имена узлов.
8. Тренд Interest Index.
9. Пороги времени per тип узла.

### SHOULD
10. Подключить ActivityAreaChart и PerDayBars.
11. % «залипаний» (>60с).
12. Сегмент по устройству.
13. Первый vs повторный проход.
14. Session duration distribution.

## 📊 Итоговая оценка Engagement

| Критерий | Оценка |
|---|---|
| Широта метрик engagement | **4/10** |
| Прозрачность (formula of Index) | **3/10** |
| Методологическая корректность | **5/10** |
| Читаемость узлов | **2/10** |
| Сегментация | **1/10** |
| Actionability | **5/10** |
| Education (норма/benchmark) | **7/10** |

**Вердикт:** Правильная концепция, не реализована до конца. Переработка **~55%**.

---

# 🔍 АУДИТ #5: Participants + Player Journey (связка «Люди»)

## 📐 Inventory — Participants

### Шапка
- Title «Participants», subtitle «Все игроки с фильтрами и быстрым переходом к индивидуальному пути»
- Action: **`ExportCsvButton`** ✅

### KPI-ряд (4 карточки): Всего · С оценкой S/A · (?) · Оставили заявку

### Фильтры
- Search (имя/телефон)
- Rating toggle — **бинарный** («S/A или все»)

### Таблица
Имя/RatingBadge · Phone · UTM source · last_activity. Limit 100.

## 📐 Inventory — Player Journey

### Шапка
- Title «Player Journey», subtitle **«ID: {player.id}»**

### PlayerProfile
- Avatar + имя + RatingBadge
- Phone + UTM source + campaign
- ⏱️ Сессий · 🎮 Дней · ⭐ Очков · 🪙 Монет
- Кнопки **WhatsApp / Telegram / Replay**

### Grid 2 колонки
- LEFT: Timeline + PerDayBars
- RIGHT: «Сильные / слабые стороны» + InsightCard `hire/train/skip` + PlayerNotes

### DayReplayModal (keyboard nav, progress bar)

### `/admin/player` → redirect на `/admin/participants` ✅

## ❌ Критичные проблемы

### Participants

1. **Rating filter = одна бинарная кнопка** (SA/all).
2. **Нет фильтра «оставил заявку / не оставил»** — критично для продаж.
3. **Нет фильтра по UTM / дате регистрации / языку / устройству / региону**.
4. **Нет связи с Bitrix** (статус сделки).
5. **Нет pagination**.
6. **Нет bulk actions** (чекбоксы).
7. **Нет статусов «прочитан / обработан»**.
8. **Нет детектора дубликатов**.
9. **Hint «попап после игры»** — технический инсайт.
10. **Нет колонки «прогресс игры»**.
11. **Sidebar: `Participants` + `Player Journey` ведут в одно место**.

### Player Journey

12. **Subtitle «ID: {player.id}»** — UUID не нужен.
13. **В профиле нет:** языка, устройства, дней без активности, текущего дня, времени в игре, статуса Bitrix, полных UTM, email, IP.
14. **WhatsApp/Telegram: один шаблон на всех** — `'Здравствуйте! Заметил вас в Sales School.'`.
15. **Telegram link = `t.me/+digits`** — работает не всегда.
16. **Replay показывает только последний день**.
17. **Timeline замусорен служебными событиями** (heartbeat, node_entered/exited).
18. **DayReplayModal показывает raw `node_id`**.
19. **Auto-play отсутствует в Replay**.
20. **PlayerNotes — без истории и структуры**.
21. **Recommendation `hire`/`train`/`skip` — статична**, нет override, нет уведомлений.
22. **Нет «похожие игроки»**.
23. **Нет «copy link»**.

## ✅ Что хорошо

### Participants
- ExportCsvButton — единственная из страниц с экспортом.
- Redirect `/admin/player` → `/admin/participants`.
- Empty state адекватный.

### Player Journey
- PlayerProfile с WhatsApp/Telegram кнопками.
- DayReplayModal с keyboard nav + progress bar — **продуктовый уровень UX**.
- PlayerNotes auto-save с debounce.
- **Recommendation `hire`/`train`/`skip` — концептуально сильно** (HR-tool).
- Strengths/Weaknesses action-инсайты.
- `revalidate = 30` — правильное значение.

## 🗑️ Что убрать
1. Subtitle «ID: {player.id}».
2. `heartbeat` события из Timeline.
3. Пункт «Player Journey» в сайдбаре.
4. Hint «попап после игры».
5. Одиночный rating-toggle.

## ➕ Что добавить

### MUST
**Participants:**
1. Фильтры: UTM, дата регистрации, язык, устройство, «есть заявка», статус Bitrix, диапазон рейтинга.
2. Pagination / infinite scroll.
3. Колонки: прогресс игры, дней без активности, статус Bitrix.
4. Статус «обработан / не обработан» + assigned-to.
5. Bulk actions.
6. Детектор дубликатов.

**Player Journey:**
7. Язык, устройство, текущий день, дней без активности, общее время.
8. Шаблоны WhatsApp/Telegram с подстановкой имени.
9. Полные UTM (5 параметров).
10. Replay dropdown — любой день.
11. Фильтр Timeline.
12. Ссылка на Bitrix-сделку.
13. Push/email/TG уведомление при новой «hire»-рекомендации.

### SHOULD
14. Теги / структура в PlayerNotes.
15. История изменений заметок.
16. Визуализация сцены в DayReplayModal.
17. Auto-play в Replay.
18. «Похожие игроки» секция.
19. Override для recommendation.

## 📊 Итоговая оценка

| Критерий | Participants | Player Journey |
|---|---|---|
| Операционная полезность | **4/10** | **6/10** |
| Функциональность фильтров/действий | **3/10** | **7/10** |
| Полнота данных о человеке | **4/10** | **5/10** |
| Связь с Bitrix / CRM | **1/10** | **1/10** |
| Bulk/batch actions | **0/10** | n/a |
| UX деталей | **5/10** | **8/10** |
| Персонализация коммуникаций | **0/10** | **2/10** |

**Вердикт:**
- **Participants** — слабый первый экран. Переработка ~50%.
- **Player Journey** — **лучшая страница дашборда**. Переработка ~35%.

Общий: полуготовый HR-CRM-инструмент. Закончить — станет **главным operational value** проекта.

---

# 🔍 АУДИТ #6: Leads + Offer (ядро продаж)

## 📐 Inventory — Leads

### Шапка
- Title «Заявки (формы)», subtitle «**Отдельно от участников игры**»
- **Period filter — ОТСУТСТВУЕТ**

### KPI-ряд (4 карточки): Всего · С Home · С Target · На странице (N за сегодня)

### Фильтры
- Search (имя/телефон)
- Source tabs: **Все / Home / Target** (**хардкод**)

### Таблица
Дата · Имя · Phone (`tel:`) · Source (pill) · UTM (source+campaign) · Устройство (📱/💻)

## 📐 Inventory — Offer

### Шапка
- Title «Offer Conversion», subtitle «Финальная оффер-страница»
- `PeriodFilter`

### KPI-ряд (4 карточки)
1. Просмотров оффера
2. Кликов CTA
3. CTR (hint «кликов / просмотров»)
4. Лучший rating + CTR

### Условный InsightCard (danger) если `ctr < 5 && offer_view > 10`

### Воронка: Прошли всю игру → Увидели оффер → Кликнули CTA → **Конверсия**

### Grid 2 колонки: «CTR по рейтингу игрока» + «CTR по UTM-источнику»

## ❌ Критичные проблемы

### Leads

1. **КРИТИЧНО: Нет PeriodFilter**.
2. **`home` / `target` жёстко зашиты** — новый лендинг не виден.
3. **Нет связи с Bitrix / статусом сделки** — менеджер не знает, кого обработали.
4. **Нет связки «Лид ↔ Игрок»** — огромный упущенный сигнал качества.
5. **Нет WhatsApp / Telegram кнопок** — они есть на Player, но **лид — самый горячий контакт**.
6. **Subtitle «Отдельно от участников игры»** — архитектурная правда как UX-провал.
7. **Нет экспорта CSV**.
8. **Нет сортировки колонок**.
9. **Нет UTM-фильтра**.
10. **Нет дедупликации**.
11. **Нет маркера «новый / обработан / в работе»**.
12. **Нет bulk actions**.
13. **KPI «На странице» — странная склейка** с «today».
14. **Pill кодировка только для home/target**.

### Offer

15. **КРИТИЧНО: «Конверсия» — чёрный ящик**. Что это? Оплата? Заявка? Бронь? Нет объяснения.
16. **Нет CR как отдельного KPI** (conversion / views).
17. **Нет revenue / денег**.
18. **Insight threshold 5% — хардкод + без benchmark**. `offer_view > 10` — слишком низкий порог.
19. **«Лучший rating» без min sample**.
20. **«CTR по UTM-источнику» — только source** (дубль ошибки Funnel).
21. **Нет тренда CTR / CR по дням**.
22. **Нет A/B-тестирования / version history**.
23. **Нет retargeting сегмента «видел — не кликнул»**.
24. **Английский в UI** (Title + колонки).
25. **Нет сегментации по language / device / region**.
26. **Нет scroll depth / dwell time**.
27. **Нет «второй попытки»**.

## ✅ Что хорошо

### Leads
- Phone как `tel:` link.
- Tabs вместо dropdown для source.
- Empty state с учётом поиска.
- Device icons (📱/💻).

### Offer
- Правильная воронка (game_completed → offer_view → cta_click → conversion).
- Два breakdown'а (by rating + by UTM).
- InsightCard при низком CTR.
- CTR как отдельный KPI.
- `offer_view > 10` guard — хотя бы попытка.

## 🗑️ Что убрать
- KPI «На странице» на Leads.
- Хардкод SOURCE_TABS.
- Subtitle «Отдельно от участников игры».
- Magic number 5% в insight.
- Английские заголовки.

## ➕ Что добавить

### MUST
**Leads:**
1. PeriodFilter.
2. Колонка статуса Bitrix + кнопка «Открыть сделку».
3. Связка «Лид = Игрок» — ссылка на Player Journey.
4. WhatsApp / Telegram кнопки.
5. UTM-фильтр.
6. Сортировка колонок.
7. Export CSV.
8. Bulk actions.
9. Статусы «новый / в работе / обработан».
10. Dedup-индикатор.

**Offer:**
11. Объяснение «Конверсия» в hint + формула.
12. CR (conversion / view) как KPI.
13. Revenue-метрика.
14. Тренд CTR / CR по дням.
15. Сегмент по language / device / region.
16. Version history + annotations.
17. Сегмент «видел — не кликнул» с экспортом.
18. Min-sample threshold на «Лучший rating».

## 📊 Итоговая оценка Leads + Offer

| Критерий | Leads | Offer |
|---|---|---|
| Операционная полезность | **3/10** | **5/10** |
| Методологическая корректность | **6/10** | **4/10** |
| Связь с Bitrix / CRM | **0/10** | **0/10** |
| Связь с игроком (unified view) | **0/10** | n/a |
| Глубина разрезов | **3/10** | **5/10** |
| Actionability | **2/10** | **4/10** |
| Выручка / деньги в UI | **0/10** | **0/10** |
| Тренды и сравнения | **2/10** | **3/10** |

**Вердикт:**
- **Leads** — самая слабая страница. Переработка **~70%**.
- **Offer** — концептуально правильный, но плоский. Переработка **~50%**.

Вместе должны быть **ядром «пути денег»**, но сейчас не отслеживают деньги вообще.

---

# 🔍 АУДИТ #7: Геймдизайн-группа (Branch + Leaderboard + Realtime + Game-metrics)

## 🌳 BRANCH — Карта сценария

### Inventory
- Фильтры: `ScenarioSelector` + `DayTabs` + `PeriodFilter`
- KPI (computed): totalFlows · totalNodes · visitedNodes · topNode
- InsightCard (warning) если slowNode > 15_000ms
- Главное: `ScenarioFlowMap` (flows + stats + dropoffs). Данные из `game/data/scenarios/car-dealership`
- Footer: «Топ узел по посещаемости: {node_id} (N визитов)»

### Проблемы
1. `DAY_REGISTRY` — хардкод.
2. InsightCard raw node_id.
3. **Нет heatmap-overlay** — главная потенциальная сила не реализована.
4. KPI «Топ узел» в footer вместо основного ряда.
5. Нет % покрытия явно.
6. Нет drill-down по клику на узел.
7. ScenarioFlowMap непригоден на мобилке.
8. Импорт scenarios из `game/data` — bundle растёт.
9. Нет сравнения сценариев бок-о-бок.

### Плюсы
- **ScenarioFlowMap** — самый продвинутый компонент админки.
- Все 3 фильтра (сценарий/день/период).
- Один API-запрос объединяет 3 RPC.

**Оценка: 7/10**

## 🏆 LEADERBOARD

### Inventory
- Title «Leaderboard» (английский)
- Action: `ExportCsvButton` ✅
- 3 KPI: Игроков в топе · Лидер · Всего прохождений
- Top-3 подиум + таблица 50

### Проблемы
1. Title «Leaderboard» — английский.
2. KPI «Игроков в топе» = 50 всегда — бесполезная.
3. «Всего прохождений» — только по топ-50.
4. Нет фильтров: период, сценарий, день, язык.
5. Единая сортировка по `total_score` — нет альтернатив.
6. Нет «Rising stars».
7. Нет achievement/badge column.
8. Нет pagination.
9. Нет visual indicator обновления.

### Плюсы
- Top-3 подиум.
- Link на профиль из каждой строки.
- Auto-refresh.
- ExportCsvButton.

**Оценка: 6/10**

## 📡 REALTIME

### Inventory
- 4 KPI: Сейчас играют (heartbeat 90с) · За сегодня · Прошли игру · **Проблемная зона** (⚠/✓)
- Grid 2 колонки: `ActivityAreaChart` + `LiveFeed` (50 событий) с pulse indicator
- Polling 5 сек

### Проблемы
1. Polling = нагрузка — лучше SSE/WebSocket.
2. LiveFeed: **`player_id.slice(0, 8)`** — обрезанный UUID как имя. UX-провал.
3. LiveFeed → нет клика по строке.
4. heartbeat засоряет feed.
5. Нет event-type filter.
6. Нет pause.
7. Нет browser notification / sound.
8. «Проблемная зона» — бинарный, hint обрезан по 60 символов.
9. «За сегодня» — что это? Непрозрачно.
10. «Heartbeat за 90 сек» — magic number.

### Плюсы
- **Pulse indicator** — отличная UX-деталь.
- `detectAutoInsights` — активный мониторинг.
- ActivityAreaChart + LiveFeed — правильный дуэт.

**Оценка: 6/10**

## ⚠️ GAME-METRICS — ОРФАН СТРАНИЦА

### 🚨 Главное открытие
**НЕ в Sidebar.** Доступна только по прямому URL.

### Характеристики
- `async default function` (server component) — не client.
- Старый API `getGameMetrics` из `queries.ts` (не queries-v2).
- `TableFilters` с `showDateRange` — не использован больше нигде.
- `RefreshButton` вместо PeriodFilter.
- Inline styles без `admin-card`.

### Функции дублируют
- «Ср. очки» и «Всего завершений» → Leaderboard, Overview.
- «Распределение рейтингов» → Participants.
- «Результаты по сценариям» → Branch.

### 🎯 Рекомендация
**Удалить целиком** (вместе с `getGameMetrics`, `TableFilters` если orphan).

**Оценка: 2/10**

## Сводка по группе

| Страница | Оценка | Вердикт |
|---|---|---|
| Branch | **7/10** | Сильная визуализация, недотянут UX |
| Leaderboard | **6/10** | Функционально ок, плоско |
| Realtime | **6/10** | Polling работает, нет alert-уведомлений |
| Game-metrics | **2/10** | **ОРФАН — удалить** |

---

# 🔍 АУДИТ #8: `/admin/pages` + `/admin/pages/[slug]` — Аналитика лендингов

## 🚨 Важное уточнение: это НЕ редактор

Функционально — **вторая маркетинговая страница** рядом с Funnel. В сайдбаре «Pages» (группа «Маркетинг»), что **вводит в заблуждение**.

## 📐 Inventory

### `/admin/pages` (список) — client component
- Title «**Pages Analytics**» (!)
- `PeriodFilter`
- 3 KPI: Всего просмотров · Уник. визиторов · Средний % отказов
- Сетка карточек `PageCard` с «В заявку (conversion_rate)»
- Empty state с инструкцией `initPageTracking()`

### `/admin/pages/[slug]` (детализация) — **server component (legacy)**
- Заголовок из `PAGE_TITLES = { home: 'Вебинар', target: 'Курс' }` — **хардкод**
- `DateRangeInfo` — **только показывает**, не редактирует
- Inline `KpiCard` (свой!)
- UTM breakdown · Referrer table · Device bars · **ScrollFunnel (25/50/75/100%)** · DailyChart

### API
- `/api/admin/pages` — используется.
- **`/api/admin/pages/[slug]` — МЁРТВЫЙ ENDPOINT**.

## ❌ Критичные проблемы

### Архитектурные

1. **Вторая legacy-страница** после Game-metrics. Detail — server, inline styles, raw colors, без admin-card, без PageHeader, без PeriodFilter.
2. **Мёртвый API `/api/admin/pages/[slug]`**.
3. **`PAGE_TITLES` хардкод**.

### UX / функциональные

4. **Нет `PeriodFilter` на detail page**.
5. **Period не передаётся через URL** listing → detail.
6. **Нейминг в Sidebar «Pages»** вводит в заблуждение.
7. **Нет A/B-тестирования / version history**.
8. **Нет drill-down на UTM row**.
9. **Нет сравнения страниц**.
10. **ScrollFunnel без контекста** — нет аннотаций «где оффер», «где CTA».
11. **DailyChart без labels / hover**.
12. **Нет CR / engagement per device** на detail.
13. **Referrer table без группировки по домену**.
14. **Нет рекомендаций / авто-инсайтов**.
15. **Conversion rate отсутствует на detail**.

## ✅ Что хорошо
- **ScrollFunnel** — серьёзная UX-метрика.
- **PageCard** с CR «В заявку».
- **Образовательный empty-state**.
- **UTM + Referrer + Device + Scroll + Daily** — правильный набор.
- Listing → Detail pattern.

## 🗑️ Что убрать
1. Мёртвый endpoint.
2. `PAGE_TITLES` хардкод.
3. Inline `KpiCard` на detail.
4. Raw inline colors.

## ➕ Что добавить

### MUST
1. PeriodFilter на detail.
2. Передача периода через URL.
3. Переименовать Sidebar: «Pages» → **«Аналитика лендингов»**.
4. Page titles из БД.
5. Drill-down на UTM row.
6. CR per device.
7. Conversion rate на detail.
8. Сравнение страниц.

### SHOULD
9. Аннотации на scroll funnel.
10. Аннотации на daily chart.
11. X-axis + proper tooltips.
12. Группировка referrer по домену.
13. Auto-insights.
14. Version history.
15. A/B-тест mode.

## 📊 Итоговая оценка Pages Analytics

| Критерий | Оценка |
|---|---|
| Ценность метрик | **7/10** |
| Архитектурная консистентность | **3/10** |
| Нейминг / IA | **4/10** |
| Связность listing ↔ detail | **3/10** |
| Глубина на detail | **6/10** |
| Actionability | **4/10** |

**Вердикт:** Маркетингово сильна (scroll depth — редкость!), но detail-page — legacy. Переработка **~50%**, при этом это **наиболее ценная страница после Player Journey** с точки зрения маркетинг-аналитики.

---

# 🔍 АУДИТ #9: Каркас — Sidebar / TopBar / фильтры / Login

## 📐 Inventory

### Layout (`app/(admin)/layout.tsx`)
- Sidebar + admin-content. Без TopBar.
- Комментарий: «TopBar is rendered per-page» — но ни одна страница `TopBar` не использует.

### Sidebar
- 4 группы (Мониторинг, Игра, Маркетинг, Игроки), 11 пунктов, иконки lucide-react.
- Только `Real-time` имеет `live: true`.
- Burger + overlay для мобилки.

### PageHeader
- `title + subtitle + actions`, margin-bottom: 20 (inline).

### TopBar
- **КОМПОНЕНТ СУЩЕСТВУЕТ, НО НЕ ИСПОЛЬЗУЕТСЯ**. Дублирует PageHeader.

### PeriodFilter
- Select с 4 опциями: 7 дней · 30 дней · 90 дней · Всё время.

### DateRangePicker
- Используется только на `TableFilters` → legacy game-metrics. **Изолирован**.

### RefreshButton
- Используется только на legacy game-metrics.

### Login
- **Legacy inline styles**, raw colors.
- Brand: «Sales Up» + «Admin Panel» (английский).
- Password-only, без remember-me / forgot-password / multi-user.

## ❌ Cross-cutting проблемы

1. **TopBar — мёртвый компонент**.
2. **Sidebar: 9 из 11 пунктов на английском**:

| Русские | Английские |
|---|---|
| Заявки (формы) | Real-time, Overview, Branch Analytics, Engagement, Drop-off Zones, Funnel & UTM, Pages, Offer Conversion, Participants, Player Journey, Leaderboard |

3. **«Player Journey» → redirect на Participants** — дубль в меню.
4. **Game-metrics НЕТ в sidebar** (подтверждение orphan).
5. **Нет TopBar с user-info / logout / notifications** — базовый функциональный пробел (нельзя выйти из UI!).
6. **PeriodFilter — нет «Today»/«Yesterday»/custom**.
7. **Leads без PeriodFilter** (единственная дыра).
8. **Нет global search (Cmd+K)**.
9. **Нет breadcrumbs** на detail-страницах.
10. **Loading/Empty/Error states — разнобой**. Нет общих компонентов.
11. **Error handling: console.error + тишина**. Нет toast.
12. **Login — legacy-стиль**.
13. **Iconography** — `Sparkles` для Engagement, `Globe` для Pages — случайны.
14. **Нет collapse / customization sidebar**.
15. **Нет dark mode** (хотя CSS-переменные готовы).
16. **Мобильная адаптация — только sidebar**. Контент — нет.

## ✅ Что хорошо

1. Sidebar группы — логическая иерархия.
2. Active-highlight через `startsWith(href + '/')`.
3. CSS-переменные `--admin-*` готовы к themes.
4. Burger + overlay работает.
5. `usePeriodParam` — shareable URL.
6. `PageHeader` как единый паттерн.
7. `requireAdmin` во всех API.
8. Empty states существуют.

## 🗑️ Что убрать
1. `TopBar.tsx` компонент.
2. Пункт «Player Journey» из Sidebar.
3. `/admin/game-metrics`.
4. `/api/admin/pages/[slug]`.
5. `RefreshButton` + `TableFilters` + `DateRangePicker` в текущем виде.
6. `lib/admin/queries.ts` (старый).

## ➕ Что добавить

### MUST
1. TopBar c user-info, logout, notifications.
2. Русификация всех sidebar-пунктов.
3. «Сегодня» и «Вчера» в PeriodFilter + custom range.
4. PeriodFilter на Leads.
5. Общие компоненты: `<LoadingSkeleton />`, `<EmptyState />`, `<ErrorBoundary with retry />`.
6. Toast/banner при ошибках.
7. Global search (Cmd+K).
8. Breadcrumbs на detail-страницах.
9. Logout + user info в шапке.

### SHOULD
10. Favorites / прикреплённые страницы.
11. Collapse sidebar.
12. Dark mode toggle.
13. Mobile-responsive KPI grids.
14. Notification bell.
15. Переключатель языка uz/ru.

## 🔧 Русификация sidebar labels

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
| Player Journey | **удалить** |
| Leaderboard | Таблица лидеров |

## 📊 Итоговая оценка каркаса

| Критерий | Оценка |
|---|---|
| Консистентность i18n | **3/10** |
| Архитектурная чистота | **5/10** |
| Фильтры (период/срезы) | **4/10** |
| Базовые UX-ожидания | **2/10** |
| Стандарт админки 2024+ | **1/10** |
| Mobile responsiveness | **4/10** |
| Error/Loading/Empty паттерны | **3/10** |

**Вердикт:** MVP-каркас, не production. Для 1 админа терпимо; для команды — блокер.

---

# 🎯 ФИНАЛЬНАЯ СВОДКА

## Общие паттерны (cross-cutting)

### 🔴 Системные проблемы:
1. **Raw `node_id`** в insights/charts/replays — везде (~6 страниц).
2. **Magic numbers в коде** (5%, 15s, 90s, 50 limit) — везде. Нет конфига.
3. **Отсутствие сегмента uz/ru** — нет ни на одной странице. Критично для UZ.
4. **Отсутствие сегмента device** — почти везде (только Pages detail).
5. **Отсутствие связи с Bitrix** — Leads/Participants/Player/Offer **не связаны со статусом сделки**.
6. **Отсутствие трендов / дельт vs prev period** — одно число без динамики.
7. **Отсутствие экспорта CSV** — только 2 страницы из 11.
8. **Английский в UI** — 9 из 11 sidebar + titles страниц.
9. **Legacy-слой**: game-metrics, login, pages/[slug], TopBar, queries.ts — **не мигрированы в Dashboard 2.0**.

### 🟢 Сильные архитектурные решения:
1. **usePeriodParam + URL** — shareable ссылки.
2. **PageHeader+actions pattern**.
3. **InsightCard** с условным отображением.
4. **`requireAdmin` на всех API** — security consistent.
5. **Hints с нормами** на Engagement — образовательный UX.
6. **PlayerProfile + Timeline + Replay + Notes + Recommendation** — концептуально сильнейшая страница.
7. **ScenarioFlowMap** на Branch — технически впечатляющий компонент.
8. **Live pulse indicator** на Realtime.

## Приоритеты переработки

### 🥇 Приоритет 1 — деньги и продажи
- **Leads** → Bitrix + связка с Player + outreach-кнопки (**70%** переработки).
- **Offer** → что такое «Конверсия», revenue, CR, trend (**50%**).
- **Participants** → фильтры + bulk actions + статус Bitrix (**50%**).

### 🥈 Приоритет 2 — аналитика
- **Overview** → CR + дельты + sparkline + UTM-топ (**60%**).
- **Funnel** → 5-UTM + CPL/ROAS + drill-down (**70%**).
- **Dropoff** → rate вместо count + имена узлов (**70%**).
- **Engagement** → retention + breakdown Interest Index + корреляции (**55%**).

### 🥉 Приоритет 3 — геймдизайн
- **Branch** → heatmap-оверлей + coverage % (**30%**).
- **Leaderboard** → табы (неделя/месяц/всё время) + segments (**40%**).
- **Realtime** → push-alerts + filter (**30%**).

### 🗑️ Приоритет 4 — удалить
- **Game-metrics** — удалить.
- **TopBar компонент** — удалить.
- **`/api/admin/pages/[slug]`** — удалить или подключить.
- **`queries.ts`** — мигрировать в queries-v2.

### 🏗️ Приоритет 5 — каркас
- **TopBar с logout/user/notifications** — добавить.
- **Русификация sidebar'а** — полностью.
- **PeriodFilter с Today/Yesterday/Custom** — расширить.
- **Global search (Cmd+K)** — добавить.
- **Общие компоненты** Loading/Empty/Error — унифицировать.
- **Login page** — переписать.

---

## Средний балл по всему дашборду: **5/10**

Крепкая концепция и архитектура, но **недобор на каждой странице** по глубине, сегментам и связи с бизнесом. Хороший фундамент, требующий **~40–60% доработки** по операционной ценности.
