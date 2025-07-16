'use client'

import React from 'react'
import { Bell, Search, User } from 'lucide-react'
import StatusIndicator from './StatusIndicator'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">AlphaMind</h1>
          <StatusIndicator />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600" aria-label="Notifications" title="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600" aria-label="User Profile" title="User Profile">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
