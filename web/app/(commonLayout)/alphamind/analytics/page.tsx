'use client'

import React, { useEffect, useState } from 'react'
import { Activity, AreaChart, Database, Users } from 'lucide-react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'

type AnalyticsCategory = {
  id: number
  name: string
  description: string
  icon: React.ReactNode
}

export default function AnalyticsPage() {
  const [categories, setCategories] = useState<AnalyticsCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory | null>(null)

  // 模拟分析类别数据
  useEffect(() => {
    const mockCategories: AnalyticsCategory[] = [
      {
        id: 1,
        name: '用户分析',
        description: '用户活动和行为分析',
        icon: <Users className="h-5 w-5" />,
      },
      {
        id: 2,
        name: 'API使用情况',
        description: '接口调用和性能分析',
        icon: <Activity className="h-5 w-5" />,
      },
      {
        id: 3,
        name: '系统资源',
        description: '服务器和资源利用率',
        icon: <Database className="h-5 w-5" />,
      },
      {
        id: 4,
        name: '智能体性能',
        description: 'AI助手性能和响应时间',
        icon: <AreaChart className="h-5 w-5" />,
      },
    ]
    setCategories(mockCategories)
    setSelectedCategory(mockCategories[0])
  }, [])

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa] md:flex-row">
        {/* 侧边栏 - 分析类别已移除，只保留主布局结构 */}
      </div>
    </AlphaMindDashboardLayout>
  )
}
