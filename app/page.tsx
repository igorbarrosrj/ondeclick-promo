import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { LogoCloud } from "@/components/logo-cloud"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  )
}
