'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import ExportCsvButton from '@/components/admin/ExportCsvButton';
import RatingBadge from '@/components/admin/RatingBadge';
import { fetchParticipants } from '@/lib/admin/api';
import type { EnrichedPlayer } from '@/lib/admin/types-v2';

const RATINGS = ['S', 'A', 'B', 'C', 'F'] as const;

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} д назад`;
}

export default function ParticipantsClient() {
  const [players, setPlayers] = useState<EnrichedPlayer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalSa, setTotalSa] = useState(0);
  const [totalAnyDay, setTotalAnyDay] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchParticipants({ search: search || undefined, ratingFilter, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setPlayers(res.players);
        setTotal(res.total);
        setTotalSa(res.stats?.total_sa ?? 0);
        setTotalAnyDay(res.stats?.total_any_day ?? 0);
        setTotalConsultations(res.stats?.total_consultations ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[ParticipantsClient] fetchParticipants failed', err);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [search, ratingFilter]);

  return (
    <div>
      <PageHeader
        title="Participants"
        subtitle="Все игроки с фильтрами и быстрым переходом к индивидуальному пути."
        actions={<ExportCsvButton type="participants" />}
      />

      <div className="admin-kpi-row">
        <KpiCard label="Всего игроков" value={total.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard
          label="С оценкой S/A"
          value={totalSa.toLocaleString('ru-RU')}
          accent="green"
          hint="все игроки в БД"
        />
        <KpiCard
          label="Завершили ≥1 дня"
          value={totalAnyDay.toLocaleString('ru-RU')}
          accent="pink"
          hint="все игроки в БД"
        />
        <KpiCard
          label="Оставили заявку"
          value={totalConsultations.toLocaleString('ru-RU')}
          accent="orange"
          hint="попап после игры"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону…"
          className="admin-btn"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px' }}
        />
        <button
          onClick={() => setRatingFilter(null)}
          className={ratingFilter === null ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        >
          Все
        </button>
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() => setRatingFilter(r)}
            className={ratingFilter === r ? 'admin-btn admin-btn-primary' : 'admin-btn'}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
        ) : players.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Игроки не найдены.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: '#fafaff' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Имя</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Телефон</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Очки</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Дней</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Заявка</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>UTM</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Активность</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <Link href={`/admin/player/${p.id}`} style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {p.display_name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace' }}>
                    <a href={`https://wa.me/${p.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {p.phone}
                    </a>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><RatingBadge rating={p.best_rating} size="sm" /></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{p.total_score.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{p.days_completed}/3</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {p.submitted_consultation ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 8px',
                        background: '#dcfce7', color: '#166534',
                        borderRadius: 999, fontSize: 10, fontWeight: 700,
                      }}>✓ есть</span>
                    ) : (
                      <span style={{ color: 'var(--admin-text-dim)', fontSize: 10 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>
                    {p.utm_source ?? '(прямой)'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>{formatRelative(p.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
