'use client'

import { useEffect, useState } from 'react'
import {
  RiCheckLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import ActionButton from '@/app/components/base/action-button'

export type Theme = 'light' | 'dark' | 'system'

export default function ThemeSelector() {
  const { t } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Initialize theme if undefined
    if (!theme && !resolvedTheme)
      setTheme('dark')
    console.log('ThemeSelector mounted, current theme:', theme, 'resolvedTheme:', resolvedTheme)
  }, [theme, resolvedTheme])

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && !(event.target as Element).closest('.theme-selector'))
        setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleThemeChange = (newTheme: Theme) => {
    try {
      console.log('Changing theme to:', newTheme)
      setTheme(newTheme)
      setOpen(false)
      // Force update the data-theme attribute
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    catch (error) {
      console.error('Theme change failed:', error)
    }
  }

  const getCurrentIcon = () => {
    if (!mounted) return <RiComputerLine className='h-4 w-4 text-text-tertiary' />

    const currentTheme = theme === 'system' ? resolvedTheme : theme
    switch (currentTheme) {
      case 'light': return <RiSunLine className='h-4 w-4 text-text-tertiary' />
      case 'dark': return <RiMoonLine className='h-4 w-4 text-text-tertiary' />
      default: return <RiComputerLine className='h-4 w-4 text-text-tertiary' />
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <ActionButton className='h-8 w-8 p-[6px]'>
        <RiComputerLine className='h-4 w-4 text-text-tertiary' />
      </ActionButton>
    )
  }

  return (
    <div className="relative theme-selector">
      <ActionButton
        className={`h-8 w-8 p-[6px] ${open && 'bg-state-base-hover'}`}
        onClick={() => setOpen(!open)}
      >
        {getCurrentIcon()}
      </ActionButton>

      {open && (
        <div className='absolute right-0 top-full z-50 mt-1 flex w-[144px] flex-col items-start rounded-xl border-[0.5px] border-components-panel-border bg-components-panel-bg-blur p-1 shadow-lg'>
          <button
            className='flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-text-secondary hover:bg-state-base-hover'
            onClick={() => handleThemeChange('light')}
          >
            <RiSunLine className='h-4 w-4 text-text-tertiary' />
            <div className='flex grow items-center justify-start px-1'>
              <span className='system-md-regular'>{t('common.theme.light')}</span>
            </div>
            {theme === 'light' && <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
              <RiCheckLine className='h-4 w-4 text-text-accent' />
            </div>}
          </button>
          <button
            className='flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-text-secondary hover:bg-state-base-hover'
            onClick={() => handleThemeChange('dark')}
          >
            <RiMoonLine className='h-4 w-4 text-text-tertiary' />
            <div className='flex grow items-center justify-start px-1'>
              <span className='system-md-regular'>{t('common.theme.dark')}</span>
            </div>
            {theme === 'dark' && <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
              <RiCheckLine className='h-4 w-4 text-text-accent' />
            </div>}
          </button>
          <button
            className='flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-text-secondary hover:bg-state-base-hover'
            onClick={() => handleThemeChange('system')}
          >
            <RiComputerLine className='h-4 w-4 text-text-tertiary' />
            <div className='flex grow items-center justify-start px-1'>
              <span className='system-md-regular'>{t('common.theme.auto')}</span>
            </div>
            {theme === 'system' && <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
              <RiCheckLine className='h-4 w-4 text-text-accent' />
            </div>}
          </button>
        </div>
      )}
    </div>
  )
}
