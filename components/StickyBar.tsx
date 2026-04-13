"use client";

import { useEffect, useState } from "react";
import { WEBINAR_DATE } from "@/lib/constants";
import { useModal } from "@/lib/modal-context";
import { useT, type TranslationKey } from "@/lib/i18n";
import { trackCTAClick } from "@/lib/analytics/events";

function formatDate(iso: string, monthFn: (key: TranslationKey) => string) {
  const parts = iso.split("T")[0].split("-");
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10);
  const month = monthFn(`month.${monthIndex}` as TranslationKey);
  return `${day} ${month}`;
}

export default function StickyBar() {
  const [visible, setVisible] = useState(false);
  const { t } = useT();
  const { openModal } = useModal();

  const dateLabel = formatDate(WEBINAR_DATE, t);

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
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[rgba(238,243,210,0.85)] backdrop-blur-lg shadow-[0_-1px_0_rgba(0,0,0,0.05)] transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 md:h-16">
        <div className="text-sm font-semibold text-on-surface-variant">
          <span>{dateLabel}, 19:00</span>
          <span className="hidden md:inline text-on-surface-variant/50">
            {" "}— {t("sticky.free")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => { trackCTAClick('home', 'sticky_bar', t("nav.grab_seat"), 'sticky'); openModal(); }}
          className="inline-flex items-center rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          {t("nav.grab_seat")}
          <span className="ml-1.5">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
