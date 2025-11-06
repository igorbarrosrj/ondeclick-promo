"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageCircle, Star } from "lucide-react"
import { WhatsAppModal } from "@/components/WhatsAppModal"

const plans = [
  {
    name: "Básico",
    price: 37,
    description: "Perfeito para começar",
    features: [
      "2 campanhas por semana",
      "Relatórios simples no WhatsApp",
      "Aparece no canal coletivo",
      "Templates básicos de imagem",
      "Rastreamento de cupons",
    ],
    cta: "Começar Plano Básico",
    popular: false,
  },
  {
    name: "Pro",
    price: 97,
    description: "Mais popular para negócios em crescimento",
    features: [
      "Campanhas ilimitadas",
      "Relatórios detalhados de análises",
      "Envios de opt-in no WhatsApp",
      "Posicionamento prioritário no canal",
      "Marca personalizada",
      "Testes A/B",
      "Suporte prioritário",
    ],
    cta: "Começar Plano Pro",
    popular: true,
  },
  {
    name: "Plus",
    price: 147,
    description: "Tudo + promotor humano",
    features: [
      "Tudo do Pro",
      "Promotor humano (vídeos/stories)",
      "Selo premium",
      "Estratégia de campanha personalizada",
      "Gerente de conta dedicado",
      "Integrações avançadas",
      "Opções de marca branca",
    ],
    cta: "Começar Plano Plus",
    popular: false,
  },
]

export function PricingSection() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const handlePlanClick = (planName: string) => {
    setSelectedPlan(planName)
    setShowWhatsAppModal(true)
  }

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Preços Simples e Transparentes</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano que se adapta ao seu negócio. Todos os planos incluem nossos recursos principais de
            marketing no WhatsApp.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 ${plan.popular ? "border-primary shadow-xl scale-105" : "border-border"} hover:shadow-xl transition-all`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanClick(plan.name)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Affiliate Add-on */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Complemento de Afiliado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione <span className="font-bold text-primary">+R$10/mês</span> a qualquer plano e receba seu link de
                indicação com 20% de comissão vitalícia
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPlan("Afiliados")
                  setShowWhatsAppModal(true)
                }}
              >
                Saiba Mais Sobre Afiliados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Garantia de reembolso de 30 dias.</span> Se você não ver
            resultados, reembolsaremos cada centavo.
          </p>
        </div>
      </div>

      <WhatsAppModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        onSimulateLink={() => {
          setShowWhatsAppModal(false)
          window.location.href = "/merchant"
        }}
        planName={selectedPlan}
      />
    </section>
  )
}
