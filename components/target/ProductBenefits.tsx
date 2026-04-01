"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

const ICONS = ["speed", "groups", "work", "laptop_mac"];

export default function ProductBenefits() {
  const { t } = useT();

  const items = [1, 2, 3, 4].map((n) => ({
    icon: ICONS[n - 1],
    title: t(`target.product.${n}.title` as TranslationKey),
    desc: t(`target.product.${n}.desc` as TranslationKey),
  }));

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="max-w-3xl mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6 text-on-surface">
              {t("target.product.heading")}
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              {t("target.product.desc")}
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="space-y-3 md:space-y-4">
                <span className="material-symbols-outlined text-primary-container text-3xl md:text-4xl">
                  {item.icon}
                </span>
                <h4 className="text-base md:text-lg font-bold text-on-surface">{item.title}</h4>
                <p className="text-on-surface-variant text-sm">{item.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
