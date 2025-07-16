'use client'

import { useCallback, useEffect, useState } from 'react'

export type Agent = {
  id: string
  name: string
  description: string
  personality: string
  skills: string[]
  model: string
  temperature: number
  maxTokens: number
  status: 'active' | 'inactive' | 'training'
  createdAt: Date
  updatedAt: Date
  metrics?: {
    totalConversations: number
    averageResponseTime: number
    satisfactionScore: number
  }
}

export type AgentTemplate = {
  id: string
  name: string
  description: string
  category: string
  config: Partial<Agent>
}

export type UseAgentOptions = {
  apiUrl?: string
  onError?: (error: Error) => void
}

export type UseAgentReturn = {
  agents: Agent[]
  templates: AgentTemplate[]
  isLoading: boolean
  error: string | null
  createAgent: (config: Partial<Agent>) => Promise<Agent>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
  activateAgent: (id: string) => Promise<void>
  deactivateAgent: (id: string) => Promise<void>
  testAgent: (id: string, message: string) => Promise<string>
  getAgentMetrics: (id: string) => Promise<Agent['metrics']>
  loadTemplates: () => Promise<void>
  createFromTemplate: (templateId: string, customizations?: Partial<Agent>) => Promise<Agent>
  refreshAgents: () => Promise<void>
}

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const { apiUrl = '/api/agents', onError } = options

  const [agents, setAgents] = useState<Agent[]>([])
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    setError(errorMessage)
    onError?.(err instanceof Error ? err : new Error(errorMessage))
  }, [onError])

  const refreshAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl)
      if (!response.ok)
        throw new Error(`Failed to fetch agents: ${response.status}`)
      const data = await response.json()
      setAgents(data.agents || [])
    }
    catch (err) {
      handleError(err)
      setAgents([
        {
          id: '1',
          name: 'Customer Support Agent',
          description: 'Handles customer inquiries and support requests',
          personality: 'Friendly, helpful, and professional',
          skills: ['customer service', 'problem solving', 'product knowledge'],
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 2000,
          status: 'active',
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
          metrics: {
            totalConversations: 150,
            averageResponseTime: 1.2,
            satisfactionScore: 4.5,
          },
        },
        {
          id: '2',
          name: 'Sales Assistant',
          description: 'Helps with sales inquiries and product recommendations',
          personality: 'Enthusiastic, knowledgeable, and persuasive',
          skills: ['sales', 'product knowledge', 'lead qualification'],
          model: 'gpt-4',
          temperature: 0.8,
          maxTokens: 1500,
          status: 'active',
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(),
          metrics: {
            totalConversations: 89,
            averageResponseTime: 1.5,
            satisfactionScore: 4.2,
          },
        },
      ])
    }
    finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/templates`)
      if (!response.ok)
        throw new Error(`Failed to fetch templates: ${response.status}`)
      const data = await response.json()
      setTemplates(data.templates || [])
    }
    catch (err) {
      setTemplates([
        {
          id: 'customer-support',
          name: 'Customer Support',
          description: 'A helpful customer support agent',
          category: 'Support',
          config: {
            personality: 'Friendly, helpful, and professional',
            skills: ['customer service', 'problem solving'],
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
          },
        },
        {
          id: 'sales-assistant',
          name: 'Sales Assistant',
          description: 'A persuasive sales assistant',
          category: 'Sales',
          config: {
            personality: 'Enthusiastic and knowledgeable',
            skills: ['sales', 'product knowledge'],
            model: 'gpt-4',
            temperature: 0.8,
          },
        },
      ])
    }
  }, [apiUrl])

  // Load initial data
  useEffect(() => {
    refreshAgents()
    loadTemplates()
  }, [])

  const createAgent = useCallback(async (config: Partial<Agent>): Promise<Agent> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok)
        throw new Error(`Failed to create agent: ${response.status}`)

      const newAgent = await response.json()
      setAgents(prev => [...prev, newAgent])
      return newAgent
    }
    catch (err) {
      handleError(err)
      // Return mock agent for development
      const mockAgent: Agent = {
        id: Date.now().toString(),
        name: config.name || 'New Agent',
        description: config.description || '',
        personality: config.personality || '',
        skills: config.skills || [],
        model: config.model || 'gpt-3.5-turbo',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setAgents(prev => [...prev, mockAgent])
      return mockAgent
    }
    finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const updateAgent = useCallback(async (id: string, updates: Partial<Agent>): Promise<Agent> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok)
        throw new Error(`Failed to update agent: ${response.status}`)

      const updatedAgent = await response.json()
      setAgents(prev => prev.map(agent =>
        agent.id === id ? { ...agent, ...updatedAgent, updatedAt: new Date() } : agent,
      ))
      return updatedAgent
    }
    catch (err) {
      handleError(err)
      // Update locally for development
      const updatedAgent = agents.find(a => a.id === id)
      if (updatedAgent) {
        const newAgent = { ...updatedAgent, ...updates, updatedAt: new Date() }
        setAgents(prev => prev.map(agent => agent.id === id ? newAgent : agent))
        return newAgent
      }
      throw new Error('Agent not found')
    }
    finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError, agents])

  const deleteAgent = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok)
        throw new Error(`Failed to delete agent: ${response.status}`)

      setAgents(prev => prev.filter(agent => agent.id !== id))
    }
    catch (err) {
      handleError(err)
      // Delete locally for development
      setAgents(prev => prev.filter(agent => agent.id !== id))
    }
    finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const activateAgent = useCallback(async (id: string): Promise<void> => {
    await updateAgent(id, { status: 'active' })
  }, [updateAgent])

  const deactivateAgent = useCallback(async (id: string): Promise<void> => {
    await updateAgent(id, { status: 'inactive' })
  }, [updateAgent])

  const testAgent = useCallback(async (id: string, message: string): Promise<string> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok)
        throw new Error(`Failed to test agent: ${response.status}`)

      const data = await response.json()
      return data.response
    }
    catch (err) {
      handleError(err)
      // Return mock response for development
      return `Test response from agent ${id}: I received your message "${message}"`
    }
  }, [apiUrl, handleError])

  const getAgentMetrics = useCallback(async (id: string): Promise<Agent['metrics']> => {
    try {
      const response = await fetch(`${apiUrl}/${id}/metrics`)
      if (!response.ok)
        throw new Error(`Failed to fetch metrics: ${response.status}`)

      const data = await response.json()
      return data.metrics
    }
    catch (err) {
      handleError(err)
      // Return mock metrics for development
      return {
        totalConversations: Math.floor(Math.random() * 200),
        averageResponseTime: Math.random() * 3,
        satisfactionScore: 3 + Math.random() * 2,
      }
    }
  }, [apiUrl, handleError])

  const createFromTemplate = useCallback(async (
    templateId: string,
    customizations: Partial<Agent> = {},
  ): Promise<Agent> => {
    const template = templates.find(t => t.id === templateId)
    if (!template)
      throw new Error('Template not found')

    const agentConfig = {
      ...template.config,
      ...customizations,
      name: customizations.name || template.name,
    }

    return createAgent(agentConfig)
  }, [templates, createAgent])

  return {
    agents,
    templates,
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    activateAgent,
    deactivateAgent,
    testAgent,
    getAgentMetrics,
    loadTemplates,
    createFromTemplate,
    refreshAgents,
  }
}
