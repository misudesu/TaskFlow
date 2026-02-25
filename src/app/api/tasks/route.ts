import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { verifyColumnOwnership } from '@/lib/ownership'
import { NextResponse } from 'next/server'

const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low']

export const POST = async (req: Request) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, columnId, description, priority, dueDate } = body

    if (!title || !columnId) {
      return NextResponse.json({ error: 'Title and columnId are required' }, { status: 400 })
    }

    const column = await verifyColumnOwnership(columnId, userId)
    if (!column) return NextResponse.json({ error: 'Column not found' }, { status: 403 })

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 })
    }

    const taskCount = await db.task.count({ where: { columnId } })

    const data = await db.task.create({
      data: {
        title,
        columnId,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        position: taskCount,
      },
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
