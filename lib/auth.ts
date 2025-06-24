import { supabase } from "./supabase"

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      // Validate inputs
      if (!email || !password) {
        return {
          data: null,
          error: { message: "Email and password are required" },
        }
      }

      console.log("Attempting to sign in with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { data: null, error }
      }

      console.log("Sign in successful:", data.user?.email)
      return { data, error: null }
    } catch (err) {
      console.error("Sign in exception:", err)
      return {
        data: null,
        error: {
          message: "Authentication service unavailable. Please check your connection and try again.",
        },
      }
    }
  },

  // Sign up new user
  async signUp(email: string, password: string, userData?: { name?: string; role?: string }) {
    try {
      if (!email || !password) {
        return {
          data: null,
          error: { message: "Email and password are required" },
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: userData || {},
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error("Sign up exception:", err)
      return {
        data: null,
        error: {
          message: "Registration service unavailable. Please try again later.",
        },
      }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
      return { error }
    } catch (err) {
      console.error("Sign out exception:", err)
      return { error: { message: "Sign out failed" } }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Get user error:", error)
        return { user: null, error }
      }

      return { user, error: null }
    } catch (err) {
      console.error("Get user exception:", err)
      return {
        user: null,
        error: {
          message: "Unable to verify authentication status",
        },
      }
    }
  },

  // Get current session
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Get session error:", error)
        return { session: null, error }
      }

      return { session, error: null }
    } catch (err) {
      console.error("Get session exception:", err)
      return {
        session: null,
        error: {
          message: "Unable to retrieve session",
        },
      }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      return supabase.auth.onAuthStateChange(callback)
    } catch (err) {
      console.error("Auth state change listener error:", err)
      // Return a dummy subscription that can be safely unsubscribed
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log("Dummy unsubscribe called"),
          },
        },
      }
    }
  },
}
