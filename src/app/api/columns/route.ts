import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { verifyBoardOwnership } from '@/lib/ownership'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, boardId } = body

    if (!title || !boardId) {
      return NextResponse.json({ error: 'Title and boardId are required' }, { status: 400 })
    }

    const board = await verifyBoardOwnership(boardId, userId)
    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 403 })

    const columnCount = await db.column.count({ where: { boardId } })

    const data = await db.column.create({
      data: { title, boardId, position: columnCount },
      include: { tasks: true },
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 })
  }
}
