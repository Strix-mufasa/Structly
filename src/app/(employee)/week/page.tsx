'use client'
import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isFuture, addWeeks, subWeeks } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import { formatHours } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/LanguageContext'

export default function WeekPage() {
  const { t, lang } = useLang()
  const dateLocale = lang === 'sv' ? sv : enUS
  const DAY_LABELS = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun]
  const [weekBase, setWeekBase] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(),'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)
  const weekStart = startOfWeek(weekBase,{weekStartsOn:1})
  const weekEnd = endOfWeek(weekBase,{weekStartsOn:1})
  const days = eachDayOfInterval({start:weekStart,end:weekEnd})
  useEffect(() => { setLoading(true); fetch(`/api/entries?weekOf=${format(weekBase,'yyyy-MM-dd')}`).then(r=>r.json()).then(d=>{setEntries(d);setLoading(false)}) },[weekBase])
  function hoursForDay(date: Date) { const key=format(date,'yyyy-MM-dd'); return entries.filter(e=>e.date.startsWith(key)).reduce((s,e)=>s+Number(e.hours),0) }
  const selectedEntries = entries.filter(e=>e.date.startsWith(selectedDate))
  const totalWeekHours = entries.reduce((s,e)=>s+Number(e.hours),0)
  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">{t.thisWeekTitle}</h1><p className="text-muted-foreground text-sm mt-0.5">{formatHours(totalWeekHours)} {t.totalLabel}</p></div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={()=>setWeekBase(d=>subWeeks(d,1))} className="flex h-9 w-9 items-center justify-center rounded-xl border hover:bg-accent transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-medium">{format(weekStart,'d MMM',{locale:dateLocale})} - {format(weekEnd,'d MMM yyyy',{locale:dateLocale})}</span>
        <button onClick={()=>setWeekBase(d=>addWeeks(d,1))} disabled={isFuture(addWeeks(weekStart,1))} className="flex h-9 w-9 items-center justify-center rounded-xl border hover:bg-accent transition-colors disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {days.map((day,i)=>{
          const key=format(day,'yyyy-MM-dd'); const hours=hoursForDay(day); const future=isFuture(day)&&!isToday(day); const selected=selectedDate===key; const today=isToday(day)
          return <button key={key} onClick={()=>!future&&setSelectedDate(key)} disabled={future} className={cn('flex flex-col items-center justify-center rounded-2xl py-3 px-1 transition-all',selected?'bg-brand text-white shadow-sm':today?'bg-brand/10 text-brand':'bg-card border border-border',future&&'opacity-30 cursor-not-allowed')}>
            <span className="text-[10px] font-medium uppercase">{DAY_LABELS[i]}</span>
            <span className="text-base font-bold mt-0.5">{format(day,'d')}</span>
            <span className={cn('text-[10px] mt-1',selected?'text-white/80':'text-muted-foreground')}>{hours>0?formatHours(hours):'--'}</span>
          </button>
        })}
      </div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">{format(new Date(selectedDate+'T12:00:00'),'EEEE, d MMMM',{locale:dateLocale})}</h2>
        <Link href={`/log?date=${selectedDate}`}><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> {t.add}</Button></Link>
      </div>
      {loading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}</div>
      : selectedEntries.length === 0 ? <Card><CardContent className="py-10 text-center"><p className="text-sm text-muted-foreground mb-3">{t.noEntriesForDay}</p><Link href={`/log?date=${selectedDate}`}><Button size="sm">{t.logTimeAction}</Button></Link></CardContent></Card>
      : <div className="space-y-3">{selectedEntries.map(entry=><Card key={entry.id}><CardContent className="py-4 px-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm font-semibold truncate">{entry.task.name}</p>{entry.comment&&<p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.comment}</p>}</div><span className="text-lg font-bold text-brand ml-4 shrink-0">{formatHours(Number(entry.hours))}</span></CardContent></Card>)}</div>}
    </div>
  )
}