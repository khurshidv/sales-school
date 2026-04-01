"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function ForWhom() {
  const { t } = useT();

  const yesItems: TranslationKey[] = ["target.whom.yes_1", "target.whom.yes_2", "target.whom.yes_3"];
  const noItems: TranslationKey[] = ["target.whom.no_1", "target.whom.no_2", "target.whom.no_3"];

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 md:mb-16 italic text-on-surface">
            {t("target.whom.heading")}
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <FadeUp direction="left">
            <div className="bg-white p-8 md:p-10 rounded-2xl double-bezel border-t-4 border-primary-container">
              <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-on-surface">
                {t("target.whom.yes_title")}
              </h3>
              <ul className="space-y-5 md:space-y-6">
                {yesItems.map((key) => (
                  <li key={key} className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-primary-container shrink-0">check_circle</span>
                    <span className="text-on-surface">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp direction="right">
            <div className="bg-white p-8 md:p-10 rounded-2xl double-bezel border-t-4 border-outline-variant/30">
              <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-on-surface-variant">
                {t("target.whom.no_title")}
              </h3>
              <ul className="space-y-5 md:space-y-6">
                {noItems.map((key) => (
                  <li key={key} className="flex gap-4 items-start text-on-surface-variant">
                    <span className="material-symbols-outlined opacity-50 shrink-0">cancel</span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
