'use client'
import { Card } from '@/components/ui/index'
import { EmptyState } from '@/components/shared'
import { Clock } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

interface Entry {
  id: string
  userName: string
  userEmail: string
  taskName: string
  date: string
  hours: string
  comment: string | null
}

export default function EntriesClient({ entries, totalHours }: { entries: Entry[], totalHours: string }) {
  const { t } = useLang()

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t.adminTimeEntries}</h1>
        <p className="text-muted-foreground mt-1">
          {entries.length} {t.entriesThisWeek} · {totalHours} {t.totalLabel}
        </p>
      </div>

      <Card>
        {entries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={t.noEntriesYet}
            description="Entries will appear here once employees start logging their hours."
          />
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_80px_1fr] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>{t.nameCol}</span>
              <span>{t.taskLabel}</span>
              <span>{t.dateCol}</span>
              <span>{t.hoursLabel}</span>
              <span>{t.commentLabel}</span>
            </div>
            {entries.map(entry => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px_1fr] gap-1 md:gap-4 px-5 py-4 items-center">
                <div>
                  <p className="text-sm font-medium">{entry.userName}</p>
                  <p className="text-xs text-muted-foreground">{entry.userEmail}</p>
                </div>
                <p className="text-sm">{entry.taskName}</p>
                <p className="text-sm text-muted-foreground">{entry.date}</p>
                <p className="text-sm font-semibold text-brand">{entry.hours}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {entry.comment || t.noEntriesYet}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}