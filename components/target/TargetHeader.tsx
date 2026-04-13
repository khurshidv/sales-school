"use client";

import { useState } from "react";
import { useT, type TranslationKey } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import { trackCTAClick } from "@/lib/analytics/events";

const NAV_ITEMS: { key: TranslationKey; href: string }[] = [
  { key: "target.nav.about", href: "#about" },
  { key: "target.nav.program", href: "#program" },
  { key: "target.nav.cases", href: "#cases" },
  { key: "target.nav.mentors", href: "#mentors" },
];

export default function TargetHeader() {
  const { t, locale, setLocale } = useT();
  const { openModal } = useModal();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md ambient-glow">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 h-16 md:h-20">
        <div className="text-lg md:text-xl font-bold text-on-surface tracking-tighter">
          SALES UP
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 lg:gap-8 items-center">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              className="text-on-surface-variant hover:text-on-surface transition-colors text-xs uppercase tracking-widest"
              href={item.href}
            >
              {t(item.key)}
            </a>
          ))}

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
            className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/20 px-3 py-1.5 rounded-full"
          >
            {locale === "ru" ? "UZ" : "RU"}
          </button>

          <button
            onClick={() => { trackCTAClick('target', 'header_cta', t("target.nav.cta"), 'header'); openModal(); }}
            className="cta-btn text-white font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-all text-sm"
          >
            {t("target.nav.cta")}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
            className="text-xs uppercase tracking-widest text-on-surface-variant border border-outline-variant/20 px-2.5 py-1 rounded-full"
          >
            {locale === "ru" ? "UZ" : "RU"}
          </button>
          <button
            className="text-primary-container"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-outline-variant/10 px-6 pb-6 pt-4 space-y-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              className="block text-on-surface-variant hover:text-on-surface transition-colors text-sm uppercase tracking-widest py-2"
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {t(item.key)}
            </a>
          ))}
          <button
            onClick={() => { trackCTAClick('target', 'mobile_menu_cta', t("target.nav.cta"), 'mobile_menu'); openModal(); setMobileOpen(false); }}
            className="w-full cta-btn text-white font-bold px-5 py-3 rounded-full text-sm mt-2"
          >
            {t("target.nav.cta")}
          </button>
        </div>
      )}
    </nav>
  );
}
