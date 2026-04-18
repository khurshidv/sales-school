import { Suspense } from 'react';
import OfferClient from './OfferClient';

export const revalidate = 60;
export const metadata = { title: 'Offer Conversion — Sales School' };

export default function OfferPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <OfferClient />
    </Suspense>
  );
}
