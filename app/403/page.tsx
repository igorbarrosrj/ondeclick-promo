"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowLeft, User, Crown, Briefcase } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { demoAccounts } from "@/lib/mockSession"

export default function ForbiddenPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSwitchAccount = async (email: string, password: string) => {
    signOut()
    // Redirect to sign-in with pre-filled credentials
    router.push(`/sign-in?email=${encodeURIComponent(email)}`)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this area.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-sm text-gray-600">Currently signed in as:</p>
              <p className="font-semibold flex items-center gap-2">
                {getRoleIcon(user.role)}
                {user.name} ({user.role})
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Try switching to a different demo account:</p>

            <div className="grid gap-2">
              {demoAccounts
                .filter((account) => account.role !== user?.role)
                .map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSwitchAccount(
                        account.email,
                        account.role === "ADMIN" ? "Admin123!" : account.role === "AFFILIATE" ? "Aff123!" : "Merch123!",
                      )
                    }
                    className="justify-start"
                  >
                    {getRoleIcon(account.role)}
                    <span className="ml-2">{account.role}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{account.name}</span>
                  </Button>
                ))}
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.back()} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
