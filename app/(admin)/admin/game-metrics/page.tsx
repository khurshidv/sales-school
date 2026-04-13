import { getGameMetrics } from '@/lib/admin/queries';

const RATING_COLORS: Record<string, string> = {
  S: '#f59e0b',
  A: '#10b981',
  B: '#6366f1',
  C: '#3b82f6',
  F: '#ef4444',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  color: '#374151',
};

export default async function GameMetricsPage() {
  const metrics = await getGameMetrics();
  const maxRating = Math.max(...metrics.ratings.map((r) => r.count), 1);
  const maxStarted = Math.max(...metrics.dayDropoff.map((d) => d.started), 1);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Метрики игры
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Очки, рейтинги и прогресс игроков
      </p>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            borderTop: '4px solid #6366f1',
            flex: 1,
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Ср. очки</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#111827' }}>{metrics.avg_score}</div>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            borderTop: '4px solid #10b981',
            flex: 1,
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Всего завершений</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#111827' }}>
            {metrics.total_completions}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 32px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          marginBottom: 24,
          maxWidth: 600,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#111827' }}>
          Распределение рейтингов
        </h2>
        {metrics.ratings.map((r) => (
          <div key={r.rating} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 700, color: RATING_COLORS[r.rating] ?? '#374151' }}>
                {r.rating}
              </span>
              <span style={{ color: '#6b7280' }}>{r.count} игроков</span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, height: 24 }}>
              <div
                style={{
                  width: `${Math.max((r.count / maxRating) * 100, r.count > 0 ? 2 : 0)}%`,
                  height: '100%',
                  background: RATING_COLORS[r.rating] ?? '#6b7280',
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        ))}
        {metrics.total_completions === 0 && (
          <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Пока нет завершений.</p>
        )}
      </div>

      {/* Day Drop-off */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 28px 16px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            Отвал по дням
          </h2>
        </div>
        {metrics.dayDropoff.length === 0 ? (
          <p style={{ padding: '16px 28px 24px', color: '#9ca3af', fontSize: 14 }}>
            Пока нет данных по дням.
          </p>
        ) : (
          <>
            {/* Visual bars */}
            <div style={{ padding: '0 28px 20px' }}>
              {metrics.dayDropoff.map((d) => (
                <div key={d.day_id} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      marginBottom: 4,
                      color: '#374151',
                    }}
                  >
                    <span>{d.day_id}</span>
                    <span style={{ color: d.dropoff_rate > 50 ? '#ef4444' : '#6b7280' }}>
                      {d.dropoff_rate}% отвал
                    </span>
                  </div>
                  <div
                    style={{
                      background: '#f3f4f6',
                      borderRadius: 6,
                      height: 20,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Started bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${(d.started / maxStarted) * 100}%`,
                        height: '100%',
                        background: '#bfdbfe',
                        borderRadius: 6,
                      }}
                    />
                    {/* Completed bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${(d.completed / maxStarted) * 100}%`,
                        height: '100%',
                        background: '#6366f1',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                    {d.started} начали · {d.completed} завершили
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: '#bfdbfe',
                      borderRadius: 2,
                      marginRight: 4,
                    }}
                  />
                  Начали
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: '#6366f1',
                      borderRadius: 2,
                      marginRight: 4,
                    }}
                  />
                  Завершили
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scenario Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 28px 16px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            Результаты по сценариям
          </h2>
        </div>
        {metrics.scenarios.length === 0 ? (
          <p style={{ padding: '16px 28px 24px', color: '#9ca3af', fontSize: 14 }}>
            Пока нет данных по сценариям.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Сценарий</th>
                <th style={thStyle}>Прохождений</th>
                <th style={thStyle}>Ср. очки</th>
                <th style={thStyle}>Ср. время</th>
              </tr>
            </thead>
            <tbody>
              {metrics.scenarios.map((s, i) => (
                <tr key={s.scenario_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{s.scenario_id}</td>
                  <td style={tdStyle}>{s.play_count}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#6366f1' }}>{s.avg_score}</td>
                  <td style={tdStyle}>{formatTime(s.avg_time_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
