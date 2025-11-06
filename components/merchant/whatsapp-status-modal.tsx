"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Download, ExternalLink, ImageIcon, Tag } from "lucide-react"
import type { Campaign } from "@/lib/mock"
import { toast } from "@/hooks/use-toast"

interface WhatsAppStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
}

export function WhatsAppStatusModal({ open, onOpenChange, campaign }: WhatsAppStatusModalProps) {
  if (!campaign) return null

  const handleDownloadCreative = () => {
    toast({
      title: "Creative baixado (demo)",
      description: "O material criativo foi baixado para sua galeria.",
    })
  }

  const handlePostToStatus = () => {
    window.open("https://wa.me/status", "_blank")
    toast({
      title: "Redirecionando para WhatsApp",
      description: "Abra o WhatsApp e poste o creative no seu Status.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Postar no WhatsApp Status
          </DialogTitle>
          <DialogDescription>Compartilhe sua campanha "{campaign.title}" no seu Status do WhatsApp</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Preview */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">{campaign.title}</h3>
                  <p className="text-sm text-green-700 mt-1">{campaign.description}</p>
                  {campaign.couponCode && (
                    <div className="flex items-center gap-2 mt-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-mono bg-green-100 px-2 py-1 rounded">{campaign.couponCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Baixe o material criativo (imagem + texto)</li>
              <li>Abra o WhatsApp e vá para "Status"</li>
              <li>Adicione a imagem e cole o texto</li>
              <li>Publique para todos os seus contatos verem</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleDownloadCreative} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Baixar Material Criativo
            </Button>

            <Button
              onClick={handlePostToStatus}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir WhatsApp Status
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Em produção, o material seria automaticamente otimizado para o WhatsApp Status
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
