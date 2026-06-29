'use client'
import { useLang } from '@/lib/LanguageContext'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatHours } from '@/lib/utils'

interface Props {
  firstName: string
  hour: number
  todayHours: number
  weekHours: number
  daysLogged: number
  todayEntries: { id: string; taskName: string; hours: number }[]
  dateStr: string
}

export default function DashboardClient({ firstName, hour, todayHours, weekHours, daysLogged, todayEntries, dateStr }: Props) {
  const { t } = useLang()
  const greeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening

  const stats = [
    { label: t.hoursLogged, value: formatHours(todayHours), sub: 'Today', border: 'border-l-blue-500' },
    { label: t.totalHours, value: formatHours(weekHours), sub: 'This Week', border: 'border-l-green-500' },
    { label: t.thisWeekSub, value: String(daysLogged), sub: 'Days Logged', border: 'border-l-orange-500' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr} · Here's your day at a glance</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, sub, border }) => (
          <Card key={label} className={`border-l-4 ${border}`}>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
        <div className="space-y-2 mb-6">
          {todayEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <p className="text-sm font-medium">{entry.taskName}</p>
                <p className="text-sm font-semibold">{formatHours(entry.hours)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    <div>
        <h2 className="font-semibold text-sm mb-3">{t.quickActions}</h2>
        <Link href="/log">
            <Button className="w-full mb-3">{t.logTimeAction}</Button>
        </Link>
        <div className="grid grid-cols-2 gap-3">
            <Link href="/week">
            <Button variant="outline" className="w-full">{t.viewThisWeek}</Button>
            </Link>
            <Link href="/history">
            <Button variant="outline" className="w-full">{t.viewHistory}</Button>
            </Link>
        </div>
    </div>
      </div>
    
  )
}