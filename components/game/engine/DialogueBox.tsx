'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTypewriter } from '@/lib/game/hooks/useTypewriter';

interface DialogueBoxProps {
  text: string;
  speakerName: string | undefined;
  isNarrator: boolean;
  onAdvance: () => void;
}

export default function DialogueBox({
  text,
  speakerName,
  isNarrator,
  onAdvance,
}: DialogueBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  const { displayedText, isTyping, skipToEnd } = useTypewriter(text, {
    speed: 30,
  });

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTyping) {
      skipToEnd();
    } else {
      onAdvance();
    }
  }

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="absolute bottom-0 left-0 right-0 min-h-[25dvh] border-t-2 border-[#4a90d9] px-4 py-3 z-10"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={handleClick}
    >
      {/* Speaker name */}
      {!isNarrator && speakerName && (
        <p className="mb-1 text-sm font-bold text-[#4a90d9]">{speakerName}</p>
      )}

      {/* Dialogue text */}
      <p
        className={`leading-relaxed ${
          isNarrator
            ? 'text-center italic text-[#ffd700]'
            : 'text-[#e0e0e0]'
        }`}
      >
        {displayedText}
        {isTyping && (
          <span className="animate-pulse">&#9612;</span>
        )}
      </p>
    </motion.div>
  );
}
