import { describe, it, expect } from 'vitest';
import { validateDay, validateScenario } from '@/game/engine/ScenarioValidator';
import { day1 } from '../day1';
import { day2 } from '../day2';
import { day3 } from '../day3';
import { carDealershipScenario } from '../scenario';

describe('Scenario Days validation', () => {
  it('Day 1 passes validation with 0 errors', () => {
    const result = validateDay(day1);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Day 1 has correct targetScore', () => {
    // Поднят с 40 до 55 после введения DIMENSION_WEIGHTS в ScoringSystem
    // и добавления discovery-очков в три ключевые choice-ноды Day 1.
    expect(day1.targetScore).toBe(55);
  });

  it('Day 2 passes validation with 0 errors', () => {
    const result = validateDay(day2);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Day 2 has correct targetScore', () => {
    expect(day2.targetScore).toBe(45);
  });

  it('Day 3 passes validation with 0 errors', () => {
    const result = validateDay(day3);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Day 3 has correct targetScore', () => {
    expect(day3.targetScore).toBe(60);
  });
});

describe('Full scenario validation', () => {
  it('Full car-dealership scenario passes validation with 0 errors', () => {
    const result = validateScenario(carDealershipScenario);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('Scenario has exactly 3 days', () => {
    expect(carDealershipScenario.days).toHaveLength(3);
  });

  it('All days have non-empty uz and ru titles', () => {
    for (const day of carDealershipScenario.days) {
      expect(day.title.uz.length).toBeGreaterThan(0);
      expect(day.title.ru.length).toBeGreaterThan(0);
    }
  });
});
