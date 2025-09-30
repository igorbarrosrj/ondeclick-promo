import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowRight } from "lucide-react"
import { mockTestimonials } from "@/lib/mock"
import Image from "next/image"

export function SocialProof() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">O Que Nossos Clientes Dizem</h2>
          <p className="text-muted-foreground text-lg">Resultados reais de negócios reais</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mockTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.business}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Antes vs Depois do OneClick Promo</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-destructive/10 rounded-2xl p-6 mb-4">
                    <h4 className="font-semibold text-destructive mb-4">Postagem Manual</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Mais de 2 horas criando conteúdo</li>
                      <li>• Mensagens inconsistentes</li>
                      <li>• Sem rastreamento ou análises</li>
                      <li>• Baixas taxas de engajamento</li>
                    </ul>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-2xl p-6 mb-4">
                    <h4 className="font-semibold text-primary mb-4">OneClick Promo</h4>
                    <ul className="text-sm text-foreground space-y-2">
                      <li>• 30 segundos para criar e postar</li>
                      <li>• Conteúdo profissional e com marca</li>
                      <li>• Dashboard completo de análises</li>
                      <li>• 3x mais engajamento</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <ArrowRight className="w-8 h-8 text-primary mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
