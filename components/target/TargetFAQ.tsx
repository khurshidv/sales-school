"use client";

import { useState } from "react";
import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function TargetFAQ() {
  const { t } = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`target.faq.${n}.q` as TranslationKey),
    a: t(`target.faq.${n}.a` as TranslationKey),
  }));

  return (
    <section id="faq" className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <FadeUp>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-12 md:mb-16 italic text-on-surface">
            {t("target.faq.heading")}
          </h2>
        </FadeUp>

        <div className="space-y-4">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeUp key={i} delay={i * 80}>
                <div
                  className="bg-white p-5 md:p-6 rounded-2xl double-bezel cursor-pointer faq-item"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base md:text-lg text-on-surface pr-4">
                      {item.q}
                    </h4>
                    <span
                      className="material-symbols-outlined text-primary-container transition-transform duration-300 shrink-0"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    >
                      add
                    </span>
                  </div>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-4 text-sm leading-relaxed text-on-surface-variant">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
