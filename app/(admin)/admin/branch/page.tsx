import { Suspense } from 'react';
import BranchClient from './BranchClient';

export const revalidate = 60;
export const metadata = { title: 'Branch Analytics — Sales School' };

export default function BranchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <BranchClient />
    </Suspense>
  );
}
