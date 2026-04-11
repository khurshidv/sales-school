# Yakunlar / Заключение — School CTA Endings

> Bu bo'lim Den' 3 oxirida `d3_grandmaster_check` dan keyin boshlanadi.
> Manba: [car-dealership-day3.md](car-dealership-day3.md)

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

## Node Count Summary

| Qism / Часть | Noda soni |
|---|---|
| Onboarding | 7 steps |
| Day 1 | 35 nodes |
| Day 2 | 27 nodes |
| Day 3 | 45 nodes |
| **Jami / Итого** | **107 nodes** |
