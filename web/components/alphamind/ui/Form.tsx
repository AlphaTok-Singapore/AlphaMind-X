'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type FormProps = {
  children: React.ReactNode
} & React.FormHTMLAttributes<HTMLFormElement>

type FormFieldProps = {
  children: React.ReactNode
  className?: string
}

type FormLabelProps = {
  children: React.ReactNode
  required?: boolean
} & React.LabelHTMLAttributes<HTMLLabelElement>

type FormInputProps = {
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

type FormTextareaProps = {
  error?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

type FormSelectProps = {
  children: React.ReactNode
  error?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

type FormErrorProps = {
  message?: string
  className?: string
}

type FormDescriptionProps = {
  children: React.ReactNode
  className?: string
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('space-y-6', className)}
      {...props}
    />
  ),
)
Form.displayName = 'Form'

const FormField: React.FC<FormFieldProps> = ({ children, className }) => (
  <div className={cn('space-y-2', className)}>
    {children}
  </div>
)

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  ),
)
FormLabel.displayName = 'FormLabel'

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus-visible:ring-red-500',
        className,
      )}
      {...props}
    />
  ),
)
FormInput.displayName = 'FormInput'

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus-visible:ring-red-500',
        className,
      )}
      {...props}
    />
  ),
)
FormTextarea.displayName = 'FormTextarea'

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, children, error, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus-visible:ring-red-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
FormSelect.displayName = 'FormSelect'

const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null

  return (
    <p className={cn('text-sm text-red-500', className)}>
      {message}
    </p>
  )
}

const FormDescription: React.FC<FormDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-muted-foreground text-sm', className)}>
    {children}
  </p>
)

export {
  Form,
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
  FormDescription,
  type FormProps,
  type FormFieldProps,
  type FormLabelProps,
  type FormInputProps,
  type FormTextareaProps,
  type FormSelectProps,
  type FormErrorProps,
  type FormDescriptionProps,
}
