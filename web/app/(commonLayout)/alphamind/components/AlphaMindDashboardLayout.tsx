'use client'

import React from 'react'
import AlphaMindHeader from './AlphaMindHeader'
import Sidebar from './Sidebar'
import AccountDropdown from '@/app/components/header/account-dropdown'

type AlphaMindDashboardLayoutProps = {
  children: React.ReactNode
}

export default function AlphaMindDashboardLayout({ children }: AlphaMindDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[60px] items-center border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex min-w-0 flex-[1] items-center pl-3 pr-2 min-[1280px]:pr-3">
            <AlphaMindHeader />
          </div>
          <div className="flex min-w-0 flex-[1] items-center justify-end pl-2 pr-3 min-[1280px]:pl-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 rounded-lg bg-orange-100 px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium text-orange-700">DEVELOPMENT</span>
              </div>
            </div>
            <div className="ml-4">
              <AccountDropdown />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
