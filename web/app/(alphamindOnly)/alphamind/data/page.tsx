'use client'

import React, { useEffect, useState } from 'react'
import {
  Database,
  FileText,
  Image,
  Music,
  Video,
} from 'lucide-react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'

type Dataset = {
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

export default function DataPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<{ open: boolean, datasetId?: number }>({ open: false })

  useEffect(() => {
    const loadDatasets = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockDatasets: Dataset[] = [
          {
            id: 1,
            name: '客户反馈数据',
            description: '收集的客户反馈和评价数据',
            type: 'text',
            status: 'completed',
            fileCount: 1250,
            size: '45.2 MB',
            createdAt: '2024-01-15',
            lastModified: '2024-01-20',
          },
          {
            id: 2,
            name: '产品图片库',
            description: '产品展示图片和宣传素材',
            type: 'image',
            status: 'completed',
            fileCount: 890,
            size: '2.1 GB',
            createdAt: '2024-01-10',
            lastModified: '2024-01-18',
          },
          {
            id: 3,
            name: '培训视频',
            description: '员工培训和教学视频资料',
            type: 'video',
            status: 'processing',
            fileCount: 45,
            size: '8.7 GB',
            createdAt: '2024-01-22',
            lastModified: '2024-01-22',
          },
          {
            id: 4,
            name: '会议录音',
            description: '重要会议的录音文件',
            type: 'audio',
            status: 'completed',
            fileCount: 156,
            size: '1.2 GB',
            createdAt: '2024-01-08',
            lastModified: '2024-01-16',
          },
        ]

        setDatasets(mockDatasets)
      }
 catch (error) {
        console.error('Failed to load datasets:', error)
      }
 finally {
        setLoading(false)
      }
    }

    loadDatasets()
  }, [])

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
                         || dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || dataset.type === filterType
    const matchesStatus = filterStatus === 'all' || dataset.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      image: Image,
      audio: Music,
      video: Video,
      mixed: Database,
    }
    return icons[type as keyof typeof icons] || Database
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      text: '文本',
      image: '图片',
      audio: '音频',
      video: '视频',
      mixed: '混合',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      uploading: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status as keyof typeof colors] || colors.completed
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: '已完成',
      processing: '处理中',
      uploading: '上传中',
      error: '错误',
    }
    return labels[status as keyof typeof labels] || status
  }

  const deleteDataset = (datasetId: number) => {
    setShowDeleteModal({ open: true, datasetId })
  }
  const confirmDeleteDataset = () => {
    if (showDeleteModal.datasetId !== undefined) {
      setDatasets(prev => prev.filter(dataset => dataset.id !== showDeleteModal.datasetId))
      setShowDeleteModal({ open: false })
    }
  }
  const cancelDeleteDataset = () => setShowDeleteModal({ open: false })

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa] md:flex-row">
        {/* 你的左侧输入区、分割条、右侧输出区等内容，参考 workflows/page.tsx 的结构和样式 */}
        {/* 移除顶部搜索/过滤区（搜索框、类型筛选、状态筛选等） */}

      </div>

      {/* 上传模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              上传数据集
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              此功能正在开发中，敬请期待！
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 删除数据集模态框 */}
      {showDeleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              确认删除
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              确定要删除这个数据集吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteDataset}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="取消删除"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteDataset}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                aria-label="确认删除"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </AlphaMindDashboardLayout>
  )
}
