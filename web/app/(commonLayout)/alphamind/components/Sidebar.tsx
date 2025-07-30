'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
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

type SidebarProps = {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // 当收缩状态且悬停时，通知父组件展开侧边栏
  useEffect(() => {
    if (isCollapsed && isHovered) {
      // 通知父组件展开侧边栏
      onToggleCollapse()
    }
  }, [isCollapsed, isHovered, onToggleCollapse])

  return (
    <div
      className={`relative h-full border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-full'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredItem(null)
      }}
    >
      {/* 收缩按钮 */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
        title={isCollapsed ? '展开侧边栏' : '收缩侧边栏'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-600" />
        )}
      </button>

      {/* 品牌区域 */}
      <div className="p-6">
        <div className={`flex items-center ${!isCollapsed ? 'space-x-2' : 'justify-center'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">AM</span>
          </div>
          {!isCollapsed && (
            <span className="truncate font-semibold text-gray-900">AlphaMind</span>
          )}
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.href}
                  className={`
                    mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${isActive
                      ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onMouseEnter={() => isCollapsed && setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && item.name}
                </Link>

                {/* 悬停提示 - 只在收缩状态且未展开时显示 */}
                {isCollapsed && hoveredItem === item.name && (
                  <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2">
                    <div className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                      {item.name}
                    </div>
                    {/* 小三角形 */}
                    <div className="absolute left-0 top-1/2 h-0 w-0 -translate-x-1 -translate-y-1/2 border-b-2 border-l-0 border-r-4 border-t-2 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
