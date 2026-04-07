'use client';

export default function RotateDevice() {
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
