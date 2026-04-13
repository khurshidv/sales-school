'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const thBaseStyle: React.CSSProperties = {
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
  cursor: 'pointer',
  userSelect: 'none',
};

function SortableHeaderInner({
  column,
  label,
}: {
  column: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort');
  const currentDir = searchParams.get('dir') ?? 'desc';
  const isActive = currentSort === column;
  const nextDir = isActive && currentDir === 'desc' ? 'asc' : 'desc';

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', column);
    params.set('dir', isActive ? nextDir : 'desc');
    params.delete('page'); // reset pagination on sort change
    router.push(`${pathname}?${params.toString()}`);
  }

  const arrow = isActive ? (currentDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <th style={{ ...thBaseStyle, color: isActive ? '#111827' : '#6b7280' }} onClick={handleClick}>
      {label}{arrow}
    </th>
  );
}

export default function SortableHeader(props: { column: string; label: string }) {
  return (
    <Suspense fallback={<th style={thBaseStyle}>{props.label}</th>}>
      <SortableHeaderInner {...props} />
    </Suspense>
  );
}
