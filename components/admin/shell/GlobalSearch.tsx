'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, User, Mail } from 'lucide-react';

interface Result {
  id: string;
  icon: 'page' | 'player' | 'lead';
  title: string;
  subtitle?: string;
  href: string;
}

const PAGES: Result[] = [
  { id: 'p:realtime', icon: 'page', title: 'Мониторинг live', subtitle: 'Активность в реальном времени', href: '/admin/realtime' },
  { id: 'p:overview', icon: 'page', title: 'Обзор', subtitle: 'Главные показатели воронки', href: '/admin/overview' },
  { id: 'p:branch', icon: 'page', title: 'Карта сценария', subtitle: 'Узлы и переходы', href: '/admin/branch' },
  { id: 'p:engagement', icon: 'page', title: 'Вовлечённость', subtitle: 'Interest Index и метрики', href: '/admin/engagement' },
  { id: 'p:dropoff', icon: 'page', title: 'Точки выхода', subtitle: 'Где игроки закрывают игру', href: '/admin/dropoff' },
  { id: 'p:funnel', icon: 'page', title: 'Воронка и источники', subtitle: 'UTM analytics', href: '/admin/funnel' },
  { id: 'p:leads', icon: 'page', title: 'Заявки', subtitle: 'Лиды с форм', href: '/admin/leads' },
  { id: 'p:pages', icon: 'page', title: 'Аналитика лендингов', subtitle: 'Метрики страниц', href: '/admin/pages' },
  { id: 'p:offer', icon: 'page', title: 'Конверсия оффера', subtitle: 'Финальный оффер', href: '/admin/offer' },
  { id: 'p:participants', icon: 'page', title: 'Участники', subtitle: 'Все игроки', href: '/admin/participants' },
  { id: 'p:leaderboard', icon: 'page', title: 'Таблица лидеров', subtitle: 'Топ игроков', href: '/admin/leaderboard' },
];

export function useGlobalSearchHotkey(onOpen: () => void): void {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input/textarea/select (other than our own)
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (tag === 'INPUT' && !(e.target as HTMLInputElement).classList.contains('admin-search-input')) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpen();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpen]);
}

export interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [asyncResults, setAsyncResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Static page results filtered by substring
  const pageResults = useMemo<Result[]>(() => {
    if (!query) return PAGES;
    const q = query.toLowerCase();
    return PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.subtitle ?? '').toLowerCase().includes(q),
    );
  }, [query]);

  const all = useMemo(() => [...pageResults, ...asyncResults], [pageResults, asyncResults]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setAsyncResults([]);
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Debounced async search (≥2 chars)
  useEffect(() => {
    if (!open || query.length < 2) {
      setAsyncResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const [pRes, lRes] = await Promise.all([
          fetch(`/api/admin/participants?search=${encodeURIComponent(query)}&limit=5`).then((r) =>
            r.ok ? r.json() : { players: [] },
          ),
          fetch(`/api/admin/leads?search=${encodeURIComponent(query)}&period=all&limit=5`).then((r) =>
            r.ok ? r.json() : { leads: [] },
          ),
        ]);

        // participants route returns { players: EnrichedPlayer[], total, stats }
        const players: Result[] = (pRes.players ?? [])
          .slice(0, 5)
          .map((p: { id: string; display_name?: string | null; phone?: string | null }) => ({
            id: `player:${p.id}`,
            icon: 'player' as const,
            title: p.display_name ?? 'Игрок без имени',
            subtitle: p.phone ?? '—',
            href: `/admin/participants`,
          }));

        // leads route returns { leads: Lead[], total }
        const leads: Result[] = (lRes.leads ?? [])
          .slice(0, 5)
          .map((l: { id: string; name?: string | null; phone?: string | null }) => ({
            id: `lead:${l.id}`,
            icon: 'lead' as const,
            title: l.name ?? 'Без имени',
            subtitle: l.phone ?? '—',
            href: `/admin/leads`,
          }));

        setAsyncResults([...players, ...leads]);
      } catch {
        setAsyncResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query, open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, all.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        const r = all[cursor];
        if (r) {
          e.preventDefault();
          router.push(r.href);
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, all, cursor, router, onClose]);

  // Clamp cursor when list shrinks
  useEffect(() => {
    if (all.length > 0 && cursor >= all.length) {
      setCursor(all.length - 1);
    }
  }, [all.length, cursor]);

  if (!open) return null;

  return (
    <div className="admin-search-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Глобальный поиск">
      <div className="admin-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-search-input-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Найти страницу, игрока или лида…"
            className="admin-search-input"
            aria-label="Поисковый запрос"
            autoComplete="off"
          />
          <button type="button" onClick={onClose} aria-label="Закрыть поиск" className="admin-icon-btn">
            <X size={16} />
          </button>
        </div>
        <div className="admin-search-results" role="listbox">
          {pageResults.length > 0 && (
            <div className="admin-search-group">
              <div className="admin-search-group-label">Страницы</div>
              {pageResults.map((r, idx) =>
                renderRow(r, idx, cursor, () => { router.push(r.href); onClose(); }),
              )}
            </div>
          )}
          {query.length >= 2 && (
            <div className="admin-search-group">
              <div className="admin-search-group-label">
                {loading ? 'Ищу…' : asyncResults.length > 0 ? 'Игроки и лиды' : 'Ничего не найдено'}
              </div>
              {asyncResults.map((r, idx) => {
                const globalIdx = pageResults.length + idx;
                return renderRow(r, globalIdx, cursor, () => { router.push(r.href); onClose(); });
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderRow(r: Result, idx: number, cursor: number, onClick: () => void) {
  const Icon = r.icon === 'player' ? User : r.icon === 'lead' ? Mail : FileText;
  const active = idx === cursor;
  return (
    <button
      key={r.id}
      type="button"
      role="option"
      aria-selected={active}
      className={`admin-search-row${active ? ' admin-search-row--active' : ''}`}
      onClick={onClick}
    >
      <Icon size={14} aria-hidden="true" />
      <div className="admin-search-row-body">
        <div className="admin-search-row-title">{r.title}</div>
        {r.subtitle && <div className="admin-search-row-sub">{r.subtitle}</div>}
      </div>
    </button>
  );
}
