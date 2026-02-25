import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { verifyColumnOwnership } from '@/lib/ownership'
import { NextResponse } from 'next/server'

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const column = await verifyColumnOwnership(id, userId)
    if (!column) return NextResponse.json({ error: 'Column not found' }, { status: 403 })

    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.position !== undefined) updateData.position = body.position

    const data = await db.column.update({
      where: { id },
      data: updateData,
      include: { tasks: { orderBy: { position: 'asc' } } },
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to update column' }, { status: 500 })
  }
}

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const column = await verifyColumnOwnership(id, userId)
    if (!column) return NextResponse.json({ error: 'Column not found' }, { status: 403 })

    await db.column.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete column' }, { status: 500 })
  }
}
