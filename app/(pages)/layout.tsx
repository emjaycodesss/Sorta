/**
 * Shared Layout for Authenticated Pages
 * Provides navigation and theme toggle for dashboard, wallets, and calendar pages
 */
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Wallet, Calendar, Home } from "lucide-react"
import Link from "next/link"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">Sorta</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/wallets">
                <Button variant="ghost" size="sm">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallets
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </Button>
              </Link>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 