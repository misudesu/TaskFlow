"use client"

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/hooks/useToast'

const toastStyles: Record<ToastType['type'], string> = {
  success: 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/15 border border-red-500/20 text-red-400',
  info: 'bg-blue-500/15 border border-blue-500/20 text-blue-400',
}

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg flex items-center gap-2 text-sm',
            toastStyles[toast.type]
          )}
        >
          <span>{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="ml-2 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export { ToastContainer }
