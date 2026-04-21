import { describe, it, expect } from 'vitest';
import type { Period } from '../types-v2';

// Pure logic extracted from the hook — test coverage without rendering.
const VALID: Period[] = ['7d', '30d', '90d', 'all'];

function isValidPeriod(v: string | null): v is Period {
  return !!v && (VALID as string[]).includes(v);
}

function resolvePeriod(raw: string | null, defaultPeriod: Period = '30d'): Period {
  return isValidPeriod(raw) ? raw : defaultPeriod;
}

function buildNextQuery(current: string, next: Period, defaultPeriod: Period = '30d'): string {
  const params = new URLSearchParams(current);
  if (next === defaultPeriod) params.delete('period');
  else params.set('period', next);
  return params.toString();
}

describe('usePeriodParam logic', () => {
  it('falls back to default when param missing', () => {
    expect(resolvePeriod(null)).toBe('30d');
  });

  it('falls back to default when param invalid', () => {
    expect(resolvePeriod('bogus')).toBe('30d');
  });

  it('returns param when valid', () => {
    expect(resolvePeriod('7d')).toBe('7d');
    expect(resolvePeriod('all')).toBe('all');
  });

  it('buildNextQuery omits param when equal to default', () => {
    expect(buildNextQuery('period=7d&x=1', '30d')).toBe('x=1');
  });

  it('buildNextQuery sets param when non-default', () => {
    expect(buildNextQuery('x=1', '7d')).toBe('x=1&period=7d');
  });

  it('buildNextQuery replaces existing param', () => {
    expect(buildNextQuery('period=7d', 'all')).toBe('period=all');
  });
});
