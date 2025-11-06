import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, ImageIcon, Share2, BarChart3, FileText } from "lucide-react"

const steps = [
  {
    icon: MessageCircle,
    title: "Envie sua promoção no WhatsApp",
    description:
      "Apenas nos mande uma mensagem com os detalhes da sua oferta - sem formulários, sem configuração complicada",
  },
  {
    icon: ImageIcon,
    title: "Receba imagens + texto + cupom",
    description: "Receba conteúdo profissionalmente projetado pronto para postar em minutos",
  },
  {
    icon: Share2,
    title: "Poste no Status/Grupos/Instagram",
    description: "Compartilhe em todos os seus canais com ferramentas de postagem em um clique",
  },
  {
    icon: BarChart3,
    title: "Nós rastreamos cliques e uso de cupons",
    description: "Análises em tempo real mostram exatamente como suas campanhas performam",
  },
  {
    icon: FileText,
    title: "Você recebe um relatório diário no WhatsApp",
    description: "Resumos diários simples entregues direto no seu telefone",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Da ideia aos clientes em 5 passos simples. Sem curva de aprendizado necessária.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-6 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="mt-4 mb-4">
                  <step.icon className="w-8 h-8 text-primary mx-auto group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold mb-2 text-sm leading-tight">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
