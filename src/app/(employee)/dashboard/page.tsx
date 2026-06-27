// import { auth } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
// import { formatHours } from '@/lib/utils'
// import { Card, CardContent } from '@/components/ui/index'
// import { Button } from '@/components/ui/button'
// import Link from 'next/link'
// import { Plus } from 'lucide-react'

// export default async function EmployeeDashboardPage() {
//   const session = await auth(); if (!session) return null
//   const now = new Date()
//   const [todayEntries, weekEntries] = await Promise.all([
//     prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfDay(now), lte: endOfDay(now) } }, include: { task: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
//     prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfWeek(now,{weekStartsOn:1}), lte: endOfWeek(now,{weekStartsOn:1}) } }, select: { hours: true, date: true } }),
//   ])
//   const todayHours = todayEntries.reduce((s,e) => s + Number(e.hours), 0)
//   const weekHours = weekEntries.reduce((s,e) => s + Number(e.hours), 0)
//   const daysLogged = new Set(weekEntries.map(e => format(e.date,'yyyy-MM-dd'))).size
//   const firstName = session.user.name?.split(' ')[0]
//   const hour = new Date().getHours()
//   const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
//   return (
//     <div className="animate-fade-in">
//       <div className="mb-6"><p className="text-sm text-muted-foreground">{format(now,'EEEE, d MMMM')}</p><h1 className="text-2xl font-bold mt-0.5">{greeting}, {firstName}</h1></div>
//       <div className="grid grid-cols-3 gap-3 mb-6">
//         {[{label:'Today',value:formatHours(todayHours),sub:'hours logged'},{label:'This week',value:formatHours(weekHours),sub:'total hours'},{label:'Days logged',value:String(daysLogged),sub:'this week'}].map(({label,value,sub}) => (
//           <Card key={label}><CardContent className="pt-4 pb-4 px-4"><p className="text-xs text-muted-foreground mb-1">{label}</p><p className="text-xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">{sub}</p></CardContent></Card>
//         ))}
//       </div>
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="font-semibold text-sm">Today entries</h2>
//         <Link href="/log"><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></Link>
//       </div>
//       {todayEntries.length === 0 ? (
//         <Card><CardContent className="py-10 text-center"><p className="text-muted-foreground text-sm">No entries today. Add your first entry!</p></CardContent></Card>
//       ) : (
//         <div className="space-y-2">
//           {todayEntries.map((entry) => (
//             <Card key={entry.id}><CardContent className="py-3 px-4 flex items-center justify-between">
//               <p className="text-sm font-medium">{entry.task.name}</p>
//               <p className="text-sm font-semibold">{formatHours(Number(entry.hours))}</p>
//             </CardContent></Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { formatHours } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function EmployeeDashboardPage() {
  const session = await auth(); if (!session) return null
  const now = new Date()
  const [todayEntries, weekEntries] = await Promise.all([
    prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfDay(now), lte: endOfDay(now) } }, include: { task: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.timeEntry.findMany({ where: { userId: session.user.id, date: { gte: startOfWeek(now,{weekStartsOn:1}), lte: endOfWeek(now,{weekStartsOn:1}) } }, select: { hours: true, date: true } }),
  ])
  const todayHours = todayEntries.reduce((s,e) => s + Number(e.hours), 0)
  const weekHours = weekEntries.reduce((s,e) => s + Number(e.hours), 0)
  const daysLogged = new Set(weekEntries.map(e => format(e.date,'yyyy-MM-dd'))).size
  const firstName = session.user.name?.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Hours Logged Today', value: formatHours(todayHours), accent: 'border-l-blue-500' },
    { label: 'This Week Total', value: formatHours(weekHours), accent: 'border-l-emerald-500' },
    { label: 'Days logged This Week', value: String(daysLogged), accent: 'border-l-amber-500' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{format(now,'EEEE, d MMMM yyyy')} · Here's your day at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="pt-5 pb-5 px-5">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-base">
          Today's Entries <span className="text-muted-foreground font-normal text-sm">· {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}</span>
        </h2>
        <Link href="/log"><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></Link>
      </div>

      {todayEntries.length === 0 ? (
        <Card><CardContent className="py-10 text-center"><p className="text-muted-foreground text-sm">No entries today. Add your first entry!</p></CardContent></Card>
      ) : (
        <div className="space-y-2 mb-8">
          {todayEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-4 px-5 flex items-center justify-between">
                <p className="text-sm font-semibold">{entry.task.name}</p>
                <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                  {formatHours(Number(entry.hours))}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-semibold text-base mb-3">Quick Actions</h2>
        <Link href="/log" className="block mb-3">
          <Button className="w-full" size="lg">Log Time</Button>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/week"><Button variant="outline" className="w-full">View This Week</Button></Link>
          <Link href="/history"><Button variant="outline" className="w-full">View History</Button></Link>
        </div>
      </div>
    </div>
  )
}