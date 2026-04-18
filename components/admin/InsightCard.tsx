import type { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

type InsightTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<InsightTone, { bg: string; border: string; color: string; Icon: typeof Info }> = {
  info:    { bg: 'linear-gradient(90deg,#dbeafe,#bfdbfe)', border: '#3b82f6', color: '#1e3a8a', Icon: Info },
  success: { bg: 'linear-gradient(90deg,#dcfce7,#bbf7d0)', border: '#10b981', color: '#065f46', Icon: CheckCircle2 },
  warning: { bg: 'linear-gradient(90deg,#fef3c7,#fde68a)', border: '#f59e0b', color: '#92400e', Icon: AlertTriangle },
  danger:  { bg: 'linear-gradient(90deg,#fee2e2,#fecaca)', border: '#ef4444', color: '#991b1b', Icon: XCircle },
};

export interface InsightCardProps {
  title: string;
  body: ReactNode;
  tone?: InsightTone;
}

export default function InsightCard({ title, body, tone = 'info' }: InsightCardProps) {
  const { bg, border, color, Icon } = TONES[tone];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 12, background: bg,
      borderRadius: 'var(--admin-radius-sm)', borderLeft: `3px solid ${border}`,
    }}>
      <Icon size={18} color={border} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 12, color, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color, opacity: 0.85, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}
