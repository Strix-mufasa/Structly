'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea, Card, CardContent } from '@/components/ui/index'
import { useToast } from '@/components/ui/toaster'
import { CalendarDays } from 'lucide-react'
interface Task { id: string; name: string }
export default function LogTimePage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState({ date: format(new Date(),'yyyy-MM-dd'), taskId: '', hours: '', comment: '' })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  useEffect(() => { fetch('/api/tasks').then(r=>r.json()).then(setTasks) }, [])
  function set(field: string, value: string) { setForm(f=>({...f,[field]:value})); setErrors(e=>({...e,[field]:''})) }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (!form.date) errs.date = 'Date is required'
    if (!form.taskId) errs.taskId = 'Please select a task'
    if (!form.hours) errs.hours = 'Hours are required'
    const h = parseFloat(form.hours)
    if (isNaN(h) || h <= 0) errs.hours = 'Enter a valid number of hours'
    if (h > 24) errs.hours = 'Hours cannot exceed 24'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const res = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, hours: h }) })
    setLoading(false)
    if (res.ok) { toast(`Entry saved for ${format(new Date(form.date+'T12:00:00'),'dd MMM')}.`,'success'); setForm({ date: format(new Date(),'yyyy-MM-dd'), taskId: '', hours: '', comment: '' }) }
    else toast('Failed to save entry. Please try again.','error')
  }
  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold">Log Time</h1><p className="text-muted-foreground text-sm mt-0.5">Record your work hours</p></div>
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5"><Label>Date</Label><div className="relative"><Input type="date" value={form.date} onChange={(e)=>set('date',e.target.value)} max={format(new Date(),'yyyy-MM-dd')} error={errors.date} className="pl-10" /><CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" /></div></div>
          <div className="space-y-1.5"><Label>Task</Label>
            {tasks.length === 0 ? <div className="rounded-xl border border-input px-4 py-3 text-sm text-muted-foreground">No tasks available. Ask your administrator to add tasks.</div> : (
              <Select value={form.taskId} onValueChange={(v)=>set('taskId',v)}>
                <SelectTrigger error={errors.taskId}><SelectValue placeholder="Select a task" /></SelectTrigger>
                <SelectContent>{tasks.map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5"><Label>Hours</Label><Input type="number" inputMode="decimal" step="0.25" min="0.25" max="24" placeholder="e.g. 7.5" value={form.hours} onChange={(e)=>set('hours',e.target.value)} error={errors.hours} /></div>
          <div className="space-y-1.5"><Label>Comment <span className="text-muted-foreground font-normal">(optional)</span></Label><Textarea placeholder="Any notes about this entry?" value={form.comment} onChange={(e)=>set('comment',e.target.value)} /></div>
          <Button type="submit" fullWidth loading={loading} size="lg">Save Entry</Button>
        </form>
      </CardContent></Card>
    </div>
  )
}

