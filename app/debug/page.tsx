/**
 * Debug Page
 * For testing Supabase connection and authentication
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/auth"

export default function DebugPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)

  // Debug environment variables
  console.log('Environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
  })

  async function testSignUp() {
    try {
      const supabase = createClient()
      console.log('Testing sign up with:', { email, password })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log('Sign up result:', { data, error })
      setResult({ data, error })
    } catch (error) {
      console.error('Sign up test error:', error)
      setResult({ error })
    }
  }

  async function testSignIn() {
    try {
      const supabase = createClient()
      console.log('Testing sign in with:', { email, password })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Sign in result:', { data, error })
      setResult({ data, error })
    } catch (error) {
      console.error('Sign in test error:', error)
      setResult({ error })
    }
  }

  async function testGetUser() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      
      console.log('Get user result:', { data, error })
      setResult({ data, error })
    } catch (error) {
      console.error('Get user test error:', error)
      setResult({ error })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Auth Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testSignUp}>Test Sign Up</Button>
            <Button onClick={testSignIn}>Test Sign In</Button>
            <Button onClick={testGetUser}>Test Get User</Button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 