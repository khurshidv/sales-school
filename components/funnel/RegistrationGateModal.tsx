'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
import { getCountryById, DEFAULT_COUNTRY_ID } from '@/lib/phone-countries';
import GameTeaserBlock from './GameTeaserBlock';
import { copy } from '@/lib/funnel/copy';
import { writeIdentity, postFunnelEvent } from '@/lib/funnel/progress-client';

export default function RegistrationGateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [countryId, setCountryId] = useState(DEFAULT_COUNTRY_ID);
  const [fullPhone, setFullPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const country = getCountryById(countryId);
  const isValid = name.trim().length > 0 && phoneDigits.length === country.digits;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePhoneChange = useCallback((digits: string, cId: string, full: string) => {
    setPhoneDigits(digits);
    setCountryId(cId);
    setFullPhone(full);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError(copy.gate.errorGeneric);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/funnel/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: fullPhone,
          landingUrl: window.location.href,
          referrer: document.referrer || null,
        }),
      });
      if (!res.ok) {
        setError(copy.gate.errorGeneric);
        setSubmitting(false);
        return;
      }
      const body = (await res.json()) as { lead_id: string; token: string; next_url: string };
      writeIdentity({ leadId: body.lead_id, token: body.token });
      await postFunnelEvent('lead_created', { leadId: body.lead_id, token: body.token });
      router.push(body.next_url);
    } catch {
      setError(copy.gate.errorGeneric);
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="funnel-gate-title"
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-up"
      style={{ animationDuration: '300ms' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#fbf9f5] rounded-3xl p-8 md:p-10 shadow-2xl border border-outline-variant/15"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.gate.close}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <h3
          id="funnel-gate-title"
          className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-on-surface mb-6 pr-10 leading-tight"
        >
          {copy.gate.title}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={copy.gate.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className="w-full rounded-2xl border border-outline-variant/30 bg-white px-5 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container/40 focus:outline-none transition-all"
          />

          <PhoneInput
            value={phoneDigits}
            countryId={countryId}
            onChange={handlePhoneChange}
            placeholder={copy.gate.phoneLabel}
            className="w-full rounded-2xl border border-outline-variant/30 bg-white px-5 py-4 text-on-surface focus-within:ring-2 focus-within:ring-primary-container/40 focus-within:border-primary-container/40 transition-all"
            inputClassName="text-on-surface placeholder:text-on-surface-variant/50"
            dropdownClassName="bg-white border-outline-variant/20 shadow-xl"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`cta-btn group w-full rounded-full px-8 py-4 text-white font-bold tracking-wide text-base mt-2 inline-flex items-center justify-center gap-3 transition-all duration-200 ${
              !isValid || submitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span className="w-8 shrink-0" aria-hidden="true" />
            <span>{submitting ? copy.gate.submitting : copy.gate.submit}</span>
            <span className="bg-white/20 group-hover:bg-white/32 w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-200">
              <span className="material-symbols-outlined leading-none text-lg">arrow_forward</span>
            </span>
          </button>
        </form>

        <div className="mt-5">
          <GameTeaserBlock />
        </div>
      </div>
    </div>
  );
}
