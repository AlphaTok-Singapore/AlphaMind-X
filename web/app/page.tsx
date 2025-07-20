'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  console.log('Home component rendered')

  // 添加一个简单的测试
  if (typeof window !== 'undefined')
    console.log('Window is available, localStorage:', localStorage.getItem('console_token'))

  useEffect(() => {
    console.log('useEffect triggered')

    // 直接检查 setup 状态
    const checkSetup = async () => {
      try {
        console.log('Fetching setup status...')
        const response = await fetch('/console/api/setup')
        const setupStatus = await response.json()
        console.log('Setup status response:', setupStatus)

        if (setupStatus.step === 'not_started') {
          console.log('Setup not started, redirecting to /init')
          window.location.href = '/init'
          return
        }
        else if (setupStatus.step !== 'finished') {
          console.log('Setup in progress, redirecting to /install')
          window.location.href = '/install'
          return
        }

        console.log('Setup is finished, checking login status...')

        // 检查用户是否已登录
        const consoleToken = localStorage.getItem('console_token')
        const refreshToken = localStorage.getItem('refresh_token')

        if (!consoleToken || !refreshToken) {
          console.log('No tokens found, redirecting to /signin')
          const redirectUrl = '/signin?redirect=/'
          console.log('Redirecting to:', redirectUrl)
          window.location.href = redirectUrl
          return
        }

        console.log('Tokens found, verifying...')

        // 验证令牌是否有效
        try {
          const profileResponse = await fetch('/console/api/account/profile', {
            headers: {
              'Authorization': `Bearer ${consoleToken}`,
            },
          })

          if (!profileResponse.ok) {
            console.log('Token invalid, clearing storage and redirecting')
            localStorage.removeItem('console_token')
            localStorage.removeItem('refresh_token')
            router.replace('/signin?redirect=/')
          }
          else {
            console.log('Token valid, staying on homepage')
            // 用户已登录，显示主页内容，不重定向
          }
        }
        catch (error) {
          console.error('Failed to verify token:', error)
          localStorage.removeItem('console_token')
          localStorage.removeItem('refresh_token')
          router.replace('/signin?redirect=/')
        }
      }
      catch (error) {
        console.error('Failed to check setup status:', error)
        router.replace('/install')
      }
    }

    checkSetup()
  }, [router])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Welcome to AlphaMind
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Dify Console</h2>
            <p className="mb-4 text-gray-600">
              Build and manage your AI applications
            </p>
            <a
              href="/console"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Open Console
            </a>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">AlphaMind</h2>
            <p className="mb-4 text-gray-600">
              Advanced AI agent management and automation
            </p>
            <a
              href="/alphamind"
              className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Open AlphaMind
            </a>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">n8n Workflows</h2>
            <p className="mb-4 text-gray-600">
              Automate workflows and integrations
            </p>
            <a
              href={process.env.NEXT_PUBLIC_N8N_URL ?? 'http://localhost:5678'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Open n8n
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
