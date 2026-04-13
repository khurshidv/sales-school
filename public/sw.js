// ============================================================
// Sales School — Service Worker
// Hand-rolled (~150 lines), no Workbox dependency.
//
// Strategies:
// - Precache: fonts, onboarding assets, SFX
// - CacheFirst (30d): game images, Next.js static, optimized images
// - NetworkFirst: BGM
// - NetworkOnly: API routes, non-game pages
// ============================================================

const CACHE_VERSION = 'ss-v1';
const PRECACHE_NAME = `${CACHE_VERSION}-precache`;
const RUNTIME_NAME = `${CACHE_VERSION}-runtime`;
const MAX_RUNTIME_ENTRIES = 200;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Assets to precache on install (critical for instant onboarding)
const PRECACHE_URLS = [
  // Onboarding backgrounds
  '/assets/scenarios/car-dealership/backgrounds/bg_showroom_entrance.jpg',
  '/assets/scenarios/car-dealership/backgrounds/bg_showroom.jpg',
  '/assets/scenarios/car-dealership/backgrounds/bg_showroom_entrance_exterior.jpg',
  // Rustam sprite (onboarding character)
  '/assets/scenarios/car-dealership/characters/chr_rustam_friendly.webp',
  '/assets/scenarios/car-dealership/characters/chr_rustam_serious.webp',
  // SFX (tiny files, preload all for instant audio)
  '/assets/sounds/sfx/sfx_choice_select.mp3',
  '/assets/sounds/sfx/sfx_correct.mp3',
  '/assets/sounds/sfx/sfx_wrong.mp3',
  '/assets/sounds/sfx/sfx_combo.mp3',
  '/assets/sounds/sfx/sfx_timer_tick.mp3',
  '/assets/sounds/sfx/sfx_achievement.mp3',
  '/assets/sounds/sfx/sfx_life_lost.mp3',
  '/assets/sounds/sfx/sfx_life_gain.mp3',
  '/assets/sounds/sfx/sfx_fail.mp3',
  '/assets/sounds/sfx/sfx_day_complete.mp3',
  '/assets/sounds/sfx/sfx_grandmaster.mp3',
  '/assets/sounds/sfx/sfx_coin.mp3',
];

// --- Install: precache critical assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch((err) => {
        // Don't fail install if some assets are missing
        console.warn('[SW] Precache partial failure:', err);
      })
    )
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== PRECACHE_NAME && k !== RUNTIME_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch handler ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // NetworkOnly: API routes
  if (url.pathname.startsWith('/api/')) return;

  // CacheFirst: Next.js static assets (content-hashed, immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // CacheFirst: Next.js optimized images
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // CacheFirst: game image assets (backgrounds + characters)
  if (
    url.pathname.startsWith('/assets/scenarios/') &&
    (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.webp') || url.pathname.endsWith('.png'))
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // CacheFirst: SFX audio
  if (url.pathname.startsWith('/assets/sounds/sfx/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // NetworkFirst: BGM audio (large, but cache after first play)
  if (url.pathname.startsWith('/assets/sounds/bgm/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // CacheFirst: font files
  if (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
});

// --- Strategies ---

async function cacheFirst(request) {
  // Check precache first, then runtime cache
  const precached = await caches.match(request, { cacheName: PRECACHE_NAME });
  if (precached) return precached;

  const cached = await caches.match(request, { cacheName: RUNTIME_NAME });
  if (cached) {
    // Check if cache entry is stale (> 30 days)
    const dateHeader = cached.headers.get('date');
    if (dateHeader) {
      const age = Date.now() - new Date(dateHeader).getTime();
      if (age > THIRTY_DAYS) {
        // Stale — fetch fresh in background, return stale for now
        fetchAndCache(request).catch(() => {});
      }
    }
    return cached;
  }

  return fetchAndCache(request);
}

async function networkFirst(request) {
  try {
    return await fetchAndCache(request);
  } catch {
    const cached = await caches.match(request, { cacheName: RUNTIME_NAME });
    if (cached) return cached;

    const precached = await caches.match(request, { cacheName: PRECACHE_NAME });
    if (precached) return precached;

    return new Response('Offline', { status: 503 });
  }
}

async function fetchAndCache(request) {
  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(RUNTIME_NAME);
    cache.put(request, response.clone());
    trimCache(RUNTIME_NAME, MAX_RUNTIME_ENTRIES);
  }

  return response;
}

// LRU-style eviction: remove oldest entries when cache exceeds limit
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Remove oldest entries (first in list)
    const toRemove = keys.length - maxEntries;
    for (let i = 0; i < toRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
}
