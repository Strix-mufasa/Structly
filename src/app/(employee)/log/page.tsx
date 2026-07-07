'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea, Card, CardContent } from '@/components/ui/index'
import { useToast } from '@/components/ui/toaster'
import { CalendarDays, AlertTriangle, MapPin } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

interface TodayEntry { id: string; task: { name: string }; hours: number; comment?: string; startTime?: string; endTime?: string }
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

const downtimeReasons = [
  'Waiting for materials',
  'Waiting for drawings/instructions',
  'Rework/corrections',
  'Machine error/breakdown',
  'Transport/movement',
  'Waiting for another professional group',
  'Weather/climate',
  'Lack of tools/equipment',
  'Meetings/administration',
  'Security incident/outage',
]

// Calculates hours between two "HH:mm" time strings. Returns 0 if invalid.
function calcHours(start: string, end: string): number {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some(n => isNaN(n))) return 0
  let diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) diff += 24 * 60 // handles overnight shifts
  return Math.round((diff / 60) * 100) / 100
}

// Formats "HH:mm" (24-hour) into "h:mm AM/PM" for display
function formatTime(time?: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return ''
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
}

export default function LogTimePage() {
  const { t } = useLang()
  const { toast } = useToast()
  const [todayEntries, setTodayEntries] = useState<TodayEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    wasteHours: '',
    downtimeReason: '',
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
  const showWasteSection = parseFloat(form.wasteHours) > 0
  const computedHours = calcHours(form.startTime, form.endTime)

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
    if (!form.startTime || !form.endTime) errs.hours = t.errorHoursRequired
    if (!form.activityId) errs.activityId = 'Please select an activity'
    const h = computedHours
    if (isNaN(h) || h <= 0) errs.hours = t.errorHoursInvalid
    if (h > 24) errs.hours = t.errorHoursMax
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.date,
        hours: h,
        startTime: form.startTime,
        endTime: form.endTime,
        comment: form.comment,
        activityId: form.activityId,
        zoneId: form.zoneId || undefined,
        projectId: selectedProject?.id || undefined,
        wastedHoursReason: showWasteSection ? `${form.wasteHours}h - ${form.downtimeReason}` : undefined,
      })
    })
    setLoading(false)
    if (res.ok) {
      const entry = await res.json()
      setTodayEntries(prev => [entry, ...prev])
      toast(`${t.entrySavedToast} ${format(new Date(form.date + 'T12:00:00'), 'dd MMM')}.`, 'success')
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '', endTime: '', wasteHours: '', downtimeReason: '', comment: '', componentActivityId: '', activityId: '', zoneId: '' })
    } else {
      toast(t.entrySaveFailed, 'error')
    }
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t.logTimeTitle}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{t.logTimeSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <Card>
          <CardContent className="pt-4">
            <h2 className="text-base font-semibold mb-0.5">New Time Entry</h2>
            <p className="text-xs text-muted-foreground mb-3">Fill in the details below and click Save Entry when done.</p>
            <form onSubmit={handleSubmit} className="space-y-3.5">

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
                      <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
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
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.activityId && <p className="text-xs text-red-500">{errors.activityId}</p>}
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

              {/* Start / End Time */}
              <div className="space-y-1.5">
                <Label>Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Start</label>
                    <Input type="time" value={form.startTime}
                      onChange={e => set('startTime', e.target.value)} error={errors.hours} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">End</label>
                    <Input type="time" value={form.endTime}
                      onChange={e => set('endTime', e.target.value)} error={errors.hours} />
                  </div>
                </div>
              </div>

              {/* Blue total-hours summary box */}
              {computedHours > 0 && (
                <div className="rounded-xl bg-primary text-white px-4 py-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{computedHours} Hrs will be logged</span>
                </div>
              )}

              {/* Waste Time */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600">Waste time <span className="text-red-400">(required)</span></span>
                  </div>
                  <span className="text-xs text-gray-400">Everyone reports</span>
                </div>
                <p className="text-xs text-gray-500">Of your hours worked above – how many were idle time? Enter <strong>0</strong> if no idle time. Idle time is a <u>subset</u> of time worked, not additional time.</p>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-red-600">Spill time (hours) *</label>
                  <input type="number" step="0.25" min="0"
                    className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-red-400"
                    placeholder="0" value={form.wasteHours}
                    onChange={e => set('wasteHours', e.target.value)} />
                </div>

                {showWasteSection && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-red-600">Reason for downtime *</label>
                      <select
                        className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-red-400"
                        value={form.downtimeReason}
                        onChange={e => set('downtimeReason', e.target.value)}>
                        <option value="">Choose reason...</option>
                        {downtimeReasons.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Comment (optional)</label>
                      <input type="text"
                        className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none"
                        placeholder="Describe what caused the waste time..."
                        value={form.comment}
                        onChange={e => set('comment', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {!showWasteSection && (
                <div className="space-y-1.5">
                  <Label>{t.commentLabel} <span className="text-muted-foreground font-normal">{t.commentOptional}</span></Label>
                  <Textarea placeholder={t.commentPlaceholder} value={form.comment} onChange={e => set('comment', e.target.value)} />
                </div>
              )}

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
                      <div key={entry.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{entry.task?.name}</p>
                            {entry.comment && <p className="text-xs text-muted-foreground mt-0.5">{entry.comment}</p>}
                          </div>
                          {entry.startTime && entry.endTime && (
                            <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 whitespace-nowrap">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-end">
                      <span className="text-xs text-muted-foreground">Total today: <span className="font-semibold text-foreground">{totalToday.toFixed(1)} hrs</span></span>
                    </div>
                  </div>
                )}

              {/* Live preview of the waste time / comment currently being entered */}
              {form.wasteHours && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="font-medium">Waste time -</span>
                    <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                      {form.wasteHours}
                    </span>
                    <span className="text-sm">Hour*</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of your hours worked above – how many were idle time? Enter 0 if no idle time is subset of time worked, not additional time.
                  </p>
                  {form.comment && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">Comment</span>
                        <span className="text-xs text-muted-foreground">Optional</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 border border-border px-3 py-2 text-sm text-foreground">
                        {form.comment}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}