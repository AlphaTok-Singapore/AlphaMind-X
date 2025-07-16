'use client'

import React, { useEffect, useRef, useState } from 'react'
import AlphaMindDashboardLayout from '../components/AlphaMindDashboardLayout'
import { defaultPostPrompt, defaultSeoPrompt } from './config'

// Webhook URLs and model options from config.js
// TODO: 本地开发用 http，生产请改为 https 并恢复下方注释
// const SUBMIT_WEBHOOK = "http://host.docker.internal:5678/webhook/webpage-social";
// const PREVIEW_WEBHOOK = "http://host.docker.internal:5678/webhook/preview";
// const APPROVAL_WEBHOOK = "http://host.docker.internal:5678/webhook/approve-social-post";
const SUBMIT_WEBHOOK = process.env.NEXT_PUBLIC_SUBMIT_WEBHOOK || 'http://host.docker.internal:5678/webhook/webpage-social'
const PREVIEW_WEBHOOK = process.env.NEXT_PUBLIC_PREVIEW_WEBHOOK || 'http://host.docker.internal:5678/webhook/preview'
const APPROVAL_WEBHOOK = process.env.NEXT_PUBLIC_APPROVAL_WEBHOOK || 'http://host.docker.internal:5678/webhook/approve-social-post'
const PROVIDER_OPTIONS = [
  'Ollama',
  'OpenAI',
  'Deepseek',
]
const PROVIDER_MODEL_MAP: Record<string, string[]> = {
  Ollama: ['qwen2.5vl:7b', 'gemma3:4b', 'deepseek-r1:8b', 'qwen3:8b', 'phi4:latest'],
  Deepseek: ['deepseek-reasoner', 'deepseek-chat'],
  OpenAI: ['gpt-4o', 'gpt-4.5', 'gpt-o3'],
}

const initialResponse = 'Waiting for output...'
const initialPreview = 'Preview will appear here'

// 格式化 LLM 响应内容为可读文本
function formatLLMContent(json: any) {
  if (!json) return ''
  // 优先用 post 字段
  if (json.post)
    return String(json.post).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\n/g, '\n')

  // 否则拼接 Topic/Keywords/Hashtags
  let content = ''
  if (json.Topic) content += `主题: ${json.Topic}\n`
  if (json.Keywords) content += `关键词: ${Array.isArray(json.Keywords) ? json.Keywords.join(', ') : json.Keywords}\n`
  if (json.Hashtags) content += `Hashtags: ${Array.isArray(json.Hashtags) ? json.Hashtags.join(' ') : json.Hashtags}\n`
  return content.trim()
}

export default function WorkflowsPage() {
  const [url, setUrl] = useState('')
  const [manual, setManual] = useState('')
  const [provider, setProvider] = useState('Ollama')
  const [model, setModel] = useState(PROVIDER_MODEL_MAP.Ollama[0])
  const [seoPrompt, setSeoPrompt] = useState(defaultSeoPrompt)
  const [postPrompt, setPostPrompt] = useState(defaultPostPrompt)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [response, setResponse] = useState(initialResponse)
  const [finalPost, setFinalPost] = useState('')
  const [preview, setPreview] = useState(initialPreview)
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [leftWidth, setLeftWidth] = useState(480) // 初始左栏宽度
  const dragging = useRef(false)
  const modelOptions = PROVIDER_MODEL_MAP[provider] || []

  const platformOptions = ['LinkedIn', 'Facebook', 'Instagram', 'X']

  // 拖动分割条事件
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const min = 320
      const max = 900
      let newWidth = e.clientX - 240 // 240: 侧边栏宽度
      if (newWidth < min) newWidth = min
      if (newWidth > max) newWidth = max
      setLeftWidth(newWidth)
    }
    const onMouseUp = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('⏳ Sending request...')
    const payload = {
      'Webpage URL': url,
      'Manual Content (if webpage blocked)': manual,
      'Provider': provider,
      'Ollama Model': model,
      'Target Platforms': platforms,
      seoPrompt,
      postPrompt,
      'submittedAt': new Date().toISOString(),
    }
    try {
      const res = await fetch(SUBMIT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setResponse(JSON.stringify(json, null, 2))
      setFinalPost(formatLLMContent(json))
    }
 catch (err: any) {
      setResponse(`❌ Error: ${err.message}`)
    }
 finally {
      setLoading(false)
    }
  }

  // 恢复AI初始生成（用于编辑区误删或需要还原）
  const handleLoadPreview = async () => {
    setPreviewLoading(true)
    setPreview('⏳ Loading preview...')
    try {
      const res = await fetch(PREVIEW_WEBHOOK)
      const json = await res.json()
      setPreview(JSON.stringify(json, null, 2))
      setFinalPost(json.post || (json.content ? json.content : JSON.stringify(json, null, 2)))
    }
 catch (err: any) {
      setPreview(`❌ Failed to load preview: ${err?.message || String(err)}`)
    }
 finally {
      setPreviewLoading(false)
    }
  }

  // 审批/发布
  const handleApprove = async () => {
    setApproveLoading(true)
    setPreview(prev => `${prev}\n⏳ Sending approval...`)
    try {
      const res = await fetch(APPROVAL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: finalPost,
          platforms, // 直接用当前 platforms state
        }),
      })
      const result = await res.json()
      setPreview(prev => `${prev}\n✅ Approval Sent:\n${JSON.stringify(result, null, 2)}`)
    }
 catch (err: any) {
      setPreview(prev => `${prev}\n❌ Approval Failed: ${err.message}`)
    }
 finally {
      setApproveLoading(false)
    }
  }

  // Provider 变化时自动切换 Model
  useEffect(() => {
    if (modelOptions.length > 0)
      setModel(modelOptions[0])
  }, [provider])

  return (
    <AlphaMindDashboardLayout>
      <div className="relative flex min-h-[80vh] flex-col bg-[#f7f9fa] md:flex-row">
        {/* 左侧输入区 */}
        <div
          className="left flex flex-col justify-between border-r border-[#dde3ec] bg-[#f4f7fa] p-4 md:p-6"
          style={{ minWidth: 320, maxWidth: 900, width: leftWidth, boxSizing: 'border-box' }}
        >
          <div>
            <h2 className="mb-3 text-xl font-bold text-[#1a1a1a]">Input Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="url" className="mb-1 block font-medium text-[#222]">Webpage URL</label>
                <input
                  id="url"
                  type="text"
                  className="w-full resize-x rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="manual" className="mb-1 block font-medium text-[#222]">Manual Content</label>
                <textarea
                  id="manual"
                  rows={4}
                  className="left-textarea resize-both rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  placeholder="Paste article content here..."
                  value={manual}
                  onChange={e => setManual(e.target.value)}
                  style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
                />
              </div>
              <div>
                <label htmlFor="provider" className="mb-1 block font-medium text-[#222]">Provider</label>
                <select
                  id="provider"
                  className="w-full rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  value={provider}
                  onChange={(e) => {
                    const newProvider = e.target.value
                    setProvider(newProvider)
                    // 切换 provider 时自动切换 model
                    const newModelList = PROVIDER_MODEL_MAP[newProvider] || []
                    setModel(newModelList[0] || '')
                  }}
                  title="Select provider"
                >
                  {PROVIDER_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="model" className="mb-1 block font-medium text-[#222]">Model</label>
                <select
                  id="model"
                  className="w-full rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                >
                  {modelOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="seoPrompt" className="mb-1 block font-medium text-[#222]">SEO Prompt</label>
                <textarea
                  id="seoPrompt"
                  rows={4}
                  className="resize-both w-full max-w-full rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  placeholder="SEO prompt for the post..."
                  value={seoPrompt}
                  onChange={e => setSeoPrompt(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="postPrompt" className="mb-1 block font-medium text-[#222]">Post Prompt</label>
                <textarea
                  id="postPrompt"
                  rows={4}
                  className="resize-both w-full max-w-full rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  placeholder="Post prompt for the post..."
                  value={postPrompt}
                  onChange={e => setPostPrompt(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="platforms" className="mb-1 block font-medium text-[#222]">Target Platforms</label>
                <select
                  id="platforms"
                  multiple
                  className="w-full rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
                  value={platforms}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value)
                    setPlatforms(selected)
                  }}
                  title="Select target platforms"
                >
                  {platformOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="action-bar mb-2 flex gap-2">
                <button
                  type="submit"
                  className={'rounded-lg bg-[#34c759] px-5 py-2 font-medium text-white shadow-md transition hover:bg-[#28a745] disabled:bg-[#bfcfe3]'}
                  disabled={loading}
                >
                  Generate
                </button>
              </div>
            </form>
            {/* Raw Output moved up, reduce gap */}
            <div style={{ marginTop: '8px' }}>
              <div className="output-label mb-1 mt-2 font-semibold text-[#222]">Raw Output</div>
              <textarea
                readOnly
                className="mb-2 min-h-[50px] w-full max-w-full whitespace-pre-wrap break-words rounded-lg border border-[#bfcfe3] bg-[#f6f7f9] px-3 py-2 font-mono text-[15px] text-[#314365]"
                rows={8}
                placeholder="Raw JSON output will appear here."
                title="Raw Output"
                value={(() => {
                  try {
                    const json = typeof response === 'string' ? JSON.parse(response) : response
                    return JSON.stringify(json, null, 2)
                  }
 catch {
                    return String(response)
                  }
                })()}
              />
            </div>
          </div>
        </div>
        {/* 分割条 */}
        <div
          className="splitter"
          style={{ width: 8, cursor: 'col-resize', background: '#dde3ec', zIndex: 10 }}
          onMouseDown={() => { dragging.current = true }}
        />
        {/* 右侧输出区 */}
        <div
          className="right flex flex-col bg-white p-4 md:p-6"
          style={{
            position: 'relative',
            borderLeft: '1px solid #dde3ec',
            width: '100%',
            minWidth: 300,
            minHeight: 300,
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'auto',
            resize: 'none',
          }}
          id="right-panel"
        >
          <h2 className="mb-3 text-xl font-bold text-[#1a1a1a]">Output & Edit Area</h2>
          <label className="output-label mb-2 font-semibold text-[#222]" htmlFor="finalPost">Working Post</label>
          <div style={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
            <textarea
              id="finalPost"
              className="output-textarea mb-2 rounded-lg border border-[#bfcfe3] bg-[#f9fbfd] px-3 py-2 text-gray-900 focus:border-blue-400 focus:outline-none"
              placeholder="Generated content will appear here. Edit or co-create..."
              value={finalPost}
              onChange={e => setFinalPost(e.target.value)}
              style={{ resize: 'none', width: '100%', height: '100%', minHeight: 120, minWidth: 0, maxWidth: '100%' }}
            />
          </div>
          <div className="action-bar mb-2 flex gap-2">
            <button
              type="button"
              className={'rounded-lg bg-[#34c759] px-5 py-2 font-medium text-white shadow-md transition hover:bg-[#28a745] disabled:bg-[#bfcfe3]'}
              onClick={handleApprove}
              disabled={approveLoading}
            >
              Approve & Publish
            </button>
            <button
              type="button"
              className={'rounded-lg bg-[#377dff] px-5 py-2 font-medium text-white shadow-md transition hover:bg-[#285fd1] disabled:bg-[#bfcfe3]'}
              onClick={handleLoadPreview}
              disabled={previewLoading}
            >
              Restore AI Output
            </button>
          </div>
          <div className="output-label mb-1 mt-2 font-semibold text-[#222]">Status</div>
          <pre className="status min-h-[50px] whitespace-pre-wrap break-words rounded-lg bg-[#f6f7f9] p-3 font-mono text-[15px] text-[#314365]">{preview}</pre>
          {/* 右下角 resize 区域 */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 18,
              height: 18,
              cursor: 'nwse-resize',
              zIndex: 20,
              background: 'transparent',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              pointerEvents: 'auto',
            }}
            title="Resize panel"
            onMouseDown={(e) => {
              e.preventDefault()
              const panel = document.getElementById('right-panel')
              if (!panel)
                return

              const startX = e.clientX
              const startY = e.clientY
              const startWidth = panel.offsetWidth
              const startHeight = panel.offsetHeight
              function onMove(ev: MouseEvent) {
                const dx = ev.clientX - startX
                const dy = ev.clientY - startY
                const minWidth = 320
                const minHeight = 300
                const newWidth = Math.max(minWidth, startWidth + dx)
                const newHeight = Math.max(minHeight, startHeight + dy)
                if (panel) {
                  panel.style.width = `${newWidth}px`
                  panel.style.height = `${newHeight}px`
                }
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
      <style jsx global>{`
        .left, .right {
          box-sizing: border-box;
          overflow-y: auto;
        }
        .left {
          flex: none !important;
        }
        .right {
          min-width: 300px;
          max-width: 100vw;
          border-left: 1px solid #dde3ec;
          position: relative;
        }
        .splitter {
          transition: background 0.2s;
        }
        .splitter:hover {
          background: #bfcfe3;
        }
        .output-textarea {
          resize: none !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 120px;
        }
        .left-textarea {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }
        input[type="text"] {
          resize: horizontal;
        }
        @media (max-width: 900px) {
          .left, .right, .splitter {
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .flex-col.md\:flex-row {
            flex-direction: column !important;
          }
        }
        .left, .right {
          margin-top: 0 !important;
          padding-top: 0.5rem !important;
        }
        /* Custom scrollbar for textarea, select, and right panel */
        textarea::-webkit-scrollbar,
        select::-webkit-scrollbar,
        .right::-webkit-scrollbar {
          width: 8px !important;
          background: #f4f7fa !important;
        }
        textarea::-webkit-scrollbar-thumb,
        select::-webkit-scrollbar-thumb,
        .right::-webkit-scrollbar-thumb {
          background: #dde3ec !important;
          border-radius: 6px !important;
        }
        textarea::-webkit-scrollbar-thumb:hover,
        select::-webkit-scrollbar-thumb:hover,
        .right::-webkit-scrollbar-thumb:hover {
          background: #bfcfe3 !important;
        }
        textarea,
        select,
        .right {
          scrollbar-width: thin !important;
          scrollbar-color: #dde3ec #f4f7fa !important;
        }
        /* 强制所有下拉菜单内容为深色字体 */
        [class*='dropdown'], [class*='Dropdown'], [class*='menu'], [class*='Menu'], [role='menu'], [role='menu'] * {
          color: #222 !important;
          background: #fff !important;
        }
        /* 全局滚动条样式，确保页面和右侧panel一致 */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        #root::-webkit-scrollbar,
        .main::-webkit-scrollbar {
          width: 8px !important;
          background: #f4f7fa !important;
        }
        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb,
        #root::-webkit-scrollbar-thumb,
        .main::-webkit-scrollbar-thumb {
          background: #dde3ec !important;
          border-radius: 6px !important;
        }
        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover,
        #root::-webkit-scrollbar-thumb:hover,
        .main::-webkit-scrollbar-thumb:hover {
          background: #bfcfe3 !important;
        }
      `}</style>
    </AlphaMindDashboardLayout>
  )
}
