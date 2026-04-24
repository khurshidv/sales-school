'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
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
  const [fullPhone, setFullPhone] = useState('');
  const [countryId, setCountryId] = useState<string>('uz');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePhoneChange = useCallback((_: string, cId: string, full: string) => {
    setCountryId(cId);
    setFullPhone(full);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(copy.gate.errorName);
      return;
    }
    if (!fullPhone.startsWith('+') || fullPhone.replace(/\D/g, '').length < 8) {
      setError(copy.gate.errorPhone);
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-3xl bg-[color:var(--color-surface)] shadow-2xl p-6 md:p-7 flex flex-col gap-5 animate-[scale-in_300ms_cubic-bezier(0.32,0.72,0,1)_forwards]"
      >
        <div className="flex items-start justify-between">
          <h2
            id="funnel-gate-title"
            className="text-xl md:text-2xl font-[family-name:var(--font-heading)] font-bold text-[color:var(--color-on-surface)] leading-tight"
          >
            {copy.gate.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.gate.close}
            className="shrink-0 size-9 rounded-full hover:bg-black/5 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[color:var(--color-on-surface)]/80">
            {copy.gate.nameLabel}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.gate.namePlaceholder}
            autoComplete="name"
            required
            className="rounded-xl border border-[color:var(--color-on-surface-variant)]/30 px-4 py-3 bg-white focus:outline-none focus:border-[color:var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[color:var(--color-on-surface)]/80">
            {copy.gate.phoneLabel}
          </span>
          <PhoneInput
            value={fullPhone}
            countryId={countryId}
            onChange={handlePhoneChange}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[color:var(--color-primary)] text-white font-bold px-6 py-4 disabled:opacity-60"
        >
          {submitting ? copy.gate.submitting : copy.gate.submit}
        </button>

        <GameTeaserBlock />
      </form>
    </div>
  );
}
