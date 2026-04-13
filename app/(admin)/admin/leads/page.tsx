import Link from 'next/link';
import { getLeads, getLeadCounts } from '@/lib/admin/page-queries';
import { formatDate, maskPhone } from '@/lib/admin/formatters';
import RefreshButton from '@/components/admin/RefreshButton';
import TableFilters from '@/components/admin/TableFilters';
import SortableHeader from '@/components/admin/SortableHeader';
import type { Lead } from '@/lib/admin/types';

const PAGE_NAMES: Record<string, string> = {
  home: 'Вебинар',
  target: 'Курс',
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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; p?: string; q?: string; sort?: string; dir?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const activeFilter = sp.page ?? 'all';
  const currentPage = Math.max(1, parseInt(sp.p ?? '1', 10));
  const limit = 25;
  const offset = (currentPage - 1) * limit;
  const search = sp.q || undefined;
  const sortBy = sp.sort || 'created_at';
  const sortAsc = sp.dir === 'asc';

  const [{ leads, total }, counts] = await Promise.all([
    getLeads({
      slug: activeFilter === 'all' ? undefined : activeFilter,
      limit,
      offset,
      search,
      sortBy,
      sortAsc,
      from: sp.from,
      to: sp.to,
    }),
    getLeadCounts(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const filters = [
    { slug: 'all', label: 'Все' },
    { slug: 'home', label: 'Вебинар' },
    { slug: 'target', label: 'Курс' },
  ];

  // Build URL preserving current params
  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    if (sp.page && !overrides.page) params.set('page', sp.page);
    if (sp.q && !('q' in overrides)) params.set('q', sp.q);
    if (sp.sort && !('sort' in overrides)) params.set('sort', sp.sort);
    if (sp.dir && !('dir' in overrides)) params.set('dir', sp.dir);
    if (sp.from && !('from' in overrides)) params.set('from', sp.from);
    if (sp.to && !('to' in overrides)) params.set('to', sp.to);
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== null) params.set(k, v);
    }
    const qs = params.toString();
    return `/admin/leads${qs ? `?${qs}` : ''}`;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#111827' }}>
          Заявки
        </h1>
        <RefreshButton />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          {total} заявок
        </p>
        <a
          href="/api/admin/export?type=leads"
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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

      <TableFilters
        showSearch
        searchPlaceholder="Поиск по имени или телефону..."
        showDateRange
      />

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {leads.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            {search ? 'Ничего не найдено.' : 'Пока нет заявок.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <SortableHeader column="created_at" label="Дата" />
                  <SortableHeader column="name" label="Имя" />
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>Телефон</th>
                  <SortableHeader column="source_page" label="Страница" />
                  <SortableHeader column="utm_source" label="UTM Источник" />
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>UTM Кампания</th>
                  <SortableHeader column="device_type" label="Устройство" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>{lead.name}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{maskPhone(lead.phone)}</td>
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
          {currentPage > 1 && (
            <a
              href={buildUrl({ p: String(currentPage - 1) })}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', textDecoration: 'none', color: '#374151', fontSize: 13 }}
            >
              ← Назад
            </a>
          )}
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {currentPage} из {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={buildUrl({ p: String(currentPage + 1) })}
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
