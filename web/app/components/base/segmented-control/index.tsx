import React from 'react'
import classNames from '@/utils/classnames'
import type { RemixiconComponentType } from '@remixicon/react'
import Divider from '../divider'

// Updated generic type to allow enum values
type SegmentedControlProps<T extends string | number | symbol> = {
  options: { Icon: RemixiconComponentType, text: string, value: T }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export const SegmentedControl = <T extends string | number | symbol>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>): JSX.Element => {
  const selectedOptionIndex = options.findIndex(option => option.value === value)

  return (
    <div className={classNames(
      'flex items-center gap-x-[1px] rounded-lg bg-components-segmented-control-bg-normal p-0.5',
      className,
    )}>
      {options.map((option, index) => {
        const { Icon } = option
        const isSelected = index === selectedOptionIndex
        const isNextSelected = index === selectedOptionIndex - 1
        const isLast = index === options.length - 1
        return (
          <button
            type='button'
            key={String(option.value)}
            className={classNames(
              'border-0.5 group relative flex items-center justify-center gap-x-0.5 rounded-lg border-transparent px-2 py-1',
              isSelected
                ? 'border-components-segmented-control-item-active-border bg-components-segmented-control-item-active-bg shadow-xs shadow-shadow-shadow-3'
                : 'hover:bg-state-base-hover',
            )}
            onClick={() => onChange(option.value)}
          >
            <span className='flex h-5 w-5 items-center justify-center'>
              <Icon className={classNames(
                'h-4 w-4 text-text-tertiary',
                isSelected ? 'text-text-accent-light-mode-only' : 'group-hover:text-text-secondary',
              )} />
            </span>
            <span className={classNames(
              'system-sm-medium p-0.5 text-text-tertiary',
              isSelected ? 'text-text-accent-light-mode-only' : 'group-hover:text-text-secondary',
            )}>
              {option.text}
            </span>
            {!isLast && !isSelected && !isNextSelected && (
              <div className='absolute right-[-1px] top-0 flex h-full items-center'>
                <Divider type='vertical' className='mx-0 h-3.5' />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default React.memo(SegmentedControl) as typeof SegmentedControl
