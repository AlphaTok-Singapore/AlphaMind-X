import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import dayjs from 'dayjs'

const LOCAL_STORAGE_KEY = 'is_refreshing_token'
const REFRESH_ADVANCE_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const REFRESH_INTERVAL = 60 * 1000 // Check every minute

let isRefreshing = false

const isRefreshingSignAvailable = function (delta: number) {
  const nowTime = new Date().getTime()
  const lastTime = globalThis.localStorage.getItem('last_refresh_time') || '0'
  return nowTime - Number.parseInt(lastTime) <= delta
}

const releaseRefreshLock = () => {
  isRefreshing = false
  globalThis.localStorage.removeItem(LOCAL_STORAGE_KEY)
  globalThis.removeEventListener('beforeunload', releaseRefreshLock)
}

const waitUntilTokenRefreshed = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkRefreshing = () => {
      if (!isRefreshing)
        resolve()
      else
        setTimeout(checkRefreshing, 100)
    }
    checkRefreshing()
  })
}

async function getNewAccessToken(timeout: number): Promise<void> {
  try {
    const isRefreshingSign = globalThis.localStorage.getItem(LOCAL_STORAGE_KEY)
    if ((isRefreshingSign && isRefreshingSign === '1' && isRefreshingSignAvailable(timeout)) || isRefreshing) {
      await waitUntilTokenRefreshed()
    }
    else {
      isRefreshing = true
      globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, '1')
      globalThis.localStorage.setItem('last_refresh_time', new Date().getTime().toString())
      globalThis.addEventListener('beforeunload', releaseRefreshLock)
      const refresh_token = globalThis.localStorage.getItem('refresh_token')

      if (!refresh_token)
        throw new Error('No refresh token available')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PREFIX || ''}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;utf-8',
        },
        body: JSON.stringify({ refresh_token }),
      })

      if (response.status === 401)
        throw new Error('Refresh token expired')

      const { data } = await response.json()
      globalThis.localStorage.setItem('console_token', data.access_token)
      globalThis.localStorage.setItem('refresh_token', data.refresh_token)
    }
  }
  catch (error) {
    console.error('Token refresh failed:', error)
    // Clear tokens and redirect to login
    globalThis.localStorage.removeItem('console_token')
    globalThis.localStorage.removeItem('refresh_token')
    window.location.href = '/signin'
    throw error
  }
  finally {
    releaseRefreshLock()
  }
}

export const useRefreshToken = () => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const accessToken = globalThis.localStorage.getItem('console_token')
        if (!accessToken)
          return

        const decoded = jwtDecode(accessToken)
        if (!decoded || typeof decoded !== 'object' || !('exp' in decoded) || typeof decoded.exp !== 'number')
          return

        const expiryTime = dayjs(decoded.exp * 1000)
        const now = dayjs()
        const timeUntilExpiry = expiryTime.diff(now)

        // If token expires within REFRESH_ADVANCE_TIME, refresh it
        if (timeUntilExpiry <= REFRESH_ADVANCE_TIME && timeUntilExpiry > 0)
          await getNewAccessToken(30000) // 30 second timeout
      }
      catch (error) {
        console.error('Token refresh check failed:', error)
      }
    }

    // Check immediately
    checkAndRefreshToken()

    // Set up periodic check
    timeoutRef.current = setInterval(checkAndRefreshToken, REFRESH_INTERVAL)

    return () => {
      if (timeoutRef.current)
        clearInterval(timeoutRef.current)
    }
  }, [])
}
