'use client'
import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isFuture, addWeeks, subWeeks } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { formatHours } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/LanguageContext'

// Rounds to 2 decimals to eliminate floating-point drift (e.g. 12.030000000000001)
function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default function WeekPage() {
  const { t, lang } = useLang()
  const dateLocale = lang === 'sv' ? sv : enUS
  const DAY_LABELS = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun]
  const [weekBase, setWeekBase] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)
  const weekStart = startOfWeek(weekBase, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekBase, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    setLoading(true)
    fetch(`/api/entries?weekOf=${format(weekBase, 'yyyy-MM-dd')}`)
      .then(r => r.json())
      .then(d => { setEntries(d); setLoading(false) })
  }, [weekBase])

  function entriesForDay(date: Date) {
    const key = format(date, 'yyyy-MM-dd')
    return entries.filter(e => e.date.startsWith(key))
  }
  function hoursForDay(date: Date) {
    return round2(entriesForDay(date).reduce((s, e) => s + Number(e.hours), 0))
  }
  const totalWeekHours = round2(entries.reduce((s, e) => s + Number(e.hours), 0))
  const maxDayHours = Math.max(1, ...days.map(d => hoursForDay(d)))

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.thisWeekTitle}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Week of {format(weekStart, 'd MMM', { locale: dateLocale })} - {format(weekEnd, 'd MMM yyyy', { locale: dateLocale })}
          </p>
        </div>
        <div className="bg-primary text-white rounded-2xl px-5 py-3 text-center shrink-0">
          <p className="text-2xl font-bold leading-none">{formatHours(totalWeekHours)}</p>
          <p className="text-[11px] text-white/80 mt-1">Total hours this week</p>
        </div>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setWeekBase(d => subWeeks(d, 1))} className="text-sm font-medium text-primary hover:underline">
          ‹ Previous Week
        </button>
        <span className="text-sm font-semibold">
          {format(weekStart, 'd MMM', { locale: dateLocale })} - {format(weekEnd, 'd MMM yyyy', { locale: dateLocale })}
        </span>
        <button
          onClick={() => setWeekBase(d => addWeeks(d, 1))}
          disabled={isFuture(addWeeks(weekStart, 1))}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-30 disabled:no-underline"
        >
          Next Week ›
        </button>
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="flex-1 h-[420px] rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="flex gap-3 items-stretch">
          {days.map((day, i) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEntries = entriesForDay(day)
            const hours = hoursForDay(day)
            const future = isFuture(day) && !isToday(day)
            const selected = selectedDate === key

            if (selected) {
              return (
                <div key={key} className="flex-[2.2] bg-primary text-white rounded-2xl p-4 min-h-[420px] flex flex-col">
                  <p className="text-xs font-medium text-white/70 uppercase">{DAY_LABELS[i]}</p>
                  <p className="text-2xl font-bold">{format(day, 'd')}</p>
                  <p className="text-xs text-white/80 mt-1 mb-3">{hours > 0 ? `${formatHours(hours)} hrs` : '--'}</p>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {dayEntries.map(entry => (
                      <div key={entry.id} className="bg-white/15 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{entry.task.name}</span>
                        <span className="text-xs font-semibold shrink-0">{formatHours(Number(entry.hours))}h</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/log?date=${key}`} className="mt-3">
                    <button className="w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-xl py-2 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Add Entry
                    </button>
                  </Link>
                </div>
              )
            }

            return (
              <button
                key={key}
                onClick={() => !future && setSelectedDate(key)}
                disabled={future}
                className={cn(
                  'flex-1 min-h-[420px] rounded-2xl border border-border bg-card p-3 flex flex-col text-left transition-colors',
                  future ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/40'
                )}
              >
                <p className="text-xs font-medium text-muted-foreground uppercase">{DAY_LABELS[i]}</p>
                <p className="text-lg font-bold mt-0.5">{format(day, 'd')}</p>

                {hours > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-green-600">{formatHours(hours)} hrs</p>
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(100, (hours / maxDayHours) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1" />

                {!future && (
                  <Link
                    href={`/log?date=${key}`}
                    onClick={e => e.stopPropagation()}
                    className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Entry
                  </Link>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}