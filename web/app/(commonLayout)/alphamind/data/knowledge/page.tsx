'use client'

import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Bookmark,
  Calendar,
  Database,
  Edit,
  Eye,
  FileText,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

type KnowledgeBase = {
  id: number
  name: string
  description: string
  documentCount: number
  size: string
  category: string
  createdAt: string
  lastModified: string
  icon: React.ReactNode
}

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const loadKnowledgeBases = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockKnowledgeBases: KnowledgeBase[] = [
          {
            id: 1,
            name: '产品知识库',
            description: '包含所有产品手册、规格和技术文档',
            documentCount: 248,
            size: '156.7 MB',
            category: 'product',
            createdAt: '2025-05-10',
            lastModified: '2025-07-01',
            icon: <FileText className="h-6 w-6" />,
          },
          {
            id: 2,
            name: '客户服务手册',
            description: '客户服务流程、常见问题解答和故障排除指南',
            documentCount: 124,
            size: '89.3 MB',
            category: 'customer',
            createdAt: '2025-04-15',
            lastModified: '2025-06-28',
            icon: <BookOpen className="h-6 w-6" />,
          },
          {
            id: 3,
            name: '行业研究资料',
            description: '行业趋势、竞争对手分析和市场报告',
            documentCount: 56,
            size: '210.5 MB',
            category: 'research',
            createdAt: '2025-06-05',
            lastModified: '2025-06-30',
            icon: <Database className="h-6 w-6" />,
          },
          {
            id: 4,
            name: '法律文件库',
            description: '合同模板、法律协议和合规文档',
            documentCount: 87,
            size: '134.2 MB',
            category: 'legal',
            createdAt: '2025-03-22',
            lastModified: '2025-06-15',
            icon: <Bookmark className="h-6 w-6" />,
          },
        ]

        setKnowledgeBases(mockKnowledgeBases)
      }
 catch (error) {
        console.error('Failed to load knowledge bases:', error)
      }
 finally {
        setLoading(false)
      }
    }

    loadKnowledgeBases()
  }, [])

  const filteredKnowledgeBases = knowledgeBases.filter((kb) => {
    const matchesSearch = kb.name.toLowerCase().includes(searchTerm.toLowerCase())
                          || kb.description.toLowerCase().includes(searchTerm.toLowerCase())
                          || kb.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">知识库</h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理用于智能体参考的文档和知识库
        </p>
      </div>

      {/* 搜索和工具栏 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="搜索知识库..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
            <button
              className={`px-3 py-2 ${viewMode === 'grid'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              className={`px-3 py-2 ${viewMode === 'list'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => setViewMode('list')}
              title="列表视图"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>

          <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus className="mr-2 h-4 w-4" />
            创建知识库
          </button>
        </div>
      </div>

      {/* 知识库列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredKnowledgeBases.map(kb => (
            <div key={kb.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                    {kb.icon}
                  </div>
                  <div>
                    <h3 className="truncate text-lg font-medium text-gray-900 dark:text-white" title={kb.name}>
                      {kb.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {kb.category}
                    </span>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400" title={kb.description}>
                  {kb.description}
                </p>

                <div className="flex flex-wrap gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="mr-4 flex items-center">
                    <FileText className="mr-1 h-4 w-4" />
                    <span>{kb.documentCount} 个文档</span>
                  </div>
                  <div className="mr-4 flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>更新于 {kb.lastModified}</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="mr-1 h-4 w-4" />
                    <span>{kb.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-700">
                <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" title="查看">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" title="编辑">
                  <Edit className="h-5 w-5" />
                </button>
                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="删除">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    知识库
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    类别
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    文档数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    大小
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    最后更新
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {filteredKnowledgeBases.map(kb => (
                  <tr key={kb.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                          {kb.icon}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{kb.name}</div>
                          <div className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{kb.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {kb.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kb.documentCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kb.size}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {kb.lastModified}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" title="查看">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" title="编辑">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="删除">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredKnowledgeBases.length === 0 && !loading && (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">无知识库</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            还没有创建任何知识库或没有与搜索匹配的知识库。
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="mr-2 h-5 w-5" />
              创建新知识库
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
