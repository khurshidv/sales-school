import type { Metadata, Viewport } from "next";
import MotionProvider from "@/components/game/MotionProvider";
import SWRegistration from "@/components/game/SWRegistration";

export const metadata: Metadata = {
  title: "Sales Up — Игра",
  description: "RPG тренажёр навыков продаж",
  manifest: "/manifest.webmanifest",
  // Enable iOS "Add to Home Screen" → standalone mode. iOS Safari does not
  // support programmatic fullscreen for arbitrary elements, so this is the
  // only way to give iPhone users a chrome-free experience.
  appleWebApp: {
    capable: true,
    title: "SalesUp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c12",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <SWRegistration />
      <MotionProvider>{children}</MotionProvider>
    </div>
  );
}
