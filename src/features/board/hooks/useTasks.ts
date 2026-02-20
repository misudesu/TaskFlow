"use client"

import { useState, useCallback } from 'react'
import { createTask, updateTask, deleteTask } from '../api'
import type { Task, NewTask, Column } from '../types'

interface UseTasksOptions {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const useTasks = (options?: UseTasksOptions) => {
  const [isLoading, setIsLoading] = useState(false)

  const addTask = useCallback(async (
    data: NewTask,
    columns: Column[],
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    setIsLoading(true)
    try {
      const task = await createTask({
        title: data.title,
        columnId: data.columnId,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      })
      setColumns(prev => prev.map(col =>
        col.id === data.columnId
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      ))
      options?.onSuccess?.('Task created')
      return task
    } catch (err) {
      options?.onError?.(err instanceof Error ? err.message : 'Failed to create task')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const editTask = useCallback(async (
    id: string,
    data: Partial<Task>,
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    setIsLoading(true)
    try {
      const updated = await updateTask(id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        columnId: data.columnId,
        position: data.position,
      })
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === id ? { ...t, ...updated } : t),
      })))
      options?.onSuccess?.('Task updated')
      return updated
    } catch (err) {
      options?.onError?.(err instanceof Error ? err.message : 'Failed to update task')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const removeTask = useCallback(async (
    id: string,
    columns: Column[],
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    const previousColumns = columns.map(c => ({ ...c, tasks: [...c.tasks] }))
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== id),
    })))
    try {
      await deleteTask(id)
      options?.onSuccess?.('Task deleted')
    } catch (err) {
      setColumns(previousColumns)
      options?.onError?.(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }, [options])

  return { addTask, editTask, removeTask, isLoading }
}

export { useTasks }
