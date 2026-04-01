"use client";

import FlipClock from "./FlipClock";
import CTAButton from "./CTAButton";
import FadeUp from "./FadeUp";
import { useT } from "@/lib/i18n";

export default function ActionSection() {
  const { t } = useT();
  return (
    <section className="py-[35px] md:py-[50px] bg-surface relative overflow-hidden">
      {/* Animated background orbs — larger and more visible */}
      <div className="glow-orb w-80 h-80 bg-primary-container/25 -top-20 -left-20" />
      <div className="glow-orb w-64 h-64 bg-secondary-container/40 -bottom-10 -right-16" style={{ animationDelay: "2s" }} />
      <div className="glow-orb w-48 h-48 bg-primary-fixed/30 top-1/3 right-1/4" style={{ animationDelay: "1s" }} />

      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Heading */}
        <FadeUp delay={0} direction="scale">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl lg:text-6xl text-on-surface mb-6 md:mb-8">
            {t("action.heading")}
          </h2>
        </FadeUp>

        <FadeUp delay={150}>
          <p className="text-lg md:text-xl text-on-surface-variant mb-12 md:mb-16 max-w-2xl mx-auto">
            {t("action.subheading")}
          </p>
        </FadeUp>

        {/* Countdown Timer with prominent glow wrapper */}
        <FadeUp delay={300} direction="scale">
          <div className="mb-16 md:mb-20 relative">
            <div className="absolute -inset-8 bg-primary-container/8 rounded-[2rem] blur-3xl animate-glow-breathe" />
            <div className="relative bg-surface-container-low/40 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-primary-container/10">
              <FlipClock />
            </div>
          </div>
        </FadeUp>

        {/* Final CTA */}
        <FadeUp delay={450}>
          <div className="flex flex-col items-center">
            <CTAButton
              text={t("action.cta")}
              size="large"
              glow
            />
            <p className="mt-8 text-on-surface-variant/60 font-medium italic">
              {t("action.seats")}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
