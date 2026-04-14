import type { MetadataRoute } from 'next';

// PWA manifest scoped to the game. When a user installs the page to their
// home screen (iOS: Share → "Add to Home Screen"; Android Chrome: install
// banner), opening the resulting icon launches /game in standalone mode —
// no browser URL bar, no nav gestures overlapping gameplay. This is the
// only way to get a real fullscreen experience on iOS Safari, which does
// not support document.requestFullscreen() for arbitrary elements.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sales Up — Симуляция',
    short_name: 'SalesUp',
    description: 'RPG тренажёр навыков продаж',
    start_url: '/game',
    scope: '/game',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0a0c12',
    theme_color: '#0a0c12',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
