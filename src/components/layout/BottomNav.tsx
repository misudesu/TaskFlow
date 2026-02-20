"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Board', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A2E]/90 backdrop-blur-xl border-t border-white/10 h-16 flex justify-around items-center">
      {navItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1',
              isActive ? 'text-emerald-400' : 'text-slate-500'
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
      <div className="flex flex-col items-center gap-0.5 px-3 py-1">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </nav>
  )
}

export { BottomNav }
