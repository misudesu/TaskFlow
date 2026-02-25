import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { verifyTaskOwnership, verifyColumnOwnership } from '@/lib/ownership'
import { NextResponse } from 'next/server'

const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low']

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const task = await verifyTaskOwnership(id, userId)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 403 })

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 })
      }
      updateData.priority = body.priority
    }
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.position !== undefined) updateData.position = body.position
    if (body.columnId !== undefined) {
      const targetColumn = await verifyColumnOwnership(body.columnId, userId)
      if (!targetColumn) return NextResponse.json({ error: 'Target column not found' }, { status: 403 })
      updateData.columnId = body.columnId
    }

    const data = await db.task.update({ where: { id }, data: updateData })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const task = await verifyTaskOwnership(id, userId)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 403 })

    await db.task.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
