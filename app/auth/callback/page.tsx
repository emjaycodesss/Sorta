/**
 * Auth Callback Page
 * Handles email confirmation and other auth redirects
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<string>("Processing...")
  const router = useRouter()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const supabase = createClient()
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus("Authentication failed. Please try again.")
          setTimeout(() => router.push("/auth"), 3000)
          return
        }
        
        if (data.session) {
          setStatus("Authentication successful! Redirecting...")
          setTimeout(() => router.push("/dashboard"), 1000)
        } else {
          setStatus("No session found. Redirecting to login...")
          setTimeout(() => router.push("/auth"), 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus("An error occurred. Redirecting to login...")
        setTimeout(() => router.push("/auth"), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Processing Authentication</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <p>{status}</p>
        </CardContent>
      </Card>
    </div>
  )
} 