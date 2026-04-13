import { getPlayers } from '@/lib/admin/queries';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  color: '#374151',
  verticalAlign: 'middle',
};

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

export default async function ParticipantsPage() {
  const players = await getPlayers();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Участники
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        {players.length} зарегистрировано · последние 200
      </p>

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        {players.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Пока нет участников.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Имя</th>
                  <th style={thStyle}>Телефон</th>
                  <th style={thStyle}>UTM Источник</th>
                  <th style={thStyle}>UTM Кампания</th>
                  <th style={thStyle}>Регистрация</th>
                  <th style={thStyle}>Последняя активность</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>
                      {p.display_name}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{p.phone}</td>
                    <td style={tdStyle}>
                      {p.utm_source ? (
                        <span
                          style={{
                            background: '#ede9fe',
                            color: '#7c3aed',
                            padding: '2px 8px',
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {p.utm_source}
                        </span>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.utm_campaign ?? <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#6b7280' }}>
                      {formatDate(p.last_activity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
