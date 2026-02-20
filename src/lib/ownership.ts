import { db } from '@/lib/db'

const verifyBoardOwnership = async (boardId: string, userId: string) => {
  const board = await db.board.findUnique({
    where: { id: boardId },
  })
  if (!board || board.userId !== userId) return null
  return board
}

const verifyColumnOwnership = async (columnId: string, userId: string) => {
  const column = await db.column.findUnique({
    where: { id: columnId },
    include: { board: { select: { userId: true } } },
  })
  if (!column || column.board.userId !== userId) return null
  return column
}

const verifyTaskOwnership = async (taskId: string, userId: string) => {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { column: { include: { board: { select: { userId: true } } } } },
  })
  if (!task || task.column.board.userId !== userId) return null
  return task
}

export { verifyBoardOwnership, verifyColumnOwnership, verifyTaskOwnership }
