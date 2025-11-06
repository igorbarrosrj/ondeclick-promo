"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Play,
  Pause,
  MoreHorizontal,
  MessageSquare,
  TrendingUp,
  Users,
  MessageCircle,
  Send,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMerchantCampaigns } from "@/lib/api"
import type { Campaign } from "@/lib/mock"
import { WhatsAppStatusModal } from "@/components/merchant/whatsapp-status-modal"
import { toast } from "@/hooks/use-toast"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await getMerchantCampaigns()
        setCampaigns(data)
      } catch (error) {
        console.error("Failed to load campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "completed":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleWhatsAppStatus = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowWhatsAppModal(true)
  }

  const handleSendToContacts = (campaign: Campaign) => {
    toast({
      title: "Template enviado (demo)",
      description: `Template da campanha "${campaign.title}" foi enviado para seus contatos opt-in.`,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Campanhas</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing no WhatsApp</p>
        </div>
        <Link href="/merchant/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Mais Filtros
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Atualmente rodando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Em todas as campanhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão Média</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0
                ? ((campaigns.reduce((sum, c) => sum + c.redemptions / c.clicks, 0) / campaigns.length) * 100).toFixed(
                    1,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Performance geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{campaign.title}</h3>
                  <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppStatus(campaign)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Postar no Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendToContacts(campaign)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar aos Contatos
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    {campaign.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuItem>Exportar Dados</DropdownMenuItem>
                      <DropdownMenuItem>Arquivar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliques</p>
                  <p className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resgates</p>
                  <p className="text-2xl font-bold">{campaign.redemptions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">
                    {campaign.clicks > 0 ? ((campaign.redemptions / campaign.clicks) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Criado</p>
                  <p className="text-sm">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progresso da Campanha</span>
                  <span>{Math.round((campaign.clicks / 1000) * 100)}% da meta</span>
                </div>
                <Progress value={(campaign.clicks / 1000) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar sua busca ou filtros"
                : "Crie sua primeira campanha para começar a alcançar clientes"}
            </p>
            <Link href="/merchant/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Campanha
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <WhatsAppStatusModal open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal} campaign={selectedCampaign} />
    </div>
  )
}
