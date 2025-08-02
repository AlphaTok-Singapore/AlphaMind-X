'use client'
import { useEffect, useState } from 'react'
import {
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from '@remixicon/react'
import { useTheme } from 'next-themes'
import cn from '@/utils/classnames'

export type Theme = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    try {
      setTheme(newTheme)
    }
    catch (error) {
      console.error('Theme change failed:', error)
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className='flex items-center rounded-[10px] bg-components-segmented-control-bg-normal p-0.5'>
        <div className='rounded-lg px-2 py-1 text-text-tertiary'>
          <div className='p-0.5'>
            <RiComputerLine className='h-4 w-4' />
          </div>
        </div>
      </div>
    )
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <div className='flex items-center rounded-[10px] bg-components-segmented-control-bg-normal p-0.5'>
      <div
        className={cn(
          'rounded-lg px-2 py-1 text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary cursor-pointer',
          theme === 'system' && 'bg-components-segmented-control-item-active-bg text-text-accent-light-mode-only shadow-sm hover:bg-components-segmented-control-item-active-bg hover:text-text-accent-light-mode-only',
        )}
        onClick={() => handleThemeChange('system')}
      >
        <div className='p-0.5'>
          <RiComputerLine className='h-4 w-4' />
        </div>
      </div>
      <div className={cn('h-[14px] w-px bg-transparent', currentTheme === 'dark' && 'bg-divider-regular')}></div>
      <div
        className={cn(
          'rounded-lg px-2 py-1 text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary cursor-pointer',
          currentTheme === 'light' && 'bg-components-segmented-control-item-active-bg text-text-accent-light-mode-only shadow-sm hover:bg-components-segmented-control-item-active-bg hover:text-text-accent-light-mode-only',
        )}
        onClick={() => handleThemeChange('light')}
      >
        <div className='p-0.5'>
          <RiSunLine className='h-4 w-4' />
        </div>
      </div>
      <div className={cn('h-[14px] w-px bg-transparent', theme === 'system' && 'bg-divider-regular')}></div>
      <div
        className={cn(
          'rounded-lg px-2 py-1 text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary cursor-pointer',
          currentTheme === 'dark' && 'bg-components-segmented-control-item-active-bg text-text-accent-light-mode-only shadow-sm hover:bg-components-segmented-control-item-active-bg hover:text-text-accent-light-mode-only',
        )}
        onClick={() => handleThemeChange('dark')}
      >
        <div className='p-0.5'>
          <RiMoonLine className='h-4 w-4' />
        </div>
      </div>
    </div>
  )
}
