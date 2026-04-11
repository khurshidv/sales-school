# Den' 2: Talabchan mijoz / Требовательный клиент

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
