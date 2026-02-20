"use client"

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20',
  secondary:
    'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-all duration-200',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl transition-all duration-200',
  icon: 'p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all duration-200',
}

const Button = ({ variant = 'primary', isLoading, children, className, disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(variantStyles[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  )
}

export { Button }
export type { ButtonVariant, ButtonProps }
