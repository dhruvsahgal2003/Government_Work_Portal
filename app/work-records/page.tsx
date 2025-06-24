"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Download, Plus, MoreHorizontal, Edit, Eye, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { databaseService } from "@/lib/database"
import type { WorkRecord } from "@/lib/supabase"

// Update the status color function
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

// Update the nature of work display
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

// Update the status display
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

export default function WorkRecordsPage() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [records, setRecords] = useState<WorkRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<WorkRecord[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const recordsPerPage = 10

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    constituencyOrigin: "",
    constituencyWork: "",
    natureOfWork: "",
    status: "",
    referredBy: "",
  })

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await databaseService.getWorkRecords({
          search: filters.search,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          constituencyOrigin: filters.constituencyOrigin,
          constituencyWork: filters.constituencyWork,
          natureOfWork: filters.natureOfWork,
          status: filters.status,
        })

        if (error) {
          console.error("Error fetching records:", error)
        } else {
          setRecords(data || [])
          setFilteredRecords(data || [])
        }
      } catch (error) {
        console.error("Error fetching records:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [filters])

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Full Name",
      "Phone Number",
      "Place Address",
      "Village/City",
      "Constituency Origin",
      "Constituency Work",
      "Nature of Work",
      "Status",
      "Work Allocated To",
      "Created Date",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredRecords.map((record) =>
        [
          record.id,
          `"${record.full_name}"`,
          record.phone_number,
          `"${record.place_address}"`,
          record.village_city,
          record.constituency_origin,
          record.constituency_work,
          record.nature_of_work,
          record.status || "in_progress",
          record.work_allocated_to || "",
          record.created_at ? new Date(record.created_at).toLocaleDateString() : "",
        ].join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `work-records-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      constituencyOrigin: "",
      constituencyWork: "",
      natureOfWork: "",
      status: "",
      referredBy: "",
    })
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Records</h1>
            <p className="text-gray-600">Manage and track all work records</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Records</h1>
          <p className="text-gray-600">Manage and track all work records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={filteredRecords.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/work-records/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Work record has been successfully created!</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
              <CardDescription>Filter records by various criteria</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, or phone number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="max-w-sm"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Constituency Origin</Label>
              <Input
                placeholder="Search by constituency origin..."
                value={filters.constituencyOrigin}
                onChange={(e) => setFilters({ ...filters, constituencyOrigin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Constituency Work</Label>
              <Input
                placeholder="Search by constituency work..."
                value={filters.constituencyWork}
                onChange={(e) => setFilters({ ...filters, constituencyWork: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nature of Work</Label>
              <Select
                value={filters.natureOfWork}
                onValueChange={(value) => setFilters({ ...filters, natureOfWork: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="jan_kalyan">Jan Kalyan</SelectItem>
                  <SelectItem value="transfers_employment">Transfers/Employment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Records ({filteredRecords.length})</CardTitle>
              <CardDescription>
                {filteredRecords.length > 0 ? (
                  <>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}{" "}
                    records
                  </>
                ) : (
                  "No records found"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Village/City</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Work Location</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-blue-600">{record.id?.slice(0, 8)}</TableCell>
                      <TableCell>{record.full_name}</TableCell>
                      <TableCell className="text-gray-600">{record.phone_number}</TableCell>
                      <TableCell>{record.village_city}</TableCell>
                      <TableCell className="text-sm">{record.constituency_origin}</TableCell>
                      <TableCell className="text-sm">{record.constituency_work}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getNatureOfWorkDisplay(record.nature_of_work)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status || "in_progress")}>
                          {getStatusDisplay(record.status || "in_progress")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {record.date_of_entry ? new Date(record.date_of_entry).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/work-records/${record.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/work-records/${record.id}/edit`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                      No records found.{" "}
                      {filters.search ||
                      filters.dateFrom ||
                      filters.dateTo ||
                      filters.constituencyOrigin ||
                      filters.constituencyWork ||
                      filters.natureOfWork ||
                      filters.status
                        ? "Try adjusting your filters."
                        : "Create your first work record to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
