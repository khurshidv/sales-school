import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ValueSection from "@/components/ValueSection";
import ActionSection from "@/components/ActionSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import StickyBar from "@/components/StickyBar";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ValueSection />
        <ActionSection />
      </main>
      <Footer />
      <StickyBar />
      <MobileBottomNav />
    </>
  );
}
