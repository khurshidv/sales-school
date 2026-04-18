import { Suspense } from 'react';
import PagesClient from './PagesClient';

export const revalidate = 60;
export const metadata = { title: 'Pages — Sales School' };

export default function PagesAdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <PagesClient />
    </Suspense>
  );
}
