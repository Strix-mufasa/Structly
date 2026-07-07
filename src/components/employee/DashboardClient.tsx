'use client'
import { useLang } from '@/lib/LanguageContext'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatHours } from '@/lib/utils'

interface TodayEntry {
  id: string
  taskName: string
  hours: number
  comment: string
}

interface RecentActivity {
  id: string
  date: string
  taskName: string
  hours: number
  comment: string
}

interface WeekDay {
  dateStr: string
  dayLabel: string
  dayNum: string
  hours: number
  isToday: boolean
}

interface Props {
  firstName: string
  hour: number
  todayHours: number
  weekHours: number
  daysLogged: number
  todayEntries: TodayEntry[]
  recentActivity: RecentActivity[]
  weekDays: WeekDay[]
  dateStr: string
}

export default function DashboardClient({ firstName, hour, todayHours, weekHours, daysLogged, todayEntries, recentActivity, weekDays, dateStr }: Props) {
  const { t } = useLang()
  const greeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening

  const stats = [
    { value: formatHours(todayHours), caption: 'Hours Logged Today', border: 'border-l-blue-500' },
    { value: formatHours(weekHours), caption: 'This Week Total', border: 'border-l-green-500' },
    { value: String(daysLogged), caption: 'Days logged This Week', border: 'border-l-orange-500' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr} · Here's your day at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ value, caption, border }) => (
          <Card key={caption} className={`border-l-4 ${border}`}>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div>
          {/* Today Entries */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">
              {t.todayEntries} <span className="text-muted-foreground font-normal">· {todayEntries.length} entries</span>
            </h2>
            <Link href="/log">
              <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> {t.add}</Button>
            </Link>
          </div>

          {todayEntries.length === 0 ? (
            <Card className="mb-6">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground text-sm">No entries today. Add your first entry!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="mb-6 space-y-2.5">
              {todayEntries.map(entry => (
                <Card key={entry.id}>
                  <CardContent className="py-3.5 px-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{entry.taskName}</p>
                      {entry.comment && <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.comment}</p>}
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">{formatHours(entry.hours)} hrs</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Activity */}
          <h2 className="font-semibold text-sm mb-3">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">No activity yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-[100px_1fr_70px_1fr] gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Date</span>
                <span>Task</span>
                <span>Hours</span>
                <span>Comment</span>
              </div>
              {recentActivity.map((entry, idx) => (
                <div key={entry.id} className={`grid grid-cols-[100px_1fr_70px_1fr] gap-3 px-4 py-3 border-b border-border last:border-0 text-sm items-center ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <span className="text-muted-foreground">{entry.date}</span>
                  <span className="font-medium truncate">{entry.taskName}</span>
                  <span className="font-semibold text-primary">{formatHours(entry.hours)}</span>
                  <span className="text-muted-foreground truncate">{entry.comment || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* This Week strip */}
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <h3 className="text-sm font-semibold mb-3">This Week</h3>
              <div className="grid grid-cols-3 gap-2">
                {weekDays.map(day => (
                  <div
                    key={day.dateStr}
                    className={`rounded-xl border p-2 text-center ${day.isToday ? 'bg-primary text-white border-primary' : 'border-border'}`}
                  >
                    <p className={`text-[11px] font-medium ${day.isToday ? 'text-white/80' : 'text-muted-foreground'}`}>{day.dayLabel}</p>
                    <p className="text-sm font-bold">{day.dayNum}</p>
                    <p className={`text-[11px] ${day.isToday ? 'text-white/90' : day.hours > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {day.hours > 0 ? formatHours(day.hours) : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <h2 className="font-semibold text-sm mb-3">{t.quickActions}</h2>
              <Link href="/log">
                <Button className="w-full mb-2.5">{t.logTimeAction}</Button>
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                {/* <Link href="/week">
                  <Button variant="outline" className="w-full">{t.viewThisWeek}</Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline" className="w-full">{t.viewHistory}</Button>
                </Link> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}