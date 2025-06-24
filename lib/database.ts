import { supabase, type WorkRecord, type ReferredByForm } from "./supabase"

export const databaseService = {
  // Work Records Operations
  async createWorkRecord(
    record: Omit<WorkRecord, "id" | "created_at" | "updated_at"> & { referred_by?: ReferredByForm[] },
  ) {
    try {
      // Get current user with better error handling
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("Current user:", user)
      console.log("User error:", userError)

      if (userError) {
        console.error("Authentication error:", userError)
        throw new Error(`Authentication failed: ${userError.message}`)
      }

      if (!user) {
        console.error("No user found")
        throw new Error("User not authenticated. Please log in again.")
      }

      // Insert work record
      const { data: workRecord, error: recordError } = await supabase
        .from("work_records")
        .insert([
          {
            full_name: record.full_name,
            phone_number: record.phone_number,
            place_address: record.place_address,
            village_city: record.village_city,
            constituency_origin: record.constituency_origin,
            constituency_work: record.constituency_work,
            nature_of_work: record.nature_of_work,
            nature_of_work_details: record.nature_of_work_details,
            action_taken: record.action_taken,
            concerned_person_contact: record.concerned_person_contact,
            work_allocated_to: record.work_allocated_to,
            status: record.status || "in_progress",
            date_of_entry: record.date_of_entry || new Date().toISOString().split("T")[0],
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (recordError) {
        console.error("Database insert error:", recordError)
        throw recordError
      }

      // Insert referred_by records if provided
      if (record.referred_by && record.referred_by.length > 0) {
        const referredByData = record.referred_by
          .filter((ref) => ref.name && ref.name.trim())
          .map((ref) => ({
            work_record_id: workRecord.id,
            referrer_name: ref.name.trim(),
            referrer_contact: ref.contact?.trim() || null,
            is_self: false,
          }))

        if (referredByData.length > 0) {
          const { error: referredError } = await supabase.from("referred_by").insert(referredByData)

          if (referredError) {
            console.error("Error inserting referred_by:", referredError)
            // Don't throw here, just log the error
          }
        }
      }

      return { data: workRecord, error: null }
    } catch (error) {
      console.error("Error creating work record:", error)
      return { data: null, error }
    }
  },

  async getWorkRecords(filters?: {
    search?: string
    dateFrom?: string
    dateTo?: string
    constituencyOrigin?: string
    constituencyWork?: string
    natureOfWork?: string
    status?: string
  }) {
    try {
      // Check authentication first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Authentication error in getWorkRecords:", userError)
        throw new Error("User not authenticated")
      }

      let query = supabase
        .from("work_records")
        .select(`
          *,
          referred_by (
            id,
            referrer_name,
            referrer_contact,
            is_self
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`)
      }

      if (filters?.dateFrom) {
        query = query.gte("date_of_entry", filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte("date_of_entry", filters.dateTo)
      }

      if (filters?.constituencyOrigin) {
        query = query.ilike("constituency_origin", `%${filters.constituencyOrigin}%`)
      }

      if (filters?.constituencyWork) {
        query = query.ilike("constituency_work", `%${filters.constituencyWork}%`)
      }

      if (filters?.natureOfWork && filters.natureOfWork !== "all") {
        query = query.eq("nature_of_work", filters.natureOfWork)
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      const { data, error } = await query

      if (error) {
        console.error("Database query error:", error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error fetching work records:", error)
      return { data: null, error }
    }
  },

  async getWorkRecordById(id: string) {
    try {
      // Check authentication first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("work_records")
        .select(`
          *,
          referred_by (
            id,
            referrer_name,
            referrer_contact,
            is_self
          )
        `)
        .eq("id", id)
        .single()

      return { data, error }
    } catch (error) {
      console.error("Error fetching work record:", error)
      return { data: null, error }
    }
  },

  async updateWorkRecord(id: string, updates: Partial<WorkRecord>) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("work_records")
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq("id", id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Error updating work record:", error)
      return { data: null, error }
    }
  },

  async deleteWorkRecord(id: string) {
    try {
      // Check authentication first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase.from("work_records").delete().eq("id", id)

      return { data, error }
    } catch (error) {
      console.error("Error deleting work record:", error)
      return { data: null, error }
    }
  },

  // Statistics
  async getWorkRecordStats() {
    try {
      // Check authentication first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Authentication error in getWorkRecordStats:", userError)
        return {
          total: 0,
          pending: 0,
          completed: 0,
          thisMonth: 0,
          errors: { error: "User not authenticated" },
        }
      }

      const { count: totalCount, error: totalError } = await supabase
        .from("work_records")
        .select("*", { count: "exact", head: true })

      const { count: pendingCount, error: pendingError } = await supabase
        .from("work_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress")

      const { count: completedCount, error: completedError } = await supabase
        .from("work_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "done")

      const { count: thisMonthCount, error: thisMonthError } = await supabase
        .from("work_records")
        .select("*", { count: "exact", head: true })
        .gte("date_of_entry", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])

      return {
        total: totalCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
        thisMonth: thisMonthCount || 0,
        errors: {
          totalError,
          pendingError,
          completedError,
          thisMonthError,
        },
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      return {
        total: 0,
        pending: 0,
        completed: 0,
        thisMonth: 0,
        errors: { error },
      }
    }
  },
}
