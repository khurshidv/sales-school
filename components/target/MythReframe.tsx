"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";

export default function MythReframe() {
  const { t } = useT();

  return (
    <section className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16 italic text-on-surface">
            {t("target.myth.heading")}
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-px bg-outline-variant/20 rounded-2xl overflow-hidden">
          {/* Left — myths */}
          <FadeUp direction="left">
            <div className="bg-white p-8 md:p-12 lg:p-16 h-full">
              <h3 className="text-on-surface-variant uppercase text-xs tracking-widest mb-8 md:mb-10">
                {t("target.myth.left_title")}
              </h3>
              <ul className="space-y-6 md:space-y-8">
                <li className="flex items-center gap-4 text-on-surface-variant/60">
                  <span className="material-symbols-outlined shrink-0">phone_disabled</span>
                  <span>{t("target.myth.left_1")}</span>
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant/60">
                  <span className="material-symbols-outlined shrink-0">error</span>
                  <span>{t("target.myth.left_2")}</span>
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant/60">
                  <span className="material-symbols-outlined shrink-0">trending_down</span>
                  <span>{t("target.myth.left_3")}</span>
                </li>
              </ul>
            </div>
          </FadeUp>

          {/* Right — reality */}
          <FadeUp direction="right">
            <div className="bg-surface-container-high p-8 md:p-12 lg:p-16 relative h-full">
              <div className="absolute top-4 right-4">
                <span className="material-symbols-outlined text-primary-container text-3xl md:text-4xl">
                  verified
                </span>
              </div>
              <h3 className="text-primary-container uppercase text-xs font-bold tracking-widest mb-8 md:mb-10">
                {t("target.myth.right_title")}
              </h3>
              <ul className="space-y-6 md:space-y-8">
                <li className="flex items-center gap-4 text-on-surface">
                  <span className="material-symbols-outlined text-primary-container shrink-0">psychology</span>
                  <span className="font-bold">{t("target.myth.right_1")}</span>
                </li>
                <li className="flex items-center gap-4 text-on-surface">
                  <span className="material-symbols-outlined text-primary-container shrink-0">account_balance_wallet</span>
                  <span className="font-bold">{t("target.myth.right_2")}</span>
                </li>
                <li className="flex items-center gap-4 text-on-surface">
                  <span className="material-symbols-outlined text-primary-container shrink-0">stars</span>
                  <span className="font-bold">{t("target.myth.right_3")}</span>
                </li>
              </ul>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
