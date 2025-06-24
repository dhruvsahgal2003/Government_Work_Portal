"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const router = useRouter()

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...")
        const { session, error } = await authService.getSession()

        if (error && error.message?.includes("Load failed")) {
          setConnectionStatus("error")
          setError("Unable to connect to authentication service. Please check your internet connection and try again.")
        } else {
          setConnectionStatus("connected")
          console.log("Connection test successful")

          // If user is already logged in, redirect to dashboard
          if (session?.user) {
            console.log("User already authenticated, redirecting...")
            localStorage.setItem("isAuthenticated", "true")
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
                email: session.user.email,
                role: session.user.user_metadata?.role || "User",
              }),
            )
            router.push("/dashboard")
          }
        }
      } catch (err) {
        console.error("Connection test failed:", err)
        setConnectionStatus("error")
        setError("Authentication service is currently unavailable. Please try again later.")
      }
    }

    testConnection()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connectionStatus === "error") {
      setError("Please check your connection and refresh the page.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error: authError } = await authService.signIn(email, password)

      if (authError) {
        console.error("Login error:", authError)

        // Handle specific error types
        if (authError.message?.includes("Load failed")) {
          setError("Connection lost. Please check your internet connection and try again.")
        } else if (authError.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (authError.message?.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before signing in.")
        } else {
          setError(authError.message || "Login failed. Please try again.")
        }
        return
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.email)

        // Store user data in localStorage for immediate access
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
            email: data.user.email,
            role: data.user.user_metadata?.role || "User",
          }),
        )
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const retryConnection = async () => {
    setConnectionStatus("checking")
    setError("")

    try {
      const { error } = await authService.getSession()
      if (error && error.message?.includes("Load failed")) {
        setConnectionStatus("error")
        setError("Still unable to connect. Please check your internet connection.")
      } else {
        setConnectionStatus("connected")
      }
    } catch (err) {
      setConnectionStatus("error")
      setError("Connection test failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Government Portal</h1>
          <p className="text-gray-600 mt-2">MP Work Tracking System</p>
        </div>

        {/* Connection Status */}
        {connectionStatus === "checking" && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Connecting to authentication service...</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "error" && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Connection failed</span>
              <Button variant="outline" size="sm" onClick={retryConnection}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "connected" && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Connected successfully</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading || connectionStatus !== "connected"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading || connectionStatus !== "connected"}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading || connectionStatus !== "connected"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Create an account in Supabase Auth to get started
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
