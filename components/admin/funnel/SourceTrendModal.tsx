'use client';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { fetchFunnelTrend, type UtmTrendPoint } from '@/lib/admin/api';
import type { Period } from '@/lib/admin/types-v2';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

export interface SourceTrendModalProps {
  utmSource: string;
  period: Period | PeriodParamState;
  onClose: () => void;
}

const COLORS = { reg: '#6366f1', comp: '#10b981', leads: '#fb923c' };

export function SourceTrendModal({ utmSource, period, onClose }: SourceTrendModalProps) {
  const [points, setPoints] = useState<UtmTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFunnelTrend({ utm_source: utmSource, period })
      .then(r => { if (!cancelled) { setPoints(r.points); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError((e as Error).message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [utmSource, period]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = useMemo(() => [...points].sort((a, b) => a.bucket_date.localeCompare(b.bucket_date)), [points]);

  const max = Math.max(1, ...data.map(d => Math.max(d.registered, d.completed, d.consultations)));
  const padX = 20, padY = 20, W = 720, H = 240;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;

  const toY = (v: number) => padY + plotH - (v / max) * plotH;
  const ptsStr = (key: 'registered' | 'completed' | 'consultations') =>
    data.map((d, i) => `${(padX + step * i).toFixed(1)},${toY(d[key]).toFixed(1)}`).join(' ');

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (step === 0) { setHoverIdx(data.length ? 0 : null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((px - padX) / step);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--admin-bg)', borderRadius: 12, padding: 24, width: 760, maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>
            Тренд: <span style={{ color: 'var(--admin-accent-violet)' }}>{utmSource}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)' }}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', padding: 40, textAlign: 'center' }}>Загружаем…</div>
        ) : error ? (
          <div style={{ color: 'var(--admin-accent-danger)', padding: 20 }}>{error}</div>
        ) : data.length === 0 ? (
          <div style={{ color: 'var(--admin-text-dim)', padding: 40, textAlign: 'center' }}>Нет данных за период</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 8 }}>
              <Swatch color={COLORS.reg} label="Регистрации" />
              <Swatch color={COLORS.comp} label="Прохождения" />
              <Swatch color={COLORS.leads} label="Заявки" />
            </div>
            <svg
              width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
              onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}
              style={{ display: 'block' }}
            >
              <polyline points={ptsStr('registered')}    fill="none" stroke={COLORS.reg}   strokeWidth={2} />
              <polyline points={ptsStr('completed')}     fill="none" stroke={COLORS.comp}  strokeWidth={2} />
              <polyline points={ptsStr('consultations')} fill="none" stroke={COLORS.leads} strokeWidth={2} />
              {hoverIdx !== null && (() => {
                const x = padX + step * hoverIdx;
                const d = data[hoverIdx];
                return (
                  <g>
                    <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke="var(--admin-border)" strokeDasharray="4 3" />
                    <circle cx={x} cy={toY(d.registered)}    r={4} fill={COLORS.reg} />
                    <circle cx={x} cy={toY(d.completed)}     r={4} fill={COLORS.comp} />
                    <circle cx={x} cy={toY(d.consultations)} r={4} fill={COLORS.leads} />
                  </g>
                );
              })()}
            </svg>
            {hoverIdx !== null && (() => {
              const d = data[hoverIdx];
              return (
                <div style={{ fontSize: 11, color: 'var(--admin-text)', marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <strong>{d.bucket_date}</strong>
                  <span>Рег: <strong>{d.registered}</strong></span>
                  <span>Прохождения: <strong>{d.completed}</strong></span>
                  <span>Заявки: <strong>{d.consultations}</strong></span>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 2, background: color, borderRadius: 2 }} />
      {label}
    </span>
  );
}
