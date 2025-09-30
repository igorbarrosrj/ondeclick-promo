"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/ui/logo"
import { Eye, EyeOff, ArrowLeft, Store, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
    agreeToTerms: false,
  })

  const handleSignup = async (userType: "merchant" | "affiliate") => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real app, this would create the account
    console.log("Creating account as:", userType, formData)

    // Redirect to appropriate dashboard
    if (userType === "merchant") {
      router.push("/merchant")
    } else {
      router.push("/affiliate")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join thousands of successful businesses</p>
        </div>

        <Tabs defaultValue="merchant" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="merchant" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Merchant
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Affiliate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="merchant">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Merchant Account
                </CardTitle>
                <CardDescription>Start marketing your business on WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="merchant-name">Full Name</Label>
                    <Input
                      id="merchant-name"
                      placeholder="Maria Rodriguez"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant-business">Business Name</Label>
                    <Input
                      id="merchant-business"
                      placeholder="Tasty Bites Restaurant"
                      value={formData.businessName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-email">Email</Label>
                  <Input
                    id="merchant-email"
                    type="email"
                    placeholder="maria@tastybites.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-phone">Phone Number</Label>
                  <Input
                    id="merchant-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="merchant-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="merchant-terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                  />
                  <Label htmlFor="merchant-terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleSignup("merchant")}
                  disabled={loading || !formData.agreeToTerms}
                >
                  {loading ? "Creating Account..." : "Create Merchant Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Affiliate Account
                </CardTitle>
                <CardDescription>Earn commissions by referring businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliate-name">Full Name</Label>
                  <Input
                    id="affiliate-name"
                    placeholder="Sarah Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliate-email">Email</Label>
                  <Input
                    id="affiliate-email"
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliate-phone">Phone Number</Label>
                  <Input
                    id="affiliate-phone"
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliate-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="affiliate-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="affiliate-terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                  />
                  <Label htmlFor="affiliate-terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleSignup("affiliate")}
                  disabled={loading || !formData.agreeToTerms}
                >
                  {loading ? "Creating Account..." : "Create Affiliate Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
