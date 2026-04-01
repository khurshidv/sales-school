"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";
import { TARGET_CASE_IMAGES } from "@/lib/constants";

export default function CasesSection() {
  const { t } = useT();

  const cases = [
    { nameKey: "target.case.1.name" as TranslationKey, descKey: "target.case.1.desc" as TranslationKey, tagKey: "target.case.1.tag" as TranslationKey, img: TARGET_CASE_IMAGES[0] },
    { nameKey: "target.case.2.name" as TranslationKey, descKey: "target.case.2.desc" as TranslationKey, tagKey: "target.case.2.tag" as TranslationKey, img: TARGET_CASE_IMAGES[1] },
    { nameKey: "target.case.3.name" as TranslationKey, descKey: "target.case.3.desc" as TranslationKey, tagKey: "target.case.3.tag" as TranslationKey, img: TARGET_CASE_IMAGES[2] },
  ];

  return (
    <section id="cases" className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-12 md:mb-16 text-on-surface">
            {t("target.cases.heading")}
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {cases.map((c, i) => (
            <FadeUp key={i} delay={i * 100}>
              <div className="bg-white rounded-2xl p-5 md:p-6 double-bezel flex flex-col h-full target-card">
                <div className="relative h-48 mb-5 overflow-hidden rounded-xl">
                  <img
                    className="w-full h-full object-cover"
                    src={c.img}
                    alt={t(c.nameKey)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-xs font-bold bg-primary-container text-white px-2 py-1 rounded-md uppercase">
                      {t(c.tagKey)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-on-surface">{t(c.nameKey)}</h3>
                <p className="text-on-surface-variant text-sm mb-4 grow">{t(c.descKey)}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary">play_circle</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    {t("target.cases.watch")}
                  </span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
