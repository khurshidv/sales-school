import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Генератор логотипа Sales Up — SVG экспорт",
  description: "Скачайте SVG-варианты логотипа Sales Up: оригинальный, брендовый, CTA gradient, dark mode и монохром.",
  robots: { index: false, follow: false },
};

export default function BrandLogoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
