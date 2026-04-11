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
      uz: 'Siz bittasini eshitdingiz. Ikkinchisi sizdan uzoqlashdi',
      ru: 'Вы услышали одного. Второй остался в стороне',
    },
    body: {
      uz: 'Qaror birgalikda qabul qilinadi. Lekin siz suhbatni bir tomonga og\'dirib yubordingiz — ehtimol, "asosiy qaror qabul qiluvchi" deb o\'ylaganingiz uchun. Natijada ikkinchi odamda "meni e\'tiborga olishmadi" degan his qoldi.\n\nShu his — eng xavfli narsa: u bitimni qabul qilishdan emas, uydagi suhbatlarda qaytadan paydo bo\'ladi. Va ko\'pincha uyda mashinani qaytarish haqida qaror chiqadi.',
      ru: 'Решения в паре принимаются вдвоём. Но вы увели разговор в одну сторону — возможно, потому что решили, что "главный" именно этот. В результате у второго остался осадок: "меня не услышали".\n\nЭтот осадок — самое опасное. Он срабатывает не в момент сделки, а дома, в разговорах на кухне. И часто именно на кухне принимается решение вернуть машину.',
    },
    insight: {
      uz: 'Juftlikka sotish — bu ikkita alohida sotuv emas. Bu — ikki odamni bitta qarorga olib kelish sanatidir.',
      ru: 'Продажа паре — это не две отдельные продажи. Это искусство привести двух людей к одному решению.',
    },
  },
  failure: {
    title: {
      uz: 'Bitim bo\'lmadi. Lekin bu — boshlanish',
      ru: 'Сделка не состоялась. Но это — начало',
    },
    body: {
      uz: 'Juftlik salonni tark etdi, qo\'llari bo\'sh. Siz ularga mashinani ko\'rsatdingiz, lekin ularni bir-biriga ko\'rsatolmadingiz. Ular kelganlaridan ko\'ra bir-biriga uzoqroq holda ketishdi.\n\nBu — har bir sotuvchining birinchi darsi: odam mahsulot uchun kelmaydi, o\'z hayotidagi masalani hal qilish uchun keladi. Masalani ko\'rmaganingizda, mahsulot ham foydasiz bo\'lib qoladi.',
      ru: 'Пара вышла из салона с пустыми руками. Вы показали им машину, но не смогли показать их друг другу. Они ушли, став дальше друг от друга, чем пришли.\n\nЭто первый урок любого продавца: человек приходит не за товаром, а чтобы решить задачу в своей жизни. Если вы не видите задачу — товар бесполезен.',
    },
    insight: {
      uz: 'Har bir "yo\'q" — bu "nima uchun" degan savoldir. Javobni topa olganlar kuchli sotuvchilarga aylanishadi.',
      ru: 'Каждое "нет" — это вопрос "почему". Те, кто находит ответ, становятся сильными продавцами.',
    },
  },
};
