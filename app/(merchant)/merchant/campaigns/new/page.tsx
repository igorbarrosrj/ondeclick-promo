"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Wand2, Calendar, Target, MessageSquare, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createCampaign } from "@/lib/api"

interface CampaignFormData {
  name: string
  message: string
  imageUrl?: string
  couponCode?: string
  discount: number
  targetAudience: string
  scheduledFor?: string
  type: "whatsapp" | "status" | "broadcast"
}

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    message: "",
    imageUrl: "",
    couponCode: "",
    discount: 0,
    targetAudience: "all",
    type: "whatsapp",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await createCampaign({
        ...formData,
        merchantId: "merch_1", // In real app, get from auth context
      })

      toast({
        title: "Campaign Created!",
        description: "Your campaign has been created successfully.",
      })

      router.push("/merchant/campaigns")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAIContent = () => {
    // Simulate AI content generation
    const aiMessages = [
      "🎉 Special offer just for you! Get 20% off your next visit. Use code SAVE20 and treat yourself today!",
      "✨ Limited time offer! Book now and save big with our exclusive discount. Your perfect experience awaits!",
      "🔥 Don't miss out! Exclusive deal for our valued customers. Use your special code and enjoy amazing savings!",
    ]

    const randomMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)]
    setFormData((prev) => ({ ...prev, message: randomMessage }))

    toast({
      title: "AI Content Generated!",
      description: "Your message has been optimized for better engagement.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Campaign</h1>
            <p className="text-muted-foreground">Build your WhatsApp marketing campaign in minutes</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Campaign Details"}
                  {currentStep === 2 && "Create Your Message"}
                  {currentStep === 3 && "Target Audience"}
                  {currentStep === 4 && "Review & Launch"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Set up the basic information for your campaign"}
                  {currentStep === 2 && "Craft the perfect message with AI assistance"}
                  {currentStep === 3 && "Choose who will receive your campaign"}
                  {currentStep === 4 && "Review everything before launching"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Campaign Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Weekend Special Offer"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Campaign Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp Direct Message</SelectItem>
                          <SelectItem value="status">WhatsApp Status</SelectItem>
                          <SelectItem value="broadcast">Broadcast List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                        <Input
                          id="couponCode"
                          placeholder="e.g., SAVE20"
                          value={formData.couponCode}
                          onChange={(e) => setFormData((prev) => ({ ...prev, couponCode: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount % (Optional)</Label>
                        <Input
                          id="discount"
                          type="number"
                          placeholder="20"
                          value={formData.discount || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Message Creation */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Your Message</Label>
                      <Button variant="outline" size="sm" onClick={generateAIContent}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="message"
                      placeholder="Write your promotional message here..."
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      rows={6}
                    />

                    <div className="space-y-2">
                      <Label>Add Image (Optional)</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload an image to make your campaign more engaging
                        </p>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Target Audience */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select
                        value={formData.targetAudience}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="new">New Customers</SelectItem>
                          <SelectItem value="returning">Returning Customers</SelectItem>
                          <SelectItem value="vip">VIP Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledFor">Schedule (Optional)</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={formData.scheduledFor || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Estimated Reach</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contacts</p>
                          <p className="font-semibold">1,247</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Opens</p>
                          <p className="font-semibold">~890 (71%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Campaign Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{formData.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-medium capitalize">{formData.targetAudience}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Discount</p>
                          <p className="font-medium">{formData.discount}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Message Preview</h4>
                      <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        <p className="text-sm whitespace-pre-wrap">{formData.message}</p>
                        {formData.couponCode && (
                          <div className="mt-2">
                            <Badge variant="secondary">{formData.couponCode}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button onClick={handleNext}>Next</Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Creating..." : "Create Campaign"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Keep it personal</p>
                    <p className="text-xs text-muted-foreground">Use friendly, conversational language</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Clear call-to-action</p>
                    <p className="text-xs text-muted-foreground">Tell customers exactly what to do</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Time it right</p>
                    <p className="text-xs text-muted-foreground">Send when your customers are most active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Expected Opens</span>
                    <span className="font-medium">71%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Click Rate</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span className="font-medium">3.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
