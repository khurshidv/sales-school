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
      uz: 'Bu — oddiy bitim emas edi',
      ru: 'Это была не просто сделка',
    },
    body: {
      uz: 'Javlon va Nilufar salondan chiqib ketishganda, qo\'llarida faqat kalit emas — bir-biriga yaqinlashgan bir juftlik edi. Siz ularga Equinoxni sotmadingiz, balki ularning ichki dialogini eshitdingiz va yubileylariga sovg\'a qilib berdingiz.\n\nBu — eng yuqori darajadagi sotuv: mijoz sizdan mahsulotni emas, g\'amxo\'rlikni sotib oladi. Shuning uchun ular qaytib kelishadi, boshqalarni ham olib kelishadi.',
      ru: 'Когда Жавлон и Нилуфар выходили из салона, в руках у них был не просто ключ — из салона уходила пара, которая стала ближе друг к другу. Вы не продали им Equinox. Вы услышали их внутренний диалог и подарили им годовщину.\n\nЭто продажа высшего уровня: клиент покупает у вас не товар, а заботу. Поэтому они вернутся — и приведут с собой других.',
    },
    insight: {
      uz: 'Bunday natija bir marta ro\'y bermaydi — unga qanday yetib kelganingizni tushunsangiz, uni har doim takrorlay olasiz.',
      ru: 'Такой результат не бывает случайностью — когда вы понимаете, как к нему пришли, вы сможете повторять его снова и снова.',
    },
  },
  success: {
    title: {
      uz: 'Yaxshi kun. Lekin eng yuqori emas',
      ru: 'Хороший день. Но не предел',
    },
    body: {
      uz: 'Siz juftlikni eshitdingiz, mashinani tushuntirdingiz, ularni bir qarorga yaqinlashtirdingiz. Ular ketishdi — bu yaxshi. Lekin siz bugun bir narsani sezmadingiz: ularning orasidagi kichik bir tafsilot bor edi, u bitimni bitimdan ko\'ra chuqurroq narsaga aylantirishi mumkin edi.\n\nSotuv bo\'ldi, lekin "vau" bo\'lmadi. Va aynan "vau" — mijozni qaytarib keltiradigan narsa.',
      ru: 'Вы выслушали пару, показали машину, подвели их к решению. Они ушли — это хорошо. Но вы сегодня не заметили одной маленькой детали, которая могла превратить сделку во что-то большее.\n\nПродажа состоялась, но "вау" не случилось. А именно "вау" возвращает клиента.',
    },
    insight: {
      uz: 'Yaxshi sotuvchi va ajoyib sotuvchi o\'rtasidagi farq — mijozning gaplari orasidagi bo\'sh joylarni eshita olishdir.',
      ru: 'Разница между хорошим и великим продавцом — в умении слышать то, что клиент говорит между словами.',
    },
  },
  partial: {
    title: {
      uz: 'Qaror ochiq qoldi',
      ru: 'Решение осталось открытым',
    },
    body: {
      uz: "Siz asosiy qismini to'g'ri qildingiz: juftlikning ikkalasini eshitdingiz, mashinani ko'rsatdingiz. Lekin yopish qismida siz mijozning qarorini kelajakka surdingiz — \"uyda o'ylab ko'ring\" yoki \"keyin almashtirasiz\" tipidagi taklif bilan.\n\nRealda bunday mijozlar uyga ketgach, fikr aynan o'sha \"keyin\"ga aylanadi. Uydagi stol atrofida sotuv aynan shu lahzada yo'qoladi.",
      ru: 'Основное вы сделали правильно: выслушали обоих в паре, показали машину. Но на закрытии вы отодвинули решение клиента в будущее — «подумайте дома» или «потом обменяете».\n\nВ реальности такие клиенты уезжают думать, и за кухонным столом это самое «потом» превращается в «нет». Продажа теряется именно здесь.',
    },
    insight: {
      uz: "Yopish — bu mijozni shoshirish emas, balki uni aynan hozir aniq qadam qo'yishga yordam berishdir.",
      ru: 'Закрытие — это не спешка, а помощь клиенту сделать конкретный шаг именно сейчас, пока он ещё в контексте.',
    },
  },
  failure: {
    title: {
      uz: 'Sotuv bo\'lmadi',
      ru: 'Продажи не было',
    },
    body: {
      uz: 'Juftlik qo\'llari bo\'sh chiqib ketdi. Real bozorda bunday mijozlar qaytmaydi — ular uyda gaplashib, boshqa salonga borishadi. Bugungi kun usulga oid kamida bitta jiddiy xato bilan o\'tdi — quyida aynan qaysilari ekanligini ko\'rishingiz mumkin.\n\nBu — sotuvchining birinchi imtihoni. Asosiysi — xatolarni yashirmaslik, ularni aniq ko\'rish va keyingi safar boshqacha qilish.',
      ru: 'Пара вышла с пустыми руками. В реальности такие клиенты не возвращаются — они обсудят дома и поедут в другой салон. Сегодня в продаже сорвались не мелочи, а как минимум одна методическая ошибка — ниже вы увидите, какая именно.\n\nЭто первый экзамен продавца. Главное — не прятать ошибки, а увидеть их конкретно и в следующий раз сделать иначе.',
    },
    insight: {
      uz: 'Har bir "yo\'q" — bu "nima uchun" degan savoldir. Javobni topa olganlar kuchli sotuvchilarga aylanishadi.',
      ru: 'Каждое «нет» — это вопрос «почему». Те, кто находит ответ, становятся сильными продавцами.',
    },
  },
};
