'use client'

import React, { useEffect, useRef, useState } from 'react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'
import { Copy, File as FileIcon, Image as ImageIcon, Send, Bot, User, Search, Grid, Globe, Paperclip, Mic, HelpCircle } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image' | 'article'
  fileUrl?: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    
    // 确定消息类型
    let messageType: 'text' | 'image' | 'article' = 'text'
    if (file) {
      messageType = file.type.startsWith('image') ? 'image' : 'article'
    }
    
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      type: messageType,
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

  // 渲染文件预览内容
  const renderFilePreview = (msg: Message) => {
    if (msg.type === 'image' && msg.fileUrl) {
      return <img src={msg.fileUrl} alt="uploaded" className="mb-2 max-w-xs rounded-lg" />
    }
    if (msg.type === 'article' && msg.fileUrl) {
      return <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="mb-2 block text-blue-600 underline">[Uploaded Article]</a>
    }
    return null
  }

  return (
    <AlphaMindDashboardLayout>
      <div className="flex h-full w-full flex-col bg-white">
        {/* 主内容区域 - 占满整个空间 */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            /* 空状态 - 居中设计 */
            <div className="flex h-full flex-col items-center justify-center px-6">
              {/* 品牌名称 */}
              <div className="mb-12 text-center">
                <h1 className="mb-3 text-5xl font-bold text-gray-900">AlphaMind</h1>
                <p className="text-lg text-gray-500">Your AI-powered assistant</p>
              </div>

              {/* 中央输入框 - 居中显示 */}
              <div className="w-full max-w-3xl">
                <div className="relative">
                  <textarea
                    className="w-full resize-none rounded-3xl border-0 bg-gray-50 px-8 py-6 text-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    rows={4}
                    placeholder="Ask anything..."
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  
                  {/* 输入框下方的图标栏 */}
                  <div className="mt-6 flex items-center justify-center space-x-8">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                      <Search className="h-4 w-4" />
                      <span className="text-sm">Search</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                      <Grid className="h-4 w-4" />
                      <span className="text-sm">Spaces</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                      <HelpCircle className="h-4 w-4" />
                      <span className="text-sm">Help</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Web</span>
                    </button>
                    <button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">Attach</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                      <Mic className="h-4 w-4" />
                      <span className="text-sm">Voice</span>
                    </button>
                  </div>
                </div>

                {/* 文件预览 */}
                {file && (
                  <div className="mt-6 flex items-center justify-center space-x-2 rounded-full bg-blue-50 px-4 py-2">
                    <span className="text-sm text-blue-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 聊天界面 - 占满空间 */
            <div className="flex h-full flex-col">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mx-auto max-w-4xl space-y-6">
                  {messages.map((msg: Message) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[80%] items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* 头像 */}
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                          {msg.role === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        
                        {/* 消息内容 */}
                        <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
                          {/* 文件/图片展示 */}
                          {renderFilePreview(msg)}
                          
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          
                          {/* 消息操作 */}
                          <div className={`mt-2 flex items-center text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                            <span>{msg.timestamp?.toLocaleTimeString()}</span>
                            <button
                              className="ml-2 rounded p-1 hover:bg-black/10"
                              title="复制"
                              aria-label="复制消息"
                              onClick={() => handleCopy(msg)}
                            >
                              {copiedMsgId === msg.id ? (
                                <span className="text-green-400">已复制</span>
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 加载状态 */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                          <Bot className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 - 占满宽度 */}
              <div className="bg-white p-6">
                <div className="mx-auto max-w-4xl">
                  <div className="flex items-end space-x-3">
                    {/* 文件上传按钮 */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-500 hover:bg-gray-200"
                        title="上传文档"
                        disabled={isLoading}
                      >
                        <FileIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-500 hover:bg-gray-200"
                        title="上传图片"
                        disabled={isLoading}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 消息输入框 */}
                    <div className="flex-1">
                      <textarea
                        className="w-full resize-none rounded-2xl border-0 bg-gray-50 px-6 py-4 text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={1}
                        placeholder="Ask anything..."
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                      />
                    </div>

                    {/* 发送按钮 */}
                    <button
                      type="button"
                      onClick={sendMessage}
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        (!inputMessage.trim() && !file) || isLoading
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={(!inputMessage.trim() && !file) || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 文件预览 */}
                  {file && (
                    <div className="mt-3 flex items-center justify-center space-x-2 rounded-full bg-blue-50 px-4 py-2">
                      <span className="text-sm text-blue-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          type="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={handleFileChange}
        />
      </div>
    </AlphaMindDashboardLayout>
  )
}
