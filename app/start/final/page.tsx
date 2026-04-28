"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalProvider } from "@/lib/modal-context";
import RegistrationModal from "@/components/RegistrationModal";
import FinalHero from "@/components/final/FinalHero";
import FinalOfferSection from "@/components/final/FinalOfferSection";
import FinalOfferCta from "@/components/final/FinalOfferCta";
import StickyConsultationBar from "@/components/final/StickyConsultationBar";
import { useT } from "@/lib/i18n";
import { readIdentity, postFunnelEvent } from "@/lib/funnel/progress-client";
import { trackFB } from "@/lib/analytics/fbpixel";

function FinalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLocale } = useT();

  useEffect(() => {
    setLocale('uz');
  }, [setLocale]);

  useEffect(() => {
    const id = readIdentity();
    if (!id) {
      router.replace('/start');
      return;
    }
    fetch('/api/funnel/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((state: null | { current_lesson: number; completed_lessons: number[] }) => {
        if (!state) {
          router.replace('/start');
          return;
        }
        if (!(state.completed_lessons ?? []).includes(4)) {
          router.replace(`/start/dars/${state.current_lesson}`);
          return;
        }
        postFunnelEvent('final_page_viewed', {
          leadId: id.leadId,
          token: id.token,
        });
        trackFB('ViewContent', {
          content_name: 'final_offer',
          content_category: 'offer',
        });
      })
      .catch(() => router.replace('/start'));
  }, [router]);

  const handleSimulator = () => {
    const id = readIdentity();
    const tokenFromQuery = searchParams.get('lead_token');
    const token = tokenFromQuery ?? id?.token ?? '';
    postFunnelEvent('final_cta_simulator_clicked', {
      leadId: id?.leadId,
      token: id?.token,
    });
    trackFB('InitiateCheckout', {
      content_name: 'simulator_start',
      content_category: 'game',
    });
    window.location.href = `/game?lead_token=${encodeURIComponent(token)}`;
  };

  const handleLearnMore = () => {
    const id = readIdentity();
    postFunnelEvent('final_cta_learn_more_clicked', {
      leadId: id?.leadId,
      token: id?.token,
    });
    const el = document.getElementById('ko-proq');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <FinalHero
        onSimulatorClick={handleSimulator}
        onLearnMoreClick={handleLearnMore}
      />
      <FinalOfferSection />
      <FinalOfferCta />
      <StickyConsultationBar />
    </main>
  );
}

export default function FinalPage() {
  return (
    <ModalProvider>
      <Suspense fallback={null}>
        <FinalPageInner />
      </Suspense>
      <RegistrationModal />
    </ModalProvider>
  );
}
