"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, Upload, Bell, Shield, CreditCard, Smartphone, Globe, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("Tasty Bites Restaurant")
  const [businessDescription, setBusinessDescription] = useState(
    "Authentic Mexican cuisine with fresh ingredients and bold flavors.",
  )
  const [contactEmail, setContactEmail] = useState("maria@tastybites.com")
  const [contactPhone, setContactPhone] = useState("+1 (555) 123-4567")
  const [whatsappNumber, setWhatsappNumber] = useState("+1 (555) 123-4567")
  const [website, setWebsite] = useState("https://tastybites.com")
  const [order_id, setOrderId] = useState("12345") // Declared order_id variable
  const [delivery_time, setDeliveryTime] = useState("30 mins") // Declared delivery_time variable

  const [notifications, setNotifications] = useState({
    newMessages: true,
    campaignUpdates: true,
    paymentAlerts: true,
    weeklyReports: false,
  })

  const handleSave = () => {
    // In a real app, this would save to API
    console.log("Saving settings...")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and business preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>Update your business details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/restaurant-owner.png" alt="Business Logo" />
                  <AvatarFallback>TB</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">Recommended: 200x200px, PNG or JPG</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                WhatsApp Configuration
              </CardTitle>
              <CardDescription>Configure your WhatsApp Business integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Business Number</Label>
                <Input id="whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                <p className="text-sm text-muted-foreground">This number will be used for all campaign messages</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Message Templates</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Welcome Message</h4>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hi {{ name }}! Welcome to Tasty Bites. We're excited to serve you delicious Mexican cuisine!
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Order Confirmation</h4>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thanks {{ name }}! Your order #{order_id} has been confirmed. Estimated delivery: {delivery_time}.
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Messages</h4>
                    <p className="text-sm text-muted-foreground">Get notified when customers send messages</p>
                  </div>
                  <Switch
                    checked={notifications.newMessages}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newMessages: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Campaign Updates</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about your campaign performance</p>
                  </div>
                  <Switch
                    checked={notifications.campaignUpdates}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, campaignUpdates: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Payment Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified about billing and payment issues</p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, paymentAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Professional Plan</h4>
                  <span className="text-2xl font-bold">$49/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Up to 10,000 messages per month • Advanced analytics • Priority support
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    Cancel Subscription
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Payment Method</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <span>•••• •••• •••• 4242</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Billing History</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">Professional Plan</span>
                      <span className="text-sm text-muted-foreground ml-2">Dec 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>$49.00</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">Professional Plan</span>
                      <span className="text-sm text-muted-foreground ml-2">Nov 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>$49.00</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Authentication</p>
                    <p className="text-sm text-muted-foreground">Receive codes via SMS to your phone</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Team Access</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Maria Rodriguez</p>
                        <p className="text-sm text-muted-foreground">Owner</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">You</span>
                  </div>
                </div>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
