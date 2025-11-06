import { Card, CardContent } from "@/components/ui/card"
import { Wand2, Video, Sparkles, Zap, BarChart3, Clock, Palette, Music, Globe } from "lucide-react"

const features = [
  {
    icon: Wand2,
    title: "AI Script Generation",
    description: "Describe your promo and our AI writes compelling scripts that convert viewers into customers.",
  },
  {
    icon: Video,
    title: "Instant Video Creation",
    description: "Generate professional-quality promotional videos in seconds, not hours or days.",
  },
  {
    icon: Palette,
    title: "Smart Visual Design",
    description: "AI selects perfect visuals, colors, and layouts that match your brand and message.",
  },
  {
    icon: Music,
    title: "Auto Music & Effects",
    description: "Automatically add background music, transitions, and effects that enhance your message.",
  },
  {
    icon: Zap,
    title: "One-Click Export",
    description: "Export in any format for social media, websites, or digital displays instantly.",
  },
  {
    icon: Clock,
    title: "Save Hours of Work",
    description: "What used to take hours now takes seconds. Focus on your business, not video editing.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track views, engagement, and conversions to optimize your promotional strategy.",
  },
  {
    icon: Globe,
    title: "Multi-Platform Ready",
    description: "Optimized for Instagram, Facebook, TikTok, YouTube, and more platforms.",
  },
  {
    icon: Sparkles,
    title: "Brand Consistency",
    description: "Maintain your brand identity across all videos with smart templates and presets.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            {"Powerful Features"}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            {"Everything you need to create "}
            <span className="text-primary">{"amazing videos"}</span>
          </h2>

          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {
              "From AI-powered script writing to professional video production, we have got all the tools you need to create promotional content that converts."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
