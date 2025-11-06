// Mock API functions that simulate real API calls with loading states

import {
  mockMerchants,
  mockCampaigns,
  mockAffiliates,
  mockPayments,
  mockMrrData,
  mockCampaignsByChannel,
  mockClicksByCategory,
  type Merchant,
  type Campaign,
  type Affiliate,
  type Payment,
  type ChartData,
  type MerchantAnalytics,
} from "./mock"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Merchants API
export async function getMerchants(): Promise<Merchant[]> {
  await delay(800)
  return mockMerchants
}

export async function getMerchant(id: string): Promise<Merchant | null> {
  await delay(500)
  return mockMerchants.find((m) => m.id === id) || null
}

export async function getMerchantAnalytics(): Promise<MerchantAnalytics> {
  await delay(800)

  return {
    totalMessages: 8450,
    messageGrowth: 12.5,
    conversionRate: 15.2,
    conversionGrowth: 8.3,
    activeCustomers: 1205,
    customerGrowth: 18.7,
    revenue: 24500,
    revenueGrowth: 22.1,
    topCampaigns: [
      {
        id: "1",
        name: "Weekend Special - 20% Off",
        messagesSent: 1250,
        conversions: 189,
      },
      {
        id: "2",
        name: "Spring Collection Launch",
        messagesSent: 890,
        conversions: 134,
      },
      {
        id: "3",
        name: "Buy 1 Get 1 Free",
        messagesSent: 1100,
        conversions: 156,
      },
    ],
  }
}

export async function getMerchantCustomers() {
  await delay(700)

  // Mock customer data
  return [
    {
      id: "1",
      name: "John Smith",
      phone: "+1234567890",
      email: "john@example.com",
      totalOrders: 12,
      totalSpent: 450,
      lastOrder: "2024-03-20",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phone: "+1234567891",
      email: "sarah@example.com",
      totalOrders: 8,
      totalSpent: 320,
      lastOrder: "2024-03-19",
      status: "active",
      joinedAt: "2024-02-01",
    },
    {
      id: "3",
      name: "Mike Chen",
      phone: "+1234567892",
      email: "mike@example.com",
      totalOrders: 15,
      totalSpent: 680,
      lastOrder: "2024-03-21",
      status: "active",
      joinedAt: "2023-12-10",
    },
    {
      id: "4",
      name: "Emily Davis",
      phone: "+1234567893",
      email: "emily@example.com",
      totalOrders: 5,
      totalSpent: 210,
      lastOrder: "2024-03-18",
      status: "active",
      joinedAt: "2024-02-20",
    },
    {
      id: "5",
      name: "David Wilson",
      phone: "+1234567894",
      email: "david@example.com",
      totalOrders: 3,
      totalSpent: 125,
      lastOrder: "2024-03-15",
      status: "inactive",
      joinedAt: "2024-03-01",
    },
  ]
}

export async function getMerchantMessages() {
  await delay(600)

  // Mock message data
  return [
    {
      id: "1",
      customerName: "John Smith",
      customerPhone: "+1234567890",
      message: "Hi, I'd like to book an appointment for tomorrow",
      campaignId: "1",
      campaignName: "Weekend Special - 20% Off",
      status: "replied",
      sentAt: "2024-03-21T10:30:00Z",
      repliedAt: "2024-03-21T10:45:00Z",
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      customerPhone: "+1234567891",
      message: "Is the coupon still valid?",
      campaignId: "1",
      campaignName: "Weekend Special - 20% Off",
      status: "pending",
      sentAt: "2024-03-21T09:15:00Z",
    },
    {
      id: "3",
      customerName: "Mike Chen",
      customerPhone: "+1234567892",
      message: "Thanks for the discount! Just redeemed it",
      campaignId: "2",
      campaignName: "Spring Collection Launch",
      status: "read",
      sentAt: "2024-03-20T16:20:00Z",
    },
    {
      id: "4",
      customerName: "Emily Davis",
      customerPhone: "+1234567893",
      message: "What are your opening hours?",
      campaignId: null,
      campaignName: null,
      status: "replied",
      sentAt: "2024-03-20T14:10:00Z",
      repliedAt: "2024-03-20T14:25:00Z",
    },
    {
      id: "5",
      customerName: "David Wilson",
      customerPhone: "+1234567894",
      message: "Can I use multiple coupons?",
      campaignId: "3",
      campaignName: "Buy 1 Get 1 Free",
      status: "pending",
      sentAt: "2024-03-20T11:30:00Z",
    },
  ]
}

// Campaigns API
export async function getCampaigns(): Promise<Campaign[]> {
  await delay(600)
  return mockCampaigns
}

export async function getCampaignsByMerchant(merchantId: string): Promise<Campaign[]> {
  await delay(400)
  return mockCampaigns.filter((c) => c.merchantId === merchantId)
}

export async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  await delay(1000)

  const newCampaign: Campaign = {
    id: `camp_${Date.now()}`,
    name: campaignData.name || "New Campaign",
    merchantId: campaignData.merchantId || "merch_1",
    status: "draft",
    type: campaignData.type || "whatsapp",
    message: campaignData.message || "",
    imageUrl: campaignData.imageUrl,
    couponCode: campaignData.couponCode,
    discount: campaignData.discount || 0,
    targetAudience: campaignData.targetAudience || "all",
    scheduledFor: campaignData.scheduledFor,
    createdAt: new Date().toISOString(),
    impressions: 0,
    clicks: 0,
    redemptions: 0,
    revenue: 0,
  }

  // In a real app, this would save to database
  mockCampaigns.unshift(newCampaign)

  return newCampaign
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  await delay(600)

  const campaignIndex = mockCampaigns.findIndex((c) => c.id === id)
  if (campaignIndex === -1) return null

  mockCampaigns[campaignIndex] = { ...mockCampaigns[campaignIndex], ...updates }
  return mockCampaigns[campaignIndex]
}

export async function deleteCampaign(id: string): Promise<boolean> {
  await delay(400)

  const campaignIndex = mockCampaigns.findIndex((c) => c.id === id)
  if (campaignIndex === -1) return false

  mockCampaigns.splice(campaignIndex, 1)
  return true
}

// Affiliates API
export async function getAffiliates(): Promise<Affiliate[]> {
  await delay(700)
  return mockAffiliates
}

// Payments API
export async function getPayments(): Promise<Payment[]> {
  await delay(500)
  return mockPayments
}

// Analytics API
export async function getMrrData(): Promise<ChartData[]> {
  await delay(600)
  return mockMrrData
}

export async function getCampaignsByChannelData(): Promise<ChartData[]> {
  await delay(400)
  return mockCampaignsByChannel
}

export async function getClicksByCategoryData(): Promise<ChartData[]> {
  await delay(500)
  return mockClicksByCategory
}

// Dashboard stats
export async function getDashboardStats() {
  await delay(800)
  return {
    activeMerchants: mockMerchants.filter((m) => m.status === "active").length,
    mrr: 18900,
    campaignsThisWeek: 12,
    topAffiliate: mockAffiliates[0]?.name || "N/A",
  }
}

export async function getMerchantStats(merchantId: string) {
  await delay(600)
  const merchant = mockMerchants.find((m) => m.id === merchantId)
  const campaigns = mockCampaigns.filter((c) => c.merchantId === merchantId)

  return {
    views: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    clicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    conversations: Math.floor(campaigns.reduce((sum, c) => sum + c.clicks, 0) * 0.3),
    redemptions: campaigns.reduce((sum, c) => sum + c.redemptions, 0),
  }
}

export async function getAffiliateStats(affiliateId: string) {
  await delay(500)
  const affiliate = mockAffiliates.find((a) => a.id === affiliateId)

  return {
    activeReferrals: affiliate?.merchantsReferred || 0,
    mtdCommission: affiliate?.monthlyCommission || 0,
    nextPayoutDate: "2024-04-01",
  }
}

export async function getMerchantDashboard() {
  await delay(800)
  return {
    totalMessages: 2847,
    messageGrowth: 12.5,
    conversions: 342,
    conversionGrowth: 8.3,
    activeCustomers: 1205,
    customerGrowth: 15.2,
    revenue: 8450,
    revenueGrowth: 22.1,
  }
}

export async function getMerchantCampaigns(): Promise<Campaign[]> {
  await delay(600)
  // Return campaigns for the current merchant
  return mockCampaigns.slice(0, 5) // Return top 5 campaigns
}
