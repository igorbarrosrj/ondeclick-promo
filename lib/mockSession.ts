import type { User } from "@/types/auth"

// Demo accounts for testing
export const demoAccounts: User[] = [
  {
    id: "u_admin",
    name: "Site Admin",
    email: "admin@oneclickpromo.dev",
    role: "ADMIN",
  },
  {
    id: "u_aff",
    name: "Demo Affiliate",
    email: "affiliate@oneclickpromo.dev",
    role: "AFFILIATE",
  },
  {
    id: "u_merch",
    name: "Demo Merchant (Pro)",
    email: "merchant@oneclickpromo.dev",
    role: "MERCHANT",
    plan: "pro",
  },
]

// Demo passwords (in real app, these would be hashed)
export const demoPasswords: Record<string, string> = {
  "admin@oneclickpromo.dev": "Admin123!",
  "affiliate@oneclickpromo.dev": "Aff123!",
  "merchant@oneclickpromo.dev": "Merch123!",
}

// Utility to wait (simulate API delay)
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
