"use client"

import { Draggable } from '@hello-pangea/dnd'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '../types'
import type { Priority } from '@/types/global'

interface TaskCardProps {
  task: Task
  index: number
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const TaskCard = ({ task, index, onEdit, onDelete }: TaskCardProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4',
            'hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-200 cursor-pointer',
            snapshot.isDragging
              ? 'scale-105 shadow-xl shadow-black/30 border-emerald-500/30'
              : 'shadow-lg shadow-black/20'
          )}
          onClick={() => onEdit(task)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-100 flex-1">{task.title}</p>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
              className="p-1 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all duration-200 shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {task.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Badge priority={task.priority as Priority} />
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

export { TaskCard }
