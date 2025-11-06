import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Maria Rodriguez",
    business: "Bella's Pizzeria",
    location: "Miami, FL",
    rating: 5,
    text: "OneClick Promo transformed our WhatsApp marketing! We went from spending hours creating posts to generating beautiful campaigns in minutes. Our pizza sales increased 40% in the first month.",
    avatar: "🍕",
  },
  {
    name: "James Chen",
    business: "Fresh Cuts Barbershop",
    location: "San Francisco, CA",
    rating: 5,
    text: "As a small business owner, I don't have time for complicated marketing tools. OneClick Promo is exactly what I needed - simple, fast, and effective. My appointment bookings doubled!",
    avatar: "✂️",
  },
  {
    name: "Sarah Johnson",
    business: "Sweet Dreams Bakery",
    location: "Austin, TX",
    rating: 5,
    text: "The AI-generated images are incredible! They perfectly capture our bakery's vibe. Our WhatsApp promotions now look professional and drive real results. Highly recommend!",
    avatar: "🧁",
  },
  {
    name: "Ahmed Hassan",
    business: "Hassan's Auto Repair",
    location: "Detroit, MI",
    rating: 5,
    text: "I was skeptical about AI marketing, but OneClick Promo proved me wrong. The campaigns it creates actually work! My customer base grew 60% in three months.",
    avatar: "🔧",
  },
  {
    name: "Lisa Park",
    business: "Zen Yoga Studio",
    location: "Portland, OR",
    rating: 5,
    text: "OneClick Promo helps me create beautiful, peaceful campaigns that match my brand perfectly. The scheduling feature means I can plan my promotions weeks in advance.",
    avatar: "🧘",
  },
  {
    name: "Carlos Mendez",
    business: "Tacos El Rey",
    location: "Phoenix, AZ",
    rating: 5,
    text: "¡Increíble! This tool made marketing so easy for my taco truck. The Spanish text generation works perfectly, and my sales have never been better. Worth every penny!",
    avatar: "🌮",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Quote className="w-4 h-4 mr-2" />
            {"Success Stories"}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            {"Loved by "}
            <span className="text-primary">{"small businesses"}</span>
            {" everywhere"}
          </h2>

          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"See how OneClick Promo is helping businesses like yours grow with effective WhatsApp marketing."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-muted-foreground leading-relaxed">"{testimonial.text}"</blockquote>

                  {/* Author */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.business} • {testimonial.location}
                      </div>
                    </div>
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
