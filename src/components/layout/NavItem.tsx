"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  collapsed?: boolean
}

const NavItem = ({ href, label, icon: Icon, collapsed }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
        isActive
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      )}
    >
      <Icon size={20} />
      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </Link>
  )
}

export { NavItem }
