import HeroSection from "./hero-section";
import FooterSection from "./footer";
import { EnhancedImageGenerator } from "@/components/enhanced-image-generator";
import { SocialProofSection } from "@/components/social-proof-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <EnhancedImageGenerator />
      <SocialProofSection />
      <FooterSection />
    </div>
  );
}
