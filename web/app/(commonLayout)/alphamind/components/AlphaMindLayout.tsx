'use client'

import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type AlphaMindLayoutProps = {
  children: React.ReactNode
}

export default function AlphaMindLayout({ children }: AlphaMindLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
