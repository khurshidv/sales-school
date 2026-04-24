"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import { postFunnelEvent, readIdentity } from "@/lib/funnel/progress-client";

const SHOW_AFTER_SCROLL_PX = 240;

export default function StickyConsultationBar() {
  const { t } = useT();
  const { openModal } = useModal();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_SCROLL_PX);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const id = readIdentity();
    postFunnelEvent('final_consultation_opened', {
      leadId: id?.leadId,
      token: id?.token,
      meta: { location: 'sticky_mobile' },
    });
    openModal();
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={handleClick}
        className="cta-btn w-full rounded-full px-8 py-4 text-white font-bold tracking-wide text-base shadow-2xl"
      >
        {t("final.sticky.button")}
      </button>
    </div>
  );
}
