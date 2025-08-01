'use client'

import { SWRConfig } from 'swr'
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchSetupStatus } from '@/service/common'
import {
  EDUCATION_VERIFYING_LOCALSTORAGE_ITEM,
  EDUCATION_VERIFY_URL_SEARCHPARAMS_ACTION,
} from '@/app/education-apply/constants'

type SwrInitorProps = {
  children: ReactNode
}
const SwrInitor = ({
  children,
}: SwrInitorProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [init, setInit] = useState(false)

  const isSetupFinished = useCallback(async () => {
    try {
      if (localStorage.getItem('setup_status') === 'finished')
        return true
      const setUpStatus = await fetchSetupStatus()
      if (setUpStatus.step !== 'finished') {
        localStorage.removeItem('setup_status')
        return false
      }
      localStorage.setItem('setup_status', 'finished')
      return true
    }
    catch (error) {
      console.error(error)
      return false
    }
  }, [])

  useEffect(() => {
    (async () => {
      const action = searchParams.get('action')
      const consoleToken = decodeURIComponent(searchParams.get('access_token') ?? '')
      const refreshToken = decodeURIComponent(searchParams.get('refresh_token') ?? '')
      const consoleTokenFromLocalStorage = localStorage.getItem('console_token')
      const refreshTokenFromLocalStorage = localStorage.getItem('refresh_token')

      if (action === EDUCATION_VERIFY_URL_SEARCHPARAMS_ACTION)
        localStorage.setItem(EDUCATION_VERIFYING_LOCALSTORAGE_ITEM, 'yes')

      try {
        const isFinished = await isSetupFinished()
        if (!isFinished) {
          router.replace('/install')
          return
        }
        // 如果当前在登录页面，不需要检查登录状态
        if (pathname === '/signin' || pathname.startsWith('/signin/')) {
          setInit(true)
          return
        }
        if (!((consoleToken && refreshToken) || (consoleTokenFromLocalStorage && refreshTokenFromLocalStorage))) {
          router.replace('/signin')
          return
        }

        // 验证 token 有效性
        const tokenToVerify = consoleToken || consoleTokenFromLocalStorage
        if (tokenToVerify) {
          try {
            const response = await fetch('/console/api/account/profile', {
              headers: { 'Authorization': `Bearer ${tokenToVerify}` },
            })
            if (!response.ok) {
              localStorage.removeItem('console_token')
              localStorage.removeItem('refresh_token')
              router.replace('/signin')
              return
            }
          }
          catch {
            localStorage.removeItem('console_token')
            localStorage.removeItem('refresh_token')
            router.replace('/signin')
            return
          }
        }
        if (searchParams.has('access_token') || searchParams.has('refresh_token')) {
          consoleToken && localStorage.setItem('console_token', consoleToken)
          refreshToken && localStorage.setItem('refresh_token', refreshToken)
          router.replace(pathname)
        }

        setInit(true)
      }
      catch {
        router.replace('/signin')
      }
    })()
  }, [isSetupFinished, router, pathname, searchParams])

  return init
    ? (
      <SWRConfig value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}>
        {children}
      </SWRConfig>
    )
    : null
}

export default SwrInitor
