'use client'

import React, { useCallback, useState } from 'react'
import { Database, Download, Eye, FileText, Trash2, Upload } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table'

type DataFile = {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  uploadedAt: Date
  processedAt?: Date
}

type DataProcessorProps = {
  onFileUpload?: (files: File[]) => void
  onFileDelete?: (fileId: string) => void
  onFileProcess?: (fileId: string) => void
  className?: string
}

const DataProcessor: React.FC<DataProcessorProps> = ({
  onFileUpload,
  onFileDelete,
  onFileProcess,
  className,
}) => {
  const [files, setFiles] = useState<DataFile[]>([
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

  const [dragActive, setDragActive] = useState(false)

  // 将 handleFiles 的定义提前到首次使用之前
  const handleFiles = (fileList: File[]) => {
    const newFiles: DataFile[] = fileList.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      uploadedAt: new Date(),
    }))

    setFiles(prev => [...prev, ...newFiles])
    onFileUpload?.(fileList)

    // Simulate upload and processing
    newFiles.forEach((file) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'processing' } : f,
        ))

        setTimeout(() => {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'completed',
              processedAt: new Date(),
            } : f,
          ))
        }, 2000)
      }, 1000)
    })
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover')
      setDragActive(true)
     else if (e.type === 'dragleave')
      setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      handleFiles(fileList)
    }
  }

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    onFileDelete?.(fileId)
  }

  const processFile = (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'processing' } : f,
    ))
    onFileProcess?.(fileId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const getStatusColor = (status: DataFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600'
      case 'processing': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: DataFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...'
      case 'processing': return 'Processing...'
      case 'completed': return 'Completed'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Upload your data files
          </h3>
          <p className="mb-4 text-gray-600">
            Drag and drop files here, or click to select files
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            accept=".csv,.json,.txt,.pdf,.docx"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer">
              Select Files
            </Button>
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: CSV, JSON, TXT, PDF, DOCX
          </p>
        </div>

        {/* Files Table */}
        {files.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-medium">Uploaded Files</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map(file => (
                  <TableRow key={file.id}>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(file.status)}>
                        {getStatusText(file.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {file.uploadedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { DataProcessor, type DataProcessorProps, type DataFile }
