"use client";

import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import FadeUp from "@/components/FadeUp";
import { postFunnelEvent, readIdentity } from "@/lib/funnel/progress-client";

interface BlockCtaProps {
  location: string;
}

export default function BlockCta({ location }: BlockCtaProps) {
  const { t } = useT();
  const { openModal } = useModal();

  const handleClick = () => {
    const id = readIdentity();
    postFunnelEvent('final_consultation_opened', {
      leadId: id?.leadId,
      token: id?.token,
      meta: { location },
    });
    openModal();
  };

  return (
    <div className="w-full py-10 md:py-14 bg-background">
      <div className="max-w-3xl mx-auto px-6 md:px-8 flex flex-col items-center gap-4 text-center">
        <FadeUp>
          <p className="text-base md:text-lg text-on-surface-variant">
            {t("final.block_cta.hint")}
          </p>
        </FadeUp>
        <FadeUp delay={60}>
          <button
            type="button"
            onClick={handleClick}
            className="cta-btn rounded-full px-8 py-4 text-white font-bold tracking-wide text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t("final.block_cta.button")}
          </button>
        </FadeUp>
      </div>
    </div>
  );
}
