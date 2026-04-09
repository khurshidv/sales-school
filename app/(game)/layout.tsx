import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Sales School — Игра",
  description: "RPG тренажёр навыков продаж",
};

export const viewport: Viewport = {
  themeColor: "#0a0c12",
  viewportFit: "cover",
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="game-container bg-neutral-950 text-white overflow-hidden"
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 'env(safe-area-inset-left, 0px)',
        right: 'env(safe-area-inset-right, 0px)',
        bottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {children}
    </div>
  );
}
