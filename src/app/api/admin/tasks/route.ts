import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { name, status } = await req.json()

    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 })
    }

    const existing = await prisma.task.findUnique({
      where: { name: name.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'NAME_EXISTS' }, { status: 409 })
    }

    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error('[admin/tasks POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
