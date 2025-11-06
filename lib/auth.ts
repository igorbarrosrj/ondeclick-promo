import type { User, Session } from "@/types/auth"
import { demoAccounts, demoPasswords, wait } from "./mockSession"

const SESSION_KEY = "oneclick_session"

// Mock JWT creation (base64 encoded payload)
function createMockToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return `mock.${btoa(JSON.stringify(payload))}.signature`
}

// Mock JWT validation
function validateMockToken(token: string): { valid: boolean; payload?: any } {
  try {
    const [, payloadB64] = token.split(".")
    const payload = JSON.parse(atob(payloadB64))
    return {
      valid: payload.exp > Date.now(),
      payload,
    }
  } catch {
    return { valid: false }
  }
}

export class AuthService {
  // Sign in with email/password
  async signIn(email: string, password: string): Promise<{ session: Session | null; error?: string }> {
    await wait(400) // Simulate API delay

    const user = demoAccounts.find((u) => u.email === email)
    const validPassword = demoPasswords[email] === password

    if (!user || !validPassword) {
      return { session: null, error: "Invalid credentials" }
    }

    const token = createMockToken(user)
    const session: Session = {
      token,
      user,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }

    // Store in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return { session }
  }

  // Sign out
  signOut(): void {
    localStorage.removeItem(SESSION_KEY)
  }

  // Get current session
  getSession(): Session | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null

      const session: Session = JSON.parse(stored)

      // Validate token
      const { valid } = validateMockToken(session.token)
      if (!valid || session.exp < Date.now()) {
        this.signOut()
        return null
      }

      return session
    } catch {
      this.signOut()
      return null
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getSession()
    return session?.user || null
  }
}

// Export singleton instance
export const authService = new AuthService()
