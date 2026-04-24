"use client";

import { useT } from "@/lib/i18n";
import { useModal } from "@/lib/modal-context";
import FadeUp from "@/components/FadeUp";
import { postFunnelEvent, readIdentity } from "@/lib/funnel/progress-client";

export default function FinalOfferCta() {
  const { t } = useT();
  const { openModal } = useModal();

  const handleClick = () => {
    const id = readIdentity();
    postFunnelEvent('final_consultation_opened', {
      leadId: id?.leadId,
      token: id?.token,
      meta: { location: 'bottom_cta' },
    });
    openModal();
  };

  return (
    <section className="py-20 md:py-28 bg-surface-container">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center flex flex-col items-center gap-6">
        <FadeUp>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-on-surface">
            {t("final.final_cta.heading")}
          </h2>
        </FadeUp>
        <FadeUp delay={60}>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
            {t("final.final_cta.body")}
          </p>
        </FadeUp>
        <FadeUp delay={120}>
          <button
            type="button"
            onClick={handleClick}
            className="cta-btn rounded-full px-10 py-4 text-white font-bold tracking-wide text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t("final.final_cta.button")}
          </button>
        </FadeUp>
      </div>
    </section>
  );
}
