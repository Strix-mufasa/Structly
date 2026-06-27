import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const taskId = searchParams.get('taskId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const where: Record<string, unknown> = {}
  if (userId) where.userId = userId
  if (taskId) where.taskId = taskId
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, Date>).gte = startOfDay(new Date(from))
    if (to) (where.date as Record<string, Date>).lte = endOfDay(new Date(to))
  }

  const [entries, total] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, name: true } },
      },
    }),
    prisma.timeEntry.count({ where }),
  ])

  return NextResponse.json({ entries, total, page, limit })
}
