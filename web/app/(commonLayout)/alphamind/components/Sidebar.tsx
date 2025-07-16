'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bot,
  Database,
  Home,
  MessageSquare,
  Settings,
  Workflow,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/alphamind', icon: Home },
  { name: 'Chat', href: '/alphamind/chat', icon: MessageSquare },
  { name: 'Agents', href: '/alphamind/agents', icon: Bot },
  { name: 'Data', href: '/alphamind/data', icon: Database },
  { name: 'Workflows', href: '/alphamind/workflows', icon: Workflow },
  { name: 'Analytics', href: '/alphamind/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/alphamind/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">AM</span>
          </div>
          <span className="font-semibold text-gray-900">AlphaMind</span>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium
                  ${isActive
                    ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
