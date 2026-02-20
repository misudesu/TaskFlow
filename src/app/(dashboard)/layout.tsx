"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) setCollapsed(JSON.parse(stored))
  }, [])

  const handleToggle = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-6 md:p-6 p-4 pb-20 md:pb-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

export { DashboardLayout as default }
