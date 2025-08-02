'use client'

import React from 'react'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      name: 'Start New Chat',
      description: 'Begin a conversation with an AI agent',
      href: '/alphamind/chat',
      color: 'bg-blue-500',
    },
    {
      name: 'Create Agent',
      description: 'Set up a new AI assistant',
      href: '/alphamind/agents',
      color: 'bg-green-500',
    },
    {
      name: 'Upload Data',
      description: 'Add new training data or documents',
      href: '/alphamind/data',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map(action => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center rounded-lg p-3 transition-colors hover:bg-gray-50"
          >
            <div className={`rounded-lg p-2 ${action.color} mr-3`}>
              <div className="h-5 w-5 text-white">•</div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{action.name}</h4>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
