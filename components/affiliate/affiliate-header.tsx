"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/AuthProvider"

interface AffiliateHeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export function AffiliateHeader({ setSidebarOpen }: AffiliateHeaderProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.name ?? "Sarah Johnson",
    email: user?.email ?? "sarah@affiliatehub.com",
    phone: "+55 (21) 97777-1234",
  })

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }))
    }
  }, [user?.name, user?.email])

  const handleChange = (field: "name" | "email" | "phone") =>
    (event: ChangeEvent<HTMLInputElement>) => setProfile((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSave = () => {
    console.log("Affiliate profile updated", profile)
    setAccountOpen(false)
  }

  const handleLogout = () => {
    signOut()
    router.push("/login")
    setAccountOpen(false)
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="-m-2.5 p-2.5 lg:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">2</Badge>
          </Button>
          <ThemeToggle />
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
          <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-x-2 focus:outline-hidden">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {profile.name.slice(0, 1)}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-semibold">{profile.name}</span>
              </button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Minha conta</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <Label htmlFor="affiliate-name">Nome</Label>
                  <Input id="affiliate-name" value={profile.name} onChange={handleChange("name")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="affiliate-email">Email</Label>
                  <Input
                    id="affiliate-email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange("email")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="affiliate-phone">Telefone</Label>
                  <Input
                    id="affiliate-phone"
                    value={profile.phone}
                    onChange={handleChange("phone")}
                    className="mt-1"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button onClick={handleSave}>Salvar alterações</Button>
                <Button variant="outline" onClick={() => setAccountOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Sair
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
