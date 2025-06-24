"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Clock, CheckCircle, TrendingUp, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { databaseService } from "@/lib/database"
import type { WorkRecord } from "@/lib/supabase"

const getStatusColor = (status: string) => {
  switch (status) {
    case "Done":
      return "bg-green-100 text-green-800"
    case "In Progress":
      return "bg-blue-100 text-blue-800"
    case "Incomplete":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
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

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    thisMonth: 0,
  })
  const [recentEntries, setRecentEntries] = useState<WorkRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics
        const statsData = await databaseService.getWorkRecordStats()
        setStats(statsData)

        // Fetch recent entries (last 5 records)
        const { data: records, error } = await databaseService.getWorkRecords({
          isDraft: false,
        })

        if (error) {
          console.error("Error fetching recent entries:", error)
        } else {
          setRecentEntries(records?.slice(0, 5) || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsCards = [
    {
      title: "Total Records",
      value: stats.total.toString(),
      description: "All work records",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Work",
      value: stats.pending.toString(),
      description: "Awaiting action",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Work",
      value: stats.completed.toString(),
      description: "Successfully completed",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "This Month",
      value: stats.thisMonth.toString(),
      description: "New records added",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of MP work tracking system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of MP work tracking system</p>
        </div>
        <Link href="/work-records/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Entries</CardTitle>
              <CardDescription>Latest work records submitted</CardDescription>
            </div>
            <Link href="/work-records">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-blue-600">{entry.id?.slice(0, 8)}</TableCell>
                      <TableCell>{entry.full_name}</TableCell>
                      <TableCell>{entry.constituency_work}</TableCell>
                      <TableCell>{getNatureOfWorkDisplay(entry.nature_of_work)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(entry.status || "in_progress")}>
                          {getStatusDisplay(entry.status || "in_progress")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {entry.date_of_entry ? new Date(entry.date_of_entry).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No records found. Create your first work record to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
