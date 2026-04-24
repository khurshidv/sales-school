import type { Metadata } from 'next';

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
      <header className="flex justify-center pt-8 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Sales Up" className="h-7 md:h-8 w-auto" />
      </header>
      {children}
    </div>
  );
}
