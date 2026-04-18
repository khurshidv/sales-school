'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import ExportCsvButton from '@/components/admin/ExportCsvButton';
import RatingBadge from '@/components/admin/RatingBadge';
import MedalBadge from '@/components/admin/charts/MedalBadge';
import { getLeaderboardEnriched, type LeaderboardItem } from '@/lib/admin/queries-v2';

export default function LeaderboardClient() {
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLeaderboardEnriched(50).then((r) => {
      if (cancelled) return;
      setRows(r); setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const topScore = rows[0]?.total_score ?? 0;
  const totalCompletions = rows.reduce((acc, r) => acc + r.scenarios_completed, 0);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Топ игроков по очкам — обновляется в реальном времени."
        actions={<ExportCsvButton type="leaderboard" />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Игроков в топе" value={rows.length} accent="violet" />
        <KpiCard label="Лидер" value={topScore.toLocaleString('ru-RU') + ' очков'} accent="orange" />
        <KpiCard label="Всего прохождений" value={totalCompletions.toLocaleString('ru-RU')} accent="green" />
      </div>

      {top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {top3.map((r, i) => (
            <div key={r.player_id} className="admin-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <MedalBadge rank={i + 1} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>
                <Link href={`/admin/player/${r.player_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {r.display_name}
                </Link>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-accent)', marginBottom: 4 }}>
                {r.total_score.toLocaleString('ru-RU')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                Уровень {r.level} · {r.scenarios_completed} прохождений
              </div>
              <div style={{ marginTop: 8 }}>
                <RatingBadge rating={r.best_rating} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
        ) : rest.length === 0 && top3.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Лидерборд пуст — пока никто не играл.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: '#fafaff' }}>
                <th style={{ width: 60, textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Игрок</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Очки</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Уровень</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Прохожд.</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((r, i) => (
                <tr key={r.player_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <MedalBadge rank={i + 4} />
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <Link href={`/admin/player/${r.player_id}`} style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {r.display_name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <RatingBadge rating={r.best_rating} size="sm" />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{r.total_score.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.level}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.scenarios_completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
