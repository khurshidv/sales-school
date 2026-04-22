'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Period } from './types-v2';

const VALID: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

function isValidPeriod(v: string | null): v is Period {
  return !!v && (VALID as string[]).includes(v);
}

export interface PeriodParamState {
  period: Period;
  from: string | null;    // YYYY-MM-DD, only meaningful when period === 'custom'
  to: string | null;
}

export type SetPeriodParam = (next: PeriodParamState) => void;

/**
 * Read/write `?period=...&from=...&to=...` in the URL so admin views are shareable.
 *
 * Replaces local `useState<Period>('30d')` in admin client components.
 * Default is '30d' when the param is missing or invalid.
 *
 * Usage:
 *   const [{ period, from, to }, setPeriod] = usePeriodParam();
 *   // setPeriod({ period: '7d', from: null, to: null })
 *   // setPeriod({ period: 'custom', from: '2026-01-01', to: '2026-01-31' })
 */
export function usePeriodParam(defaultPeriod: Period = '30d'): [PeriodParamState, SetPeriodParam] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: PeriodParamState = useMemo(() => {
    const raw = searchParams.get('period');
    const period: Period = isValidPeriod(raw) ? raw : defaultPeriod;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return { period, from, to };
  }, [searchParams, defaultPeriod]);

  const setPeriod = useCallback(
    (next: PeriodParamState) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.period === defaultPeriod) {
        params.delete('period');
      } else {
        params.set('period', next.period);
      }
      if (next.period === 'custom' && next.from) {
        params.set('from', next.from);
      } else {
        params.delete('from');
      }
      if (next.period === 'custom' && next.to) {
        params.set('to', next.to);
      } else {
        params.delete('to');
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams, defaultPeriod],
  );

  return [state, setPeriod];
}
