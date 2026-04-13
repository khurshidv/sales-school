// ============================================================
// Service Worker Registration — call once from game layout
// ============================================================

export function registerGameSW(): void {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  // Register after the page loads to not compete with initial resources
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/game' })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
