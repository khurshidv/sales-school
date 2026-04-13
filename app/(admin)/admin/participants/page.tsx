import { getPlayers } from '@/lib/admin/queries';
import { formatDate, maskPhone } from '@/lib/admin/formatters';
import RefreshButton from '@/components/admin/RefreshButton';

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

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; dir?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));
  const limit = 25;
  const offset = (page - 1) * limit;
  const search = sp.q || undefined;
  const sortBy = sp.sort || 'created_at';
  const sortAsc = sp.dir === 'asc';

  const { players, total } = await getPlayers({ limit, offset, search, sortBy, sortAsc });
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="admin-page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#111827' }}>
          Участники
        </h1>
        <RefreshButton />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          {total} зарегистрировано
        </p>
        <a
          href="/api/admin/export?type=participants"
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

      {/* Search */}
      <form method="GET" style={{ marginBottom: 20 }}>
        <input
          name="q"
          type="text"
          placeholder="Поиск по имени или телефону..."
          defaultValue={search ?? ''}
          style={{
            padding: '9px 14px',
            fontSize: 14,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            width: 300,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '9px 18px',
            fontSize: 14,
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            marginLeft: 8,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Найти
        </button>
      </form>

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
            {search ? 'Ничего не найдено.' : 'Пока нет участников.'}
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
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{maskPhone(p.phone)}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
          {page > 1 && (
            <a
              href={`/admin/participants?page=${page - 1}${search ? `&q=${search}` : ''}`}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', textDecoration: 'none', color: '#374151', fontSize: 13 }}
            >
              ← Назад
            </a>
          )}
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {page} из {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/participants?page=${page + 1}${search ? `&q=${search}` : ''}`}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', textDecoration: 'none', color: '#374151', fontSize: 13 }}
            >
              Далее →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
