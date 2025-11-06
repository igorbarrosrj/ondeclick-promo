"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Crown, User, Briefcase } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"

export function AuthBanner() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) return null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4" />
      case "AFFILIATE":
        return <User className="h-4 w-4" />
      case "MERCHANT":
        return <Briefcase className="h-4 w-4" />
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

  return (
    <Card className="mx-4 sm:mx-6 lg:mx-8 mt-4 border-2 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Logado como:</span>
              <span className="font-semibold">{user.name}</span>
              <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1">{user.role}</span>
              </Badge>
            </div>
          </div>
          <Button size="sm" onClick={() => router.push(getDashboardPath(user.role))}>
            Ir para Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
