// ============================================================
// Network — Connection-aware utilities for adaptive loading.
// Pure TS, no React.
// ============================================================

export type ConnectionTier = 'fast' | 'medium' | 'slow' | 'offline';

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
  addEventListener?: (type: string, cb: () => void) => void;
  removeEventListener?: (type: string, cb: () => void) => void;
}

function getConnection(): NetworkConnection | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as unknown as { connection?: NetworkConnection }).connection ?? null;
}

/** Detect current connection quality tier. */
export function getConnectionTier(): ConnectionTier {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';

  const conn = getConnection();
  if (!conn) return 'medium'; // Assume 3G when API unavailable

  if (conn.saveData) return 'slow';

  const eff = conn.effectiveType;
  if (eff === 'slow-2g' || eff === '2g') return 'slow';
  if (eff === '3g') return 'medium';
  if (eff === '4g') return 'fast';

  // Fallback to downlink (Mbps)
  const dl = conn.downlink;
  if (dl !== undefined) {
    if (dl < 1.5) return 'slow';
    if (dl < 5) return 'medium';
    return 'fast';
  }

  return 'medium';
}

/** Subscribe to connection changes. Returns unsubscribe function. */
export function onConnectionChange(cb: (tier: ConnectionTier) => void): () => void {
  const conn = getConnection();
  if (!conn?.addEventListener) return () => {};

  const handler = () => cb(getConnectionTier());

  conn.addEventListener('change', handler);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);

  return () => {
    conn.removeEventListener?.('change', handler);
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

/** Preload window depth per connection tier. */
export function getPreloadDepth(tier: ConnectionTier): number {
  switch (tier) {
    case 'slow': return 3;
    case 'medium': return 6;
    case 'fast': return 10;
    case 'offline': return 0;
  }
}

/** Image quality per connection tier (for next/image). */
export function getImageQuality(tier: ConnectionTier): number {
  switch (tier) {
    case 'slow': return 40;
    case 'medium': return 50;
    case 'fast': return 60;
    case 'offline': return 40;
  }
}

/** Crossfade duration per connection tier. */
export function getCrossfadeDuration(tier: ConnectionTier): number {
  switch (tier) {
    case 'slow': return 0;
    case 'medium': return 0.25;
    case 'fast': return 0.4;
    case 'offline': return 0;
  }
}
