'use client'

import React, { useState } from 'react'
import {
  Bell,
  Key,
  Palette,
  Shield,
  User,
} from 'lucide-react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'

type UserSettings = {
  profile: {
    name: string
    email: string
    avatar?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'zh' | 'en'
    defaultModel: string
  }
  notifications: {
    email: boolean
    browser: boolean
    workflowCompletion: boolean
    agentErrors: boolean
    systemUpdates: boolean
  }
  apiKeys: {
    openai: string
    anthropic: string
    google: string
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'AlphaMind 用户',
      email: 'user@example.com',
    },
    preferences: {
      theme: 'system',
      language: 'zh',
      defaultModel: 'gpt-3.5-turbo',
    },
    notifications: {
      email: true,
      browser: true,
      workflowCompletion: true,
      agentErrors: true,
      systemUpdates: false,
    },
    apiKeys: {
      openai: '',
      anthropic: '',
      google: '',
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 24,
    },
  })

  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'preferences', label: '偏好设置', icon: Palette },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'apikeys', label: 'API 密钥', icon: Key },
    { id: 'security', label: '安全设置', icon: Shield },
  ]

  const models = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
 catch (error) {
      console.error('Failed to save settings:', error)
    }
 finally {
      setSaving(false)
    }
  }

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa] md:flex-row">
        {/* 你的左侧输入区、分割条、右侧输出区等内容，参考 workflows/page.tsx 的结构和样式 */}
        {/* 侧边栏导航 */}
        <div className="lg:w-64">
          <nav className="rounded-lg bg-white p-4 shadow">
            <ul className="space-y-2">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center rounded-lg border px-3 py-2 text-left transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1">
          <div className="rounded-lg bg-white shadow">
            {/* 保存成功提示 */}
            {saved && (
              <div className="border-b border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                  设置已成功保存！
                </p>
              </div>
            )}

            <div className="p-6">
              {/* 个人资料 */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">个人资料</h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        姓名
                      </label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={e => updateSettings('profile', 'name', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        placeholder="请输入姓名"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={e => updateSettings('profile', 'email', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        placeholder="请输入邮箱"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 偏好设置 */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">偏好设置</h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        主题
                      </label>
                      <select
                        value={settings.preferences.theme}
                        onChange={e => updateSettings('preferences', 'theme', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        aria-label="主题"
                      >
                        <option value="light">浅色</option>
                        <option value="dark">深色</option>
                        <option value="system">跟随系统</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        语言
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={e => updateSettings('preferences', 'language', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        aria-label="语言"
                      >
                        <option value="zh">中文</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        默认模型
                      </label>
                      <select
                        value={settings.preferences.defaultModel}
                        onChange={e => updateSettings('preferences', 'defaultModel', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        aria-label="默认模型"
                      >
                        {models.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 通知设置 */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">通知设置</h2>

                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {key === 'email' && '邮件通知'}
                            {key === 'browser' && '浏览器通知'}
                            {key === 'workflowCompletion' && '工作流完成通知'}
                            {key === 'agentErrors' && '智能体错误通知'}
                            {key === 'systemUpdates' && '系统更新通知'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'email' && '通过邮件接收重要通知'}
                            {key === 'browser' && '在浏览器中显示通知'}
                            {key === 'workflowCompletion' && '工作流执行完成时通知'}
                            {key === 'agentErrors' && '智能体出现错误时通知'}
                            {key === 'systemUpdates' && '系统更新和维护通知'}
                          </p>
                        </div>
                        <div className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e => updateSettings('notifications', key, e.target.checked)}
                            className="peer sr-only"
                            aria-label={key === 'email' ? '邮件通知' : key === 'browser' ? '浏览器通知' : key === 'workflowCompletion' ? '工作流完成通知' : key === 'agentErrors' ? '智能体错误通知' : key === 'systemUpdates' ? '系统更新通知' : key}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API 密钥 */}

              {/* 安全设置 */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">安全设置</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          双因素认证
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          为您的账户添加额外的安全保护
                        </p>
                      </div>
                      <div className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorEnabled}
                          onChange={e => updateSettings('security', 'twoFactorEnabled', e.target.checked)}
                          className="peer sr-only"
                          aria-label="双因素认证"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        会话超时时间（小时）
                      </label>
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={e => updateSettings('security', 'sessionTimeout', Number.parseInt(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
                        aria-label="会话超时时间"
                      >
                        <option value={1}>1 小时</option>
                        <option value={8}>8 小时</option>
                        <option value={24}>24 小时</option>
                        <option value={168}>7 天</option>
                        <option value={720}>30 天</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AlphaMindDashboardLayout>
  )
}
