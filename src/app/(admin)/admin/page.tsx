import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { startOfWeek, endOfWeek } from 'date-fns'
import { formatDate, formatHours } from '@/lib/utils'
import AdminDashboardClient from './AdminDashboardClient'

async function getStats() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const [activeUsers, activeTasks, weekEntries, recentEntries] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE', role: 'EMPLOYEE' } }),
    prisma.task.count({ where: { status: 'ACTIVE' } }),
    prisma.timeEntry.aggregate({ where: { date: { gte: weekStart, lte: weekEnd } }, _count: true, _sum: { hours: true } }),
    prisma.timeEntry.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, task: { select: { name: true } } } }),
  ])
  return { activeUsers, activeTasks, weekEntries, recentEntries }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const { activeUsers, activeTasks, weekEntries, recentEntries } = await getStats()

  const entries = recentEntries.map(e => ({
    id: e.id,
    userName: e.user.name,
    taskName: e.task.name,
    hours: formatHours(Number(e.hours)),
    date: formatDate(e.date),
  }))

  return (
    <AdminDashboardClient
      firstName={session?.user.name?.split(' ')[0] ?? ''}
      activeUsers={activeUsers}
      activeTasks={activeTasks}
      entriesThisWeek={weekEntries._count}
      hoursThisWeek={formatHours(Number(weekEntries._sum.hours ?? 0))}
      recentEntries={entries}
    />
  )
}