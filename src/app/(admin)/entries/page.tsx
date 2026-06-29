import { prisma } from '@/lib/prisma'
import { formatDate, formatHours } from '@/lib/utils'
import EntriesClient from './EntriesClient'

export default async function EntriesPage() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: { date: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      task: { select: { name: true } }
    }
  })

  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0)

  const data = entries.map(e => ({
    id: e.id,
    userName: e.user.name,
    userEmail: e.user.email,
    taskName: e.task.name,
    date: formatDate(e.date),
    hours: formatHours(Number(e.hours)),
    comment: e.comment || null,
  }))

  return <EntriesClient entries={data} totalHours={formatHours(totalHours)} />
}