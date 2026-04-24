"use client";

import TrustBar from "@/components/target/TrustBar";
import WhySales from "@/components/target/WhySales";
import ProductBenefits from "@/components/target/ProductBenefits";
import ProgramAccordion from "@/components/target/ProgramAccordion";
import CasesSection from "@/components/target/CasesSection";
import StatsSection from "@/components/target/StatsSection";
import ForWhom from "@/components/target/ForWhom";

export default function FinalOfferSection() {
  return (
    <section id="ko-proq" aria-label="Maktab va dastur haqida" className="scroll-mt-8">
      <TrustBar />
      <WhySales />
      <ProductBenefits />
      <ProgramAccordion />
      <CasesSection />
      <StatsSection />
      <ForWhom />
    </section>
  );
}
