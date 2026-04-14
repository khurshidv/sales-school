'use client';

import { m } from 'framer-motion';
import { DIMENSION_META } from '@/game/data/dimensions';
import type { ScoreDimension } from '@/game/engine/types';
import {
  schoolCtaHeadlines,
  schoolCtaBridge,
  schoolBenefits,
  studentCases,
  schoolStats,
  programModules,
  dimensionLessonMap,
  recommendationLabel,
  ctaButtonText,
  dismissOptions,
  schoolTagline,
  type ConclusionEnding,
} from './conclusionCopy';

interface SchoolCTAProps {
  ending: ConclusionEnding;
  lang: 'uz' | 'ru';
  weakestDimension?: string;
  onConsultation: () => void;
  onDismiss: () => void;
}

export default function SchoolCTA({
  ending,
  lang,
  weakestDimension,
  onConsultation,
  onDismiss,
}: SchoolCTAProps) {
  const weakDim = weakestDimension as ScoreDimension | undefined;
  const lessonRec = weakDim ? dimensionLessonMap[weakDim] : null;
  const weakLabel = weakDim ? DIMENSION_META[weakDim]?.label[lang] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1225 50%, #0f172a 100%)',
      }}
    >
      <div className="min-h-full flex flex-col items-center px-4 py-8 gap-5 max-w-lg mx-auto">
        {/* ── Headline ── */}
        <m.h1
          className="text-2xl md:text-3xl font-bold leading-tight text-center"
          style={{ color: '#f9fafb' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {schoolCtaHeadlines[ending][lang]}
        </m.h1>

        {/* ── Bridge (Rustam's voice) ── */}
        <m.p
          className="text-sm text-center leading-relaxed italic"
          style={{ color: '#9ca3af' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          &ldquo;{schoolCtaBridge[lang]}&rdquo;
        </m.p>

        {/* ── School tagline ── */}
        <m.div
          className="w-full rounded-xl px-5 py-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: '#e5e7eb' }}>
            {schoolTagline[lang]}
          </p>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            {schoolStats.lessons} {lang === 'uz' ? "intensiv dars" : 'интенсивных уроков'} · {schoolStats.graduates} {lang === 'uz' ? 'bitiruvchi' : 'выпускников'} · {schoolStats.partners} {lang === 'uz' ? 'hamkor' : 'партнёров'}
          </p>
        </m.div>

        {/* ── Benefits grid ── */}
        <m.div
          className="w-full grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {schoolBenefits.map((b, i) => (
            <div
              key={i}
              className="rounded-lg px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#e5e7eb' }}>
                {b.title[lang]}
              </p>
              <p className="text-[10px] leading-snug" style={{ color: '#6b7280' }}>
                {b.desc[lang]}
              </p>
            </div>
          ))}
        </m.div>

        {/* ── Program modules ── */}
        <m.div
          className="w-full rounded-xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#e5e7eb' }}>
            {lang === 'uz' ? 'Dastur' : 'Программа'}
          </p>
          <div className="space-y-1.5">
            {programModules.map((mod, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-mono shrink-0" style={{ color: '#6b7280' }}>
                  {mod.range}
                </span>
                <span className="text-[11px]" style={{ color: '#9ca3af' }}>
                  {mod.title[lang]}
                </span>
              </div>
            ))}
          </div>
        </m.div>

        {/* ── Personalized recommendation ── */}
        {lessonRec && weakLabel && (
          <m.div
            className="w-full rounded-xl px-5 py-4"
            style={{
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: '#fbbf24' }}>
              {recommendationLabel[lang]}
            </p>
            <p className="text-sm font-medium mb-1" style={{ color: '#e5e7eb' }}>
              {lessonRec.lesson[lang]}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
              {lessonRec.detail[lang]}
            </p>
            <p className="text-[10px] mt-2" style={{ color: '#6b7280' }}>
              {lang === 'uz'
                ? `Sizning "${weakLabel}" ko'rsatkichingiz past — aynan shu dars bunga bag'ishlangan.`
                : `Ваш показатель «${weakLabel}» ниже остальных — именно этот урок посвящён этому навыку.`}
            </p>
          </m.div>
        )}

        {/* ── Student cases ── */}
        <m.div
          className="w-full space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <p className="text-xs font-semibold" style={{ color: '#e5e7eb' }}>
            {lang === 'uz' ? "O'quvchilarimiz natijalari" : 'Результаты наших учеников'}
          </p>
          {studentCases.map((c, i) => (
            <div
              key={i}
              className="rounded-lg px-4 py-2.5 flex items-start gap-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: '#e5e7eb' }}>
                  {c.name[lang]}{' '}
                  <span className="font-normal" style={{ color: '#4a90d9' }}>
                    {c.tag}
                  </span>
                </p>
                <p className="text-[10px] leading-snug mt-0.5" style={{ color: '#9ca3af' }}>
                  {c.desc[lang]}
                </p>
              </div>
            </div>
          ))}
        </m.div>

        {/* ── CTA Button ── */}
        <m.button
          onClick={onConsultation}
          className="w-full rounded-xl px-6 py-4 text-sm font-semibold relative overflow-hidden"
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
            opacity: { delay: 0.7, duration: 0.4 },
            scale: { delay: 0.7, duration: 0.4 },
            boxShadow: { delay: 1.0, duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {ctaButtonText[ending][lang]}
        </m.button>

        {/* ── Dismiss options ── */}
        <div className="flex flex-col items-center gap-1 pb-4">
          <m.button
            onClick={onDismiss}
            className="text-xs py-2 transition-colors"
            style={{ color: '#6b7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            whileHover={{ color: '#9ca3af' }}
          >
            {dismissOptions.later[lang]}
          </m.button>
        </div>
      </div>
    </div>
  );
}
