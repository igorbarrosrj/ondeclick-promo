import { FAQ } from "@/components/landing/faq"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-8">
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
