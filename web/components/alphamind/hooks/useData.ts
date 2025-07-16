'use client'

import { useCallback, useEffect, useState } from 'react'

export type DataFile = {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  uploadedAt: Date
  processedAt?: Date
  metadata?: Record<string, any>
  url?: string
}

export type Dataset = {
  id: string
  name: string
  description: string
  files: DataFile[]
  totalSize: number
  status: 'active' | 'processing' | 'error'
  createdAt: Date
  updatedAt: Date
}

export type KnowledgeBase = {
  id: string
  name: string
  description: string
  datasets: string[]
  vectorCount: number
  status: 'ready' | 'indexing' | 'error'
  createdAt: Date
  updatedAt: Date
}

export type UseDataOptions = {
  apiUrl?: string
  onError?: (error: Error) => void
  onUploadProgress?: (progress: number) => void
}

export type UseDataReturn = {
  files: DataFile[]
  datasets: Dataset[]
  knowledgeBases: KnowledgeBase[]
  isLoading: boolean
  error: string | null
  uploadFiles: (files: File[], datasetId?: string) => Promise<DataFile[]>
  deleteFile: (fileId: string) => Promise<void>
  createDataset: (name: string, description?: string) => Promise<Dataset>
  updateDataset: (id: string, updates: Partial<Dataset>) => Promise<Dataset>
  deleteDataset: (id: string) => Promise<void>
  createKnowledgeBase: (name: string, description: string, datasetIds: string[]) => Promise<KnowledgeBase>
  updateKnowledgeBase: (id: string, updates: Partial<KnowledgeBase>) => Promise<KnowledgeBase>
  deleteKnowledgeBase: (id: string) => Promise<void>
  searchKnowledge: (query: string, knowledgeBaseId?: string) => Promise<any[]>
  refreshData: () => Promise<void>
}

export function useData(options: UseDataOptions = {}): UseDataReturn {
  const {
    apiUrl = '/api/data',
    onError,
    onUploadProgress,
  } = options

  const [files, setFiles] = useState<DataFile[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    refreshData()
  }, [])

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    setError(errorMessage)
    onError?.(err instanceof Error ? err : new Error(errorMessage))
  }, [onError])

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [filesRes, datasetsRes, kbRes] = await Promise.allSettled([
        fetch(`${apiUrl}/files`),
        fetch(`${apiUrl}/datasets`),
        fetch(`${apiUrl}/knowledge-bases`),
      ])

      // Handle files
      if (filesRes.status === 'fulfilled' && filesRes.value.ok) {
        const filesData = await filesRes.value.json()
        setFiles(filesData.files || [])
      }
 else {
        // Mock data for development
        setFiles([
          {
            id: '1',
            name: 'sample-data.csv',
            type: 'text/csv',
            size: 1024000,
            status: 'completed',
            uploadedAt: new Date(Date.now() - 86400000),
            processedAt: new Date(Date.now() - 86400000 + 3600000),
          },
          {
            id: '2',
            name: 'training-docs.pdf',
            type: 'application/pdf',
            size: 2048000,
            status: 'processing',
            uploadedAt: new Date(Date.now() - 3600000),
          },
        ])
      }

      // Handle datasets
      if (datasetsRes.status === 'fulfilled' && datasetsRes.value.ok) {
        const datasetsData = await datasetsRes.value.json()
        setDatasets(datasetsData.datasets || [])
      }
 else {
        // Mock data for development
        setDatasets([
          {
            id: '1',
            name: 'Customer Support Data',
            description: 'Historical customer support conversations',
            files: ['1'],
            totalSize: 1024000,
            status: 'active',
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(),
          },
        ])
      }

      // Handle knowledge bases
      if (kbRes.status === 'fulfilled' && kbRes.value.ok) {
        const kbData = await kbRes.value.json()
        setKnowledgeBases(kbData.knowledgeBases || [])
      }
 else {
        // Mock data for development
        setKnowledgeBases([
          {
            id: '1',
            name: 'Product Knowledge Base',
            description: 'Comprehensive product information and FAQs',
            datasets: ['1'],
            vectorCount: 1500,
            status: 'ready',
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(),
          },
        ])
      }
    }
 catch (err) {
      handleError(err)
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const uploadFiles = useCallback(async (
    fileList: File[],
    datasetId?: string,
  ): Promise<DataFile[]> => {
    setIsLoading(true)
    setError(null)

    const uploadedFiles: DataFile[] = []

    try {
      for (const file of fileList) {
        const formData = new FormData()
        formData.append('file', file)
        if (datasetId)
          formData.append('datasetId', datasetId)

        // Create initial file record
        const newFile: DataFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'uploading',
          uploadedAt: new Date(),
        }

        setFiles(prev => [...prev, newFile])
        uploadedFiles.push(newFile)

        try {
          const response = await fetch(`${apiUrl}/files/upload`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok)
            throw new Error(`Upload failed: ${response.status}`)

          const result = await response.json()

          // Update file status
          setFiles(prev => prev.map(f =>
            f.id === newFile.id
              ? { ...f, status: 'processing', ...result }
              : f,
          ))

          // Simulate processing completion
          setTimeout(() => {
            setFiles(prev => prev.map(f =>
              f.id === newFile.id
                ? { ...f, status: 'completed', processedAt: new Date() }
                : f,
            ))
          }, 2000)
        }
 catch (err) {
          // Update file status to error
          setFiles(prev => prev.map(f =>
            f.id === newFile.id
              ? { ...f, status: 'error' }
              : f,
          ))
          throw err
        }
      }

      return uploadedFiles
    }
 catch (err) {
      handleError(err)
      return uploadedFiles
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const deleteFile = useCallback(async (fileId: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok)
        throw new Error(`Delete failed: ${response.status}`)

      setFiles(prev => prev.filter(f => f.id !== fileId))
    }
 catch (err) {
      handleError(err)
      // Delete locally for development
      setFiles(prev => prev.filter(f => f.id !== fileId))
    }
  }, [apiUrl, handleError])

  const createDataset = useCallback(async (
    name: string,
    description = '',
  ): Promise<Dataset> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok)
        throw new Error(`Create dataset failed: ${response.status}`)

      const newDataset = await response.json()
      setDatasets(prev => [...prev, newDataset])
      return newDataset
    }
 catch (err) {
      handleError(err)
      // Create mock dataset for development
      const mockDataset: Dataset = {
        id: Date.now().toString(),
        name,
        description,
        files: [],
        totalSize: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setDatasets(prev => [...prev, mockDataset])
      return mockDataset
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const updateDataset = useCallback(async (
    id: string,
    updates: Partial<Dataset>,
  ): Promise<Dataset> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/datasets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok)
        throw new Error(`Update dataset failed: ${response.status}`)

      const updatedDataset = await response.json()
      setDatasets(prev => prev.map(d =>
        d.id === id ? { ...d, ...updatedDataset, updatedAt: new Date() } : d,
      ))
      return updatedDataset
    }
 catch (err) {
      handleError(err)
      // Update locally for development
      const dataset = datasets.find(d => d.id === id)
      if (dataset) {
        const updated = { ...dataset, ...updates, updatedAt: new Date() }
        setDatasets(prev => prev.map(d => d.id === id ? updated : d))
        return updated
      }
      throw new Error('Dataset not found')
    }
  }, [apiUrl, handleError, datasets])

  const deleteDataset = useCallback(async (id: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/datasets/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok)
        throw new Error(`Delete dataset failed: ${response.status}`)

      setDatasets(prev => prev.filter(d => d.id !== id))
    }
 catch (err) {
      handleError(err)
      // Delete locally for development
      setDatasets(prev => prev.filter(d => d.id !== id))
    }
  }, [apiUrl, handleError])

  const createKnowledgeBase = useCallback(async (
    name: string,
    description: string,
    datasetIds: string[],
  ): Promise<KnowledgeBase> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/knowledge-bases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, datasetIds }),
      })

      if (!response.ok)
        throw new Error(`Create knowledge base failed: ${response.status}`)

      const newKB = await response.json()
      setKnowledgeBases(prev => [...prev, newKB])
      return newKB
    }
 catch (err) {
      handleError(err)
      // Create mock knowledge base for development
      const mockKB: KnowledgeBase = {
        id: Date.now().toString(),
        name,
        description,
        datasets: datasetIds,
        vectorCount: 0,
        status: 'indexing',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setKnowledgeBases(prev => [...prev, mockKB])

      // Simulate indexing completion
      setTimeout(() => {
        setKnowledgeBases(prev => prev.map(kb =>
          kb.id === mockKB.id
            ? { ...kb, status: 'ready', vectorCount: Math.floor(Math.random() * 2000) }
            : kb,
        ))
      }, 3000)

      return mockKB
    }
 finally {
      setIsLoading(false)
    }
  }, [apiUrl, handleError])

  const updateKnowledgeBase = useCallback(async (
    id: string,
    updates: Partial<KnowledgeBase>,
  ): Promise<KnowledgeBase> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/knowledge-bases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok)
        throw new Error(`Update knowledge base failed: ${response.status}`)

      const updatedKB = await response.json()
      setKnowledgeBases(prev => prev.map(kb =>
        kb.id === id ? { ...kb, ...updatedKB, updatedAt: new Date() } : kb,
      ))
      return updatedKB
    }
 catch (err) {
      handleError(err)
      // Update locally for development
      const kb = knowledgeBases.find(k => k.id === id)
      if (kb) {
        const updated = { ...kb, ...updates, updatedAt: new Date() }
        setKnowledgeBases(prev => prev.map(k => k.id === id ? updated : k))
        return updated
      }
      throw new Error('Knowledge base not found')
    }
  }, [apiUrl, handleError, knowledgeBases])

  const deleteKnowledgeBase = useCallback(async (id: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/knowledge-bases/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok)
        throw new Error(`Delete knowledge base failed: ${response.status}`)

      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id))
    }
 catch (err) {
      handleError(err)
      // Delete locally for development
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id))
    }
  }, [apiUrl, handleError])

  const searchKnowledge = useCallback(async (
    query: string,
    knowledgeBaseId?: string,
  ): Promise<any[]> => {
    setError(null)

    try {
      const params = new URLSearchParams({ query })
      if (knowledgeBaseId)
        params.append('knowledgeBaseId', knowledgeBaseId)

      const response = await fetch(`${apiUrl}/search?${params}`)
      if (!response.ok)
        throw new Error(`Search failed: ${response.status}`)

      const results = await response.json()
      return results.results || []
    }
 catch (err) {
      handleError(err)
      // Return mock results for development
      return [
        {
          id: '1',
          content: `Mock search result for "${query}"`,
          score: 0.95,
          metadata: { source: 'sample-data.csv' },
        },
      ]
    }
  }, [apiUrl, handleError])

  return {
    files,
    datasets,
    knowledgeBases,
    isLoading,
    error,
    uploadFiles,
    deleteFile,
    createDataset,
    updateDataset,
    deleteDataset,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    searchKnowledge,
    refreshData,
  }
}
