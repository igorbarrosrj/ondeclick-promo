"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCampaigns, type Campaign } from "@/lib/api"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await getCampaigns()
        setCampaigns(data)
      } catch (error) {
        console.error("Failed to load campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.merchantName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "status":
        return "bg-green-100 text-green-800"
      case "waba":
        return "bg-blue-100 text-blue-800"
      case "groups":
        return "bg-purple-100 text-purple-800"
      case "ads":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Monitor all marketing campaigns</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="waba">WABA</SelectItem>
            <SelectItem value="groups">Groups</SelectItem>
            <SelectItem value="ads">Ads</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground">{campaign.merchantName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getChannelColor(campaign.channel)}>{campaign.channel.toUpperCase()}</Badge>
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.impressions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.redemptions}</p>
                    <p className="text-xs text-muted-foreground">Redemptions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {((campaign.redemptions / campaign.clicks) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">CVR</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
