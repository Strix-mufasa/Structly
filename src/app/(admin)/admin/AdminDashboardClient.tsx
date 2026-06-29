'use client'
import { Users, ListTodo, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/index'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/LanguageContext'

interface Props {
  firstName: string
  activeUsers: number
  activeTasks: number
  entriesThisWeek: number
  hoursThisWeek: string
  recentEntries: { id: string; userName: string; taskName: string; hours: string; date: string }[]
}

export default function AdminDashboardClient({
  firstName, activeUsers, activeTasks, entriesThisWeek, hoursThisWeek, recentEntries
}: Props) {
  const { t } = useLang()

  const stats = [
    { label: t.activeEmployees, value: activeUsers, icon: Users, color: 'text-brand bg-brand/10' },
    { label: t.activeTasks, value: activeTasks, icon: ListTodo, color: 'text-emerald-600 bg-emerald-50' },
    { label: t.entriesThisWeek, value: entriesThisWeek, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: t.hoursThisWeek, value: hoursThisWeek, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.adminDashboard}</h1>
          <p className="text-muted-foreground mt-1">{t.welcomeBack}, {firstName}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tasks"><Button variant="outline" size="sm">+ {t.addTask}</Button></Link>
          <Link href="/users/new"><Button size="sm">+ {t.addUser}</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">{t.recentTimeEntries}</h2>
          <Link href="/entries" className="text-sm text-brand hover:underline">{t.viewAll}</Link>
        </div>
        {recentEntries.length === 0 ? (
          <CardContent className="py-12 text-center text-muted-foreground text-sm">{t.noEntriesYet}</CardContent>
        ) : (
          <div className="divide-y divide-border">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{entry.userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.taskName}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold">{entry.hours}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}