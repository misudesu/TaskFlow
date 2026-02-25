"use client"

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AddColumnButtonProps {
  onAdd: (title: string) => void
  isLoading?: boolean
}

const AddColumnButton = ({ onAdd, isLoading }: AddColumnButtonProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="min-w-[288px] w-72 h-fit bg-white/5 backdrop-blur-xl border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-200 cursor-pointer shrink-0"
      >
        <Plus size={18} /> Add Column
      </button>
    )
  }

  return (
    <div className="min-w-[288px] w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shrink-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Column title..."
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" type="submit" isLoading={isLoading} className="flex-1">
            Add
          </Button>
          <Button variant="icon" type="button" onClick={() => { setIsAdding(false); setTitle('') }}>
            <X size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
}

export { AddColumnButton }
