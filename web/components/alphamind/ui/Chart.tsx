'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type ChartProps = {
  children: React.ReactNode
  className?: string
}

type ChartContainerProps = {
  children: React.ReactNode
  className?: string
  config?: Record<string, any>
}

type ChartTooltipProps = {
  active?: boolean
  payload?: any[]
  label?: string
  className?: string
}

type ChartLegendProps = {
  payload?: any[]
  className?: string
}

// Basic Chart Container
const Chart: React.FC<ChartProps> = ({ children, className }) => (
  <div className={cn('h-full w-full', className)}>
    {children}
  </div>
)

// Chart Container with configuration
const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className,
  config,
}) => (
  <div className={cn('h-[350px] w-full', className)}>
    {children}
  </div>
)

// Custom Tooltip Component
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  className,
}) => {
  if (!active || !payload || !payload.length)
    return null

  return (
    <div className={cn(
      'bg-background rounded-lg border p-2 shadow-md',
      className,
    )}>
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[0.70rem] uppercase">
            {label}
          </span>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Custom Legend Component
const ChartLegend: React.FC<ChartLegendProps> = ({ payload, className }) => {
  if (!payload || !payload.length)
    return null

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground text-sm">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Chart Title Component
type ChartTitleProps = {
  children: React.ReactNode
  className?: string
}

const ChartTitle: React.FC<ChartTitleProps> = ({ children, className }) => (
  <h3 className={cn('mb-4 text-lg font-semibold', className)}>
    {children}
  </h3>
)

// Chart Description Component
type ChartDescriptionProps = {
  children: React.ReactNode
  className?: string
}

const ChartDescription: React.FC<ChartDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-muted-foreground mb-4 text-sm', className)}>
    {children}
  </p>
)

// Mock Chart Components for demonstration
type LineChartProps = {
  data: any[]
  className?: string
  children?: React.ReactNode
}

const LineChart: React.FC<LineChartProps> = ({ data, className, children }) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-lg bg-gray-50', className)}>
    <div className="text-center">
      <div className="mb-2 text-2xl">📈</div>
      <div className="text-sm text-gray-600">Line Chart</div>
      <div className="text-xs text-gray-500">{data.length} data points</div>
    </div>
    {children}
  </div>
)

type BarChartProps = {
  data: any[]
  className?: string
  children?: React.ReactNode
}

const BarChart: React.FC<BarChartProps> = ({ data, className, children }) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-lg bg-gray-50', className)}>
    <div className="text-center">
      <div className="mb-2 text-2xl">📊</div>
      <div className="text-sm text-gray-600">Bar Chart</div>
      <div className="text-xs text-gray-500">{data.length} data points</div>
    </div>
    {children}
  </div>
)

type PieChartProps = {
  data: any[]
  className?: string
  children?: React.ReactNode
}

const PieChart: React.FC<PieChartProps> = ({ data, className, children }) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-lg bg-gray-50', className)}>
    <div className="text-center">
      <div className="mb-2 text-2xl">🥧</div>
      <div className="text-sm text-gray-600">Pie Chart</div>
      <div className="text-xs text-gray-500">{data.length} data points</div>
    </div>
    {children}
  </div>
)

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartTitle,
  ChartDescription,
  LineChart,
  BarChart,
  PieChart,
  type ChartProps,
  type ChartContainerProps,
  type ChartTooltipProps,
  type ChartLegendProps,
  type ChartTitleProps,
  type ChartDescriptionProps,
  type LineChartProps,
  type BarChartProps,
  type PieChartProps,
}
