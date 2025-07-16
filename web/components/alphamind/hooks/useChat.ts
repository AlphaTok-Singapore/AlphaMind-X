'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type ChatMessage = {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  metadata?: Record<string, any>
}

export type ChatConversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  agentId?: string
}

export type UseChatOptions = {
  conversationId?: string
  agentId?: string
  apiUrl?: string
  onError?: (error: Error) => void
  onMessageSent?: (message: ChatMessage) => void
  onMessageReceived?: (message: ChatMessage) => void
}

export type UseChatReturn = {
  messages: ChatMessage[]
  conversations: ChatConversation[]
  currentConversation: ChatConversation | null
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  createConversation: (title?: string) => Promise<string>
  switchConversation: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  clearMessages: () => void
  retryLastMessage: () => Promise<void>
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    conversationId: initialConversationId,
    agentId,
    apiUrl = '/api/chat',
    onError,
    onMessageSent,
    onMessageReceived,
  } = options

  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    initialConversationId || null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null
  const messages = currentConversation?.messages || []

  // 将 createConversation 的定义提前到首次使用之前
  const createConversation = useCallback(async (title?: string): Promise<string> => {
    const newConversation: ChatConversation = {
      id: Date.now().toString(),
      title: title || `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId,
    }

    setConversations(prev => [...prev, newConversation])
    setCurrentConversationId(newConversation.id)

    return newConversation.id
  }, [conversations.length, agentId])

  // Initialize with a default conversation if none exists
  useEffect(() => {
    if (conversations.length === 0)
      createConversation('New Conversation')
  }, [])

  const switchConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId)
    setError(null)
  }, [])

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))

    if (currentConversationId === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId)
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null)
    }
  }, [conversations, currentConversationId])

  const addMessage = useCallback((message: ChatMessage) => {
    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date(),
          }
        : conv,
    ))
  }, [currentConversationId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !currentConversationId) return

    // Cancel any ongoing request
    if (abortControllerRef.current)
      abortControllerRef.current.abort()

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    addMessage(userMessage)
    onMessageSent?.(userMessage)

    setIsLoading(true)
    setError(null)

    try {
      abortControllerRef.current = new AbortController()

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversationId,
          agentId,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'I apologize, but I couldn\'t generate a response.',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: data.metadata,
      }

      addMessage(assistantMessage)
      onMessageReceived?.(assistantMessage)
    }
 catch (err) {
      if (err instanceof Error && err.name === 'AbortError')
        return // Request was cancelled

      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: { error: true },
      }
      addMessage(errorChatMessage)
    }
 finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [
    isLoading,
    currentConversationId,
    apiUrl,
    agentId,
    messages,
    addMessage,
    onMessageSent,
    onMessageReceived,
    onError,
  ])

  const retryLastMessage = useCallback(async () => {
    if (!currentConversation || messages.length === 0) return

    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')
    if (lastUserMessage)
      await sendMessage(lastUserMessage.content)
  }, [currentConversation, messages, sendMessage])

  const clearMessages = useCallback(() => {
    if (!currentConversationId) return

    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? { ...conv, messages: [], updatedAt: new Date() }
        : conv,
    ))
  }, [currentConversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current)
        abortControllerRef.current.abort()
    }
  }, [])

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    error,
    sendMessage,
    createConversation,
    switchConversation,
    deleteConversation,
    clearMessages,
    retryLastMessage,
  }
}
