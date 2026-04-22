import type { DeviceBreakdown } from '@/lib/admin/types';
import type { DeviceConversion } from '@/lib/admin/api';

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#6366f1',
  desktop: '#10b981',
  tablet: '#f59e0b',
  unknown: '#9ca3af',
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Мобильные',
  desktop: 'Десктоп',
  tablet: 'Планшеты',
  unknown: 'Неизвестно',
};

interface Props {
  data: DeviceBreakdown[];
  conversion?: DeviceConversion[];
}

export function DeviceBars({ data, conversion }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const convMap = new Map((conversion ?? []).map((c) => [c.device_type, c]));

  if (data.length === 0) {
    return <p style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных</p>;
  }

  return (
    <>
      {data.map((d) => {
        const width = max > 0 ? Math.max((d.count / max) * 100, 2) : 2;
        const color = DEVICE_COLORS[d.device_type] ?? '#6b7280';
        const label = DEVICE_LABELS[d.device_type] ?? d.device_type;
        const conv = convMap.get(d.device_type);
        return (
          <div key={d.device_type} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--admin-text)', marginBottom: 4 }}>
              <span>{label}</span>
              <span style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                {d.count.toLocaleString('ru-RU')}
                {conv != null && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-accent-success, #10b981)' }}>
                    CR {conv.cr.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div style={{ background: 'var(--admin-border, #f3f4f6)', borderRadius: 6, height: 22, overflow: 'hidden' }}>
              <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </>
  );
}
