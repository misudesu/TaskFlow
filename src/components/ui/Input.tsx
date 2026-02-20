"use client"

import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = ({ label, className, id, ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100',
          'placeholder:text-slate-500',
          'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
