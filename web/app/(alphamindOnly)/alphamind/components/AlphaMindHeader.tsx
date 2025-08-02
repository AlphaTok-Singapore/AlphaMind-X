'use client'

import React from 'react'
import StatusIndicator from './StatusIndicator'

export default function AlphaMindHeader() {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 items-center justify-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">AM</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">AlphaMind</h1>
          <StatusIndicator />
        </div>
      </div>
    </div>
  )
}
