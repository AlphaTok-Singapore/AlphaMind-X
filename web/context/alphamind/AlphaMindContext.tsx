'use client'

import type { ReactNode } from 'react'
import React, { createContext, useContext, useReducer } from 'react'

// Types
type AlphaMindState = {
  user: any
  agents: any[]
  conversations: any[]
  currentConversation: any
  isLoading: boolean
  error: string | null
}

type AlphaMindAction
  = | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_AGENTS'; payload: any[] }
  | { type: 'SET_CONVERSATIONS'; payload: any[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: any }
  | { type: 'ADD_MESSAGE'; payload: any }

// Initial state
const initialState: AlphaMindState = {
  user: null,
  agents: [],
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
}

// Reducer
function alphaMindReducer(state: AlphaMindState, action: AlphaMindAction): AlphaMindState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_AGENTS':
      return { ...state, agents: action.payload }
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload }
    case 'ADD_MESSAGE':
      if (state.currentConversation) {
        return {
          ...state,
          currentConversation: {
            ...state.currentConversation,
            messages: [...(state.currentConversation.messages || []), action.payload],
          },
        }
      }
      return state
    default:
      return state
  }
}

// Context
const AlphaMindContext = createContext<{
  state: AlphaMindState
  dispatch: React.Dispatch<AlphaMindAction>
} | null>(null)

// Provider
export function AlphaMindProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alphaMindReducer, initialState)

  return (
    <AlphaMindContext.Provider value={{ state, dispatch }}>
      {children}
    </AlphaMindContext.Provider>
  )
}

// Hook
export function useAlphaMind() {
  const context = useContext(AlphaMindContext)
  if (!context)
    throw new Error('useAlphaMind must be used within an AlphaMindProvider')

  return context
}
