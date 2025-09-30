import { TrendingUp, Users, Zap, DollarSign } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Active Businesses",
    description: "Growing every day",
  },
  {
    icon: Zap,
    value: "50K+",
    label: "Campaigns Created",
    description: "And counting",
  },
  {
    icon: TrendingUp,
    value: "3.5x",
    label: "Average ROI",
    description: "For our customers",
  },
  {
    icon: DollarSign,
    value: "$2M+",
    label: "Revenue Generated",
    description: "For small businesses",
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-3 p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-lg font-semibold text-foreground mt-2">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
