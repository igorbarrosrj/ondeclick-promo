import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles, Video, Wand2 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center grid-pattern overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                {"AI-Powered Video Creation"}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                {"Create stunning "}
                <span className="text-primary">{"promo videos"}</span>
                {" in seconds"}
              </h1>

              <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl">
                {
                  "Transform your ideas into professional promotional videos with AI. No editing skills required. Just describe what you want, and watch the magic happen."
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/signup">
                  {"Start Creating Free"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                <Play className="w-5 h-5 mr-2" />
                {"Watch Demo"}
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
                </div>
                <span className="ml-3">{"10,000+ creators trust us"}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Video className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{"Video Preview"}</h3>
                    <p className="text-sm text-muted-foreground">{"AI-generated in 30 seconds"}</p>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-semibold text-sm">{"Summer Sale - 50% Off!"}</p>
                  </div>
                </div>

                {/* AI Generation Status */}
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{"AI Processing"}</span>
                    <span className="text-sm text-primary">{"Complete"}</span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <span className="text-primary mr-2">✓</span>
                      {"Script generated"}
                    </div>
                    <div className="flex items-center">
                      <span className="text-primary mr-2">✓</span>
                      {"Visuals created"}
                    </div>
                    <div className="flex items-center">
                      <span className="text-primary mr-2">✓</span>
                      {"Music & effects added"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-float">
              <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <div
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
