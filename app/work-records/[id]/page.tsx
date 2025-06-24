"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Phone,
  MapPin,
  Building,
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { databaseService } from "@/lib/database"
import type { WorkRecord } from "@/lib/supabase"

const getStatusColor = (status: string) => {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "incomplete":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return CheckCircle
    case "in_progress":
      return Clock
    case "incomplete":
      return AlertCircle
    default:
      return Clock
  }
}

const getNatureOfWorkDisplay = (nature: string) => {
  switch (nature) {
    case "development":
      return "Development"
    case "jan_kalyan":
      return "Jan Kalyan"
    case "transfers_employment":
      return "Transfers/Employment"
    case "other":
      return "Other"
    default:
      return nature
  }
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case "done":
      return "Done"
    case "in_progress":
      return "In Progress"
    case "incomplete":
      return "Incomplete"
    default:
      return status
  }
}

export default function WorkRecordDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<WorkRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const recordId = params.id as string

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        setError("No record ID provided.")
        setIsLoading(false)
        return
      }

      // More flexible UUID validation - check if it looks like a UUID
      const isValidUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i.test(
        recordId.replace(/-/g, ""),
      )

      if (!isValidUUID && recordId.length < 8) {
        setError("Invalid record ID. Please check the URL and try again.")
        setIsLoading(false)
        return
      }

      try {
        console.log("Fetching record with ID:", recordId)
        const { data, error: fetchError } = await databaseService.getWorkRecordById(recordId)

        if (fetchError) {
          console.error("Error fetching record:", fetchError)
          if (fetchError.message?.includes("invalid input syntax for type uuid")) {
            setError("Invalid record ID format. Please check the URL and try again.")
          } else if (fetchError.message?.includes("No rows returned")) {
            setError("Work record not found. It may have been deleted or the ID is incorrect.")
          } else {
            setError("Failed to load work record. Please try again.")
          }
          return
        }

        if (!data) {
          setError("Work record not found. It may have been deleted or the ID is incorrect.")
          return
        }

        console.log("Record loaded successfully:", data)
        setRecord(data)
        setError("")
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred while loading the record.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecord()
  }, [recordId])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/work-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/work-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Record Not Found</h3>
                <p className="text-sm">The work record you're looking for doesn't exist or has been removed.</p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => router.push("/work-records")}>
                  View All Records
                </Button>
                <Button onClick={() => router.push("/work-records/create")}>Create New Record</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(record.status || "in_progress")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/work-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Record Details</h1>
            <p className="text-gray-600">Record ID: {record.id?.slice(0, 8)}</p>
          </div>
        </div>
        <Link href={`/work-records/${record.id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="mr-2 h-4 w-4" />
            Edit Record
          </Button>
        </Link>
      </div>

      {/* Status Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Current Status</h3>
                <p className="text-sm text-gray-600">
                  Last updated: {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(record.status || "in_progress")}>
              {getStatusDisplay(record.status || "in_progress")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600">Full Name</Label>
              <p className="text-gray-900 font-medium">{record.full_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{record.phone_number}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Place/Address</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{record.place_address}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Village/City</Label>
              <p className="text-gray-900">{record.village_city}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Constituency Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Constituency Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600">Constituency of Origin</Label>
              <p className="text-gray-900">{record.constituency_origin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Constituency of Work</Label>
              <p className="text-gray-900">{record.constituency_work}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referred By */}
      {record.referred_by && record.referred_by.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referred By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {record.referred_by.map((ref, index) => (
                <div key={ref.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ref.referrer_name}</p>
                    {ref.referrer_contact && <p className="text-sm text-gray-600">{ref.referrer_contact}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600">Nature of Work</Label>
              <Badge variant="outline" className="mt-1">
                {getNatureOfWorkDisplay(record.nature_of_work)}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Date of Entry</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">
                  {record.date_of_entry ? new Date(record.date_of_entry).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {record.nature_of_work_details && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Nature Details</Label>
              <p className="text-gray-900 mt-1">{record.nature_of_work_details}</p>
            </div>
          )}

          {record.action_taken && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Action Taken</Label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{record.action_taken}</p>
            </div>
          )}

          {record.concerned_person_contact && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Concerned Person/Contact</Label>
              <p className="text-gray-900 mt-1">{record.concerned_person_contact}</p>
            </div>
          )}

          {record.work_allocated_to && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Work Allocated To</Label>
              <p className="text-gray-900 mt-1">{record.work_allocated_to}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs font-medium text-gray-500">Created</Label>
              <p className="text-gray-900">
                {record.created_at ? new Date(record.created_at).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">Last Updated</Label>
              <p className="text-gray-900">
                {record.updated_at ? new Date(record.updated_at).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
