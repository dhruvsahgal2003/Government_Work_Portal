import { createClient } from "@supabase/supabase-js"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Missing Supabase URL configuration")
}

if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error("Missing Supabase anon key configuration")
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error("Invalid Supabase URL format:", supabaseUrl)
  throw new Error("Invalid Supabase URL format")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "gov-work-tracker",
    },
  },
})

// Test connection on initialization
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.warn("Supabase auth session check failed:", error.message)
    } else {
      console.log("Supabase connection established successfully")
    }
  } catch (err) {
    console.error("Failed to test Supabase connection:", err)
  }
}

// Test connection in browser environment only
if (typeof window !== "undefined") {
  testConnection()
}

// Database Types matching your actual schema
export interface WorkRecord {
  id?: string
  full_name: string
  phone_number: string
  place_address: string
  village_city: string
  constituency_origin: string
  constituency_work: string
  nature_of_work: "development" | "jan_kalyan" | "transfers_employment" | "other"
  nature_of_work_details?: string
  action_taken?: string
  concerned_person_contact?: string
  work_allocated_to?: string
  status?: "done" | "in_progress" | "incomplete"
  date_of_entry?: string
  is_draft?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
  // Related data
  referred_by?: ReferredBy[]
}

export interface ReferredBy {
  id?: string
  work_record_id?: string
  referrer_name: string
  referrer_contact?: string
  is_self?: boolean
  created_at?: string
}

// Form interface for the UI (different from database)
export interface ReferredByForm {
  name: string
  contact: string
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: "INSERT" | "UPDATE" | "DELETE"
  old_values?: any
  new_values?: any
  user_id?: string
  created_at: string
}
