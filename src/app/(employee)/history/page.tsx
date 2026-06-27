import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/index'
import { EmptyState } from '@/components/shared'
import { History } from 'lucide-react'
import { formatDate, formatHours } from '@/lib/utils'
export default async function HistoryPage() {
  const session = await auth(); if (!session) return null
  const entries = await prisma.timeEntry.findMany({ where: { userId: session.user.id }, orderBy: { date: 'desc' }, take: 100, include: { task: { select: { name: true } } } })
  const grouped = new Map<string,typeof entries>()
  for (const entry of entries) { const key=format(entry.date,'yyyy-MM-dd'); if(!grouped.has(key))grouped.set(key,[]); grouped.get(key)!.push(entry) }
  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">History</h1><p className="text-muted-foreground text-sm mt-0.5">All your time entries</p></div>
      {grouped.size === 0 ? <Card><EmptyState icon={History} title="No entries yet" description="Use the Log Time screen to record your first hours." actionLabel="Log Time" actionHref="/app/log" /></Card> : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([dateKey,entries])=>{
            const dayTotal=entries.reduce((s,e)=>s+Number(e.hours),0)
            return <div key={dateKey}>
              <div className="flex items-center justify-between mb-2 px-1"><p className="text-sm font-semibold">{formatDate(new Date(dateKey+'T12:00:00'))}</p><p className="text-sm font-bold text-brand">{formatHours(dayTotal)}</p></div>
              <div className="space-y-2">{entries.map(entry=><Card key={entry.id}><CardContent className="py-3.5 px-4 flex items-center justify-between"><div className="min-w-0"><p className="text-sm font-medium truncate">{entry.task.name}</p>{entry.comment&&<p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.comment}</p>}<p className="text-[11px] text-muted-foreground/60 mt-1">{format(entry.createdAt,'HH:mm')}</p></div><span className="text-base font-bold text-brand ml-4 shrink-0">{formatHours(Number(entry.hours))}</span></CardContent></Card>)}</div>
            </div>
          })}
        </div>
      )}
    </div>
  )
}

