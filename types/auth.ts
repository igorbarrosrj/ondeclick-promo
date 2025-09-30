export type Role = "ADMIN" | "AFFILIATE" | "MERCHANT"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  plan?: "basic" | "pro" | "plus"
}

export type Session = {
  token: string
  user: User
  exp: number
}

export type AuthState = {
  session: Session | null
  isLoading: boolean
}
