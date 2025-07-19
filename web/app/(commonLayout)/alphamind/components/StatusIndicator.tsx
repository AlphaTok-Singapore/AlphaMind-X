'use client'

import React from 'react'

export default function StatusIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
      <span className="text-xs text-gray-500">System Online</span>
    </div>
  )
}
