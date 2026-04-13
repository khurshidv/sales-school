# Chevrolet Автосалон — Полный сценарий

## Обзор

- **Сеттинг:** Chevrolet автосалон в Ташкенте. Современный шоурум, блестящие машины, панорамные окна.
- **Атмосфера:** Профессиональная, но живая. Музыка фоном, клиенты заходят, коллеги общаются.
- **Длительность:** 5 дней, 7-10 минут суммарно (~1.5-2 мин/день)
- **Целевая аудитория:** Начинающие продавцы (beginner)

### Учебные цели
| День | Навык | Техника продаж |
|------|-------|---------------|
| 1 | Первый контакт, выявление потребностей | Активное слушание, открытые вопросы |
| 2 | Работа с возражениями | FAB, Boomerang |
| 3 | Работа с несколькими ЛПР | Поиск компромисса, баланс |
| 4 | B2B продажи, VIP-сервис | Подготовка, кастомизация |
| 5 | Комплексная продажа (всё вместе) | Адаптивный стиль |

---

## Персонажи

### Команда салона

| ID | Имя | Роль | Возраст | Характер | Эмоции |
|----|-----|------|---------|----------|--------|
| `player` | Игрок | Новый консультант | — | Определяется выборами | — |
| `rustam` | Рустам ака | Менеджер/ментор | 45 | Строгий но справедливый, отцовская фигура | friendly, serious, proud, disappointed |
| `dilnoza` | Дильноза | Старший коллега | 30 | Конкурентная но помогает, прямая | neutral, smirk, helpful |
| `anvar` | Анвар | Младший коллега | 22 | Старательный, иногда ошибается | nervous, eager, embarrassed |

### Клиенты (по дням)

| День | ID | Имя | Архетип | Мотивация | Триггеры |
|------|----|-----|---------|-----------|----------|
| 1 | `bobur` | Бобур | Emotional Buyer | Первая машина для семьи, жена беременна | Безопасность детей, цена, доверие |
| 2 | `kamola` | Камола | Researcher | Бизнес-леди, изучила всё, сравнивает с Kia K5 | Факты, уважение к знаниям, не терпит менторства |
| 3 | `javlon` | Жавлон | Negotiator | Хочет спортивный Tracker | Мощность, дизайн, скорость |
| 3 | `nilufar` | Нилуфар | Emotional | Хочет безопасный Equinox для детей | Безопасность, вместительность, комфорт |
| 4 | `abdullaev` | Абдуллаев | Impulse + Negotiator | CEO, флот для компании + авто для жены | VIP-обращение, эксклюзивность, скорость |
| 5 | `sardor` | Сардор | Silent → Adaptive | Mystery shopper, проверяет всё | Профессионализм, внимание, терпение |

### Модели Chevrolet

| ID | Модель | Сегмент | Цена | Ключевые фишки |
|----|--------|---------|------|----------------|
| `cobalt` | Cobalt | Седан, эконом | $15,000 | Экономичный, надёжный, доступный |
| `tracker` | Tracker | Компактный кроссовер | $22,000 | Спортивный дизайн, турбо, современный |
| `equinox` | Equinox | Семейный SUV | $30,000 | 7 мест, 6 airbag, большой багажник |
| `malibu` | Malibu | Бизнес-седан | $28,000 | Бизнес-класс, кожа, Apple CarPlay |
| `tahoe` | Tahoe | Премиум SUV | $55,000 | Премиум, мощный V8, 3 ряда сидений |

---

## День 1: "Birinchi mijoz" / "Первый клиент"

**Сложность:** Tutorial | **Target score:** 30 | **Нод:** 19 | **Таймер:** 1 (15с)

**Клиент:** Бобур, 32 года, айтишник. Жена беременна вторым, нужна семейная машина вместо Cobalt. Бюджет ограничен, но безопасность — приоритет.

**Учебная цель:** Приветствие → выявление потребностей → подбор модели.

### Нод-граф
```
d1_intro → d1_briefing → d1_client_enters → d1_approach [CHOICE 15с]
  A → d1_converge_warm ──┐
  B → d1_converge_direct ┼→ d1_needs [CHOICE]
  C → d1_converge_soft ──┘
  expired → d1_converge_expired ─┘
    A → d1_needs_resp_priorities ──┐
    B → d1_needs_resp_budget ──────┼→ d1_suggest [CHOICE]
    C → d1_needs_resp_pitch ───────┘
      A → d1_result_equinox ──┐
      B → d1_result_tracker ──┼→ d1_check [BRANCH] → d1_end_success | d1_end_partial | d1_end_fail
      C → d1_result_compare ──┘
```

### Полные ноды

---

**d1_intro** `dialogue`
```
speaker: "narrator"
emotion: null
background: "bg_showroom_entrance"
transition: "day_intro"
uz: "Ertalab. Toshkentdagi Chevrolet saloni eshiklari ochilyapti. Quyosh nuri vitrina oynalarida o'ynayapti. Bugun — sizning birinchi ish kuningiz."
ru: "Утро. Двери Chevrolet-салона в Ташкенте открываются. Солнечные лучи играют на витринных стёклах. Сегодня — ваш первый рабочий день."
nextNodeId: "d1_briefing"
```

---

**d1_briefing** `dialogue`
```
speaker: "rustam"
emotion: "friendly"
uz: "Xush kelibsiz! Birinchi qoidani bepul aytaman: avval tinglang. Professionallar bunga 'aktiv tinglash' deydi — bu alohida san'at. Keling, birinchi mijozingiz kelayotganga o'xshaydi."
ru: "Добро пожаловать! Первое правило — бесплатно: слушайте сначала. Профессионалы называют это 'активное слушание' — это отдельное искусство. Кстати, ваш первый клиент, кажется, уже идёт."
nextNodeId: "d1_client_enters"
```

---

**d1_client_enters** `dialogue`
```
speaker: "narrator"
emotion: null
uz: "Salonга yosh yigit kirdi. U atrofga qarayapti, Tracker va Equinox orasida to'xtadi."
ru: "В салон зашёл молодой мужчина. Он осматривается, остановился между Tracker и Equinox."
nextNodeId: "d1_approach"
```

---

**d1_approach** `choice`
```
prompt:
  uz: "Mijozga qanday murojaat qilasiz?"
  ru: "Как вы подойдёте к клиенту?"
timeLimit: 15

choices:
  A)
    uz: "Assalomu alaykum! Chevrolet saloniga xush kelibsiz. Qanday yordam bera olaman?"
    ru: "Здравствуйте! Добро пожаловать в Chevrolet. Чем могу помочь?"
    effects: [{ type: "add_score", amount: 10, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "approach_warm" }]
    nextNodeId: "d1_converge_warm"

  B)
    uz: "Salom! Tracker yoki Equinox — qaysi biri qiziqtirdi?"
    ru: "Привет! Tracker или Equinox — какой заинтересовал?"
    effects: [{ type: "add_score", amount: 5, dimension: "timing" }]
    flags: [{ type: "set_flag", flag: "approach_direct" }]
    nextNodeId: "d1_converge_direct"

  C)
    uz: "Assalomu alaykum! Biroz ko'rib chiqing, savol bo'lsa — men shu yerdaman."
    ru: "Здравствуйте! Посмотрите спокойно, если будут вопросы — я рядом."
    effects: [{ type: "add_score", amount: 12, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "approach_soft" }]
    nextNodeId: "d1_converge_soft"

expireNodeId: "d1_approach_expired"
```

---

**d1_approach_expired** `score`
```
effects: [{ type: "add_score", amount: -5, dimension: "timing" }]
narrator:
  uz: "Siz ikkilandingiz va mijoz o'zi qarab ketdi."
  ru: "Вы замешкались, и клиент сам продолжил осматривать."
nextNodeId: "d1_converge_expired"
```

---

**d1_converge_warm** `dialogue` _(после тёплого приветствия)_
```
speaker: "bobur"
emotion: "neutral"
uz: "Rahmat, yaxshi kutib oldingiz. Aslida... xotinim ikkinchi farzandimizni kutyapti. Hozirgi Cobaltimiz kichik bo'lib qoldi. Kattaroq mashina kerak."
ru: "Спасибо, приятно. Вообще-то... жена ждёт второго ребёнка. Наш Cobalt стал маловат. Нужна машина побольше."
nextNodeId: "d1_needs"
```

---

**d1_converge_direct** `dialogue` _(после прямого вопроса о модели)_
```
speaker: "bobur"
emotion: "neutral"
uz: "Ha, shu ikkalasiga qarayapman. Oilam uchun kattaroq mashina kerak — xotinim ikkinchi farzandimizni kutyapti. Cobaltimiz endi sig'mayapti."
ru: "Да, смотрю на эти два. Нужна машина побольше для семьи — жена ждёт второго. Cobalt уже не вмещает."
nextNodeId: "d1_needs"
```

---

**d1_converge_soft** `dialogue` _(после мягкого подхода — клиент сам подходит)_
```
speaker: "bobur"
emotion: "happy"
uz: "Rahmat, shoshilmasdan ko'rib chiqdim. Aslida savol bor — xotinim ikkinchi farzandimizni kutyapti, Cobaltimiz kichik bo'lib qoldi. Oilaviy mashina kerak."
ru: "Спасибо, что дали осмотреться. У меня вопрос — жена ждёт второго ребёнка, наш Cobalt стал мал. Нужна семейная машина."
nextNodeId: "d1_needs"
```

---

**d1_converge_expired** `dialogue` _(клиент сам начинает разговор)_
```
speaker: "bobur"
emotion: "neutral"
uz: "Kechirasiz, siz shu yerdamisiz? Menga maslahat kerak — xotinim ikkinchi farzandimizni kutyapti, Cobaltimiz kichik bo'lib qoldi."
ru: "Извините, вы здесь работаете? Мне нужна консультация — жена ждёт второго, наш Cobalt стал маловат."
nextNodeId: "d1_needs"
```

---

**d1_needs** `choice`
```
prompt:
  uz: "Qanday savol berasiz?"
  ru: "Какой вопрос зададите?"
timeLimit: null

choices:
  A)
    uz: "Sizga mashinada eng muhim narsa nima — xavfsizlik, joy yoki narx?"
    ru: "Что для вас самое важное в машине — безопасность, пространство или цена?"
    effects: [{ type: "add_score", amount: 12, dimension: "discovery" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "asked_priorities" }]
    nextNodeId: "d1_needs_resp_priorities"

  B)
    uz: "Byudjetingiz qancha atrofida?"
    ru: "На какой бюджет рассчитываете?"
    effects: [{ type: "add_score", amount: 3, dimension: "discovery" }]
    flags: [{ type: "set_flag", flag: "asked_budget" }]
    nextNodeId: "d1_needs_resp_budget"

  C)
    uz: "Equinox — oilalar uchun eng zo'r tanlov! Ko'rsatay?"
    ru: "Equinox — лучший выбор для семьи! Показать?"
    effects: [{ type: "add_score", amount: -3, dimension: "discovery" }, { type: "add_score", amount: 5, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "jumped_to_pitch" }]
    nextNodeId: "d1_needs_resp_pitch"
```

---

**d1_needs_resp_priorities** `dialogue` _(ответ на вопрос о приоритетах)_
```
speaker: "bobur"
emotion: "thoughtful"
uz: "Yaxshi savol. Xavfsizlik birinchi o'rinda — bolalar uchun airbag ko'p bo'lsin. Lekin narx ham muhim — Tracker 22 ming, Equinox 30 ming... Farqi katta."
ru: "Хороший вопрос. Безопасность на первом месте — чтобы подушек побольше для детей. Но и цена важна — Tracker 22 тысячи, Equinox 30... Разница большая."
nextNodeId: "d1_suggest"
```

---

**d1_needs_resp_budget** `dialogue` _(ответ на вопрос о бюджете)_
```
speaker: "bobur"
emotion: "thoughtful"
uz: "Byudjet... 22-25 ming dollar atrofida. Kredit bo'lsa ham ko'rib chiqaman. Lekin menga narxdan ko'ra xavfsizlik muhimroq — bolalar uchun."
ru: "Бюджет... в районе 22-25 тысяч долларов. Кредит тоже рассмотрю. Но мне важнее безопасности, чем цена — ради детей."
nextNodeId: "d1_suggest"
```

---

**d1_needs_resp_pitch** `dialogue` _(ответ на преждевременный питч)_
```
speaker: "bobur"
emotion: "surprised"
uz: "Kutib turing... Men hali qaror qilganim yo'q. Avval nimalar borligini bilishim kerak. Narxlar qanday? Xavfsizlik bo'yicha farq bormi?"
ru: "Подождите... Я ещё не решил. Сначала хочу понять, что есть. Какие цены? Есть разница по безопасности?"
nextNodeId: "d1_suggest"
```

---

**d1_suggest** `choice`
```
prompt:
  uz: "Qaysi mashinani tavsiya qilasiz?"
  ru: "Какую машину порекомендуете?"
timeLimit: null

choices:
  A)
    uz: "Equinox — 6 ta airbag, 7 o'rindiq. Bolalar xavfsizligi uchun eng yaxshi. Narxi ko'proq, lekin oilangiz uchun sarmoya."
    ru: "Equinox — 6 подушек, 7 мест. Лучший для безопасности детей. Дороже, но это инвестиция в семью."
    effects: [{ type: "add_score", amount: 12, dimension: "persuasion" }, { type: "add_score", amount: 5, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "suggested_equinox" }]
    nextNodeId: "d1_result_equinox"

  B)
    uz: "Tracker ham yomon emas — 4 ta airbag bor, va 8 ming arzon. Bo'lib to'lash ham bor."
    ru: "Tracker тоже неплох — 4 подушки есть, и на 8 тысяч дешевле. Есть рассрочка."
    effects: [{ type: "add_score", amount: 8, dimension: "empathy" }, { type: "add_score", amount: 5, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "suggested_tracker" }]
    nextNodeId: "d1_result_tracker"

  C)
    uz: "Ikkalasini solishtiramizmi? Hozir xususiyatlarini yonma-yon ko'rsataman."
    ru: "Давайте сравним оба? Сейчас покажу характеристики рядом."
    effects: [{ type: "add_score", amount: 10, dimension: "expertise" }, { type: "add_score", amount: 3, dimension: "discovery" }]
    flags: [{ type: "set_flag", flag: "compared_models" }]
    nextNodeId: "d1_result_compare"
```

---

**d1_result_equinox** `dialogue` _(ответ на рекомендацию Equinox)_
```
speaker: "bobur"
emotion: "interested"
uz: "6 ta airbag — bu jiddiy. Narxi qimmatroq, lekin bolalar xavfsizligi uchun... Bo'lib to'lash shartlari qanday? Xotinimga ham ko'rsatishim kerak."
ru: "6 подушек — это серьёзно. Дороже, конечно, но ради безопасности детей... А какие условия рассрочки? Жене тоже надо показать."
nextNodeId: "d1_check"
```

---

**d1_result_tracker** `dialogue` _(ответ на рекомендацию Tracker)_
```
speaker: "bobur"
emotion: "thoughtful"
uz: "Tracker arzonroq, bu yaxshi. Lekin 4 ta airbag yetarlimi oila uchun? Equinox bilan solishtirib ko'rsangiz... Vizitkangiz bormi? Xotinimga ham maslahat qilishim kerak."
ru: "Tracker дешевле, это хорошо. Но 4 подушки — достаточно для семьи? Может, сравните с Equinox... Есть визитка? Надо с женой посоветоваться."
nextNodeId: "d1_check"
```

---

**d1_result_compare** `dialogue` _(ответ на предложение сравнить)_
```
speaker: "bobur"
emotion: "happy"
uz: "Ana bu yaxshi yondashuv! Solishtirib ko'rsak, aniqroq bo'ladi. Xotinimga ham shu solishtirishni ko'rsataman. Vizitkangiz bormi?"
ru: "Вот это правильный подход! Сравнение — это наглядно. Покажу жене. Есть ваша визитка?"
nextNodeId: "d1_check"
```

---

**d1_check** `condition_branch`
```
branches:
  - condition: { type: "score_gte", value: 25 }
    nextNodeId: "d1_end_success"
  - condition: { type: "score_gte", value: 12 }
    nextNodeId: "d1_end_partial"
fallbackNodeId: "d1_end_fail"
```

---

**d1_end_success** `end`
```
outcome: "success"
effects: [
  { type: "add_xp", amount: 100 },
  { type: "unlock_achievement", id: "first_contact" },
  { type: "set_flag", flag: "d1_success" }
]
dialogue:
  speaker: "rustam"
  emotion: "proud"
  uz: "Ajoyib! Siz hozirgina 'ehtiyojlarni aniqlash' texnikasini sezdingizmi? Yaxshi sotuvchilar buni ataylab, tizimli qiladi. Dilnoza shu sababli oyiga 15 million oladi."
  ru: "Отлично! Вы только что применили технику 'выявление потребностей' — почувствовали? Хорошие продавцы делают это намеренно, системно. Именно поэтому Дильноза зарабатывает 15 миллионов в месяц."
course_hint:
  uz: "💡 Bu texnika Sales Up dasturining 2-modulida chuqur o'rgatiladi"
  ru: "💡 Эта техника подробно разбирается в модуле 2 программы Sales Up"
```

---

**d1_end_partial** `end`
```
outcome: "partial"
effects: [
  { type: "add_xp", amount: 65 },
  { type: "set_flag", flag: "d1_partial" }
]
dialogue:
  speaker: "rustam"
  emotion: "serious"
  uz: "Yomon emas. Lekin professional sotuvchi savollarni tasodifan emas, tizim bilan beradi — SPIN texnikasi deyiladi. Shuning uchun yaxshi sotuvchilar o'rtacha ish haqi 2-3 baravar ko'p oladi."
  ru: "Неплохо. Но профессиональный продавец задаёт вопросы не случайно, а по системе — это называется техника SPIN. Именно поэтому хорошие продавцы зарабатывают в 2-3 раза больше среднего."
course_hint:
  uz: "💡 SPIN texnikasi — Sales Up dasturining asosiy modullaridan biri"
  ru: "💡 Техника SPIN — один из ключевых модулей программы Sales Up"
```

---

**d1_end_fail** `end`
```
outcome: "failure"
effects: [
  { type: "add_xp", amount: 30 },
  { type: "lose_life" },
  { type: "set_flag", flag: "d1_fail" }
]
dialogue:
  speaker: "rustam"
  emotion: "disappointed"
  uz: "Hech gap yo'q. Bilasizmi, men ham birinchi yilda shunday xato qilganman. Farq shundaki — men o'sha xatolardan tizimli o'rgandim. Ana shunday tizim bor, o'rgatadigan."
  ru: "Ничего. Знаете, я в первый год делал те же ошибки. Разница в том — я учился на них системно. Есть такая система, которой учат."
course_hint:
  uz: "💡 Qayta urinib ko'ring — yoki Sales Up dasturida tizimni o'rganing"
  ru: "💡 Попробуйте ещё раз — или освойте систему в программе Sales Up"
```

### Таблица баллов Day 1

| Нод | Вариант A | Вариант B | Вариант C | Expiry |
|-----|-----------|-----------|-----------|--------|
| d1_approach | +10 rapport | +5 timing | +12 empathy | -5 timing |
| d1_needs | +12 discovery, +5 rapport | +3 discovery | -3 discovery, +5 expertise | — |
| d1_suggest | +12 persuasion, +5 expertise | +8 empathy, +5 persuasion | +10 expertise, +3 discovery | — |
| **Макс путь** | **A→A→A = 44** | | **C→A→C = 42** | |

**Оптимальный путь к S-рангу (≥27):** Любая комбинация с A в needs + A или C в suggest.

### Достижения Day 1
- `first_contact` — Пройти День 1 (success)

---

## День 2: "Talabchan mijoz" / "Требовательный клиент"

**Сложность:** Easy | **Target score:** 40 | **Нод:** 11 | **Таймер:** 1 (10с)

**Клиент:** Камола, 35 лет, бизнес-леди. Изучила всё про Malibu и Kia K5. Хочет скидку. Не терпит когда ей объясняют очевидное.

**Учебная цель:** Презентация через ценность → работа с возражениями → закрытие.

### Нод-граф
```
d2_intro → d2_anvar_files → d2_callback_check [BRANCH] → d2_kamola_enters
→ d2_presentation [CHOICE]
  A → d2_kamola_obj_features ──┐
  B → d2_kamola_obj_value ─────┼→ d2_objection [CHOICE 10с]
  C → d2_kamola_obj_priorities ┘
    A → d2_kamola_reacts_service ──┐
    B → d2_kamola_reacts_resale ───┼→ d2_closing [CHOICE]
    C → d2_kamola_reacts_discount ─┘
    expired → d2_kamola_reacts_timeout ─┘
→ d2_check [BRANCH] → d2_end_success | d2_end_partial | d2_end_fail | d2_end_hidden
```

### Полные ноды

---

**d2_intro** `dialogue`
```
speaker: "rustam"
emotion: "serious"
uz: "Bugun Kamola xonim keladi — u hamma narsani biladi. Unga o'rgatmang. Bu siz uchun FAB texnikasini sinab ko'rish imkoniyati: Feature, Advantage, Benefit. Uch so'z — bitta tizim."
ru: "Сегодня придёт Камола — она всё знает. Не учите её. Это ваш шанс попробовать технику FAB: Feature, Advantage, Benefit. Три слова — одна система."
nextNodeId: "d2_callback_check"
```

---

**d2_callback_check** `condition_branch`
```
branches:
  - condition: { type: "flag", flag: "d1_success" }
    nextNodeId: "d2_callback"
fallbackNodeId: "d2_kamola_enters"
```

---

**d2_callback** `dialogue`
```
speaker: "narrator"
emotion: null
uz: "Telefon jiringladi — kechagi Bobur qo'ng'iroq qildi. Xotini bilan test-drayvga kelmoqchi!"
ru: "Зазвонил телефон — вчерашний Бобур звонит. Хочет приехать с женой на тест-драйв!"
effects: [{ type: "add_score", amount: 5, dimension: "opportunity" }, { type: "add_bonus", id: "callback_bonus" }]
nextNodeId: "d2_kamola_enters"
```

---

**d2_kamola_enters** `dialogue`
```
speaker: "kamola"
emotion: "confident"
uz: "Salom. Malibu ko'rmoqchiman. Kia K5 bilan solishtirib bo'ldim, Malibu yutadi — lekin narxi baland."
ru: "Здравствуйте. Хочу посмотреть Malibu. Я уже сравнила с Kia K5 — Malibu выигрывает, но цена выше."
nextNodeId: "d2_presentation"
```

---

**d2_presentation** `choice`
```
prompt:
  uz: "Kamola xonimga qanday prezentatsiya qilasiz?"
  ru: "Как будете презентовать Камоле?"
timeLimit: null

choices:
  A)
    uz: "Siz allaqachon yaxshi tahlil qilgansiz. Men faqat K5 da yo'q farqlarni aytaman — adaptive cruise va 360° kamera."
    ru: "Вы уже отлично проанализировали. Покажу только то, чего нет у K5 — адаптивный круиз и камера 360°."
    effects: [{ type: "add_score", amount: 15, dimension: "expertise" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "respected_knowledge" }]
    nextNodeId: "d2_kamola_obj_features"

  B)
    uz: "Malibu biznes-klass segmentida eng yaxshi narx-sifat nisbati. Keling, asosiy xususiyatlarni ko'rib chiqamiz."
    ru: "Malibu — лучшее соотношение цена-качество в бизнес-классе. Давайте пройдёмся по основным характеристикам."
    effects: [{ type: "add_score", amount: 10, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "standard_pitch" }]
    nextNodeId: "d2_kamola_obj_value"

  C)
    uz: "Qaysi jihati sizga eng muhim — qulaylik, xavfsizlik yoki texnologiyalar?"
    ru: "Что для вас важнее всего — комфорт, безопасность или технологии?"
    effects: [{ type: "add_score", amount: 8, dimension: "discovery" }, { type: "add_score", amount: 5, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "asked_priorities_d2" }]
    nextNodeId: "d2_kamola_obj_priorities"
```

---

**d2_kamola_obj_features** `dialogue` _(ответ на показ уникальных фич)_
```
speaker: "kamola"
emotion: "checking"
uz: "Adaptive cruise va 360° kamera — bu yaxshi. Lekin K5 da ham kamera bor. 3 ming farq faqat cruise uchunmi?"
ru: "Адаптивный круиз и камера 360° — это хорошо. Но у K5 тоже есть камера. 3 тысячи разницы — только за круиз?"
nextNodeId: "d2_objection"
```

---

**d2_kamola_obj_value** `dialogue` _(ответ на narx-sifat nisbati)_
```
speaker: "kamola"
emotion: "checking"
uz: "Narx-sifat nisbati — bu chiroyli gap. Lekin K5 — 25 ming, Malibu — 28 ming. 3 ming farq uchun konkret nima olaman?"
ru: "Соотношение цена-качество — красиво звучит. Но K5 — 25 тысяч, Malibu — 28. За 3 тысячи конкретно что получу?"
nextNodeId: "d2_objection"
```

---

**d2_kamola_obj_priorities** `dialogue` _(ответ на вопрос о приоритетах)_
```
speaker: "kamola"
emotion: "confident"
uz: "Texnologiyalar va qulaylik. Lekin men buni allaqachon bilaman — K5 bilan solishtirdim. Savol boshqa: 3 ming farq uchun nima olaman?"
ru: "Технологии и комфорт. Но я это уже знаю — сравнивала с K5. Вопрос другой: за 3 тысячи разницы — что получу?"
nextNodeId: "d2_objection"
```

---

**d2_objection** `choice`
```
prompt:
  uz: "Narx e'tiroziga qanday javob berasiz?"
  ru: "Как ответите на возражение по цене?"
timeLimit: 20

choices:
  A)
    uz: "3 ming — bu 2 yillik bepul servis. K5 da yo'q. Yiliga 1500 tejaysiz servisga."
    ru: "3 тысячи — это 2 года бесплатного сервиса. У K5 нет. Экономия $1500 в год на обслуживании."
    effects: [{ type: "add_score", amount: 15, dimension: "persuasion" }, { type: "add_score", amount: 5, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "value_reframe" }]
    nextNodeId: "d2_kamola_reacts_service"

  B)
    uz: "Tushunaman. Ko'p mijozlarimiz ham shunday o'ylagan, lekin Malibu egalari o'z tanlovlaridan mamnun — qayta sotish narxi ham yuqori."
    ru: "Понимаю. Многие клиенты думали так же, но владельцы Malibu довольны — и перепродажная стоимость выше."
    effects: [{ type: "add_score", amount: 10, dimension: "persuasion" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "social_proof" }]
    nextNodeId: "d2_kamola_reacts_resale"

  C)
    uz: "Chegirma qilsam bo'ladimi? Menejer bilan gaplashaman."
    ru: "Могу попросить скидку? Поговорю с менеджером."
    effects: [{ type: "add_score", amount: -5, dimension: "persuasion" }, { type: "add_score", amount: 3, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "offered_discount" }]
    nextNodeId: "d2_kamola_reacts_discount"

expireNodeId: "d2_objection_expired"
```

---

**d2_objection_expired** `score`
```
effects: [{ type: "add_score", amount: -8, dimension: "timing" }]
narrator:
  uz: "Siz javob topa olmadingiz. Kamola xonim sabrsizlanmoqda."
  ru: "Вы не нашли что ответить. Камола теряет терпение."
nextNodeId: "d2_kamola_reacts_timeout"
```

---

**d2_kamola_reacts_service** `dialogue` _(реакция на аргумент о сервисе)_
```
speaker: "kamola"
emotion: "checking"
uz: "Hmm, 2 yillik servis... Yiliga 1500 tejash — bu hisob-kitob qiladigan gap. Qiziq."
ru: "Хм, 2 года сервиса... Экономия $1500 в год — это уже считаемый аргумент. Интересно."
nextNodeId: "d2_closing"
```

---

**d2_kamola_reacts_resale** `dialogue` _(реакция на перепродажную стоимость)_
```
speaker: "kamola"
emotion: "checking"
uz: "Qayta sotish narxi... Bu to'g'ri, lekin K5 ham likvidli mashina. Boshqa argument bormi?"
ru: "Перепродажная стоимость... Это верно, но K5 тоже ликвидна. Ещё аргументы есть?"
nextNodeId: "d2_closing"
```

---

**d2_kamola_reacts_discount** `dialogue` _(реакция на предложение скидки)_
```
speaker: "kamola"
emotion: "skeptical"
uz: "Chegirma? Men chegirma uchun emas, argument uchun keldim. Malibu nimasi bilan yaxshiroq — shuni ayting."
ru: "Скидка? Я пришла не за скидками, а за аргументами. Скажите, чем Malibu лучше — конкретно."
nextNodeId: "d2_closing"
```

---

**d2_kamola_reacts_timeout** `dialogue` _(реакция на таймаут)_
```
speaker: "kamola"
emotion: "skeptical"
uz: "Javob yo'qmi? Demak, 3 ming farq uchun argument yo'q. Qiziq..."
ru: "Нет ответа? Значит, за 3 тысячи разницы аргументов нет. Интересно..."
nextNodeId: "d2_closing"
```

---

**d2_closing** `choice`
```
prompt:
  uz: "Qanday yakunlaysiz?"
  ru: "Как завершите разговор?"
timeLimit: null

choices:
  A)
    uz: "Test-drayvga chiqamizmi? O'tirib ko'rganingizda farq boshqacha his etiladi."
    ru: "Поедем на тест-драйв? Когда сядете за руль, разница чувствуется совсем иначе."
    effects: [{ type: "add_score", amount: 12, dimension: "timing" }, { type: "add_score", amount: 5, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "offered_test_drive_d2" }]
    nextNodeId: "d2_check"

  B)
    uz: "Ma'lumotlarni telegramga yuborsam bo'ladimi? Solishtirish jadvalini tayyorlayman."
    ru: "Могу отправить в телеграм? Подготовлю сравнительную таблицу."
    effects: [{ type: "add_score", amount: 8, dimension: "rapport" }, { type: "add_score", amount: 3, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "sent_info" }]
    nextNodeId: "d2_check"

  C)
    uz: "Hozir qaror qilsangiz, maxsus shartlar taklif qila olaman."
    ru: "Если решите сейчас, могу предложить особые условия."
    effects: [{ type: "add_score", amount: 5, dimension: "timing" }, { type: "add_score", amount: -3, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "pressure_close" }]
    nextNodeId: "d2_check"
```

---

**d2_check** `condition_branch`
```
branches:
  - condition: { type: "and", conditions: [
      { type: "score_gte", value: 35 },
      { type: "flag", flag: "respected_knowledge" }
    ]}
    nextNodeId: "d2_end_hidden"
  - condition: { type: "score_gte", value: 32 }
    nextNodeId: "d2_end_success"
  - condition: { type: "score_gte", value: 18 }
    nextNodeId: "d2_end_partial"
fallbackNodeId: "d2_end_fail"
```

---

**d2_end_hidden** `end`
```
outcome: "hidden_ending"
effects: [
  { type: "add_xp", amount: 150 },
  { type: "gain_life" },
  { type: "unlock_achievement", id: "respect_earns_referrals" },
  { type: "set_flag", flag: "d2_hidden" }
]
dialogue:
  speaker: "kamola"
  emotion: "impressed"
  uz: "Bilasizmi, siz boshqalarga o'xshamaysiz. Dugonalarimga ham aytaman — sizga kelsinlar."
  ru: "Знаете, вы не похожи на остальных. Скажу подругам — пусть к вам приходят."
```

---

**d2_end_success** `end`
```
outcome: "success"
effects: [
  { type: "add_xp", amount: 110 },
  { type: "set_flag", flag: "d2_success" }
]
dialogue:
  speaker: "rustam"
  emotion: "proud"
  uz: "Kamola xonim qiyin mijoz, lekin siz yaxshi ishladingiz. E'tirozga javob berdingiz — bu muhim."
  ru: "Камола — сложный клиент, но вы справились. Ответили на возражение — это важно."
```

---

**d2_end_partial** `end`
```
outcome: "partial"
effects: [
  { type: "add_xp", amount: 70 },
  { type: "set_flag", flag: "d2_partial" }
]
dialogue:
  speaker: "rustam"
  emotion: "serious"
  uz: "Kamola xonim ketdi, lekin qaytishi noaniq. Narx e'tiroziga kuchliroq javob kerak edi."
  ru: "Камола ушла, но вернётся ли — неизвестно. Нужен был более сильный ответ на возражение по цене."
```

---

**d2_end_fail** `end`
```
outcome: "failure"
effects: [
  { type: "add_xp", amount: 35 },
  { type: "lose_life" },
  { type: "set_flag", flag: "d2_fail" }
]
dialogue:
  speaker: "rustam"
  emotion: "disappointed"
  uz: "Kamola xonim ketdi. Eslab qoling: bilimli mijozga hurmat ko'rsating, o'rgatmang."
  ru: "Камола ушла. Запомните: знающему клиенту — уважение, а не лекции."
```

### Таблица баллов Day 2

| Нод | Вариант A | Вариант B | Вариант C | Expiry |
|-----|-----------|-----------|-----------|--------|
| d2_presentation | +15 expertise, +5 rapport | +10 expertise | +8 discovery, +5 empathy | — |
| d2_objection | +15 persuasion, +5 expertise | +10 persuasion, +5 rapport | -5 persuasion, +3 empathy | -8 timing |
| d2_closing | +12 timing, +5 persuasion | +8 rapport, +3 expertise | +5 timing, -3 rapport | — |
| **Макс путь** | **A→A→A = 57** | | **Callback +5 = 62** | |

**S-ранг (≥36):** A в presentation + A в objection + любой в closing.
**Hidden:** A в presentation (respected_knowledge) + score ≥35.

### Достижения Day 2
- `respect_earns_referrals` — Получить скрытую концовку Day 2 (Камола рекомендует друзьям)

---

## День 3: "Er-xotin tanlovi" / "Выбор пары"

**Сложность:** Medium | **Target score:** 50 | **Нод:** 12 | **Таймер:** 1 (10с)

**Клиенты:** Жавлон (32, бизнесмен) хочет Tracker. Нилуфар (30, мама двоих) хочет Equinox. Оба упрямы, но любят друг друга.

**Учебная цель:** Работа с несколькими ЛПР → поиск компромисса → не принимать чью-то сторону.

### Нод-граф
```
d3_day_intro → d3_intro → d3_couple_enters → d3_who_first [CHOICE]
  A → d3_conflict_both ──────┐
  B → d3_conflict_tracker ───┼→ d3_compromise [CHOICE 10с]
  C → d3_conflict_equinox ───┘
    A → d3_pair_reacts_balanced ──┐
    B → d3_pair_reacts_sport ─────┼→ d3_anniversary_check [BRANCH]
    C → d3_pair_reacts_tradein ───┘
→ d3_closing [CHOICE] → d3_check [BRANCH]
→ d3_end_success | d3_end_partial | d3_end_fail | d3_end_hidden
```

### Полные ноды

---

**d3_intro** `dialogue`
```
speaker: "dilnoza"
emotion: "smirk"
uz: "Bugun er-xotin keladi. Maslaha: ikkalasini ham tinglang. Tomonini olmang. — Aytmoqchi, kecha LuxeWay test-drayvidan qaytdim, yangi Tahoe sinab ko'rdim. Yaxshi sotuvchi bo'lsangiz, buni o'zingiz xarid qila olasiz."
ru: "Сегодня придёт пара. Слушайте обоих, не принимайте сторону. — Кстати, вчера вернулась с тест-драйва LuxeWay, попробовала новый Tahoe. Станете хорошим продавцом — сможете себе позволить."
nextNodeId: "d3_couple_enters"
```

---

**d3_couple_enters** `dialogue`
```
speaker: "narrator"
emotion: null
uz: "Salon eshigi ochildi. Yosh er-xotin kirdi — u Tracker tomon, u esa Equinox tomon yo'naldi."
ru: "Дверь салона открылась. Вошла молодая пара — он к Tracker, она к Equinox."
nextNodeId: "d3_who_first"
```

---

**d3_who_first** `choice`
```
prompt:
  uz: "Avval kim bilan gaplashasiz?"
  ru: "С кем заговорите первым?"
timeLimit: null

choices:
  A)
    uz: "Ikkalangizga ham salom! Birga ko'rib chiqamizmi?"
    ru: "Здравствуйте оба! Давайте вместе посмотрим?"
    effects: [{ type: "add_score", amount: 15, dimension: "rapport" }, { type: "add_score", amount: 5, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "addressed_both" }]
    nextNodeId: "d3_conflict_both"

  B)
    uz: "Assalomu alaykum! Tracker qiziqtirdi? Keling, ko'rsataman."
    ru: "Здравствуйте! Tracker заинтересовал? Давайте покажу."
    effects: [{ type: "add_score", amount: 8, dimension: "timing" }]
    flags: [{ type: "set_flag", flag: "approached_javlon" }]
    nextNodeId: "d3_conflict_tracker"

  C)
    uz: "Salom! Equinox — ajoyib tanlov oilalar uchun. Ko'rsatay?"
    ru: "Здравствуйте! Equinox — отличный выбор для семьи. Показать?"
    effects: [{ type: "add_score", amount: 8, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "approached_nilufar" }]
    nextNodeId: "d3_conflict_equinox"
```

---

**d3_conflict_both** `dialogue` _(обоим — ссора мягче)_
```
speaker: "javlon"
emotion: "thinking"
uz: "Yaxshi, birga ko'raylik. Lekin men Tracker xohlayman — sportiv, tez. Equinox katta.\n\nNilufar: Bolalarga joy kerak! Lekin... birga ko'rsak, yaxshiroq bo'ladi."
ru: "Хорошо, посмотрим вместе. Но я хочу Tracker — спортивный, быстрый. Equinox большой.\n\nНилуфар: Детям нужно место! Но... вместе посмотреть — лучше."
nextNodeId: "d3_compromise"
```

---

**d3_conflict_tracker** `dialogue` _(подошёл к Жавлону — он доволен)_
```
speaker: "javlon"
emotion: "stubborn"
uz: "Ko'rdingizmi! Tracker — ana shu mashina! Sportiv, tez, chiroyli.\n\nNilufar: Yana Tracker... Bolalarga joy kerak! Equinox — 7 o'rindiq. Nega meni hech kim tinglamaydi?"
ru: "Видите! Tracker — вот это машина! Спортивный, быстрый, красивый.\n\nНилуфар: Опять Tracker... Детям нужно место! Equinox — 7 мест. Почему меня никто не слушает?"
nextNodeId: "d3_compromise"
```

---

**d3_conflict_equinox** `dialogue` _(подошёл к Нилуфар — она довольна)_
```
speaker: "javlon"
emotion: "stubborn"
uz: "Yana Equinox! Men Tracker xohlayman — sportiv, tez. Equinox juda katta va sekin.\n\nNilufar: To'g'ri aytdilar — oilalar uchun eng yaxshi! Bolalarga joy va xavfsizlik kerak."
ru: "Опять Equinox! Я хочу Tracker — спортивный, быстрый. Equinox слишком большой и медленный.\n\nНилуфар: Правильно сказали — лучший для семей! Детям нужно место и безопасность."
nextNodeId: "d3_compromise"
```

---

**d3_compromise** `choice`
```
prompt:
  uz: "Qanday kelishuv topasiz?"
  ru: "Как найдёте компромисс?"
timeLimit: 20

choices:
  A)
    uz: "Ikkalangizning ham talablaringiz to'g'ri. Tracker — kundalik uchun, Equinox — oila uchun. Hozir nima ko'proq kerak?"
    ru: "Вы оба правы. Tracker — для будней, Equinox — для семьи. Что сейчас нужнее?"
    effects: [{ type: "add_score", amount: 15, dimension: "empathy" }, { type: "add_score", amount: 10, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "balanced_both" }]
    nextNodeId: "d3_pair_reacts_balanced"

  B)
    uz: "Equinox sport rejimi ham bor — tezlik ham, joy ham. Ikkalangiz uchun yechim."
    ru: "У Equinox есть спорт-режим — и скорость, и пространство. Решение для обоих."
    effects: [{ type: "add_score", amount: 12, dimension: "expertise" }, { type: "add_score", amount: 5, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "equinox_sport_mode" }]
    nextNodeId: "d3_pair_reacts_sport"

  C)
    uz: "Tracker olib, keyinroq Equinoxga almashtirsangiz bo'ladi. Trade-in dasturimiz bor."
    ru: "Можете взять Tracker, а позже обменять на Equinox. У нас есть trade-in программа."
    effects: [{ type: "add_score", amount: 8, dimension: "timing" }, { type: "add_score", amount: 5, dimension: "opportunity" }]
    flags: [{ type: "set_flag", flag: "trade_in_offer" }]
    nextNodeId: "d3_pair_reacts_tradein"

expireNodeId: "d3_compromise_expired"
```

---

**d3_compromise_expired** `score`
```
effects: [{ type: "add_score", amount: -5, dimension: "timing" }]
narrator:
  uz: "Ikkilandingiz va er-xotin bir-biri bilan bahslashishda davom etdi."
  ru: "Вы замешкались, и пара продолжила спорить между собой."
nextNodeId: "d3_anniversary_check"
```

---

**d3_pair_reacts_balanced** `dialogue` _(реакция на баланс)_
```
speaker: "nilufar"
emotion: "thoughtful"
uz: "U to'g'ri aytdi... Hozir bolalar uchun kattaroq kerak.\n\nJavlon: Hmm... balki haqiqatan ham Equinox ko'rib chiqsak..."
ru: "Он прав... Сейчас для детей нужно побольше.\n\nЖавлон: Хм... может, и правда посмотрим Equinox..."
nextNodeId: "d3_anniversary_check"
```

---

**d3_pair_reacts_sport** `dialogue` _(реакция на спорт-режим)_
```
speaker: "javlon"
emotion: "thinking"
uz: "Sport rejimi? Jiddiy gapiryapsizmi? Ko'rsating!\n\nNilufar: Ana ko'rdingmi — ikkalamiz uchun ham bor!"
ru: "Спорт-режим? Серьёзно? Покажите!\n\nНилуфар: Вот видишь — и для тебя, и для меня!"
nextNodeId: "d3_anniversary_check"
```

---

**d3_pair_reacts_tradein** `dialogue` _(реакция на trade-in)_
```
speaker: "javlon"
emotion: "thinking"
uz: "Hmm, avval Tracker, keyin almashtirish... Bu variant yomon emas.\n\nNilufar: Lekin yana kutishim kerakmi? Bolalar esa hozir o'syapti..."
ru: "Хм, сначала Tracker, потом обменять... Вариант неплохой.\n\nНилуфар: Но мне опять ждать? А дети растут уже сейчас..."
nextNodeId: "d3_anniversary_check"
```

---

**d3_anniversary_check** `condition_branch`
```
branches:
  - condition: { type: "and", conditions: [
      { type: "flag", flag: "addressed_both" },
      { type: "flag", flag: "balanced_both" }
    ]}
    nextNodeId: "d3_anniversary_hint"
fallbackNodeId: "d3_closing"
```

---

**d3_anniversary_hint** `dialogue`
```
speaker: "nilufar"
emotion: "happy"
uz: "Bilasizmi, kelasi haftada to'yimizning 5 yilligi..."
ru: "Знаете, на следующей неделе у нас 5-летие свадьбы..."
effects: [{ type: "set_flag", flag: "knows_anniversary" }]
nextNodeId: "d3_closing"
```

---

**d3_closing** `choice`
```
prompt:
  uz: "Qanday yakunlaysiz?"
  ru: "Как завершите?"
timeLimit: null

choices:
  A)
    uz: "Ikkalangiz ham test-drayvga chiqing. Equinoxni hissiy ko'ring."
    ru: "Приезжайте оба на тест-драйв. Почувствуйте Equinox вместе."
    effects: [{ type: "add_score", amount: 10, dimension: "timing" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    nextNodeId: "d3_check"

  B) [visible_if: { type: "flag", flag: "knows_anniversary" }]
    uz: "5 yillik yubilayga — Equinoxni sovg'a qilsangiz? Biz maxsus tayyorlab beramiz, lenta bilan."
    ru: "На 5-летие — подарить Equinox? Мы оформим специально, с лентой."
    effects: [{ type: "add_score", amount: 20, dimension: "opportunity" }, { type: "add_score", amount: 10, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "anniversary_surprise" }]
    nextNodeId: "d3_check"

  C)
    uz: "Hafta oxirigacha maxsus narx taklif qila olaman."
    ru: "До конца недели могу предложить специальную цену."
    effects: [{ type: "add_score", amount: 5, dimension: "timing" }]
    nextNodeId: "d3_check"
```

---

**d3_check** `condition_branch`
```
branches:
  - condition: { type: "flag", flag: "anniversary_surprise" }
    nextNodeId: "d3_end_hidden"
  - condition: { type: "score_gte", value: 40 }
    nextNodeId: "d3_end_success"
  - condition: { type: "score_gte", value: 22 }
    nextNodeId: "d3_end_partial"
fallbackNodeId: "d3_end_fail"
```

---

**d3_end_hidden** `end`
```
outcome: "hidden_ending"
effects: [
  { type: "add_xp", amount: 180 },
  { type: "gain_life" },
  { type: "unlock_achievement", id: "love_sells" },
  { type: "set_flag", flag: "d3_hidden" }
]
dialogue:
  speaker: "javlon"
  emotion: "touched"
  uz: "Voy... ajoyib fikr. Xotinim yig'lab yuboradi. Olamiz! Equinox — bizniki."
  ru: "Ого... отличная идея. Жена расплачется. Берём! Equinox — наш."
```

---

**d3_end_success** `end`
```
outcome: "success"
effects: [
  { type: "add_xp", amount: 120 },
  { type: "set_flag", flag: "d3_success" }
]
dialogue:
  speaker: "rustam"
  emotion: "proud"
  uz: "Er-xotin bilan ishlash qiyin, lekin siz ikkalasini ham tingladingiz. Zo'r ish!"
  ru: "С парами сложно, но вы выслушали обоих. Отличная работа!"
```

---

**d3_end_partial** `end`
```
outcome: "partial"
effects: [
  { type: "add_xp", amount: 75 },
  { type: "set_flag", flag: "d3_partial" }
]
dialogue:
  speaker: "rustam"
  emotion: "serious"
  uz: "Yomon emas, lekin bir tomonga og'ib ketdingiz. Ikkalasini teng tinglang."
  ru: "Неплохо, но вы склонились к одному. Слушайте обоих одинаково."
```

---

**d3_end_fail** `end`
```
outcome: "failure"
effects: [
  { type: "add_xp", amount: 40 },
  { type: "lose_life" },
  { type: "set_flag", flag: "d3_fail" }
]
dialogue:
  speaker: "dilnoza"
  emotion: "helpful"
  uz: "Er-xotinlar — qiyin mijozlar. Sir: o'rtadagi qadriyatni toping."
  ru: "Пары — сложные клиенты. Секрет: найдите общую ценность."
```

### Достижения Day 3
- `love_sells` — Скрытая концовка: предложить Equinox как подарок на годовщину

---

## День 4: "VIP mijoz" / "VIP клиент"

**Сложность:** Hard | **Target score:** 60 | **Нод:** 12 | **Таймер:** 1 (10с)

**Клиент:** Абдуллаев, ~50, CEO строительной компании. Хочет 3 Malibu для менеджеров + Tahoe для жены. Быстрый, не терпит ожидания, ценит VIP-обращение.

**Учебная цель:** Подготовка → VIP-сервис → B2B презентация → допродажа.

### Нод-граф
```
d4_intro → d4_preparation [CHOICE: 2 из 3] → d4_anvar_helps [BRANCH]
→ d4_abdullaev_enters → d4_greeting [CHOICE]
  A → d4_abdullaev_reacts_vip ──────┐
  B → d4_abdullaev_reacts_direct ───┼→ d4_fleet [CHOICE 10с]
  C → d4_abdullaev_reacts_research ─┘
    A → d4_fleet_react_package ──┐
    B → d4_fleet_react_reliable ─┼→ d4_wife_car [CHOICE]
    C → d4_fleet_react_price ────┘
→ d4_check [BRANCH] → d4_end_success | d4_end_partial | d4_end_fail | d4_end_hidden
```

### Полные ноды

---

**d4_intro** `dialogue`
```
speaker: "rustam"
emotion: "serious"
uz: "Bugun Abdullaev — qurilish kompaniyasi direktori, VIP. Korporativ sotuv — bu alohida dunyo. B2B texnikasi oddiy B2C dan farq qiladi. Tayyorlanish muhim — professional sotuvchilar doim tayyorlanadi."
ru: "Сегодня Абдуллаев — директор строительной компании, VIP. Корпоративные продажи — отдельный мир. Техника B2B отличается от обычного B2C. Подготовка — профессиональные продавцы всегда готовятся."
nextNodeId: "d4_preparation"
```

---

**d4_preparation** `choice`
```
prompt:
  uz: "Uchrashuvgacha 2 ta tayyorgarlik ko'rishingiz mumkin. Qaysilarni tanlaysiz?"
  ru: "До встречи можете сделать 2 подготовки из 3. Что выберете?"
timeLimit: null
multiSelect: 2

choices:
  A)
    uz: "Kompaniyasi haqida internetdan izlash"
    ru: "Погуглить его компанию"
    effects: [{ type: "add_score", amount: 8, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "researched_company" }]

  B)
    uz: "Rustam akadan VIP protokolni so'rash"
    ru: "Спросить у Рустама про VIP-протокол"
    effects: [{ type: "add_score", amount: 8, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "knows_vip_protocol" }]

  C)
    uz: "Moliya bo'limidan fleet chegirma limitini aniqlash"
    ru: "Уточнить у финансов лимит fleet-скидки"
    effects: [{ type: "add_score", amount: 8, dimension: "opportunity" }]
    flags: [{ type: "set_flag", flag: "has_discount_authority" }]

nextNodeId: "d4_abdullaev_enters"
```

---

**d4_abdullaev_enters** `dialogue`
```
speaker: "abdullaev"
emotion: "impatient"
uz: "Salom. Vaqtim kam. 3 ta Malibu — menejerlarimga. Va xotinimga Tahoe. Nima taklif bor?"
ru: "Здравствуйте. Времени мало. 3 Malibu — менеджерам. И Tahoe жене. Что предложите?"
nextNodeId: "d4_greeting"
```

---

**d4_greeting** `choice`
```
prompt:
  uz: "Qanday javob berasiz?"
  ru: "Как ответите?"
timeLimit: null

choices:
  A) [boosted_if: { type: "flag", flag: "knows_vip_protocol" }]
    uz: "Abdullaev janoblari, xush kelibsiz. VIP xonaga marhamat — choy va taqdimot tayyorlab qo'ydim."
    ru: "Господин Абдуллаев, добро пожаловать. Прошу в VIP-зону — чай и презентация уже готовы."
    effects: [{ type: "add_score", amount: 15, dimension: "rapport" }, { type: "add_score", amount: 5, dimension: "timing" }]
    flags: [{ type: "set_flag", flag: "vip_greeting" }]
    nextNodeId: "d4_abdullaev_reacts_vip"

  B)
    uz: "Xush kelibsiz! Keling, Malibu larni ko'rsataman."
    ru: "Добро пожаловать! Давайте покажу Malibu."
    effects: [{ type: "add_score", amount: 8, dimension: "timing" }]
    nextNodeId: "d4_abdullaev_reacts_direct"

  C) [boosted_if: { type: "flag", flag: "researched_company" }]
    uz: "Salom! Kompaniyangiz kengayayotganini o'qidim — tabriklayman! Flot uchun maxsus shartlarimiz bor."
    ru: "Здравствуйте! Читал, что компания расширяется — поздравляю! Для флота есть особые условия."
    effects: [{ type: "add_score", amount: 12, dimension: "expertise" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "showed_research" }]
    nextNodeId: "d4_abdullaev_reacts_research"
```

---

**d4_abdullaev_reacts_vip** `dialogue` _(реакция на VIP-протокол)_
```
speaker: "abdullaev"
emotion: "neutral"
uz: "Yaxshi. Tayyorlanibsiz. Choy ichib, ishga kirishamiz. Vaqtim kam — 20 daqiqa."
ru: "Хорошо. Подготовились. Попьём чаю и к делу. У меня 20 минут."
nextNodeId: "d4_fleet"
```

---

**d4_abdullaev_reacts_direct** `dialogue` _(реакция на прямой подход)_
```
speaker: "abdullaev"
emotion: "impatient"
uz: "Shunchaki ko'rsatasizmi? Men narx va shart kutayapman. Malibu ko'rganman — taklif nima?"
ru: "Просто покажете? Я жду цену и условия. Malibu я видел — что предложите?"
nextNodeId: "d4_fleet"
```

---

**d4_abdullaev_reacts_research** `dialogue` _(реакция на подготовленность)_
```
speaker: "abdullaev"
emotion: "impressed"
uz: "O'qibsiz? Yaxshi. Bilimli sotuvchini yoqtiraman. Maxsus shartlar — eshitaman."
ru: "Читали? Хорошо. Люблю подготовленных продавцов. Особые условия — слушаю."
nextNodeId: "d4_fleet"
```

---

**d4_fleet** `choice`
```
prompt:
  uz: "3 ta Malibu uchun qanday taqdimot qilasiz?"
  ru: "Как представите 3 Malibu для флота?"
timeLimit: 20

choices:
  A)
    uz: "Flot paketi: 3 ta Malibu — har biriga 2 yillik servis, GPS monitoring, va korporativ chegirma 7%."
    ru: "Пакет флота: 3 Malibu — каждому 2 года сервиса, GPS мониторинг, корпоративная скидка 7%."
    effects: [{ type: "add_score", amount: 15, dimension: "persuasion" }, { type: "add_score", amount: 8, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "fleet_package" }]
    nextNodeId: "d4_fleet_react_package"

  B)
    uz: "Malibu — biznes segmentda eng ishonchli. Menejerlaringiz uchun ideal. Ranglarni tanlashni boshlaylikmi?"
    ru: "Malibu — самый надёжный в бизнес-сегменте. Идеален для менеджеров. Начнём выбирать цвета?"
    effects: [{ type: "add_score", amount: 10, dimension: "expertise" }, { type: "add_score", amount: 5, dimension: "timing" }]
    nextNodeId: "d4_fleet_react_reliable"

  C) [boosted_if: { type: "flag", flag: "has_discount_authority" }]
    uz: "3 ta Malibu uchun maxsus fleet narx — har biri $26,000 ($28k o'rniga). Yiliga $6,000 tejaysiz."
    ru: "Специальная fleet-цена на 3 Malibu — $26,000 каждый (вместо $28к). Экономия $6,000 в год."
    effects: [{ type: "add_score", amount: 12, dimension: "persuasion" }, { type: "add_score", amount: 10, dimension: "opportunity" }]
    flags: [{ type: "set_flag", flag: "gave_fleet_price" }]
    nextNodeId: "d4_fleet_react_price"

expireNodeId: "d4_fleet_expired"
```

---

**d4_fleet_expired** `score`
```
effects: [{ type: "add_score", amount: -8, dimension: "timing" }]
narrator:
  uz: "Abdullaev sabrsiz. Siz tayyorlanmagansiz deb o'yladi."
  ru: "Абдуллаев нетерпелив. Он подумал, что вы не подготовились."
nextNodeId: "d4_fleet_react_timeout"
```

---

**d4_fleet_react_package** `dialogue` _(реакция на флот-пакет)_
```
speaker: "abdullaev"
emotion: "neutral"
uz: "Servis va GPS — bu yaxshi. 7% chegirma... Qabul qilaman. Endi xotinimga Tahoe — gapiring."
ru: "Сервис и GPS — хорошо. Скидка 7%... Принимается. Теперь про Tahoe для жены."
nextNodeId: "d4_wife_car"
```

---

**d4_fleet_react_reliable** `dialogue` _(реакция на надёжность)_
```
speaker: "abdullaev"
emotion: "impatient"
uz: "Ishonchli — bu yaxshi. Lekin rang emas, narx kerak. Chegirma bormi? Endi Tahoe haqida gapiring."
ru: "Надёжный — хорошо. Но не цвета, а цену давайте. Скидка есть? И расскажите про Tahoe."
nextNodeId: "d4_wife_car"
```

---

**d4_fleet_react_price** `dialogue` _(реакция на fleet-цену)_
```
speaker: "abdullaev"
emotion: "impressed"
uz: "$6,000 tejash — bu raqam. Tayyorlanibsiz. Yaxshi. Endi Tahoe — xotinimga."
ru: "Экономия $6,000 — это цифра. Подготовились. Хорошо. Теперь Tahoe — для жены."
nextNodeId: "d4_wife_car"
```

---

**d4_fleet_react_timeout** `dialogue` _(реакция на таймаут)_
```
speaker: "abdullaev"
emotion: "impatient"
uz: "Javob yo'qmi? Yaxshi, Tahoe haqida gapiring — balki u yaxshiroq tayyorlangandirsiz."
ru: "Нет ответа? Ладно, расскажите про Tahoe — может, там подготовились лучше."
nextNodeId: "d4_wife_car"
```

---

**d4_wife_car** `choice`
```
prompt:
  uz: "Abdullaev xotiniga Tahoe haqida so'radi. Qanday taqdimot qilasiz?"
  ru: "Абдуллаев спросил про Tahoe для жены. Как представите?"
timeLimit: null

choices:
  A)
    uz: "Tahoe — xotiningizga qulay va xavfsiz. Premium audio, massaj o'rindiqlari. Maxsus ranglar ham bor."
    ru: "Tahoe — комфортный и безопасный для вашей супруги. Premium аудио, массажные кресла. Есть эксклюзивные цвета."
    effects: [{ type: "add_score", amount: 12, dimension: "empathy" }, { type: "add_score", amount: 5, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "personalized_tahoe" }]
    nextNodeId: "d4_check"

  B)
    uz: "Tahoe — eng kuchli SUV. 5.3L V8, 355 ot kuchi."
    ru: "Tahoe — самый мощный SUV. 5.3L V8, 355 л.с."
    effects: [{ type: "add_score", amount: 8, dimension: "expertise" }]
    nextNodeId: "d4_check"

  C)
    uz: "Tahoe + 3 Malibu — umumiy paket. Barcha 4 ta uchun maxsus korporativ shart."
    ru: "Tahoe + 3 Malibu — общий пакет. Особые корпоративные условия на все 4."
    effects: [{ type: "add_score", amount: 10, dimension: "opportunity" }, { type: "add_score", amount: 8, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "bundled_deal" }]
    nextNodeId: "d4_check"
```

---

**d4_check** `condition_branch`
```
branches:
  - condition: { type: "and", conditions: [
      { type: "flag", flag: "fleet_package" },
      { type: "flag", flag: "bundled_deal" },
      { type: "score_gte", value: 55 }
    ]}
    nextNodeId: "d4_end_hidden"
  - condition: { type: "score_gte", value: 48 }
    nextNodeId: "d4_end_success"
  - condition: { type: "score_gte", value: 28 }
    nextNodeId: "d4_end_partial"
fallbackNodeId: "d4_end_fail"
```

---

**d4_end_hidden** `end`
```
outcome: "hidden_ending"
effects: [
  { type: "add_xp", amount: 200 },
  { type: "gain_life" },
  { type: "unlock_achievement", id: "corporate_king" },
  { type: "set_flag", flag: "d4_hidden" }
]
dialogue:
  speaker: "abdullaev"
  emotion: "impressed"
  uz: "Ajoyib! Yillik korporativ shartnoma tuzamiz. Barcha yangi mashinalar — sizdan."
  ru: "Отлично! Заключим годовой корпоративный контракт. Все новые машины — через вас."
```

---

**d4_end_success** `end`
```
outcome: "success"
effects: [
  { type: "add_xp", amount: 140 },
  { type: "set_flag", flag: "d4_success" }
]
dialogue:
  speaker: "rustam"
  emotion: "proud"
  uz: "VIP mijoz bilan ishlash oson emas. Siz professional yondashuvni ko'rsatdingiz!"
  ru: "С VIP-клиентами непросто. Вы показали профессиональный подход!"
```

---

**d4_end_partial** `end`
```
outcome: "partial"
effects: [
  { type: "add_xp", amount: 85 },
  { type: "set_flag", flag: "d4_partial" }
]
dialogue:
  speaker: "rustam"
  emotion: "serious"
  uz: "Abdullaev biroz hayron qoldi. VIP mijozga oldindan tayyorlanish muhim."
  ru: "Абдуллаев слегка удивлён. Для VIP важно подготовиться заранее."
```

---

**d4_end_fail** `end`
```
outcome: "failure"
effects: [
  { type: "add_xp", amount: 45 },
  { type: "lose_life" },
  { type: "set_flag", flag: "d4_fail" }
]
dialogue:
  speaker: "rustam"
  emotion: "disappointed"
  uz: "Abdullaev ketdi. VIP — bu tayyorgarlik. Oldindan ma'lumot to'plang."
  ru: "Абдуллаев ушёл. VIP — это подготовка. Собирайте информацию заранее."
```

### Достижения Day 4
- `corporate_king` — Скрытая концовка: годовой корпоративный контракт

---

## День 5: "Oxirgi sinov" / "Финальное испытание"

**Сложность:** Boss | **Target score:** 70 | **Нод:** 12 | **Таймер:** 2 (10с, 5с)

**Клиент:** Сардор, ~40, спокойный, одет просто. Задаёт неудобные вопросы. На самом деле — mystery shopper (тайный покупатель) от руководства.

**Учебная цель:** Все навыки вместе + не судить по внешности + работа под давлением.

### Нод-граф
```
d5_intro → d5_morning_check [BRANCH] → d5_sardor_enters → d5_approach [CHOICE 10с]
  A → d5_needs_soft ────┐
  B → d5_needs_direct ──┼→ d5_needs_choice [CHOICE]
  C → d5_needs_cobalt ──┘
  expired → d5_needs_expired ─┘
    A → d5_objection_after_family ──┐
    B → d5_objection_after_budget ──┼→ d5_objection_choice [CHOICE 10с]
    C → d5_objection_after_pitch ───┘
      A → d5_sardor_reacts_service ───┐
      B → d5_sardor_reacts_denial ────┼→ d5_closing [CHOICE 5с]
      C → d5_sardor_reacts_guarantee ─┘
      expired → d5_sardor_reacts_timeout ─┘
→ d5_reveal → d5_team_reaction → d5_final_check [BRANCH]
→ d5_end_success | d5_end_partial | d5_end_fail | d5_end_grandmaster
```

### Полные ноды

---

**d5_intro** `dialogue`
```
speaker: "rustam"
emotion: "serious"
uz: "Oxirgi kun. Siz 4 kunda 4 xil texnikani sezdingiz — SPIN, FAB, e'tirozlar, B2B. Professional sotuvchilar bularni uyg'unlikda, avtomatik ishlatadi. Bu 3 oylik trening natijasi. Buguni — sinovingiz."
ru: "Последний день. За 4 дня вы почувствовали 4 техники — SPIN, FAB, работа с возражениями, B2B. Профессиональные продавцы применяют всё это одновременно, автоматически. Это результат 3 месяцев тренинга. Сегодня — ваш экзамен."
nextNodeId: "d5_morning_check"
```

---

**d5_morning_check** `condition_branch`
```
branches:
  - condition: { type: "and", conditions: [
      { type: "flag", flag: "d1_success" },
      { type: "flag", flag: "d2_success" }
    ]}
    nextNodeId: "d5_dilnoza_tip"
fallbackNodeId: "d5_sardor_enters"
```

---

**d5_dilnoza_tip** `dialogue`
```
speaker: "dilnoza"
emotion: "helpful"
uz: "Yaxshi ishlayapsiz. Oxirgi maslahat: eng qiyin mijoz — eng yashirin imkoniyat. — Men 2 yil oldin siz kabi edim. Tizimli o'rgandim, endi oyiga 3-4 ta yirik bitim yopaman. Siz ham qila olasiz."
ru: "Хорошо работаете. Последний совет: самый сложный клиент — скрытая возможность. — 2 года назад я была такой же, как вы. Обучилась системно — теперь закрываю 3-4 крупных сделки в месяц. Вы тоже сможете."
effects: [{ type: "set_flag", flag: "got_dilnoza_tip" }]
nextNodeId: "d5_sardor_enters"
```

---

**d5_sardor_enters** `dialogue`
```
speaker: "narrator"
emotion: null
uz: "Salonга oddiy kiyingan kishi kirdi. Biroz qarab, hech kimga murojaat qilmadi."
ru: "В салон зашёл скромно одетый мужчина. Осмотрелся, ни к кому не обратился."
nextNodeId: "d5_approach"
```

---

**d5_approach** `choice`
```
prompt:
  uz: "Nima qilasiz?"
  ru: "Что сделаете?"
timeLimit: 20

choices:
  A)
    uz: "Assalomu alaykum! Bemalol ko'rib chiqing. Savol bo'lsa — men shu yerdaman."
    ru: "Здравствуйте! Смотрите спокойно. Если будут вопросы — я рядом."
    effects: [{ type: "add_score", amount: 12, dimension: "empathy" }, { type: "add_score", amount: 8, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "patient_approach" }]
    nextNodeId: "d5_needs_soft"

  B)
    uz: "Salom! Qaysi model qiziqtirdi?"
    ru: "Здравствуйте! Какая модель заинтересовала?"
    effects: [{ type: "add_score", amount: 8, dimension: "timing" }, { type: "add_score", amount: 5, dimension: "rapport" }]
    nextNodeId: "d5_needs_direct"

  C)
    uz: "Cobalt ko'rayapsizmi? Bu bizning eng mashhur modelimiz."
    ru: "Смотрите Cobalt? Это наша самая популярная модель."
    effects: [{ type: "add_score", amount: 5, dimension: "expertise" }, { type: "add_score", amount: -5, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "judged_by_appearance" }]
    nextNodeId: "d5_needs_cobalt"

expireNodeId: "d5_approach_expired"
```

---

**d5_approach_expired** `score`
```
effects: [{ type: "add_score", amount: -8, dimension: "timing" }, { type: "lose_life" }]
narrator:
  uz: "Siz hech narsa qilmadingiz. Mijoz e'tiborsiz qoldi."
  ru: "Вы ничего не сделали. Клиент остался без внимания."
nextNodeId: "d5_needs_expired"
```

---

**d5_needs_soft** `dialogue` _(после мягкого подхода)_
```
speaker: "sardor"
emotion: "neutral"
uz: "Rahmat, biroz qarab chiqdim. Aslida... oilam uchun mashina kerak. Qanday tanlashni bilmayman. Yordam bera olasizmi?"
ru: "Спасибо, осмотрелся. На самом деле... нужна машина для семьи. Не знаю как выбрать. Можете помочь?"
nextNodeId: "d5_needs_choice"
```

---

**d5_needs_direct** `dialogue` _(после прямого вопроса)_
```
speaker: "sardor"
emotion: "neutral"
uz: "Hali bilmayman qaysi model. Oilam uchun mashina kerak, lekin qanday tanlashni bilmayman."
ru: "Пока не определился с моделью. Нужна машина для семьи, но не знаю с чего начать."
nextNodeId: "d5_needs_choice"
```

---

**d5_needs_cobalt** `dialogue` _(после предположения о Cobalt)_
```
speaker: "sardor"
emotion: "testing"
uz: "Cobalt? Yo'q... Oilam uchun kattaroq mashina kerak. Nima tavsiya qilasiz?"
ru: "Cobalt? Нет... Нужна машина побольше, для семьи. Что порекомендуете?"
nextNodeId: "d5_needs_choice"
```

---

**d5_needs_expired** `dialogue` _(клиент сам подходит)_
```
speaker: "sardor"
emotion: "neutral"
uz: "Kechirasiz... menga maslahat bera olasizmi? Oilam uchun mashina kerak."
ru: "Извините... можете проконсультировать? Нужна машина для семьи."
nextNodeId: "d5_needs_choice"
```

---

**d5_needs_choice** `choice`
```
prompt:
  uz: "Qanday yordam berasiz?"
  ru: "Как поможете?"
timeLimit: null

choices:
  A)
    uz: "Oilangiz haqida gapirib bering — nechta farzand, qayerga ko'p borasiz, nima muhim?"
    ru: "Расскажите о семье — сколько детей, куда часто ездите, что важно?"
    effects: [{ type: "add_score", amount: 15, dimension: "discovery" }, { type: "add_score", amount: 8, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "deep_discovery" }]
    nextNodeId: "d5_objection_after_family"

  B)
    uz: "Byudjetingiz qancha? Shunga qarab tanlaymiz."
    ru: "Какой бюджет? Подберём под него."
    effects: [{ type: "add_score", amount: 5, dimension: "discovery" }, { type: "add_score", amount: 3, dimension: "timing" }]
    nextNodeId: "d5_objection_after_budget"

  C)
    uz: "Oila uchun Equinox yoki Tracker — keling ko'rsataman."
    ru: "Для семьи — Equinox или Tracker. Давайте покажу."
    effects: [{ type: "add_score", amount: 5, dimension: "expertise" }, { type: "add_score", amount: -3, dimension: "discovery" }]
    nextNodeId: "d5_objection_after_pitch"
```

---

**d5_objection_after_family** `dialogue` _(ответ на вопрос о семье)_
```
speaker: "sardor"
emotion: "testing_notes"
uz: "Yaxshi savol berdingiz. 3 ta farzand, shaharga va qishloqqa tez-tez boramiz. Lekin... internetda yozdishgan — Chevrolet ehtiyot qismlari qimmat. Bu haqiqatmi?"
ru: "Хороший вопрос задали. 3 детей, часто ездим в город и за город. Но... в интернете пишут — запчасти на Chevrolet дорогие. Это правда?"
nextNodeId: "d5_objection_choice"
```

---

**d5_objection_after_budget** `dialogue` _(ответ на вопрос о бюджете)_
```
speaker: "sardor"
emotion: "testing_notes"
uz: "Byudjet... 25 mingacha. Lekin narxdan oldin boshqa savol bor — internetda yozdishgan, Chevrolet ehtiyot qismlari qimmat va uzoq keladi. Haqiqatmi?"
ru: "Бюджет... до 25 тысяч. Но перед ценой другой вопрос — в интернете пишут, запчасти на Chevrolet дорогие и долго ждать. Правда?"
nextNodeId: "d5_objection_choice"
```

---

**d5_objection_after_pitch** `dialogue` _(ответ на преждевременный питч)_
```
speaker: "sardor"
emotion: "testing_notes"
uz: "Kutib turing, modellardan oldin savol bor. Internetda yozdishgan — Chevrolet ehtiyot qismlari qimmat va uzoq keladi. Bu haqiqatmi?"
ru: "Подождите с моделями, сначала вопрос. В интернете пишут — запчасти на Chevrolet дорогие и долго ждать. Это правда?"
nextNodeId: "d5_objection_choice"
```

---

**d5_objection_choice** `choice`
```
prompt:
  uz: "Qanday javob berasiz?"
  ru: "Как ответите?"
timeLimit: 20

choices:
  A)
    uz: "To'g'ri savol. 2 yil bepul servis kiradi — bu vaqtda ehtiyot qismlar biz tomondan. Keyin ham Toshkentda rasmiy dillerlar bor."
    ru: "Правильный вопрос. 2 года бесплатного сервиса — запчасти за наш счёт. Потом — официальные дилеры в Ташкенте."
    effects: [{ type: "add_score", amount: 15, dimension: "persuasion" }, { type: "add_score", amount: 5, dimension: "expertise" }]
    flags: [{ type: "set_flag", flag: "honest_answer" }]
    nextNodeId: "d5_sardor_reacts_service"

  B)
    uz: "Yo'q, bu eski ma'lumot. Hozir barcha ehtiyot qismlar omborda bor."
    ru: "Нет, это старая информация. Сейчас все запчасти есть на складе."
    effects: [{ type: "add_score", amount: 5, dimension: "persuasion" }, { type: "add_score", amount: -5, dimension: "rapport" }]
    flags: [{ type: "set_flag", flag: "dismissed_concern" }]
    nextNodeId: "d5_sardor_reacts_denial"

  C)
    uz: "Tushunaman, bu xavotir. Lekin Chevrolet 5 yillik kafolat beradi — bu ishonchning belgisi."
    ru: "Понимаю, это беспокойство. Но Chevrolet даёт 5 лет гарантии — это знак надёжности."
    effects: [{ type: "add_score", amount: 10, dimension: "persuasion" }, { type: "add_score", amount: 5, dimension: "empathy" }]
    nextNodeId: "d5_sardor_reacts_guarantee"

expireNodeId: "d5_objection_expired"
```

---

**d5_sardor_reacts_service** `dialogue` _(реакция на 2 года сервиса)_
```
speaker: "sardor"
emotion: "neutral"
uz: "2 yillik servis — bu konkret javob. Va rasmiy dillerlar ham bor. Yaxshi, ishonchli eshitildi."
ru: "2 года сервиса — это конкретный ответ. И официальные дилеры есть. Хорошо, звучит надёжно."
nextNodeId: "d5_closing"
```

---

**d5_sardor_reacts_denial** `dialogue` _(реакция на отрицание)_
```
speaker: "sardor"
emotion: "testing"
uz: "Shunchaki 'yo'q' deyish — bu argument emas. Konkret dalillar kerak."
ru: "Просто сказать 'нет' — это не аргумент. Нужны конкретные доказательства."
nextNodeId: "d5_closing"
```

---

**d5_sardor_reacts_guarantee** `dialogue` _(реакция на гарантию)_
```
speaker: "sardor"
emotion: "neutral"
uz: "5 yillik kafolat — bu jiddiy. Demak, kompaniya o'z mashinasiga ishonadi. Qabul qilaman."
ru: "5 лет гарантии — это серьёзно. Значит, компания уверена в своих машинах. Принимается."
nextNodeId: "d5_closing"
```

---

**d5_sardor_reacts_timeout** `dialogue` _(реакция на таймаут)_
```
speaker: "sardor"
emotion: "testing"
uz: "Javob yo'q? O'z mahsulotingizga ishonmaysizmi? Bu yaxshi belgi emas."
ru: "Нет ответа? Не уверены в своём продукте? Это не лучший знак."
nextNodeId: "d5_closing"
```

---

**d5_objection_expired** `score`
```
effects: [{ type: "add_score", amount: -10, dimension: "timing" }, { type: "lose_life" }]
narrator:
  uz: "Javob bera olmadingiz. Sardor shubha bilan qaradi."
  ru: "Вы не нашли ответа. Сардор посмотрел с сомнением."
nextNodeId: "d5_sardor_reacts_timeout"
```

---

**d5_closing** `choice`
```
prompt:
  uz: "Sardor ketmoqchi. Qanday yakunlaysiz?"
  ru: "Сардор собирается уходить. Как завершите?"
timeLimit: 5

choices:
  A)
    uz: "Test-drayvga chiqamizmi? 15 daqiqa — va siz farqni his qilasiz."
    ru: "Поедем на тест-драйв? 15 минут — и вы почувствуете разницу."
    effects: [{ type: "add_score", amount: 12, dimension: "timing" }, { type: "add_score", amount: 8, dimension: "persuasion" }]
    flags: [{ type: "set_flag", flag: "offered_test_drive_d5" }]
    nextNodeId: "d5_reveal"

  B)
    uz: "Ma'lumotlarimni qoldiraman. O'ylab ko'ring va qo'ng'iroq qiling."
    ru: "Оставлю контакты. Подумайте и звоните."
    effects: [{ type: "add_score", amount: 5, dimension: "rapport" }]
    nextNodeId: "d5_reveal"

  C)
    uz: "Bugun qaror qilsangiz, maxsus chegirma bo'ladi."
    ru: "Если решите сегодня, будет специальная скидка."
    effects: [{ type: "add_score", amount: 3, dimension: "timing" }, { type: "add_score", amount: -5, dimension: "empathy" }]
    flags: [{ type: "set_flag", flag: "pressure_close_d5" }]
    nextNodeId: "d5_reveal"

expireNodeId: "d5_closing_expired"
```

---

**d5_closing_expired** `score`
```
effects: [{ type: "add_score", amount: -5, dimension: "timing" }]
narrator:
  uz: "Sardor o'zi chiqib ketdi. Siz yakunlay olmadingiz."
  ru: "Сардор ушёл сам. Вы не смогли завершить."
nextNodeId: "d5_reveal"
```

---

**d5_reveal** `dialogue`
```
speaker: "sardor"
emotion: "revealing"
uz: "Aslida, men sizni tekshirib keldim. Men bosh ofisdan — maxfiy xaridor."
ru: "На самом деле, я пришёл проверить вас. Я из головного офиса — тайный покупатель."
nextNodeId: "d5_final_check"
```

---

**d5_final_check** `condition_branch`
```
branches:
  - condition: { type: "and", conditions: [
      { type: "score_gte", value: 63 },
      { type: "flag", flag: "patient_approach" },
      { type: "flag", flag: "deep_discovery" },
      { type: "flag", flag: "honest_answer" },
      { type: "or", conditions: [
        { type: "flag", flag: "d1_success" },
        { type: "flag", flag: "d2_success" }
      ]}
    ]}
    nextNodeId: "d5_end_grandmaster"
  - condition: { type: "score_gte", value: 56 }
    nextNodeId: "d5_end_success"
  - condition: { type: "score_gte", value: 30 }
    nextNodeId: "d5_end_partial"
fallbackNodeId: "d5_end_fail"
```

---

**d5_end_grandmaster** `end`
```
outcome: "hidden_ending"
effects: [
  { type: "add_xp", amount: 500 },
  { type: "unlock_achievement", id: "grandmaster" },
  { type: "gain_life" },
  { type: "set_flag", flag: "d5_grandmaster" }
]
dialogue:
  speaker: "sardor"
  emotion: "impressed"
  uz: "Ajoyib. 5 kunda siz odatda 3 oy vaqt oladigan narsalarni o'rgandingiz. Bu — iste'dod. Lekin bilasizmi, bu faqat boshlanishi. Haqiqiy professional bo'lish uchun tizim kerak — Sales Up ana shunday tizim."
  ru: "Отлично. За 5 дней вы освоили то, на что обычно уходит 3 месяца. Это — талант. Но знаете, это только начало. Чтобы стать настоящим профессионалом — нужна система. Sales Up — это такая система."
cta_screen:
  type: "full_screen_cta"
  uz: "Siz potentsialini ko'rsatdingiz. Endi uni pul topishga aylantiring."
  ru: "Вы показали потенциал. Теперь превратите его в доход."
  button_uz: "Sales Up haqida bilish →"
  button_ru: "Узнать о Sales Up →"
  subtext_uz: "3 oylik offline kurs | Toshkent | Keyingi guruh: [sana]"
  subtext_ru: "3-месячный офлайн курс | Ташкент | Следующий поток: [дата]"
```

---

**d5_end_success** `end`
```
outcome: "success"
effects: [
  { type: "add_xp", amount: 160 },
  { type: "unlock_achievement", id: "final_test_passed" },
  { type: "set_flag", flag: "d5_success" }
]
dialogue:
  speaker: "sardor"
  emotion: "satisfied"
  uz: "Yaxshi natija. Siz intuitsiya bilan ishlayapsiz — bu yaxshi. Lekin top sotuvchilar intuitsiya + tizim bilan ishlaydi. O'sha tizimni o'rganmoqchimisiz?"
  ru: "Хороший результат. Вы работаете на интуиции — это хорошо. Но топовые продавцы работают на интуиции + системе. Хотите освоить ту систему?"
cta_screen:
  type: "soft_cta"
  uz: "Intuitsiyani tizimga aylantiring — Sales Up bilan."
  ru: "Превратите интуицию в систему — с Sales Up."
  button_uz: "Ko'proq bilish →"
  button_ru: "Узнать больше →"
  subtext_uz: "3 oylik offline kurs | Toshkent"
  subtext_ru: "3-месячный офлайн курс | Ташкент"
```

---

**d5_end_partial** `end`
```
outcome: "partial"
effects: [
  { type: "add_xp", amount: 90 },
  { type: "set_flag", flag: "d5_partial" }
]
dialogue:
  speaker: "sardor"
  emotion: "neutral"
  uz: "Yomon emas. Siz potensialingizni ko'rsatdingiz, lekin hali to'liq ochilmadi. Tajribali mentor va tizimli o'qish — ana shu ikkita narsani qo'shing, natija o'zgaradi."
  ru: "Неплохо. Вы показали потенциал, но он ещё не раскрыт полностью. Опытный наставник и системное обучение — добавьте эти два компонента, результат изменится."
cta_screen:
  type: "motivational_cta"
  uz: "Potensialingiz bor. Uni ochish uchun tizim kerak."
  ru: "Потенциал есть. Нужна система чтобы его раскрыть."
  button_uz: "Sales Up — tizimli o'rganish →"
  button_ru: "Sales Up — системное обучение →"
  subtext_uz: "3 oylik offline kurs | Toshkent"
  subtext_ru: "3-месячный офлайн курс | Ташкент"
```

---

**d5_end_fail** `end`
```
outcome: "failure"
effects: [
  { type: "add_xp", amount: 50 },
  { type: "lose_life" },
  { type: "set_flag", flag: "d5_fail" }
]
dialogue:
  speaker: "sardor"
  emotion: "disappointed"
  uz: "Natija past. Lekin bu yerda bo'lganingiz allaqachon farq qiladi — ko'pchilik umuman urinib ko'rmaydi. Siz urinib ko'rdingiz, demak o'rganishga tayyor. O'sha tayyorlikni to'g'ri yo'naltirsangiz bo'ladi."
  ru: "Результат слабый. Но то, что вы здесь — уже отличает вас от большинства, которые вообще не пробуют. Вы попробовали — значит, готовы учиться. Эту готовность нужно направить правильно."
cta_screen:
  type: "empathy_cta"
  uz: "Hamma birinchi bor xato qiladi. Muhimi — qanday o'rganish."
  ru: "Все ошибаются в первый раз. Важно — как учиться дальше."
  button_uz: "Sales Up bilan tizimli boshlash →"
  button_ru: "Начать системно с Sales Up →"
  subtext_uz: "3 oylik offline kurs | Toshkent | Mentor bilan"
  subtext_ru: "3-месячный офлайн курс | Ташкент | С наставником"
```

### Достижения Day 5
- `final_test_passed` — Пройти Day 5 (success)
- `grandmaster` — Скрытая концовка: получить должность менеджера (500 XP)

---

## Сводная таблица всех достижений сценария

| ID | Название (uz) | Название (ru) | Условие | XP | Тип |
|----|--------------|--------------|---------|-----|-----|
| `first_contact` | Birinchi aloqa | Первый контакт | Пройти Day 1 (success) | 50 | Progress |
| `respect_earns_referrals` | Hurmat — tavsiya | Уважение = рекомендации | Скрытая концовка Day 2 | 150 | Hidden |
| `love_sells` | Sevgi sotadi | Любовь продаёт | Скрытая концовка Day 3 | 180 | Hidden |
| `corporate_king` | Korporativ qirol | Корпоративный король | Скрытая концовка Day 4 | 200 | Hidden |
| `final_test_passed` | Sinov o'tildi | Испытание пройдено | Пройти Day 5 (success) | 100 | Progress |
| `grandmaster` | Grandmaster | Грандмастер | Скрытая концовка Day 5 | 500 | Hidden |
| `full_week` | To'liq hafta | Полная неделя | Пройти все 5 дней | 200 | Progress |
| `car_master` | Avto ustasi | Мастер авто | A+ на всех днях автосалона | 500 | Skill |

---

## Флаги и кросс-дневные связи

| Флаг | Где ставится | Где используется | Эффект |
|------|-------------|-----------------|--------|
| `d1_success` | Day 1 success | Day 2 callback, Day 5 grandmaster check | +5 бонус в Day 2, условие для Grandmaster |
| `d2_success` | Day 2 success | Day 5 grandmaster check | Условие для Grandmaster |
| `d2_hidden` | Day 2 hidden ending | — | Статистика |
| `d3_hidden` | Day 3 hidden ending | — | Статистика |
| `d4_hidden` | Day 4 hidden ending | — | Статистика |
| `patient_approach` | Day 5 approach A | Day 5 grandmaster check | Условие для Grandmaster |
| `deep_discovery` | Day 5 needs A | Day 5 grandmaster check | Условие для Grandmaster |
| `honest_answer` | Day 5 objection A | Day 5 grandmaster check | Условие для Grandmaster |
| `judged_by_appearance` | Day 5 approach C | — | Антипаттерн, снижает empathy |

---

## Верификация

### Проходимость путей

| День | Мин нод до конца | Макс нод до конца | Тупики |
|------|-----------------|------------------|--------|
| 1 | 7 (intro→...→end) | 8 (с expired) | 0 |
| 2 | 8 (intro→...→end) | 9 (с callback + expired) | 0 |
| 3 | 8 (intro→...→end) | 10 (с anniversary hint) | 0 |
| 4 | 8 (intro→...→end) | 9 (с expired) | 0 |
| 5 | 9 (intro→...→end) | 11 (с tip + expired) | 0 |

### Баланс очков

| День | Target | S-порог (90%) | Макс путь | Мин путь | Optimal (A-ранг) |
|------|--------|-------------|-----------|----------|-----------------|
| 1 | 30 | 27 | 44 | -3 | 27-35 |
| 2 | 40 | 36 | 57+5 | -8 | 36-45 |
| 3 | 50 | 45 | 65 | -5 | 40-50 |
| 4 | 60 | 54 | 76 | -8 | 48-58 |
| 5 | 70 | 63 | 83 | -23 | 55-65 |

### Хронометраж (расчёт)
- Средняя нода: ~8 секунд (чтение + решение)
- День 1: 10 нод × 8с = ~80с ≈ 1.3 мин
- День 2: 11 нод × 8с = ~88с ≈ 1.5 мин
- День 3: 12 нод × 8с = ~96с ≈ 1.6 мин
- День 4: 12 нод × 8с = ~96с ≈ 1.6 мин
- День 5: 12 нод × 8с = ~96с ≈ 1.6 мин
- **Итого: ~7.6 мин** ✅ (в рамках 7-10 мин)

---

## Воронка: связи с курсом Sales Up

### Логика прогрева по дням

| День | Что показывает | Послание |
|------|---------------|---------|
| 1 | Основы — приветствие, слушание | "Это интереснее чем кажется" |
| 2 | Возражения — сложно, но есть техника | "Есть система. Я её не знаю полностью." |
| 3 | Несколько ЛПР — ещё сложнее | "Это реальная работа с реальными деньгами" |
| 4 | B2B — другой уровень, другие деньги | "Профессионалы зарабатывают на этом серьёзно" |
| 5 | Всё вместе — Сардор раскрывает систему | "Хочу научиться этому полностью" |

### Моменты касания с курсом (touchpoints)

| Момент | Тип | Интенсивность |
|--------|-----|--------------|
| Рустам в брифинге называет технику | Мягкий | Низкая |
| Дильноза упоминает заработок | Социальное доказательство | Средняя |
| `course_hint` под итогами дня | Информационный | Средняя |
| Day 5 — Рустам суммирует 4 техники | Прямой | Высокая |
| Day 5 финал — CTA экран | Прямой | Максимальная |

### CTA экраны по результатам

| Результат | Тон CTA | Сообщение |
|-----------|---------|-----------|
| Grandmaster | Признание + вызов | "Покажи этот результат на реальной работе" |
| Success | Подтверждение + рост | "Интуиция есть — добавь систему" |
| Partial | Мотивация | "Потенциал есть — нужно направление" |
| Fail | Эмпатия | "Все начинают с нуля. Правильный старт — всё" |

---

## Заблокированные сценарии (unlock через курс)

После прохождения автосалона игрок видит экран с 4 сценариями:

```
┌────────────────────────────────────────────────────────┐
│                  ВЫБЕРИТЕ СФЕРУ                        │
│                                                        │
│  ✅ Chevrolet          🔒 Недвижимость                 │
│     Автосалон               Открывается после курса   │
│                                                        │
│  🔒 Электроника        🔒 Мебель/Интерьер              │
│     Открывается после курса  Открывается после курса  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Текст на заблокированных карточках

**uz:**
> 🔒 Bu stsenariy Sales Up kursini tugatganlar uchun ochiladi.
> Kursda o'rgangan texnikalarni yangi sohada sinab ko'ring.

**ru:**
> 🔒 Этот сценарий открывается для выпускников курса Sales Up.
> Примените техники из курса в новой сфере.

### Почему это работает

1. Игрок видит — есть ещё 3 сферы (недвижимость, электроника, мебель)
2. Хочет пройти их → мотивация пройти курс
3. Курс = не просто обучение, а ключ к новому контенту
4. После курса возвращается в игру — лояльность к школе
