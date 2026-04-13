import type { Scenario, Day } from '@/game/engine/types';
import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';

// Day data is statically imported for type safety and test compatibility.
// Next.js tree-shakes unused days from route chunks automatically since
// each day file is only referenced from this barrel. The real code-splitting
// win comes from ensureDay() in scenarios/index.ts using dynamic import()
// for Days 2-3 when they are actually needed at runtime.

/** Load a day by index on demand (for lazy preloading). */
export async function loadDay(dayIndex: number): Promise<Day | undefined> {
  switch (dayIndex) {
    case 0: return day1;
    case 1: return (await import(/* webpackChunkName: "scenario-day2" */ './day2')).day2;
    case 2: return (await import(/* webpackChunkName: "scenario-day3" */ './day3')).day3;
    default: return undefined;
  }
}

export const carDealershipScenario: Scenario = {
  id: 'car-dealership',
  productId: 'chevrolet',
  title: { uz: 'Chevrolet Avtosalon', ru: 'Chevrolet Автосалон' },
  description: {
    uz: "Toshkentdagi Chevrolet salonida 3 kunlik stajirovka. Har kuni yangi mijoz, yangi sinov.",
    ru: 'Стажировка в Chevrolet-салоне Ташкента. 3 дня, каждый день — новый клиент, новый вызов.',
  },
  days: [day1, day2, day3],
  requiredLevel: 1,
};
