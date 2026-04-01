import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ModalProvider } from "@/lib/modal-context";
import RegistrationModal from "@/components/RegistrationModal";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "cyrillic-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,400,0&icon_names=arrow_forward,bolt,business_center,calendar_today,check,check_circle,close,download,edit_document,error_outline,folder_open,fullscreen,groups,lightbulb,pause,payments,person,play_arrow,play_circle,record_voice_over,schedule,school,search,support_agent,trending_up,volume_up&display=swap";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fbf9f5",
};

export const metadata: Metadata = {
  title: "Бесплатный вебинар — Как начать зарабатывать в продажах с нуля за 30 дней | Sales School",
  description:
    "Покажем пошагово: где искать первую работу, как пройти собеседование и сколько можно зарабатывать уже в первый месяц. Бесплатно. 90 минут. 3 материала сразу.",
  openGraph: {
    title: "От 0 до $800/мес за 30 дней — реальный план входа в профессию продажника",
    description:
      "Бесплатный живой вебинар от Sales School. Получи чеклист, видео и шаблон резюме сразу после регистрации.",
    type: "website",
    locale: "ru_RU",
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
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS-prefetch for image CDNs */}
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Material Symbols — async loaded via media swap */}
        <link
          rel="stylesheet"
          href={MATERIAL_SYMBOLS_URL}
          media="print"
          // @ts-expect-error — media swap pattern for async font loading
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} />
        </noscript>
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
