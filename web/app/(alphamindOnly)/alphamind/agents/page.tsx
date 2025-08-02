'use client'

import React, { useEffect, useState } from 'react'
import {
  Grid,
  List,
  Search,
} from 'lucide-react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'

type Agent = {
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
}

type AgentStats = {
  total: number
  active: number
  inactive: number
  training: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<AgentStats>({ total: 0, active: 0, inactive: 0, training: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<{ open: boolean, agentId?: number }>({ open: false })

  // 模拟数据加载
  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true)
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockAgents: Agent[] = [
          {
            id: 1,
            name: '通用助手',
            description: '帮助用户处理各种日常任务和问题',
            type: 'assistant',
            status: 'active',
            model: 'gpt-3.5-turbo',
            conversations: 156,
            successRate: 94.5,
            lastUsed: '2小时前',
            createdAt: '2024-01-15',
          },
          {
            id: 2,
            name: '数据分析师',
            description: '专业的数据分析和可视化智能体',
            type: 'analyst',
            status: 'active',
            model: 'gpt-4',
            conversations: 89,
            successRate: 97.2,
            lastUsed: '30分钟前',
            createdAt: '2024-01-10',
          },
          {
            id: 3,
            name: '内容创作者',
            description: '创意写作和内容生成专家',
            type: 'creator',
            status: 'inactive',
            model: 'gpt-3.5-turbo',
            conversations: 234,
            successRate: 91.8,
            lastUsed: '1天前',
            createdAt: '2024-01-08',
          },
          {
            id: 4,
            name: '工作流执行器',
            description: '自动化任务执行和流程管理',
            type: 'workflow',
            status: 'training',
            model: 'gpt-4',
            conversations: 45,
            successRate: 88.9,
            lastUsed: '5小时前',
            createdAt: '2024-01-20',
          },
        ]

        setAgents(mockAgents)

        // 计算统计数据
        const newStats = {
          total: mockAgents.length,
          active: mockAgents.filter(a => a.status === 'active').length,
          inactive: mockAgents.filter(a => a.status === 'inactive').length,
          training: mockAgents.filter(a => a.status === 'training').length,
        }
        setStats(newStats)
      }
 catch (error) {
        console.error('Failed to load agents:', error)
      }
 finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  // 过滤智能体
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
                         || agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || agent.type === filterType
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusLabel = (status: string) => {
    const labels = {
      active: '运行中',
      inactive: '已停止',
      training: '训练中',
    }
    return labels[status as keyof typeof labels] || status
  }

  const toggleAgentStatus = (agentId: number) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' as any }
        : agent,
    ))
  }

  const deleteAgent = (agentId: number) => {
    setShowDeleteModal({ open: true, agentId })
  }
  const confirmDeleteAgent = () => {
    if (showDeleteModal.agentId !== undefined) {
      setAgents(prev => prev.filter(agent => agent.id !== showDeleteModal.agentId))
      setShowDeleteModal({ open: false })
    }
  }
  const cancelDeleteAgent = () => setShowDeleteModal({ open: false })

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa] md:flex-row">
        {/* 搜索和过滤 */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索智能体..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  aria-label="类型筛选"
                >
                  <option value="all">所有类型</option>
                  <option value="assistant">通用助手</option>
                  <option value="analyst">数据分析师</option>
                  <option value="creator">内容创作者</option>
                  <option value="workflow">工作流执行器</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  aria-label="状态筛选"
                >
                  <option value="all">所有状态</option>
                  <option value="active">运行中</option>
                  <option value="inactive">已停止</option>
                  <option value="training">训练中</option>
                </select>

                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="网格视图"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="列表视图"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 移除智能体列表区及相关 loading、无数据、占位、提示等内容 */}
      </div>

      {/* 创建智能体模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              创建新智能体
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              此功能正在开发中，敬请期待！
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                aria-label="关闭"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 删除智能体模态框 */}
      {showDeleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              确认删除
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              确定要删除这个智能体吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteAgent}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                aria-label="取消删除"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteAgent}
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
