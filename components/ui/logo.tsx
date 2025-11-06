import { MessageCircle } from "lucide-react"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
      </div>
      {showText && (
        <span className="font-bold text-xl text-foreground">
          OneClick<span className="text-primary">Promo</span>
        </span>
      )}
    </div>
  )
}
