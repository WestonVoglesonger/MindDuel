import { useState, useCallback } from 'react'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  variant?: 'default' | 'destructive'
}

export interface Toast extends ToastOptions {
  id: string
  timestamp: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, duration = 3000, variant = 'default' }: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      title,
      description,
      duration,
      variant,
      timestamp: Date.now()
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}

// Export a standalone toast function for convenience
export const toast = ({ title, description, duration = 3000, variant = 'default' }: ToastOptions) => {
  // For now, use browser alert since we don't have a proper toast system yet
  // In a real implementation, this would be connected to a toast provider
  const message = `${title || 'Notification'}\n${description || ''}`
  alert(message)
}
