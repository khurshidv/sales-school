"use client";

import FadeUp from "./FadeUp";
import { useT } from "@/lib/i18n";

export default function BeforeAfter() {
  const { t } = useT();

  const beforeItems = [
    t("ba.before1"),
    t("ba.before2"),
    t("ba.before3"),
  ];

  const afterItems = [
    t("ba.after1"),
    t("ba.after2"),
    t("ba.after3"),
  ];
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
      {/* Before */}
      <FadeUp delay={0} direction="left">
        <div className="bg-surface-container-low p-8 md:p-10 rounded-3xl opacity-60 border border-outline-variant/5 h-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-outline">error_outline</span>
            <span className="font-bold uppercase text-xs tracking-widest text-on-surface-variant">{t("ba.now")}</span>
          </div>
          <ul className="space-y-4">
            {beforeItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-on-surface-variant">
                <span className="w-1.5 h-1.5 bg-outline rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </FadeUp>

      {/* After */}
      <FadeUp delay={200} direction="right">
        <div className="shimmer-border bg-gradient-to-br from-white via-white to-[#fff8e7] p-8 md:p-10 rounded-3xl double-bezel border-t-4 border-[#d4af37] relative overflow-visible h-full">
          <div className="absolute -top-3 right-4 bg-gradient-to-r from-[#d4af37] to-[#e8790a] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
            {t("ba.goal")}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary-container">check_circle</span>
            <span className="font-bold uppercase text-xs tracking-widest text-primary-container">{t("ba.after_label")}</span>
          </div>
          <ul className="space-y-4">
            {afterItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-on-surface font-semibold text-lg">
                <span className="material-symbols-outlined text-primary-container shrink-0">bolt</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </FadeUp>
    </div>
  );
}
