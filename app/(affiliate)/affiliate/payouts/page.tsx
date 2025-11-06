"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Download, Clock, CheckCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const mockPayouts = [
  {
    id: "1",
    month: "March 2024",
    amount: 480,
    status: "pending",
    dueDate: "2024-04-01",
    merchants: 12,
    commissionRate: 20,
  },
  {
    id: "2",
    month: "February 2024",
    amount: 320,
    status: "paid",
    paidDate: "2024-03-01",
    merchants: 8,
    commissionRate: 20,
    receiptUrl: "#",
  },
  {
    id: "3",
    month: "January 2024",
    amount: 280,
    status: "paid",
    paidDate: "2024-02-01",
    merchants: 7,
    commissionRate: 20,
    receiptUrl: "#",
  },
]

export default function PayoutsPage() {
  const [isEarlyPayoutOpen, setIsEarlyPayoutOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalEarnings = mockPayouts.reduce((sum, payout) => sum + payout.amount, 0)
  const pendingAmount = mockPayouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Track your commission payments</p>
        </div>
        <Dialog open={isEarlyPayoutOpen} onOpenChange={setIsEarlyPayoutOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Request Early Payout</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Early Payout</DialogTitle>
              <DialogDescription>
                You can request an early payout for your pending commissions. A 5% processing fee applies.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Pending Amount</span>
                  <span className="font-semibold">${pendingAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Processing Fee (5%)</span>
                  <span className="font-semibold">-${(pendingAmount * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">You'll Receive</span>
                    <span className="font-bold text-primary">${(pendingAmount * 0.95).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEarlyPayoutOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEarlyPayoutOpen(false)}>Request Payout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount}</div>
            <p className="text-xs text-muted-foreground">Due April 1st</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Apr 1</div>
            <p className="text-xs text-muted-foreground">Monthly payout schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    {getStatusIcon(payout.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{payout.month}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payout.merchants} active referrals • {payout.commissionRate}% commission
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(payout.status)}>{payout.status.toUpperCase()}</Badge>
                      {payout.status === "pending" && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(payout.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {payout.status === "paid" && (
                        <span className="text-xs text-muted-foreground">
                          Paid {new Date(payout.paidDate!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">${payout.amount}</p>
                    <p className="text-xs text-muted-foreground">Commission</p>
                  </div>
                  {payout.status === "paid" && payout.receiptUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State for New Affiliates */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Earning Today!</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Share your referral link and start earning 20% commission on every merchant you refer. Most affiliates earn
            their first $100 within 7 days.
          </p>
          <div className="flex items-center gap-4">
            <Button>Share Your Link</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
