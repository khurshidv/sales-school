"use client";

import CTAButton from "../CTAButton";
import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function PricingSection() {
  const { t } = useT();

  const features = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) =>
    t(`target.pricing.feat.${n}` as TranslationKey)
  );

  return (
    <section id="pricing" className="py-20 md:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
            <span className="text-secondary text-sm font-bold uppercase tracking-widest">
              {t("target.pricing.label")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4 mb-4 text-on-surface">
              {t("target.pricing.heading")}
            </h2>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              {t("target.pricing.subheading")}
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="relative bg-white rounded-3xl double-bezel border border-primary-container/20 overflow-hidden">
            {/* Decorative gradient */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #e8790a 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative grid md:grid-cols-2 gap-0">
              {/* Left: price */}
              <div className="p-8 md:p-10 lg:p-12 border-b md:border-b-0 md:border-r border-outline-variant/15 flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <span className="inline-block bg-primary-container/10 text-primary-container text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                    {t("target.pricing.card.badge")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">
                    {t("target.pricing.card.title")}
                  </h3>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-5xl md:text-6xl font-bold text-on-surface tabular-nums leading-none">
                        {t("target.pricing.card.price")}
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-on-surface-variant">
                        {t("target.pricing.card.currency")}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-3">
                      {t("target.pricing.card.note")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CTAButton
                    text={t("target.pricing.cta")}
                    size="large"
                    fullWidth
                    trackSlug="target"
                    trackSection="pricing"
                  />
                  <p className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "18px" }}>
                      schedule
                    </span>
                    {t("target.pricing.guarantee")}
                  </p>
                </div>
              </div>

              {/* Right: features */}
              <div className="p-8 md:p-10 lg:p-12">
                <ul className="space-y-3 md:space-y-3.5">
                  {features.map((feat, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="text-sm md:text-base text-on-surface leading-snug">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
