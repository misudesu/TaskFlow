"use client"

import { useState, useCallback } from 'react'
import type { DropResult } from '@hello-pangea/dnd'
import { reorderBoard } from '../api'
import { useTasks } from './useTasks'
import { useColumns } from './useColumns'
import { useToast } from '@/hooks/useToast'
import type { Board, Column } from '../types'

const useBoard = (initialBoard: Board) => {
  const [columns, setColumns] = useState<Column[]>(
    initialBoard.columns.map(col => ({
      ...col,
      tasks: [...col.tasks].sort((a, b) => a.position - b.position),
    }))
  )
  const [boardId] = useState(initialBoard.id)

  const { toasts, addToast, removeToast } = useToast()

  const taskOps = useTasks({
    onSuccess: (msg) => addToast(msg, 'success'),
    onError: (msg) => addToast(msg, 'error'),
  })

  const columnOps = useColumns({
    onSuccess: (msg) => addToast(msg, 'success'),
    onError: (msg) => addToast(msg, 'error'),
  })

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const previousColumns = columns.map(c => ({
      ...c,
      tasks: [...c.tasks],
    }))

    if (type === 'COLUMN') {
      const reordered = [...columns]
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      const withPositions = reordered.map((col, i) => ({ ...col, position: i }))
      setColumns(withPositions)

      try {
        await reorderBoard({
          boardId,
          columns: withPositions.map(c => ({ id: c.id, position: c.position })),
        })
      } catch {
        setColumns(previousColumns)
        addToast('Failed to reorder columns', 'error')
      }
      return
    }

    const sourceColId = source.droppableId
    const destColId = destination.droppableId

    if (sourceColId === destColId) {
      const col = columns.find(c => c.id === sourceColId)!
      const tasks = [...col.tasks]
      const [moved] = tasks.splice(source.index, 1)
      tasks.splice(destination.index, 0, moved)
      const withPositions = tasks.map((t, i) => ({ ...t, position: i }))

      setColumns(prev => prev.map(c =>
        c.id === sourceColId ? { ...c, tasks: withPositions } : c
      ))

      try {
        await reorderBoard({
          boardId,
          tasks: withPositions.map(t => ({ id: t.id, position: t.position })),
        })
      } catch {
        setColumns(previousColumns)
        addToast('Failed to reorder tasks', 'error')
      }
    } else {
      const sourceCol = columns.find(c => c.id === sourceColId)!
      const destCol = columns.find(c => c.id === destColId)!
      const sourceTasks = [...sourceCol.tasks]
      const destTasks = [...destCol.tasks]
      const [moved] = sourceTasks.splice(source.index, 1)
      moved.columnId = destColId
      destTasks.splice(destination.index, 0, moved)

      const sourceWithPos = sourceTasks.map((t, i) => ({ ...t, position: i }))
      const destWithPos = destTasks.map((t, i) => ({ ...t, position: i }))

      setColumns(prev => prev.map(c => {
        if (c.id === sourceColId) return { ...c, tasks: sourceWithPos }
        if (c.id === destColId) return { ...c, tasks: destWithPos }
        return c
      }))

      try {
        await reorderBoard({
          boardId,
          tasks: [
            ...sourceWithPos.map(t => ({ id: t.id, position: t.position })),
            ...destWithPos.map(t => ({ id: t.id, position: t.position, columnId: destColId })),
          ],
        })
      } catch {
        setColumns(previousColumns)
        addToast('Failed to move task', 'error')
      }
    }
  }, [columns, boardId, addToast])

  return {
    boardId,
    columns,
    setColumns,
    handleDragEnd,
    taskOps,
    columnOps,
    toasts,
    addToast,
    removeToast,
  }
}

export { useBoard }
