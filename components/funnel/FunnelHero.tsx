import { copy } from '@/lib/funnel/copy';

export default function FunnelHero() {
  return (
    <section className="flex flex-col items-center gap-5 text-center px-5 pt-10 md:pt-16 max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-primary)] font-bold">
        {copy.landing.eyebrow}
      </span>
      <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-[color:var(--color-on-surface)] leading-tight">
        {copy.landing.heading}
      </h1>
      <p className="text-base md:text-lg text-[color:var(--color-on-surface)]/80 max-w-2xl">
        {copy.landing.subheading}
      </p>
      <ul className="flex flex-wrap justify-center gap-2 mt-2">
        {copy.landing.bullets.map((b) => (
          <li
            key={b}
            className="rounded-full bg-[color:var(--color-primary-container)]/15 px-4 py-1.5 text-sm font-medium text-[color:var(--color-on-surface)]"
          >
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
