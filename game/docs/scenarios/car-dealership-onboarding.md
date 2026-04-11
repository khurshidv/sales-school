# Chevrolet Avtosalon — Onboarding / Регистрация

> Onboarding — bu o'yin boshlanishidagi Rustam bilan ro'yxatdan o'tish jarayoni. React komponenti: `OnboardingSequence.tsx`. Ma'lumot fayli: `game/data/onboarding/onboardingScript.ts`.

---

### [welcome] Rustam (friendly) — dialogue
**Background:** bg_showroom_entrance
**Type:** dialogue

**UZ:** Salom! SalesUp'ga xush kelibsiz! Men Rustam — bu avtosalonning menejeri. Sizni yangi xodim sifatida ko'rib turganimdan xursandman!
**RU:** Привет! Добро пожаловать в SalesUp! Я Рустам — менеджер этого автосалона. Рад видеть тебя в качестве нового сотрудника!

→ next: lang_select

---

### [lang_select] Rustam (friendly) — lang_select
**Background:** bg_showroom_entrance
**Type:** lang_select (UI: UZ / RU tanlash tugmalari)

**UZ:** Avval tilni tanlang — qaysi tilda gaplashamiz?
**RU:** Сначала выберите язык — на каком языке будем общаться?

→ next: ask_name

---

### [ask_name] Rustam (friendly) — dialogue
**Background:** bg_showroom
**Type:** dialogue

**UZ:** Ajoyib! Endi tanishaylik — ismingiz nima?
**RU:** Отлично! Давайте познакомимся — как вас зовут?

→ next: name_input

---

### [name_input] Rustam (friendly) — name_input
**Background:** bg_showroom
**Type:** name_input (UI: matn kiritish maydoni)

**UZ:** Ismingizni kiriting:
**RU:** Введите ваше имя:

> Placeholder UZ: "Ismingiz" | Placeholder RU: "Ваше имя"

→ next: phone_input

---

### [phone_input] Rustam (friendly) — phone_input
**Background:** bg_showroom
**Type:** phone_input (UI: telefon raqami kiritish)

**UZ:** {name}, telefon raqamingizni qoldiring — shunda biz siz bilan bog'lana olamiz.
**RU:** {name}, оставьте ваш номер телефона — так мы сможем с вами связаться.

> Placeholder: "XX XXX-XX-XX"

→ next: pre_avatar

---

### [pre_avatar] Rustam (proud) — dialogue
**Background:** bg_showroom
**Type:** dialogue

**UZ:** Zo'r, {name}! Endi o'z avataringizni tanlang — saloningizda qanday ko'rinishda bo'lasiz?
**RU:** Отлично, {name}! Теперь выберите свой аватар — как вы будете выглядеть в салоне?

→ next: character_select

---

### [character_select] — character_select
**Background:** bg_showroom
**Type:** character_select (UI: avatar tanlash ekrani, Rustam ko'rinmaydi)

**UZ:** O'z avataringizni tanlang
**RU:** Выберите свой аватар

→ **Onboarding tugaydi. O'yin boshlanadi: Den' 1**
