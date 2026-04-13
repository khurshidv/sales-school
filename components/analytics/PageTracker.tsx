'use client';

import { useEffect } from 'react';
import { initPageTracking } from '@/lib/analytics/events';

export default function PageTracker({ slug }: { slug: string }) {
  useEffect(() => {
    return initPageTracking(slug);
  }, [slug]);
  return null;
}
