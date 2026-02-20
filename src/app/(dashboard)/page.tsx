import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { BoardPage } from './BoardPage'
import type { Board, Column, Task } from '@/features/board/types'
import type { Priority } from '@/types/global'

const serializeBoard = (board: Awaited<ReturnType<typeof getOrCreateBoard>>): Board => ({
  id: board.id,
  userId: board.userId,
  title: board.title,
  createdAt: board.createdAt.toISOString(),
  updatedAt: board.updatedAt.toISOString(),
  columns: board.columns.map((col): Column => ({
    id: col.id,
    boardId: col.boardId,
    title: col.title,
    position: col.position,
    tasks: col.tasks.map((task): Task => ({
      id: task.id,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      priority: task.priority as Priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      position: task.position,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  })),
})

const getOrCreateBoard = async (userId: string) => {
  let board = await db.board.findFirst({
    where: { userId },
    include: { columns: { include: { tasks: true }, orderBy: { position: 'asc' } } },
  })

  if (!board) {
    board = await db.board.create({
      data: {
        userId,
        title: 'My Board',
        columns: {
          create: [
            { title: 'To Do', position: 0 },
            { title: 'In Progress', position: 1 },
            { title: 'Done', position: 2 },
          ],
        },
      },
      include: { columns: { include: { tasks: true }, orderBy: { position: 'asc' } } },
    })
  }

  return board
}

const DashboardPage = async () => {
  const { userId } = await auth()
  if (!userId) return null

  const board = await getOrCreateBoard(userId)

  return <BoardPage initialBoard={serializeBoard(board)} />
}

export { DashboardPage as default }
