"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/AuthProvider"

export function MerchantHeader() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.name ?? "Maria Rodriguez",
    email: user?.email ?? "maria@tastybites.com",
    phone: "+55 (11) 98888-0000",
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
    (event: ChangeEvent<HTMLInputElement>) => {
      setProfile((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSave = () => {
    console.log("Merchant profile updated", profile)
    setIsAccountOpen(false)
  }

  const handleLogout = () => {
    signOut()
    router.push("/login")
    setIsAccountOpen(false)
  }

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns, customers..." className="pl-10 w-80" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">
            3
          </span>
        </Button>

        <Sheet open={isAccountOpen} onOpenChange={setIsAccountOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-3 focus:outline-hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/restaurant-owner.png" alt="Merchant" />
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-none">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Minha conta</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 space-y-4">
              <div>
                <Label htmlFor="merchant-name">Nome</Label>
                <Input id="merchant-name" value={profile.name} onChange={handleChange("name")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="merchant-email">Email</Label>
                <Input
                  id="merchant-email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange("email")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="merchant-phone">Telefone</Label>
                <Input
                  id="merchant-phone"
                  value={profile.phone}
                  onChange={handleChange("phone")}
                  className="mt-1"
                />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleSave}>Salvar alterações</Button>
              <Button variant="outline" onClick={() => setIsAccountOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Sair
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
