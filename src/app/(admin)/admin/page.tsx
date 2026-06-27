import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { Users, ListTodo, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/index'
import { formatDate, formatHours } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  const stats = [
    { label: 'Active Employees', value: activeUsers, icon: Users, color: 'text-brand bg-brand/10' },
    { label: 'Active Tasks', value: activeTasks, icon: ListTodo, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Entries This Week', value: weekEntries._count, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Hours This Week', value: formatHours(Number(weekEntries._sum.hours ?? 0)), icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ]
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground mt-1">Welcome back, {session?.user.name?.split(' ')[0]}</p></div>
        <div className="flex gap-3">
          <Link href="/tasks"><Button variant="outline" size="sm">+ Add Task</Button></Link>
          <Link href="/users/new"><Button size="sm">+ Add User</Button></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}><Icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </CardContent></Card>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h2 className="font-semibold">Recent Time Entries</h2><Link href="/entries" className="text-sm text-brand hover:underline">View all</Link></div>
        {recentEntries.length === 0 ? (
          <CardContent className="py-12 text-center text-muted-foreground text-sm">No entries yet.</CardContent>
        ) : (
          <div className="divide-y divide-border">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0"><p className="text-sm font-medium truncate">{entry.user.name}</p><p className="text-xs text-muted-foreground truncate">{entry.task.name}</p></div>
                <div className="text-right shrink-0 ml-4"><p className="text-sm font-semibold">{formatHours(Number(entry.hours))}</p><p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

