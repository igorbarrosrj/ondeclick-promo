"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign In Required</CardTitle>
          <CardDescription>You need to be signed in to access this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/sign-in")} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>

          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
