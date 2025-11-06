"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { AuthState, User } from "@/types/auth"
import { authService } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing session on mount
    const session = authService.getSession()
    setState({
      session,
      isLoading: false,
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))

    const { session, error } = await authService.signIn(email, password)

    setState({
      session,
      isLoading: false,
    })

    return {
      success: !!session,
      error,
    }
  }

  const signOut = () => {
    authService.signOut()
    setState({
      session: null,
      isLoading: false,
    })
  }

  const value: AuthContextType = {
    ...state,
    user: state.session?.user || null,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
