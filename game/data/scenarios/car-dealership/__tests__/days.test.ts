import { describe, it, expect } from 'vitest';
import { validateDay, validateScenario } from '@/game/engine/ScenarioValidator';
import { day1 } from '../day1';
import { day2 } from '../day2';
import { carDealershipScenario } from '../scenario';

describe('Scenario Days validation', () => {
  it('Day 1 passes validation with 0 errors', () => {
    const result = validateDay(day1);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Day 1 has correct targetScore', () => {
    expect(day1.targetScore).toBe(30);
  });

  it('Day 2 passes validation with 0 errors', () => {
    const result = validateDay(day2);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Day 2 has correct targetScore', () => {
    expect(day2.targetScore).toBe(40);
  });
});

describe('Full scenario validation', () => {
  it('Full car-dealership scenario passes validation with 0 errors', () => {
    const result = validateScenario(carDealershipScenario);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Scenario has exactly 5 days', () => {
    expect(carDealershipScenario.days).toHaveLength(5);
  });

  it('All days have non-empty uz and ru titles', () => {
    for (const day of carDealershipScenario.days) {
      expect(day.title.uz.length).toBeGreaterThan(0);
      expect(day.title.ru.length).toBeGreaterThan(0);
    }
  });
});
