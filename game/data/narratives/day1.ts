// ============================================================
// Day 1 Narratives — тексты для экрана DaySummary.
//
// Каждый из 4 исходов (hidden_ending / success / partial / failure)
// получает:
//  - title: короткая шапка-вывод по дню
//  - body: 2-4 предложения нарратива о том, как игрок провёл день
//  - insight: однострочный «что делать дальше» — прогрев к школе без
//    прямой ссылки (финальный CTA зашит в сюжет Day 3).
//
// Все тексты на uz + ru. Узбекский — источник, русский — перевод.
// ============================================================

import type { DayOutcome, LocalizedText } from '@/game/engine/types';

export interface DayNarrative {
  title: LocalizedText;
  body: LocalizedText;
  insight: LocalizedText;
}

export const day1Narratives: Record<DayOutcome, DayNarrative> = {
  hidden_ending: {
    title: {
      uz: 'Bu shunchaki kelishuv emas edi',
      ru: 'Это была не просто сделка',
    },
    body: {
      uz: 'Javlon va Nilufar salondan chiqayotganda qo‘llarida oddiy kalit emas, balki bir-biriga yanada yaqinlashgan juftlik kaliti bor edi. Siz ularga Equinoxni sotmagansiz. Ularning ichki muloqotini eshitib, yubileylarini nishonlashdi.\n\nBu eng yuqori darajadagi savdo: mijoz sizdan mahsulot emas, g‘amxo‘rlik sotib oladi. Shuning uchun ular qaytib keladi va o‘zlari bilan boshqalarni ham olib keladi.',
      ru: 'Когда Жавлон и Нилуфар выходили из салона, в руках у них был не просто ключ — из салона уходила пара, которая стала ближе друг к другу. Вы не продали им Equinox. Вы услышали их внутренний диалог и подарили им годовщину.\n\nЭто продажа высшего уровня: клиент покупает у вас не товар, а заботу. Поэтому они вернутся — и приведут с собой других.',
    },
    insight: {
      uz: 'Bunday natija tasodif bo‘lmaydi - unga qanday erishganingizni tushunganingizdan so‘ng, uni qayta-qayta takrorlay olasiz.',
      ru: 'Такой результат не бывает случайностью — когда вы понимаете, как к нему пришли, вы сможете повторять его снова и снова.',
    },
  },
  success: {
    title: {
      uz: 'Yaxshi kun. Lekin chegara emas',
      ru: 'Хороший день. Но не предел',
    },
    body: {
      uz: 'Er-xotinni eshitdingiz, mashinani ko‘rsatdingiz, ularni qaror qabul qilishga undadingiz. Ular ketishdi - bu yaxshi. Ammo bugun siz bitimni yanada kattaroq narsaga aylantirishi mumkin bo‘lgan kichik bir jihatga e’tibor bermadingiz.\n\nSotish amalga oshdi, ammo "vau" degan holat kuzatilmadi. Aniqrog‘i, "vau" so‘zi mijozni qaytaradi.',
      ru: 'Вы выслушали пару, показали машину, подвели их к решению. Они ушли — это хорошо. Но вы сегодня не заметили одной маленькой детали, которая могла превратить сделку во что-то большее.\n\nПродажа состоялась, но "вау" не случилось. А именно "вау" возвращает клиента.',
    },
    insight: {
      uz: 'Yaxshi sotuvchi bilan zo‘r sotuvchi o‘rtasidagi farq shundaki, u mijozning so‘zlari orasida nimalar borligini eshita oladi.',
      ru: 'Разница между хорошим и великим продавцом — в умении слышать то, что клиент говорит между словами.',
    },
  },
  partial: {
    title: {
      uz: 'Yechim ochiq qoldi',
      ru: 'Решение осталось открытым',
    },
    body: {
      uz: 'Asosiy ishni to‘g‘ri bajargansiz: juftlikda ikkalasini ham eshitdingiz, mashinani ko‘rsatdingiz. Ammo yopilish chog‘ida mijozning qarorini kelajakka qoldirdingiz - "uyda o‘ylab ko‘ring" yoki "keyin almashtirasiz".\n\nAslida bunday mijozlar o‘ylab ko‘rish uchun ketib qolishadi va oshxona stolida o‘sha "keyin" so‘zi "yo‘q"ga aylanadi. Savdo aynan shu yerda yo‘qoladi.',
      ru: 'Основное вы сделали правильно: выслушали обоих в паре, показали машину. Но на закрытии вы отодвинули решение клиента в будущее — «подумайте дома» или «потом обменяете».\n\nВ реальности такие клиенты уезжают думать, и за кухонным столом это самое «потом» превращается в «нет». Продажа теряется именно здесь.',
    },
    insight: {
      uz: "Yopish - bu shoshma-shosharlik emas, balki mijozga hozirning o‘zida, u hali kontekstda bo‘lgan paytda aniq bir qadam tashlashga yordam berishdir.",
      ru: 'Закрытие — это не спешка, а помощь клиенту сделать конкретный шаг именно сейчас, пока он ещё в контексте.',
    },
  },
  failure: {
    title: {
      uz: "Sotish yo'q edi",
      ru: 'Продажи не было',
    },
    body: {
      uz: 'Er-xotin quruq qo‘l bilan qaytib keldi. Aslida bunday mijozlar qaytib kelmaydi - ular masalani o‘z uylarida muhokama qilib, boshqa salonga borishadi. Bugungi savdoda mayda-chuyda narsalar emas, kamida bitta uslubiy xato yo‘l qo‘yilgan - quyida aynan qaysi xato ekanligini ko‘rasiz.\n\nBu sotuvchining birinchi imtihonidir. Asosiysi, xatolarni yashirmasdan, aniq ko‘rib, keyingi safar boshqacha yo‘l tutish.',
      ru: 'Пара вышла с пустыми руками. В реальности такие клиенты не возвращаются — они обсудят дома и поедут в другой салон. Сегодня в продаже сорвались не мелочи, а как минимум одна методическая ошибка — ниже вы увидите, какая именно.\n\nЭто первый экзамен продавца. Главное — не прятать ошибки, а увидеть их конкретно и в следующий раз сделать иначе.',
    },
    insight: {
      uz: 'Har bir "yo‘q" - bu "nega" degan savol. Javob topganlar kuchli sotuvchiga aylanadi.',
      ru: 'Каждое «нет» — это вопрос «почему». Те, кто находит ответ, становятся сильными продавцами.',
    },
  },
};
