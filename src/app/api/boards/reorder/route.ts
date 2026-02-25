import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

interface ReorderItem {
  id: string
  position: number
  columnId?: string
}

export const PATCH = async (req: Request) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { columns, tasks, boardId } = body as {
      boardId: string
      columns?: ReorderItem[]
      tasks?: ReorderItem[]
    }

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 })
    }

    const board = await db.board.findUnique({ where: { id: boardId } })
    if (!board || board.userId !== userId) {
      return NextResponse.json({ error: 'Board not found' }, { status: 403 })
    }

    const operations = []

    if (columns && columns.length > 0) {
      for (const col of columns) {
        operations.push(
          db.column.update({ where: { id: col.id }, data: { position: col.position } })
        )
      }
    }

    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const data: { position: number; columnId?: string } = { position: task.position }
        if (task.columnId) data.columnId = task.columnId
        operations.push(
          db.task.update({ where: { id: task.id }, data })
        )
      }
    }

    if (operations.length > 0) {
      await db.$transaction(operations)
    }

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
