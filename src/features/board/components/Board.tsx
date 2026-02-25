"use client"

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useBoard } from '../hooks/useBoard'
import { Column } from './Column'
import { TaskModal } from './TaskModal'
import { AddColumnButton } from './AddColumnButton'
import { ToastContainer } from '@/components/ui/Toast'
import type { Board as BoardType, Task, NewTask } from '../types'

interface BoardProps {
  initialBoard: BoardType
}

const Board = ({ initialBoard }: BoardProps) => {
  const {
    boardId,
    columns,
    setColumns,
    handleDragEnd,
    taskOps,
    columnOps,
    toasts,
    removeToast,
  } = useBoard(initialBoard)

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string>('')

  const handleAddTask = useCallback((columnId: string) => {
    setEditingTask(null)
    setActiveColumnId(columnId)
    setIsTaskModalOpen(true)
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setActiveColumnId(task.columnId)
    setIsTaskModalOpen(true)
  }, [])

  const handleDeleteTask = useCallback((id: string) => {
    taskOps.removeTask(id, columns, setColumns)
  }, [taskOps, columns, setColumns])

  const handleTaskSubmit = useCallback(async (data: NewTask | Partial<Task>) => {
    if (editingTask) {
      await taskOps.editTask(editingTask.id, data as Partial<Task>, setColumns)
    } else {
      await taskOps.addTask(data as NewTask, columns, setColumns)
    }
  }, [editingTask, taskOps, columns, setColumns])

  const handleAddColumn = useCallback((title: string) => {
    columnOps.addColumn(title, boardId, setColumns)
  }, [columnOps, boardId, setColumns])

  const handleEditColumn = useCallback((id: string, title: string) => {
    columnOps.editColumn(id, { title }, setColumns)
  }, [columnOps, setColumns])

  const handleDeleteColumn = useCallback((id: string) => {
    columnOps.removeColumn(id, columns, setColumns)
  }, [columnOps, columns, setColumns])

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-6 overflow-x-auto pb-4"
            >
              {columns.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  index={index}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
              {provided.placeholder}
              <AddColumnButton
                onAdd={handleAddColumn}
                isLoading={columnOps.isLoading}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        columnId={activeColumnId}
        isLoading={taskOps.isLoading}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

export { Board }
