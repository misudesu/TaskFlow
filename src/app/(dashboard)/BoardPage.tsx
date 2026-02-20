"use client"

import { TopBar } from '@/components/layout/TopBar'
import type { Board, Column, Task } from '@prisma/client'

interface BoardWithColumnsAndTasks extends Board {
  columns: (Column & { tasks: Task[] })[]
}

interface BoardPageProps {
  initialBoard: BoardWithColumnsAndTasks
}

const BoardPage = ({ initialBoard }: BoardPageProps) => {
  return (
    <>
      <TopBar title={initialBoard.title} />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{initialBoard.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {initialBoard.columns.length} columns
            </p>
          </div>
        </div>

        {/* Kanban columns placeholder */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {initialBoard.columns.map(column => (
            <div
              key={column.id}
              className="min-w-[288px] w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">{column.title}</h3>
                <span className="text-xs text-slate-500">{column.tasks.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-200 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-slate-100">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export { BoardPage }
