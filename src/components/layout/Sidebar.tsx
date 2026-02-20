"use client"

import { LayoutDashboard, Calendar, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Logo } from './Logo'
import { NavItem } from './NavItem'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Board', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 bg-[#1A1A2E]/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4">
        <Logo collapsed={collapsed} />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map(item => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2 p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'px-3')}>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </aside>
  )
}

export { Sidebar }
