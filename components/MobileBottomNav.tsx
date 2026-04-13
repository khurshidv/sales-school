"use client";

import { useEffect, useState } from "react";
import { WEBINAR_DATE } from "@/lib/constants";
import { useModal } from "@/lib/modal-context";
import { useT, type TranslationKey } from "@/lib/i18n";
import { trackCTAClick } from "@/lib/analytics/events";

function formatDateShort(iso: string, monthFn: (key: TranslationKey) => string) {
  const parts = iso.split("T")[0].split("-");
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10);
  const month = monthFn(`month_short.${monthIndex}` as TranslationKey);
  return `${day} ${month}, 19:00`;
}

export default function MobileBottomNav() {
  const [visible, setVisible] = useState(false);
  const { t } = useT();
  const { openModal } = useModal();

  const dateLabel = formatDateShort(WEBINAR_DATE, t);

  useEffect(() => {
    const target = document.getElementById("hero-cta");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full h-24 flex justify-between items-center px-6 md:hidden bg-white/90 backdrop-blur-md z-50 rounded-t-[2.5rem] border-t border-on-surface/5 shadow-[0_-4px_20px_rgba(27,28,26,0.04)] transition-all duration-300 safe-bottom ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-on-surface-variant shrink-0">
        <span className="material-symbols-outlined text-base">calendar_today</span>
        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 whitespace-nowrap">
          {dateLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={() => { trackCTAClick('home', 'mobile_nav', t("nav.grab_seat"), 'mobile_nav'); openModal(); }}
        className="flex items-center gap-2 cta-btn text-white rounded-full px-8 py-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="text-xs font-bold uppercase tracking-widest">
          {t("nav.grab_seat")}
        </span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </nav>
  );
}
