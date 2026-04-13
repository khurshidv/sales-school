import { getLeaderboard } from '@/lib/admin/queries';

export const revalidate = 60;

const LEVEL_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#60a5fa',
  3: '#34d399',
  4: '#f59e0b',
  5: '#f97316',
};

function levelColor(level: number) {
  return LEVEL_COLORS[level] ?? '#a78bfa';
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
  padding: '13px 16px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  color: '#374151',
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return (
    <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: 14 }}>#{rank}</span>
  );
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Лидерборд
      </h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          Топ {entries.length} игроков по очкам
        </p>
        <a
          href="/api/admin/export?type=leaderboard"
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 500,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#374151',
            background: '#fff',
          }}
        >
          Экспорт CSV
        </a>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        {entries.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Пока нет игроков.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 60 }}>Место</th>
                <th style={thStyle}>Игрок</th>
                <th style={thStyle}>Уровень</th>
                <th style={thStyle}>Сценарии</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Общий счёт</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.player_id}
                  style={{
                    background:
                      i === 0
                        ? '#fffbeb'
                        : i === 1
                          ? '#f8fafc'
                          : i === 2
                            ? '#fdf4ff'
                            : i % 2 === 0
                              ? '#fff'
                              : '#fafafa',
                  }}
                >
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <RankBadge rank={i + 1} />
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>
                    {entry.display_name}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: levelColor(entry.level) + '22',
                        color: levelColor(entry.level),
                        padding: '2px 10px',
                        borderRadius: 99,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Ур. {entry.level}
                    </span>
                  </td>
                  <td style={tdStyle}>{entry.scenarios_completed}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#6366f1',
                    }}
                  >
                    {entry.total_score.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
