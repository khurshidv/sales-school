import type { Metadata } from "next";
import { ModalProvider } from "@/lib/modal-context";
import RegistrationModal from "@/components/RegistrationModal";

export const metadata: Metadata = {
  title: "Бесплатный вебинар — Как начать зарабатывать в продажах с нуля за 30 дней | Sales Up",
  description:
    "Покажем пошагово: где искать первую работу, как пройти собеседование и сколько можно зарабатывать уже в первый месяц. Бесплатно. 90 минут. 3 материала сразу.",
  openGraph: {
    title: "От 0 до $800/мес за 30 дней — реальный план входа в профессию продажника",
    description:
      "Бесплатный живой вебинар от Sales Up. Получи чеклист, видео и шаблон резюме сразу после регистрации.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <div className="paper-grain" />
      {children}
      <RegistrationModal />
    </ModalProvider>
  );
}
