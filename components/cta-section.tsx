import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              {"Ready to Get Started?"}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              {"Start growing your business with "}
              <span className="text-primary">{"WhatsApp marketing"}</span>
              {" today"}
            </h2>

            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              {
                "Join thousands of small businesses already using OneClick Promo to create effective marketing campaigns in minutes, not hours."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-primary text-lg px-8 py-6">
              <Link href="/signup">
                {"Start Free Trial"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              <Link href="#features">{"Learn More"}</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span>✓ No credit card required</span>
            </div>
            <div className="flex items-center">
              <span>✓ 14-day free trial</span>
            </div>
            <div className="flex items-center">
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
