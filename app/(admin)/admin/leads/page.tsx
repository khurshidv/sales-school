import Link from 'next/link';
import { getLeads, getLeadCounts } from '@/lib/admin/page-queries';
import type { Lead } from '@/lib/admin/types';

const PAGE_NAMES: Record<string, string> = {
  home: 'Вебинар',
  target: 'Курс',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 13,
  color: '#374151',
};

function PageBadge({ slug }: { slug: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    home: { bg: '#ede9fe', text: '#7c3aed' },
    target: { bg: '#fce7f3', text: '#db2777' },
  };
  const c = colors[slug] ?? { bg: '#f3f4f6', text: '#6b7280' };
  return (
    <span style={{ background: c.bg, color: c.text, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
      {PAGE_NAMES[slug] ?? slug}
    </span>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
        Пока нет заявок. Данные появятся после первых регистраций.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Дата</th>
            <th style={thStyle}>Имя</th>
            <th style={thStyle}>Телефон</th>
            <th style={thStyle}>Страница</th>
            <th style={thStyle}>UTM Источник</th>
            <th style={thStyle}>UTM Кампания</th>
            <th style={thStyle}>Устройство</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={lead.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
              <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>{lead.name}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{lead.phone}</td>
              <td style={tdStyle}><PageBadge slug={lead.source_page} /></td>
              <td style={tdStyle}>
                {lead.utm_source ? (
                  <span style={{ background: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
                    {lead.utm_source}
                  </span>
                ) : (
                  <span style={{ color: '#d1d5db' }}>прямой</span>
                )}
              </td>
              <td style={{ ...tdStyle, fontSize: 12, color: '#6b7280' }}>{lead.utm_campaign ?? '—'}</td>
              <td style={{ ...tdStyle, fontSize: 12, color: '#6b7280' }}>
                {lead.device_type === 'mobile' ? '📱 моб.' : lead.device_type === 'desktop' ? '💻 десктоп' : lead.device_type ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const activeFilter = sp.page ?? 'all';

  const [leads, counts] = await Promise.all([
    getLeads(activeFilter === 'all' ? undefined : activeFilter),
    getLeadCounts(),
  ]);

  const filters = [
    { slug: 'all', label: 'Все' },
    { slug: 'home', label: 'Вебинар' },
    { slug: 'target', label: 'Курс' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Заявки
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Регистрации с маркетинговых страниц · {counts.all ?? 0} всего
      </p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {filters.map((f) => {
          const isActive = activeFilter === f.slug;
          const count = f.slug === 'all' ? (counts.all ?? 0) : (counts[f.slug] ?? 0);
          return (
            <Link
              key={f.slug}
              href={f.slug === 'all' ? '/admin/leads' : `/admin/leads?page=${f.slug}`}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                background: isActive ? '#111827' : '#f3f4f6',
                color: isActive ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {f.label} ({count})
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}
