// Mock data for the OneClick Promo platform

export interface Merchant {
  id: string
  name: string
  email: string
  phone: string
  category: "restaurant" | "barber" | "boutique" | "fitness" | "beauty" | "other"
  plan: "basic" | "pro" | "plus"
  status: "active" | "suspended" | "trial"
  createdAt: string
  lastActive: string
  totalCampaigns: number
  totalClicks: number
  totalRedemptions: number
  avatar?: string
  location?: string
}

export interface Campaign {
  id: string
  merchantId: string
  merchantName: string
  title: string
  description: string
  channel: "status" | "waba" | "ads" | "groups"
  status: "active" | "paused" | "completed" | "draft"
  createdAt: string
  clicks: number
  impressions: number
  redemptions: number
  couponCode?: string
  imageUrl?: string
  targetAudience?: string
}

export interface Affiliate {
  id: string
  name: string
  email: string
  code: string
  merchantsReferred: number
  monthlyCommission: number
  totalCommission: number
  status: "active" | "inactive"
  joinedAt: string
  lastPayout?: string
}

export interface Payment {
  id: string
  merchantId: string
  merchantName: string
  plan: "basic" | "pro" | "plus"
  amount: number
  status: "paid" | "pending" | "failed"
  nextChargeDate: string
  createdAt: string
}

export interface ChartData {
  name: string
  value: number
  date?: string
}

export interface MerchantAnalytics {
  totalMessages: number
  messageGrowth: number
  conversionRate: number
  conversionGrowth: number
  activeCustomers: number
  customerGrowth: number
  revenue: number
  revenueGrowth: number
  topCampaigns: {
    id: string
    name: string
    messagesSent: number
    conversions: number
  }[]
}

// Mock merchants
export const mockMerchants: Merchant[] = [
  {
    id: "1",
    name: "Tony's Barbershop",
    email: "tony@barbershop.com",
    phone: "+1234567890",
    category: "barber",
    plan: "pro",
    status: "active",
    createdAt: "2024-01-15",
    lastActive: "2024-03-20",
    totalCampaigns: 24,
    totalClicks: 1250,
    totalRedemptions: 89,
    location: "New York, NY",
  },
  {
    id: "2",
    name: "Bella's Boutique",
    email: "bella@boutique.com",
    phone: "+1234567891",
    category: "boutique",
    plan: "plus",
    status: "active",
    createdAt: "2024-02-01",
    lastActive: "2024-03-21",
    totalCampaigns: 18,
    totalClicks: 2100,
    totalRedemptions: 156,
    location: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Mario's Pizza",
    email: "mario@pizza.com",
    phone: "+1234567892",
    category: "restaurant",
    plan: "basic",
    status: "trial",
    createdAt: "2024-03-10",
    lastActive: "2024-03-21",
    totalCampaigns: 3,
    totalClicks: 145,
    totalRedemptions: 12,
    location: "Chicago, IL",
  },
]

// Mock campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    merchantId: "1",
    merchantName: "Tony's Barbershop",
    title: "Weekend Special - 20% Off",
    description: "Get 20% off all haircuts this weekend only!",
    channel: "status",
    status: "active",
    createdAt: "2024-03-20",
    clicks: 89,
    impressions: 450,
    redemptions: 12,
    couponCode: "WEEKEND20",
  },
  {
    id: "2",
    merchantId: "2",
    merchantName: "Bella's Boutique",
    title: "Spring Collection Launch",
    description: "New spring arrivals with exclusive 30% discount",
    channel: "waba",
    status: "active",
    createdAt: "2024-03-19",
    clicks: 156,
    impressions: 890,
    redemptions: 23,
    couponCode: "SPRING30",
  },
  {
    id: "3",
    merchantId: "3",
    merchantName: "Mario's Pizza",
    title: "Buy 1 Get 1 Free",
    description: "Order any large pizza and get another one free!",
    channel: "groups",
    status: "completed",
    createdAt: "2024-03-18",
    clicks: 234,
    impressions: 1200,
    redemptions: 45,
    couponCode: "BOGO",
  },
]

// Mock affiliates
export const mockAffiliates: Affiliate[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    code: "SARAH2024",
    merchantsReferred: 12,
    monthlyCommission: 480,
    totalCommission: 2340,
    status: "active",
    joinedAt: "2024-01-10",
    lastPayout: "2024-03-01",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    code: "MIKE2024",
    merchantsReferred: 8,
    monthlyCommission: 320,
    totalCommission: 1560,
    status: "active",
    joinedAt: "2024-02-15",
  },
]

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: "1",
    merchantId: "1",
    merchantName: "Tony's Barbershop",
    plan: "pro",
    amount: 97,
    status: "paid",
    nextChargeDate: "2024-04-15",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    merchantId: "2",
    merchantName: "Bella's Boutique",
    plan: "plus",
    amount: 147,
    status: "paid",
    nextChargeDate: "2024-04-01",
    createdAt: "2024-03-01",
  },
]

// Mock chart data
export const mockMrrData: ChartData[] = [
  { name: "Jan", value: 12500, date: "2024-01" },
  { name: "Feb", value: 15800, date: "2024-02" },
  { name: "Mar", value: 18900, date: "2024-03" },
]

export const mockCampaignsByChannel: ChartData[] = [
  { name: "Status", value: 45 },
  { name: "WABA", value: 32 },
  { name: "Groups", value: 28 },
  { name: "Ads", value: 15 },
]

export const mockClicksByCategory: ChartData[] = [
  { name: "Restaurant", value: 35 },
  { name: "Barber", value: 25 },
  { name: "Boutique", value: 20 },
  { name: "Beauty", value: 15 },
  { name: "Other", value: 5 },
]

// Testimonials for landing page
export const mockTestimonials = [
  {
    id: "1",
    name: "Maria Rodriguez",
    business: "Maria's Salon",
    rating: 5,
    text: "Increased my bookings by 40% in just 2 weeks. The WhatsApp integration is genius!",
    avatar: "/woman-salon-owner.png",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    business: "Hassan's Restaurant",
    rating: 5,
    text: "My customers love the instant coupons. Sales went up 60% during our last promo.",
    avatar: "/restaurant-owner.png",
  },
  {
    id: "3",
    name: "Lisa Chen",
    business: "Trendy Boutique",
    rating: 5,
    text: "Finally, marketing that actually works! No complicated setup, just results.",
    avatar: "/woman-boutique-owner.jpg",
  },
]
