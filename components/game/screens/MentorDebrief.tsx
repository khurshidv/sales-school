'use client';

import { useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { mentorDebriefLines, type ConclusionEnding } from './conclusionCopy';

interface MentorDebriefProps {
  ending: ConclusionEnding;
  playerName: string;
  lang: 'uz' | 'ru';
  onComplete: () => void;
}

function resolveText(text: string, name: string): string {
  return text.replace(/\{name\}/g, name);
}

export default function MentorDebrief({
  ending,
  playerName,
  lang,
  onComplete,
}: MentorDebriefProps) {
  const lines = mentorDebriefLines[ending];
  const [lineIndex, setLineIndex] = useState(0);

  const handleTap = useCallback(() => {
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      onComplete();
    }
  }, [lineIndex, lines.length, onComplete]);

  const currentText = resolveText(lines[lineIndex][lang], playerName);

  return (
    <div
      className="fixed inset-0 z-40 cursor-pointer"
      onClick={handleTap}
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1225 100%)',
      }}
    >
      {/* Rustam character */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48 h-64 md:w-56 md:h-72">
        <Image
          src="/assets/scenarios/car-dealership/characters/chr_rustam_friendly.webp"
          alt="Rustam"
          fill
          sizes="(max-width: 768px) 192px, 224px"
          className="object-contain object-bottom"
          priority
        />
      </div>

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
        <div
          className="max-w-2xl mx-auto rounded-xl px-5 py-4"
          style={{
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Speaker name */}
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: '#fbbf24' }}
          >
            {lang === 'uz' ? 'Rustam' : 'Рустам'}
          </p>

          {/* Text with animation */}
          <AnimatePresence mode="wait">
            <m.p
              key={lineIndex}
              className="text-sm md:text-base leading-relaxed text-white"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {currentText}
            </m.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1.5">
              {lines.map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: i <= lineIndex ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>

            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {lang === 'uz' ? 'Davom etish uchun bosing' : 'Нажмите, чтобы продолжить'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
