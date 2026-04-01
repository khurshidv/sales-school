"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useT();

  const items = [
    { q: t("faq.1.q"), a: t("faq.1.a") },
    { q: t("faq.2.q"), a: t("faq.2.a") },
    { q: t("faq.3.q"), a: t("faq.3.a") },
    { q: t("faq.4.q"), a: t("faq.4.a") },
  ];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="faq-item bg-white p-6 md:p-8 rounded-2xl double-bezel group cursor-pointer"
            onClick={() => toggle(i)}
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
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <p className="pt-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
