"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Save, Send, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { databaseService } from "@/lib/database"
import type { ReferredByForm } from "@/lib/supabase"

export default function NewWorkRecordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

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

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccess("")

    try {
      const recordData = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        place_address: formData.placeAddress,
        village_city: formData.villageCity,
        constituency_origin: formData.constituencyOrigin,
        constituency_work: formData.constituencyWork,
        referred_by: referredBy.filter((ref) => ref.name && ref.name.trim()),
        nature_of_work: formData.natureOfWork as "development" | "jan_kalyan" | "transfers_employment" | "other",
        nature_of_work_details: formData.natureDetails,
        action_taken: formData.actionTaken,
        concerned_person_contact: formData.concernedPerson,
        work_allocated_to: formData.workAllocatedTo,
        status: (formData.status || "in_progress") as "done" | "in_progress" | "incomplete",
      }

      const { data, error } = await databaseService.createWorkRecord(recordData)

      if (error) {
        console.error("Error creating work record:", error)
        setErrors({ submit: error.message || "Failed to create work record. Please try again." })
        return
      }

      if (data) {
        setSuccess(`Work record has been ${isDraft ? "saved as draft" : "created"} successfully!`)

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/work-records?success=true")
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving record:", error)
      setErrors({ submit: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Work Record</h1>
        <p className="text-gray-600">Create a new work record entry</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {errors.submit && (
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Work Record Details</CardTitle>
          <CardDescription>Fill in all required information for the work record</CardDescription>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                {errors.constituencyWork && <p className="text-sm text-red-500">{errors.constituencyWork}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Referred By Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Referred By</h3>
              <Button type="button" variant="outline" size="sm" onClick={addReferredBy} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Reference
              </Button>
            </div>

            {referredBy.map((ref, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Reference Name</Label>
                  <Input
                    value={ref.name}
                    onChange={(e) => updateReferredBy(index, "name", e.target.value)}
                    placeholder="Enter reference name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Information</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ref.contact}
                      onChange={(e) => updateReferredBy(index, "contact", e.target.value)}
                      placeholder="Enter contact details"
                      disabled={isLoading}
                    />
                    {referredBy.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReferredBy(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concernedPerson">Concerned Person/Contact</Label>
              <Input
                id="concernedPerson"
                value={formData.concernedPerson}
                onChange={(e) => setFormData({ ...formData, concernedPerson: e.target.value })}
                placeholder="Enter concerned person details"
                disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
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
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Record
                </>
              )}
            </Button>

            <Button onClick={() => handleSubmit(true)} disabled={isLoading} variant="outline" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
