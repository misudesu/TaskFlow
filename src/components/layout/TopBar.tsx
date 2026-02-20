"use client"

import { Menu } from 'lucide-react'

interface TopBarProps {
  title: string
  onMenuToggle?: () => void
  actions?: React.ReactNode
}

const TopBar = ({ title, onMenuToggle, actions }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

export { TopBar }
