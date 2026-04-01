import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ModalProvider } from "@/lib/modal-context";
import RegistrationModal from "@/components/RegistrationModal";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Бесплатный вебинар — Как начать зарабатывать в продажах с нуля за 30 дней | Sales School",
  description:
    "Покажем пошагово: где искать первую работу, как пройти собеседование и сколько можно зарабатывать уже в первый месяц. Бесплатно. 90 минут. 3 материала сразу.",
  openGraph: {
    title: "От 0 до $800/мес за 30 дней — реальный план входа в профессию продажника",
    description:
      "Бесплатный живой вебинар от Sales School. Получи чеклист, видео и шаблон резюме сразу после регистрации.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${plusJakarta.variable} ${spaceGrotesk.variable} antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <div className="paper-grain" />
        <I18nProvider>
          <ModalProvider>
            {children}
            <RegistrationModal />
          </ModalProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
