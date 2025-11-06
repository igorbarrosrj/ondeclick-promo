import { PricingSection } from "@/components/landing/pricing-section"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-8">
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
