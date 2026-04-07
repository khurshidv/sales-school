import type { Language } from '@/game/engine/types';

const strings = {
  tap_to_continue: { uz: 'Davom etish uchun bosing', ru: 'Нажмите чтобы продолжить' },
  day: { uz: 'Kun', ru: 'День' },
  next_day: { uz: 'Keyingi kun', ru: 'Следующий день' },
  replay_day: { uz: "Kunni qayta o'ynash", ru: 'Переиграть день' },
  show_results: { uz: 'Natijalarni ko\'rsatish', ru: 'Показать итоги' },
  game_over: { uz: 'Barcha hayotlar tugadi!', ru: 'Все жизни потеряны!' },
  restart_day: { uz: 'Kunni qayta boshlash', ru: 'Начать день заново' },
  exit_menu: { uz: 'Menyuga chiqish', ru: 'Выйти в меню' },
  pause: { uz: 'Pauza', ru: 'Пауза' },
  resume: { uz: 'Davom etish', ru: 'Продолжить' },
  exit_confirm: { uz: 'Kun jarayoni yo\'qoladi', ru: 'Прогресс дня будет потерян' },
  selected: { uz: 'Tanlandi', ru: 'Выбрано' },
  confirm: { uz: 'Tasdiqlash', ru: 'Подтвердить' },
  play: { uz: "O'ynash", ru: 'Играть' },
  start: { uz: 'Boshlash', ru: 'Начать' },
  loading: { uz: 'Yuklanmoqda...', ru: 'Загрузка...' },
  rotate_device: { uz: 'Telefoningizni gorizontal holga o\'tkazing', ru: 'Поверните телефон горизонтально' },
  strong_skill: { uz: 'Kuchli tomon', ru: 'Сильная сторона' },
  weak_skill: { uz: "O'sish zonasi", ru: 'Зона роста' },
  near_miss: { uz: 'Yana {points} ball — {rating} reytingi!', ru: 'Ещё {points} очков до рейтинга {rating}!' },
  coin_cost: { uz: '🪙 {cost}', ru: '🪙 {cost}' },
  level: { uz: 'Daraja', ru: 'Уровень' },
  coming_soon: { uz: 'Tez kunda', ru: 'Скоро' },
  open: { uz: 'Ochiq', ru: 'ОТКРЫТ' },
} as const;

type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Language, params?: Record<string, string | number>): string {
  let text: string = strings[key][lang];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
