"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TARGET_PARTNER_LOGOS } from "@/lib/constants";

export default function TrustBar() {
  const { t } = useT();

  return (
    <section className="bg-surface-container-low pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center space-y-8">
        <FadeUp>
          <p className="text-on-surface-variant text-xs uppercase tracking-[0.3em]">
            {t("target.trust.label")}
          </p>
        </FadeUp>
        <FadeUp delay={100}>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40">
            {TARGET_PARTNER_LOGOS.map((logo, i) => (
              <span
                key={i}
                className={`text-xl md:text-2xl font-black tracking-tighter text-on-surface ${
                  i === 0 ? "italic" : ""
                } ${i === 1 ? "tracking-widest" : ""} ${
                  i === 4 ? "underline decoration-primary-container" : ""
                }`}
              >
                {logo}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
