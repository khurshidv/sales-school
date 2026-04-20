"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function ContrastBar() {
  const { t, locale } = useT();
  const mln = locale === "ru" ? "млн" : "mln";

  return (
    <section className="bg-surface-container-low py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <FadeUp>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-outline-variant/30">
              <p className="text-on-surface-variant text-sm uppercase">
                {t("target.contrast.avg_label")}
              </p>
              <p className="text-3xl font-bold font-heading text-on-surface">3,5 {mln}</p>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-primary-container">
              <p className="text-primary-container text-sm uppercase font-bold">
                {t("target.contrast.junior_label")}
              </p>
              <p className="text-4xl font-bold font-heading text-gradient-orange">10 {mln}+</p>
            </div>
          </FadeUp>

          <FadeUp delay={200}>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-secondary">
              <p className="text-secondary text-sm uppercase font-bold">
                {t("target.contrast.expert_label")}
              </p>
              <p className="text-3xl font-bold font-heading text-on-surface">37 {mln}+</p>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={300}>
          <div className="mt-8 rounded-2xl bg-white double-bezel p-6">
            <p className="text-sm uppercase text-on-surface-variant mb-6">
              {t("target.contrast.growth_title")}
            </p>
            <div className="flex items-end gap-4 h-32">
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-on-surface">5–6 {mln}</span>
                <div className="w-full h-10 rounded-t-lg bg-outline-variant/30" />
                <span className="text-xs text-on-surface-variant">{t("target.contrast.month1")}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-on-surface">7–10 {mln}</span>
                <div className="w-full h-16 rounded-t-lg bg-secondary/40" />
                <span className="text-xs text-on-surface-variant">{t("target.contrast.month2")}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-gradient-orange">12 {mln}+</span>
                <div className="w-full h-24 rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-400" />
                <span className="text-xs text-on-surface-variant font-semibold">{t("target.contrast.month3")}</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
