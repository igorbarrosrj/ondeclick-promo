import { Card, CardContent } from "@/components/ui/card"
import { Zap, Clock, TrendingUp, Shield } from "lucide-react"

const benefits = [
  {
    icon: Zap,
    title: "Zero Aprendizado",
    description:
      "Sem tutoriais, sem treinamento. Se você consegue enviar uma mensagem no WhatsApp, consegue usar o OneClick Promo.",
  },
  {
    icon: Clock,
    title: "Pronto em Segundos",
    description:
      "Da ideia à campanha postada em menos de 30 segundos. Gaste tempo administrando seu negócio, não criando conteúdo.",
  },
  {
    icon: TrendingUp,
    title: "Resultados Reais",
    description: "Aumento médio de 40% no engajamento dos clientes e 25% de aumento nas vendas no primeiro mês.",
  },
  {
    icon: Shield,
    title: "Sem Contratos",
    description: "Cancele a qualquer momento, sem perguntas. Conquistamos seu negócio todo mês com resultados.",
  },
]

export function Benefits() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Por Que Pequenos Negócios Nos Amam</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Construído especificamente para proprietários ocupados que precisam de marketing que realmente funciona
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all group text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  <benefit.icon className="w-12 h-12 text-primary mx-auto group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-bold text-xl mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
