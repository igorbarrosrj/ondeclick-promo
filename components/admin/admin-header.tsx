"use client"

import { Menu, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="-m-2.5 p-2.5 lg:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
          <Input className="pl-10 sm:text-sm" placeholder="Search merchants, campaigns..." type="search" />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
          </Button>
          <ThemeToggle />
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
          <div className="flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">A</span>
            </div>
            <span className="hidden lg:block text-sm font-semibold">Admin</span>
          </div>
        </div>
      </div>
    </div>
  )
}
