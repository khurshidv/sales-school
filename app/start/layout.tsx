import type { Metadata } from 'next';
import FacebookPixel from '@/components/analytics/FacebookPixel';

export const metadata: Metadata = {
  title: 'SalesUp — 4 ta bepul dars',
  description:
    "Sotuv bo'yicha 4 ta qisqa dars va yakunda interaktiv simulyator.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      lang="uz"
      className="min-h-dvh bg-[color:var(--color-background)] text-[color:var(--color-on-surface)]"
    >
      {/* Meta Pixel — only loaded on /start and its subroutes. */}
      <FacebookPixel />

      {/* Speed up third-party requests kicked off after interaction. */}
      <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />

      <header className="flex justify-center pt-8 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Sales Up" width={148} height={28} className="h-7 md:h-8 w-auto" />
      </header>
      {children}
    </div>
  );
}
