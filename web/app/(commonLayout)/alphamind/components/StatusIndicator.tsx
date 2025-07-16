'use client'

import React from 'react'

export default function StatusIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
      <span className="text-sm text-gray-600">System Online</span>
    </div>
  )
}
