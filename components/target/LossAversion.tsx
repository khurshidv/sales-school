"use client";

import CTAButton from "../CTAButton";
import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function LossAversion() {
  const { t, locale } = useT();

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Visual chart */}
        <FadeUp direction="left">
          <div className="relative aspect-square md:aspect-video bg-white rounded-2xl p-6 md:p-8 double-bezel overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #e8790a 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="h-full flex flex-col justify-end space-y-4 relative z-10">
              <div className="flex items-end gap-4 h-2/3">
                <div className="w-1/3 bg-surface-container rounded-t-lg h-1/4 relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-on-surface-variant whitespace-nowrap">
                    {t("target.loss.chart_regular")}
                  </div>
                </div>
                <div className="w-1/3 bg-primary-container rounded-t-lg h-full relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-primary-container whitespace-nowrap">
                    {t("target.loss.chart_school")}
                  </div>
                </div>
                <div className="w-1/3 bg-secondary rounded-t-lg h-2/3 relative opacity-50">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-secondary whitespace-nowrap">
                    {t("target.loss.chart_year")}
                  </div>
                </div>
              </div>
              <div className="border-t border-outline-variant/30 pt-4 flex justify-between text-[10px] uppercase tracking-widest text-on-surface-variant">
                <span>{t("target.loss.chart_start")}</span>
                <span>{t("target.loss.chart_3m")}</span>
                <span>{t("target.loss.chart_12m")}</span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Text */}
        <div className="space-y-6 md:space-y-8">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight text-on-surface">
              {(() => {
                const highlight = locale === "ru" ? "6 млн сум" : "6 mln so'm";
                return t("target.loss.heading").split(highlight).map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="text-error">{highlight}</span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                );
              })()}
            </h2>
          </FadeUp>

          <FadeUp delay={100}>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
              {t("target.loss.desc")}
            </p>
          </FadeUp>

          <FadeUp delay={200}>
            <CTAButton text={t("target.loss.cta")} size="large" trackSlug="target" trackSection="loss_aversion" />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
