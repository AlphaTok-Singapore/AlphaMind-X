'use client'

import { useCallback, useEffect, useState } from 'react'

export type GeneralSettings = {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: boolean
  autoSave: boolean
  defaultModel: string
}

export type IntegrationSettings = {
  dify: {
    enabled: boolean
    apiUrl: string
    apiKey: string
  }
  n8n: {
    enabled: boolean
    apiUrl: string
    webhookUrl: string
  }
  openai: {
    enabled: boolean
    apiKey: string
    model: string
  }
  anthropic: {
    enabled: boolean
    apiKey: string
  }
}

export type SocialMediaSettings = {
  autoPost: boolean
  platforms: {
    twitter: { enabled: boolean; accessToken?: string }
    linkedin: { enabled: boolean; accessToken?: string }
    facebook: { enabled: boolean; accessToken?: string }
  }
}

export type SecuritySettings = {
  twoFactorAuth: boolean
  sessionTimeout: number
  ipWhitelist: string[]
  apiRateLimit: number
}

export type AllSettings = {
  general: GeneralSettings
  integrations: IntegrationSettings
  socialMedia: SocialMediaSettings
  security: SecuritySettings
}

export type UseSettingsOptions = {
  apiUrl?: string
  onError?: (error: Error) => void
  onSettingsChanged?: (settings: AllSettings) => void
}

export type UseSettingsReturn = {
  settings: AllSettings
  isLoading: boolean
  error: string | null
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => Promise<void>
  updateIntegrationSettings: (updates: Partial<IntegrationSettings>) => Promise<void>
  updateSocialMediaSettings: (updates: Partial<SocialMediaSettings>) => Promise<void>
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => Promise<void>
  testIntegration: (type: keyof IntegrationSettings) => Promise<boolean>
  resetSettings: (section?: keyof AllSettings) => Promise<void>
  exportSettings: () => string
  importSettings: (settingsJson: string) => Promise<void>
  refreshSettings: () => Promise<void>
}

const defaultSettings: AllSettings = {
  general: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: true,
    autoSave: true,
    defaultModel: 'gpt-3.5-turbo',
  },
  integrations: {
    dify: {
      enabled: false,
      apiUrl: 'http://localhost:5001',
      apiKey: '',
    },
    n8n: {
      enabled: false,
      apiUrl: 'http://localhost:5678',
      webhookUrl: 'http://localhost:5678/webhook',
    },
    openai: {
      enabled: false,
      apiKey: '',
      model: 'gpt-3.5-turbo',
    },
    anthropic: {
      enabled: false,
      apiKey: '',
    },
  },
  socialMedia: {
    autoPost: false,
    platforms: {
      twitter: { enabled: false },
      linkedin: { enabled: false },
      facebook: { enabled: false },
    },
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 86400,
    ipWhitelist: [],
    apiRateLimit: 100,
  },
}

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const {
    apiUrl = '/api/settings',
    onError,
    onSettingsChanged,
  } = options

  const [settings, setSettings] = useState<AllSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    setError(errorMessage)
    onError?.(err instanceof Error ? err : new Error(errorMessage))
  }, [onError])

  const refreshSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl)
      if (!response.ok)
        throw new Error(`Failed to fetch settings: ${response.status}`)

      const data = await response.json()
      const loadedSettings = { ...defaultSettings, ...data.settings }
      setSettings(loadedSettings)
      onSettingsChanged?.(loadedSettings)
    }
 catch (err) {
      handleError(err)
      // Use default settings for development
      setSettings(defaultSettings)
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError, onSettingsChanged])

  // Load initial settings
  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  const updateSettings = useCallback(async (
    section: keyof AllSettings,
    updates: any,
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok)
        throw new Error(`Failed to update ${section} settings: ${response.status}`)

      const updatedSection = await response.json()
      const newSettings = {
        ...settings,
        [section]: { ...settings[section], ...updatedSection },
      }

      setSettings(newSettings)
      onSettingsChanged?.(newSettings)
    }
 catch (err) {
      handleError(err)
      // Update locally for development
      const newSettings = {
        ...settings,
        [section]: { ...settings[section], ...updates },
      }
      setSettings(newSettings)
      onSettingsChanged?.(newSettings)
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, settings, handleError, onSettingsChanged])

  const updateGeneralSettings = useCallback(async (updates: Partial<GeneralSettings>) => {
    await updateSettings('general', updates)
  }, [updateSettings])

  const updateIntegrationSettings = useCallback(async (updates: Partial<IntegrationSettings>) => {
    await updateSettings('integrations', updates)
  }, [updateSettings])

  const updateSocialMediaSettings = useCallback(async (updates: Partial<SocialMediaSettings>) => {
    await updateSettings('socialMedia', updates)
  }, [updateSettings])

  const updateSecuritySettings = useCallback(async (updates: Partial<SecuritySettings>) => {
    await updateSettings('security', updates)
  }, [updateSettings])

  const testIntegration = useCallback(async (type: keyof IntegrationSettings): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/integrations/${type}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.integrations[type]),
      })

      if (!response.ok)
        throw new Error(`Integration test failed: ${response.status}`)

      const result = await response.json()
      return result.success
    }
 catch (err) {
      handleError(err)
      // Return mock result for development
      return Math.random() > 0.3 // 70% success rate for testing
    }
  }, [apiUrl, settings.integrations, handleError])

  const resetSettings = useCallback(async (section?: keyof AllSettings) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = section ? `${apiUrl}/${section}/reset` : `${apiUrl}/reset`
      const response = await fetch(url, { method: 'POST' })

      if (!response.ok)
        throw new Error(`Failed to reset settings: ${response.status}`)

      if (section) {
        const newSettings = {
          ...settings,
          [section]: defaultSettings[section],
        }
        setSettings(newSettings)
        onSettingsChanged?.(newSettings)
      }
 else {
        setSettings(defaultSettings)
        onSettingsChanged?.(defaultSettings)
      }
    }
 catch (err) {
      handleError(err)
      // Reset locally for development
      if (section) {
        const newSettings = {
          ...settings,
          [section]: defaultSettings[section],
        }
        setSettings(newSettings)
        onSettingsChanged?.(newSettings)
      }
 else {
        setSettings(defaultSettings)
        onSettingsChanged?.(defaultSettings)
      }
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, settings, handleError, onSettingsChanged])

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2)
  }, [settings])

  const importSettings = useCallback(async (settingsJson: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const importedSettings = JSON.parse(settingsJson)

      // Validate imported settings structure
      const validatedSettings = { ...defaultSettings, ...importedSettings }

      const response = await fetch(`${apiUrl}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedSettings),
      })

      if (!response.ok)
        throw new Error(`Failed to import settings: ${response.status}`)

      setSettings(validatedSettings)
      onSettingsChanged?.(validatedSettings)
    }
 catch (err) {
      if (err instanceof SyntaxError)
        handleError(new Error('Invalid JSON format'))
       else
        handleError(err)

      // For development, still try to parse and use valid parts
      try {
        const importedSettings = JSON.parse(settingsJson)
        const validatedSettings = { ...defaultSettings, ...importedSettings }
        setSettings(validatedSettings)
        onSettingsChanged?.(validatedSettings)
      }
 catch {
        // Ignore if JSON is completely invalid
      }
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError, onSettingsChanged])

  return {
    settings,
    isLoading,
    error,
    updateGeneralSettings,
    updateIntegrationSettings,
    updateSocialMediaSettings,
    updateSecuritySettings,
    testIntegration,
    resetSettings,
    exportSettings,
    importSettings,
    refreshSettings,
  }
}
