import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format } from 'date-fns'
import DashboardClient from '@/components/employee/DashboardClient'

// Rounds to 2 decimals to eliminate floating-point drift (e.g. 12.030000000000001)
function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default async function EmployeeDashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const [todayEntries, weekEntries, recentActivity] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { userId: session.user.id, date: { gte: startOfDay(now), lte: endOfDay(now) } },
      include: { task: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.timeEntry.findMany({
      where: { userId: session.user.id, date: { gte: weekStart, lte: weekEnd } },
      select: { hours: true, date: true }
    }),
    prisma.timeEntry.findMany({
      where: { userId: session.user.id },
      include: { task: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  const todayHours = round2(todayEntries.reduce((s, e) => s + Number(e.hours), 0))
  const weekHours = round2(weekEntries.reduce((s, e) => s + Number(e.hours), 0))
  const daysLogged = new Set(weekEntries.map(e => format(e.date, 'yyyy-MM-dd'))).size
  const firstName = session.user.name?.split(' ')[0]
  const hour = new Date().getHours()

  // Per-day breakdown for the "This Week" strip
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => {
    const dayHours = round2(
      weekEntries.filter(e => isSameDay(e.date, d)).reduce((s, e) => s + Number(e.hours), 0)
    )
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayLabel: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      hours: dayHours,
      isToday: isSameDay(d, now),
    }
  })

  return (
    <DashboardClient
      firstName={firstName || ''}
      hour={hour}
      todayHours={todayHours}
      weekHours={weekHours}
      daysLogged={daysLogged}
      todayEntries={todayEntries.map(e => ({
        id: e.id,
        taskName: e.task.name,
        hours: round2(Number(e.hours)),
        comment: e.comment || '',
      }))}
      recentActivity={recentActivity.map(e => ({
        id: e.id,
        date: format(e.date, 'd MMM yyyy'),
        taskName: e.task.name,
        hours: round2(Number(e.hours)),
        comment: e.comment || '',
      }))}
      weekDays={weekDays}
      dateStr={format(now, 'EEEE, d MMMM')}
    />
  )
}