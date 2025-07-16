'use client'

import React from 'react'

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'chat',
      message: 'New conversation started with Customer Support Agent',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'agent',
      message: 'Sales Agent completed training session',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'data',
      message: 'Knowledge base updated with 50 new documents',
      time: '1 hour ago',
    },
    {
      id: 4,
      type: 'workflow',
      message: 'Email automation workflow executed successfully',
      time: '2 hours ago',
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return '💬'
      case 'agent':
        return '🤖'
      case 'data':
        return '📊'
      case 'workflow':
        return '⚡'
      default:
        return '📝'
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
