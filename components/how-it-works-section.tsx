import { Card, CardContent } from "@/components/ui/card"
import { Type, Sparkles, Share2, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: Type,
    step: "01",
    title: "Describe Your Promo",
    description: "Simply type what you're offering - a sale, discount, event, or special deal.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Creates Everything",
    description: "Our AI generates eye-catching images, compelling text, and unique coupon codes instantly.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Share on WhatsApp",
    description: "One-click sharing to WhatsApp Status, groups, or individual customers.",
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Track Results",
    description: "Monitor clicks, redemptions, and revenue to see what works best.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            {"How it "}
            <span className="text-primary">{"works"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"From idea to customer engagement in under 60 seconds"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-5xl font-bold text-primary/10">{step.step}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </CardContent>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
