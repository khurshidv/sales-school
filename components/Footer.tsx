"use client";

import { useT } from "@/lib/i18n";

export default function Footer() {
  const { t } = useT();

  const links = [
    { label: t("footer.privacy"), href: "#" },
    { label: t("footer.terms"), href: "#" },
    { label: t("footer.support"), href: "#" },
  ];

  return (
    <footer className="bg-surface-container-low w-full py-16 md:py-20 pb-28 md:pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 md:px-12">
        <div className="font-[family-name:var(--font-heading)] font-bold text-on-surface text-xl mb-8 md:mb-0">
          Sales School
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-sm text-on-surface-variant">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:underline decoration-primary-container underline-offset-4 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-10 md:mt-0 text-sm text-on-surface-variant/60">
          &copy; {new Date().getFullYear()} Sales School. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
