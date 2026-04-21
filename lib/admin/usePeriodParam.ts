'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Period } from './types-v2';

const VALID: Period[] = ['7d', '30d', '90d', 'all'];

function isValidPeriod(v: string | null): v is Period {
  return !!v && (VALID as string[]).includes(v);
}

/**
 * Read/write `?period=...` in the URL so admin views are shareable.
 *
 * Replaces local `useState<Period>('30d')` in admin client components.
 * Default is '30d' when the param is missing or invalid.
 *
 * Usage:
 *   const [period, setPeriod] = usePeriodParam();
 */
export function usePeriodParam(defaultPeriod: Period = '30d'): [Period, (p: Period) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get('period');
  const period: Period = isValidPeriod(raw) ? raw : defaultPeriod;

  const setPeriod = useCallback(
    (next: Period) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === defaultPeriod) {
        params.delete('period');
      } else {
        params.set('period', next);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams, defaultPeriod],
  );

  return [period, setPeriod];
}
