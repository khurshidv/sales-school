import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sales School — Игра',
    short_name: 'Sales School',
    start_url: '/game',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0a0c12',
    theme_color: '#0a0c12',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
