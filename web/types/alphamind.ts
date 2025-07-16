// AlphaMind TypeScript 类型定义

export type Agent = {
  id: number
  name: string
  description: string
  type: 'assistant' | 'analyst' | 'creator' | 'workflow'
  status: 'active' | 'inactive' | 'training'
  model: string
  conversations: number
  successRate: number
  lastUsed: string
  createdAt: string
  config?: AgentConfig
}

export type AgentConfig = {
  temperature: number
  maxTokens: number
  systemPrompt?: string
  tools?: string[]
  workflows?: string[]
}

export type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agentId?: number
  conversationId?: string
}

export type Conversation = {
  id: string
  title: string
  agentId: number
  userId: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export type Dataset = {
  id: number
  name: string
  description: string
  type: 'text' | 'image' | 'audio' | 'video' | 'mixed'
  status: 'uploading' | 'processing' | 'completed' | 'error'
  fileCount: number
  size: string
  createdAt: string
  lastModified: string
}

export type UserSettings = {
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

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T = any> = {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export type SystemStatus = {
  status: 'healthy' | 'degraded' | 'down'
  services: Record<string, boolean>
  uptime: string
  version: string
}

export type WorkflowExecution = {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  startedAt: string
  finishedAt?: string
  inputData: Record<string, any>
  outputData?: Record<string, any>
  errorMessage?: string
}

export type MCPTool = {
  id: number
  name: string
  description: string
  category: string
  version: string
  status: 'installed' | 'available' | 'updating' | 'error'
  config: Record<string, any>
}
