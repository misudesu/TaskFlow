"use client"

import { TopBar } from '@/components/layout/TopBar'
import { Board } from '@/features/board/components/Board'
import type { Board as BoardType } from '@/features/board/types'

interface BoardPageProps {
  initialBoard: BoardType
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
        <Board initialBoard={initialBoard} />
      </div>
    </>
  )
}

export { BoardPage }
