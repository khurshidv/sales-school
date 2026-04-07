import type { Scenario } from '@/game/engine/types';
import { carDealershipScenario } from './car-dealership';

export const SCENARIOS: Record<string, Scenario> = {
  'car-dealership': carDealershipScenario,
};

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}
