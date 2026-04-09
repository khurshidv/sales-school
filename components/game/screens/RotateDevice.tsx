'use client';

import { useState, useEffect } from 'react';
import { isInAppBrowser } from '@/lib/game/utils/browser';

export default function RotateDevice() {
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 items-center justify-center flex-col gap-6 text-center p-8 portrait-coarse:flex hidden">
      {/* Rotating phone icon */}
      <div className="text-6xl animate-[rotate-hint_2s_ease-in-out_infinite]">
        📱
      </div>
      <p className="text-white text-lg font-medium">
        Поверните телефон горизонтально
      </p>
      <p className="text-neutral-500 text-sm">
        Telefoningizni gorizontal holga o&apos;tkazing
      </p>

      {inApp && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 max-w-xs">
          <p className="text-white/70 text-xs leading-relaxed">
            Для лучшего опыта откройте в браузере
          </p>
          <p className="text-white/40 text-[10px] mt-1 leading-relaxed">
            Yaxshiroq tajriba uchun brauzeda oching
          </p>
        </div>
      )}

      <style>{`
        @keyframes rotate-hint {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(90deg); }
        }
        @media (orientation: portrait) and (pointer: coarse) {
          .portrait-coarse\\:flex { display: flex !important; }
          .portrait-coarse\\:flex ~ * { display: none; }
        }
      `}</style>
    </div>
  );
}
