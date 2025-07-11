/**
 * Shared Layout for Authenticated Pages
 * Sidebar (left) with logo, project name (side by side, h-16), nav, sign out. Main area (right) with header (burger, page title, theme toggle) and content.
 */
"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Wallet, Calendar, Home, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { signOut } from "@/lib/auth"
import { toast } from "sonner"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Calendar", href: "/calendar", icon: Calendar },
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // for mobile overlay
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Sidebar width
  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64"

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      const { error } = await signOut()
      
      if (error) {
        toast.error("Failed to sign out")
      } else {
        toast.success("Signed out successfully")
        router.push("/auth")
      }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error("Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar (left) */}
      <aside
        className={`h-screen fixed top-0 left-0 z-30 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out ${sidebarWidth} ${sidebarOpen ? 'block' : 'hidden'} lg:block`}
        style={{
          '--sidebar-width': sidebarCollapsed ? '5rem' : '16rem',
        } as React.CSSProperties}
      >
        {/* Top section with logo/name */}
        <div className="flex flex-col h-full">
          {/* Project logo/name at top, same height as header, side by side */}
          <div className="flex items-center h-16 px-4 border-b border-border">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-xl ml-3">Sorta</span>
            )}
          </div>
          
          {/* Navigation - takes up remaining space */}
          <nav className="flex-1 py-4 space-y-2 border-b border-border">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="px-2">
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start px-4 py-4 text-base ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mb-0.5" />
                      {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </nav>
          
          {/* Sign out at bottom, matching nav link padding */}
          <div className="border-t border-border px-2 pb-4 pt-4">
            <Button 
              variant="ghost" 
              className={`w-full justify-start text-destructive hover:text-destructive px-4 py-4 text-base ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-5 w-5 mb-0.5" />
              {!sidebarCollapsed && <span className="ml-3">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area (right of sidebar) */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header (topbar, only above main content) */}
        <header className="h-16 flex items-center px-4 border-b border-border bg-background sticky top-0 z-100">
          {/* Burger icon (always visible) */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(true)
              else setSidebarCollapsed((c) => !c)
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Page title (center/left) */}
          <h1 className="text-lg font-semibold flex-1 truncate">
            {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
          </h1>
          {/* Theme toggle (right) */}
          <ThemeToggle />
        </header>
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 