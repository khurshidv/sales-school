import type { Scenario } from '@/game/engine/types';
import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';
import { day4 } from './day4';
import { day5 } from './day5';

export const carDealershipScenario: Scenario = {
  id: 'car-dealership',
  productId: 'chevrolet',
  title: { uz: 'Chevrolet Avtosalon', ru: 'Chevrolet Автосалон' },
  description: {
    uz: "Toshkentdagi Chevrolet salonida 5 kunlik stajirovka. Har kuni yangi mijoz, yangi sinov.",
    ru: 'Стажировка в Chevrolet-салоне Ташкента. 5 дней, каждый день — новый клиент, новый вызов.',
  },
  days: [day1, day2, day3, day4, day5],
  requiredLevel: 1,
};
