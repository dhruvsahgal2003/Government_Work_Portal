"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Analytics and reporting dashboard</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Reports Coming Soon</CardTitle>
          <CardDescription>This section will contain detailed analytics and reports for work tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Features will include:</p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>• Work completion statistics</li>
            <li>• Constituency-wise analysis</li>
            <li>• Performance metrics</li>
            <li>• Export capabilities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
