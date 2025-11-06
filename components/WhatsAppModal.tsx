"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, ExternalLink } from "lucide-react"

interface WhatsAppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSimulateLink: () => void
  planName?: string
}

export function WhatsAppModal({ open, onOpenChange, onSimulateLink, planName }: WhatsAppModalProps) {
  const handleWhatsAppClick = () => {
    const message = planName
      ? `Quero começar com o plano ${planName} no OneClick Promo`
      : "Quero começar com OneClick Promo"
    window.open(`https://wa.me/00000000000?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Continuar no WhatsApp
          </DialogTitle>
          <DialogDescription>
            Vamos conectar seu número do WhatsApp depois que você iniciar um chat conosco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Como funciona:</strong>
            </p>
            <ol className="text-sm text-green-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Clique em "Continuar no WhatsApp" abaixo</li>
              <li>Envie uma mensagem para verificar seu número</li>
              <li>Criaremos sua conta instantaneamente</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700">
              <ExternalLink className="mr-2 h-4 w-4" />
              Continuar no WhatsApp
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Apenas Demo</span>
              </div>
            </div>

            <Button variant="outline" onClick={onSimulateLink}>
              Simular Conexão WhatsApp (Demo)
            </Button>

            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Prefere continuar por email?
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
