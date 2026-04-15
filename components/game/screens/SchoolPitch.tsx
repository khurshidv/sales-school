'use client';

import CasesSection from '@/components/target/CasesSection';
import ProductBenefits from '@/components/target/ProductBenefits';
import ProgramAccordion from '@/components/target/ProgramAccordion';
import StatsSection from '@/components/target/StatsSection';
import FounderSection from '@/components/target/FounderSection';
import MentorsSection from '@/components/target/MentorsSection';
import { pitchCopy, TELEGRAM_URL } from './conclusionCopy';

interface SchoolPitchProps {
  lang: 'uz' | 'ru';
  onDismiss: () => void;
}

function goToTelegram() {
  window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
}

export default function SchoolPitch({ lang, onDismiss }: SchoolPitchProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface text-on-surface">
      {/* Landscape overlay — ask user to rotate to portrait.
          Mirrors the game's RotateDevice but inverted: the pitch
          screen is designed for vertical scrolling. */}
      <div className="fixed inset-0 z-[60] bg-neutral-950 items-center justify-center flex-col gap-6 text-center p-8 landscape-coarse:flex hidden">
        <div className="text-6xl animate-[rotate-hint-v_2s_ease-in-out_infinite]">📱</div>
        <p className="text-white text-lg font-medium">{pitchCopy.rotateHeading[lang]}</p>
        <p className="text-neutral-500 text-sm">{pitchCopy.rotateSub[lang]}</p>
        <style>{`
          @keyframes rotate-hint-v {
            0%, 100% { transform: rotate(90deg); }
            50% { transform: rotate(0deg); }
          }
          @media (orientation: landscape) and (pointer: coarse) {
            .landscape-coarse\\:flex { display: flex !important; }
          }
        `}</style>
      </div>

      {/* Hero — game-contextual intro */}
      <section className="relative pt-16 pb-12 px-6 md:px-8 mesh-hero overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-primary-container/15 px-3 py-1 rounded-full mb-6">
            <span className="text-primary-container font-bold text-xs uppercase tracking-widest">
              {pitchCopy.heroEyebrow[lang]}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight leading-[1.15] text-on-surface">
            {pitchCopy.heroHeading[lang]}
          </h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed mt-6 max-w-lg mx-auto">
            {pitchCopy.heroSub[lang]}
          </p>
          <button
            type="button"
            onClick={goToTelegram}
            className="group inline-flex items-center gap-3 rounded-full cta-btn text-white cursor-pointer transition-all duration-200 active:scale-[0.98] hover:scale-[1.03] px-8 py-5 text-base md:px-10 md:text-lg animate-pulse-glow mt-10"
          >
            <span className="font-bold tracking-wide">{pitchCopy.heroCta[lang]}</span>
            <span className="bg-white/20 group-hover:bg-white/32 w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-200">
              <span className="material-symbols-outlined leading-none text-lg">arrow_forward</span>
            </span>
          </button>
        </div>
      </section>

      {/* Strong blocks pulled from /target — 1:1, untouched */}
      <CasesSection />
      <ProductBenefits />
      <ProgramAccordion />
      <StatsSection />
      <FounderSection />
      <MentorsSection />

      {/* Final CTA — game-contextual, Telegram direct */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%, #e8790a 0%, transparent 50%)',
          }}
        />
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 leading-tight text-on-surface">
            {pitchCopy.finalHeading[lang]}
          </h2>
          <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
            {pitchCopy.finalSub[lang]}
          </p>
          <button
            type="button"
            onClick={goToTelegram}
            className="group inline-flex items-center gap-3 rounded-full cta-btn text-white cursor-pointer transition-all duration-200 active:scale-[0.98] hover:scale-[1.03] px-8 py-5 text-base md:px-10 md:text-lg animate-pulse-glow"
          >
            <span className="font-bold tracking-wide">{pitchCopy.finalCta[lang]}</span>
            <span className="bg-white/20 group-hover:bg-white/32 w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-200">
              <span className="material-symbols-outlined leading-none text-lg">arrow_forward</span>
            </span>
          </button>
          <div className="mt-8">
            <button
              type="button"
              onClick={onDismiss}
              className="text-sm text-on-surface-variant/60 hover:text-on-surface-variant transition-colors py-2 px-4"
            >
              {pitchCopy.dismiss[lang]}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
