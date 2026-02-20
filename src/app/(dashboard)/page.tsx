import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { BoardPage } from './BoardPage'

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

  return <BoardPage initialBoard={board} />
}

export { DashboardPage as default }
