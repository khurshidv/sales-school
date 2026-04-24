"use client";

import TrustBar from "@/components/target/TrustBar";
import WhySales from "@/components/target/WhySales";
import ProductBenefits from "@/components/target/ProductBenefits";
import ProgramAccordion from "@/components/target/ProgramAccordion";
import CasesSection from "@/components/target/CasesSection";
import StatsSection from "@/components/target/StatsSection";
import ForWhom from "@/components/target/ForWhom";
import BlockCta from "./BlockCta";

export default function FinalOfferSection() {
  return (
    <section id="ko-proq" aria-label="Maktab va dastur haqida" className="scroll-mt-8">
      <TrustBar />
      <BlockCta location="after_trust_bar" />
      <WhySales />
      <BlockCta location="after_why_sales" />
      <ProductBenefits />
      <BlockCta location="after_product_benefits" />
      <ProgramAccordion />
      <BlockCta location="after_program_accordion" />
      <CasesSection />
      <BlockCta location="after_cases" />
      <StatsSection />
      <BlockCta location="after_stats" />
      <ForWhom />
      <BlockCta location="after_for_whom" />
    </section>
  );
}
