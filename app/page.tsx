import Footer from "@/components/footer";
import CommunitySection from "@/components/HomePageSections/Community";
import FeaturesSection from "@/components/HomePageSections/Features";
import GetStartedSection from "@/components/HomePageSections/GetStarted";
import HeroSection from "@/components/HomePageSections/Hero";
import UseCasesSection from "@/components/HomePageSections/UseCases";
import NavBar from "@/components/nav-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <CommunitySection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
