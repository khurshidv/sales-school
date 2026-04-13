// ============================================================
// Device ID — Stable device identification for Instagram WebView
//
// Instagram's in-app browser clears localStorage after ~24h.
// We use a layered strategy to keep the device ID alive:
//
// 1. IndexedDB (most resilient in WebViews)
// 2. localStorage (fast sync access, but volatile in IG)
// 3. Cookie via API route (survives IG localStorage wipes)
//
// On each load, we try all sources and reconcile. If all are
// gone, we generate a new UUID (device is truly unknown).
// ============================================================

const DB_NAME = 'sales-school';
const STORE_NAME = 'device';
const IDB_KEY = 'device_id';
const LS_KEY = 'ss_device_id';
const COOKIE_NAME = 'ss_did';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// --- IndexedDB ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromIDB(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve((req.result as string) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setInIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(id, IDB_KEY);
  } catch {
    // Silent fail — other layers will compensate
  }
}

// --- localStorage ---

function getFromLS(): string | null {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

function setInLS(id: string): void {
  try {
    localStorage.setItem(LS_KEY, id);
  } catch {
    // Silent fail
  }
}

// --- Cookie ---

function getFromCookie(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setInCookie(id: string): void {
  try {
    // 1 year expiry, SameSite=Lax for WebView compatibility
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; expires=${expires}; path=/game; SameSite=Lax`;
  } catch {
    // Silent fail
  }
}

// --- Public API ---

/**
 * Get or create a stable device ID. Tries IndexedDB → localStorage → cookie.
 * If none found, generates a new UUID and stores in all layers.
 */
export async function getDeviceId(): Promise<string> {
  if (typeof window === 'undefined') return generateId();

  // Try all sources
  const fromIDB = await getFromIDB();
  const fromLS = getFromLS();
  const fromCookie = getFromCookie();

  // Use the first available (IDB is most reliable)
  const existing = fromIDB ?? fromLS ?? fromCookie;

  if (existing) {
    // Reconcile: write to all layers that are missing
    if (!fromIDB) setInIDB(existing);
    if (!fromLS) setInLS(existing);
    if (!fromCookie) setInCookie(existing);
    return existing;
  }

  // No ID found anywhere — generate new
  const newId = generateId();
  await setInIDB(newId);
  setInLS(newId);
  setInCookie(newId);
  return newId;
}
