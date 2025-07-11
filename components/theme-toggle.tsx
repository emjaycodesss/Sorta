/**
 * Theme Toggle Switch
 * Circular reveal animation with visible overlay and proper layering
 */
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Only render after component mounts to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = event
    const isDark = resolvedTheme === "dark"
    const newTheme = isDark ? "light" : "dark"

    // Calculate the maximum radius needed to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY)
    )

    console.log('Theme toggle clicked:', { clientX, clientY, maxRadius, isDark, newTheme })

    // Create a visible overlay for the circular reveal
    const overlay = document.createElement('div')
    
    // Ensure full viewport coverage
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.right = '0'
    overlay.style.bottom = '0'
    overlay.style.width = '100vw'
    overlay.style.height = '100vh'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '50' // Higher z-index to make it visible
    overlay.style.background = newTheme === 'dark' ? '#1a1a1a' : '#ffffff'
    overlay.style.borderRadius = '50%'
    
    // Position the overlay to start from the exact click point
    overlay.style.left = `${clientX}px`
    overlay.style.top = `${clientY}px`
    overlay.style.transform = 'translate(-50%, -50%)' // Center on click point
    overlay.style.width = '0'
    overlay.style.height = '0'
    overlay.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    overlay.style.boxShadow = '0 0 0 0 rgba(0,0,0,0.1)'

    // Add to body to ensure it covers the entire viewport
    document.body.appendChild(overlay)

    // Trigger the animation
    requestAnimationFrame(() => {
      overlay.style.width = `${maxRadius * 2}px`
      overlay.style.height = `${maxRadius * 2}px`
      overlay.style.transform = 'translate(-50%, -50%)' // Keep centered on click point
    })

    // Change theme after a brief delay
    setTimeout(() => {
      setTheme(newTheme)
      console.log('Theme changed to:', newTheme)
    }, 100)

    // Clean up
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    }, 800)
  }

  // Show loading state until mounted
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        type="button"
        className="relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-muted select-none focus:outline-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-background shadow" />
        <span className="sr-only">Loading theme toggle</span>
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      ref={buttonRef}
      aria-label="Toggle theme"
      type="button"
      className="relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-muted transition-all duration-300 ease-in-out select-none focus:outline-none hover:scale-105 active:scale-95"
      onClick={handleToggle}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        position: 'relative',
        zIndex: 100, // High z-index to ensure button stays above overlay
      }}
    >
      <span
        className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-background shadow transition-all duration-300 ease-in-out ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
        style={{ zIndex: 101 }} // Ensure icon stays above overlay
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-primary mx-auto my-auto transition-all duration-300" />
        ) : (
          <Sun className="h-5 w-5 text-primary mx-auto my-auto transition-all duration-300" />
        )}
      </span>
      {/* Visually hidden text for accessibility */}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
} 