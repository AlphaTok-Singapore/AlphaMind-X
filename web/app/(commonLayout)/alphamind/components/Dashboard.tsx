'use client'

import React from 'react'
import QuickActions from './QuickActions'
import RecentActivity from './RecentActivity'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome to AlphaMind - Your AI Management Platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">3</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Conversations</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">127</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Messages Today</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0.8s</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  )
}
