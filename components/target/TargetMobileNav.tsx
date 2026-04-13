"use client";

import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import { trackCTAClick } from "@/lib/analytics/events";

export default function TargetMobileNav() {
  const { t } = useT();
  const { openModal } = useModal();

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center items-center z-50 bg-background/95 backdrop-blur-md md:hidden safe-bottom">
      <button
        onClick={() => { trackCTAClick('target', 'mobile_nav', t("target.mobile.cta"), 'mobile_nav'); openModal(); }}
        className="flex flex-row items-center justify-center cta-btn text-white rounded-full w-full py-4 mx-2 font-bold text-sm uppercase active:scale-[0.98] transition-transform"
      >
        <span className="material-symbols-outlined mr-2">payments</span>
        {t("target.mobile.cta")}
      </button>
    </div>
  );
}
