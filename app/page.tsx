import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ValueSection from "@/components/ValueSection";
import ActionSection from "@/components/ActionSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

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
      <MobileBottomNav />
    </>
  );
}
