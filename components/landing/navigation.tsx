"use client"

import { useState } from "react"
import { Menu, X, User, LogOut, Settings, Crown, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />
      case "AFFILIATE":
        return <User className="h-3 w-3" />
      case "MERCHANT":
        return <Briefcase className="h-3 w-3" />
      default:
        return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "AFFILIATE":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "MERCHANT":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "/admin"
      case "AFFILIATE":
        return "/affiliate"
      case "MERCHANT":
        return "/merchant"
      default:
        return "/"
    }
  }

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              Perguntas
            </a>
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge variant="outline" className={`text-xs h-4 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push(getDashboardPath(user.role))}>
                    <Settings className="mr-2 h-4 w-4" />
                    Ir para Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/sign-in")}>
                  Entrar
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() =>
                    window.open("https://wa.me/1234567890?text=Quero começar com OneClick Promo", "_blank")
                  }
                >
                  Começar no WhatsApp
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Preços
              </a>
              <a
                href="#faq"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Perguntas
              </a>

              {user ? (
                <>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge variant="outline" className={`text-xs h-4 w-fit ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push(getDashboardPath(user.role))
                      setIsOpen(false)
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Ir para Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/sign-in")
                      setIsOpen(false)
                    }}
                  >
                    Entrar
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 w-full"
                    onClick={() => {
                      window.open("https://wa.me/1234567890?text=Quero começar com OneClick Promo", "_blank")
                      setIsOpen(false)
                    }}
                  >
                    Começar no WhatsApp
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
