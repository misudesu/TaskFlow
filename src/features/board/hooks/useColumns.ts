"use client"

import { useState, useCallback } from 'react'
import { createColumn, updateColumn, deleteColumn } from '../api'
import type { Column } from '../types'

interface UseColumnsOptions {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const useColumns = (options?: UseColumnsOptions) => {
  const [isLoading, setIsLoading] = useState(false)

  const addColumn = useCallback(async (
    title: string,
    boardId: string,
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    setIsLoading(true)
    try {
      const column = await createColumn({ title, boardId })
      setColumns(prev => [...prev, column])
      options?.onSuccess?.('Column created')
      return column
    } catch (err) {
      options?.onError?.(err instanceof Error ? err.message : 'Failed to create column')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const editColumn = useCallback(async (
    id: string,
    data: { title?: string; position?: number },
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    setIsLoading(true)
    try {
      const updated = await updateColumn(id, data)
      setColumns(prev => prev.map(col => col.id === id ? { ...col, ...updated } : col))
      options?.onSuccess?.('Column updated')
      return updated
    } catch (err) {
      options?.onError?.(err instanceof Error ? err.message : 'Failed to update column')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const removeColumn = useCallback(async (
    id: string,
    columns: Column[],
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  ) => {
    const previousColumns = [...columns]
    setColumns(prev => prev.filter(col => col.id !== id))
    try {
      await deleteColumn(id)
      options?.onSuccess?.('Column deleted')
    } catch (err) {
      setColumns(previousColumns)
      options?.onError?.(err instanceof Error ? err.message : 'Failed to delete column')
    }
  }, [options])

  return { addColumn, editColumn, removeColumn, isLoading }
}

export { useColumns }
