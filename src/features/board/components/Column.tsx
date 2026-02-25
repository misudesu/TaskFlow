"use client"

import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType, Task } from '../types'

interface ColumnProps {
  column: ColumnType
  index: number
  onAddTask: (columnId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onEditColumn: (id: string, title: string) => void
  onDeleteColumn: (id: string) => void
}

const Column = ({
  column,
  index,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
}: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onEditColumn(column.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <Draggable draggableId={`column-${column.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="min-w-[288px] w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 flex flex-col max-h-[calc(100vh-200px)] shrink-0"
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between p-4 border-b border-white/5"
          >
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="bg-transparent text-sm font-semibold text-slate-100 border-b border-emerald-500/50 focus:outline-none flex-1"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-semibold text-slate-100 flex-1">{column.title}</h3>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">{column.tasks.length}</span>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all duration-200"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-8 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1 z-20 min-w-[140px]">
                      <button
                        onClick={() => { setIsEditing(true); setShowMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={14} /> Rename
                      </button>
                      <button
                        onClick={() => { onDeleteColumn(column.id); setShowMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Task List (Droppable) */}
          <Droppable droppableId={column.id} type="TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[60px]',
                  snapshot.isDraggingOver && 'bg-emerald-500/5'
                )}
              >
                {column.tasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={idx}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Task Button */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={() => onAddTask(column.id)}
              className="w-full flex items-center justify-center gap-1.5 text-sm bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export { Column }
