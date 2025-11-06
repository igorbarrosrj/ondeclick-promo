import { Hero } from "@/components/landing/hero"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Benefits } from "@/components/landing/benefits"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { Navigation } from "@/components/landing/navigation"

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Benefits />
        <PricingSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
