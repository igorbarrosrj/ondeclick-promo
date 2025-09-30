"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Calendar, Share2, Copy, QrCode, Facebook, Twitter, Linkedin } from "lucide-react"
import { getAffiliateStats } from "@/lib/api"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

const mockCommissionData = [
  { name: "Jan", value: 280 },
  { name: "Feb", value: 320 },
  { name: "Mar", value: 480 },
]

const mockPlanData = [
  { name: "Basic", value: 40 },
  { name: "Pro", value: 45 },
  { name: "Plus", value: 15 },
]

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const affiliateLink = "https://oneclickpromo.com/ref/SARAH2024"

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAffiliateStats("1")
        setStats(data)
      } catch (error) {
        console.error("Failed to load affiliate stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
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
      <div>
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Track your referrals and earnings</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTD Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.mtdCommission || 0}</div>
            <p className="text-xs text-muted-foreground">+25% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Apr 1</div>
            <p className="text-xs text-muted-foreground">${stats?.mtdCommission || 0} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Your Link Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{affiliateLink}</code>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0 bg-transparent">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" size="sm">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" size="sm">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">Earn $100/mo in 7 days!</h4>
            <p className="text-sm text-muted-foreground">
              Share your link with 5 small business owners. Each signup earns you 20% lifetime commission. Average
              merchant pays $97/month = $19.40/month per referral.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockCommissionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referred Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPlanData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockPlanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Post to Status Now</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Share your success story and referral link on WhatsApp Status
              </p>
              <Button size="sm" variant="outline">
                Create Post
              </Button>
            </div>

            <div className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Run Weekday Special</h4>
              <p className="text-sm text-muted-foreground mb-3">Offer bonus commission for referrals this week</p>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </div>

            <div className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Contact Top Prospects</h4>
              <p className="text-sm text-muted-foreground mb-3">Reach out to businesses that could benefit most</p>
              <Button size="sm" variant="outline">
                Get List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
