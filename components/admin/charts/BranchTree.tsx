'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { TreeNode } from '@/lib/admin/types-v2';

export interface BranchTreeProps {
  nodes: TreeNode[];
  total: number;
}

interface RowProps {
  node: TreeNode;
  total: number;
  depth: number;
}

function Row({ node, total, depth }: RowProps) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const pct = total > 0 ? (node.count / total) * 100 : 0;

  const tone = pct > 50 ? 'success' : pct > 20 ? 'warn' : 'fail';
  const bg = tone === 'success' ? '#dcfce7' : tone === 'warn' ? '#fef3c7' : '#fee2e2';
  const border = tone === 'success' ? '#10b981' : tone === 'warn' ? '#f59e0b' : '#ef4444';
  const color = tone === 'success' ? '#065f46' : tone === 'warn' ? '#92400e' : '#991b1b';

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', background: bg, color,
          borderLeft: `3px solid ${border}`, borderRadius: 6,
          fontSize: 12, marginBottom: 3,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
      >
        {hasChildren ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span style={{ width: 12 }} />}
        <span style={{ flex: 1, fontFamily: 'ui-monospace, monospace' }}>{node.id}</span>
        <span style={{ fontWeight: 700 }}>{node.count}</span>
        <span style={{ opacity: 0.7, minWidth: 50, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
      </div>
      {open && node.children.map((c) => (
        <Row key={`${depth}-${c.id}`} node={c} total={node.count} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function BranchTree({ nodes, total }: BranchTreeProps) {
  if (nodes.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div>
      {nodes.map((n) => <Row key={n.id} node={n} total={total} depth={0} />)}
    </div>
  );
}
