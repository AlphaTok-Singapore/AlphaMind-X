'use client'
import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformation2Fill,
} from '@remixicon/react'
import { createContext, useContext } from 'use-context-selector'
import ActionButton from '@/app/components/base/action-button'
import classNames from '@/utils/classnames'
import { noop } from 'lodash-es'

export type IToastProps = {
  type?: 'success' | 'error' | 'warning' | 'info'
  size?: 'md' | 'sm'
  duration?: number
  message: string
  children?: ReactNode
  onClose?: () => void
  className?: string
  customComponent?: ReactNode
}
type IToastContext = {
  notify: (props: IToastProps) => void
  close: () => void
}

export const ToastContext = createContext<IToastContext>({} as IToastContext)
export const useToastContext = () => useContext(ToastContext)
const Toast = ({
  type = 'info',
  size = 'md',
  message,
  children,
  className,
  customComponent,
}: IToastProps) => {
  const { close } = useToastContext()
  // sometimes message is react node array. Not handle it.
  if (typeof message !== 'string')
    return null

  return <div className={classNames(
    className,
    'fixed z-[9999] mx-8 my-4 w-[360px] grow overflow-hidden rounded-xl',
    size === 'md' ? 'p-3' : 'p-2',
    'border border-components-panel-border-subtle bg-components-panel-bg-blur shadow-sm',
    'top-0',
    'right-0',
  )}>
    <div className={`absolute inset-0 -z-10 opacity-40 ${
      (type === 'success' && 'bg-toast-success-bg')
      || (type === 'warning' && 'bg-toast-warning-bg')
      || (type === 'error' && 'bg-toast-error-bg')
      || (type === 'info' && 'bg-toast-info-bg')
    }`}
    />
    <div className={`flex ${size === 'md' ? 'gap-1' : 'gap-0.5'}`}>
      <div className={`flex items-center justify-center ${size === 'md' ? 'p-0.5' : 'p-1'}`}>
        {type === 'success' && <RiCheckboxCircleFill className={`${size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} text-text-success`} aria-hidden="true" />}
        {type === 'error' && <RiErrorWarningFill className={`${size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} text-text-destructive`} aria-hidden="true" />}
        {type === 'warning' && <RiAlertFill className={`${size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} text-text-warning-secondary`} aria-hidden="true" />}
        {type === 'info' && <RiInformation2Fill className={`${size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} text-text-accent`} aria-hidden="true" />}
      </div>
      <div className={`flex py-1 ${size === 'md' ? 'px-1' : 'px-0.5'} grow flex-col items-start gap-1`}>
        <div className='flex items-center gap-1'>
          <div className='system-sm-semibold text-text-primary [word-break:break-word]'>{message}</div>
          {customComponent}
        </div>
        {children && <div className='system-xs-regular text-text-secondary'>
          {children}
        </div>
        }
      </div>
      {close
        && (<ActionButton className='z-[1000]' onClick={close}>
          <RiCloseLine className='h-4 w-4 shrink-0 text-text-tertiary' />
        </ActionButton>)
      }
    </div>
  </div>
}

export const ToastProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const placeholder: IToastProps = {
    type: 'info',
    message: 'Toast message',
    duration: 6000,
  }
  const [params, setParams] = React.useState<IToastProps>(placeholder)
  const defaultDuring = (params.type === 'success' || params.type === 'info') ? 3000 : 6000
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        setMounted(false)
      }, params.duration || defaultDuring)
    }
  }, [defaultDuring, mounted, params.duration])

  return <ToastContext.Provider value={{
    notify: (props) => {
      setMounted(true)
      setParams(props)
    },
    close: () => setMounted(false),
  }}>
    {mounted && <Toast {...params} />}
    {children}
  </ToastContext.Provider>
}

Toast.notify = ({
  type,
  size = 'md',
  message,
  duration,
  className,
  customComponent,
  onClose,
}: Pick<IToastProps, 'type' | 'size' | 'message' | 'duration' | 'className' | 'customComponent' | 'onClose'>) => {
  const defaultDuring = (type === 'success' || type === 'info') ? 3000 : 6000
  if (typeof window === 'object') {
    const holder = document.createElement('div')
    const root = createRoot(holder)

    root.render(
      <ToastContext.Provider value={{
        notify: noop,
        close: () => {
          if (holder) {
            root.unmount()
            holder.remove()
          }
          onClose?.()
        },
      }}>
        <Toast type={type} size={size} message={message} duration={duration} className={className} customComponent={customComponent} />
      </ToastContext.Provider>,
    )
    document.body.appendChild(holder)
    setTimeout(() => {
      if (holder) {
        root.unmount()
        holder.remove()
      }
      onClose?.()
    }, duration || defaultDuring)
  }
}

export default Toast
