"use client";

import { useT } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

interface FinalHeroProps {
  onSimulatorClick: () => void;
  onLearnMoreClick: () => void;
}

export default function FinalHero({ onSimulatorClick, onLearnMoreClick }: FinalHeroProps) {
  const { t } = useT();

  return (
    <section className="relative w-full px-5 md:px-8 pt-6 md:pt-12 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
        <FadeUp>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-container/15 px-4 py-1.5 text-sm font-medium text-[color:var(--color-primary)]">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {t("final.hero.badge")}
          </span>
        </FadeUp>

        <FadeUp delay={60}>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold leading-tight text-on-surface">
            {t("final.hero.heading")}
          </h1>
        </FadeUp>

        <FadeUp delay={120}>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            {t("final.hero.subheading")}
          </p>
        </FadeUp>

        <FadeUp delay={180}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-2">
            <button
              type="button"
              onClick={onSimulatorClick}
              className="cta-btn rounded-full px-8 py-4 text-white font-bold tracking-wide text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("final.hero.cta_simulator")}
            </button>
            <button
              type="button"
              onClick={onLearnMoreClick}
              className="rounded-full px-8 py-4 font-bold tracking-wide text-base border-2 border-outline-variant/40 bg-white/60 hover:bg-white text-on-surface transition-all"
            >
              {t("final.hero.cta_learn_more")}
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
