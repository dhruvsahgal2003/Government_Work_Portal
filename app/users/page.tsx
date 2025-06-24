"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">User management and permissions</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>User Management Coming Soon</CardTitle>
          <CardDescription>This section will contain user management functionality.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Features will include:</p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>• Add/edit users</li>
            <li>• Role-based permissions</li>
            <li>• Activity tracking</li>
            <li>• Access control</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
