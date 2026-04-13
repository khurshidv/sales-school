import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ValueSection from "@/components/ValueSection";
import ActionSection from "@/components/ActionSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import StickyBar from "@/components/StickyBar";
import PageTracker from "@/components/analytics/PageTracker";

export default function Home() {
  return (
    <>
      <PageTracker slug="home" />
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
