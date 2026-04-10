"use client";

import CountUp from "../CountUp";
import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function StatsSection() {
  const { t } = useT();

  return (
    <section className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 gap-8 md:gap-12 text-center">
        <FadeUp>
          <div className="space-y-2">
            <p className="text-5xl md:text-7xl font-bold text-primary-container">
              <CountUp target={500} suffix="+" />
            </p>
            <p className="text-on-surface-variant uppercase text-xs tracking-widest">
              {t("target.stats.graduates")}
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="space-y-2">
            <p className="text-5xl md:text-7xl font-bold text-secondary">
              <CountUp target={50} suffix="+" />
            </p>
            <p className="text-on-surface-variant uppercase text-xs tracking-widest">
              {t("target.stats.partners")}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
