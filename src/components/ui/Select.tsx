"use client"

import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

const Select = ({ label, options, className, id, ...props }: SelectProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100',
          'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#1A1A2E]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { Select }
