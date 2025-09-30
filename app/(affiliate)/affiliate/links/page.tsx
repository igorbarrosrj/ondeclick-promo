"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, BarChart3, Eye, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockLinks = [
  {
    id: "1",
    name: "Main Referral Link",
    url: "https://oneclickpromo.com/ref/SARAH2024",
    clicks: 156,
    impressions: 890,
    conversions: 12,
    createdAt: "2024-03-01",
    utm: {
      source: "whatsapp",
      medium: "social",
      campaign: "main",
    },
  },
  {
    id: "2",
    name: "Instagram Story Link",
    url: "https://oneclickpromo.com/ref/SARAH2024?utm_source=instagram&utm_medium=story",
    clicks: 89,
    impressions: 450,
    conversions: 5,
    createdAt: "2024-03-15",
    utm: {
      source: "instagram",
      medium: "story",
      campaign: "march-promo",
    },
  },
  {
    id: "3",
    name: "Email Newsletter",
    url: "https://oneclickpromo.com/ref/SARAH2024?utm_source=email&utm_medium=newsletter",
    clicks: 234,
    impressions: 1200,
    conversions: 18,
    createdAt: "2024-02-20",
    utm: {
      source: "email",
      medium: "newsletter",
      campaign: "feb-newsletter",
    },
  },
]

export default function LinksPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Links</h1>
          <p className="text-muted-foreground">Create and track your referral links</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Referral Link</DialogTitle>
              <DialogDescription>
                Build a custom referral link with UTM parameters for better tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Link Name</Label>
                <Input id="name" placeholder="e.g., Facebook Post, Email Campaign" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">UTM Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="medium">UTM Medium</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="dm">Direct Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign">UTM Campaign</Label>
                <Input id="campaign" placeholder="e.g., march-promo, newsletter" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateOpen(false)}>
                Create Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{link.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono truncate max-w-md">{link.url}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {link.utm.source}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {link.utm.medium}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{link.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{link.impressions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{link.conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{((link.conversions / link.clicks) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">CVR</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.url, link.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      {copied === link.id ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLinks.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLinks.reduce((sum, link) => sum + link.conversions, 0)}</div>
            <p className="text-xs text-muted-foreground">New signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CVR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (mockLinks.reduce((sum, link) => sum + link.conversions, 0) /
                  mockLinks.reduce((sum, link) => sum + link.clicks, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
