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
    <div className="game-container fixed inset-0 bg-neutral-950 text-white overflow-hidden">
      {children}
    </div>
  );
}
