"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { databaseService } from "@/lib/database"
import type { WorkRecord, ReferredByForm } from "@/lib/supabase"

export default function EditWorkRecordPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

  const recordId = params.id as string

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    placeAddress: "",
    villageCity: "",
    constituencyOrigin: "",
    constituencyWork: "",
    natureOfWork: "",
    natureDetails: "",
    actionTaken: "",
    concernedPerson: "",
    workAllocatedTo: "",
    status: "",
  })

  const [referredBy, setReferredBy] = useState<ReferredByForm[]>([{ name: "", contact: "" }])

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        setErrors({ fetch: "No record ID provided." })
        setIsLoading(false)
        return
      }

      // More flexible UUID validation
      const isValidUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i.test(
        recordId.replace(/-/g, ""),
      )

      if (!isValidUUID && recordId.length < 8) {
        setErrors({ fetch: "Invalid record ID. Please check the URL and try again." })
        setIsLoading(false)
        return
      }

      try {
        console.log("Fetching record for edit with ID:", recordId)
        const { data, error: fetchError } = await databaseService.getWorkRecordById(recordId)

        if (fetchError) {
          console.error("Error fetching record:", fetchError)
          if (fetchError.message?.includes("invalid input syntax for type uuid")) {
            setErrors({ fetch: "Invalid record ID format. Please check the URL and try again." })
          } else if (fetchError.message?.includes("No rows returned")) {
            setErrors({ fetch: "Work record not found. It may have been deleted or the ID is incorrect." })
          } else {
            setErrors({ fetch: "Failed to load work record. Please try again." })
          }
          return
        }

        if (!data) {
          setErrors({ fetch: "Work record not found. It may have been deleted or the ID is incorrect." })
          return
        }

        console.log("Record loaded for editing:", data)

        // Populate form data
        setFormData({
          fullName: data.full_name || "",
          phoneNumber: data.phone_number || "",
          placeAddress: data.place_address || "",
          villageCity: data.village_city || "",
          constituencyOrigin: data.constituency_origin || "",
          constituencyWork: data.constituency_work || "",
          natureOfWork: data.nature_of_work || "",
          natureDetails: data.nature_of_work_details || "",
          actionTaken: data.action_taken || "",
          concernedPerson: data.concerned_person_contact || "",
          workAllocatedTo: data.work_allocated_to || "",
          status: data.status || "in_progress",
        })

        // Populate referred by data
        if (data.referred_by && data.referred_by.length > 0) {
          setReferredBy(
            data.referred_by.map((ref) => ({
              name: ref.referrer_name || "",
              contact: ref.referrer_contact || "",
            })),
          )
        }
      } catch (err) {
        console.error("Error:", err)
        setErrors({ fetch: "An unexpected error occurred while loading the record." })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecord()
  }, [recordId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (!formData.placeAddress.trim()) newErrors.placeAddress = "Place/Address is required"
    if (!formData.villageCity.trim()) newErrors.villageCity = "Village/City is required"
    if (!formData.constituencyOrigin) newErrors.constituencyOrigin = "Constituency of Origin is required"
    if (!formData.constituencyWork) newErrors.constituencyWork = "Constituency of Work is required"
    if (!formData.natureOfWork) newErrors.natureOfWork = "Nature of Work is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    setErrors({})
    setSuccess("")

    try {
      const updates: Partial<WorkRecord> = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        place_address: formData.placeAddress,
        village_city: formData.villageCity,
        constituency_origin: formData.constituencyOrigin,
        constituency_work: formData.constituencyWork,
        nature_of_work: formData.natureOfWork as "development" | "jan_kalyan" | "transfers_employment" | "other",
        nature_of_work_details: formData.natureDetails,
        action_taken: formData.actionTaken,
        concerned_person_contact: formData.concernedPerson,
        work_allocated_to: formData.workAllocatedTo,
        status: formData.status as "done" | "in_progress" | "incomplete",
      }

      console.log("Updating record with data:", updates)
      const { data, error } = await databaseService.updateWorkRecord(recordId, updates)

      if (error) {
        console.error("Error updating work record:", error)
        setErrors({ submit: error.message || "Failed to update work record. Please try again." })
        return
      }

      if (data) {
        setSuccess("Work record has been updated successfully!")

        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/work-records/${recordId}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving record:", error)
      setErrors({ submit: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const addReferredBy = () => {
    setReferredBy([...referredBy, { name: "", contact: "" }])
  }

  const removeReferredBy = (index: number) => {
    if (referredBy.length > 1) {
      setReferredBy(referredBy.filter((_, i) => i !== index))
    }
  }

  const updateReferredBy = (index: number, field: keyof ReferredByForm, value: string) => {
    const updated = [...referredBy]
    updated[index][field] = value
    setReferredBy(updated)
  }

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

  if (errors.fetch) {
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
          <AlertDescription>{errors.fetch}</AlertDescription>
        </Alert>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Edit Record</h3>
                <p className="text-sm">The work record you're trying to edit doesn't exist or has been removed.</p>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/work-records")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Work Record</h1>
          <p className="text-gray-600">Update work record information</p>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Work Record Details</CardTitle>
            <CardDescription>Update the work record information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className={errors.fullName ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                    className={errors.phoneNumber ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placeAddress">
                    Place/Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="placeAddress"
                    value={formData.placeAddress}
                    onChange={(e) => setFormData({ ...formData, placeAddress: e.target.value })}
                    placeholder="Enter place/address"
                    className={errors.placeAddress ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.placeAddress && <p className="text-sm text-red-500">{errors.placeAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villageCity">
                    Village/City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="villageCity"
                    value={formData.villageCity}
                    onChange={(e) => setFormData({ ...formData, villageCity: e.target.value })}
                    placeholder="Enter village/city"
                    className={errors.villageCity ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.villageCity && <p className="text-sm text-red-500">{errors.villageCity}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Constituency Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Constituency Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="constituencyOrigin">
                    Constituency of Origin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="constituencyOrigin"
                    value={formData.constituencyOrigin}
                    onChange={(e) => setFormData({ ...formData, constituencyOrigin: e.target.value })}
                    placeholder="Enter constituency of origin"
                    className={errors.constituencyOrigin ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.constituencyOrigin && <p className="text-sm text-red-500">{errors.constituencyOrigin}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constituencyWork">
                    Constituency of Work <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="constituencyWork"
                    value={formData.constituencyWork}
                    onChange={(e) => setFormData({ ...formData, constituencyWork: e.target.value })}
                    placeholder="Enter constituency of work"
                    className={errors.constituencyWork ? "border-red-500" : ""}
                    disabled={isSaving}
                  />
                  {errors.constituencyWork && <p className="text-sm text-red-500">{errors.constituencyWork}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Nature of Work */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Work Details</h3>

              <div className="space-y-3">
                <Label>
                  Nature of Work <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.natureOfWork}
                  onValueChange={(value) => setFormData({ ...formData, natureOfWork: value })}
                  className="grid grid-cols-2 gap-4"
                  disabled={isSaving}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="development" id="development" />
                    <Label htmlFor="development">Development</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jan_kalyan" id="jankalyan" />
                    <Label htmlFor="jankalyan">Jan Kalyan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfers_employment" id="transfers" />
                    <Label htmlFor="transfers">Transfers/Employment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
                {errors.natureOfWork && <p className="text-sm text-red-500">{errors.natureOfWork}</p>}
              </div>

              {formData.natureOfWork === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="natureDetails">Nature Details</Label>
                  <Textarea
                    id="natureDetails"
                    value={formData.natureDetails}
                    onChange={(e) => setFormData({ ...formData, natureDetails: e.target.value })}
                    placeholder="Please specify the nature of work"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Textarea
                  id="actionTaken"
                  value={formData.actionTaken}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                  placeholder="Describe the action taken"
                  rows={4}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="concernedPerson">Concerned Person/Contact</Label>
                <Input
                  id="concernedPerson"
                  value={formData.concernedPerson}
                  onChange={(e) => setFormData({ ...formData, concernedPerson: e.target.value })}
                  placeholder="Enter concerned person details"
                  disabled={isSaving}
                />
              </div>
            </div>

            <Separator />

            {/* Assignment and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Assignment & Status</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workAllocatedTo">Work Allocated To</Label>
                  <Input
                    id="workAllocatedTo"
                    value={formData.workAllocatedTo}
                    onChange={(e) => setFormData({ ...formData, workAllocatedTo: e.target.value })}
                    placeholder="Enter staff member or department"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 flex-1">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Record
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/work-records")}
                disabled={isSaving}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
