"use client";

import CTAButton from "../CTAButton";
import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function FinalCTA() {
  const { t } = useT();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 100% 0%, #e8790a 0%, transparent 50%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center relative z-10">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-heading font-black mb-6 md:mb-8 leading-tight text-on-surface">
            {t("target.cta.heading")}
          </h2>
        </FadeUp>
        <FadeUp delay={100}>
          <p className="text-lg md:text-xl text-on-surface-variant mb-10 md:mb-12 max-w-2xl mx-auto">
            {t("target.cta.desc")}
          </p>
        </FadeUp>
        <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <CTAButton text={t("target.cta.primary")} size="large" glow />
            <button className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface font-bold px-8 md:px-12 py-4 md:py-5 rounded-full text-base md:text-lg transition-all">
              {t("target.cta.secondary")}
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
