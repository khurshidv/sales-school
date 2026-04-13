import type { Scenario, Day } from '@/game/engine/types';
import { carDealershipScenario, loadDay as loadCarDay } from './car-dealership/scenario';

export const SCENARIOS: Record<string, Scenario> = {
  'car-dealership': carDealershipScenario,
};

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}

/**
 * Ensure a day's data is loaded and ready. For Day 1 this is instant;
 * Days 2-3 use dynamic import() which creates separate webpack chunks,
 * loaded on demand and cached. The `loadDay()` dynamic import is the
 * mechanism that actually triggers code splitting — even though
 * `scenario.days[]` has all 3 days statically available, calling
 * `ensureDay()` before transitioning ensures the chunk is warm.
 */
export async function ensureDay(
  scenarioId: string,
  dayIndex: number,
): Promise<Day | undefined> {
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) return undefined;

  // Pre-warm the dynamic import chunk (no-op for Day 1)
  if (scenarioId === 'car-dealership') {
    await loadCarDay(dayIndex);
  }

  return scenario.days[dayIndex];
}
