'use client';

import type { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>{icon}</div>}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>{description}</p>
      )}
      {action && (
        <div style={{ marginTop: 16 }}>
          {typeof action === 'object' && action && 'label' in action && 'onClick' in action ? (
            <button
              className="admin-btn admin-btn-primary"
              onClick={(action as { label: string; onClick: () => void }).onClick}
            >
              {(action as { label: string; onClick: () => void }).label}
            </button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}
