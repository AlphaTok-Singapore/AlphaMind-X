'use client'

import React, { useState } from 'react'
import { Bot, Play, Save } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Form, FormField, FormInput, FormLabel, FormSelect, FormTextarea } from '../ui/Form'

type AgentConfig = {
  name: string
  description: string
  personality: string
  skills: string[]
  model: string
  temperature: number
  maxTokens: number
}

type AgentBuilderProps = {
  initialConfig?: Partial<AgentConfig>
  onSave?: (config: AgentConfig) => void
  onTest?: (config: AgentConfig) => void
  className?: string
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({
  initialConfig,
  onSave,
  onTest,
  className,
}) => {
  const [config, setConfig] = useState<AgentConfig>({
    name: initialConfig?.name || '',
    description: initialConfig?.description || '',
    personality: initialConfig?.personality || '',
    skills: initialConfig?.skills || [],
    model: initialConfig?.model || 'gpt-3.5-turbo',
    temperature: initialConfig?.temperature || 0.7,
    maxTokens: initialConfig?.maxTokens || 2000,
  })

  const [newSkill, setNewSkill] = useState('')

  const handleInputChange = (field: keyof AgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !config.skills.includes(newSkill.trim())) {
      setConfig(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setConfig(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }))
  }

  const handleSave = () => {
    onSave?.(config)
  }

  const handleTest = () => {
    onTest?.(config)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel required>Agent Name</FormLabel>
              <FormInput
                value={config.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Enter agent name"
              />
            </FormField>

            <FormField>
              <FormLabel>Model</FormLabel>
              <FormSelect
                value={config.model}
                onChange={e => handleInputChange('model', e.target.value)}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
                <option value="llama-2">Llama 2</option>
              </FormSelect>
            </FormField>
          </div>

          <FormField>
            <FormLabel>Description</FormLabel>
            <FormTextarea
              value={config.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Describe what this agent does"
              rows={3}
            />
          </FormField>

          <FormField>
            <FormLabel>Personality</FormLabel>
            <FormTextarea
              value={config.personality}
              onChange={e => handleInputChange('personality', e.target.value)}
              placeholder="Define the agent's personality and communication style"
              rows={4}
            />
          </FormField>

          {/* Skills */}
          <FormField>
            <FormLabel>Skills</FormLabel>
            <div className="space-y-2">
              <div className="flex gap-2">
                <FormInput
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </FormField>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel>Temperature</FormLabel>
              <FormInput
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={e => handleInputChange('temperature', Number.parseFloat(e.target.value))}
              />
            </FormField>

            <FormField>
              <FormLabel>Max Tokens</FormLabel>
              <FormInput
                type="number"
                min="1"
                max="4000"
                value={config.maxTokens}
                onChange={e => handleInputChange('maxTokens', Number.parseInt(e.target.value))}
              />
            </FormField>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Agent
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Test Agent
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

export { AgentBuilder, type AgentBuilderProps, type AgentConfig }
