'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import ExportCsvButton from '@/components/admin/ExportCsvButton';
import RatingBadge from '@/components/admin/RatingBadge';
import { fetchLeaderboard, type LeaderboardItem, type LeaderboardPeriod, type LeaderboardSort } from '@/lib/admin/api';
import { LeaderboardTabs } from '@/components/admin/leaderboard/LeaderboardTabs';
import { SortSelector } from '@/components/admin/leaderboard/SortSelector';

const PERIODS: LeaderboardPeriod[] = ['week', 'month', 'all'];
const SORTS: LeaderboardSort[] = ['total_score', 'completion_time', 's_rating_count'];
const SIZES = [10, 25, 50, 100] as const;
const REFRESH_MS = 30_000;

function toPeriod(raw: string | null): LeaderboardPeriod {
  return PERIODS.includes(raw as LeaderboardPeriod) ? (raw as LeaderboardPeriod) : 'all';
}
function toSort(raw: string | null): LeaderboardSort {
  return SORTS.includes(raw as LeaderboardSort) ? (raw as LeaderboardSort) : 'total_score';
}

export default function LeaderboardClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const [period, setPeriodState] = useState<LeaderboardPeriod>(() => toPeriod(sp.get('period')));
  const [sort, setSortState] = useState<LeaderboardSort>(() => toSort(sp.get('sort')));
  const [limit, setLimit] = useState<number>(() => Number(sp.get('limit')) || 50);
  const [offset, setOffset] = useState<number>(() => Number(sp.get('offset')) || 0);
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function updateUrl(next: { period?: LeaderboardPeriod; sort?: LeaderboardSort; limit?: number; offset?: number }) {
    const u = new URLSearchParams(sp.toString());
    if (next.period !== undefined) u.set('period', next.period);
    if (next.sort !== undefined) u.set('sort', next.sort);
    if (next.limit !== undefined) u.set('limit', String(next.limit));
    if (next.offset !== undefined) u.set('offset', String(next.offset));
    router.replace(`?${u.toString()}`, { scroll: false });
  }

  function setPeriod(p: LeaderboardPeriod) { setPeriodState(p); setOffset(0); updateUrl({ period: p, offset: 0 }); }
  function setSort(s: LeaderboardSort) { setSortState(s); setOffset(0); updateUrl({ sort: s, offset: 0 }); }
  function setSize(n: number) { setLimit(n); setOffset(0); updateUrl({ limit: n, offset: 0 }); }
  function goPage(newOffset: number) { setOffset(newOffset); updateUrl({ offset: newOffset }); }

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchLeaderboard({ period, sort, limit, offset })
        .then(res => { if (!cancelled) { setRows(res.items); setTotal(res.total); setLoading(false); } })
        .catch(err => { if (!cancelled) { console.error('[Leaderboard] fetch', err); setLoading(false); } });
    }
    setLoading(true);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [period, sort, limit, offset]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);
  const leader = rows[0];
  const totalCompletions = rows.reduce((a, r) => a + r.scenarios_completed, 0);
  const totalSRatings = rows.reduce((a, r) => a + r.s_rating_count, 0);
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <PageHeader
        title="Таблица лидеров"
        subtitle={`Топ игроков · обновляется каждые ${REFRESH_MS / 1000} сек · всего ${total.toLocaleString('ru-RU')}`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <LeaderboardTabs value={period} onChange={setPeriod} />
            <SortSelector value={sort} onChange={setSort} />
            <ExportCsvButton type="leaderboard" params={{ period, sort, limit: String(limit), offset: String(offset) }} />
          </div>
        }
      />

      <div className="admin-kpi-row">
        <KpiCard label="Лидер" value={leader ? leader.display_name : '—'} hint={leader ? `${leader.total_score.toLocaleString('ru-RU')} очков` : undefined} accent="orange" />
        <KpiCard label="Всего прохождений" value={totalCompletions.toLocaleString('ru-RU')} accent="green" hint="на этой странице" />
        <KpiCard label="S-рейтингов" value={totalSRatings.toLocaleString('ru-RU')} accent="violet" hint="лучших прохождений" />
      </div>

      {top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
          {top3.map((p, i) => (
            <div key={p.player_id} className="admin-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: ['#f59e0b', '#94a3b8', '#d97706'][i] }}>#{i + 1}</div>
              <Link href={`/admin/player/${p.player_id}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', display: 'block', marginTop: 6 }}>
                {p.display_name}
              </Link>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 4 }}>
                {p.total_score.toLocaleString('ru-RU')} очков · {p.scenarios_completed} прох-й
              </div>
              {p.best_rating && (
                <div style={{ marginTop: 8 }}><RatingBadge rating={p.best_rating} /></div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="admin-card" style={{ padding: 16, marginTop: 16 }}>
        {loading ? (
          <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Загружаем…</div>
        ) : rest.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных за период</div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <th style={{ textAlign: 'left',  padding: '8px 6px', color: 'var(--admin-text-muted)' }}>#</th>
                <th style={{ textAlign: 'left',  padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Игрок</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Очки</th>
                <th style={{ textAlign: 'center',padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Лучший</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>S</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)' }}>Прох-я</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((r, i) => (
                <tr key={r.player_id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '6px', color: 'var(--admin-text-muted)' }}>{offset + i + 4}</td>
                  <td style={{ padding: '6px' }}>
                    <Link href={`/admin/player/${r.player_id}`} style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                      {r.display_name}
                    </Link>
                  </td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>{r.total_score.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{r.best_rating ? <RatingBadge rating={r.best_rating} /> : '—'}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{r.s_rating_count}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{r.scenarios_completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--admin-text-muted)' }}>Показывать</span>
            <select value={limit} onChange={e => setSize(Number(e.target.value))} style={{
              padding: '4px 8px', fontSize: 11, border: '1px solid var(--admin-border)', borderRadius: 6,
              background: 'var(--admin-bg-2)', color: 'var(--admin-text)',
            }}>
              {SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button disabled={offset === 0} onClick={() => goPage(Math.max(0, offset - limit))} className="admin-btn">«</button>
            <span style={{ padding: '4px 10px' }}>{currentPage} / {pageCount}</span>
            <button disabled={offset + limit >= total} onClick={() => goPage(offset + limit)} className="admin-btn">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
