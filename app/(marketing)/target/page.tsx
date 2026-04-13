import type { Metadata } from "next";
import TargetHeader from "@/components/target/TargetHeader";
import TargetHero from "@/components/target/TargetHero";
import ContrastBar from "@/components/target/ContrastBar";
import TrustBar from "@/components/target/TrustBar";
import PainPoints from "@/components/target/PainPoints";
import MythReframe from "@/components/target/MythReframe";
import LossAversion from "@/components/target/LossAversion";
import CasesSection from "@/components/target/CasesSection";
import ProductBenefits from "@/components/target/ProductBenefits";
import ProgramAccordion from "@/components/target/ProgramAccordion";
import ForWhom from "@/components/target/ForWhom";
import StatsSection from "@/components/target/StatsSection";
import TargetFAQ from "@/components/target/TargetFAQ";
import FinalCTA from "@/components/target/FinalCTA";
import TargetFooter from "@/components/target/TargetFooter";
import TargetMobileNav from "@/components/target/TargetMobileNav";
import PageTracker from "@/components/analytics/PageTracker";

export const metadata: Metadata = {
  title: "Sales School — Профессия от $800/мес | Обучение + трудоустройство",
  description:
    "Нет опыта? Не проблема. Мы доведём тебя до первой зарплаты от $800 в продажах. Обучение, практика и реальное трудоустройство.",
  openGraph: {
    title: "Sales School — Профессия от $800/мес",
    description:
      "Обучение + практика + реальное трудоустройство. 99% учеников находят работу.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function TargetPage() {
  return (
    <>
      <PageTracker slug="target" />
      <TargetHeader />
      <main>
        <TargetHero />
        <ContrastBar />
        <TrustBar />
        <PainPoints />
        <MythReframe />
        <LossAversion />
        <CasesSection />
        <ProductBenefits />
        <ProgramAccordion />
        <ForWhom />
        <StatsSection />
<TargetFAQ />
        <FinalCTA />
      </main>
      <TargetFooter />
      <TargetMobileNav />
    </>
  );
}
