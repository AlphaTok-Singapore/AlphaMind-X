import React, { createContext, useContext, useState } from 'react'

type AlphaMindContextProps = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentModule: string
}

const AlphaMindContext = createContext<AlphaMindContextProps | undefined>(undefined)

export const AlphaMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentModule] = useState('AlphaMind')

  return (
    <AlphaMindContext.Provider value={{ sidebarOpen, setSidebarOpen, currentModule }}>
      {children}
    </AlphaMindContext.Provider>
  )
}

export function useAlphaMindContext() {
  const context = useContext(AlphaMindContext)
  if (!context)
    throw new Error('useAlphaMindContext must be used within an AlphaMindProvider')

  return context
}
