import { copy } from '@/lib/funnel/copy';

export default function GameTeaserBlock() {
  return (
    <aside
      aria-label={copy.gate.teaser.heading}
      className="rounded-2xl border border-[color:var(--color-primary-container)]/40 bg-[color:var(--color-primary-container)]/10 p-4 flex items-start gap-3"
    >
      <span
        aria-hidden
        className="shrink-0 size-10 rounded-full bg-[color:var(--color-primary-container)] text-white flex items-center justify-center"
      >
        <span className="material-symbols-outlined">sports_esports</span>
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-[color:var(--color-on-surface)] leading-tight">
          {copy.gate.teaser.heading}
        </p>
        <p className="text-sm text-[color:var(--color-on-surface)]/80">
          {copy.gate.teaser.body}
        </p>
      </div>
    </aside>
  );
}
