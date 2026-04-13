"use client";

import CTAButton from "../CTAButton";
import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TARGET_HERO_IMAGE } from "@/lib/constants";

export default function TargetHero() {
  const { t } = useT();

  return (
    <section className="relative pt-[88px] pb-10 md:pt-32 md:pb-20 mesh-hero overflow-hidden overflow-x-clip">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left column */}
        <div className="space-y-8">
          <FadeUp>
            <div className="inline-block bg-primary-container/15 px-3 py-1 rounded-full">
              <span className="text-primary-container font-bold text-xs uppercase tracking-widest">
                {t("target.hero.badge")}
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-heading font-bold tracking-tight leading-[1.12] text-on-surface">
              {t("target.hero.heading").split("$800").map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="text-gradient-orange">$800</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>
          </FadeUp>

          <FadeUp delay={200}>
            <p className="text-lg text-on-surface-variant font-body max-w-lg leading-relaxed">
              {t("target.hero.subheading")}
            </p>
          </FadeUp>

          <FadeUp delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <CTAButton text={t("target.hero.cta")} size="large" glow trackSlug="target" trackSection="hero" />
            </div>
          </FadeUp>
        </div>

        {/* Right column — image */}
        <FadeUp delay={200} direction="right">
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden double-bezel">
              <img
                className="w-full h-auto object-cover"
                src={TARGET_HERO_IMAGE}
                alt="Sales School professional"
                width={600}
                height={750}
                loading="eager"
                fetchPriority="high"
              />
            </div>
            {/* Salary badge — top right */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl double-bezel z-20">
              <div className="flex items-center gap-3">
                <div className="bg-error-container rounded-full p-2">
                  <span className="material-symbols-outlined text-on-error-container">
                    payments
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">
                    O'rtacha oylik
                  </p>
                  <p className="text-xl font-bold text-on-surface">
                    300–400$
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative stat card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl double-bezel z-20">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container rounded-full p-2">
                  <span className="material-symbols-outlined text-on-secondary-container">
                    trending_up
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">
                    {t("target.hero.income_label")}
                  </p>
                  <p className="text-xl font-bold text-secondary">
                    {t("target.hero.income_value")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
