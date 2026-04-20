"use client";

import { useT } from "@/lib/i18n";

export default function TargetFooter() {
  const { t } = useT();

  return (
    <footer className="w-full py-16 md:py-20 border-t border-outline-variant/10 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <img src="/logo.svg" alt="Sales Up" width={1445} height={422} className="h-8 w-auto" />
          <p className="text-sm text-on-surface-variant">
            {t("target.footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="text-on-surface font-bold mb-4 md:mb-6">{t("target.footer.explore")}</h4>
          <ul className="space-y-3 md:space-y-4 text-sm text-on-surface-variant">
            <li><a className="hover:text-primary-container transition-colors" href="#about">{t("target.footer.about")}</a></li>
            <li><a className="hover:text-primary-container transition-colors" href="#program">{t("target.footer.program")}</a></li>
            <li><a className="hover:text-primary-container transition-colors" href="#cases">{t("target.footer.reviews")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-surface font-bold mb-4 md:mb-6">{t("target.footer.contact")}</h4>
          <ul className="space-y-3 md:space-y-4 text-sm text-on-surface-variant">
            <li><a className="hover:text-primary-container transition-colors" href="#">{t("target.footer.contact_us")}</a></li>
            <li><a className="hover:text-primary-container transition-colors" href="#">{t("target.footer.support")}</a></li>
            <li><a className="hover:text-primary-container transition-colors" href="#">{t("target.footer.join")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-surface font-bold mb-4 md:mb-6">{t("target.footer.legal")}</h4>
          <ul className="space-y-3 md:space-y-4 text-sm text-on-surface-variant">
            <li><a className="hover:text-primary-container transition-colors" href="#">{t("target.footer.privacy")}</a></li>
            <li><a className="hover:text-primary-container transition-colors" href="#">{t("target.footer.terms")}</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-16 md:mt-20 pt-6 md:pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant">
        <div>© {new Date().getFullYear()} {t("target.footer.rights")}</div>
        <div className="flex gap-6">
          <span className="material-symbols-outlined cursor-pointer hover:text-primary-container transition-colors">language</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary-container transition-colors">share</span>
        </div>
      </div>
    </footer>
  );
}
