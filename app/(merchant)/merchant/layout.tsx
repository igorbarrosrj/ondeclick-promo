"use client"

import type React from "react"
import { Sidebar } from "@/components/merchant/merchant-sidebar"
import { MerchantHeader } from "@/components/merchant/merchant-header"
import { withAuth } from "@/components/withAuth"
import { useAuth } from "@/components/AuthProvider"
import { MerchantUpsell } from "@/components/merchant/merchant-upsell"

function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  // Show upsell screen for basic plan merchants
  if (user?.role === "MERCHANT" && user?.plan === "basic") {
    return <MerchantUpsell />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MerchantHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default withAuth(MerchantLayout, { role: "MERCHANT" })
