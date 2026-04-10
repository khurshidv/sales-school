'use client';

import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface DayCeremonyProps {
  outcome: 'success' | 'partial' | 'failure' | 'hidden_ending';
  score: { total: number; dimensions: Record<string, number> };
  targetScore: number;
  rating: string;
  achievements: Array<{ id: string; name: string }>;
  xpEarned: number;
  dayNumber: number;
  diaryEntry: { uz: string; ru: string };
  nextDayTeaser?: { uz: string; ru: string };
  feedbackSpeaker: string;
  feedbackText: string;
  lang: 'uz' | 'ru';
  onContinue: () => void;
  onReplay: () => void;
}

type Phase = 'reaction' | 'score_reveal' | 'achievements' | 'diary' | 'teaser';

const PHASE_ORDER: Phase[] = ['reaction', 'score_reveal', 'achievements', 'diary', 'teaser'];

const outcomeBg: Record<DayCeremonyProps['outcome'], string> = {
  success: 'rgba(34, 197, 94, 0.15)',
  partial: 'rgba(234, 179, 8, 0.12)',
  failure: 'rgba(239, 68, 68, 0.15)',
  hidden_ending: 'rgba(168, 85, 247, 0.15)',
};

const ratingColor: Record<string, string> = {
  S: '#fbbf24',
  A: '#22c55e',
  B: '#3b82f6',
  C: '#a855f7',
  D: '#f97316',
  F: '#ef4444',
};

export default function DayCeremony({
  outcome,
  score,
  targetScore,
  rating,
  achievements,
  xpEarned,
  dayNumber,
  diaryEntry,
  nextDayTeaser,
  feedbackSpeaker,
  feedbackText,
  lang,
  onContinue,
  onReplay,
}: DayCeremonyProps) {
  const [phase, setPhase] = useState<Phase>('reaction');
  const [animatedScore, setAnimatedScore] = useState(0);
  const [revealedDims, setRevealedDims] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [typedDiary, setTypedDiary] = useState('');

  const isLastDay = dayNumber === 3;
  const continueLabel = isLastDay
    ? lang === 'uz' ? 'Natijalarni ko\'rish' : 'Посмотреть результаты'
    : lang === 'uz' ? 'Davom etish' : 'Продолжить';
  const replayLabel = lang === 'uz' ? 'Qayta o\'ynash' : 'Переиграть';

  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      const idx = PHASE_ORDER.indexOf(prev);
      let next = idx + 1;

      // Skip achievements if none
      if (PHASE_ORDER[next] === 'achievements' && achievements.length === 0) {
        next++;
      }
      // Skip teaser if none
      if (PHASE_ORDER[next] === 'teaser' && !nextDayTeaser) {
        next++;
      }

      if (next >= PHASE_ORDER.length) return prev;
      return PHASE_ORDER[next];
    });
  }, [achievements.length, nextDayTeaser]);

  // Auto-advance reaction phase after 3s
  useEffect(() => {
    if (phase !== 'reaction') return;
    const timer = setTimeout(advancePhase, 3000);
    return () => clearTimeout(timer);
  }, [phase, advancePhase]);

  // Score count-up animation
  useEffect(() => {
    if (phase !== 'score_reveal') return;
    const duration = 1500;
    const steps = 60;
    const increment = score.total / steps;
    let current = 0;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score.total);
      setAnimatedScore(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [phase, score.total]);

  // Dimension bars sequential reveal
  useEffect(() => {
    if (phase !== 'score_reveal') return;
    const dims = Object.keys(score.dimensions);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealedDims(i);
      if (i >= dims.length) {
        clearInterval(interval);
        setTimeout(() => setShowRating(true), 300);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [phase, score.dimensions]);

  // Diary typewriter effect
  useEffect(() => {
    if (phase !== 'diary') return;
    const text = diaryEntry[lang];
    let i = 0;
    setTypedDiary('');
    const interval = setInterval(() => {
      i++;
      setTypedDiary(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [phase, diaryEntry, lang]);

  const dimEntries = Object.entries(score.dimensions);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0a0a' }}
      onClick={phase === 'reaction' ? advancePhase : undefined}
    >
      <AnimatePresence mode="wait">
        {/* ── PHASE 1: REACTION ── */}
        {phase === 'reaction' && (
          <m.div
            key="reaction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full h-full px-6 text-center"
            style={{ background: outcomeBg[outcome] }}
          >
            <m.p
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: '#9ca3af' }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {feedbackSpeaker}
            </m.p>
            <m.p
              className="text-xl md:text-2xl font-medium max-w-xl leading-relaxed"
              style={{ color: '#e5e7eb' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              &ldquo;{feedbackText}&rdquo;
            </m.p>
          </m.div>
        )}

        {/* ── PHASE 2: SCORE REVEAL ── */}
        {phase === 'score_reveal' && (
          <m.div
            key="score_reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-lg px-6 py-8 gap-6"
            onClick={advancePhase}
          >
            {/* Score counter */}
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>
                {lang === 'uz' ? 'Umumiy ball' : 'Общий балл'}
              </p>
              <p className="text-5xl font-bold tabular-nums" style={{ color: '#f9fafb' }}>
                {animatedScore}
                <span className="text-xl font-normal" style={{ color: '#6b7280' }}>
                  /{targetScore}
                </span>
              </p>
            </div>

            {/* Dimension bars */}
            <div className="w-full space-y-3">
              {dimEntries.map(([dim, val], i) => (
                <div key={dim} className={i < revealedDims ? 'opacity-100' : 'opacity-0'}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#d1d5db' }}>{dim}</span>
                    <span style={{ color: '#9ca3af' }}>{val}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: '#1f2937' }}>
                    <m.div
                      className="h-2 rounded-full"
                      style={{ background: '#3b82f6' }}
                      initial={{ width: 0 }}
                      animate={{ width: i < revealedDims ? `${Math.min((val / targetScore) * 100, 100)}%` : 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Rating letter */}
            {showRating && (
              <m.div
                className="text-center"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <p className="text-7xl font-black" style={{ color: ratingColor[rating] || '#f9fafb' }}>
                  {rating}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  +{xpEarned} XP
                </p>
              </m.div>
            )}
          </m.div>
        )}

        {/* ── PHASE 3: ACHIEVEMENTS ── */}
        {phase === 'achievements' && (
          <m.div
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-lg px-6 py-8 gap-4"
            onClick={advancePhase}
          >
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>
              {lang === 'uz' ? 'Yutuqlar' : 'Достижения'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {achievements.map((ach, i) => (
                <m.div
                  key={ach.id}
                  className="flex flex-col items-center px-5 py-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))',
                    border: '1px solid rgba(251,191,36,0.3)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.25, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <span className="text-2xl mb-1">🏆</span>
                  <span className="text-sm font-medium" style={{ color: '#fbbf24' }}>
                    {ach.name}
                  </span>
                </m.div>
              ))}
            </div>
          </m.div>
        )}

        {/* ── PHASE 4: DIARY ── */}
        {phase === 'diary' && (
          <m.div
            key="diary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-lg px-6 py-8"
            onClick={advancePhase}
          >
            <div
              className="w-full rounded-xl px-8 py-6 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f5f0e1, #ede4cc)',
                fontFamily: 'Georgia, serif',
              }}
            >
              <p
                className="text-xs uppercase tracking-wider mb-3 font-sans"
                style={{ color: '#92856a' }}
              >
                {lang === 'uz' ? `Kun ${dayNumber} — Kundalik` : `День ${dayNumber} — Дневник`}
              </p>
              <p
                className="text-base leading-relaxed whitespace-pre-wrap"
                style={{ color: '#3d3426', minHeight: '4rem' }}
              >
                {typedDiary}
                <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: '#3d3426' }} />
              </p>
            </div>
          </m.div>
        )}

        {/* ── PHASE 5: TEASER ── */}
        {phase === 'teaser' && nextDayTeaser && (
          <m.div
            key="teaser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full h-full px-6 text-center"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)',
            }}
          >
            <m.p
              className="text-lg md:text-xl font-light max-w-md leading-relaxed italic"
              style={{ color: '#d1d5db' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {nextDayTeaser[lang]}
            </m.p>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM BUTTONS ── */}
      {(phase === 'teaser' || (phase === 'diary' && !nextDayTeaser)) && (
        <m.div
          className="absolute bottom-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={onReplay}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              color: '#9ca3af',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {replayLabel}
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              color: '#0a0a0a',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 0 20px rgba(251,191,36,0.3)',
            }}
          >
            {continueLabel}
          </button>
        </m.div>
      )}
    </div>
  );
}
