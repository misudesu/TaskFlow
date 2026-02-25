import type { Task, Column } from './types'
import type { ApiResponse } from '@/types/global'

// ==================== TASK API ====================

const createTask = async (data: {
  title: string
  columnId: string
  description?: string
  priority?: string
  dueDate?: string | null
}): Promise<Task> => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create task')
  }
  const json: ApiResponse<Task> = await res.json()
  return json.data
}

const updateTask = async (id: string, data: Partial<{
  title: string
  description: string | null
  priority: string
  dueDate: string | null
  columnId: string
  position: number
}>): Promise<Task> => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update task')
  }
  const json: ApiResponse<Task> = await res.json()
  return json.data
}

const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete task')
  }
}

// ==================== COLUMN API ====================

const createColumn = async (data: {
  title: string
  boardId: string
}): Promise<Column> => {
  const res = await fetch('/api/columns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create column')
  }
  const json: ApiResponse<Column> = await res.json()
  return json.data
}

const updateColumn = async (id: string, data: Partial<{
  title: string
  position: number
}>): Promise<Column> => {
  const res = await fetch(`/api/columns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update column')
  }
  const json: ApiResponse<Column> = await res.json()
  return json.data
}

const deleteColumn = async (id: string): Promise<void> => {
  const res = await fetch(`/api/columns/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete column')
  }
}

// ==================== REORDER API ====================

const reorderBoard = async (data: {
  boardId: string
  columns?: { id: string; position: number }[]
  tasks?: { id: string; position: number; columnId?: string }[]
}): Promise<void> => {
  const res = await fetch('/api/boards/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to reorder')
  }
}

export {
  createTask, updateTask, deleteTask,
  createColumn, updateColumn, deleteColumn,
  reorderBoard,
}
