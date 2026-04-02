"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TARGET_FOUNDER_IMAGE } from "@/lib/constants";

export default function FounderSection() {
  const { t } = useT();

  return (
    <section className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Image */}
          <FadeUp direction="left">
            <div className="relative order-1">
              <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden double-bezel">
                <img
                  className="w-full h-full object-cover"
                  src={TARGET_FOUNDER_IMAGE}
                  alt={t("target.founder.name")}
                  width={400}
                  height={500}
                  loading="lazy"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary-container/10 blur-3xl rounded-full" />
            </div>
          </FadeUp>

          {/* Bio */}
          <div className="order-2 space-y-6 md:space-y-8">
            <FadeUp>
              <span className="text-primary-container text-sm font-bold uppercase tracking-widest">
                {t("target.founder.label")}
              </span>
            </FadeUp>
            <FadeUp delay={100}>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-on-surface">
                {t("target.founder.name")}
              </h2>
            </FadeUp>
            <FadeUp delay={150}>
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                {t("target.founder.bio")}
              </p>
            </FadeUp>
            <FadeUp delay={200}>
              <blockquote className="border-l-4 border-secondary pl-6 py-2 italic text-lg md:text-xl text-on-surface">
                &ldquo;{t("target.founder.quote")}&rdquo;
              </blockquote>
            </FadeUp>
            <FadeUp delay={250}>
              <div className="flex gap-8 md:gap-12">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-on-surface">
                    {t("target.founder.stat1")}
                  </p>
                  <p className="text-xs text-on-surface-variant uppercase">
                    {t("target.founder.stat1_label")}
                  </p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-on-surface">
                    {t("target.founder.stat2")}
                  </p>
                  <p className="text-xs text-on-surface-variant uppercase">
                    {t("target.founder.stat2_label")}
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
