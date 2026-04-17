import { Suspense } from 'react';
import DropoffClient from './DropoffClient';

export const revalidate = 60;
export const metadata = { title: 'Drop-off Zones — Sales School' };

export default function DropoffPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <DropoffClient />
    </Suspense>
  );
}
