"use client"

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Task, NewTask } from '../types'
import type { Priority } from '@/types/global'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NewTask | Partial<Task>) => Promise<void>
  task?: Task | null
  columnId: string
  isLoading?: boolean
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const TaskModal = ({ isOpen, onClose, onSubmit, task, columnId, isLoading }: TaskModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')

  const isEditMode = !!task

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority as Priority)
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (isEditMode) {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority: priority as Priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
    } else {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as Priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        columnId,
      } as NewTask)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-desc" className="text-xs font-medium text-slate-400">
            Description
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 resize-none"
          />
        </div>
        <Select
          id="task-priority"
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        />
        <Input
          id="task-duedate"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex items-center gap-2 justify-end mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditMode ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { TaskModal }
