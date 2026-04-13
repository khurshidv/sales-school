# Day 1: Birinchi kun / Первый день

**Target Score: 40**
**Root Node: d1_day_intro**

---

### [d1_day_intro] — day_intro
**Background:** bg_showroom_entrance_exterior

> **Title UZ:** 1-kun: Yangi boshlanish
> **Title RU:** День 1: Новое начало
> **Subtitle UZ:** Toshkent, Chevrolet saloni
> **Subtitle RU:** Ташкент, салон Chevrolet

→ next: d1_morning

---

### [d1_morning] Narrator — dialogue
**Background:** bg_showroom_entrance_exterior

**UZ:** Tong, salon hali sokin. Chiroqlar endigina yoqilgan, havoda tozalik hidi ufurib turibdi. Bugun sizning "Chevrolet" salonidagi birinchi ish kuningiz. Ichingizda sezilarli hayajon bor.
**RU:** Утро, салон ещё тихий. Свет только включили, в воздухе запах после уборки. Сегодня ваш первый рабочий день в салоне Chevrolet. Внутри заметное волнение.

→ next: d1_meet_rustam

---

### [d1_meet_rustam] Rustam (friendly) — dialogue
**Background:** bg_manager_office
**Characters:** Rustam (friendly, center)

**UZ:** Salom! Ismim Rustam, bosh menejerman. Bizning jamoaga xush kelibsiz! Mijozlar bilan gaplashganda avval ularni yaxshilab eshiting, keyin esa gapiring.
**RU:** Привет! Меня зовут Рустам, я главный менеджер. Добро пожаловать в нашу команду! Помните, когда вы разговариваете с клиентами, сначала внимательно их слушайте, а затем говорите.

→ next: d1_rustam_tip

---

### [d1_rustam_tip] Rustam (serious) — dialogue
**Characters:** Rustam (serious, center)

**UZ:** Bugun bir juftlik kelishi kerak. Ikkisini ham xoxishlarini yaxshilab tinglang. Biri jim tursa ham, qarorni baribir ikkalasi qabul qiladi.
**RU:** Сегодня должна приехать пара. Внимательно выслушайте пожелания обоих. Даже если один из них будет молчать, решение всё равно примут оба.

→ next: d1_exit_office_action

---

### [d1_exit_office_action] — choice (action button)

**A) exit_office**
UZ: Kabinetdan chiqish
RU: Выйти из кабинета
→ leads to: d1_exit_office_narr

---

### [d1_exit_office_narr] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Siz Rustamning kabinetidan chiqib, salon zaliga o'tdingiz. Mashinalar qatorlashib turibdi. Bir chetda notanish ayol Equinox yonida turib, nimadir o'ylayotgandek ko'rinadi.
**RU:** Вы вышли из кабинета Рустама в зал салона. Автомобили стоят в ряд. В стороне незнакомая женщина стоит у Equinox и, кажется, о чём-то размышляет.

→ next: d1_dilnoza_preintro

---

### [d1_dilnoza_preintro] Dilnoza (explaining) — dialogue
**Background:** bg_showroom
**Characters:** Dilnoza (explaining, center)

**UZ:** Uch yildan beri shu Equinox yonida turaman. Lekin hali ham odamlar uni ko'rishda hayron qolishadi. Bu mashinada siz sotmaysiz — mashina o'zi sotadi.
**RU:** Три года стою рядом с этим Equinox. Но люди до сих пор удивляются, когда видят его. В этой машине вы не продаёте — машина продаёт сама.

→ next: d1_dilnoza_notices

---

### [d1_dilnoza_notices] Dilnoza (smirk) — dialogue
**Background:** bg_showroom
**Characters:** Dilnoza (smirk, center)

**UZ:** Siz yangi kelgan sotuvchimisiz?
**RU:** Вы наш новый продавец?

→ next: d1_dilnoza_self_intro

---

### [d1_dilnoza_self_intro] Dilnoza (neutral) — dialogue
**Background:** bg_showroom
**Characters:** Dilnoza (neutral, center)

**UZ:** Ismim Dilnoza. Bu salonning eng yaxshi sotuvchisiman, 4 yildan beri shu yerda ishlayman.
**RU:** Меня зовут Дильноза. Я лучший продавец этого салона, работаю здесь уже 4 года.

→ next: d1_dilnoza_greet_choice

---

### [d1_dilnoza_greet_choice] Player — choice

**Prompt UZ:** Dilnozaga javob bering:
**Prompt RU:** Ответить Дильнозе:

- **[d1_dilnoza_greet_polite]**
  - **UZ:** Tanishganimdan xursandman, Dilnoza!
  - **RU:** Приятно познакомиться, Дильноза!
  - **Effects:** —
  - → next: d1_meet_dilnoza

---

### [d1_meet_dilnoza] Dilnoza (smirk) — dialogue
**Background:** bg_showroom
**Characters:** Dilnoza (smirk, center)

**UZ:** Yuzingizdan bilinib turibdi, birinchi mijozni kutyapsiz. Hammaning birinchi kuni shunaqa o'tadi.
**RU:** По лицу видно, ждёте первого клиента. У всех первый день проходит примерно так.

→ next: d1_dilnoza_tip

---

### [d1_dilnoza_tip] Dilnoza (smirk) — dialogue
**Characters:** Dilnoza (smirk, center)
**Effects:** set_flag: met_dilnoza

**UZ:** Birinchi mijoz oldida hamma bir oz hayajonlanadi. Faqat buni yuzingizda bildirmang. Agar juftlik kelsa, ikkalasini ham qiziqtiradigan bitta sabab toping.
**RU:** Перед первым клиентом все немного волнуются. Только не показывайте это на лице. Если приходит пара — найдите одну причину, которая заинтересует обоих.

→ next: d1_couple_enters

---

## ── MAIN: Couple Enters ──

### [d1_couple_enters] Narrator — dialogue
**Background:** bg_showroom_young_couple

**UZ:** Eshik ochildi. Yosh juftlik kirdi. Er darhol Tracker tomon yurdi. Xotini esa Equinox oldida to'xtadi.
**RU:** Дверь открылась. Вошла молодая пара. Муж сразу пошёл к Tracker. Жена остановилась у Equinox.

→ next: d1_who_first

---

### [d1_who_first] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Kimni yoniga birinchi borasiz?
> **Prompt RU:** К кому подойдёте первым?

**A) d1_who_first_a**
UZ: Ikkalasini oldiga boraman: "Assalomu alaykum. Keling, sizga tanlov qilishda yordam beraman. Qaysi mashinalarni qarayapsizlar?"
RU: Подхожу сразу к обоим: "Здравствуйте. Давайте я помогу вам сделать выбор. Какие автомобили вы рассматриваете?"
→ leads to: d1_conflict_both
Effects: +15 rapport, +5 empathy, set_flag: addressed_both

**B) d1_who_first_b**
UZ: Javlon tomonga boraman: "Assalomu alaykum. Tracker ko'ryapsizmi?"
RU: Подхожу к Жавлону: "Здравствуйте. Смотрите Tracker?"
→ leads to: d1_conflict_tracker
Effects: +8 timing, set_flag: approached_javlon

**C) d1_who_first_c**
UZ: Nilufar tomonga boraman: "Assalomu alaykum. Equinoxga qarayapsizmi?"
RU: Подхожу к Нилуфар: "Здравствуйте. Смотрите Equinox?"
→ leads to: d1_conflict_equinox
Effects: +8 expertise, set_flag: approached_nilufar

---

## ── BRANCH: Addressed Both ──

### [d1_conflict_both] Javlon (stubborn) — dialogue
**Background:** bg_showroom_young_couple_no_people
**Characters:** Javlon (stubborn, left), Nilufar (thoughtful, right)

**UZ:** Mayli, birgalikda ko'ramiz. Lekin men Trackerni qo'llab-quvvatlayman. Tez ishlaydi, gazni bosganingda darhol javob chiqadi.
**RU:** Ладно, посмотрим вместе. Но я за Tracker. Работает быстро, газ нажимаешь — сразу отклик.

→ next: d1_conflict_both_nilufar

---

### [d1_conflict_both_nilufar] Nilufar (worried) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (worried, right)

**UZ:** Men esa orqa o'rindiqlarda kim o'tirishini o'ylayapman. Ikki bola bilan Tracker torlik qiladi. Lekin mashinalarni birga ko'rsak, mayli.
**RU:** А я думаю о том, кто будет сидеть сзади. С двумя детьми Tracker тесноват. Но если смотреть вместе, хорошо.

→ next: d1_compromise

---

## ── BRANCH: Approached Javlon (Tracker) ──

### [d1_conflict_tracker] Javlon (stubborn) — dialogue
**Background:** bg_showroom_young_couple_no_people
**Characters:** Javlon (stubborn, left), Nilufar (worried, right)

**UZ:** Ha, Tracker menga yoqadi. Yengil, chaqqon, rulni yaxshi his qilsa bo'ladi. Menga shunisi kerak.
**RU:** Да, Tracker мне подходит. Лёгкий, шустрый, за рулём живой. Мне именно это и нужно.

→ next: d1_conflict_tracker_nilufar

---

### [d1_conflict_tracker_nilufar] Nilufar (worried) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (worried, right)

**UZ:** Javlon, yana o'sha gapmi? Bolalarni har kuni men olib yuraman. Meni ham bir eshitish kerak-ku.
**RU:** Жавлон, опять то же самое? Детей каждый день вожу я. Меня тоже надо хоть раз услышать.

→ next: d1_compromise

---

## ── BRANCH: Approached Nilufar (Equinox) ──

### [d1_conflict_equinox] Nilufar (happy) — dialogue
**Background:** bg_showroom_young_couple_no_people
**Characters:** Javlon (stubborn, left), Nilufar (happy, right)

**UZ:** Equinoxning ichi kengroq ekan. Kreslo, sumka, bolalar narsasi hammasi sig'adi. Men shunga qarayapman.
**RU:** У Equinox салон просторнее. Кресло, сумки, детские вещи, всё поместится. Я на это и смотрю.

→ next: d1_conflict_equinox_javlon

---

### [d1_conflict_equinox_javlon] Javlon (stubborn) — dialogue
**Characters:** Javlon (stubborn, left), Nilufar (happy, right)

**UZ:** Men ham shu yerdaman. Mashina faqat bagaj emas-ku. Men rulga o'tiraman, yurishi ham ahamiyatli.
**RU:** Я вообще-то тоже здесь. Машина не только для багажника. За руль сажусь я, как она едет тоже важно.

→ next: d1_compromise

---

## ── CONVERGE: Compromise Choice ──

### [d1_compromise] TANLOV / ВЫБОР — choice
**Timer:** 10 seconds | On expire → d1_compromise_expired

> **Prompt UZ:** Ikkalasi ham o'z tanlovida turibdi. Nima deysiz?
> **Prompt RU:** Оба стоят на своём. Что скажете?

**A) d1_compromise_a**
UZ: Ikkalangiz ham ikkihil narsa xohlayapsizlar. Keling, hozir sizlar uchun nima muhimroq ekanini aniqlashtirib olaylik: Oilangiz komfortimi yoki rul oldidagi hissiyotlarmi?
RU: Вы оба отстаиваете разное, но оба про дом. Давайте сначала отделим, что для вас сейчас тяжелее: удобство семьи или ощущения за рулём.
→ leads to: d1_compromise_balanced
Effects: +15 empathy, +10 persuasion, set_flag: balanced_both

**B) d1_compromise_b**
UZ: Equinox faqat oila uchun emas. Yurishi ham sust emas. Avval ichini ko'raylik, keyin rulda o'zingiz o'tirib his qilib ko'rasiz.
RU: Equinox не только семейный. И едет он не вяло. Сначала посмотрим салон, потом сами почувствуете за рулём.
→ leads to: d1_compromise_sport
Effects: +12 expertise, +5 persuasion

**C) d1_compromise_c**
UZ: Yana bir yo'l bor: hozir bittasini olasiz, keyin u eskirganda, mashinani topshirib boshqasiga alishtirasiz.
RU: Есть ещё вариант: сейчас берёте одну, потом сдаёте её и переходите на другую.
→ leads to: d1_compromise_tradein
Effects: +8 timing, +5 opportunity

---

### [d1_compromise_expired] — score (timer expired)
**Effects:** -5 timing

**Narrator UZ:** Siz ikkilandingiz. Javlon bilan Nilufar bir-biriga qarab, noqulay jimlik cho'kdi.
**Narrator RU:** Вы замешкались. Жавлон и Нилуфар переглянулись, повисла неловкая тишина.

→ next: d1_test_drive_offer

---

## ── BRANCH: Compromise Balanced ──

### [d1_compromise_balanced] Javlon (thinking) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (happy, right)

**UZ:** Gapingizda jon bor. Oila tomoni ham bor. Men faqat keyin afsus bo'ladigan mashina olib qo'ymaylik deyman.
**RU:** В ваших словах есть смысл. Семейная сторона тоже есть. Я просто не хочу взять машину и потом жалеть.

→ next: d1_compromise_balanced_nilufar

---

### [d1_compromise_balanced_nilufar] Nilufar (happy) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (happy, right)

**UZ:** Ikkalamizni ham eshitdingiz. Endi xotirjam ko'ramiz, keyin qaror qilamiz.
**RU:** Вы услышали нас обоих. Теперь спокойно посмотрим и потом решим.

→ next: d1_test_drive_offer

---

## ── BRANCH: Compromise Sport ──

### [d1_compromise_sport] Javlon (thinking) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (thoughtful, right)

**UZ:** Mayli, agar yurishi o'lik bo'lmasa, ko'ramiz. O'zim minib ko'rishim kerak.
**RU:** Ладно, если едет не вяло, посмотрим. Мне самому надо прокатиться.

→ next: d1_compromise_sport_nilufar

---

### [d1_compromise_sport_nilufar] Nilufar (thoughtful) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (thoughtful, right)

**UZ:** Mayli. Lekin men avval orqa o'rindiq bilan bagajni ko'raman. Gap o'shanda bilinadi.
**RU:** Хорошо. Но я сначала посмотрю задний ряд и багажник. Там всё и станет понятно.

→ next: d1_test_drive_offer

---

## ── BRANCH: Compromise Trade-in ──

### [d1_compromise_tradein] Javlon (thinking) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (worried, right)

**UZ:** Variant sifatida o'ylab ko'rsa bo'ladi. Lekin keyin yana almashtirish ham oson emas. Bir marta olib, ko'ngil tinch bo'lgani yaxshi.
**RU:** Как вариант звучит. Но потом снова бегать, менять, терять время тоже не хочется. Лучше бы сразу понять, что нам подойдёт.

→ next: d1_compromise_tradein_nilufar

---

### [d1_compromise_tradein_nilufar] Nilufar (worried) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (worried, right)

**UZ:** Meni ham shu o'ylantiradi. Bolalar masalasi keyin emas, hozir. Shuning uchun hozirdan to'g'ri tanlagan yaxshi.
**RU:** Вот это меня и смущает. Дети у нас уже сейчас, не потом. Поэтому лучше сразу выбрать нормально.

→ next: d1_test_drive_offer

---

## ── TEST DRIVE ──

### [d1_test_drive_offer] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Qanday davom etasiz?
> **Prompt RU:** Как продолжите?

**A) d1_test_drive_offer_a**
UZ: Keling, gapni hozircha to'xtataylik-da, bir shu mashinada aylanib ko'raylik. Yo'lda ko'p narsa bilinadi.
RU: Давайте пока отложим разговор и просто прокатимся. На дороге многое становится понятно.
→ leads to: d1_test_drive
Effects: +5 rapport, set_flag: offered_test_drive

**B) d1_test_drive_offer_b**
UZ: Mayli, unda o'tirib to'lov shartlarini gaplashaylik.
RU: Хорошо, тогда давайте сядем и обсудим условия оплаты.
→ leads to: d1_anniversary_check
Effects: (none)

---

### [d1_test_drive] Narrator — dialogue
**Background:** bg_city_street_tashkent

**UZ:** Shahar ichidagi odatiy yo'l. Svetofor, burilish, biroz notekis joylar. Javlon rulda, Nilufar orqa tomonda o'rindiqni tekshirib o'tirdi.
**RU:** Обычный городской маршрут. Светофоры, повороты, местами неровная дорога. Жавлон за рулём, Нилуфар сзади проверяет, как там сидится.

→ next: d1_test_drive_javlon

---

### [d1_test_drive_javlon] Javlon (stubborn) — dialogue
**Background:** bg_test_drive_javlon_speaking
**Characters:** (none — full scene image)

**UZ:** Yurishi yomon emas ekan. Tortishi ham yaxshi. Men kutgandan yengilroq sezildi.
**RU:** Едет, кстати, неплохо. Тяга тоже хорошая. Ощущается легче, чем я ожидал.

→ next: d1_test_drive_nilufar

---

### [d1_test_drive_nilufar] Nilufar (happy) — dialogue
**Background:** bg_test_drive_nilufar_speaking
**Characters:** (none — full scene image)

**UZ:** Orqasi tor emas ekan. Bolalar kreslosi ham sig'adi, yoniga sumka ham tushadi. Tashqaridagi shovqin ham bezor qilmayapti.
**RU:** Сзади не тесно. Детское кресло встанет, рядом ещё и сумка поместится. И шум снаружи не раздражает.

→ next: d1_test_drive_choice

---

### [d1_test_drive_choice] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Yo'lda nima deysiz?
> **Prompt RU:** Что скажете по дороге?

**A) d1_test_drive_choice_a**
UZ: Xavfsizlik bilan bolalar uchun qulay joylarini ko'rsatib beraman.
RU: Покажу, что тут по безопасности и что удобно для детей.
→ leads to: d1_test_drive_safety
Effects: +8 empathy

**B) d1_test_drive_choice_b**
UZ: Keyin sotganda ham qadrini ushlashi haqida aytaman.
RU: Скажу, что потом при продаже она тоже держит цену.
→ leads to: d1_test_drive_value
Effects: +5 expertise

**C) d1_test_drive_choice_c**
UZ: Biroz jim turaman, o'zlari sezib olsin.
RU: Немного помолчу, пусть сами почувствуют.
→ leads to: d1_test_drive_silent
Effects: +10 rapport

---

### [d1_test_drive_safety] Nilufar (happy) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (happy, right)

**UZ:** Orqada eshik qulfi bilan xavfsizlik yostiqlari bor ekanmi? Men uchun shu muhim. Aytganingiz uchun rahmat.
**RU:** Сзади есть блокировка дверей и подушки безопасности? Для меня вот это важно. Спасибо, что сказали.

→ next: d1_anniversary_check

---

### [d1_test_drive_value] Javlon (thinking) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (thoughtful, right)

**UZ:** Keyin sotganda ham qadri ko'p yo'qolmasa va tez sotilsa yaxshi.
**RU:** Если потом при продаже не сильно потеряет в цене и быстро продастся — уже хорошо.

→ next: d1_anniversary_check

---

### [d1_test_drive_silent] Javlon (touched) — dialogue
**Background:** bg_city_street_tashkent
**Characters:** Javlon (touched, left), Nilufar (happy, right)

**UZ:** To'g'risi, mazza qilib xaydadim, testdrayv uchun rahmat!
**RU:** Честно говоря, с удовольствием проехался, спасибо за тест-драйв!

→ next: d1_anniversary_check

---

## ── ANNIVERSARY HINT (Conditional) ──

### [d1_anniversary_check] — condition_branch
**Condition:** flag: addressed_both AND flag: balanced_both
- **If true** → d1_anniversary_hint
- **Fallback** → d1_closing

---

### [d1_anniversary_hint] Nilufar (caring) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (caring, right)
**Effects:** set_flag: knows_anniversary

**UZ:** Aytgancha, kelasi hafta to'y qilganimizga besh yil bo'ladi. Shuning uchun ham bir qarorga kelishimiz kerak.
**RU:** Кстати, на следующей неделе будет пять лет, как мы женаты. Так что нам и с этим надо определиться.

→ next: d1_closing

---

## ── CLOSING ──

### [d1_closing] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Yakunida nima deysiz?
> **Prompt RU:** Что скажете в конце?

**A) d1_closing_a**
UZ: Asosiysi shoshilmang. Yana bir kun ikkalangiz kelib, odatdagi yo'lingizda minib ko'ring. Qaror qabul qilishingiz shunda osonroq bo'ladi.
RU: Главное — не спешите. Приезжайте ещё раз вдвоём и прокатитесь по своему обычному маршруту. Так принять решение будет проще.
→ leads to: d1_check
Effects: +10 timing, +5 rapport

**B) d1_closing_b** *(Condition: flag knows_anniversary)*
UZ: Yubileyingiz yaqin ekan. Agar qaror qilsangiz, mashinani aynan o'sha kuningizga tayyorlab beramiz. Sovg'adek chiqadi.
RU: У вас скоро годовщина. Если решитесь, можем подготовить выдачу именно к этой дате. Получится не просто покупка, а хороший подарок.
→ leads to: d1_check
Effects: +20 opportunity, +10 empathy, set_flag: anniversary_surprise

**C) d1_closing_c**
UZ: Istasangiz, hafta oxirigacha shu variantni ushlab turamiz. Uyda yana gaplashib, keyin aytasiz.
RU: Если хотите, до конца недели удержим этот вариант за вами. Дома ещё раз обсудите и потом скажете.
→ leads to: d1_check
Effects: +5 timing

---

## ── ENDINGS ──

### [d1_check] — condition_branch
- **If** flag: anniversary_surprise → d1_end_hidden
- **If** score >= 32 → d1_end_success
- **If** score >= 18 → d1_end_partial
- **Fallback** → d1_end_fail

---

### [d1_end_hidden] — end (hidden_ending)
**Effects:** +180 XP, gain_life, unlock_achievement: love_sells, set_flag: d1_hidden, set_flag: d1_success

**Javlon (touched):**
**Characters:** Javlon (touched, left), Nilufar (happy, right)

**UZ:** Rahmat sizga! Siz bizga mashinani shunchaki sotmasdan, avval bizni to'g'ri tushundingiz. Bizga ma'qul, olamiz. Equinoxni rasmiylashtiramiz.
**RU:** Спасибо вам! Вы не просто продавали машину, а сначала правильно нас поняли. Нам подходит, берём. Давайте оформлять Equinox.

---

### [d1_end_success] — end (success)
**Effects:** +120 XP, set_flag: d1_success

**Rustam (proud):**
**Characters:** Rustam (proud, center)

**UZ:** Asosiysi, juftlikni ikkisini ham eshitdingiz. Shu usulni ushlab qoling.
**RU:** Главное — вы выслушали обоих в паре. Держите эту линию.

---

### [d1_end_partial] — end (partial)
**Effects:** +75 XP, set_flag: d1_partial

**Rustam (serious):**
**Characters:** Rustam (serious, center)

**UZ:** Yomon emas. Lekin bir paytning o'zida faqat bir mijoz bilan gaplashdingiz. Ikkinchisi esa chetda qolib ketdi.
**RU:** Неплохо. Но в какой-то момент вы общались только с одним клиентом. А второй остался в стороне.

---

### [d1_end_fail] — end (failure)
**Effects:** +40 XP, lose_life, set_flag: d1_fail

**Dilnoza (explaining):**
**Characters:** Dilnoza (explaining, center)

**UZ:** Juftlikdan biri sovub qolsa, sotuv jarayoni ham soviydi. Keyingi safar suhbatni ikkovi bilan olib boring.
**RU:** Если один в паре остывает, то и продажа остывает. В следующий раз ведите разговор сразу с обоими.

---

**Next Day Teaser:**
**UZ:** Ertaga Kamola xonim keladi — hamma narsani biladi...
**RU:** Завтра придёт Камола — она всё знает...
