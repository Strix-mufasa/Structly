import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { formatHours } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DashboardClient from '@/components/employee/DashboardClient'

export default async function EmployeeDashboardPage() {
  const session = await auth(); if (!session) return null
  const now = new Date()
  const [todayEntries, weekEntries] = await Promise.all([
    prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfDay(now), lte: endOfDay(now) } }, include: { task: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfWeek(now,{weekStartsOn:1}), lte: endOfWeek(now,{weekStartsOn:1}) } }, select: { hours: true, date: true } }),
  ])
  const todayHours = todayEntries.reduce((s,e) => s + Number(e.hours), 0)
  const weekHours = weekEntries.reduce((s,e) => s + Number(e.hours), 0)
  const daysLogged = new Set(weekEntries.map(e => format(e.date,'yyyy-MM-dd'))).size
  const firstName = session.user.name?.split(' ')[0]
  const hour = new Date().getHours()

  return (
    <DashboardClient
      firstName={firstName || ''}
      hour={hour}
      todayHours={todayHours}
      weekHours={weekHours}
      daysLogged={daysLogged}
      todayEntries={todayEntries.map(e => ({ id: e.id, taskName: e.task.name, hours: Number(e.hours) }))}
      dateStr={format(now,'EEEE, d MMMM')}
    />
  )
}