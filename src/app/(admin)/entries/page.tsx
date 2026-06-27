import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/index'
import { EmptyState } from '@/components/shared'
import { Clock } from 'lucide-react'
import { formatDate, formatHours } from '@/lib/utils'
export default async function EntriesPage() {
  const entries = await prisma.timeEntry.findMany({ orderBy: { date: 'desc' }, take: 100, include: { user: { select: { name:true,email:true } }, task: { select: { name:true } } } })
  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0)
  return (
    <div className="animate-fade-in">
      <div className="mb-8"><h1 className="text-2xl font-bold">Time Entries</h1><p className="text-muted-foreground mt-1">{entries.length} entries · {formatHours(totalHours)} total</p></div>
      <Card>
        {entries.length === 0 ? <EmptyState icon={Clock} title="No time entries yet" description="Entries will appear here once employees start logging their hours." /> : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_80px_1fr] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Employee</span><span>Task</span><span>Date</span><span>Hours</span><span>Comment</span>
            </div>
            {entries.map(entry => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px_1fr] gap-1 md:gap-4 px-5 py-4 items-center">
                <div><p className="text-sm font-medium">{entry.user.name}</p><p className="text-xs text-muted-foreground">{entry.user.email}</p></div>
                <p className="text-sm">{entry.task.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                <p className="text-sm font-semibold text-brand">{formatHours(Number(entry.hours))}</p>
                <p className="text-sm text-muted-foreground truncate">{entry.comment || 'No comment'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

