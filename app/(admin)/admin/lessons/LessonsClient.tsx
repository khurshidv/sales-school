'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import {
  fetchLessons,
  type LessonsFunnelStep,
  type FinalOfferBreakdownRow,
  type RecentFunnelEvent,
} from '@/lib/admin/api';

const STEP_LABELS: Record<string, string> = {
  landing_view: 'Открыл /start',
  play_clicked: 'Нажал Play',
  lead_created: 'Лид создан',
  lesson_opened_1: 'Открыл урок 1',
  quiz_passed_1: 'Прошёл квиз 1',
  lesson_opened_2: 'Открыл урок 2',
  quiz_passed_2: 'Прошёл квиз 2',
  lesson_opened_3: 'Открыл урок 3',
  quiz_passed_3: 'Прошёл квиз 3',
  lesson_opened_4: 'Открыл урок 4',
  quiz_passed_4: 'Прошёл квиз 4',
  funnel_completed: 'Воронка пройдена',
  final_page_viewed: 'Открыл /start/final',
  final_cta_simulator_clicked: 'Кликнул «Начать симулятор»',
  final_cta_learn_more_clicked: 'Кликнул «Узнать больше»',
  final_consultation_opened: 'Открыл форму консультации',
  final_consultation_submitted: 'Отправил форму консультации',
};

const LOCATION_LABELS: Record<string, string> = {
  bottom_cta: 'Финальный блок (Savollaringiz bormi?)',
  sticky_mobile: 'Sticky-кнопка (мобильный)',
  after_trust_bar: 'После TrustBar',
  after_why_sales: 'После «Почему продажи»',
  after_product_benefits: 'После «Что ты получишь»',
  after_program_accordion: 'После программы курса',
  after_cases: 'После кейсов',
  after_stats: 'После статистики',
  after_for_whom: 'После «Для кого»',
  unknown: 'Без метки',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  ...STEP_LABELS,
  lesson_opened: 'Открыл урок',
  quiz_passed: 'Прошёл квиз',
  quiz_wrong: 'Ошибся в квизе',
  quiz_shown: 'Увидел квиз',
  simulator_redirected: 'Редирект в игру',
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function findStep(steps: LessonsFunnelStep[], name: string): number {
  return steps.find((s) => s.step === name)?.uniqueLeads ?? 0;
}

function pct(part: number, total: number): string {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

export default function LessonsClient() {
  const [periodState, setPeriod] = usePeriodParam();
  const [summary, setSummary] = useState<LessonsFunnelStep[]>([]);
  const [breakdown, setBreakdown] = useState<FinalOfferBreakdownRow[]>([]);
  const [events, setEvents] = useState<RecentFunnelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    fetchLessons(periodState)
      .then((res) => {
        setSummary(res.summary);
        setBreakdown(res.breakdown);
        setEvents(res.events);
      })
      .catch((err) => {
        console.error('[LessonsClient] fetch failed', err);
      })
      .finally(() => setLoading(false));
  }, [periodState]);

  const kpis = useMemo(() => {
    const leads = findStep(summary, 'lead_created');
    const lesson1 = findStep(summary, 'lesson_opened_1');
    const completed = findStep(summary, 'funnel_completed');
    const finalView = findStep(summary, 'final_page_viewed');
    const consOpened = findStep(summary, 'final_consultation_opened');
    const consSubmitted = findStep(summary, 'final_consultation_submitted');
    return { leads, lesson1, completed, finalView, consOpened, consSubmitted };
  }, [summary]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return events;
    return events.filter((e) => e.eventType === eventFilter);
  }, [events, eventFilter]);

  const eventTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType));
    return Array.from(set).sort();
  }, [events]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Воронка уроков и Final Offer"
        subtitle="Сводная картина пути от /start через 4 урока до заявки на консультацию"
        actions={<PeriodFilter value={periodState} onChange={setPeriod} />}
      />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <KpiCard label="Лиды" value={kpis.leads.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard
          label="Открыли урок 1"
          value={kpis.lesson1.toLocaleString('ru-RU')}
          hint={`${pct(kpis.lesson1, kpis.leads)} от лидов`}
          accent="blue"
        />
        <KpiCard
          label="Прошли воронку"
          value={kpis.completed.toLocaleString('ru-RU')}
          hint={`${pct(kpis.completed, kpis.leads)} от лидов`}
          accent="green"
        />
        <KpiCard
          label="Final page просмотры"
          value={kpis.finalView.toLocaleString('ru-RU')}
          hint={`${pct(kpis.finalView, kpis.completed)} от прошедших`}
          accent="orange"
        />
        <KpiCard
          label="Открыли форму консультации"
          value={kpis.consOpened.toLocaleString('ru-RU')}
          hint={`${pct(kpis.consOpened, kpis.finalView)} от final page`}
          accent="pink"
        />
        <KpiCard
          label="Отправили форму"
          value={kpis.consSubmitted.toLocaleString('ru-RU')}
          hint={`${pct(kpis.consSubmitted, kpis.consOpened)} от открывших`}
          accent="pink"
        />
      </div>

      {/* Funnel table */}
      <section className="admin-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
          Шаги воронки (уникальные лиды)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--admin-text-dim)', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '8px 6px' }}>Шаг</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Уник. лидов</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Всего событий</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Конверсия от лидов</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Загружаем…</td></tr>
            )}
            {!loading && summary.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Событий за выбранный период нет.</td></tr>
            )}
            {!loading && summary.map((row) => (
              <tr key={row.step} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '8px 6px', color: 'var(--admin-text)' }}>
                  {STEP_LABELS[row.step] ?? row.step}
                  <span style={{ marginLeft: 8, color: 'var(--admin-text-dim)', fontSize: 11 }}>{row.step}</span>
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--admin-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.uniqueLeads.toLocaleString('ru-RU')}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--admin-text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.totalEvents.toLocaleString('ru-RU')}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--admin-text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {pct(row.uniqueLeads, kpis.leads)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Final offer breakdown */}
      <section className="admin-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
          Откуда открывают форму консультации (Final Offer)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--admin-text-dim)', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '8px 6px' }}>Место клика</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Открытий</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Уник. лидов</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Загружаем…</td></tr>
            )}
            {!loading && breakdown.length === 0 && (
              <tr><td colSpan={3} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Нет открытий формы за период.</td></tr>
            )}
            {!loading && breakdown.map((row) => (
              <tr key={row.location} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '8px 6px', color: 'var(--admin-text)' }}>
                  {LOCATION_LABELS[row.location] ?? row.location}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {row.opens.toLocaleString('ru-RU')}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--admin-text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.uniqueLeads.toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recent events */}
      <section className="admin-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
            Последние события
          </h3>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            style={{
              background: 'var(--admin-bg-elevated)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text)',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <option value="all">Все события</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--admin-text-dim)', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '6px' }}>Время</th>
              <th style={{ padding: '6px' }}>Событие</th>
              <th style={{ padding: '6px' }}>Урок</th>
              <th style={{ padding: '6px' }}>Лид</th>
              <th style={{ padding: '6px' }}>Meta</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Загружаем…</td></tr>
            )}
            {!loading && filteredEvents.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 16, color: 'var(--admin-text-dim)' }}>Нет событий.</td></tr>
            )}
            {!loading && filteredEvents.map((ev) => (
              <tr key={ev.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '6px', color: 'var(--admin-text-dim)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtDateTime(ev.createdAt)}
                </td>
                <td style={{ padding: '6px', color: 'var(--admin-text)' }}>
                  {EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType}
                </td>
                <td style={{ padding: '6px', color: 'var(--admin-text-dim)' }}>
                  {ev.lessonIndex ?? '—'}
                </td>
                <td style={{ padding: '6px', color: 'var(--admin-text)' }}>
                  {ev.leadId ? (
                    <Link href={`/admin/leads?leadId=${ev.leadId}`} style={{ color: 'var(--admin-text)', textDecoration: 'underline' }}>
                      {ev.leadName ?? ev.leadPhone ?? ev.leadId.slice(0, 8)}
                    </Link>
                  ) : '—'}
                </td>
                <td style={{ padding: '6px', color: 'var(--admin-text-dim)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {Object.keys(ev.meta).length > 0 ? JSON.stringify(ev.meta) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
