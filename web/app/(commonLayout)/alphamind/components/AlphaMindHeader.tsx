'use client'

import React from 'react'
import StatusIndicator from './StatusIndicator'

export default function AlphaMindHeader() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">AlphaMind</h1>
        <StatusIndicator />
      </div>
    </header>
  )
}
