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
  dimensionLessonMap,
  ctaButtonText,
  dismissOptions,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a]">
      <div className="min-h-full flex flex-col">
        {/* ── Top: Headline + Bridge ── */}
        <m.div
          className="px-6 pt-5 pb-3 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-xl md:text-2xl font-bold leading-snug"
            style={{ color: '#f5f0e1' }}
          >
            {schoolCtaHeadlines[ending][lang]}
          </h1>
          <p className="text-[11px] mt-1.5 italic" style={{ color: '#8a7264' }}>
            &ldquo;{schoolCtaBridge[lang]}&rdquo;
          </p>
        </m.div>

        {/* ── Main content: 2-column landscape layout ── */}
        <m.div
          className="flex-1 px-4 pb-3 grid grid-cols-1 landscape:grid-cols-2 gap-3 max-w-5xl mx-auto w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-2.5">
            {/* Benefits — 2x2 grid */}
            <div className="grid grid-cols-2 gap-2">
              {schoolBenefits.map((b, i) => (
                <div
                  key={i}
                  className="rounded-xl px-3 py-2.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,121,10,0.08), rgba(255,154,60,0.04))',
                    border: '1px solid rgba(232,121,10,0.15)',
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: '#e8790a' }}>
                    {b.title[lang]}
                  </p>
                  <p className="text-[10px] leading-snug mt-0.5" style={{ color: '#a69383' }}>
                    {b.desc[lang]}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div
              className="flex items-center justify-around rounded-xl px-3 py-2"
              style={{
                background: 'rgba(232,121,10,0.06)',
                border: '1px solid rgba(232,121,10,0.1)',
              }}
            >
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#e8790a' }}>{schoolStats.lessons}</p>
                <p className="text-[9px]" style={{ color: '#8a7264' }}>{lang === 'uz' ? 'dars' : 'уроков'}</p>
              </div>
              <div className="w-px h-6" style={{ background: 'rgba(232,121,10,0.15)' }} />
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#e8790a' }}>{schoolStats.graduates}</p>
                <p className="text-[9px]" style={{ color: '#8a7264' }}>{lang === 'uz' ? 'bitiruvchi' : 'выпускников'}</p>
              </div>
              <div className="w-px h-6" style={{ background: 'rgba(232,121,10,0.15)' }} />
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#e8790a' }}>{schoolStats.partners}</p>
                <p className="text-[9px]" style={{ color: '#8a7264' }}>{lang === 'uz' ? 'hamkor' : 'партнёров'}</p>
              </div>
            </div>

            {/* Student cases — horizontal row */}
            <div className="flex gap-2">
              {studentCases.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-[10px] font-semibold" style={{ color: '#f5f0e1' }}>
                    {c.name[lang]}
                  </p>
                  <p className="text-[9px] leading-snug mt-0.5" style={{ color: '#8a7264' }}>
                    {c.desc[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-2.5 justify-between">
            {/* Personalized recommendation */}
            {lessonRec && weakLabel && (
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,121,10,0.1), rgba(232,121,10,0.03))',
                  border: '1px solid rgba(232,121,10,0.2)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#e8790a' }}>
                  {lang === 'uz' ? 'Sizga tavsiya' : 'Рекомендация для вас'}
                </p>
                <p className="text-sm font-semibold" style={{ color: '#f5f0e1' }}>
                  {lessonRec.lesson[lang]}
                </p>
                <p className="text-[10px] leading-snug mt-1" style={{ color: '#a69383' }}>
                  {lessonRec.detail[lang]}
                </p>
                <p className="text-[9px] mt-1.5" style={{ color: '#8a7264' }}>
                  {lang === 'uz'
                    ? `"${weakLabel}" — aynan shu dars bunga bag'ishlangan`
                    : `«${weakLabel}» — именно этот урок посвящён этому навыку`}
                </p>
              </div>
            )}

            {/* CTA block */}
            <div className="flex flex-col gap-2 mt-auto">
              <m.button
                onClick={onConsultation}
                className="w-full rounded-xl px-6 py-3.5 text-sm font-bold relative overflow-hidden"
                style={{
                  color: '#1b1c1a',
                  background: 'linear-gradient(135deg, #e8790a, #ff9a3c)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(232,121,10,0.2)',
                    '0 0 40px rgba(232,121,10,0.35)',
                    '0 0 20px rgba(232,121,10,0.2)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                {ctaButtonText[ending][lang]}
              </m.button>

              <button
                onClick={onDismiss}
                className="text-[10px] py-1 transition-colors"
                style={{ color: '#564336' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#8a7264'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#564336'; }}
              >
                {dismissOptions.later[lang]}
              </button>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
