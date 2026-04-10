'use client';

import { memo, useState, useEffect, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Choice {
  id: string;
  text: string;
}

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (index: number) => void;
  multiSelect?: { count: number };
  onMultiSelect?: (indices: number[]) => void;
  timerRemaining: number | null;
  timeLimit: number | undefined;
  /**
   * Optional ref from useTimer — when provided, the timer bar width is
   * driven imperatively at 60 FPS without causing React re-renders.
   * See lib/game/hooks/useTimer.ts.
   */
  timerBarRef?: RefObject<HTMLDivElement | null>;
}

function ChoicePanel({
  choices,
  onSelect,
  multiSelect,
  onMultiSelect,
  timerRemaining,
  timeLimit,
  timerBarRef,
}: ChoicePanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Reset selection when choices change (new choice node)
  const choiceIds = choices.map((c) => c.id).join(',');
  useEffect(() => {
    setSelectedIndices([]);
  }, [choiceIds]);

  const handleToggle = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < (multiSelect?.count ?? 0)
          ? [...prev, index]
          : prev
    );
  };

  const handleConfirm = () => {
    if (multiSelect && onMultiSelect && selectedIndices.length === multiSelect.count) {
      onMultiSelect(selectedIndices);
    }
  };

  // Whether to render the timer bar at all. Width is driven imperatively
  // via timerBarRef (see useTimer) — do NOT compute a percent here, as that
  // would re-render this component every time `timerRemaining` changes.
  const showTimerBar = timerRemaining !== null && !!timeLimit;

  // Colour class only changes when the integer-second `remaining` crosses
  // a threshold (≤1 re-render/sec instead of 60), so this is cheap.
  const timerColor =
    timerRemaining !== null
      ? timerRemaining <= 5
        ? 'bg-red-500 animate-pulse'
        : timerRemaining <= 10
          ? 'bg-yellow-500'
          : 'bg-green-500'
      : '';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      className="absolute bottom-[16%] sm:bottom-[18%] md:bottom-[20%] lg:bottom-[28%] xl:bottom-[30%] left-0 right-0 px-3 py-1.5 sm:px-4 sm:py-3 md:px-5 md:py-3 z-20"
      onClick={(e) => e.stopPropagation()}
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      {/* Timer bar — width is driven imperatively via timerBarRef (no re-renders). */}
      {showTimerBar && (
        <div className="w-full h-1 rounded-full bg-white/10 mb-2 overflow-hidden">
          <div
            ref={timerBarRef}
            className={`h-full rounded-full ${timerColor}`}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Choice buttons */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {choices.map((choice, index) => {
          const isSelected = selectedIndices.includes(index);

          return (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : index * 0.05, duration: shouldReduceMotion ? 0 : 0.2 }}
              onClick={() =>
                multiSelect ? handleToggle(index) : onSelect(index)
              }
              className={`
                w-full text-left rounded-lg p-2 sm:p-4 text-white text-xs sm:text-base font-medium
                border border-white/30 transition-all
                ${
                  multiSelect && isSelected
                    ? 'bg-blue-500/30 border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-white/50 hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] active:bg-blue-500/30'
                }
              `}
            >
              {multiSelect && (
                <span className="inline-block w-5 mr-2 text-center">
                  {isSelected ? '●' : '○'}
                </span>
              )}
              {choice.text}
            </motion.button>
          );
        })}
      </div>

      {/* MultiSelect confirm */}
      {multiSelect && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-white/60 text-xs">
            Выбрано: {selectedIndices.length}/{multiSelect.count}
          </span>
          <button
            onClick={handleConfirm}
            disabled={selectedIndices.length !== multiSelect.count}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium text-white
              transition-opacity
              ${
                selectedIndices.length === multiSelect.count
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-blue-500/40 opacity-50 cursor-not-allowed'
              }
            `}
          >
            Подтвердить
          </button>
        </div>
      )}
    </motion.div>
  );
}

// memo: prevents re-renders when parent useGameEngine updates for unrelated
// state. Timer bar width is driven imperatively via timerBarRef, so memo
// is actually meaningful here (setState is bounded to ≤1×/sec).
export default memo(ChoicePanel);
