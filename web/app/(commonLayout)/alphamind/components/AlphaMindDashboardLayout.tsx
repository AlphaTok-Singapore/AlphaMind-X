'use client'

import React, { useState } from 'react'
import AlphaMindHeader from './AlphaMindHeader'
import Sidebar from './Sidebar'

type AlphaMindDashboardLayoutProps = {
  children: React.ReactNode
}

export default function AlphaMindDashboardLayout({ children }: AlphaMindDashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // 处理侧边栏切换
  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* 侧边栏 - 展开时10%，收缩时64px */}
      <div className={`transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-1/10 min-w-[200px]'
      } shrink-0`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* 主内容区 - 占满剩余空间，不留空隙 */}
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-[calc(100%-4rem)]' : 'flex-1'
      }`}>
        <header className="flex h-[60px] items-center border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex min-w-0 flex-[1] items-center pl-3 pr-2 min-[1280px]:pr-3">
            <AlphaMindHeader />
          </div>
          <div className="flex min-w-0 flex-[1] items-center justify-end pl-2 pr-3 min-[1280px]:pl-3">
            {/* AlphaMind header content can be added here if needed */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
