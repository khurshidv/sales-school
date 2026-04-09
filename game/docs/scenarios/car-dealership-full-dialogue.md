# Chevrolet Avtosalon — Polnyy tekst igry / Полный текст игры

---

## Den' 1: Yangi boshlanish / Новое начало

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

**UZ:** Salom! Ismim Rustam, bosh menejerman. Bizning jamoaga xush kelibsiz! Mijozlar bilan gaplashganda avval ularni yaxshilab eshiting, keyin esa gapiring.
**RU:** Привет! Меня зовут Рустам, я главный менеджер. Добро пожаловать в нашу команду! Помните, когда вы разговариваете с клиентами, сначала внимательно их слушайте, а затем говорите.

→ next: d1_rustam_tip

---

### [d1_rustam_tip] Rustam (serious) — dialogue

**UZ:** Bugun bir juftlik kelishi kerak. Ikkisini ham xoxishlarini yaxshilab tinglang. Biri jim tursa ham, qarorni baribir ikkalasi qabul qiladi.
**RU:** Сегодня должна приехать пара. Внимательно выслушайте пожелания обоих. Даже если один из них будет молчать, решение все равно примут оба.

→ next: d1_meet_dilnoza

---

### [d1_meet_dilnoza] Dilnoza (smirk) — dialogue
**Background:** bg_showroom

**UZ:** Yuzingizdan bilinib turibdi, birinchi mijozni kutyapsiz. Ismim Dilnoza. Hammaning birinchi kuni shunaqa o'tadi.
**RU:** По лицу видно, ждёте первого клиента. Меня зовут Дильноза. У всех первый день проходит примерно так.

→ next: d1_dilnoza_tip

---

### [d1_dilnoza_tip] Dilnoza (smirk) — dialogue
**Effects:** set_flag: met_dilnoza

**UZ:** Birinchi mijoz oldida hamma bir oz hayajonlanadi. Faqat buni yuzingizda bildirmang. Agar juftlik kelsa, ikkalasini ham qiziqtiradigan bitta sabab toping.
**RU:** Перед первым клиентом все немного волнуются. Только не показывайте это на лице. Если приходит пара — найдите одну причину, которая заинтересует обоих.

→ next: d1_meet_anvar

---

### [d1_meet_anvar] Anvar (nervous) — dialogue
**Background:** bg_showroom

**UZ:** Salom, ismim Anvar. Men ham bu yerda yangi sotuvchiman. Mana, bugungi mijozlar ro'yxati.
**RU:** Привет, меня зовут Анвар. Я тоже здесь новый продавец. Вот список клиентов на сегодня.

→ next: d1_anvar_info

---

### [d1_anvar_info] Anvar (nervous) — dialogue
**Effects:** set_flag: met_anvar

**UZ:** Bir juftlik kelishi kerak edi. Ular o'zaro tortishayotgan edi menimcha. Erkak uchun mashinaning yurishi muhim, ayol uchun esa bolalarga qulay bo'lishi kerak ekan.
**RU:** Должна прийти одна пара. По-моему, они между собой спорили. Мужу важно, как машина едет, а жене — чтобы детям было удобно.

→ next: d1_couple_enters

---

### [d1_couple_enters] Narrator — dialogue
**Background:** bg_showroom_young_couple.png

**UZ:** Eshik ochildi. Yosh juftlik kirdi. Er darhol Tracker tomon yurdi. Xotini esa Equinox oldida to'xtadi.
**RU:** Дверь открылась. Вошла молодая пара. Муж сразу пошёл к Tracker. Жена остановилась у Equinox.

→ next: d1_who_first

---

### [d1_who_first] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Kimni yoniga birinchi borasiz?
> **Prompt RU:** К кому подойдёте первым?

**A) d1_who_first_a**
UZ: Ikkalasini oldiga boraman: "Assalomu alaykum. Keling, sizga tanlov qilishda yordam beraman. Qaysi mashinalrni qarayapsizlar?"
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
**Background:** bg_showroom_young_couple-no-people.png
**Characters:** Javlon (stubborn, left), Nilufar (thoughtful, right)

**UZ:** Mayli, birgalikda ko'ramiz. Lekin men Trackerni qo'llab-quvvatlayman. Tez ishlaydi, gazni bosganingda darhol javob chiqadi.
**RU:** Ладно, посмотрим вместе. Но я за Tracker. Работает быстро, газ нажимаешь — сразу отклик.

→ next: d1_conflict_both_nilufar

---

### [d1_conflict_both_nilufar] Nilufar (worried) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (worried, right)

**UZ:** Men esa orqa o'rindiqlarda kim o'tirishini o'ylayapman. Ikki bola bilan Tracker torlik qiladi. Lekin mashinalarni birga  ko'rsak, mayli.
**RU:** А я думаю о том, кто будет сидеть сзади. С двумя детьми Tracker тесноват. Но если смотреть вместе, хорошо.

→ next: d1_compromise

---

## ── BRANCH: Approached Javlon (Tracker) ──

### [d1_conflict_tracker] Javlon (stubborn) — dialogue
**Background:** bg_showroom_young_couple-no-people.png
**Characters:** Javlon (stubborn, left), Nilufar (worried, right)

**UZ:** Ha, Tracker menga yoqadi. Yengil, chaqqon, rulni yaxshi his qilsa bo'ladi. Menga shunisi kerak.
**RU:** Да, Tracker мне подходит. Лёгкий, шустрый, за рулём живой. Мне именно это и нужно.

→ next: d1_conflict_tracker_nilufar

---

### [d1_conflict_tracker_nilufar] Nilufar (worried) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (worried, right)

**UZ:** Dadasi, yana o'sha gapmi? Bolalarni har kuni men olib yuraman. Meni ham bir eshitish kerak-ku.
**RU:** Жавлон, опять то же самое? Детей каждый день вожу я. Меня тоже надо хоть раз услышать.

→ next: d1_compromise

---

## ── BRANCH: Approached Nilufar (Equinox) ──

### [d1_conflict_equinox] Nilufar (happy) — dialogue
**Background:** bg_showroom_young_couple-no-people.png
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

(Мое амечание - во время игры игрок не понимает что у него время на исходе нужно добавить визуальную полосу который отображет таймер в 10 секунд)

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
**RU:** Вот. Вы услышали нас обоих. Теперь спокойно посмотрим и потом решим.

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

**UZ:** Mayli. Lekin men avval orqa o'rindiq bilan bagajni ko'raman. O'shanda hammasini bilinadi...
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
UZ: Keling, gapni hozircha to'xtataylik-da, bir hu mashinada aylanib ko'raylik. Yo'lda ko'p narsa bilinadi.
RU: Давайте пока отложим разговор и просто прокатимся. На дороге многое становится понятно.
→ leads to: d1_test_drive
Effects: +5 rapport, set_flag: offered_test_drive

**B) d1_test_drive_offer_b**
UZ: Mayli, unda o'tirib to'lov shartlarini gaplashaylik.
RU: Хорошо, тогда давайте сядем и обсудим условия.
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
**Background:** couple-in-the-car-test-drive.png
**Characters:** Javlon (stubborn, left), Nilufar (thoughtful, right)

**UZ:** Yurishi yomon emas ekan. Tortishi ham yaxshi. Men kutgandan yengilroq sezildi.
**RU:** Едет, кстати, неплохо. На газ откликается. Ощущается легче, чем я ожидал.

→ next: d1_test_drive_nilufar

---

### [d1_test_drive_nilufar] Nilufar (happy) — dialogue
**Characters:** Javlon (touched, left), Nilufar (happy, right)

**UZ:** Orqasi tor emas ekan. Bolalar kreslosi ham sig'adi, yoniga sumka ham tushadi. Tashqaridagi shovqin ham bezor qilmayapti.
**RU:** Сзади не тесно. Кресло встанет, рядом ещё и сумка поместится. И внутри шум не раздражает.

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
UZ: Biroz jim turaman, o'zlari mashinani yaxshilab his qilib olishsin.
RU: Немного помолчу, пусть сами почувствуют.
→ leads to: d1_test_drive_silent
Effects: +10 rapport

---

### [d1_test_drive_safety] Nilufar (happy) — dialogue
**Characters:** Javlon (neutral, left), Nilufar (happy, right)

**UZ:** Orqada eshik qulfi bilan xavfsizlik yostiqlari bor ekanmi? Men uchun shu muhim. Etganingiz uchun rahmat.
**RU:** Есть блокировка задних дверей и подушки безопасности? Для меня вот это важно. Спасибо, что сказали.

→ next: d1_anniversary_check

---

### [d1_test_drive_value] Javlon (thinking) — dialogue
**Characters:** Javlon (thinking, left), Nilufar (thoughtful, right)

**UZ:** Keyin sotganda ham qadri ko'p yo'qolmasa va tez sotilsa yaxshi. 
**RU:** Если потом при продаже не сильно просядет, уже неплохо. Значит, деньги не уйдут в воздух совсем.

→ next: d1_anniversary_check

---

### [d1_test_drive_silent] Javlon (touched) — dialogue
**Background:** bg_city_street_tashkent
**Characters:** Javlon (touched, left), Nilufar (happy, right)

**UZ:** To'g'risi, mazza qilib xaydadim, testdrayv uchun rahmat!
**RU:** Если честно, эта тишина как раз к месту. Каждый сам чувствует своё.

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
RU: Не спешите. Приезжайте ещё раз вдвоём и прокатитесь по своему обычному маршруту. Так решать будет проще.
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
**RU:** Вот, это точно. Вы нам не просто машину показали, вы сначала нас правильно поняли. Берём. Давайте оформлять Equinox.

---

### [d1_end_success] — end (success)
**Effects:** +120 XP, set_flag: d1_success

**Rustam (proud):**

**UZ:** Asosiysi, juftlikni ikkisni ham eshitdingiz. Shu usulni ushlab qoling.
**RU:** Главное, вы не потеряли одного, пока разговаривали со вторым. Держите эту линию.

---

### [d1_end_partial] — end (partial)
**Effects:** +75 XP, set_flag: d1_partial

**Rustam (serious):**

**UZ:** Yomon emas. Lekin bir paytning o'zida faqat bir mijoz bilangaplashdingiz. Ikkinchisi esa chetda qolib ketdi.
**RU:** Неплохо. Но в какой-то момент вы держали только одного. Второй в разговоре остался в стороне.

---

### [d1_end_fail] — end (failure)
**Effects:** +40 XP, lose_life, set_flag: d1_fail

**Dilnoza (explaining):**

**UZ:** Juftlikdan biri sovub qolsa, sotuv jarayoni ham soviydi. Keyingi safar suhbatni ikkovi bilan olib boring.
**RU:** В паре если один остывает, разговор тоже остывает. В следующий раз ведите беседу сразу на двоих.

---

**Next Day Teaser:**
**UZ:** Ertaga Kamola xonim keladi — hamma narsani biladi...
**RU:** Завтра придёт Камола — она всё знает...

---
---

## Den' 2: Talabchan mijoz / Требовательный клиент

**Target Score: 45**
**Root Node: d2_intro**

---

### [d2_intro] Rustam (serious) — dialogue
**Background:** bg_manager_office

**UZ:** Bugungi mijozga ortiqcha gaplar bilan tushuntirish shart emas. U o'zi mashinalarni yaxshi farqiga boradi. Sizdan kutadigani — aniq va qisqa javoblar.
**RU:** Сегодняшнему клиенту не нужно долго объяснять. Она сама хорошо разбирается в машинах. От вас ждёт — чётких и коротких ответов.

→ next: d2_anvar_files

---

### [d2_anvar_files] Anvar (nervous) — dialogue
**Background:** bg_manager_office
**Characters:** Rustam (serious, left), Anvar (nervous, right)

**UZ:** Rustam aka, Kamola xonim oldin ham kelgan. Malibu ni ko'rib chiqqan, K5 bilan ham solishtirib bo'lgan.
**RU:** Рустам-ака, Камола уже приезжала. Malibu посмотрела, с K5 тоже сравнила.

→ next: d2_callback_check

---

### [d2_callback_check] — condition_branch
- **If** flag: d1_success → d2_callback
- **Fallback** → d2_kamola_enters

---

### [d2_callback] Narrator — dialogue
**Effects:** +5 opportunity, add_bonus: callback_bonus (x1.5)

**UZ:** Qo'ng'iroq bo'ldi: kechagi er-xotin bo'yicha Javlon telefon qildi. Nilufar bilan gaplashibdi, Equinox ni yana bir ko'rmoqchi ekanlar.
**RU:** Звонок по вчерашней паре: Жавлон сказал, что обсудили с Нилуфар и хотят ещё раз посмотреть Equinox.

→ next: d2_kamola_enters

---

### [d2_kamola_enters] Kamola (confident) — dialogue
**Background:** bg_showroom

**UZ:** Salom. Malibu bo'yicha keldim. K5 bilan solishtirib chiqdim. Farqini quruq reklamasiz aytib bera olasizmi?
**RU:** Здравствуйте. Я по Malibu. С K5 уже сравнила. Сможете без рекламы по-простому объяснить, за что здесь разница?

→ next: d2_presentation

---

### [d2_presentation] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Kamola xonim bilan suhbatni qanday boshlaysiz?
> **Prompt RU:** Как начнёте разговор с Камолой?

**A) d2_presentation_a**
UZ: Siz tayyorlanib kelibsiz. Unda vaqtni olmayman, faqat haqiqiy farqlarini aytaman.
RU: Вы пришли подготовленной. Тогда не буду отнимать время, скажу только по реальным отличиям.
→ leads to: d2_kamola_obj_features
Effects: +15 expertise, +5 rapport, set_flag: respected_knowledge

**B) d2_presentation_b**
UZ: Malibu yomon variant emas. Keling, mashinani qisqa ko'rib chiqamiz, keyin narxga qaytamiz.
RU: Malibu вариант хороший. Давайте коротко пройдёмся по машине, потом вернёмся к цене.
→ leads to: d2_kamola_obj_value
Effects: +10 expertise, set_flag: standard_pitch

**C) d2_presentation_c**
UZ: Siz uchun birinchi o'rinda nima turadi: qulaylikmi, texnologiyami, tinch haydashmi?
RU: Для вас сейчас что на первом месте: комфорт, технологии или то, как машина ощущается в езде?
→ leads to: d2_kamola_obj_priorities
Effects: +8 discovery, +5 empathy, set_flag: asked_priorities_d2

---

## ── BRANCH: Respected Knowledge ──

### [d2_kamola_obj_features] Kamola (checking) — dialogue
**Background:** bg_showroom

**UZ:** Yaxshi. Lekin opsiyalar ro'yxatini o'zim ham ko'rdim. 3 ming dollar farq faqat shu mayda qo'shimchalar uchunmi?
**RU:** Хорошо. Но список опций я и сама посмотрела. 3 тысячи разницы - только за эти мелкие допы?

→ next: d2_objection

---

## ── BRANCH: Standard Pitch ──

### [d2_kamola_obj_value] Kamola (checking) — dialogue
**Background:** bg_showroom

**UZ:** Umumiy gaplarni eshitganman. K5 — 25 ming, Malibu — 28 ming. Shu 3 ming uchun amalda nimaga ega bo'laman?
**RU:** Общие слова я уже слышала. K5 — 25 тысяч, Malibu — 28. За эти 3 тысячи что я получаю на практике?

→ next: d2_objection

---

## ── BRANCH: Asked Priorities ──

### [d2_kamola_obj_priorities] Kamola (confident) — dialogue
**Background:** bg_showroom

**UZ:** Qulaylik va texnologiya. Lekin buni men allaqachon solishtirganman. Savol boshqa: shu 3 ming nimani yopadi?
**RU:** Комфорт и технологии. Но это я уже сравнила. Вопрос в другом: что закрывает эта доплата в 3 тысячи?

→ next: d2_objection

---

## ── CONVERGE: Objection Handling ──

### [d2_objection] TANLOV / ВЫБОР — choice
**Timer:** 10 seconds | On expire → d2_objection_expired

> **Prompt UZ:** Narx bo'yicha savolga nima deysiz?
> **Prompt RU:** Что ответите на вопрос про разницу в цене?

**A) d2_objection_a**
UZ: Bu yerda gap shunchaki opsiyada emas. Servis xarajatingizni ham kesadi. Ikki yil ichida farqining bir qismi qaytadi.
RU: Здесь разница не только в опциях. Она ещё и часть ваших будущих расходов снимает. За два года кусок этой доплаты возвращается.
→ leads to: d2_kamola_reacts_service
Effects: +15 persuasion, +5 expertise, set_flag: value_reframe

**B) d2_objection_b**
UZ: Bozorda keyinroq sotganda ham yo'qotishingiz kamroq bo'ladi. Bu ham pul.
RU: При перепродаже вы потом теряете меньше. Это тоже деньги, просто не в день покупки.
→ leads to: d2_kamola_reacts_resale
Effects: +10 persuasion, +5 rapport, set_flag: social_proof

**C) d2_objection_c**
UZ: Xohlasangiz chegirma tomonni ham so'rab ko'raman, lekin avval mashinaning o'zini tushuntirib beray.
RU: Если хотите, могу отдельно уточнить по скидке. Но сначала честно объясню саму машину, чтобы не уводить разговор в сторону.
→ leads to: d2_kamola_reacts_discount
Effects: -5 persuasion, +3 empathy, set_flag: offered_discount

---

### [d2_objection_expired] — score (timer expired)
**Effects:** -8 timing

**Narrator UZ:** Pauza cho'zildi. Kamola aniqlik kutmoqda.
**Narrator RU:** Пауза затянулась. Камола ждёт конкретики.

→ next: d2_kamola_reacts_timeout

---

### [d2_kamola_reacts_service] Kamola (checking) — dialogue
**Background:** bg_showroom

**UZ:** Agar ikki yil servis masalasi yopilsa, bu endi aniqroq gap. Mayli, davom etamiz.
**RU:** Если сервис на два года закрыт, это уже предметный разговор. Ладно, давайте дальше.

→ next: d2_test_drive_offer

---

### [d2_kamola_reacts_resale] Kamola (checking) — dialogue
**Background:** bg_showroom

**UZ:** Qayta sotishni hisobga olaman. Lekin bu asosiy sabab emas. Mashinaning o'zi bo'yicha yana nima deysiz?
**RU:** Перепродажу я тоже учитываю. Но это не главный аргумент. Что ещё есть по самой машине?

→ next: d2_test_drive_offer

---

### [d2_kamola_reacts_discount] Kamola (skeptical) — dialogue
**Background:** bg_showroom

**UZ:** Chegirma keyin ham gaplashiladi. Meni qiziqtirayotgani boshqa: nega aynan shu mashina?
**RU:** Скидку можно обсудить и позже. Меня пока интересует другое: почему именно эта машина?

→ next: d2_test_drive_offer

---

### [d2_kamola_reacts_timeout] Kamola (skeptical) — dialogue
**Background:** bg_showroom

**UZ:** Tushundim. Demak, narxdagi farq bo'yicha hozircha aniq javob yo'q.
**RU:** Поняла. Значит, по разнице в цене внятного ответа у вас пока нет.

→ next: d2_test_drive_offer

---

## ── TEST DRIVE SCENE ──

### [d2_test_drive_offer] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Kamola hali qaror qilgani yo'q. Qanday davom etasiz?
> **Prompt RU:** Камола ещё не приняла решение. Как продолжите?

**A) d2_test_drive_offer_a**
UZ: Bir aylanish qilib ko'ramizmi? Rulda ko'p narsa o'zi tushunarli bo'lib qoladi.
RU: Давайте коротко проедем. За рулём такие вещи обычно становятся понятнее без лишних слов.
→ leads to: d2_test_drive
Effects: +10 timing, +5 persuasion, set_flag: offered_test_drive_d2

**B) d2_test_drive_offer_b**
UZ: Istasangiz, shu yerning o'zida qisqa xulosa qilamiz. Sizda yana savol bormi?
RU: Если хотите, прямо здесь коротко подведём итог. У вас ещё есть вопросы?
→ leads to: d2_closing
Effects: +3 timing

---

### [d2_test_drive] Narrator — dialogue
**Background:** bg_test_drive_city

**UZ:** Kamola rulga o'tirdi. Shahar ichida qog'ozda bilinmaydigan narsalar tezroq sezila boshladi.
**RU:** Камола села за руль. В городе сразу лучше чувствуются вещи, которые на бумаге не объяснишь.

→ next: d2_kamola_drives

---

### [d2_kamola_drives] Kamola (impressed) — dialogue
**Background:** bg_test_drive_city

**UZ:** Hmm... osmasi K5 ga qaraganda yumshoqroq ekan. Salon ham yig'iqroq, tinchroq sezilyapti.
**RU:** Хм... подвеска мягче, чем у K5. И салон ощущается собраннее, тише.

→ next: d2_test_drive_choice

---

### [d2_test_drive_choice] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Kamola haydayotganda o'zingizni qanday tutasiz?
> **Prompt RU:** Как себя поведёте, пока Камола за рулём?

**A) d2_test_drive_choice_a**
UZ: Istasangiz, to'g'ri uchastkada kruizni yoqib ko'ring. Yurganda qanday ushlashini tinchroq seziladi.
RU: Если хотите, включите круиз на прямом участке. Так спокойнее чувствуется, как машина держит ход.
→ leads to: d2_kamola_test_reaction
Effects: +10 expertise, set_flag: test_drive_cruise

**B) d2_test_drive_choice_b**
UZ: Burilishda 360 kameraga qarab ko'ring. Shahar parkovkasida foydasi tez bilinadi.
RU: На следующем манёвре посмотрите на камеру 360°. В городской парковке её польза сразу видна.
→ leads to: d2_kamola_test_reaction
Effects: +8 expertise, +5 empathy

**C) d2_test_drive_choice_c**
UZ: Hech narsa demayman. Mashinani o'zi xotirjam his qilib olsin.
RU: Ничего не добавляю. Пусть спокойно сама почувствует машину.
→ leads to: d2_kamola_test_reaction
Effects: +10 rapport, +5 timing

---

### [d2_kamola_test_reaction] — condition_branch
- **If** flag: test_drive_cruise → d2_kamola_test_cruise
- **Fallback** → d2_kamola_test_general

---

### [d2_kamola_test_cruise] Kamola (impressed) — dialogue
**Background:** bg_test_drive_city

**UZ:** Tushunarli. Uzoq yo'lda oyoq kamroq charchaydi, mashina ham tekisroq yuradi.
**RU:** Понятно. На длинной дороге нога меньше устаёт, и машина идёт ровнее.

→ next: d2_closing

---

### [d2_kamola_test_general] Kamola (impressed) — dialogue
**Background:** bg_test_drive_city

**UZ:** Rulda boshqacha bilinadi. Jadvalda buni bunaqa ko'rmaydi odam.
**RU:** За рулём это воспринимается иначе. По таблице так не видно.

→ next: d2_closing

---

## ── CLOSING ──

### [d2_closing] TANLOV / ВЫБОР — choice

> **Prompt UZ:** Suhbatni qanday yakunlaysiz?
> **Prompt RU:** Как завершите разговор?

**A) d2_closing_a**
UZ: Istasangiz, bugungi gapning qisqa xulosasini telegramga tashlab beraman. Qayta ko'rib chiqishingiz oson bo'ladi.
RU: Если хотите, я скину вам в телеграм короткую выжимку по сегодняшнему разговору. Так будет проще спокойно ещё раз всё сверить.
→ leads to: d2_check
Effects: +8 rapport, +3 expertise, set_flag: sent_info

**B) d2_closing_b**
UZ: Agar bugun qaror qilsangiz, men shartlarni alohida kelishib ko'rishga harakat qilaman.
RU: Если решите сегодня, я попробую отдельно согласовать для вас условия.
→ leads to: d2_check
Effects: +5 timing, -3 rapport, set_flag: pressure_close

**C) d2_closing_c**
UZ: Shoshmang. O'ylab ko'ring. Savol tug'ilsa, yozing — men aniq javob beraman.
RU: Не спешите. Спокойно подумайте. Если появятся вопросы, напишите — отвечу уже без воды, по делу.
→ leads to: d2_check
Effects: +10 rapport, +5 empathy, set_flag: soft_close

---

## ── ENDINGS ──

### [d2_check] — condition_branch
- **If** score >= 40 AND flag: respected_knowledge → d2_end_hidden
- **If** score >= 35 → d2_end_success
- **If** score >= 20 → d2_end_partial
- **Fallback** → d2_end_fail

---

### [d2_end_hidden] — end (hidden_ending)
**Effects:** +150 XP, gain_life, unlock_achievement: respect_earns_referrals, set_flag: d2_hidden

**Kamola (impressed):**

**UZ:** Siz vaqtimni olmadingiz, shu yoqdi. Kontakt qoldiring. Balki yana bir odamga ham tavsiya qilarman.
**RU:** Вы хотя бы не тратили моё время впустую — это редкость. Оставьте контакт. Возможно, я ещё и подруге вас перешлю.

---

### [d2_end_success] — end (success)
**Effects:** +110 XP, set_flag: d2_success

**Rustam (proud):**

**UZ:** Kamola tayyor kelgan mijoz edi. Siz bahslashmadingiz, bosim ham qilmadingiz. Shu ish berdi.
**RU:** Камола была подготовленным клиентом. Вы не спорили и не давили. Это и сработало.

---

### [d2_end_partial] — end (partial)
**Effects:** +70 XP, set_flag: d2_partial

**Rustam (serious):**

**UZ:** Kamola suhbatni eshitdi, lekin qaytadimi yo'qmi noma'lum. Narxdagi farqni aniqroq ochib berish kerak edi.
**RU:** Камола разговор дослушала, но вернётся ли — непонятно. По разнице в цене нужен был более точный ответ.

---

### [d2_end_fail] — end (failure)
**Effects:** +35 XP, lose_life, set_flag: d2_fail

**Rustam (disappointed):**

**UZ:** Kamola ketdi. Tayyor kelgan mijoz umumiy gapni darrov sezadi. Unga ma'ruza emas, aniq javob kerak.
**RU:** Камола ушла. Подготовленный клиент сразу слышит общие слова. Ему нужна не лекция, а точный ответ.

---
---

## Den' 3: VIP va sirli mijoz / VIP и тайный покупатель

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
→ leads to: d3_anvar_check
Effects: +8 expertise, set_flag: researched_company

**B) d3_prep_b**
UZ: Rustamdan VIP protokolini so'rash
RU: Спросить у Рустама о VIP-протоколе
→ leads to: d3_anvar_check
Effects: +8 rapport, set_flag: knows_vip_protocol

**C) d3_prep_c**
UZ: Moliya bo'limidan so'rash: kompaniyalarga qancha chegirma bersa bo'ladi?
RU: Спросить у финансистов: какую скидку можно дать компании?
→ leads to: d3_anvar_check
Effects: +8 opportunity, set_flag: has_discount_authority

---

### [d3_anvar_check] — condition_branch
- **If** flag: researched_company → d3_anvar_info
- **Fallback** → d3_abdullaev_arrives

---

### [d3_anvar_info] Anvar (eager) — dialogue
**Background:** bg_manager_office

**UZ:** Bitta narsa topdim — o'tgan yili 12 ta Cobalt olgan ekan. Park yangilashni rejalashtirgan bo'lishi mumkin.
**RU:** Кое-что нашёл — в прошлом году они купили 12 Cobalt. Возможно, планируют обновление парка.

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

---

# ═══ SCHOOL CTA ENDINGS ═══

---

## ── GRANDMASTER ENDING ──

### [d3_end_grandmaster] — score
**Effects:** +500 XP, gain_life, unlock_achievement: grandmaster, set_flag: d3_grandmaster

→ next: d3_gm_sardor1

---

### [d3_gm_sardor1] Sardor (impressed) — dialogue
**Background:** bg_showroom

**UZ:** Yaxshi ishladingiz. Ko'pchilik shu darajaga ancha keyin chiqadi.
**RU:** Хорошо отработали. Большинство выходят на этот уровень значительно позже.

→ next: d3_gm_sardor2

---

### [d3_gm_sardor2] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Lekin bitta kunlik yaxshi ish hali yetarli emas. Natija har kuni takrorlanishi kerak.
**RU:** Но один сильный день ещё ничего не гарантирует. Настоящий уровень начинается там, где результат повторяется каждый день.

→ next: d3_gm_sardor3

---

### [d3_gm_sardor3] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Men ko'p sotuvchilarni ko'rganman. O'sganlar — eng iste'dodlilar emas, tizimli mashq qilganlar.
**RU:** Я видел много продавцов. Растут не самые талантливые, а те, кто тренируются системно.

→ next: d3_gm_sardor4

---

### [d3_gm_sardor4] Sardor (satisfied) — dialogue
**Background:** bg_showroom

**UZ:** Agar davom etmoqchi bo'lsangiz — tizim, mashq va ustoz kerak. Bu narsalarni beradigan dastur bor.
**RU:** Если хотите продолжить — нужна система, практика и наставник. Есть программа, которая даёт именно это.

→ next: d3_gm_dilnoza

---

### [d3_gm_dilnoza] Dilnoza (proud) — dialogue
**Background:** bg_showroom

**UZ:** Men o'sha yerda o'qiganman. Birinchi yiliyoq maoshim 3 barobar oshdi.
**RU:** Я окончила эту программу. Зарплата выросла в 3 раза за первый год.

→ next: d3_gm_rustam

---

### [d3_gm_rustam] Rustam (proud) — dialogue
**Background:** bg_showroom

**UZ:** Men eng yaxshi odamlarimni o'sha yerga yuboraman. Haqiqiy tizim.
**RU:** Я отправляю туда лучших. Это настоящая система.

→ next: d3_gm_school

---

### [d3_gm_school] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Tizimli o'qiganlar tezroq o'sadi. 3 oy ichida amaliy darajaga chiqish mumkin — yangi boshlovchilar ham, tajribalilar ham.
**RU:** Те, кто учатся системно, растут быстрее. За 3 месяца можно выйти на рабочий уровень — и новички, и опытные.

→ next: d3_gm_cta

---

### [d3_gm_cta] — end (hidden_ending)

**Sardor (impressed):**
**Characters:** Rustam (proud, left), Sardor (impressed, center), Dilnoza (smirk, right)

**UZ:** Sizda kerakli narsa borligini isbotladingiz. Keyingi qadam: buni har kuni izchil qilishni o'rganing. Bu haqiqiy karyeraning boshlanishi.
**RU:** Вы доказали, что у вас есть всё необходимое. Следующий шаг: научиться делать это стабильно, каждый день. Это начало настоящей карьеры.

---

## ── SUCCESS ENDING ──

### [d3_end_success] — score
**Effects:** +160 XP, unlock_achievement: final_test_passed, set_flag: d3_success

→ next: d3_s_sardor1

---

### [d3_s_sardor1] Sardor (satisfied) — dialogue
**Background:** bg_showroom

**UZ:** Yaxshi natija. Siz intuitsiyaga ishlaysiz — bu yaxshi.
**RU:** Хороший результат. Вы работаете на интуиции — это хорошо.

→ next: d3_s_sardor2

---

### [d3_s_sardor2] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Sizda sezgi bor. Endi unga tayanch kerak: tizim, mashq va to'g'ri tahlil.
**RU:** Чутьё у вас есть. Теперь ему нужна опора: система, практика и разбор собственных ошибок.

→ next: d3_s_school

---

### [d3_s_school] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Aynan shuni o'rgatadigan dastur bor. 3 oy, shaxsiy mentor, amaliy mashqlar.
**RU:** Есть программа, которая учит именно этому. 3 месяца, личный ментор, реальная практика.

→ next: d3_s_cta

---

### [d3_s_cta] — end (success)

**Sardor (satisfied):**

**UZ:** Sizda asos bor. Professional dastur uni ko'paytiradi.
**RU:** У вас есть база. Профессиональная программа её умножит.

---

## ── PARTIAL ENDING ──

### [d3_end_partial] — score
**Effects:** +90 XP, set_flag: d3_partial

→ next: d3_p_sardor1

---

### [d3_p_sardor1] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Yomon emas. Potentsial bor, lekin hali to'liq ochilmagan.
**RU:** Неплохо. Потенциал есть, но он ещё не раскрыт полностью.

→ next: d3_p_sardor2

---

### [d3_p_sardor2] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Tajribali mentor va tizimli ta'lim — shu ikkitasini qo'shing, natija o'zgaradi.
**RU:** Опытный ментор и системное обучение — добавьте эти два, и результат изменится.

→ next: d3_p_school

---

### [d3_p_school] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Buni yolg'iz topish ham mumkin, lekin ustoz bilan yo'l ancha tez qisqaradi.
**RU:** До этого можно дойти и самому. Но с наставником и нормальной практикой путь становится короче в разы.

→ next: d3_p_cta

---

### [d3_p_cta] — end (partial)

**Sardor (satisfied):**

**UZ:** O'rganish istagi — bu allaqachon birinchi qadam.
**RU:** Желание учиться — это уже первый шаг.

---

## ── FAILURE ENDING ──

### [d3_end_fail] — score
**Effects:** +50 XP, lose_life, set_flag: d3_fail

→ next: d3_f_sardor1

---

### [d3_f_sardor1] Sardor (neutral_alt) — dialogue
**Background:** bg_showroom

**UZ:** Natija kuchsiz. Lekin bilasizmi nima? Ko'pchilik umuman sinab ko'rmaydi.
**RU:** Результат слабый. Но знаете что? Большинство людей даже не пытаются.

→ next: d3_f_sardor2

---

### [d3_f_sardor2] Sardor (neutral) — dialogue
**Background:** bg_showroom

**UZ:** Siz sinab ko'rdingiz. Demak, o'rganishga tayyorsiz.
**RU:** Вы попробовали. Значит, готовы учиться.

→ next: d3_f_school

---

### [d3_f_school] Narrator — dialogue
**Background:** bg_showroom

**UZ:** Sotish — bu ko'nikma. Har qanday ko'nikma singari, uni o'rganish mumkin. Buni professional o'rgatadigan odamlar bor.
**RU:** Продажи — это навык. Как любой навык, ему можно научиться. Есть те, кто учит этому профессионально.

→ next: d3_f_cta

---

### [d3_f_cta] — end (failure)

**Sardor (satisfied):**

**UZ:** Boshlash uchun super bo'lish shart emas. To'g'ri joyda, to'g'ri tartibda o'rganish muhim.
**RU:** Чтобы начать, не нужно быть "талантом". Важнее попасть в правильную среду и учиться в правильном порядке.

---
---

# Node Count Summary

| Day | Total Nodes |
|-----|-------------|
| Day 1 | 35 nodes |
| Day 2 | 27 nodes |
| Day 3 | 45 nodes |
| **Total** | **107 nodes** |
