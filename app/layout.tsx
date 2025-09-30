import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/AuthProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "OneClick Promo - AI-Powered Promotional Video Creation",
  description:
    "Create stunning promotional videos in seconds with AI. Perfect for marketers, content creators, and businesses. No design skills needed.",
  keywords: "AI video creation, promotional videos, marketing videos, AI content creation, video marketing",
  authors: [{ name: "OneClick Promo" }],
  openGraph: {
    title: "OneClick Promo - AI-Powered Promotional Video Creation",
    description: "Create stunning promotional videos in seconds with AI. No design skills needed.",
    url: "https://oneclickpromo.com",
    siteName: "OneClick Promo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OneClick Promo - AI Video Creation Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneClick Promo - AI-Powered Promotional Video Creation",
    description: "Create stunning promotional videos in seconds with AI. No design skills needed.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
