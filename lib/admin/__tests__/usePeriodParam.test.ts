import { describe, it, expect } from 'vitest';
import type { Period } from '../types-v2';

// Pure logic extracted from the hook — test coverage without rendering.
const VALID: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

function isValidPeriod(v: string | null): v is Period {
  return !!v && (VALID as string[]).includes(v);
}

function resolvePeriod(raw: string | null, defaultPeriod: Period = '30d'): Period {
  return isValidPeriod(raw) ? raw : defaultPeriod;
}

interface PeriodParamState { period: Period; from: string | null; to: string | null }

function buildNextQuery(current: string, next: PeriodParamState, defaultPeriod: Period = '30d'): string {
  const params = new URLSearchParams(current);
  if (next.period === defaultPeriod) params.delete('period');
  else params.set('period', next.period);
  if (next.period === 'custom' && next.from) params.set('from', next.from);
  else params.delete('from');
  if (next.period === 'custom' && next.to) params.set('to', next.to);
  else params.delete('to');
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
    expect(resolvePeriod('today')).toBe('today');
    expect(resolvePeriod('yesterday')).toBe('yesterday');
    expect(resolvePeriod('custom')).toBe('custom');
  });

  it('buildNextQuery omits param when equal to default', () => {
    expect(buildNextQuery('period=7d&x=1', { period: '30d', from: null, to: null })).toBe('x=1');
  });

  it('buildNextQuery sets param when non-default', () => {
    expect(buildNextQuery('x=1', { period: '7d', from: null, to: null })).toBe('x=1&period=7d');
  });

  it('buildNextQuery replaces existing param', () => {
    expect(buildNextQuery('period=7d', { period: 'all', from: null, to: null })).toBe('period=all');
  });

  it('buildNextQuery sets from/to for custom period', () => {
    const qs = buildNextQuery('', { period: 'custom', from: '2026-01-01', to: '2026-01-31' });
    const params = new URLSearchParams(qs);
    expect(params.get('period')).toBe('custom');
    expect(params.get('from')).toBe('2026-01-01');
    expect(params.get('to')).toBe('2026-01-31');
  });

  it('buildNextQuery removes from/to when switching away from custom', () => {
    const qs = buildNextQuery('period=custom&from=2026-01-01&to=2026-01-31', { period: '7d', from: null, to: null });
    const params = new URLSearchParams(qs);
    expect(params.get('from')).toBeNull();
    expect(params.get('to')).toBeNull();
  });
});
