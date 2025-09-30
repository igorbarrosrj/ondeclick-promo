"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageCircle, Zap, TrendingUp } from "lucide-react"
import { WhatsAppModal } from "@/components/WhatsAppModal"

export function Hero() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Trust badge */}
          <Badge variant="secondary" className="mb-8 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-2" />
            Usado por mais de 500 pequenos negócios
          </Badge>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance mb-6">
            Traga Clientes do{" "}
            <span className="text-primary relative">
              WhatsApp
              <MessageCircle className="absolute -top-2 -right-8 w-8 h-8 text-primary animate-bounce" />
            </span>{" "}
            em 1 Clique
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground text-balance mb-12 max-w-4xl mx-auto leading-relaxed">
            Digite sua promoção, receba imagens + texto + cupom prontos para postar.
            <br className="hidden sm:block" />
            <span className="font-semibold text-foreground">Sem logins. Sem curva de aprendizado.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold group"
              onClick={() => setShowWhatsAppModal(true)}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Começar no WhatsApp
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg bg-transparent"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Preços
            </Button>
          </div>

          {/* Trust row */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-6">
              Confiado por barbearias, restaurantes, boutiques em todo o país
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">B</span>
                </div>
                <span className="text-sm">Barbearias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">R</span>
                </div>
                <span className="text-sm">Restaurantes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">L</span>
                </div>
                <span className="text-sm">Lojas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-lg animate-float">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Configuração Instantânea</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 right-10 hidden lg:block">
          <div
            className="bg-card border border-border rounded-2xl p-4 shadow-lg animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Resultados Reais</span>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        onSimulateLink={() => {
          setShowWhatsAppModal(false)
          window.location.href = "/merchant"
        }}
      />
    </section>
  )
}
