import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const [totalActiveUsers, totalActiveTasks, weekAgg] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE', role: 'EMPLOYEE' } }),
    prisma.task.count({ where: { status: 'ACTIVE' } }),
    prisma.timeEntry.aggregate({
      where: { date: { gte: weekStart, lte: weekEnd } },
      _count: true,
      _sum: { hours: true },
    }),
  ])

  return NextResponse.json({
    totalActiveUsers,
    totalActiveTasks,
    entriesThisWeek: weekAgg._count,
    hoursThisWeek: Number(weekAgg._sum.hours ?? 0),
  })
}
