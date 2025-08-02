'use client'

import React from 'react'
import AlphaMindDashboardLayout from './components/AlphaMindDashboardLayout'
import Dashboard from './components/Dashboard'

export default function AlphaMindPage() {
  return (
    <AlphaMindDashboardLayout>
      <Dashboard />
    </AlphaMindDashboardLayout>
  )
}
