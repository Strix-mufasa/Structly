'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea, Card, CardContent } from '@/components/ui/index'
import { useToast } from '@/components/ui/toaster'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

interface Task { id: string; name: string }
interface TodayEntry { id: string; task: { name: string }; hours: number; comment?: string }
interface Member { id: string; userId: string; role?: string; user: { id: string; name: string; email: string } }
interface Project { id: string; name: string; activities: Activity[]; zones: Zone[]; members: Member[] }
interface Activity { id: string; name: string; component: { id: string; name: string; code: string } }
interface Zone { id: string; name: string }

const titleMap: Record<string, string> = {
  siteManager: 'Site Manager',
  foreman: 'Foreman / Work Supervisor',
  projectManager: 'Project Manager',
  designManager: 'Design Manager / Engineering Lead',
  purchaser: 'Purchaser / Procurement Officer',
  financeManager: 'Finance Manager / CFO',
  byggYA: 'Construction Safety Officer (YA)',
  ueYA: 'Subcontractor Safety Officer (YA)',
}

export default function LogTimePage() {
  const { t } = useLang()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [todayEntries, setTodayEntries] = useState<TodayEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    comment: '',
    componentActivityId: '',
    activityId: '',
    zoneId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => {
      setProjects(d)
      if (d.length > 0) setSelectedProject(d[0])
    })
    fetch('/api/tasks').then(r => r.json()).then(setTasks)
    fetch('/api/entries?date=today').then(r => r.json()).then(setTodayEntries)
    fetch('/api/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.id || '')
      setJobTitle(titleMap[d.jobTitle] || d.jobTitle || '')
    })
  }, [])

  useEffect(() => {
    if (selectedProject && currentUserId) {
      const member = selectedProject.members?.find(m => m.userId === currentUserId)
      if (member?.role) {
        setJobTitle(titleMap[member.role] || member.role)
      }
    }
  }, [selectedProject, currentUserId])

  const totalToday = todayEntries.reduce((sum, e) => sum + e.hours, 0)
  const activities = selectedProject?.activities || []
  const zones = selectedProject?.zones || []

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function handleProjectChange(projectId: string) {
    const project = projects.find(p => p.id === projectId) || null
    setSelectedProject(project)
    setForm(f => ({ ...f, componentActivityId: '', activityId: '', zoneId: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.date) errs.date = t.errorDateRequired
    if (!form.hours) errs.hours = t.errorHoursRequired
    const h = parseFloat(form.hours)
    if (isNaN(h) || h <= 0) errs.hours = t.errorHoursInvalid
    if (h > 24) errs.hours = t.errorHoursMax
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.date,
        taskId: tasks[0]?.id || '',
        hours: h,
        comment: form.comment,
        activityId: form.activityId || undefined,
        zoneId: form.zoneId || undefined,
        projectId: selectedProject?.id || undefined,
      })
    })
    setLoading(false)
    if (res.ok) {
      const entry = await res.json()
      setTodayEntries(prev => [entry, ...prev])
      toast(`${t.entrySavedToast} ${format(new Date(form.date + 'T12:00:00'), 'dd MMM')}.`, 'success')
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), hours: '', comment: '', componentActivityId: '', activityId: '', zoneId: '' })
    } else {
      toast(t.entrySaveFailed, 'error')
    }
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.logTimeTitle}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{t.logTimeSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-1">New Time Entry</h2>
            <p className="text-xs text-muted-foreground mb-5">Fill in the details below and click Save Entry when done.</p>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Project */}
              {projects.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Project</Label>
                  <Select value={selectedProject?.id || ''} onValueChange={handleProjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Zone */}
              <div className="space-y-1.5">
                <Label>Zone</Label>
                <Select value={form.zoneId} onValueChange={v => set('zoneId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map(z => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Construction Component */}
              <div className="space-y-1.5">
                <Label>Construction Component</Label>
                <Select value={form.componentActivityId} onValueChange={v => set('componentActivityId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.component?.code} - {a.component?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              

              {/* Activity */}
              <div className="space-y-1.5">
                <Label>Activity</Label>
                <Select value={form.activityId} onValueChange={v => set('activityId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label>{t.dateLabel}</Label>
                <div className="relative">
                  <Input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')} error={errors.date} className="pl-10" />
                  <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Hours */}
              <div className="space-y-1.5">
                <Label>{t.hoursLabel}</Label>
                <Input type="number" inputMode="decimal" step="0.25" min="0.25" max="24"
                  placeholder={t.hoursPlaceholder} value={form.hours}
                  onChange={e => set('hours', e.target.value)} error={errors.hours} />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <Label>{t.commentLabel} <span className="text-muted-foreground font-normal">{t.commentOptional}</span></Label>
                <Textarea placeholder={t.commentPlaceholder} value={form.comment} onChange={e => set('comment', e.target.value)} />
              </div>

              <p className="text-xs text-muted-foreground">Hours must be between 0.25 and 24. Decimal values like 1.5 or 7.25 are supported.</p>

              <Button type="submit" fullWidth loading={loading} size="lg">{t.saveEntry}</Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold mb-1">Today's Entries</h3>
              <p className="text-xs text-muted-foreground mb-4">{format(new Date(), 'EEE dd MMM yyyy')}</p>
              {todayEntries.length === 0
                ? <p className="text-xs text-muted-foreground py-4 text-center">No entries today yet.</p>
                : (
                  <div className="space-y-3">
                    {todayEntries.map(entry => (
                      <div key={entry.id} className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{entry.task?.name}</p>
                          {entry.comment && <p className="text-xs text-muted-foreground mt-0.5">{entry.comment}</p>}
                        </div>
                        <span className="text-sm font-semibold text-primary shrink-0 ml-2">{entry.hours} hrs</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-end">
                      <span className="text-xs text-muted-foreground">Total today: <span className="font-semibold text-foreground">{totalToday.toFixed(1)} hrs</span></span>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold mb-3">Available Tasks</h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 transition-colors"
                    onClick={() => set('activityId', task.id)}>
                    <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
                    <span className="text-sm">{task.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}