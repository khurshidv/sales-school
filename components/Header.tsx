"use client";

import { useT, type Locale, type TranslationKey } from "@/lib/i18n";
import { WEBINAR_DATE, TG_LINK } from "@/lib/constants";

function formatShortDate(iso: string, t: (key: TranslationKey) => string) {
  const parts = iso.split("T")[0].split("-");
  const day = parseInt(parts[2], 10);
  const monthNum = parseInt(parts[1], 10);
  return `${day} ${t(`month_short.${monthNum}` as TranslationKey)}`;
}

export default function Header() {
  const { t, locale, setLocale } = useT();
  const dateLabel = formatShortDate(WEBINAR_DATE, t);

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Urgency strip */}
      <div className="bg-[#22c55e] text-white px-4 py-2 flex items-center justify-center gap-2 text-[11px] md:text-xs font-bold tracking-wide badge-strip-pulse">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="uppercase tracking-wider">
          {t("hero.badge")} · {dateLabel}, 19:00
        </span>
      </div>

      {/* Main nav */}
      <div className="bg-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-3 md:px-8 h-[52px] md:h-[64px]">

          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="Sales Up" width={1445} height={422} className="h-6 md:h-7 w-auto" />
          </a>

          {/* Language switcher — right */}
          <div className="flex items-center gap-0.5 bg-surface-container rounded-full p-0.5 shrink-0">
            {(["uz", "ru"] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  locale === lang
                    ? "bg-white text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
