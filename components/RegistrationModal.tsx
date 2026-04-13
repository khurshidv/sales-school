"use client";

import { useEffect, useRef, useState } from "react";
import { useModal } from "@/lib/modal-context";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { getUTMParams } from "@/lib/analytics/utm";
import { detectDeviceType, detectBrowser } from "@/lib/analytics/device";

function getSourcePage(): string {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path.startsWith('/target')) return 'target';
  return 'home';
}

export default function RegistrationModal() {
  const { isOpen, closeModal } = useModal();
  const { t } = useT();
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  function handleBackdrop(e: React.MouseEvent) {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-up"
      style={{ animationDuration: "300ms" }}
      onClick={handleBackdrop}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-md bg-[#fbf9f5] rounded-3xl p-8 md:p-10 shadow-2xl border border-outline-variant/15"
      >
        {/* Close */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Heading */}
        <h3 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-on-surface mb-2 pr-10">
          {t("modal.heading")}
        </h3>
        <p className="text-on-surface-variant text-sm mb-8">
          {t("modal.subtitle")}
        </p>

        {/* Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            try {
              const utm = getUTMParams();
              const supabase = createClient();
              await supabase.from('leads').insert({
                name: name.trim(),
                phone: phone.trim(),
                source_page: getSourcePage(),
                utm_source: utm.utm_source,
                utm_medium: utm.utm_medium,
                utm_campaign: utm.utm_campaign,
                device_type: detectDeviceType(),
                browser: detectBrowser(),
                referrer: utm.referrer,
              });
            } catch {
              // fire-and-forget, don't block Telegram redirect
            }
            window.open('https://t.me/salesup_uz', '_blank', 'noopener');
            setSubmitting(false);
            setName('');
            setPhone('');
            closeModal();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder={t("modal.name")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-outline-variant/30 bg-white px-5 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container/40 focus:outline-none transition-all"
          />
          <input
            type="tel"
            placeholder={t("modal.phone")}
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-outline-variant/30 bg-white px-5 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container/40 focus:outline-none transition-all"
          />

          <button
            type="submit"
            className="cta-btn w-full rounded-full px-8 py-4 text-white font-bold tracking-wide text-base mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("modal.submit")}
          </button>
        </form>

        {/* Privacy */}
        <p className="text-on-surface-variant/50 text-xs text-center mt-5 leading-relaxed">
          {t("modal.privacy")}
        </p>
      </div>
    </div>
  );
}
