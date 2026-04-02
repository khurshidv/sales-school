"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function ContrastBar() {
  const { t } = useT();

  return (
    <section className="bg-surface-container-low py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <FadeUp>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-outline-variant/30">
              <p className="text-on-surface-variant text-sm uppercase">
                {t("target.contrast.avg_label")}
              </p>
              <p className="text-3xl font-bold font-heading text-on-surface">$300</p>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-primary-container">
              <p className="text-primary-container text-sm uppercase font-bold">
                {t("target.contrast.junior_label")}
              </p>
              <p className="text-4xl font-bold font-heading text-gradient-orange">$800+</p>
            </div>
          </FadeUp>

          <FadeUp delay={200}>
            <div className="flex flex-col items-center md:items-start space-y-2 p-6 rounded-2xl bg-white double-bezel border-l-4 border-secondary">
              <p className="text-secondary text-sm uppercase font-bold">
                {t("target.contrast.expert_label")}
              </p>
              <p className="text-3xl font-bold font-heading text-on-surface">$3000+</p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
