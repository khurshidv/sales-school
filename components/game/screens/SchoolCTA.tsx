'use client';

import { m } from 'framer-motion';
import { schoolCtaCopy, type SchoolCtaEnding } from './schoolCtaCopy';

interface SchoolCTAProps {
  ending: SchoolCtaEnding;
  lang: 'uz' | 'ru';
  playerPhone?: string;
  onConsultation: () => void;
  onDismiss: () => void;
}

export default function SchoolCTA({
  ending,
  lang,
  playerPhone,
  onConsultation,
  onDismiss,
}: SchoolCTAProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1225 50%, #0f172a 100%)',
      }}
    >
      <m.div
        className="flex flex-col items-center max-w-lg w-full px-6 py-8 gap-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Headline */}
        <m.h1
          className="text-2xl md:text-3xl font-bold leading-tight"
          style={{ color: '#f9fafb' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {schoolCtaCopy.headlines[ending][lang]}
        </m.h1>

        {/* School info */}
        <m.div
          className="flex flex-col gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div
            className="rounded-xl px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: '#e5e7eb' }}>
              {schoolCtaCopy.schoolInfo.tagline[lang]}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
              {schoolCtaCopy.schoolInfo.features[lang]}
            </p>
          </div>

          <div
            className="rounded-xl px-5 py-3"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <p className="text-sm" style={{ color: '#86efac' }}>
              {schoolCtaCopy.schoolInfo.results[lang]}
            </p>
          </div>
        </m.div>

        {/* CTA Button */}
        <m.button
          onClick={onConsultation}
          className="w-full rounded-xl px-6 py-4 text-sm font-semibold transition-all relative overflow-hidden"
          style={{
            color: '#0a0a0a',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: [
              '0 0 15px rgba(251,191,36,0.2)',
              '0 0 30px rgba(251,191,36,0.35)',
              '0 0 15px rgba(251,191,36,0.2)',
            ],
          }}
          transition={{
            opacity: { delay: 0.8, duration: 0.4 },
            scale: { delay: 0.8, duration: 0.4 },
            boxShadow: { delay: 1.2, duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {schoolCtaCopy.ctaText[ending][lang]}
        </m.button>

        {/* Dismiss */}
        <m.button
          onClick={onDismiss}
          className="text-xs py-2 transition-colors"
          style={{ color: '#6b7280' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ color: '#9ca3af' }}
        >
          {schoolCtaCopy.dismissText[lang]}
        </m.button>
      </m.div>
    </div>
  );
}
