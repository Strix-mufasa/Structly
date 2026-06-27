import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { name, status } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 })
      }
      data.name = name.trim()
    }
    if (status !== undefined && ['ACTIVE', 'INACTIVE'].includes(status)) {
      data.status = status
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(task)
  } catch (err) {
    console.error('[admin/tasks PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
