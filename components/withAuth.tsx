"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"
import type { Role } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface WithAuthOptions {
  role?: Role
  redirectTo?: string
}

export function withAuth<P extends object>(Component: React.ComponentType<P>, options: WithAuthOptions = {}) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (isLoading) return

      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to access this page.",
          variant: "destructive",
        })
        router.push(options.redirectTo || "/sign-in")
        return
      }

      // Check role if specified
      if (options.role && user.role !== options.role) {
        router.push("/403")
        return
      }
    }, [user, isLoading, router])

    // Show loading while checking auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Don't render if not authenticated or wrong role
    if (!user || (options.role && user.role !== options.role)) {
      return null
    }

    return <Component {...props} />
  }
}
