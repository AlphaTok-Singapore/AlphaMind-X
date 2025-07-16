'use client'

import React from 'react'
import AlphaMindHeader from './AlphaMindHeader'
import Sidebar from './Sidebar'

type AlphaMindDashboardLayoutProps = {
  children: React.ReactNode
}

export default function AlphaMindDashboardLayout({ children }: AlphaMindDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AlphaMindHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
