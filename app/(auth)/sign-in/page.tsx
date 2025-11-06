"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, User, Crown, Briefcase } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { toast } from "@/hooks/use-toast"
import { demoAccounts } from "@/lib/mockSession"
import { WhatsAppModal } from "@/components/WhatsAppModal"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true)

    const { success, error } = await signIn(data.email, data.password)

    if (success) {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      })

      // Redirect based on role
      const user = demoAccounts.find((u) => u.email === data.email)
      if (user?.role === "ADMIN") {
        router.push("/admin")
      } else if (user?.role === "AFFILIATE") {
        router.push("/affiliate")
      } else if (user?.role === "MERCHANT") {
        router.push("/merchant")
      }
    } else {
      toast({
        title: "Sign in failed",
        description: error || "Please check your credentials and try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const fillDemoAccount = (email: string, password: string) => {
    form.setValue("email", email)
    form.setValue("password", password)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your OneClick Promo account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Continue with your WhatsApp number for instant access</p>
                <Button onClick={() => setShowWhatsAppModal(true)} className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Continue on WhatsApp
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Account Quick Fill */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.id}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fillDemoAccount(
                          account.email,
                          account.role === "ADMIN"
                            ? "Admin123!"
                            : account.role === "AFFILIATE"
                              ? "Aff123!"
                              : "Merch123!",
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
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <WhatsAppModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        onSimulateLink={() => {
          setShowWhatsAppModal(false)
          router.push("/merchant")
        }}
      />
    </div>
  )
}
