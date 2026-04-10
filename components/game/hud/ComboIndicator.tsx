'use client';

import { memo } from 'react';

interface ComboIndicatorProps {
  comboCount: number;
}

function ComboIndicator({ comboCount }: ComboIndicatorProps) {
  if (comboCount < 4) return null;

  const multiplier = comboCount >= 5 ? '×2.0' : '×1.5';

  return (
    <span
      key={comboCount}
      className="font-bold text-sm text-[#ffd700] animate-combo-pop"
      style={{ textShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}
    >
      {multiplier}

      <style jsx>{`
        @keyframes combo-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-combo-pop {
          animation: combo-pop 0.3s ease-out;
          display: inline-block;
        }
      `}</style>
    </span>
  );
}

export default memo(ComboIndicator);
