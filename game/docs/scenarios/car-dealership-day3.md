# Den' 3: VIP va sirli mijoz / VIP и тайный покупатель

**Target Score: 60**
**Root Node: d3_day_intro**

---

# ═══ PART A: VIP CLIENT ABDULLAEV ═══

---

### [d3_day_intro] — day_intro
**Background:** bg_showroom

> **Title UZ:** VIP va sirli mijoz
> **Title RU:** VIP и тайный покупатель

→ next: d3_intro

---

### [d3_intro] Rustam (serious) — dialogue
**Background:** bg_manager_office

**UZ:** Bugun boshqa daraja. Vaqtni ham, xizmatni ham hisoblab gapiradigan odam keladi.
**RU:** Сегодня другой уровень. Придёт человек, который сразу считает и время, и сервис, и вашу собранность.

→ next: d3_intro2

---

### [d3_intro2] Rustam (serious) — dialogue
**Background:** bg_manager_office

**UZ:** Abdullaev hamma narsani birinchi daqiqada baholaydi. Tayyorlanmay chiqsangiz, ikkinchi imkoniyat bo'lmaydi.
**RU:** Абдуллаев оценивает всё в первую минуту. Выйдете неподготовленным — второго шанса не будет.

→ next: d3_preparation

---

### [d3_preparation] TANLOV / ВЫБОР — choice (multiSelect: 2 of 3)

> **Prompt UZ:** Tayyorgarlik: 2 ta tanlang
> **Prompt RU:** Подготовка: выберите 2

**A) d3_prep_a**
UZ: Uning kompaniyasini internetdan o'rganish
RU: Изучить его компанию в интернете
→ leads to: d3_dilnoza_intel
Effects: +8 expertise, set_flag: researched_company

**B) d3_prep_b**
UZ: Rustamdan VIP protokolini so'rash
RU: Спросить у Рустама о VIP-протоколе
→ leads to: d3_dilnoza_intel
Effects: +8 rapport, set_flag: knows_vip_protocol

**C) d3_prep_c**
UZ: Moliya bo'limidan so'rash: kompaniyalarga qancha chegirma bersa bo'ladi?
RU: Спросить у финансистов: какую скидку можно дать компании?
→ leads to: d3_dilnoza_intel
Effects: +8 opportunity, set_flag: has_discount_authority

---

### [d3_dilnoza_intel] — condition_branch
- **If** flag: researched_company → d3_dilnoza_cobalt_tip
- **Fallback** → d3_abdullaev_arrives

---

### [d3_dilnoza_cobalt_tip] Dilnoza (explaining) — dialogue
**Background:** bg_manager_office
**Characters:** Dilnoza (explaining, center)

**UZ:** Bitta narsa topdim — o'tgan yili 12 ta Cobalt olgan ekan. Park yangilashni rejalashtirgan bo'lishi mumkin.
**RU:** Кое-что нашла — в прошлом году они купили 12 Cobalt. Возможно, планируют обновление парка.

→ next: d3_abdullaev_arrives

---

### [d3_abdullaev_arrives] Narrator — dialogue
**Background:** bg_showroom_entrance_exterior

**UZ:** Qora mashina keldi. Haydovchi eshikni ochdi. Kostyumli odam tushib, to'g'ri salonga kirib keldi.
**RU:** Подъехала чёрная машина. Водитель открыл дверь. Мужчина в костюме вышел и прошёл прямо в салон.

→ next: d3_abdullaev_enters

---

### [d3_abdullaev_enters] Abdullaev (impatient) — dialogue
**Background:** bg_showroom_entrance_exterior

**UZ:** Salom. Vaqtim qisqa. Uchta Malibu ish uchun, bitta Tahoe uy uchun. Kerakli gapni ayting.
**RU:** Здравствуйте. Времени мало. Три Malibu для работы, один Tahoe для дома. Говорите только по делу.

→ next: d3_greeting

---

### [d3_greeting] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Qanday kutib olasiz?
> **Prompt RU:** Как встретите?

**A) d3_greeting_a** *(Condition: flag knows_vip_protocol)*
UZ: Abdullaev janoblari, tayyorgarlik ko'rdik. Keling, tinch joyda qisqa va aniq ko'rib chiqamiz.
RU: Господин Абдуллаев, мы подготовились. Давайте в спокойном месте коротко и по делу всё соберём.
→ leads to: d3_walk_to_vip
Effects: +15 rapport, +5 timing, set_flag: vip_greeting

**B) d3_greeting_b**
UZ: Xush kelibsiz! Malibu ko'rsatay.
RU: Добро пожаловать! Давайте покажу Malibu.
→ leads to: d3_abdullaev_reacts_direct
Effects: +8 timing

**C) d3_greeting_c** *(Condition: flag researched_company)*
UZ: Kompaniyangizning park bo'yicha tajribasini ko'rdim. Shunga qarab ikki variant tayyorlab qo'ydim.
RU: Посмотрел, как ваша компания уже покупала парк раньше. Под это подготовил два понятных варианта.
→ leads to: d3_abdullaev_reacts_research
Effects: +12 expertise, +5 rapport, set_flag: showed_research

---

## ── BRANCH: VIP Lounge ──

### [d3_walk_to_vip] Narrator — dialogue
**Background:** bg_vip_lounge_hallway

**UZ:** Abdullaev oldinga yurdi. Siz yonida — tinch, ortiqcha gapirsiz.
**RU:** Абдуллаев пошёл вперёд. Вы рядом — спокойно, без лишних слов.

→ next: d3_vip_arrival

---

### [d3_vip_arrival] Abdullaev (impressed) — dialogue
**Background:** bg_vip_lounge

**UZ:** Yaxshi. Choy, keyin ish. 20 daqiqangiz bor.
**RU:** Хорошо. Чай, потом дело. У вас 20 минут.

→ next: d3_fleet

---

## ── BRANCH: Direct Reaction ──

### [d3_abdullaev_reacts_direct] Abdullaev (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Bo'pti. Shu yerda ko'rsating. Lekin qisqa gapiring.
**RU:** Ладно. Показывайте здесь. Только коротко.

→ next: d3_fleet

---

## ── BRANCH: Research Reaction ──

### [d3_abdullaev_reacts_research] Abdullaev (impressed) — dialogue
**Background:** bg_showroom

**UZ:** O'rganibsiz demak. Yaxshi. Tayyor narsangiz bo'lsa — ko'rsating.
**RU:** Значит, изучили. Хорошо. Если есть что-то готовое — показывайте.

→ next: d3_fleet

---

## ── CONVERGE: Fleet Presentation ──

### [d3_fleet] TANLOV / ВЫБОР — choice
**Timer:** 10 seconds | On expire → d3_fleet_expired

> **Prompt UZ:** Uchta Malibu bo'yicha taklifni qanday yig'asiz?
> **Prompt RU:** Как соберёте предложение по трём Malibu?

**A) d3_fleet_a**
UZ: Mashinalarni yalang'och bermaymiz: servis, kuzatuv va korporativ shartni bitta paketga yig'amiz.
RU: Мы не отдаём машины "голыми": собираем пакет сразу с сервисом, сопровождением и корпоративными условиями.
→ leads to: d3_wife_car
Effects: +15 persuasion, +8 expertise, set_flag: fleet_package

**B) d3_fleet_b**
UZ: Malibu — biznes-klassda eng ishonchli. Ranglar qaysi yoqadi?
RU: Malibu — самый надёжный в бизнес-классе. Какие цвета нравятся?
→ leads to: d3_wife_car
Effects: +10 expertise, +5 timing

**C) d3_fleet_c** *(Condition: flag has_discount_authority)*
UZ: Narxni ham shu yerda aniq ko'rsataman, keyin ichida nimasi borligini birma-bir ochib beraman.
RU: Сразу покажу честную цифру по цене, а потом коротко разложу, что в неё уже входит.
→ leads to: d3_wife_car
Effects: +12 persuasion, +10 opportunity, set_flag: gave_fleet_price

---

### [d3_fleet_expired] — score (timer expired)
**Effects:** -8 timing

**Narrator UZ:** Abdullaev soatiga qaradi. Bir so'z ham aytmadi.
**Narrator RU:** Абдуллаев посмотрел на часы. Не сказал ни слова.

→ next: d3_wife_car

---

### [d3_wife_car] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Tahoe bo'yicha nimani ta'kidlaysiz?
> **Prompt RU:** Что подчеркнёте по Tahoe?

**A) d3_wife_a**
UZ: Ayolingizga qulaylik tomonidan yig'amiz: saloni, o'rindig'i, tovushi, mayda detalgacha.
RU: Для супруги соберём машину с упором на комфорт: посадка, салон, звук и все мелочи, которые чувствуются каждый день.
→ leads to: d3_abd_check
Effects: +12 empathy, +5 expertise, set_flag: personalized_tahoe

**B) d3_wife_b**
UZ: Quvvat: 5.3L V8, 355 ot kuchi. Yo'lda shoh.
RU: Мощность: 5.3L V8, 355 л.с. Король дороги.
→ leads to: d3_abd_check
Effects: +8 expertise

**C) d3_wife_c**
UZ: Xohlasangiz, buni to'rttasini alohida emas, bitta umumiy yechim sifatida yopamiz.
RU: Если вам удобно, можем закрыть всё это не четырьмя разрозненными машинами, а одним цельным решением.
→ leads to: d3_abd_check
Effects: +10 opportunity, +8 persuasion, set_flag: bundled_deal

---

## ── Abdullaev Result Check ──

### [d3_abd_check] — condition_branch
- **If** flag: fleet_package AND flag: bundled_deal AND score >= 55 → d3_abd_hidden
- **If** score >= 48 → d3_abd_success
- **If** score >= 28 → d3_abd_partial
- **Fallback** → d3_abd_fail

---

### [d3_abd_hidden] Abdullaev (impressed) — dialogue
**Background:** bg_vip_lounge
**Effects:** +200 XP, gain_life, unlock_achievement: corporate_king, set_flag: d3_abd_hidden

**UZ:** Taklifingiz menga ma'qul. Yillik shartnomani imzolasak bo'ladi.
**RU:** Ваше предложение мне подходит. Можем подписать годовой контракт.

→ next: d3_transition

---

### [d3_abd_success] Rustam (proud) — dialogue
**Background:** bg_showroom
**Effects:** +140 XP

**UZ:** Yaxshi ushladingiz. VIP bilan gaplashganda ortiqcha gap emas, tayyorgarlik ishlaydi.
**RU:** Неплохо. С такими клиентами работает не красноречие, а подготовка.

→ next: d3_transition

---

### [d3_abd_partial] Rustam (serious) — dialogue
**Background:** bg_showroom
**Effects:** +85 XP

**UZ:** U kutgan darajada emas edi. Bunday odamga tayyorlanmay chiqish — imkoniyatni o'tkazish.
**RU:** Не дотянули до его уровня. Выходить к такому клиенту без подготовки — упускать возможность.

→ next: d3_transition

---

### [d3_abd_fail] Rustam (disappointed) — dialogue
**Background:** bg_showroom
**Effects:** +45 XP, lose_life

**UZ:** U ketdi. Hech narsa demadi. Shunchaki ketdi. Bunday odam ikkinchi marta kelmaydi.
**RU:** Он ушёл. Ничего не сказал. Просто встал и ушёл. Такие люди второй раз не приходят.

→ next: d3_transition

---

# ═══ MID-DAY TRANSITION ═══

---

### [d3_transition] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Tushdan keyin. Abdullaevning mashinasi ketdi. Salon tinchidi. Lekin kun hali tugamagan.
**RU:** После обеда. Машина Абдуллаева уехала. В салоне стало тихо. Но день ещё не закончен.

→ next: d3_rustam_mid

---

### [d3_rustam_mid] Rustam (serious) — dialogue
**Background:** bg_showroom

**UZ:** Bo'sh turmang. Bugun yana kimdir kirib kelishi mumkin.
**RU:** Не расслабляйтесь. Сегодня может зайти ещё кто-нибудь.

→ next: d3_dilnoza_check

---

### [d3_dilnoza_check] — condition_branch
- **If** flag: d1_success AND flag: d2_success → d3_dilnoza_tip
- **Fallback** → d3_sardor_enters

---

### [d3_dilnoza_tip] Dilnoza (helpful) — dialogue
**Background:** bg_showroom
**Effects:** set_flag: got_dilnoza_tip

**UZ:** Shu kunlarda yaxshi ishladingiz. Bitta gap: oddiy ko'ringan odam ko'pincha eng muhimi bo'ladi.
**RU:** Вы хорошо работали эти дни. Одно: самый обычный на вид человек часто оказывается самым важным.

→ next: d3_sardor_enters

---

# ═══ PART B: MYSTERY SHOPPER SARDOR ═══

---

### [d3_sardor_enters] Narrator — dialogue
**Background:** bg_showroom_entrance
**Characters:** Sardor (observing, center)

**UZ:** Ichkariga oddiy kiyingan odam kirdi. Hech narsaga shoshmaydi. Faqat kuzatyapti.
**RU:** В зал зашёл просто одетый мужчина. Ни к чему не тянется, никого не зовёт. Просто смотрит.

→ next: d3_sardor_approach

---

### [d3_sardor_approach] TANLOV / ВЫБОР — choice
**Timer:** 10 seconds | On expire → d3_sardor_approach_expired

> **Prompt UZ:** Qanday murojaat qilasiz?
> **Prompt RU:** Как подойдёте?

**A) d3_sardor_approach_a**
UZ: Assalomu alaykum. Bemalol qarang. Kerak bo'lsa, yoningizdaman.
RU: Здравствуйте. Спокойно смотрите. Если понадоблюсь, я рядом.
→ leads to: d3_needs
Effects: +12 empathy, +8 rapport, set_flag: patient_approach

**B) d3_sardor_approach_b**
UZ: Salom! Qaysi model qiziqtirdi?
RU: Здравствуйте! Какая модель заинтересовала?
→ leads to: d3_needs
Effects: +8 timing, +5 rapport

**C) d3_sardor_approach_c**
UZ: Cobalt ko'ryapsizmi? Bizda eng ko'p shuni olishadi.
RU: Cobalt смотрите? Его у нас чаще всего и берут.
→ leads to: d3_needs
Effects: +5 expertise, -5 empathy, set_flag: judged_by_appearance

---

### [d3_sardor_approach_expired] — score (timer expired)
**Effects:** -8 timing, -5 rapport

**Narrator UZ:** Siz yaqinlashmadingiz. U o'zi atrofga qarab yurdi.
**Narrator RU:** Вы не подошли. Он сам бродил по залу.

→ next: d3_needs

---

### [d3_needs] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Ehtiyojlarini qanday bilasiz?
> **Prompt RU:** Как выясните потребности?

**A) d3_needs_a**
UZ: Oilangiz haqida ayting — nechta bola, qayerga haydaysiz, nima muhim?
RU: Расскажите о семье — сколько детей, куда ездите, что важно?
→ leads to: d3_objection
Effects: +15 discovery, +8 rapport, set_flag: deep_discovery

**B) d3_needs_b**
UZ: Byudjetingiz qancha?
RU: Какой у вас бюджет?
→ leads to: d3_objection
Effects: +5 discovery, +3 timing

**C) d3_needs_c**
UZ: Oila uchun — Equinox yoki Tracker. Ko'rsatay.
RU: Для семьи — Equinox или Tracker. Давайте покажу.
→ leads to: d3_objection
Effects: +5 expertise, -3 discovery

---

### [d3_objection] TANLOV / ВЫБОР — choice
**Timer:** 10 seconds | On expire → d3_objection_expired

> **Prompt UZ:** Sardor: "Servis qimmat deyishadi. Ehtiyot qismlar ham muammo."
> **Prompt RU:** Сардор: "Говорят, сервис дорогой. И с запчастями проблемы."

**A) d3_objection_a**
UZ: Bu savolni ko'p berishadi. Yashirmay aytsam, rasmiy servis bilan ishlasangiz bosh og'riq ancha kamayadi.
RU: Этот вопрос часто задают. Если честно, при нормальном официальном сервисе там намного меньше проблем, чем люди себе представляют.
→ leads to: d3_sardor_closing
Effects: +15 persuasion, +5 expertise, set_flag: honest_answer

**B) d3_objection_b**
UZ: Yo'q, unday muammo yo'q endi.
RU: Нет, сейчас такой проблемы уже нет.
→ leads to: d3_sardor_closing
Effects: +5 persuasion, -5 rapport

**C) d3_objection_c**
UZ: Tushunaman. Chevrolet 5 yillik kafolat beradi — bu ishonch belgisi.
RU: Понимаю. Chevrolet даёт 5-летнюю гарантию — это знак уверенности.
→ leads to: d3_sardor_closing
Effects: +10 persuasion, +5 empathy

---

### [d3_objection_expired] — score (timer expired)
**Effects:** -5 timing, -5 persuasion

**Narrator UZ:** Javob bermadingiz. Sardor boshini chayqadi.
**Narrator RU:** Вы не ответили. Сардор покачал головой.

→ next: d3_sardor_closing

---

### [d3_sardor_closing] TANLOV / ВЫБОР — choice
**Timer:** 5 seconds | On expire → d3_sardor_closing_expired

> **Prompt UZ:** Qanday yakunlaysiz?
> **Prompt RU:** Как завершите?

**A) d3_closing_a**
UZ: Test-drayv? 15 daqiqa va farqni his qilasiz.
RU: Тест-драйв? 15 минут — и почувствуете разницу.
→ leads to: d3_reveal
Effects: +12 timing, +8 persuasion, set_flag: offered_test_drive

**B) d3_closing_b**
UZ: Kontaktlarimni qoldiraman. O'ylang va qo'ng'iroq qiling.
RU: Оставлю свои контакты. Подумайте и позвоните.
→ leads to: d3_reveal
Effects: +5 rapport

**C) d3_closing_c**
UZ: Bugun qaror qilsangiz, maxsus chegirma.
RU: Если решите сегодня, специальная скидка.
→ leads to: d3_reveal
Effects: +3 timing, -5 empathy, set_flag: pressure_close

---

### [d3_sardor_closing_expired] — score (timer expired)
**Effects:** -5 timing, lose_life

**Narrator UZ:** Vaqt o'tdi. Siz yakunlay olmadingiz.
**Narrator RU:** Время вышло. Вы не смогли завершить.

→ next: d3_reveal

---

# ═══ THE REVEAL ═══

---

### [d3_reveal] Sardor (revealing) — dialogue
**Background:** bg_showroom

**UZ:** Aslida men oddiy xaridor emasman. Sizning ishlashingizni ko'rish uchun yuborilgandim.
**RU:** На самом деле я пришёл не как обычный клиент. Меня отправили посмотреть, как вы работаете.

→ next: d3_team_reaction

---

### [d3_team_reaction] Rustam (friendly) — dialogue
**Background:** bg_showroom
**Characters:** Rustam (friendly, left), Sardor (revealing, center), Dilnoza (neutral, right)

**UZ:** Sardor aka... Siz edingiz demak. Xo'sh, yangi hamkasbimiz qanday ishladi?
**RU:** Сардор... Вот оно что. Ну, как вам наш новый коллега?

→ next: d3_grandmaster_check

---

### [d3_grandmaster_check] — condition_branch
- **If** score >= 63 AND flag: patient_approach AND flag: deep_discovery AND flag: honest_answer AND (flag: d1_success OR flag: d2_success) → d3_end_grandmaster
- **If** score >= 56 → d3_end_success
- **If** score >= 30 → d3_end_partial
- **Fallback** → d3_end_fail

→ **Yakunlar: [car-dealership-ending.md](car-dealership-ending.md)**
