'use client'

import React, { useEffect, useRef, useState } from 'react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'
import { Copy, File as FileIcon, Image as ImageIcon, Send } from 'lucide-react'

const PROVIDER_OPTIONS = [
  'Ollama',
  'OpenAI',
  'Deepseek',
]
const MODEL_OPTIONS = [
  'Qwen3 8b',
  'Qwen2.5vl:7b',
  'Gemma3:4b',
  'Deepseek-r1:8b',
  'Phi4:latest',
]
const COLLECTION_OPTIONS = [
  'Select a collection',
  'KnowledgeBase1',
  'KnowledgeBase2',
]

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image' | 'article'
  fileUrl?: string
  timestamp: Date
}

export default function ChatPage() {
  const [provider, setProvider] = useState('Ollama')
  const [model, setModel] = useState('Qwen3 8b')
  const [collection, setCollection] = useState('Select a collection')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatPanelRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // 复制消息内容
  const handleCopy = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopiedMsgId(msg.id)
      setTimeout(() => setCopiedMsgId(null), 1500)
    }
    catch {}
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && !file) return
    setIsLoading(true)
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      type: file ? (file.type.startsWith('image') ? 'image' : 'article') : 'text',
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      timestamp: new Date(),
    }
    setMessages((prev: Message[]) => [...prev, newMsg])
    setInputMessage('')
    setFile(null)
    // mock assistant reply
    setTimeout(() => {
      setMessages((prev: Message[]) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a mock response.',
        timestamp: new Date(),
      }])
      setIsLoading(false)
    }, 1200)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setFile(e.target.files[0])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 拖拽调整聊天panel宽高
  useEffect(() => {
    // 仅用于类型声明，实际拖拽逻辑在 onMouseDown
    return undefined
  }, [])

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa]">
        {/* 顶部下拉框区 */}
        <div className="flex flex-wrap gap-6 border-b border-gray-200 bg-white px-6 pb-2 pt-6">
          <div className="flex min-w-[180px] flex-1 flex-col">
            <label className="mb-1 font-semibold text-gray-700" htmlFor="collection-select">Select collection</label>
            <select
              id="collection-select"
              aria-label="Select collection"
              className="rounded border bg-white px-3 py-2 text-gray-900"
              value={collection}
              onChange={e => setCollection(e.target.value)}
            >
              {COLLECTION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col">
            <label className="mb-1 font-semibold text-gray-700" htmlFor="provider-select">Provider</label>
            <select
              id="provider-select"
              aria-label="Provider"
              className="rounded border bg-white px-3 py-2 text-gray-900"
              value={provider}
              onChange={e => setProvider(e.target.value)}
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col">
            <label className="mb-1 font-semibold text-gray-700" htmlFor="model-select">Model</label>
            <select
              id="model-select"
              aria-label="Model"
              className="rounded border bg-white px-3 py-2 text-gray-900"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        {/* 聊天panel，可resize，右下角有拖拽区 */}
        <div
          ref={chatPanelRef}
          className="relative flex flex-col rounded-lg border bg-white p-0 shadow-md"
          style={{ minWidth: 320, minHeight: 320, width: 600, height: 480, margin: '32px auto 0', boxSizing: 'border-box', resize: 'none', overflow: 'hidden' }}
        >
          {/* 聊天消息区 */}
          <div
            className="w-full flex-1 overflow-y-auto px-0 py-4"
            style={{ background: '#f7f7fa', minHeight: 320, maxHeight: 480, overflowY: 'auto' }}
          >
            {messages.length === 0 ? (
              <div className="py-12 text-center text-gray-400">Welcome! Select collection and ask questions about your documents.</div>
            ) : (
              messages.map((msg: Message) => {
                return (
                  <div key={msg.id} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`group relative max-w-[70%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-green-100 text-right' : 'bg-gray-100 text-left'}`}>
                      {/* 文件/图片展示 */}
                      {(() => {
                        if (msg.type === 'image' && msg.fileUrl)
                          return <img src={msg.fileUrl} alt="uploaded" className="mb-2 max-w-xs rounded" />
                        if (msg.type === 'article' && msg.fileUrl)
                          return <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="mb-2 block text-blue-600 underline">[Uploaded Article]</a>
                        return null
                      })()}
                      <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <span>{msg.timestamp?.toLocaleTimeString()}</span>
                        <button
                          className="ml-2 rounded p-1 hover:bg-gray-200"
                          title="复制"
                          aria-label="复制消息"
                          onClick={() => handleCopy(msg)}
                        >
                          {copiedMsgId === msg.id ? <span className="text-green-500">已复制</span> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* 输入区，去掉 sticky，保证 w-full 跟随 panel 宽度 */}
          <form
            className="flex w-full items-end gap-2 border-t bg-white p-2"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <input
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              aria-label="上传文档"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleFileChange}
              aria-label="上传图片"
            />
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:text-blue-600"
              title="上传文档"
              aria-label="上传文档"
              disabled={isLoading}
            >
              <FileIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:text-blue-600"
              title="上传图片"
              aria-label="上传图片"
              disabled={isLoading}
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            {file && (
              <div className="relative mb-2 inline-block">
                <div className="rounded-md border border-gray-300 p-1">
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="移除文件"
                    aria-label="移除文件"
                  >×</button>
                </div>
              </div>
            )}
            <textarea
              className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              rows={2}
              style={{ minHeight: '32px', maxHeight: '216px', overflowY: 'auto', background: '#fff', color: '#222', fontSize: '16px' }}
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="消息输入框"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              name="chat-message"
              id="chat-message"
            />
            <button
              type="submit"
              className={`flex items-center justify-center rounded-md px-4 py-2 text-white ${(!inputMessage.trim() && !file) || isLoading ? 'cursor-not-allowed bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}
              disabled={(!inputMessage.trim() && !file) || isLoading}
              aria-label="发送消息"
              title="发送消息"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          {/* 右下角resize拖拽区 */}
          <div
            style={{ position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, cursor: 'nwse-resize', zIndex: 20, background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', pointerEvents: 'auto' }}
            title="Resize panel"
            onMouseDown={(e) => {
              e.preventDefault()
              const panel = chatPanelRef.current
              if (!panel) return
              const startX = e.clientX
              const startY = e.clientY
              const startWidth = panel.offsetWidth
              const startHeight = panel.offsetHeight
              function onMove(ev: MouseEvent) {
                if (!panel) return
                const minWidth = 320
                const minHeight = 320
                const newWidth = Math.max(minWidth, startWidth + (ev.clientX - startX))
                const newHeight = Math.max(minHeight, startHeight + (ev.clientY - startY))
                panel.style.width = `${newWidth}px`
                panel.style.height = `${newHeight}px`
              }
              function onUp() {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 15h12M6 12h9M9 9h6" stroke="#dde3ec" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
    </AlphaMindDashboardLayout>
  )
}
