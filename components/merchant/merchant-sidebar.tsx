"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { LayoutDashboard, Megaphone, BarChart3, Settings, Users, MessageSquare } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/merchant", icon: LayoutDashboard },
  { name: "Campaigns", href: "/merchant/campaigns", icon: Megaphone },
  { name: "Analytics", href: "/merchant/analytics", icon: BarChart3 },
  { name: "Customers", href: "/merchant/customers", icon: Users },
  { name: "Messages", href: "/merchant/messages", icon: MessageSquare },
  { name: "Settings", href: "/merchant/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Logo />
        <p className="text-sm text-muted-foreground mt-2">Merchant Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
