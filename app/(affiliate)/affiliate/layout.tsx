"use client"

import type React from "react"

import { useState } from "react"
import { AffiliateSidebar } from "@/components/affiliate/affiliate-sidebar"
import { AffiliateHeader } from "@/components/affiliate/affiliate-header"
import { withAuth } from "@/components/withAuth"

function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AffiliateSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <AffiliateHeader setSidebarOpen={setSidebarOpen} />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default withAuth(AffiliateLayout, { role: "AFFILIATE" })
