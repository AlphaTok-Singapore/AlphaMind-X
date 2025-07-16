'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlphaMindProvider } from '@/context/alphamind/AlphaMindContext'
import useSWR from 'swr'

// 使用 readonly 标记props为只读
type AlphaMindLayoutProps = {
  readonly children: React.ReactNode
}

export default function AlphaMindLayout({ children }: AlphaMindLayoutProps) {
  const router = useRouter()

  // 使用 SWR 直接获取用户配置文件
  const { data, error } = useSWR('http://localhost:5001/console/api/account/profile', async (url) => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('console_token') ?? ''}`,
      },
    })
    if (!response.ok) {
      const error: any = new Error('获取用户信息失败')
      error.status = response.status
      throw error
    }
    return response.json()
  })

  // 添加认证检查逻辑
  useEffect(() => {
    // 如果请求用户信息失败且状态码为401，表示未登录或认证过期
    if (error?.status === 401) {
      // 重定向到登录页面
      console.log('User not authenticated, redirecting to login page')
      router.push('/console/signin')
    }
  }, [error, router])

  // 如果正在加载用户信息，可以显示一个加载状态
  if (!data && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <AlphaMindProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {children}
        </div>
      </div>
    </AlphaMindProvider>
  )
}
