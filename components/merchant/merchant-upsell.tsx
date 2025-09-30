"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Check, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

export function MerchantUpsell() {
  const { user } = useAuth()

  const proFeatures = [
    "Full dashboard access",
    "Advanced analytics",
    "Unlimited campaigns",
    "WhatsApp Status posting",
    "Priority support",
    "Custom branding",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Upgrade to Pro</CardTitle>
          <CardDescription className="text-lg">
            Unlock the full power of OneClick Promo for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Hi {user?.name}! You're currently on the <strong>Basic</strong> plan.
            </p>
            <p className="text-lg">
              Upgrade to <strong className="text-blue-600">Pro</strong> to unlock dashboard access and advanced
              features.
            </p>
          </div>

          <div className="grid gap-3">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Pro Plan</p>
                <p className="text-blue-700">Everything you need to grow</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">$97</p>
                <p className="text-sm text-blue-700">per month</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" size="lg">
              Upgrade to Pro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">30-day money-back guarantee • Cancel anytime</p>
        </CardContent>
      </Card>
    </div>
  )
}
