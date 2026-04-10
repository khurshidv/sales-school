"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function PainPoints() {
  const { t } = useT();

  const pains: TranslationKey[] = [
    "target.pain.1",
    "target.pain.2",
    "target.pain.3",
    "target.pain.4",
    "target.pain.5",
  ];

  return (
    <section id="about" className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="mb-12 md:mb-16">
            <span className="text-primary-container text-sm font-bold uppercase tracking-widest">
              {t("target.pain.label")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 text-on-surface">
              {t("target.pain.heading")}
            </h2>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-4">
            {pains.map((key, i) => (
              <FadeUp key={key} delay={i * 80}>
                <div className="flex gap-4 items-start p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group">
                  <span className="material-symbols-outlined text-error mt-0.5 shrink-0 drop-shadow-[0_0_6px_hsl(var(--error)/0.8)] group-hover:drop-shadow-[0_0_10px_hsl(var(--error)/1)] transition-all duration-300">close</span>
                  <p className="text-base md:text-lg text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {t(key)}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={200} direction="right">
            <div className="bg-surface-container rounded-2xl p-8 md:p-12 relative overflow-hidden double-bezel">
              <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 blur-3xl rounded-full" />
              <p className="text-xl md:text-2xl font-light italic leading-relaxed text-on-surface-variant relative z-10">
                &ldquo;{t("target.pain.quote").split(/\*\*(.*?)\*\*/).map((part, i) =>
                  i % 2 === 1 ? (
                    <span key={i} className="text-on-surface font-bold">{part}</span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}&rdquo;
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
