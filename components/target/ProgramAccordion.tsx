"use client";

import { useState } from "react";
import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function ProgramAccordion() {
  const { t } = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const modules = [1, 2, 3, 4].map((n) => ({
    range: t(`target.program.module.${n}.range` as TranslationKey),
    title: t(`target.program.module.${n}.title` as TranslationKey),
  }));

  const outcomes = [1, 2, 3, 4].map((n) =>
    t(`target.program.outcome.${n}` as TranslationKey)
  );

  return (
    <section id="program" className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="text-center mb-12 md:mb-16">
            <span className="text-secondary text-sm font-bold uppercase tracking-widest">
              {t("target.program.label")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4 text-on-surface">
              {t("target.program.heading")}
            </h2>
            <p className="text-on-surface-variant mt-2">{t("target.program.lessons")}</p>
          </div>
        </FadeUp>

        {/* Outcomes */}
        <FadeUp delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {outcomes.map((outcome, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-white rounded-xl double-bezel">
                <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
                  check_circle
                </span>
                <span className="text-sm text-on-surface">{outcome}</span>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Accordion */}
        <div className="space-y-3">
          {modules.map((mod, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeUp key={i} delay={150 + i * 50}>
                <div className="bg-white double-bezel rounded-xl overflow-hidden">
                  <button
                    className="w-full p-5 md:p-6 flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <div className="flex gap-4 items-center">
                      <span className="text-primary-container font-black">{mod.range}</span>
                      <span className="font-bold text-on-surface">{mod.title}</span>
                    </div>
                    <span
                      className="material-symbols-outlined text-primary-container transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Certificate */}
        <FadeUp delay={400}>
          <div className="mt-10 md:mt-12 p-6 md:p-8 bg-white double-bezel border border-primary-container/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="bg-primary-container/10 p-4 rounded-full shrink-0">
              <span className="material-symbols-outlined text-primary-container text-3xl md:text-4xl">
                workspace_premium
              </span>
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-bold mb-1 text-on-surface">
                {t("target.program.cert.title")}
              </h4>
              <p className="text-on-surface-variant text-sm">
                {t("target.program.cert.desc")}
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
