'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/admin/KpiCard';
import { fetchRevenue, type RevenueData } from '@/lib/admin/api';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

export function RevenueKpiCard({ periodState }: { periodState: PeriodParamState }) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRevenue({
      period: periodState.period,
      from: periodState.from,
      to: periodState.to,
    })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setData(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [periodState.period, periodState.from, periodState.to]);

  if (loading) {
    return <KpiCard label="Выручка" value="…" accent="green" />;
  }
  if (!data || data.error) {
    return (
      <KpiCard
        label="Выручка"
        value="—"
        hint={data?.error === 'bitrix_unavailable' ? 'Bitrix недоступен' : 'нет данных'}
        accent="green"
      />
    );
  }
  return (
    <KpiCard
      label="Выручка"
      value={`${data.total.toLocaleString('ru-RU')} ${data.currency}`}
      hint={`${data.deals} закрытых сделок`}
      accent="green"
    />
  );
}
