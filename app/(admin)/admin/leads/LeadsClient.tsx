'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import SortableHeader from '@/components/admin/SortableHeader';
import { fetchLeads, fetchLeadCounts, updateLeadStatusApi } from '@/lib/admin/api';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { Lead } from '@/lib/admin/types';
import {
  LeadStatusBadge,
  LEAD_STATUS_CONFIG,
  LEAD_STATUS_ORDER,
} from '@/components/admin/leads/LeadStatusBadge';
import { UtmFilter } from '@/components/admin/leads/UtmFilter';
import { LeadActionBar } from '@/components/admin/leads/LeadActionBar';


function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function InlineStatusEditor({
  leadId,
  status,
  onChanged,
}: {
  leadId: string;
  status: string;
  onChanged: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pick(next: string) {
    if (next === status) { setOpen(false); return; }
    setBusy(true);
    try {
      await updateLeadStatusApi(leadId, next as 'new' | 'in_progress' | 'done' | 'invalid');
      onChanged(next);
    } catch (e) {
      console.warn('status update failed', e);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
      >
        <LeadStatusBadge status={status} />
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {LEAD_STATUS_ORDER.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => pick(s)}
          disabled={busy}
          style={{ background: 'transparent', border: 0, padding: 2, cursor: 'pointer' }}
          title={LEAD_STATUS_CONFIG[s].label}
        >
          <LeadStatusBadge status={s} />
        </button>
      ))}
    </div>
  );
}

type StatusFilter = 'all' | 'new' | 'in_progress' | 'done' | 'invalid';

export default function LeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [utmSources, setUtmSources] = useState<string[]>([]);
  const [utmCampaigns, setUtmCampaigns] = useState<string[]>([]);
  const [utmOptions, setUtmOptions] = useState<{ sources: string[]; campaigns: string[] }>({ sources: [], campaigns: [] });
  const [loading, setLoading] = useState(true);
  const [periodState, setPeriod] = usePeriodParam();
  const [sourceTabs, setSourceTabs] = useState<Array<{ slug: string | null; label: string }>>([
    { slug: null, label: 'Все' },
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  function toggleSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelectedIds(new Set(leads.map(l => l.id)));
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }
  const { period, from, to } = periodState;

  const searchParams = useSearchParams();
  const sortBy = searchParams.get('sort') ?? 'created_at';
  const sortDir = searchParams.get('dir') ?? 'desc';
  const VALID_SORT_COLUMNS = new Set(['created_at', 'name', 'phone', 'status']);
  const safeSortBy = VALID_SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at';
  const sortAsc = sortDir === 'asc';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchLeads({
        slug: sourceFilter ?? undefined,
        search: search || undefined,
        limit: 100,
        sortBy: safeSortBy,
        sortAsc,
        period,
        from: from ?? undefined,
        to: to ?? undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        utmSource: utmSources.length ? utmSources : undefined,
        utmCampaign: utmCampaigns.length ? utmCampaigns : undefined,
      }),
      fetchLeadCounts(),
    ])
      .then(([res, c]) => {
        if (cancelled) return;
        setLeads(res.leads); setTotal(res.total); setCounts(c); setLoading(false);
        setSelectedIds(new Set());
      })
      .catch(() => {
        if (cancelled) return;
        setLeads([]); setTotal(0); setCounts({}); setLoading(false);
        setSelectedIds(new Set());
      });
    return () => { cancelled = true; };
  }, [search, sourceFilter, statusFilter, utmSources, utmCampaigns, period, from, to, safeSortBy, sortAsc, refreshKey]);

  useEffect(() => {
    fetch('/api/admin/source-tabs')
      .then(r => r.ok ? r.json() : { tabs: [] })
      .then((d: { tabs: Array<{ slug: string; label: string }> }) => {
        setSourceTabs([{ slug: null, label: 'Все' }, ...d.tabs]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/admin/leads/filters')
      .then(r => r.ok ? r.json() : { sources: [], campaigns: [] })
      .then((d: { sources?: string[]; campaigns?: string[] }) => setUtmOptions({ sources: d.sources ?? [], campaigns: d.campaigns ?? [] }))
      .catch(() => {});
  }, []);

  const todayCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return leads.filter((l) => new Date(l.created_at) >= today).length;
  }, [leads]);

  const csvHref = useMemo(() => {
    const p = new URLSearchParams();
    p.set('period', period);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (sourceFilter) p.set('slug', sourceFilter);
    if (search) p.set('search', search);
    if (statusFilter !== 'all') p.set('status', statusFilter);
    if (utmSources.length > 0) p.set('utm_source', utmSources.join(','));
    if (utmCampaigns.length > 0) p.set('utm_campaign', utmCampaigns.join(','));
    return `/api/admin/leads/export?${p.toString()}`;
  }, [period, from, to, sourceFilter, search, statusFilter, utmSources, utmCampaigns]);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;

  return (
    <div>
      <PageHeader
        title="Заявки (формы)"
        subtitle="Заявки с регистрационных форм на маркетинговых лендингах. Отдельно от участников игры."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={csvHref} className="admin-btn" download>
              <Download size={12} /> CSV
            </a>
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </div>
        }
      />

      <div className="admin-kpi-row">
        <KpiCard label="Всего заявок" value={(counts.all ?? 0).toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="С Home" value={counts.home ?? 0} accent="pink" />
        <KpiCard label="С Target" value={counts.target ?? 0} accent="green" />
        <KpiCard label="На странице" value={leads.length} hint={`${todayCount} за сегодня`} accent="orange" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону…"
          className="admin-btn"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px' }}
        />
        {sourceTabs.map((t) => (
          <button
            key={t.slug ?? 'all'}
            onClick={() => setSourceFilter(t.slug)}
            className={sourceFilter === t.slug ? 'admin-btn admin-btn-primary' : 'admin-btn'}
          >
            {t.label}
            {t.slug !== null && counts[t.slug] != null && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>({counts[t.slug]})</span>
            )}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="admin-btn"
        >
          <option value="all">Статус: все</option>
          {LEAD_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <UtmFilter
          label="UTM source"
          options={utmOptions.sources}
          value={utmSources}
          onChange={setUtmSources}
        />
        <UtmFilter
          label="UTM campaign"
          options={utmOptions.campaigns}
          value={utmCampaigns}
          onChange={setUtmCampaigns}
        />
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            {search ? 'Ничего не найдено.' : 'Пока нет заявок с форм.'}
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)', background: '#fafaff' }}>
                <th style={{ padding: '10px 12px', width: 32 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => allSelected ? clearSelection() : selectAll()}
                  />
                </th>
                <SortableHeader column="created_at" label="Дата" />
                <SortableHeader column="name" label="Имя" />
                <SortableHeader column="status" label="Статус" />
                <SortableHeader column="phone" label="Телефон" />
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Страница</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>UTM</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Устройство</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(l.id)}
                      onChange={() => toggleSelection(l.id)}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{l.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <InlineStatusEditor
                      leadId={l.id}
                      status={l.status ?? 'new'}
                      onChanged={(newStatus) => {
                        setLeads((prev) => prev.map((x) => x.id === l.id ? { ...x, status: newStatus } : x));
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace' }}>
                    <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                      {l.phone}
                    </a>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px',
                      background: l.source_page === 'home' ? '#ede9fe' : '#dbeafe',
                      color: l.source_page === 'home' ? '#6d28d9' : '#1e40af',
                      borderRadius: 999, fontSize: 10, fontWeight: 700,
                    }}>
                      {l.source_page}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>
                    {l.utm_source ?? '(прямой)'}
                    {l.utm_campaign && <span style={{ opacity: 0.7 }}> / {l.utm_campaign}</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-muted)' }}>
                    {l.device_type === 'mobile' ? '📱 моб.' : l.device_type === 'desktop' ? '💻 десктоп' : l.device_type ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > leads.length && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--admin-text-dim)', textAlign: 'center' }}>
          Показано {leads.length} из {total.toLocaleString('ru-RU')} (топ-100). Используй поиск для конкретного контакта.
        </div>
      )}

      <LeadActionBar
        selectedIds={Array.from(selectedIds)}
        selectedPhones={leads.filter(l => selectedIds.has(l.id)).map(l => l.phone)}
        onClear={clearSelection}
        onRefresh={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
