'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-20 left-0 right-0 z-[100] flex max-h-screen flex-col-reverse gap-2 px-4 pb-2',
      'sm:bottom-4 sm:right-4 sm:left-auto sm:w-[380px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

const toastVariants = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  type?: 'success' | 'error' | 'info'
}

function Toast({ open, onOpenChange, message, type = 'success' }: ToastProps) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : Info
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={3000}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
        toastVariants[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <ToastPrimitive.Description className="flex-1 text-sm font-medium">
        {message}
      </ToastPrimitive.Description>
      <ToastPrimitive.Close>
        <X className="h-4 w-4 opacity-60 hover:opacity-100" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

// Global toaster context
interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
  open: boolean
}

const ToastContext = React.createContext<{
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}>({ toast: () => {} })

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToastState>({ message: '', type: 'success', open: false })

  const toast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setState({ message, type, open: true })
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        <Toast
          open={state.open}
          onOpenChange={(open) => setState((s) => ({ ...s, open }))}
          message={state.message}
          type={state.type}
        />
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}

export function Toaster() {
  return null // handled by ToastContextProvider in layouts
}

